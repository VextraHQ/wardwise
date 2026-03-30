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
- Geo data seeded: 14 LGAs, 143 wards, 2,123 polling units (Adamawa + Bauchi states).
- Client is testing; Girei and remaining Adamawa LGA data pending from client.

### What Has Been Done

- Prisma schema: Campaign, CollectSubmission, Lga, Ward, PollingUnit models with unique constraints
- Geo seed script (`prisma/seed-geo.ts`): idempotent, seeds all available LGA/ward/PU data
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

### What Changed (Batch 4)

- **Position-aware wizard**: President/Governor campaigns skip the LGA step; `enabledLgaIds` left empty for national/state scope.
- **Public LGA API**: 3-branch scope logic — national (all seeded LGAs), state (all LGAs in candidate's state), constituency (only `enabledLgaIds`).
- **Bug fix**: Constituency-scoped campaigns now correctly return only enabled LGAs (not all state LGAs).
- **Wizard step 1**: Added editable Constituency, Constituency Type, and Candidate Title fields. Pre-filled from candidate but manually editable as fallback.

### What Changed (Batch 2)

- **LGA dropdown**: Shows all LGAs for the campaign's state (derived from enabledLgaIds).
- **APC/NIN field**: Renamed to "APC Registration Number or NIN". Now required.
- **VIN field**: Now required. Used for deduplication alongside phone number.
- **Role options**: Volunteer / Member / Canvasser (3 options).
- **Canvasser validation**: Both name and phone required when "Yes" selected.
- **New Registration button**: Added to confirmation screen.
- **QR code on confirmation**: Share section includes QR code.
- **Admin PU codes**: Submissions table and CSV export include polling unit codes.
- **Form refactor**: Main form split into modular step components.

### What Is Pending

- Full Adamawa LGA data (client providing remaining data including Girei)

## Locked Product Decisions

### Collect Role Scope

- Collect v1 is admin-only on the management side.
- Hassan / Vextra is the only admin role in scope for v1.
- Candidate self-service access to Collect data is explicitly out of scope for v1.

### Campaign Ownership

- A Collect campaign links to an existing `Candidate` record (FK).
- A Collect campaign stores snapshot fields (candidateName, party) so public form is decoupled from live candidate edits.

### Form Configuration

- **APC/NIN**: Required field. Accepts either APC membership number or National Identification Number (NIN).
- **VIN (Voter ID)**: Required field. Used for deduplication.
- Custom Question 1 and Custom Question 2 are included in v1, stored per submission.

### Geography

- **Option B implemented**: Database-backed geo tables (Lga, Ward, PollingUnit) with unique constraints.
- `@@unique([name, stateCode])` on Lga, `@@unique([name, lgaId])` on Ward, `@@unique([name, wardId])` on PollingUnit.
- PollingUnit has `code` field storing real INEC polling unit numbers.
- Public LGA dropdown is **scope-aware** based on position:
  - **President** → all seeded LGAs (national scope)
  - **Governor** → all LGAs in the candidate's state
  - **Senator / HoR / State Assembly** → only the campaign's `enabledLgaIds`
- Seed script at `prisma/seed-geo.ts` is idempotent — safe to re-run without duplicates.

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

| Screen | Content                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| 0      | Campaign splash → Begin Registration                                                                                           |
| 1      | Personal details: name, phone, email?, sex, age, occupation, marital status, custom questions                                  |
| 2      | Location: cascading LGA → Ward → Polling Unit (with INEC codes)                                                                |
| 3      | Party info: APC/NIN (required) + VIN (required)                                                                                |
| 4      | Role: Volunteer / Member / Canvasser (3 cards)                                                                                 |
| 5      | Canvasser: Yes/No toggle → name + phone if Yes (required when Yes)                                                             |
| 6      | Confirmation: animated checkmark, confetti, supporter count, New Registration button, share (WhatsApp/SMS/Email/Copy), QR code |

### Persistence

- localStorage under `collect-form-${slug}`, cleared on successful submit.
- "Continue where you left off?" on splash if saved state exists.

### Validation

- Per-screen field validation via `form.trigger(screenFields)`
- Canvasser: if "Yes" selected, both name and phone required
- Server-side: Zod validation, phone/VIN dedup, campaign status checks

### Edge Cases

| Case                 | Behavior                                         |
| -------------------- | ------------------------------------------------ |
| Invalid/missing slug | `notFound()`                                     |
| Draft campaign       | `notFound()`                                     |
| Paused campaign      | Static "Registration Paused" message             |
| Closed campaign      | Static "Registration Closed" message             |
| Duplicate phone      | 409 → "Already Registered" error box             |
| Duplicate VIN        | 409 → "Already Registered" error box             |
| Network error        | Error displayed, localStorage preserves progress |

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
  name  String
  lgaId Int
  @@unique([name, lgaId])
}

model PollingUnit {
  id     Int    @id @default(autoincrement())
  code   String @default("")
  name   String
  wardId Int
  @@unique([name, wardId])
}
```

### Campaign

- Links to Candidate via FK + stores snapshot fields
- `enabledLgaIds Int[]` — empty for President/Governor (national/state scope), populated for constituency-level positions
- `status`: draft | active | paused | closed
- `slug`: unique, used in public URL

### CollectSubmission

- `@@unique([campaignId, phone])` + `@@unique([campaignId, voterIdNumber])`
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
| `/api/admin/collect/campaigns/[id]/submissions` | GET                  | Paginated, filterable; includes PU code                                             |
| `/api/admin/collect/campaigns/[id]/export`      | GET                  | CSV with PU code column; sanitizes `=+-@`                                           |
| `/api/admin/collect/campaigns/[id]/canvassers`  | GET                  | Aggregation                                                                         |
| `/api/admin/collect/lgas`                       | GET                  | All LGAs for campaign wizard                                                        |
| `/api/admin/collect/submissions/[sid]`          | PATCH                | Flag, verify, notes                                                                 |

## File Structure

### Public Form (refactored)

```
src/components/collect/
  campaign-registration-form.tsx  — orchestrator (form state + screen routing)
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
```

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
- [ ] Full Adamawa geo data seeded

## Working Agreement With Claude

- Use this file as the canonical plan.
- If new decisions are made, update this file first.
- Do not maintain a separate competing plan document.
