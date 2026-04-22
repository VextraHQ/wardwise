# WardWise Collect Canonical Spec

## Status

- **Collect v1 is complete** — merged to `main`.
- **Future changes**: Branch off `main` with `fix/collect-*` (bug fixes) or `feature/collect-*` (new features). Keep branches short-lived and scoped to one change.
- **Production hardening applied** — see `docs/wardwise-hardening-spec.md` for details:
  - Rate limiting on `/api/collect/submit` (Upstash Redis, 10 req/min per IP)
  - Geo hierarchy validation on submit (PU → ward → LGA chain verified)
  - Cascade deletes: Campaign → Submissions, Candidate → Campaigns
  - Server-side Zod validation on campaign create/update
  - Audit logging on campaign CRUD and submission deletes
- Database schema, API routes, public registration form, and admin management UI are all live.
- Canonical LGA seed is complete nationally: `774` LGAs across `37` state codes are available for candidate and campaign boundary selection.
- Adamawa ward + polling unit data is now synced to the official INEC source: `21` LGAs, `226` wards, `4,104` polling units for the Adamawa slice.
- Ward + polling unit cleanup for other states now continues state-by-state through the canonical sync pipeline rather than ad hoc static seed files.

### What Has Been Done

- Prisma schema: Campaign, CollectSubmission, Lga, Ward, PollingUnit models with unique constraints
- Canonical geo foundation added:
  - `prisma/seed-states-lgas.ts` — idempotent national LGA seed
  - `prisma/audit-geo.ts` — live-vs-canonical geo audit
  - `scripts/sync_state_wards_pus.mjs` — official state ward/PU sync pipeline
- Public form at `/c/[slug]`: 7-screen multi-step registration with localStorage persistence
- Admin: Campaign CRUD, submissions table with PU codes, CSV export, QR codes, canvasser aggregation
- Admin sidebar: Dashboard → Candidates → Collect
- Landing page: Collect section added between Security and CTA sections
- Deduplication: both phone number AND VIN checked per campaign
- Form refactored into modular step components under `src/components/collect/steps/`

### What Changed (Batch 3 — Latest)

- **NIN/VIN/APC format validation**: NIN must be exactly 11 digits, VIN must be exactly 19 alphanumeric characters (INEC standard), APC number must be alphanumeric. Validation in both client schemas and server API route.
- **Deduplication alerts**: Both inline error card (orange for duplicates) and toast notification shown when phone or VIN duplicate detected.
- **Landing page nav**: Added "Collect" section link to header navigation. CTA buttons now scroll to `#collect` section instead of external links.
- **Powered by Vextra Limited**: Subtle branding added to public form footer in `form-shell.tsx`.
- **Admin submissions table**: Added S/N (serial number) column, improved table header styling with `bg-muted/50`, responsive column hiding, role shown as badge.
- **Admin canvassers table**: Added S/N column with consistent styling.
- **Delete submission**: Full CRUD — admin can delete individual submissions via detail sheet (with confirmation dialog). API DELETE endpoint, hook, and API client added.
- **Admin dashboard widget**: Added Collect Campaigns and Collect Registrations stat cards to main admin dashboard. Grid expanded to 5 columns.
- **Campaign settings sync**: Removed APC/VIN field mode dropdowns (since both are always required now). Shows "Required" badges instead.
- **Campaign overview analytics**: Added cumulative registration trend line chart and top wards horizontal bar chart. New `getCumulativeRegistrations` and `getSubmissionsByWard` analytics helpers.

### What Changed (Hardening — Latest)

