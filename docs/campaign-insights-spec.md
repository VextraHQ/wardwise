# Campaign Insights Spec

> Private read-only campaign reporting for clients on top of Collect.
> Branch: `develop` | Last updated: 2026-04-09
> See also: `wardwise-collect-spec.md`, `wardwise-collect-v2-spec.md`, `wardwise-hardening-spec.md`

---

## Status

- **Direction chosen** — build a private read-only client report, not a full candidate-auth dashboard
- **Submission engine remains live** — public Collect form and admin workflows continue unchanged while this is built
- **Access model chosen** — private link + passcode
- **Product label** — `Campaign Insights`
- **Implementation principle** — reuse current Collect stats/export/submission infrastructure via shared server-side query helpers
- **UI direction chosen** — match the `/c/[slug]` public form architecture and use `/login`-quality access states rather than an “admin lite” dashboard
- **Implementation state** — core experience implemented; information architecture and visual polish still being refined

---

## Goal

Give the paying candidate/client a polished results view so the product feels like:

- supporter collection
- campaign visibility
- campaign reporting

not just:

- public form
- admin export

---

## Problem

Collect already works operationally:

- public users can submit supporter registrations
- admin can review submissions and analytics
- CSV export exists

But from the paying candidate/client perspective, the experience is still incomplete:

1. **Public form is strong, client visibility is weak**
2. **CSV feels like a utility, not the product**
3. **No candidate-facing reporting layer means admin remains the bottleneck**
4. **The product risks feeling like an advanced Google Form instead of a campaign intelligence tool**

---

## Core UX Principle

### The form is not the product. The visible results are the product.

The candidate/client should feel:

- submissions are coming in
- momentum is visible
- geography is visible
- campaign effort is measurable
- CSV / Excel export is available, but not the main experience

Export should become a secondary utility action, not the main outcome.

---

## Scope

### In scope

- private read-only campaign report page
- private access link + passcode unlock
- premium reporting UI aligned to the public Collect shell
- top-line metrics
- overview briefing modules
- analytics charts
- top LGAs / wards
- searchable supporter records table
- export CSV / Excel / redacted CSV / redacted Excel
- copy public form link
- QR code and compact share utility inside overview
- tabbed report navigation
- admin controls to enable/disable/revoke report access

### Out of scope

- full candidate login
- candidate account management
- candidate-side campaign editing
- candidate-side moderation / verification
- multi-campaign client workspace
- notifications / messaging / billing

---

## Options Considered

| Option                               | What it means                                                     | Pros                                          | Cons                                            | Verdict             |
| ------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------- | ------------------- |
| 1. CSV only                          | Admin exports and manually sends data                             | Fastest, zero new UI                          | Feels weak, low product value, admin bottleneck | Not recommended     |
| 2. Private read-only report (chosen) | Candidate/client sees a private results page with charts + export | Strong value, fast enough, safe, premium feel | Needs light access model + polished UI          | Best current option |
| 3. Light candidate portal            | Candidate logs in and sees only their own report pages            | More premium, closer to full product          | Auth and permissions overhead                   | Good later step     |
| 4. Full candidate dashboard          | Candidate-facing campaign OS                                      | Long-term ideal                               | Too much for this launch phase                  | Future phase        |

---

## Product Naming Direction

### Recommended UI label

`Campaign Insights`

### Why

- clearer and more executive-facing for paying political clients
- feels more like a briefing/reporting surface than a startup-style product label
- matches the actual purpose of the page: visibility, patterns, and decisions

### Current reality

- the component and doc layer now use `Campaign Insights`
- route families remain stable to avoid unnecessary churn

### Internal naming recommendation

- long-term preferred internal name: `campaign-report`
- current implemented name: `campaign-report`
- public API route family uses `/api/campaign-report/*`

---

## Access Model

### Public route

Recommended route:

- `/r/[token]`

Where:

- `token` is a random private access token, not the public campaign slug

### Unlock flow

1. Candidate/client opens private report link
2. If passcode is enabled, they see a passcode gate
3. On successful unlock, set a signed short-lived report-access cookie/session
4. Client can read the report until session expiry or revocation

