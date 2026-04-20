# WardWise Candidate Management Spec

> Living reference for the candidate management and onboarding system.
> Branch: `main` | Last updated: 2026-04-16
> Future changes: branch off `main` → `fix/candidates-*` or `feature/candidates-*`

---

## Overview

Candidate Management is the B2B entry point for WardWise. When a client pays, Vextra creates their candidate account, issues a secure setup link, and begins onboarding. The system uses geo-backed location selects (State/LGA from the Geo API) instead of free-text inputs to ensure data consistency with the Collect system.

Candidate Management also acts as the admin's operations launcher for each
client: from the list view, admin can jump into Collect, copy the public form,
open Campaign Insights, or continue campaign setup without first drilling into
the candidate detail page.

### Production Hardening (2026-03-27)

- **Server-side Zod validation** on candidate create (`createCandidateSchema`) and update (`updateCandidateSchema`) API routes
- **Cascade deletes**: Deleting a candidate now cascades to User account, Campaigns, and Submissions (no orphaned records)
- **Centralized auth**: All admin API routes use `requireAdmin()` helper instead of manual session checks
- **Audit logging**: Candidate create, update, delete, and password reset actions logged to `AuditLog` table
- See `docs/wardwise-hardening-spec.md` for full details

---

## Data Model

### Candidate (Prisma)

| Field                | Type                                 | Notes                                                                                                        |
| -------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `id`                 | `String @id @default(cuid())`        |                                                                                                              |
| `name`               | `String`                             | Full name (without honorific)                                                                                |
| `party`              | `String`                             | Political party code (APC, PDP, LP, etc.)                                                                    |
| `position`           | `String`                             | President, Governor, Senator, House of Representatives, State Assembly                                       |
| `isNational`         | `Boolean @default(false)`            | True for President                                                                                           |
| `stateCode`          | `String?`                            | 2-letter code (e.g. "AD"). Null for President                                                                |
| `lga`                | `String?`                            | Deprecated — kept for backward compat, not used in new flows                                                 |
| `constituency`       | `String?`                            | Human-readable constituency name (auto-suggested from LGAs)                                                  |
| `constituencyLgaIds` | `Int[] @default([])`                 | LGA IDs defining constituency boundary. Empty for President/Governor. See `collect-candidate-geo-rethink.md` |
| `description`        | `String?`                            | Brief bio                                                                                                    |
| `phone`              | `String?`                            | Nigerian phone number                                                                                        |
| `title`              | `String?`                            | Honorific: Hon., Sen., Dr., Chief, Alh., etc.                                                                |
| `onboardingStatus`   | `OnboardingStatus @default(pending)` | pending, credentials_sent, active, suspended                                                                 |
| `createdAt`          | `DateTime`                           |                                                                                                              |
| `updatedAt`          | `DateTime`                           |                                                                                                              |

**Relations**: `user` (1:1 User), `canvassers` (1:N), `campaigns` (1:N Campaign)

### Computed Fields (API response only)

| Field               | Source                                            |
| ------------------- | ------------------------------------------------- |
| `supporterCount`    | Sum of `_count.submissions` across all campaigns  |
| `_count.campaigns`  | Prisma nested count                               |
| `_count.canvassers` | Prisma nested count                               |
| `collectCampaign`   | Primary campaign shortcut for list-row operations |
| `campaignCount`     | Number of Collect campaigns attached to candidate |

---

## Position Hierarchy & Field Requirements

| Position                 | State Required        | Constituency LGAs        | Constituency Type |
| ------------------------ | --------------------- | ------------------------ | ----------------- |
| President                | Optional (home state) | None (nationwide scope)  | `federal`         |
| Governor                 | Yes                   | None (all LGAs in state) | `state`           |
| Senator                  | Yes                   | Multi-select from state  | `federal`         |
| House of Representatives | Yes                   | Multi-select from state  | `federal`         |
| State Assembly           | Yes                   | Multi-select from state  | `state`           |

> `constituencyLgaIds` is soft-required for Senator/HoR/State Assembly: candidates can be saved without LGAs (for states with incomplete geo data), but campaign creation is blocked until LGAs are defined. See `collect-candidate-geo-rethink.md` for full architecture.

---

## Onboarding Flow

```
pending → credentials_sent → active → suspended
```