- **Schema consolidation**: Campaign create/update schemas unified into `collect-schemas.ts` (single source of truth). Removed duplicate definitions from `admin-schemas.ts`.
- **Dead config removal**: Removed `requireApcReg` and `requireVoterId` from Prisma schema, API routes, types, wizard, and settings UI. APC/NIN and VIN are always required — no configurable option needed.
- **Settings UI cleanup**: Removed static "Field Requirements" card (non-actionable). Settings now shows: Status controls, Campaign Details, Danger Zone.
- **VIN case normalization**: VIN is now uppercased via Zod `.transform()` before storage and duplicate checking. Prevents case-variant bypass of dedup.
- **Geo name trust fix**: Submit route now derives `lgaName`, `wardName`, `pollingUnitName` from validated DB records instead of trusting client-provided names.
- **P2002 race condition**: Submit route catch block now handles unique constraint violations (concurrent duplicate submissions) with a clear 409 response instead of generic 500.
- **Server-side analytics**: New `/api/admin/collect/campaigns/[id]/stats` endpoint computes all overview dashboard stats via SQL aggregations on full dataset. Replaces the previous approach of deriving analytics from a 100-row client page.
- **Null validation fix**: Campaign optional string fields (`candidateTitle`, `customQuestion1/2`) now accept `null` via `.nullish()`, fixing a 400 error when the wizard sends `null` for empty optional fields.
- **Submit schema DRY**: Server submit route now imports `serverSubmitSchema` from shared `collect-schemas.ts` instead of duplicating the Zod schema inline.
- **Spec doc**: Removed stale branch reference (`feature/collect` from `develop`) that contradicted the "merged to main" status.

### What Changed (Batch 4 + Geo Rethink)