### Session recommendation

Recommended implementation:

- HMAC-signed cookie
- token + issued timestamp in the signed payload
- 24-hour TTL
- invalidated by token regeneration or access revocation

### Why not expose `/c/[slug]` or admin routes

- `/c/[slug]` is public form space
- admin routes should remain admin-only
- report access needs its own private boundary

---

## Data Model Additions

Add access fields on `Campaign`:

```prisma
clientReportEnabled      Boolean   @default(false)
clientReportToken        String?   @unique
clientReportPasscodeHash String?
clientReportLastViewedAt DateTime?
```

### Notes

- `clientReportEnabled = false` means report is not available
- `clientReportToken` is the private URL key
- `clientReportPasscodeHash` stores hashed passcode, never raw passcode
- `clientReportLastViewedAt` helps admin understand whether the client is actually using it

### Why on Campaign

The report is campaign-specific, not candidate-global in this phase.

That is cleaner because:

- access is simpler
- analytics are already campaign-based
- the current Collect structure is campaign-first

---

## Metrics Rules

### Labels to use in client UI

- `Supporters Captured`
- `Verified Records`
- `Needs Review`
- `Active LGAs`

### Exact definitions

- **Supporters Captured**
  - total `CollectSubmission` rows for the campaign
  - duplicate phone and duplicate VIN are already blocked per campaign
- **Verified Records**
  - count where `isVerified = true`
- **Needs Review**
  - count where `isFlagged = true`
- **Active LGAs**
  - count of `campaign.enabledLgaIds`

### Edge case note

Offline queued submissions do not appear until successfully synced to the database. This is correct and should remain so.

### Export note

Collect already supports both CSV and Excel exports in the admin layer via the shared export utilities:

- `src/lib/exports/shared.ts`
- `src/lib/exports/csv.ts`
- `src/lib/exports/xlsx.ts`
- `src/lib/exports/submissions.ts`

Campaign Insights should reuse that same pipeline rather than creating a separate report-only export implementation.

The same shared export menu should expose:

- `Last Used`
- `Export CSV`
- `Export Excel`
- `Export Redacted CSV`
- `Export Redacted Excel`

---

## UX Direction

### The page should answer these questions in order

1. Are registrations coming in?
2. Where are they strongest?
3. Is momentum rising or slowing?
4. Is the field team contributing?
5. What can I do next without needing admin access?

The page should feel less like repeated summary cards and more like a compact
candidate briefing with evidence.

---

## UX Sections

### 0. Public shell

Match the public Collect experience from header to footer:

- same public header architecture as `/c/[slug]`
- same branded footer treatment
- same general spacing and shell rhythm
- no admin sidebar or internal admin framing

### 1. Access gate

Use the same architectural quality bar as `/login`:

- branded but minimal
- centered auth-style card
- polished passcode entry
- strong invalid / revoked / unavailable states

### 2. Hero

The hero should answer two things only:

- whose report this is
- how many supporters have been captured

Show:

- candidate name
- party
- position
- constituency
- campaign status
- one headline metric: `Supporters Captured`
- `Copy Form Link`
- optional secondary utility:
  - `Snapshot PDF`
  - `Download Brief`
  - only if a briefing export exists

Do not keep these in the hero:

- last activity
- canvasser count
- verification rate
- last 7 days registrations
- campaign health detail cards

Those belong in the briefing modules below.

### 3. Global controls

Place a single control row between the hero and the tabs.

This is the only place where global dashboard controls should live.

Show:

- date presets:
  - `Today`
  - `7D`
  - `30D`
  - `All Time`
- `From` date
- `To` date
- `Compare` toggle
- `Filters` action
- freshness line:
  - `Refreshed 8s ago`
  - `Refresh`

Active filters should render as chips directly below the controls, for example:

- `Girei ×`
- `Volunteer ×`
- `Clear all`

Rules:

- `Overview` and `Analytics` follow the same date range and compare state
- `Supporters` keeps its own table filters
- range changes should never blank the whole page or look like a hard refresh
- preserve current data while the new range loads in the background

