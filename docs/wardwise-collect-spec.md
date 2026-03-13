# WardWise Collect Canonical Spec

## Status
- This document is the working source of truth for WardWise Collect.
- `pre-scope-reduction` is reference-only and must not be treated as the active implementation branch.
- Active admin cleanup is part of the current product baseline and is expected before Collect implementation starts.
- Collect v1 is not implemented yet. This document defines the aligned plan after the admin cleanup pass.

## Current Branch Workflow
- Cleanup branch: `codex/admin-cleanup`
- Integration target: `develop`
- Collect build branch after cleanup: `codex/feature-collect`

Branch rules:
- Do not build Collect on `pre-scope-reduction`.
- Do not continue active feature work directly on `develop`.
- Use the cleaned `develop` branch as the base for `codex/feature-collect`.

## What Was Corrected Before Collect
- Active Super Admin is candidate-management-first.
- Exposed `Voters` and `Canvassers` were removed from the active admin UI.
- Mock-mode behavior was removed from active admin and location clients that the live product and Collect will rely on.
- Archived or future-scope voter/canvasser code remains in the repo for reference but is not part of the current live admin scope.

## Locked Product Decisions

### Collect Role Scope
- Collect v1 is admin-only on the management side.
- Hassan / Vextra is the only admin role in scope for v1.
- Candidate self-service access to Collect data is explicitly out of scope for v1.

### Campaign Ownership
- A Collect campaign links to an existing `Candidate` record.
- A Collect campaign also stores its own campaign snapshot/config fields so public form copy and campaign behavior are not tightly coupled to future edits on the core candidate record.

### Form Configuration
- APC Membership Number and VIN must use enum-style field modes:
  - `hidden`
  - `optional`
  - `required`
- Do not model these fields as plain booleans.
- Custom Question 1 and Custom Question 2 are included in v1.
- Both custom questions render on the public form and store answers per submission.

### Geography and Launch Safety
- Fake seed geography is not acceptable for production launch.
- Generated placeholder wards or polling units are not acceptable for launch campaigns.
- Real Girei geography is required before the MGM campaign can launch.
- The geo foundation decision is still deferred:
  - Option A: keep geography file-backed and store code references
  - Option B: normalize geography into database tables and store relations
- This decision must be made before Collect schema work begins.

## Product Surfaces

### Public
- URL pattern: `collect.wardwise.ng/c/[slug]`
- Audience: registrants / supporters
- Authentication: none

### Admin
- URL pattern: `collect.wardwise.ng/admin/collect`
- Audience: Hassan / Vextra
- Authentication: existing admin auth only

## Admin Scope for v1
- Add a new `Collect` section to the existing admin shell.
- Preserve current candidate-management admin behavior.
- Do not reintroduce archived voter/canvasser management into the active admin as part of Collect.

Collect admin capabilities:
- Create campaign
- Edit campaign
- Pause / resume / close campaign
- View submissions
- Search and filter submissions
- Flag submissions
- Add internal notes
- Delete submissions
- Export filtered CSV
- View canvasser aggregation
- Copy shareable link
- Generate / download QR code

## Public Registration Experience

### Core Flow
- Campaign splash screen
- Step 1: personal details
- Step 2: location
- Step 3: party information
- Step 4: role selection
- Step 5: canvasser attribution
- Confirmation screen

### Persistence
- Save in-progress form state to local storage using a campaign-scoped key.
- On return, offer:
  - continue
  - start fresh
- Clear persisted state after successful submission.

### Validation Expectations
- Full server-side validation with Zod
- Nigerian phone validation
- Campaign-scoped duplicate prevention on phone
- Location validation against campaign-enabled geography
- Conditional APC/VIN validation based on field mode

### Required Edge Cases
- invalid slug
- draft campaign access
- paused campaign
- closed campaign
- duplicate phone
- abandoned mid-flow
- network failure on submit

## Data Model Direction

### Campaign
Campaign fields must cover:
- candidate relation
- slug
- candidate title
- candidate display name snapshot
- party snapshot
- constituency
- constituency type
- enabled geography references
- APC field mode
- VIN field mode
- custom question labels
- status
- timestamps

### Submission
Submission fields must cover:
- campaign relation
- full name
- phone
- email
- sex
- age
- occupation
- marital status
- location reference
- APC membership number
- voter identification number
- verified flag
- role
- canvasser name
- canvasser phone
- custom question answers
- is flagged
- admin notes
- timestamps

Constraint:
- prevent duplicate phone per campaign

Important:
- exact location field shape depends on the geo foundation decision
- if file-backed geography is kept, store stable location codes
- if geography is normalized, store relational foreign keys

## API Direction

### Public API
- fetch campaign config by slug
- fetch enabled LGAs for campaign
- fetch wards by LGA
- fetch polling units by ward
- submit registration

### Admin API
- list campaigns
- create campaign
- get campaign detail
- update campaign
- delete campaign
- list submissions
- update submission note/flag state
- delete submission
- export CSV
- list canvasser aggregates

API rules:
- use existing Next.js app router route conventions
- use existing admin auth guard patterns
- serialize dates to ISO strings
- sanitize CSV cells to avoid formula injection

## UI Implementation Direction

### Admin
- Reuse existing shadcn/ui stack
- Reuse existing admin layout shell
- Keep sidebar change minimal: add `Collect`
- Use charts already supported by the repo for overview analytics
- Keep campaign detail split into:
  - Overview
  - Submissions
  - Canvassers
  - Settings

### Public
- Mobile-first layout
- Max width around 480px on desktop
- One step per screen
- Back button on steps except splash and confirmation
- Use existing button, form, toggle, badge, sheet, and chart primitives where possible

## Launch Preconditions
- Admin cleanup merged into `develop`
- `codex/feature-collect` created from cleaned `develop`
- Geo foundation decision explicitly made
- Real Girei data supplied if MGM remains a launch campaign
- `NEXT_PUBLIC_COLLECT_BASE_URL` configured

## Validation Checklist
- admin auth still protects `/admin`
- candidate CRUD still works after admin cleanup
- active admin has no exposed voter/canvasser UI
- location client works against real server responses
- campaign creation works
- public campaign form respects enabled geography
- duplicate prevention works
- CSV export works safely
- QR generation works
- build, lint, and typecheck pass

## Working Agreement With Claude
- Use this file as the canonical plan.
- If new decisions are made, update this file first.
- Do not maintain a separate competing plan document.
- Claude should be told:
  - admin cleanup is already part of the active baseline
  - `pre-scope-reduction` is archive/reference only
  - Collect v1 is admin-only
  - APC/VIN are enum field modes
  - custom questions store answers in v1
  - fake launch geo data is not acceptable
  - real Girei data is a launch prerequisite for MGM
  - geo foundation is still a checkpoint decision before schema work