- **Position-aware wizard**: President/Governor campaigns skip the LGA step; `enabledLgaIds` left empty for national/state scope.
- **Public LGA API**: 3-branch scope logic — national (all seeded LGAs), state (all LGAs in candidate's state), constituency (only `enabledLgaIds`).
- **Bug fix**: Constituency-scoped campaigns now correctly return only enabled LGAs (not all state LGAs).
- **Candidate-driven geo scope**: Constituency, constituency type, candidate name, and party are now derived server-side from the candidate — no longer editable in the campaign wizard.
- **3-step campaign wizard**: Step 1 = candidate + slug + branding (read-only scope summary inherited from candidate). Step 2 = **Collect configuration** — custom questions (room for more / prebuilt later) + optional LGA restrict. Step 3 = **Review & create** — summary card with section-level **Edit** (same pattern as create-candidate review) + Create Campaign. Draft key `wardwise:campaign-wizard:draft:v2` (bumped when moving from two steps to three so old drafts are not mis-applied).
- **Restrict toggle**: Optional "Restrict to part of constituency" in **collect configuration (step 2)** lets admin deselect LGAs from the inherited set. Must keep at least one LGA selected when restriction is on.
- **Campaign boundary guard**: Campaign create/update API validates `enabledLgaIds` is a subset of the candidate's `constituencyLgaIds`. Constituency positions with empty `constituencyLgaIds` return 400.
- **PATCH guard**: Campaign update rejects LGAs outside the candidate boundary; blocks activating when another active campaign exists.

### What Changed (Batch 5 — Public Flow Reliability)

- **Canvasser choice is now enforced in the UI**: on the final referral step, registrants must explicitly choose `Yes` or `No` before submit is enabled.
- **Referral validation tightened**: if `Yes` is selected, registrants must either choose a preloaded canvasser or provide both canvasser name and phone.
- **Submit 400s are more understandable**: public submit errors now surface the first field-level server validation message instead of only showing a generic failure.
- **Progress restore is more reliable**: localStorage persistence now saves field changes during the flow, not just step changes. Restoring progress preserves saved ward / polling unit choices and the canvasser yes/no state more reliably.
- **Service worker scope is now constrained to Collect**: the offline worker is registered for `/c/` only, and development sessions clean up old Collect workers/caches so stale JS/CSS does not leak into admin or local UI work.
- **Name capture is now split in the public form**: the personal details step uses `First Name`, `Middle Name` (optional), and `Last Name`. The backend stores both the split fields and the composed `fullName`, so admin views, search, and CSV exports can support either format.

### What Changed (Batch 6 — Registration References + Admin Lookup)

- **Confirmation screen shifted to receipt UX**: public confirmation now emphasizes successful receipt and verification review, not ordinal supporter counts.
- **Registration reference is now first-class**: completed submissions show a copyable `Registration Reference` (`WW-XXXXXXXX`) on the confirmation screen.
- **Admin/support can use the same reference**: the admin submissions search now accepts registration references in addition to name, phone, and email.
- **Reference surfaced in admin submissions UI**: the detail sheet includes a subtle, copyable `Registration Reference` block for support workflows without crowding the table.

### What Changed (Batch 7 — Candidate Identity Corrections)

- **Candidate identity edits now sync to campaigns**: when admin corrects candidate name, title, party, or constituency from Candidate Management, existing Collect campaigns update their stored identity snapshot fields.
- **Public links stay stable**: campaign `slug` is intentionally not regenerated, so already-shared `/c/[slug]` links continue working.
- **Display-name overrides still win**: campaigns with `displayName` continue showing the campaign-facing name; synced `candidateName` remains the underlying anchor/fallback.

### What Changed (Batch 8 — Admin Review Queue)

- **Submissions open to `All` with status filter chips**: admin submissions default to the full list for predictable search/lookup; inline chips for `All`, `Pending`, `Verified`, `Flagged` (counts shown inline) let admins jump into the review queue when needed.
- **Table stays lean**: APC/NIN and VIN remain in the detail sheet/export instead of crowding the main scanning table.
- **Bulk verification is safer**: admins can verify/flag selected rows as before, or escalate from selected-page rows to all records matching the current filters.
- **Filtered bulk actions are confirmed**: all-matching actions show the count and active filters before applying changes.
- **Audit trail preserved**: filtered bulk verify/flag/unverify/unflag writes per-submission audit entries and logs the campaign-level bulk action.

### What Changed (Batch 9 — Offline Queue UX)

- **Queued and confirmed states are separated**: offline submits show an amber `Pending Upload` confirmation, while server-accepted submits show the green confirmed receipt with reference code, share actions, and confetti.
- **Offline queue sync can complete the receipt**: successful queued syncs return the server submission ID/count so the active screen can flip to the confirmed receipt with a real `WW-XXXXXXXX` reference.
- **Permanent sync failures are retained locally**: 4xx rejections are marked `failed` in IndexedDB with `lastError`/`failedAt` instead of being deleted after a toast.
- **Failed records are reviewable**: a persistent needs-attention banner opens a failed review sheet with per-record error details, per-record dismiss, and bulk clear.
- **Active failed screen rehydrates**: if the user refreshes after seeing `Upload Failed`, the form can return to that red confirmation as long as the failed row still exists locally.

### What Changed (Batch 2)

- **LGA dropdown**: Shows only the campaign's `enabledLgaIds` (inherited from candidate's constituency boundary, or restricted subset).
- **APC/NIN field**: Renamed to "APC Registration Number or NIN". Now required.
- **VIN field**: Now required. Used for deduplication alongside phone number.
- **Role options**: Volunteer / Member / Canvasser (3 options).
- **Canvasser validation**: Both name and phone required when "Yes" selected.
- **New Registration button**: Added to confirmation screen.
- **QR code on confirmation**: Share section includes QR code.
- **Admin PU codes**: Submissions table and CSV export include polling unit codes.
- **Form refactor**: Main form split into modular step components.

### What Is Pending

- Official ward + polling unit sync for additional states beyond Adamawa (for example Bauchi)
- Future precision work for split-LGA constituencies lives in `docs/geo-canonical-seeding-plan.md`

## Locked Product Decisions

### Collect Role Scope

- Collect v1 is admin-only on the management side.
- Hassan / Vextra is the only admin role in scope for v1.
- Candidate self-service write access to Collect data is explicitly out of scope for v1.
- Campaign Insights provides a private read-only report; verification, canvasser management, and record edits require authenticated admin or future candidate-portal permissions.

### Campaign Ownership