### 4. Tabs

Use clear top-level tabs:

- `Overview`
- `Supporters`
- `Analytics`

### 5. Overview

The overview should work even for candidates who do not like reading charts
first. It should feel like an executive briefing.

#### KPI strip

Show:

- Supporters Captured
- Verified Records
- Needs Review
- Active LGAs

When compare mode is active and the selected range is bounded, show subtle
supporting deltas below the numbers.

Rules:

- keep the raw number as the primary signal
- `Active LGAs` should not show a delta
- do not treat a higher `Needs Review` count as automatically positive

#### `Now`

Show:

- campaign status
- last activity
- submissions in the selected period
- verification rate
- one short sentence that tells the candidate what is happening right now

#### `Hotspots`

Show:

- top LGA
- top ward
- one short insight sentence summarizing where registrations are strongest

#### `Field Team Performance`

Show:

- active canvassers
- top canvasser
- canvasser-led submission percentage if available
- direct vs canvasser-led split if available

Rules:

- keep this as performance insight, not canvasser management
- if there is no canvasser activity, show a compact empty state rather than
  making the section disappear entirely
- do not expose admin-style canvasser controls here

#### `Recent Activity`

Show:

- last 5 submissions
- name
- area
- time
- status

#### `Share Form` utility

Show:

- copy public form link
- larger QR code
- WhatsApp / SMS share actions if kept

Rules:

- keep this utility compact
- it belongs inside `Overview`
- it should not be a top-level destination or oversized separate tab

### 6. Supporter records

Show a richer read-only table that still feels lightweight:

- checkbox selection
- name
- phone
- LGA
- ward
- polling unit
- role
- date
- verification status
- search
- status filter
- pagination
- quick utility actions like copy selected contacts for follow-up
- view-only detail sheet for individual supporter records
- table badges, filters, spacing, and sheet behavior should match the admin Collect language more closely than generic custom table styling

Rules:

- checkboxes must have a useful read-only action
- candidates should not receive admin moderation powers from this surface
- if bulk actions stay, they should support follow-up utilities, not admin workflows

### 7. Analytics

Analytics should be detailed and evidence-heavy.

Overview should brief.

Analytics should explain.

Show:

- `Momentum` full width
- `Submissions by LGA`
- `Top Wards`
- `Supporter Roles`
- `Acquisition Mix`

Optional later:

- comparison line against previous period when `Compare` is on
- click-to-filter interactions from charts into global filter chips

Rules:

- charts must remain responsive on mobile and desktop
- momentum must always show visible x-axis dates under the chart
- if compare mode is on, momentum should show current period and prior period
  clearly without becoming visually noisy
- avoid cramped multi-chart rows that cause overflow
- donut/pie charts should use a legend below rather than labels floating outside the card
- if a chart is not readable on mobile, degrade to a ranked list or lighter summary rather than forcing overflow

### 7. What not to repeat

Avoid repeating the same data across:

- campaign health
- field team
- snapshots
- summary cards

The page should feel intentional. If a block does not add a new decision-making
angle, remove or merge it.

### 8. Final wireframe direction

#### Desktop

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ [APC] Hon. Mohammad Gidado Mohammad                                      [Copy Form Link]   │
│ Yola North / Yola South / Girei Federal Constituency                     [Snapshot PDF]     │
│ Status: Active   Supporters Captured: 1,284                                                   │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Today] [7D] [30D] [All Time]   [From] [To]   [Compare]   [Filters]   Refreshed 8s ago    │
│ Active filters: [Girei ×] [Volunteer ×] [Clear all]                                         │
└──────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Overview]   [Supporters]   [Analytics]                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────┘

OVERVIEW

┌──────────────────────┬──────────────────────┬──────────────────────┬──────────────────────┐
│ SUPPORTERS CAPTURED  │ VERIFIED RECORDS     │ NEEDS REVIEW         │ ACTIVE LGAs          │
│ 1,284                │ 1,102                │ 38                   │ 3                    │
│ +12% vs prior period │ +6% vs prior period  │ +2 flagged           │ no change            │
└──────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┘

