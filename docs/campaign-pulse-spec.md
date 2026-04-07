# Campaign Pulse Spec

> Private read-only campaign reporting for clients on top of Collect.
> Branch: `develop` | Last updated: 2026-04-07
> See also: `wardwise-collect-spec.md`, `wardwise-collect-v2-spec.md`, `wardwise-hardening-spec.md`

---

## Status

- **Direction chosen** — build a private read-only client report, not a full candidate-auth dashboard
- **Submission engine remains live** — public Collect form and admin workflows continue unchanged while this is built
- **Access model chosen** — private link + passcode
- **Product name chosen** — `Campaign Pulse`
- **Implementation principle** — reuse current Collect stats/export/submission infrastructure via shared server-side query helpers

---

## Goal

Give the paying candidate/client a polished results view so the product feels like:

- supporter collection
- campaign visibility
- campaign reporting

not just:

- public form
- admin CSV export

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
- CSV is available, but not the main experience

CSV should become a secondary action under `Export`, not the main outcome.

---

## Scope

### In scope

- private read-only campaign report page
- private access link + passcode unlock
- premium reporting UI
- top-line metrics
- trend chart
- top LGAs / wards
- recent submissions
- export CSV
- copy public form link
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

| Option | What it means | Pros | Cons | Verdict |
| --- | --- | --- | --- | --- |
| 1. CSV only | Admin exports and manually sends data | Fastest, zero new UI | Feels weak, low product value, admin bottleneck | Not recommended |
| 2. Private read-only report (chosen) | Candidate/client sees a private results page with charts + export | Strong value, fast enough, safe, premium feel | Needs light access model + polished UI | Best current option |
| 3. Light candidate portal | Candidate logs in and sees only their own report pages | More premium, closer to full product | Auth and permissions overhead | Good later step |
| 4. Full candidate dashboard | Candidate-facing campaign OS | Long-term ideal | Too much for this launch phase | Future phase |

---

## Product Decision

### Page name

`Campaign Pulse`

### Why

- sounds premium
- feels campaign-native
- avoids overselling a full “dashboard” too early
- works well as a client-facing read-only surface

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
3. On successful unlock, set a short-lived report-access cookie/session
4. Client can read the report until session expiry or revocation

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

---

## UX Sections

### 1. Hero

Show:

- candidate name
- party
- position
- constituency
- campaign status
- `Copy Form Link`
- `Export CSV`

### 2. Summary cards

Show:

- Supporters Captured
- Verified Records
- Needs Review
- Active LGAs

### 3. Momentum

Show:

- daily registrations trend

### 4. Geography

Show:

- top LGAs
- top wards

### 5. Campaign health

Show:

- form status
- last submission time
- active canvasser count if relevant and available

### 6. Recent submissions

Show a light read-only list/table:

- initials or name
- LGA
- ward
- date
- verification status

### 7. Utility footer

Show:

- export reminder
- raw CSV is available when needed

---

## Admin UX Changes

Add a new card under campaign settings:

### `Client Access`

Fields / controls:

- access status
- mode: `private link + passcode`
- copy report link
- open preview
- copy passcode
- reset passcode
- regenerate access link
- revoke access
- last viewed timestamp

### Behavior

- enabling access generates token + passcode
- passcode is shown once or explicitly reset/regenerated
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

### Reuse with adaptation

- candidate-dashboard visuals can inform layout and styling
- but the Campaign Pulse page should look cleaner and simpler than admin

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
- `POST /api/client-report/[token]/unlock`
  - verify passcode, set access cookie/session
- `GET /api/client-report/[token]/summary`
  - stat cards + charts + health
- `GET /api/client-report/[token]/submissions`
  - recent submissions list
- `GET /api/client-report/[token]/export`
  - read-only CSV export

### Security rule

These client-report routes must not expose admin-only actions or fields.

---

## Data Exposure Rules

### Safe to show

- aggregate counts
- geography breakdown
- verification/flag counts
- recent submission summaries
- CSV export

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

- show name / initials carefully
- show LGA / ward / date / status
- avoid showing every sensitive field in-page by default

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

## MVP Implementation Phases

### Phase 1 — Shared reporting layer

- [ ] Extract shared stats/submissions/export query helpers out of admin-only routes
- [ ] Keep admin routes working against the shared helper

### Phase 2 — Campaign access model

- [ ] Add client report fields to `Campaign`
- [ ] Add token generation helper
- [ ] Add passcode hashing + verify helper
- [ ] Add last-viewed tracking

### Phase 3 — Admin controls

- [ ] Add `Client Access` card to campaign settings
- [ ] Enable / revoke / regenerate link
- [ ] Set / reset passcode
- [ ] Add preview action

### Phase 4 — Client report route

- [ ] Build `/r/[token]` page shell
- [ ] Build locked/passcode state
- [ ] Build invalid/revoked state
- [ ] Build empty state
- [ ] Build report-loaded state

### Phase 5 — Client report sections

- [ ] Hero
- [ ] Stat cards
- [ ] Trend chart
- [ ] Top LGAs
- [ ] Top wards
- [ ] Campaign health
- [ ] Recent submissions
- [ ] Export + copy form link actions

### Phase 6 — Hardening

- [ ] Ensure mobile responsiveness
- [ ] Verify no admin-only actions leak through
- [ ] Verify paused/closed/empty states
- [ ] Verify export authorization through token/passcode path

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