- A Collect campaign links to an existing `Candidate` record (FK).
- A Collect campaign stores snapshot fields (`candidateName`, `candidateTitle`, `party`, `constituency`) for stable public rendering.
- Candidate identity edits sync those snapshot fields forward for spelling/title/party/constituency corrections, but never change the campaign slug.
- `displayName` remains the public override for movement/team/campaign-facing naming.

### Form Configuration

- **APC/NIN**: Required field. Accepts either APC membership number or National Identification Number (NIN).
- **VIN (Voter ID)**: Required field. Used for deduplication.
- Custom Question 1 and Custom Question 2 are included in v1, stored per submission.

### Geography

- **Option B implemented**: Database-backed geo tables (Lga, Ward, PollingUnit) with unique constraints.
- `@@unique([name, stateCode])` on Lga, `@@unique([code, lgaId])` on Ward, `@@unique([code, wardId])` on PollingUnit.
- Ward and PollingUnit codes now carry the real INEC identity where official source data contains duplicate names under the same parent.
- Public LGA dropdown is **scope-aware** based on position:
  - **President** → all seeded LGAs (national scope)
  - **Governor** → all LGAs in the candidate's state
  - **Senator / HoR / State Assembly** → only the campaign's `enabledLgaIds`
- National LGA seed and state ward/PU sync scripts are idempotent — safe to re-run without exact duplicate inserts.

### Deduplication

- `@@unique([campaignId, phone])` — prevents same phone registering twice per campaign.
- `@@unique([campaignId, voterIdNumber])` — prevents same VIN registering twice per campaign.
- Both constraints enforced at the database level. API also does pre-check for user-friendly error messages.

### Roles

- Three roles: **Volunteer**, **Member**, **Canvasser**.
- Legacy role values (women_leader, coordinator, youth_leader) preserved in `roleLabels` for backward compatibility with any existing data.

## Product Surfaces

### Public

- URL pattern: `/c/[slug]`
- Audience: registrants / supporters
- Authentication: none

### Admin

- URL pattern: `/admin/collect`
- Audience: Hassan / Vextra
- Authentication: existing admin auth only

### Landing Page

- Collect section added to the main landing page (between Security and CTA)
- Showcases multi-step registration, canvasser attribution, and verified deduplication

## Public Registration Form

### Screen Flow

| Screen | Content                                                                                                                                   |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 0      | Campaign splash → Begin Registration                                                                                                      |
| 1      | Personal details: first name, middle name?, last name, phone, email?, sex, age, occupation, marital status, custom questions              |
| 2      | Location: cascading LGA → Ward → Polling Unit (with INEC codes)                                                                           |
| 3      | Party info: APC/NIN (required) + VIN (required)                                                                                           |
| 4      | Role: Volunteer / Member / Canvasser (3 cards)                                                                                            |
| 5      | Canvasser: Yes/No toggle → name + phone if Yes (required when Yes)                                                                        |
| 6      | Confirmation: state-aware receipt (`confirmed`, `queued`, or `failed`), registration reference only after server acceptance, New Registration button, share actions only after confirmed |

### Persistence

- Draft progress is stored locally under `collect-form-${slug}` and cleared on successful submit.
- If a draft exists, splash prioritizes `Continue where you left off` as the primary action and offers `Start fresh` as the secondary action.
- Completed submissions are still stored in the database, but splash no longer auto-personalizes the experience as a returning-user takeover.
- Instead, same-device completion metadata is stored under `collect-submitted-${slug}` and used only for a subtle `Last registration on this device` utility card with the reference code.
- Saved progress includes lightweight UI state needed to restore the flow accurately (for example canvasser yes/no choice and occupation input mode).
- The confirmation screen now also shows a copyable `Registration Reference` and explains that the campaign team will review and verify the registration.
- Offline submissions are stored in IndexedDB until sync. Pending rows show an amber queued confirmation; successful sync removes the row and can flip to confirmed; permanent 4xx failures remain locally as failed rows for review/dismiss.
- Active failed confirmations store a slug-scoped local pointer (`collect-active-failed-${slug}`) so reload can return to the same failed row while it still exists.

### Validation