1. **Pending**: Account created, no credentials shared yet
2. **Credentials Sent**: Secure setup link issued to the client, with email delivery when configured and manual sharing as fallback
3. **Active**: Client has logged in and is using the platform
4. **Suspended**: Account disabled (non-payment, policy violation, etc.)

---

## Secure Access Delivery

- Candidate creation issues a one-time **setup link**, not a readable password
- Candidate password reset issues a one-time **reset link**
- Links are emailed when delivery is configured and always exposed to admins for manual sharing
- Completing the setup/reset flow updates the candidate to `active` and invalidates older unused auth links
- See `docs/auth-system-spec.md` for the canonical auth lifecycle details

---

## API Routes

### `GET /api/admin/candidates`

Returns all candidates with user accounts, computed supporter counts, and a
sanitized primary Collect campaign summary for list-row shortcuts.

### `POST /api/admin/candidates`

Creates candidate + user account with a secure account-setup link.

- Returns `{ candidate, setupUrl, setupExpiresAt, deliveryMethod }`

### `GET /api/admin/candidates/[id]`

Returns single candidate with nested counts (campaigns, canvassers, submissions).

### `PUT /api/admin/candidates/[id]`

Updates candidate fields. Accepts `onboardingStatus`, `stateCode`, `phone`, `title`.

### `DELETE /api/admin/candidates/[id]`

Deletes candidate and associated user account.

### `POST /api/admin/candidates/[id]/reset-password`

Issues a fresh secure reset link. Returns `{ resetUrl, expiresAt, deliveryMethod }`.

---

## Admin Pages

### Candidate List (`/admin` → Candidates tab)

- **Table view** with columns: S/N, Name, Party (badge), Position, Location (two-line: state name + constituency), Collect status, Campaign Insights status, Onboarding Status, Date Added, Actions
- Search, filter by party/position, sort by name/supporters/date
- "Create Candidate" button → navigates to `/admin/candidates/new`
- Row click → navigates to `/admin/candidates/[id]`
- The Actions column uses one consistent `Manage` dropdown per row to keep the table visually stable at scale.
- The first dropdown item is contextual:
  - `Create Campaign` when no Collect campaign exists
  - `Continue Setup` for draft campaigns
  - `View Collect` for active/paused/closed campaigns
- Actions dropdown:
  - View Candidate
  - View Collect
  - Open Public Form
  - Copy Form Link
  - Campaign Settings
  - Open/Copy Campaign Insights when enabled
  - Enable Campaign Insights shortcut when disabled
- Creating a campaign from a candidate row passes `candidateId` to the campaign wizard so the candidate is preselected.

### Create Candidate (`/admin/candidates/new`)

Four-step wizard with `StepProgress` (`totalSteps={4}`) — same architecture as the Collect campaign wizard.

The wizard root is a real `<form noValidate>` so Enter inside any input runs `validateAndNext()` (or `handleSubmit()` on Step 4) instead of triggering accidental submits. All buttons are explicitly `type="button"` to keep this contract.

**Step 1 — Identity** (`wizard/step-identity.tsx`)

- Personal Details: Title (`ListOrCustomField`), Full Name
- Contact: Email, Phone (optional)
- Party: `ListOrCustomField` over `NIGERIAN_PARTIES` + "Other..." fallback text input
- Free-form inputs (Name, Email, Phone, custom Title, custom Party) validate `onBlur` rather than every keystroke, so users don't see "Invalid email" while still typing

**Step 2 — Electoral office** (`wizard/step-position.tsx`)

- Wizard UI label remains **Electoral office** in `STEP_TITLES` (user-facing copy); the file and export are `step-position.tsx` / `StepPosition` to align with the `position` field and shared geo helpers (`positionToConstituencyType`, etc.).
- Position only: full-width radio list for the five offices (`President` … `State Assembly`)
- Each option has a `focus-within:ring` so keyboard users see which row is focused
- `handlePositionChange` is a no-op when the user re-selects the already-active position, so re-clicks don't wipe Step 3 work
- Genuine office changes clear state, LGA selection, and constituency (President pre-fills federation constituency on the client before Step 3)

**Step 3 — Electoral boundary** (`wizard/step-boundary.tsx`)