┌────────────────────────────────────────────┬───────────────────────────────────────────────┐
│ NOW                                        │ HOTSPOTS                                      │
│ Campaign is actively collecting.           │ Top LGA: Girei                               │
│ 84 registrations in selected period.       │ Top ward: Jera Bakari                        │
│ Verification rate: 86%                     │ Most registrations are currently coming      │
│ Last submission: 8m ago                    │ from Girei, with Jera Bakari leading.        │
└────────────────────────────────────────────┴───────────────────────────────────────────────┘

┌────────────────────────────────────────────┬───────────────────────────────────────────────┐
│ FIELD TEAM PERFORMANCE                     │ RECENT ACTIVITY                               │
│ Active canvassers: 6                       │ A. Bello   Girei / Jera Bakari    Verified    │
│ Canvasser-led share: 58%                   │ M. Usman   Yola North / Doubeli   Pending     │
│ Top canvasser: Hauwa Ibrahim (74)          │ R. Musa    Girei / Damare         Verified    │
│ Direct vs field: 42% / 58%                 │ [View all supporters]                         │
└────────────────────────────────────────────┴───────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ SHARE FORM / BRIEFING                                                                       │
│ [ QR ]   Copy form link   WhatsApp   SMS                                  [Download Brief] │
└──────────────────────────────────────────────────────────────────────────────────────────────┘

SUPPORTERS

┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ Search supporters...     [Status] [LGA] [Ward] [Role]                       [Export]       │
│ Selected: 12   [Copy Contacts]                                                                │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ □ Name              LGA         Ward         PU           Role        Date        Status     │
│ □ A. Bello          Girei       Jera Bakari  PU 014       Volunteer   08 Apr      Verified   │
│ □ M. Usman          Yola North  Doubeli      PU 102       Member      08 Apr      Pending    │
│ □ H. Ahmed          Girei       Damare       PU 031       Canvasser   07 Apr      Flagged    │
└──────────────────────────────────────────────────────────────────────────────────────────────┘

ANALYTICS

┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ MOMENTUM                                                                                     │
│ Current period + previous period line when Compare is on                                     │
│ 2 Apr     4 Apr     6 Apr     8 Apr                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────┬───────────────────────────────────────────────┐
│ SUBMISSIONS BY LGA                         │ TOP WARDS                                      │
└────────────────────────────────────────────┴───────────────────────────────────────────────┘

┌────────────────────────────────────────────┬───────────────────────────────────────────────┐
│ SUPPORTER ROLES                            │ ACQUISITION MIX                                │
└────────────────────────────────────────────┴───────────────────────────────────────────────┘
```

#### Mobile

```text
┌──────────────────────────────┐
│ [APC]                        │
│ Hon. Mohammad Gidado         │
│ Yola North / Yola South /    │
│ Girei Federal Constituency   │
│ Status: Active               │
│ Supporters Captured: 1,284   │
│ [Copy Link] [Snapshot]       │
└──────────────────────────────┘

┌──────────────────────────────┐
│ [7D] [30D] [All] [Compare]   │
│ [From] [To] [Filters]        │
│ Refreshed 8s ago             │
│ Girei ×   Volunteer ×        │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Overview Supporters Analytics│
└──────────────────────────────┘

Overview stacks:
- KPI cards
- Now
- Hotspots
- Field Team Performance
- Recent Activity
- Share Form / Briefing