- Per-screen field validation via `form.trigger(screenFields)`
- Canvasser: user must choose `Yes` or `No` before submit. If `Yes` is selected, both name and phone are required (or a preloaded canvasser must be chosen).
- Server-side: Zod validation, phone/VIN dedup, campaign status checks

### Edge Cases

| Case                              | Behavior                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| Invalid/missing slug              | `notFound()`                                                                               |
| Draft campaign                    | `notFound()`                                                                               |
| Paused campaign                   | Static "Registration Paused" message                                                       |
| Closed campaign                   | Static "Registration Closed" message                                                       |
| Duplicate phone                   | 409 → "Already Registered" error box                                                       |
| Duplicate VIN                     | 409 → "Already Registered" error box                                                       |
| Missing canvasser Yes/No          | Submit button stays disabled on canvasser step                                             |
| Invalid submit payload            | 400 → first field-level validation message shown                                           |
| Network error during online submit | Error displayed, localStorage preserves progress                                           |
| Offline submit                    | Submission is queued in IndexedDB and the confirmation shows `Pending Upload`              |
| Queued sync success               | Row is removed locally; active confirmation flips to confirmed when server receipt is known |
| Queued sync permanent failure     | Row is marked failed, excluded from retry, and surfaced via failed confirmation/banner      |
| Failed records on same device     | Banner opens a failed review sheet with errors, per-record dismiss, and bulk clear         |
| Offline start without cached geo  | Location dropdowns cannot populate until the device has fetched the campaign geo catalogue |

## Data Model

### Geo Tables

```prisma
model Lga {
  id        Int    @id @default(autoincrement())
  name      String
  stateCode String @default("AD")
  @@unique([name, stateCode])
}

model Ward {
  id    Int    @id @default(autoincrement())
  code  String?
  name  String
  lgaId Int
  @@unique([code, lgaId])
}

model PollingUnit {
  id     Int    @id @default(autoincrement())
  code   String?
  name   String
  wardId Int
  @@unique([code, wardId])
}
```

### Campaign

- Links to Candidate via FK + stores snapshot fields
- `enabledLgaIds Int[]` — empty for President/Governor (national/state scope), populated for constituency-level positions
- `status`: draft | active | paused | closed
- `slug`: unique, used in public URL
- Candidate identity corrections sync `candidateName`, `candidateTitle`, `party`, and `constituency`; `slug` remains stable.

### CollectSubmission

- `@@unique([campaignId, phone])` + `@@unique([campaignId, voterIdNumber])`
- Stores split name fields (`firstName`, `middleName`, `lastName`) plus composed `fullName`
- Stores both FK references (lgaId, wardId, pollingUnitId) AND display names
- `role`: "volunteer" | "member" | "canvasser"
- `apcRegNumber`: stores APC number or NIN
- `voterIdNumber`: stores VIN

## API Routes

### Public (no auth)