- Compact office context chip at the top (mono eyebrow with the selected office; Back returns to Step 2 to change it)
- **State** (ComboboxSelect grouped by zone — optional "home state" for President)
  - **Official Constituency preset** (primary action for Senator and House of Representatives once state is selected). Selecting a preset auto-fills the boundary and constituency name, then immediately reveals the populated LGA grid for review or light adjustment. Choosing `Custom` also reveals the grid immediately. Manual override is still allowed, and a soft warning fires when the selection deviates from the preset. **Status: Senator presets (`109`) and whole-LGA HoR presets (`350`) are shipped from the official INEC workbook. `10` split-LGA HoR seats are intentionally excluded until finer-grained boundary support exists.** Data lives in `src/lib/data/nigerian-constituencies.ts`. Preset dropdown is disabled while LGA data is loading to prevent stale-data race conditions, and HoR states with unsupported seats show an explanatory info note.
- **Constituency LGAs** (searchable checkbox grid from Geo API — shown for Senator/HoR/State Assembly after preset or custom selection, or immediately when no official presets exist). Includes search, select all/clear, count indicator.
  - Partial seeding indicator when state has incomplete geo data (e.g., "12 of 21 LGAs available")
  - Warning banner when state has no seeded LGA data (candidate can still be saved)
- **Constituency name** (text input, auto-suggested from selected LGAs with manual override for official names). Locked behaviour mirrors how Nigerian elections actually work — a president represents the entire federation and a governor represents the entire state, so neither field is editable:
  - **President** → `readOnly`, value `"Federal Republic of Nigeria"`, subtitle `"Locked — every president represents the federation"`
  - **Governor** → `readOnly`, auto-derived from the selected state (e.g. `"Adamawa State"`), subtitle `"Locked — derived from the state above (governors represent the entire state)"`
  - **Senator / House of Representatives / State Assembly** → editable, auto-suggested from the LGA selection or chosen preset, override for official names like `"Adamawa Central Senatorial District"`
    Locked variants share the same `bg-muted/30 cursor-not-allowed` treatment. The free-form variants trim on blur.
- Boundary warnings: full-state coverage, very broad boundary, custom label mismatch, preset deviation, no matching official constituency (via `ConstituencyBoundaryAlerts`). The "no matching official constituency" warning is suppressed when manual LGA selection exactly matches a known preset.

**Step 4 — Review & submit** (`wizard/step-review.tsx`)

- Summary card with a **hero row** (candidate name + party badge) and three semantic groupings — **Identity**, **Electoral Office**, **Electoral Boundary** — separated by subtle dividers
- Each section header carries a single Cockpit-style `EDIT` text button on the right that calls `onEditStep(stepIndex)` to jump back to the relevant step. Field rows themselves stay clean read-only label/value pairs (no per-field icons) — section-level edit is the right granularity for a confirmation screen, matches Stripe Checkout / Linear / Apple Pay patterns, and keeps the surface calm
- **Selected boundary LGAs** are rendered as inline chips (first 4, with `+N more` overflow) so admins can verify the exact list without going back
- Boundary warnings repeated for final review
- Editable description field
- Submit button with loading state. If submit-time validation fails, `handleSubmit` looks up the first errored field via `FIELD_TO_STEP` and routes the user back to that step automatically (instead of stranding them on Step 4)

**Wizard orchestration** (`create-candidate-form.tsx`):

