# WardWise Candidate Management Spec

> Living reference for the candidate management and onboarding system.
> Branch: `feature/collect` | Last updated: 2026-03-24

---

## Overview

Candidate Management is the B2B entry point for WardWise. When a client pays, Vextra creates their candidate account, shares credentials, and begins onboarding. The system uses geo-backed location selects (State/LGA from the Geo API) instead of free-text inputs to ensure data consistency with the Collect system.

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
| `lga`              | `String?`                     | Required for constituency-level positions only                         |
| `constituency`     | `String?`                     | Human-readable constituency name                                       |
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

| Position                 | State Required       | LGA Required | Constituency Type |
| ------------------------ | -------------------- | ------------ | ----------------- |
| President                | Optional (home state)| No           | `federal`         |
| Governor                 | Yes                  | No           | `state`           |
| Senator                  | Yes                  | Yes          | `federal`         |
| House of Representatives | Yes                  | Yes          | `federal`         |
| State Assembly           | Yes                  | Yes          | `state`           |

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
- Location: State (ComboboxSelect grouped by zone — shown for all positions, optional "home state" for President), LGA (ComboboxSelect from Geo API, cascading — hidden for President/Governor)
- Constituency (text input, position-aware placeholder. Auto-fills "Federal Republic of Nigeria" for President, auto-fills "{State} State" for Governor when state is selected)

**Step 3 — Review & Submit** (`wizard/step-review.tsx`)

- Summary card with all candidate details
- Editable description field
- Submit button with loading state

**UI Architecture**: Uses `StepCard`, `CardSectionHeader`, `SectionLabel`, `FieldLabel`, `NavButtons` from `form-ui.tsx` — matching the Collect wizard's premium card design. Step-level field validation via `stepFieldMap`.

On success → **Credentials Dialog** with copy button and warning.

### Candidate Detail (`/admin/candidates/[id]`)

Three tabs: **Overview** | **Campaigns** | **Account**

**Overview Tab:**

- Stats row: Standard admin stat cards (icon top-right, value + subtitle below label) — Campaigns, Supporters (computed), Canvassers. Responsive: 1 col → 2 cols (sm) → 3 cols (lg)
- Info card with grouped sections (Identity, Location, Contact, Bio) separated by subtle dividers
- Edit form with matching section grouping and geo-backed selects

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

| File                                                        | Purpose                                                    |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| `prisma/schema.prisma`                                      | Candidate model definition                                 |
| `prisma/seed.ts`                                            | Seed data (11 candidates, 7 canvassers, 6 voters, 1 admin) |
| `src/types/candidate.ts`                                    | TypeScript type                                            |
| `src/lib/schemas/admin-schemas.ts`                          | Zod validation schemas                                     |
| `src/lib/api/admin.ts`                                      | Client-side API helpers                                    |
| `src/lib/data/nigerian-parties.ts`                          | Party + title options                                      |
| `src/app/api/admin/candidates/route.ts`                     | GET + POST endpoints                                       |
| `src/app/api/admin/candidates/[id]/route.ts`                | GET + PUT + DELETE                                         |
| `src/app/api/admin/candidates/[id]/reset-password/route.ts` | Password reset                                             |
| `src/app/admin/candidates/new/page.tsx`                     | Create route                                               |
| `src/app/admin/candidates/[id]/page.tsx`                    | Detail route                                               |
| `src/components/admin/candidates/create-candidate-form.tsx` | Wizard orchestrator (step state, validation, submission)   |
| `src/components/admin/candidates/wizard/step-identity.tsx`  | Step 1: name, email, phone, party                          |
| `src/components/admin/candidates/wizard/step-position.tsx`  | Step 2: position, state, LGA, constituency                 |
| `src/components/admin/candidates/wizard/step-review.tsx`    | Step 3: summary review + description                       |
| `src/components/admin/candidates/credentials-dialog.tsx`    | Post-create credential display                             |
| `src/components/admin/candidates/candidate-detail.tsx`      | Detail page with tabs                                      |
| `src/components/admin/candidates/candidate-overview.tsx`    | Overview tab                                               |
| `src/components/admin/candidates/candidate-campaigns.tsx`   | Campaigns tab                                              |
| `src/components/admin/candidates/candidate-account.tsx`     | Account tab                                                |
| `src/components/admin/candidates/candidate-management.tsx`  | Table-based list view                                      |

---

## Deleted Files (replaced)

- `src/components/admin/admin-dialogs/create-candidate-dialog.tsx` → replaced by create page
- `src/components/admin/admin-dialogs/edit-candidate-dialog.tsx` → replaced by detail page
- `src/components/admin/admin-list-item-candidate.tsx` → replaced by table rows
- `src/components/admin/admin-grid-item-candidate.tsx` → replaced by table rows

---

## Changelog

| Date       | Change                                                                                                                                                                                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-03-25 | Governor auto-fill, Location column, newest-first default. Detail page UI overhaul: stat cards aligned to admin standard (Pattern 2 — icon top-right, value below), overview grouped into sections with dividers, campaigns tab rewritten as table, account tab typography standardized. Text contrast audit: bumped faint labels from opacity-40/50 to foreground/70-80, font-semibold section titles, reverted font-mono from body text (reserved for codes/IDs/badges/column headers). Onboarding status select uses colored dots instead of badges for clean hover. |
| 2026-03-24 | Fixed ComboboxSelect search (custom filter searches label+value+description). President can optionally select "home state". Create form rewritten as 3-step wizard with StepProgress bar, matching Collect campaign wizard pattern. Added phone field to candidate edit form. Account tab danger zone with delete. |
| 2026-03-18 | Initial spec. Schema cleanup (removed dead models), renamed `state` → `stateCode`, removed stored `supporters` field, added `phone`/`title`/`onboardingStatus`. Created page-based CRUD with geo-backed selects, table list view, detail page with tabs, readable password generation, onboarding status tracking. |