Analytics stacks:
- Momentum
- Submissions by LGA
- Top Wards
- Supporter Roles
- Acquisition Mix
```

---

## Admin UX Changes

Add a new card under campaign settings:

### `Client Access`

Fields / controls:

- access status
- mode: `private link + passcode`
- copy report link
- open preview
- copy passcode (when freshly generated or reset)
- reset passcode
- regenerate access link
- revoke access
- last viewed timestamp

### Behavior

- enabling access generates token + passcode
- passcode is shown when generated or reset
- admin can reset/regenerate the passcode at any time if the client loses it
- revoking access invalidates current token and cookie/session

---

## Report States

### 1. Locked

- user opens report link
- must enter passcode

### 2. Report active

- data visible
- export enabled if submissions > 0

### 3. Empty state

- campaign report available
- no submissions yet
- copy form link still visible
- export disabled

### 4. Paused campaign

- report still visible
- status indicates campaign is paused

### 5. Closed campaign

- report still visible
- status indicates campaign is closed
- historical reporting still available

### 6. Invalid / revoked link

- report unavailable state
- instruct user to contact campaign admin

---

## DRY Architecture Decision

Do not duplicate reporting logic between admin and client.

Campaign Insights should follow the same general client architecture as the rest of
the app:

- `src/lib/api/campaign-report.ts` for campaign-report API calls
- `src/hooks/use-campaign-report.ts` for React Query hooks
- keep top-level page composition in `campaign-insights.tsx`
- only split out sections that have real UI weight or interaction complexity

### React Query

Use React Query for the report data layer, consistent with the rest of the app.

That means:

- query logic lives in hooks
- raw request construction lives in `src/lib/api/*`
- visual components stay focused on presentation and interaction

This structure is already present and should be preserved rather than scattering
raw `fetch` calls around the page.

### Practical modularization rule

Do not over-fragment the report into thin wrapper components.

Preferred approach:

- keep page composition and lightweight overview blocks in `campaign-insights.tsx`
- split only heavier sections such as:
  - hero
  - supporters table/sheet
  - momentum chart
  - geography charts
  - audience breakdown

This keeps the report understandable for future developers.

### Extract shared server helpers

Create a shared reporting layer, for example:

- `src/lib/server/collect-reporting.ts`

This module should own:

- stats aggregation
- recent submissions query
- export query building
- shared filter logic where applicable

### Then:

- admin routes keep admin auth and call shared helper
- client report routes use token/passcode access and call the same shared helper

This keeps:

- query logic DRY
- metric definitions consistent
- future changes safer

---

## UI Reuse Strategy

### Reuse directly

- chart patterns from `campaign-overview.tsx`
- export logic from current export route
- recent-submission query shape from current submissions route
- general stat-card patterns from existing dashboard components
- table and pagination patterns from current admin Collect submissions UX

### Reuse with adaptation

- candidate-dashboard visuals can inform layout and styling
- public Collect shell components should define the outer experience
- auth card patterns from `/login` should define the locked / unavailable access states
- the collect registration header can be reused inside the access gate where it improves continuity
- the Campaign Insights page should feel premium and editorial, not like a copied admin screen

### Do not reuse as-is

- admin page structure
- admin tab system
- admin moderation controls
- admin-only language

---

## Proposed Routes / APIs

### Admin-side

- `PATCH /api/admin/collect/campaigns/[id]`
  - add support for client report access fields

### Client-side read-only

- `GET /r/[token]`
  - render locked state or report state
- `POST /api/campaign-report/[token]/unlock`
  - verify passcode, set access cookie/session
- `GET /api/campaign-report/[token]/summary`
  - stat cards + charts + health
- `GET /api/campaign-report/[token]/submissions`
  - recent submissions list
- `GET /api/campaign-report/[token]/export`
  - read-only CSV / Excel export

### Security rule

These campaign report routes must not expose admin-only actions or fields.

### Naming note

Use `/api/campaign-report/*` consistently alongside `campaign-report` in files
and hooks so the feature reads as one coherent concept.

---

## Data Exposure Rules

### Safe to show

- aggregate counts
- geography breakdown
- verification/flag counts
- recent submission summaries
- CSV / Excel export

### Keep admin-only

- admin notes
- moderation actions
- delete actions
- geo boundary editing
- campaign settings
- any deep internal operational controls

### Privacy note

Recent submissions should remain intentionally light.

Recommended first version:

- show the fields needed for operational follow-up
- keep the table read-only
- reserve deeper private data handling for export and later role-based access work

---

## Edge Cases

### Existing submissions after campaign changes

The report follows existing campaign reporting rules:

- old submissions remain historical records
- new submissions follow current campaign boundary

### Zero submissions

- do not show broken charts
- show polished empty state with next-step prompt

### Passcode forgotten

- admin resets passcode from campaign settings

### Link leaked

- admin regenerates token and/or revokes access

### Campaign paused or closed

- report still works
- collection status changes only affect new submissions

### Offline pending forms

- not counted until synced to DB

---

## Implementation Phases

### Phase 1 — Shared reporting layer

- [x] Extract shared stats/submissions/export query helpers out of admin-only routes
- [x] Keep admin routes working against the shared helper

### Phase 2 — Campaign access model

- [x] Add client report fields to `Campaign`
- [x] Add token generation helper
- [x] Add passcode hashing + verify helper
- [x] Add last-viewed tracking

### Phase 3 — Admin controls

- [x] Add `Client Access` card to campaign settings
- [x] Enable / revoke / regenerate link
- [x] Set / reset passcode
- [x] Add preview action
- [x] Block draft campaigns from enabling client report access

### Phase 4 — Client report route

- [x] Build `/r/[token]` page shell
- [x] Build locked/passcode state
- [x] Build invalid/revoked state
- [x] Build empty state
- [x] Build report-loaded state

### Phase 5 — Client report sections

- [x] Public shell aligned to `/c/[slug]`
- [x] Access gate aligned to `/login`
- [x] Hero
- [x] Tabbed navigation
- [x] Stat cards
- [x] Trend chart
- [x] Top LGAs
- [x] Top wards
- [x] Audience breakdown charts
- [x] Campaign health signals
- [x] Searchable supporter records table
- [x] Share utility inside overview
- [x] Export action aligned to reporting views
- [x] Copy form link action
- [x] Admin-style export menu with CSV / Excel / redacted variants

### Phase 6 — Hardening

- [x] Ensure mobile responsiveness
- [x] Verify no admin-only actions leak through
- [x] Verify paused/closed/empty states
- [x] Verify export authorization through token/passcode path

### Phase 7 — IA and visual refinement

- [x] Align the UI label and component/doc naming to `Campaign Insights`
- [ ] Add a single global control row for date range, compare, filters, and freshness
- [ ] Keep the hero focused on identity + one headline metric
- [ ] Reduce repeated overview blocks into `Now`, `Hotspots`, `Field Team Performance`, and `Recent Activity`
- [ ] Keep sharing as a compact overview utility, not a destination
- [ ] Ensure all analytics charts remain readable on both desktop and mobile
- [ ] Keep visible date ticks under momentum charts
- [ ] Keep canvasser insight lightweight and performance-focused
- [ ] Add compare-aware chart and KPI behavior without making Overview feel busy
- [x] Clean up internal module and route naming to `campaign-report`

## Next Polishing Ideas

- add click-to-filter chips from charts and ranked lists into the global filter bar
- add a cleaner print / share summary mode for candidate briefings
- add a compare toggle against the prior period
- add a direct vs field-team acquisition split that feels editorial, not operational
- add optional report branding per campaign if needed later

---

## Key Files

| File                                                            | Role                                                         |
| --------------------------------------------------------------- | ------------------------------------------------------------ |
| `src/components/admin/collect/campaign-settings.tsx`            | Add client access controls                                   |
| `src/components/admin/collect/campaign-overview.tsx`            | Reuse chart/data patterns                                    |
| `src/app/api/admin/collect/campaigns/[id]/stats/route.ts`       | Current stats source to extract into shared helper           |
| `src/app/api/admin/collect/campaigns/[id]/submissions/route.ts` | Current submissions source to extract into shared helper     |
| `src/app/api/admin/collect/campaigns/[id]/export/route.ts`      | Current export source to extract into shared helper          |
| `src/components/candidate-dashboard/*`                          | Visual/design reference for higher-polish reporting surfaces |
| `prisma/schema.prisma`                                          | Add client report access fields on `Campaign`                |

---

## Launch Positioning

After this ships, Collect can be positioned as:

- premium supporter registration
- private campaign reporting
- export-ready campaign data

That is a much stronger client-facing value proposition than “public form + CSV”.