- `STEP_TITLES` is the single source of truth for step labels — the array drives `StepProgress`, segment tooltips, and is exported to `StepReview` via `onEditStep`
- `StepProgress` is **clickable for back-jumps**: completed segments become `<button>`s that call `onStepClick(index)`. Forward jumps still go through Continue so per-step validation runs. Discoverability is built into the component itself (not the orchestrator) so every consumer gets the same affordance:
  - **Adaptive Navigation Menu** — when `onStepClick` + `stepTitles` are both supplied AND `totalSteps > 1`, the "Step X of Y" text becomes a tappable trigger (with a chevron). On desktop it opens a `DropdownMenu`; on mobile (`<768px`) it opens a `Drawer` (bottom sheet) with bigger tap targets. Either way, users see a list of every step with an icon for status (✓ completed, → current, ○ future), the step title, and an optional **subtitle line** showing what they entered for that step (e.g. `Identity — Hon. Jane Doe`, `Electoral office — Senator`, `Electoral boundary — AD · Adamawa Central · 5 LGAs`). This turns the navigator into a mini live recap of progress. Future steps are disabled, completed steps are tappable, and the current step is highlighted with `aria-current="step"`.
  - The trigger replaces the static "Step X of Y" text when navigation is wired — the original header-to-bar spacing is preserved, and consumers that don't pass navigation props render exactly as they always have. The trigger has a generous `min-h-[32px]` target plus a hover background so it reads as a control on first glance, and the chevron is `size-3.5`.
  - Subtitles are optional (`stepSubtitles?: (string | undefined)[]`) — pass `undefined` for steps that have no meaningful summary. The candidate creation wizard wires this to `useWatch` so the menu always reflects the latest form values.
  - Bar segments themselves remain clickable as a secondary affordance, with a **layered universal + desktop discoverability cue**:
    - **Shape language (universal):** completed segments adopt a `rounded-full` pill at `h-1.5`, while current/future segments stay as crisp `h-1` `rounded-[1px]` bars. The pill shape reads as "I'm a button" on every device without relying on hover — this is the at-rest cue that works on mobile too.
    - **Tooltip layer (desktop):** hovering a completed pill surfaces a Radix `Tooltip` with `↶ {Step Title}`, giving hover users an explicit destination label.
    - Hover boost is `brightness-110 saturate-150` (replaces the old `opacity-80`) so the pill subtly "lights up" rather than fading.
  - Adopted across every `StepProgress` consumer so the interaction is consistent app-wide: the candidate creation wizard, the admin campaign wizard (`admin/collect/wizard/campaign-wizard.tsx`), and the public canvasser/supporter collect flow (`collect/campaign-registration-form.tsx`).
