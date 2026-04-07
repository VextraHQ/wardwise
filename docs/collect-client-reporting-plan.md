# Collect Client Reporting Plan

> Add a polished client-facing results experience on top of the existing Collect submission engine.
> Branch: `develop` | Last updated: 2026-04-07
> See also: `wardwise-collect-spec.md`, `wardwise-collect-v2-spec.md`, `wardwise-hardening-spec.md`, `collect-admin-export-plan.md`

---

## Status

- **Collect submission engine is ready** — public form, admin submissions, stats, export, canvasser breakdowns already exist
- **Client-facing value gap identified** — CSV export alone feels too weak as the main deliverable for a paid campaign product
- **Launch constraint accepted** — we should not block current form collection while building this
- **Recommended path** — ship a private read-only campaign reporting layer first, not a full candidate-auth platform
- **Future platform alignment** — this should grow naturally into the full candidate dashboard planned for the 2027 product

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

## Product Reality

This current Collect phase is not the full election OS.

It is a launch-focused phase built to:

- capture structured supporter data fast
- validate campaign demand before the larger 2027 platform
- provide immediate operational value during the pre-primary window

That means we should avoid overbuilding. But we also should not undersell the product by making CSV the only visible output.

---

## Decision

### Do not ship a full candidate dashboard login yet

That is a larger auth, permissions, and product-surface project.

### Do ship a private read-only campaign report

This is the best middle ground.

It gives the candidate/client:

- visibility into results
- confidence that the form is working
- a polished “campaign pulse” experience
- export access when needed

without requiring the full candidate account system yet.

---

## Options Considered

| Option                                    | What it means                                                     | Pros                                          | Cons                                            | Verdict             |
| ----------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------- | ------------------- |
| 1. CSV only                               | Admin exports and manually sends data                             | Fastest, zero new UI                          | Feels weak, low product value, admin bottleneck | Not recommended     |
| 2. Private read-only report (recommended) | Candidate/client sees a private results page with charts + export | Strong value, fast enough, safe, premium feel | Needs light access model + polished UI          | Best current option |
| 3. Light candidate portal                 | Candidate logs in and sees only their own report pages            | More premium, closer to full product          | Auth and permissions overhead                   | Good later step     |
| 4. Full candidate dashboard               | Candidate-facing campaign OS                                      | Long-term ideal                               | Too much for this launch phase                  | Future phase        |

---

## Recommendation

### Ship Option 2 now

The right launch sequence is:

1. keep public Collect live
2. keep admin analytics/export live
3. add a private read-only campaign results page
4. later expand that into the broader candidate dashboard experience

This changes the product from:

- “advanced form + CSV”

to:

- “supporter collection + campaign reporting”

That is a much stronger product story without taking on full dashboard scope.

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

## Proposed Experience

### Name

Use language like:

- `Campaign Report`
- `Campaign Pulse`
- `Supporter Report`

Avoid naming it “dashboard” in the first launch if it is still mostly read-only and report-focused. That keeps product expectations honest.

### Access

For the first version, recommended access model:

- **private share link**
- optionally **simple passcode**

This is faster and lower-risk than full auth.

### Why not candidate login now?

Full candidate login introduces:

- password/account recovery
- role isolation
- candidate onboarding UX
- session/auth support work
- multi-campaign account edge cases

Those are real product costs. The read-only report can deliver most of the client-facing value without taking them on immediately.

---

## UI / UX Direction

The client report should feel:

- premium
- calm
- campaign-centric
- not like admin
- not like raw analytics tooling

### Recommended structure

#### 1. Header / hero

Show:

- candidate name
- party
- constituency
- campaign status
- share form link
- export CTA

#### 2. Summary cards

Show:

- total submissions
- verified
- flagged
- LGAs active

These are the fastest “is this working?” indicators.

#### 3. Growth section

Show:

- daily registrations trend
- recent growth pulse

This gives the campaign emotional proof that activity is happening.

#### 4. Geography section

Show:

- top LGAs
- top wards

This is one of the most valuable strategic outputs.

#### 5. Recent submissions

Show a slim table/list:

- first name / initials
- LGA / ward
- date
- verification status

Keep this lightweight and privacy-aware.

#### 6. Export block

Keep:

- CSV export
- maybe redacted export if needed

But position it as a utility action, not the main content.

---

## What Should Stay Admin-Only

The report page should not expose internal ops controls.

Keep these on admin only:

- campaign creation / deletion
- campaign boundary editing
- reset-to-candidate-boundary actions
- geo management
- verification moderation tools
- notes / admin-only flags
- canvasser management CRUD

Client-facing page should be mostly:

- read-only
- clear
- polished
- safe to share

---

## Suggested Phase Split

### Phase 1 — Report MVP (recommended now)

Build:

- private report route
- summary cards
- charts
- geography breakdown
- recent submissions
- export button
- form link copy/share action

Do not build:

