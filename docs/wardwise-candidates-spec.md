# WardWise Candidate Management Spec

> Living reference for the candidate management and onboarding system.
> Branch: `main` | Last updated: 2026-03-28
> Future changes: branch off `main` → `fix/candidates-*` or `feature/candidates-*`

---

## Overview

Candidate Management is the B2B entry point for WardWise. When a client pays, Vextra creates their candidate account, shares credentials, and begins onboarding. The system uses geo-backed location selects (State/LGA from the Geo API) instead of free-text inputs to ensure data consistency with the Collect system.

### Production Hardening (2026-03-27)

- **Server-side Zod validation** on candidate create (`createCandidateSchema`) and update (`updateCandidateSchema`) API routes
- **Cascade deletes**: Deleting a candidate now cascades to User account, Campaigns, and Submissions (no orphaned records)
- **Centralized auth**: All admin API routes use `requireAdmin()` helper instead of manual session checks
- **Audit logging**: Candidate create, update, delete, and password reset actions logged to `AuditLog` table
- See `docs/wardwise-hardening-spec.md` for full details

---

## Data Model

### Candidate (Prisma)

| Field              | Type                          | Notes                                                                  |
| ------------------ | ----------------------------- | ---------------------------------------------------------------------- |
| `id`               | `String @id @default(cuid())` |                                                                        |
| `name`             | `String`                      | Full name (without honorific)                                          |
| `party`            | `String`                      | Political party code (APC, PDP, LP, etc.)                              |
| `position`         | `String`                      | President, Governor, Senator, House of Representatives, State Assembly |
| `isNational`       | `Boolean @default(false)`     | True for President                                                     |
| `stateCode`        | `String?`                     | 2-letter code (e.g. "AD"). Null for President                          |
| `lga`              | `String?`                     | Deprecated — kept for backward compat, not used in new flows           |
| `constituency`     | `String?`                     | Human-readable constituency name (auto-suggested from LGAs)            |
| `constituencyLgaIds` | `Int[] @default([])`        | LGA IDs defining constituency boundary. Empty for President/Governor. See `collect-candidate-geo-rethink.md` |
| `description`      | `String?`                     | Brief bio                                                              |
| `phone`            | `String?`                     | Nigerian phone number                                                  |
| `title`            | `String?`                     | Honorific: Hon., Sen., Dr., Chief, Alh., etc.                          |
| `onboardingStatus` | `String @default("pending")`  | pending, credentials_sent, active, suspended                           |
| `createdAt`        | `DateTime`                    |                                                                        |
| `updatedAt`        | `DateTime`                    |                                                                        |

**Relations**: `user` (1:1 User), `canvassers` (1:N), `campaigns` (1:N Campaign)

### Computed Fields (API response only)

| Field               | Source                                           |
| ------------------- | ------------------------------------------------ |
| `supporterCount`    | Sum of `_count.submissions` across all campaigns |
| `_count.campaigns`  | Prisma nested count                              |
| `_count.canvassers` | Prisma nested count                              |

---

## Position Hierarchy & Field Requirements

| Position                 | State Required        | Constituency LGAs          | Constituency Type |
| ------------------------ | --------------------- | -------------------------- | ----------------- |
| President                | Optional (home state) | None (nationwide scope)    | `federal`         |
| Governor                 | Yes                   | None (all LGAs in state)   | `state`           |
| Senator                  | Yes                   | Multi-select from state    | `federal`         |
| House of Representatives | Yes                   | Multi-select from state    | `federal`         |
| State Assembly           | Yes                   | Multi-select from state    | `state`           |

> `constituencyLgaIds` is soft-required for Senator/HoR/State Assembly: candidates can be saved without LGAs (for states with incomplete geo data), but campaign creation is blocked until LGAs are defined. See `collect-candidate-geo-rethink.md` for full architecture.

---

## Onboarding Flow

```
pending → credentials_sent → active → suspended
```

1. **Pending**: Account created, no credentials shared yet
2. **Credentials Sent**: Password shared with client (via WhatsApp/phone)
3. **Active**: Client has logged in and is using the platform
4. **Suspended**: Account disabled (non-payment, policy violation, etc.)

---

## Password Generation

Readable format for easy sharing via WhatsApp/phone call:

```
WORD-NNNN-WORD   (e.g., WARD-7842-BETA)
```

Word pool: WARD, VOTE, POLL, TEAM, SAFE, CORE, LINK, PEAK
Number range: 1000-9999
Generated using `crypto.randomInt` for security.

---

## API Routes

### `GET /api/admin/candidates`

Returns all candidates with user accounts and computed supporter counts.

### `POST /api/admin/candidates`

Creates candidate + user account with generated readable password.

- Returns `{ candidate, generatedPassword }` (password shown once)