- Step transitions are wrapped in `<AnimatePresence mode="wait">` from `motion/react` with a 180ms x-shift fade. Subtle, not gratuitous.
- After every step change, focus is moved to the step content wrapper (`tabIndex={-1}` div with `aria-live="polite"`) on the next animation frame so screen readers announce the new screen and keyboard users land in context
- **Draft autosave** is owned by the generic `useWizardDraft` hook (`src/hooks/use-wizard-draft.ts`). The orchestrator passes the RHF instance, current step, the storage key (`wardwise:create-candidate:draft:v1`), an `isMeaningful` predicate, and `defaultValues`. The hook handles debounced (400ms) writes, 24h TTL expiry, restore-on-mount, and exposes both `discard()` (clears storage **and** resets the form) and `clear()` (storage-only — used after a successful submit so the credentials dialog isn't preceded by a flash of empty form). The hook is **not** candidate-named on purpose: it is schema-agnostic RHF + step persistence only; **candidate** is expressed by the storage key and predicates in `create-candidate-form.tsx`. The **campaign wizard** (`admin/collect/wizard/campaign-wizard.tsx`) is the second consumer (`wardwise:campaign-wizard:draft:v2` + `isMeaningfulCampaignDraft`). Further admin wizards can reuse the same hook with their own keys. **Parallel in Collect:** `useCollectFormPersistence` (`src/hooks/use-collect-form-persistence.ts`) does the same _kind_ of job (localStorage, debounced saves, restore) but is Collect-specific — it keys off `campaignSlug`, persists `screen` + extra `uiState`, and coordinates geo restore refs. The naming split (`wizard` vs `collect-form`) is intentional so neither hook pretends to be the other’s generalization.
- **Per-step analytics**: `track("admin_candidate_wizard_step_changed", { from_step, to_step, reason })` fires on every navigation with `reason ∈ { advance, back, edit, stepper }`. Drafts emit `..._draft_restored` and `..._draft_discarded`. Client validation failures on submit emit `admin_candidate_creation_failed` with `error_category: "client_validation"`.

**UI Architecture**: Uses `StepCard`, `CardSectionHeader`, `SectionLabel`, `FieldLabel`, `NavButtons` from `form-ui.tsx` — matching the Collect wizard's premium card design. Step-level field validation via `stepFieldMap` (Step 2 validates `position`; Step 3 validates `position`, `stateCode`, `constituency`, `constituencyLgaIds` together for schema refinements). `react-hook-form` is configured with `mode: "onBlur"` and `reValidateMode: "onChange"` so first-pass errors only show after blur, then update live.

**Shared composite — `admin/shared/list-or-custom-field.tsx`**: Encapsulates the "pick from list or type your own" pattern used for Title and Party. Handles toggle UX, "Use list" reset button, accessibility wiring, and styling consistently. Lives in `admin/shared/` (not `wizard/`) because the same component is reused by the candidate overview edit form — the `wizard/` folder is reserved for actual wizard-step screens.

On success → **Credentials Dialog** showing the secure setup link, expiry, delivery method, and copy/share fallback.

### Candidate Detail (`/admin/candidates/[id]`)

Three tabs: **Overview** | **Campaigns** | **Account**

**Overview Tab:**

- Stats row: Standard admin stat cards (icon top-right, value + subtitle below label) — Campaigns, Supporters (computed), Canvassers. Responsive: 1 col → 2 cols (sm) → 3 cols (lg)
- Info card with grouped sections (Identity, Electoral Boundary, Contact, Bio) separated by subtle dividers
- Electoral Boundary section shows state, constituency name, and LGA count with boundary warnings (read-only)
- Edit form with matching section grouping, geo-backed selects, and searchable checkbox grid for constituency LGAs
- Boundary warnings shown in both read-only and edit modes (via `ConstituencyBoundaryAlerts`)
- Saving candidate identity corrections syncs existing Collect campaign snapshot fields for name, title, party, and constituency. Campaign slugs are never regenerated, so already-shared links stay valid.

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
- Password management: issues a fresh secure reset link, shows expiry/delivery state, and supports manual copy when needed
- Danger zone: Delete candidate account with confirmation dialog

---

## ComboboxSelect Search Fix

The shared `ComboboxSelect` component (`src/components/ui/combobox-select.tsx`) uses cmdk internally. cmdk v1 filters by the `CommandItem` `value` prop only. For states, `value="AD"` so searching "Adamawa" would fail.

**Fix**: A custom `filter` function is passed to `<Command>` that builds a search index mapping each option's value to a concatenation of `label + value + description`. This makes all ComboboxSelect instances (states, parties, titles, LGAs, polling units) searchable by their display label.

---

## Key Files

| File                                                             | Purpose                                                                                                                                      |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `prisma/schema.prisma`                                           | Candidate model definition                                                                                                                   |
| `prisma/seed.ts`                                                 | Seed data (11 candidates, 7 canvassers, 6 voters, 1 admin)                                                                                   |
| `src/types/candidate.ts`                                         | TypeScript type                                                                                                                              |
| `src/lib/schemas/admin-schemas.ts`                               | Zod validation schemas (with FCT superRefine)                                                                                                |
| `src/lib/api/admin.ts`                                           | Client-side API helpers                                                                                                                      |
| `src/lib/data/nigerian-parties.ts`                               | Party + title options                                                                                                                        |
| `src/lib/data/nigerian-constituencies.ts`                        | Official constituency presets (Senator: 109 shipped, HoR: 350 shipped + 10 unsupported split seats)                                          |
| `src/lib/geo/constituency.ts`                                    | Shared isomorphic helpers (position→type, warnings, auto-suggest, preset matching)                                                           |
| `src/lib/geo/constituency-server.ts`                             | Server-side constituency LGA validation + state matching                                                                                     |
| `src/app/api/admin/candidates/route.ts`                          | GET + POST endpoints                                                                                                                         |
| `src/app/api/admin/candidates/[id]/route.ts`                     | GET + PUT + DELETE                                                                                                                           |
| `src/app/api/admin/candidates/[id]/reset-password/route.ts`      | Secure reset-link issuing                                                                                                                    |
| `src/app/admin/candidates/new/page.tsx`                          | Create route                                                                                                                                 |
| `src/app/admin/candidates/[id]/page.tsx`                         | Detail route                                                                                                                                 |
| `src/components/admin/candidates/create-candidate-form.tsx`      | Wizard orchestrator (4 steps, validation, submission, draft autosave, motion transitions, error routing)                                     |
| `src/components/admin/candidates/wizard/step-identity.tsx`       | Step 1: title, name, email, phone, party (uses `ListOrCustomField` for title + party; on-blur validation)                                    |
| `src/components/admin/candidates/wizard/step-position.tsx`       | Step 2: electoral office / `position` (`StepPosition`; radios; focus-within ring + no-op guard)                                              |
| `src/components/admin/candidates/wizard/step-boundary.tsx`       | Step 3: state, presets, constituency LGAs, constituency name (locked for President + Governor), boundary warnings                            |
| `src/components/admin/candidates/wizard/step-review.tsx`         | Step 4: section-grouped summary (Identity / Office / Boundary) with section-level Edit buttons + LGA chips + boundary warnings + description |
| `src/components/admin/shared/list-or-custom-field.tsx`           | Shared "pick from list / type your own" composite (Title, Party — used by wizard step 1 + `candidate-overview.tsx`)                          |
| `src/hooks/use-wizard-draft.ts`                                  | Generic `localStorage` draft hook (debounced save, TTL expiry, restore-on-mount, `discard`/`clear`)                                          |
| `src/components/ui/step-progress.tsx`                            | Progress bar; supports optional `stepTitles` and `onStepClick` for clickable back-jumps with per-segment breadcrumb labels                   |
| `src/components/admin/candidates/credentials-dialog.tsx`         | Post-create secure setup-link display                                                                                                        |
| `src/components/admin/candidates/candidate-detail.tsx`           | Detail page with tabs                                                                                                                        |
| `src/components/admin/candidates/candidate-overview.tsx`         | Overview tab (with boundary edit + warnings)                                                                                                 |
| `src/components/admin/candidates/candidate-campaigns.tsx`        | Campaigns tab                                                                                                                                |
| `src/components/admin/candidates/candidate-account.tsx`          | Account tab                                                                                                                                  |
| `src/components/admin/candidates/candidate-management.tsx`       | Table-based list view                                                                                                                        |
| `src/components/admin/shared/lga-checkbox-grid.tsx`              | Shared searchable checkbox grid (candidate boundary + campaign restrict)                                                                     |
| `src/components/admin/shared/official-constituency-selector.tsx` | Shared official constituency picker + source notes                                                                                           |
| `src/components/admin/shared/constituency-boundary-alerts.tsx`   | Reusable soft warning banners for boundary issues                                                                                            |

---

## Deleted Files (replaced)

- `src/components/admin/admin-dialogs/create-candidate-dialog.tsx` → replaced by create page
- `src/components/admin/admin-dialogs/edit-candidate-dialog.tsx` → replaced by detail page
- `src/components/admin/admin-list-item-candidate.tsx` → replaced by table rows
- `src/components/admin/admin-grid-item-candidate.tsx` → replaced by table rows

---

## Changelog

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-19 | `StepProgress` bar segments gain a **universal + layered discoverability cue** so users on every device know completed segments are clickable. **Universal at-rest cue:** completed segments adopt a `rounded-full` pill at `h-1.5`, while current/future stay as crisp `h-1` `rounded-[1px]` bars. The pill shape reads as a button on mobile, desktop, and assistive tech without needing hover. **Desktop tooltip layer:** hovering a pill surfaces a Radix `Tooltip` reading `↶ {Step Title}` so hover users see the exact destination. Hover treatment switched from `opacity-80` to `brightness-110 saturate-150` so completed pills subtly light up on hover rather than fading.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-04-19 | Follow-up polish: Constituency input is now also locked for **Governor** (matches President — governors represent the entire state, so the field is `readOnly` and auto-derived from the selected state with a `"Locked — derived from the state above"` subtitle). `StepProgress` gains an **adaptive navigation menu**: the "Step X of Y" text becomes a tappable trigger with a chevron — on desktop it opens a `DropdownMenu`, on mobile (`<768px`) it opens a `Drawer` (bottom sheet) with bigger tap targets. The menu lists every step with status icons (✓/→/○), titles, and an optional **subtitle line** showing the values the user entered for that step (e.g. `Identity — Hon. Jane Doe`, `Electoral office — Senator`, `Electoral boundary — AD · Adamawa Central · 5 LGAs`), so the navigator doubles as a live recap of progress. Trigger has `min-h-[32px]` + hover bg for clear affordance, current step carries `aria-current="step"`, and the original header-to-bar spacing is preserved when nav props aren't supplied. Every consumer of `StepProgress` (candidate creation wizard, admin campaign wizard, and the public `/c/[slug]` collect flow) passes the `onStepClick`/`stepTitles` props so the interaction is consistent across the app; the candidate wizard additionally passes `stepSubtitles` derived from `useWatch`. Draft autosave/restore extracted from `create-candidate-form.tsx` into a generic `useWizardDraft<T>` hook (`src/hooks/use-wizard-draft.ts`) so future wizards get persistence for free; hook exposes both `discard()` (storage + form reset) and `clear()` (storage only). `ListOrCustomField` relocated from `wizard/list-or-custom-field.tsx` → `admin/shared/list-or-custom-field.tsx` since it's used by both the wizard step and the overview edit form, and `wizard/` should be reserved for actual wizard-step screens. |
| 2026-04-19 | Create-candidate wizard polish pass. Wizard wrapped in real `<form noValidate>` with Enter routing to next/submit. `StepProgress` becomes clickable for back-jumps (forward still gated by Continue). Submit-time validation now routes the user back to the first offending step via `FIELD_TO_STEP` instead of stranding them on Step 4. Step 4 review reorganised into three sections (Identity, Electoral Office, Electoral Boundary) with section-level `EDIT` buttons (replacing the noisier per-row pencils) and renders selected boundary LGAs as chips (first 4 + overflow). Step 3 constituency input becomes `readOnly` for President. Step 2 position change is a no-op when the same office is re-selected (no longer wipes Step 3 work). Free-form fields validate `onBlur`; on-change errors only appear after first blur. Focus moves to the active step container after every transition (`tabIndex={-1}` + `aria-live`); transitions animated via `motion/react` `AnimatePresence`. Form state debounce-persists to `localStorage` (24h TTL) with a Draft Restored pill + Discard. Wizard step changes, restores, and discards emit dedicated PostHog events. New shared `ListOrCustomField` composite replaces the duplicated Title/Party "pick or type" markup in both the create wizard and `candidate-overview.tsx`. Source-of-truth step title alignment: array, card header, and breadcrumb all say "Electoral boundary".                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-04-19 | Create candidate wizard split into **four steps**: Identity → Electoral office → Electoral boundary → Review & submit. Office and boundary are separate screens to reduce scrolling and separate mental tasks; boundary lives in `step-boundary.tsx`, office/position selection in `step-position.tsx` (UI label _Electoral office_ in `STEP_TITLES`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-04-16 | Candidate identity correction workflow added. Candidate name/title/party/constituency edits now sync to existing Collect campaign snapshot fields while preserving public slugs, so already-shared links keep working after spelling/title corrections.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-04-15 | Docs synced to the production auth rollout. Candidate onboarding language now reflects secure setup links instead of shared passwords, and hardening/auth references now match the current token-revocation and rate-limit behavior.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-04-10 | Candidate auth rollout aligned with secure-link onboarding. New accounts now issue one-time setup links instead of readable passwords, and admin reset now issues one-time reset links with email/manual delivery modes. Candidate account UI, create flow, and supporting docs were updated to match the shared auth system.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-04-01 | Candidate-driven geo scope: `constituencyLgaIds Int[]` on Candidate defines constituency boundary. Searchable checkbox grid for LGA selection. Auto-suggested constituency name with manual override. Boundary warnings (full-state, very broad, custom label, incomplete). Partial LGA seeding indicator. Soft block: candidates saveable without LGAs, campaign creation blocked until defined. Server-side validation via `sanitizeCandidateConstituencyLgaIds()`. FCT invalid combos blocked. See `collect-candidate-geo-rethink.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-03-25 | Governor auto-fill, Location column, newest-first default. Detail page UI overhaul: stat cards aligned to admin standard (Pattern 2 — icon top-right, value below), overview grouped into sections with dividers, campaigns tab rewritten as table, account tab typography standardized. Text contrast audit: bumped faint labels from opacity-40/50 to foreground/70-80, font-semibold section titles, reverted font-mono from body text (reserved for codes/IDs/badges/column headers). Onboarding status select uses colored dots instead of badges for clean hover.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-03-24 | Fixed ComboboxSelect search (custom filter searches label+value+description). President can optionally select "home state". Create form rewritten as multi-step wizard with StepProgress bar, matching Collect campaign wizard pattern (later expanded to four steps; see 2026-04-19). Added phone field to candidate edit form. Account tab danger zone with delete.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-03-18 | Initial spec. Schema cleanup (removed dead models), renamed `state` → `stateCode`, removed stored `supporters` field, added `phone`/`title`/`onboardingStatus`. Created page-based CRUD with geo-backed selects, table list view, detail page with tabs, readable password generation, onboarding status tracking.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