- full login
- candidate settings
- team management
- messaging
- notifications

### Phase 2 — Controlled client access

Add one of:

- passcode hardening
- signed access token
- OTP access

### Phase 3 — Full candidate dashboard

Expand into:

- candidate auth
- broader dashboard nav
- multi-campaign views
- deeper reporting
- 2027 campaign ops features

---

## Access Model Recommendation

### Best launch-safe choice

**Private share link + optional passcode**

Why:

- quick to ship
- enough for testing/pilots
- avoids full auth scope
- matches the “pre-funding / pre-primary” phase

### Better later

- phone/email OTP
- candidate account login

### Not recommended for now

- exposing the admin UI directly to clients

That would create role confusion and increase product risk.

---

## Technical Fit With Current Codebase

This is a good fit because the underlying data layer already exists.

Already available:

- campaign stats endpoint
- submissions endpoint
- export endpoint
- canvasser aggregation
- campaign overview UI patterns

Relevant current files:

- `src/components/admin/collect/campaign-overview.tsx`
- `src/components/admin/collect/campaign-submissions.tsx`
- `src/app/api/admin/collect/campaigns/[id]/stats/route.ts`
- `src/app/api/admin/collect/campaigns/[id]/submissions/route.ts`
- `src/app/api/admin/collect/campaigns/[id]/export/route.ts`

### Important implementation principle

Build the client report as a **read-only presentation layer over existing campaign data**, not as a rewrite of Collect.

That means:

- keep public submission flow stable
- keep DB writes unchanged
- keep current admin flows working
- add mostly read-only routes/components on top

---

## Candidate Dashboard Alignment

The repo already includes a candidate dashboard scaffold:

- `src/app/(candidate)/dashboard/*`
- `src/components/candidate-dashboard/*`
- `src/hooks/use-candidate-dashboard.ts`

This is useful, but the current launch recommendation is:

- **reuse the visual patterns where helpful**
- **do not force the full candidate-auth product live yet**

So the report MVP should be treated as:

- a launch-facing reporting layer now
- a stepping stone into the broader candidate dashboard later

---

## UX Recommendation On Styling

Because UI matters heavily here, the client report should not look like:

- admin tooling
- generic spreadsheet analytics
- a clone of the internal campaign settings pages

It should feel more like:

- polished executive summary
- campaign intelligence snapshot
- premium report surface

### Visual guidance

- cleaner hero area than admin pages
- fewer controls
- stronger hierarchy
- generous spacing
- export/share actions tucked into the top-right utility zone
- charts and geography cards should feel presentation-ready

This is one of the places where polish directly affects perceived product value.

---

## Proposed MVP Scope

### Must-have

- candidate/client can access a private report page
- total submissions
- verified / flagged
- daily trend
- top LGAs
- top wards
- recent submissions
- CSV export
- copy/share public form link

### Nice-to-have if easy

- canvasser leaderboard
- date-range filter
- “no submissions in 48h” warning

### Not now

- messaging
- notifications
- pricing/billing
- full settings
- multi-user/team access
- campaign editing

---

## Risks

### Risk 1: It still feels too “admin”

Mitigation:

- make the client report visually distinct
- keep it read-only and cleaner
- reduce internal ops language

### Risk 2: Access is too loose

Mitigation:

- use private links
- optionally add passcode
- keep destructive/admin actions out entirely

### Risk 3: Scope creep into “full dashboard”

Mitigation:

- treat this as a report MVP
- do not add candidate account management yet

---

## Launch Message

The product story should become:

- **Collect captures supporters**
- **WardWise shows campaign pulse**
- **Exports remain available when needed**

Not:

- “Here is a form, and maybe a CSV”

---

## Implementation Phases

### Phase 1 — Spec + route decision

- [ ] Decide final report naming (`Campaign Report` / `Campaign Pulse` / similar)
- [ ] Decide access model (`private link only` vs `private link + passcode`)
- [ ] Decide whether to build as a new route or a simplified candidate-dashboard surface

### Phase 2 — Report MVP

- [ ] Create private read-only report page shell
- [ ] Add summary hero
- [ ] Add top-line stat cards
- [ ] Add trend and geography sections
- [ ] Add recent submissions section
- [ ] Add CSV export + copy form link actions

### Phase 3 — Hardening

- [ ] Validate client cannot access admin-only actions
- [ ] Check mobile responsiveness
- [ ] Check empty states / low-data states
- [ ] Add passcode/guard if required

### Phase 4 — Future expansion

- [ ] Candidate auth / login
- [ ] Multi-campaign candidate views
- [ ] Team roles
- [ ] Canvasser mobile app integration

---

## Recommended Next Step

If we proceed, the best immediate next move is:

1. choose the report naming
2. choose the access model
3. design the MVP page structure
4. then implement the report MVP without touching the public submission flow

That keeps Collect stable while improving the perceived product value for the client quickly.