### `GET /api/admin/candidates/[id]`

Returns single candidate with nested counts (campaigns, canvassers, submissions).

### `PUT /api/admin/candidates/[id]`

Updates candidate fields. Accepts `onboardingStatus`, `stateCode`, `phone`, `title`.

### `DELETE /api/admin/candidates/[id]`

Deletes candidate and associated user account.

### `POST /api/admin/candidates/[id]/reset-password`

Generates new readable password, hashes and saves. Returns `{ generatedPassword }`.

---

## Admin Pages

### Candidate List (`/admin` → Candidates tab)

- **Table view** with columns: S/N, Name, Party (badge), Position, Location (two-line: state name + constituency), Onboarding Status (colored badge), Date Added, Actions
- Search, filter by party/position, sort by name/supporters/date
- "Create Candidate" button → navigates to `/admin/candidates/new`
- Row click → navigates to `/admin/candidates/[id]`
- Actions dropdown: View, Delete

### Create Candidate (`/admin/candidates/new`)

Multi-step wizard with `StepProgress` bar — same architecture as the Collect campaign wizard.

**Step 1 — Identity** (`wizard/step-identity.tsx`)

- Personal Details: Title (ComboboxSelect), Full Name
- Contact: Email, Phone (optional)
- Party: ComboboxSelect from NIGERIAN_PARTIES + "Other..." fallback text input

**Step 2 — Electoral Position** (`wizard/step-position.tsx`)

- Position (Select, 5 options)
- Electoral Boundary section (shown for non-President positions):
  - State (ComboboxSelect grouped by zone — optional "home state" for President)
  - Constituency LGAs (searchable checkbox grid from Geo API — shown for Senator/HoR/State Assembly). Includes search, select all/clear, count indicator.
  - Partial seeding indicator when state has incomplete geo data (e.g., "12 of 21 LGAs available")
  - Warning banner when state has no seeded LGA data (candidate can still be saved)
- Constituency Name (text input, auto-suggested from selected LGAs with manual override for official names. Auto-fills "Federal Republic of Nigeria" for President, "{State} State" for Governor)
- Boundary warnings: full-state coverage, very broad boundary, custom label mismatch (via `ConstituencyBoundaryAlerts`)

**Step 3 — Review & Submit** (`wizard/step-review.tsx`)

- Summary card with all candidate details including boundary LGA count
- Boundary warnings repeated for final review
- Editable description field
- Submit button with loading state

**UI Architecture**: Uses `StepCard`, `CardSectionHeader`, `SectionLabel`, `FieldLabel`, `NavButtons` from `form-ui.tsx` — matching the Collect wizard's premium card design. Step-level field validation via `stepFieldMap`.

On success → **Credentials Dialog** with copy button and warning.

### Candidate Detail (`/admin/candidates/[id]`)

Three tabs: **Overview** | **Campaigns** | **Account**

**Overview Tab:**

- Stats row: Standard admin stat cards (icon top-right, value + subtitle below label) — Campaigns, Supporters (computed), Canvassers. Responsive: 1 col → 2 cols (sm) → 3 cols (lg)
- Info card with grouped sections (Identity, Electoral Boundary, Contact, Bio) separated by subtle dividers
- Electoral Boundary section shows state, constituency name, and LGA count with boundary warnings (read-only)
- Edit form with matching section grouping, geo-backed selects, and searchable checkbox grid for constituency LGAs
- Boundary warnings shown in both read-only and edit modes (via `ConstituencyBoundaryAlerts`)

**Campaigns Tab:**

- Summary line: "{n} campaigns · {n} submissions"
- Table view with columns: S/N, Campaign (name + slug), Status (badge), Submissions, Constituency, Created
- Responsive hidden columns on smaller screens
- Row click navigates to `/admin/collect/campaigns/[id]`
- "Create Campaign" button
- `AdminPagination` at bottom
- Filters by `candidateId` — only shows campaigns belonging to this candidate

**Account Tab:**

- Account info: Email, phone, created date, role
- Onboarding status: Select with colored, themed items (per-status focus/checked styles)
- Password reset: generates new readable password, show/copy with bordered display box
- Danger zone: Delete candidate account with confirmation dialog

---

## ComboboxSelect Search Fix

The shared `ComboboxSelect` component (`src/components/ui/combobox-select.tsx`) uses cmdk internally. cmdk v1 filters by the `CommandItem` `value` prop only. For states, `value="AD"` so searching "Adamawa" would fail.

**Fix**: A custom `filter` function is passed to `<Command>` that builds a search index mapping each option's value to a concatenation of `label + value + description`. This makes all ComboboxSelect instances (states, parties, titles, LGAs, polling units) searchable by their display label.

---

## Key Files