| Route                          | Method | Notes                                                                                                  |
| ------------------------------ | ------ | ------------------------------------------------------------------------------------------------------ |
| `/api/collect/campaign/[slug]` | GET    | 404 for draft/missing, 410 for closed                                                                  |
| `/api/collect/lgas`            | GET    | `?campaignSlug=` → scope-aware: national (all), state (candidate's state), constituency (enabled only) |
| `/api/collect/wards`           | GET    | `?lgaId=`                                                                                              |
| `/api/collect/units`           | GET    | `?wardId=` — sorted by code                                                                            |
| `/api/collect/submit`          | POST   | Validates, dedup check (phone + VIN), creates submission                                               |

### Admin (auth required)

| Route                                           | Method               | Notes                                                                               |
| ----------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------- |
| `/api/admin/collect/campaigns`                  | GET + POST           | List with `_count`; GET accepts `?candidateId=` filter; create with slug uniqueness |
| `/api/admin/collect/campaigns/[id]`             | GET + PATCH + DELETE |                                                                                     |
| `/api/admin/collect/campaigns/[id]/submissions` | GET                  | Paginated, filterable; includes PU code and derived registration reference support  |
| `/api/admin/collect/campaigns/[id]/export`      | GET                  | CSV with PU code column; sanitizes `=+-@`                                           |
| `/api/admin/collect/campaigns/[id]/canvassers`  | GET                  | Aggregation                                                                         |
| `/api/admin/collect/lgas`                       | GET                  | All LGAs for campaign wizard                                                        |
| `/api/admin/collect/submissions/[sid]`          | PATCH                | Flag, verify, notes                                                                 |

### Export Rules

- Submission and canvasser exports use human-readable Nigeria time instead of raw ISO timestamps.
- Redacted submission exports keep operational names, phone numbers, and canvasser details visible.
- Redacted submission exports mask sensitive voter identity fields such as `APC/NIN` and `VIN`.

## File Structure

### Public Form (refactored)

```
src/components/collect/
  campaign-registration-form.tsx  — orchestrator (form state + screen routing)
  failed-review-sheet.tsx         — failed offline submission review + dismiss sheet
  form-shell.tsx                  — header, context bar, layout wrapper
  form-ui.tsx                     — shared: FieldLabel, FieldError, InputIcon, NavButtons, StepCard, etc.
  registration-step-header.tsx    — animated step header component
  steps/
    splash-screen.tsx
    personal-details-step.tsx
    location-step.tsx
    party-info-step.tsx
    role-step.tsx
    canvasser-step.tsx
    confirmation-screen.tsx
```

### Admin

```
src/components/admin/collect/
  campaign-list.tsx
  campaign-detail.tsx
  campaign-overview.tsx
  campaign-submissions.tsx
  campaign-canvassers.tsx
  campaign-settings.tsx
  campaign-wizard.tsx
  step-candidate-setup.tsx            — step 1: candidate + slug + branding
  step-campaign-collect-config.tsx    — step 2: questions + LGA restrict
  step-campaign-review.tsx            — step 3: read-only summary + Edit + create
```

**New Campaign wizard (`campaign-wizard.tsx`) — draft autosave**

- Uses the shared `useWizardDraft` hook (`src/hooks/use-wizard-draft.ts`) with storage key `wardwise:campaign-wizard:draft:v2`, `defaultValues` aligned to `createCampaignSchema`, and `isMeaningfulCampaignDraft` so empty shells are not restored.
- Debounced (400ms) writes, 24h TTL, restore-on-mount including **wizard step** (resume on step 2 or 3 if that was saved).
- `StepProgress` receives `stepSubtitles` from `useWatch` for the same recap pattern as create-candidate.
- **Draft restored** banner + **Discard** (clears storage + resets form + step 0), matching the create-candidate UX.
- Successful create calls `clear()` only (storage wipe; form already navigates away).
- `?candidateId=` URL preselect still runs when candidates load, but **skips if `candidateId` is already set** (e.g. from a restored draft) so draft and deep-link compose safely.
- Analytics: `admin_campaign_wizard_draft_restored`, `admin_campaign_wizard_draft_discarded`.

### Admin Support Workflow

- Supporters can share their `Registration Reference` from the public confirmation screen.
- Admins can paste that reference into the existing submissions search field.
- The submissions list derives the same `WW-XXXXXXXX` code from the submission UUID, so support can quickly locate the exact record without a new support dashboard.
- The submission detail sheet repeats the reference and makes it copyable for follow-up.

## Validation Checklist

- [x] Admin auth protects `/admin` and `/admin/collect`
- [x] Candidate CRUD still works
- [x] Campaign creation works
- [x] Public form respects campaign status (draft/active/paused/closed)
- [x] Phone + VIN deduplication works
- [x] Canvasser validation when "Yes" selected
- [x] CSV export includes PU codes and sanitizes cells
- [x] QR code generation works
- [x] Polling units sorted by INEC code
- [x] Build, lint, and typecheck pass
- [x] Adamawa official ward + polling unit sync completed

## Working Agreement With Claude

- Use this file as the canonical plan.
- If new decisions are made, update this file first.
- Do not maintain a separate competing plan document.