| File                                                        | Purpose                                                                 |
| ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| `prisma/schema.prisma`                                      | Candidate model definition                                              |
| `prisma/seed.ts`                                            | Seed data (11 candidates, 7 canvassers, 6 voters, 1 admin)             |
| `src/types/candidate.ts`                                    | TypeScript type                                                         |
| `src/lib/schemas/admin-schemas.ts`                          | Zod validation schemas (with FCT superRefine)                           |
| `src/lib/api/admin.ts`                                      | Client-side API helpers                                                 |
| `src/lib/data/nigerian-parties.ts`                          | Party + title options                                                   |
| `src/lib/utils/constituency.ts`                             | Shared isomorphic helpers (position→type, warnings, auto-suggest)       |
| `src/lib/utils/constituency-server.ts`                      | Server-side constituency LGA validation + state matching                |
| `src/app/api/admin/candidates/route.ts`                     | GET + POST endpoints                                                    |
| `src/app/api/admin/candidates/[id]/route.ts`                | GET + PUT + DELETE                                                      |
| `src/app/api/admin/candidates/[id]/reset-password/route.ts` | Password reset                                                          |
| `src/app/admin/candidates/new/page.tsx`                     | Create route                                                            |
| `src/app/admin/candidates/[id]/page.tsx`                    | Detail route                                                            |
| `src/components/admin/candidates/create-candidate-form.tsx` | Wizard orchestrator (step state, validation, submission)                |
| `src/components/admin/candidates/wizard/step-identity.tsx`  | Step 1: name, email, phone, party                                       |
| `src/components/admin/candidates/wizard/step-position.tsx`  | Step 2: position, state, constituency LGAs, boundary warnings           |
| `src/components/admin/candidates/wizard/step-review.tsx`    | Step 3: summary review + boundary warnings + description                |
| `src/components/admin/candidates/credentials-dialog.tsx`    | Post-create credential display                                          |
| `src/components/admin/candidates/candidate-detail.tsx`      | Detail page with tabs                                                   |
| `src/components/admin/candidates/candidate-overview.tsx`    | Overview tab (with boundary edit + warnings)                            |
| `src/components/admin/candidates/candidate-campaigns.tsx`   | Campaigns tab                                                           |
| `src/components/admin/candidates/candidate-account.tsx`     | Account tab                                                             |
| `src/components/admin/candidates/candidate-management.tsx`  | Table-based list view                                                   |
| `src/components/admin/shared/lga-checkbox-grid.tsx`         | Shared searchable checkbox grid (candidate boundary + campaign restrict) |
| `src/components/admin/shared/constituency-boundary-alerts.tsx` | Reusable soft warning banners for boundary issues                    |

---

## Deleted Files (replaced)

- `src/components/admin/admin-dialogs/create-candidate-dialog.tsx` → replaced by create page
- `src/components/admin/admin-dialogs/edit-candidate-dialog.tsx` → replaced by detail page
- `src/components/admin/admin-list-item-candidate.tsx` → replaced by table rows
- `src/components/admin/admin-grid-item-candidate.tsx` → replaced by table rows

---

## Changelog

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-01 | Candidate-driven geo scope: `constituencyLgaIds Int[]` on Candidate defines constituency boundary. Searchable checkbox grid for LGA selection. Auto-suggested constituency name with manual override. Boundary warnings (full-state, very broad, custom label, incomplete). Partial LGA seeding indicator. Soft block: candidates saveable without LGAs, campaign creation blocked until defined. Server-side validation via `sanitizeCandidateConstituencyLgaIds()`. FCT invalid combos blocked. See `collect-candidate-geo-rethink.md`. |
| 2026-03-25 | Governor auto-fill, Location column, newest-first default. Detail page UI overhaul: stat cards aligned to admin standard (Pattern 2 — icon top-right, value below), overview grouped into sections with dividers, campaigns tab rewritten as table, account tab typography standardized. Text contrast audit: bumped faint labels from opacity-40/50 to foreground/70-80, font-semibold section titles, reverted font-mono from body text (reserved for codes/IDs/badges/column headers). Onboarding status select uses colored dots instead of badges for clean hover. |
| 2026-03-24 | Fixed ComboboxSelect search (custom filter searches label+value+description). President can optionally select "home state". Create form rewritten as 3-step wizard with StepProgress bar, matching Collect campaign wizard pattern. Added phone field to candidate edit form. Account tab danger zone with delete.                                                                                                                                                                                                                                                      |
| 2026-03-18 | Initial spec. Schema cleanup (removed dead models), renamed `state` → `stateCode`, removed stored `supporters` field, added `phone`/`title`/`onboardingStatus`. Created page-based CRUD with geo-backed selects, table list view, detail page with tabs, readable password generation, onboarding status tracking.                                                                                                                                                                                                                                                      |
