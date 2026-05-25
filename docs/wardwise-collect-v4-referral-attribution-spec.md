# WardWise Collect v4 — Referral Attribution & Canvasser Intelligence Spec

> Focused implementation spec for stable future referral attribution, legacy-safe canvasser cleanup, and better candidate-facing referral reporting.
> Last updated: 2026-05-19
> See also: `wardwise-collect-spec.md`, `wardwise-collect-v3-form-configuration-spec.md`, `campaign-insights-spec.md`

---

## Status

- **Planned** — not yet implemented
- **Direction chosen** — preserve old referral text; do not silently rewrite history
- **Direction chosen** — future dropdown-selected canvassers must link to a stable canvasser record
- **Direction chosen** — candidate reporting should present `Referral Activity`, not fragile raw canvasser management
- **Direction chosen** — admin owns cleanup through `Roster`, `Referral Activity`, and `Possible Matches`

---

## Why This Exists

Collect currently mixes two different referral realities:

- a clean admin-managed **canvasser roster**
- messy **manual referral text** typed by supporters

That creates product problems:

- the same person can appear multiple times with slightly different spellings
- `Active Canvassers` can show `0` while `Top Canvasser` still shows names from submissions
- candidate-facing reporting looks weaker than it should because raw referral noise leaks into the report
- admin has no real cleanup workflow for matching old/manual referral names to known canvassers

This spec separates those concerns cleanly.

---

## Product Goals

1. Improve all future dropdown-selected referral attribution so one real canvasser groups correctly.
2. Preserve old raw referral submissions without falsifying history.
3. Make candidate reports read like polished campaign intelligence, not admin cleanup output.
4. Give admin a real referral cleanup workflow for live campaigns and legacy data.
5. Keep implementation risk low by improving structure going forward before trying to “fix everything” historically.

---

## Non-Goals

- Full candidate-side canvasser management
- Automatic aggressive deduplication of all legacy referral names
- Rewriting or overwriting original typed canvasser names on old submissions
- Turning the candidate report into an admin moderation surface
- Creating a new top-level `Canvassers` tab in Campaign Insights

---

## Core Decisions

### 1. Old submissions stay truthful

Do not overwrite legacy `canvasserName` / `canvasserPhone` values on existing submissions.

Allowed:

- add stable linkage metadata to old rows later
- show admin suggestions
- let admin manually link old rows to a known canvasser

Not allowed:

- silently replacing `Jamila Ibrahim` with `Jamila Jauro`
- force-merging similar names without confidence

### 2. Future submissions get stable attribution

If a supporter chooses a preloaded canvasser from the public dropdown:

- store a stable `campaignCanvasserId`
- also keep the submitted name/phone snapshot for historical display

If a supporter manually types a canvasser:

- keep it as manual referral text
- do not pretend it is a known canvasser

### 3. Candidate reports show polished truth

Campaign Insights should not show messy raw operational duplicates as if they are clean people records.

Candidate-facing reporting should emphasize:

- `Referred Supporters`
- `Direct Supporters`
- `Known Referral Sources`
- `Other Referral Names`

Admin-only cleanup detail belongs in admin.

### 4. Admin sees messy truth and can improve it

Admin canvasser UX becomes three clear areas:

- `Roster`
- `Referral Activity`
- `Possible Matches`

This is where duplicates, alias suggestions, and manual linking live.

### 5. No new top-level reporting tab

Keep Campaign Insights tabs as:

- `Overview`
- `Supporters`
- `Analytics`

Referral intelligence should be integrated into those tabs, not expanded into a new top-level destination.

---

## Data Model Direction

### `CollectSubmission`

Add:

```prisma
campaignCanvasserId String?
campaignCanvasser   CampaignCanvasser? @relation(fields: [campaignCanvasserId], references: [id], onDelete: SetNull)
```

Keep existing snapshot fields:

- `canvasserName`
- `canvasserPhone`

Why:

- `campaignCanvasserId` gives clean grouping for future linked submissions
- snapshots preserve exactly what was submitted at the time

No destructive rename needed.

### Optional later phase

If alias cleanup grows, we can later add:

```prisma
model CampaignCanvasserAlias {
  id                 String   @id @default(cuid())
  campaignId         String
  campaignCanvasserId String
  aliasName          String
  aliasPhone         String?
  createdAt          DateTime @default(now())
}
```

This is not required for Phase 1.

---

## Referral States

Every submission should effectively fall into one of these states:

### 1. Direct

- no canvasser selected
- no manual referral entered

### 2. Known referral source

- preloaded canvasser selected
- stable `campaignCanvasserId` present

### 3. Manual referral name

- supporter typed a canvasser/referral source manually
- no stable canvasser link yet

### 4. Possible match

- admin-side interpretation only
- a manual referral may likely match a known roster canvasser, but has not been linked yet

Candidate reporting should not foreground state 4.

---

## Legacy Data Strategy

### Safe rule

Do not rewrite old submission text.

### Safe auto-linking allowed

We may auto-link old rows only when confidence is high, for example:

- exact phone match to one and only one roster canvasser

Even then:

- set `campaignCanvasserId`
- keep original typed name/phone untouched

### Manual linking for uncertain cases

Examples:

- `Jamila Ibrahim`
- `Jamila Ibrahim Jauro`
- `Jamila Jauro`

These should surface in `Possible Matches`, where admin can choose:

- `Link to Jamila Jauro`
- `Keep separate`

### Never auto-merge by fuzzy name alone

Do not auto-merge based only on:

- similar names
- initials
- partial tokens

This is too risky in live political data.

---

## Public Form Behavior

### Before

```text
Canvasser Details
- If preloaded canvassers exist, supporter can choose from dropdown
- Otherwise supporter types name and phone manually
```

### After

```text
Canvasser Details
- Dropdown selection writes stable canvasser link + snapshot
- Manual entry remains manual referral text + snapshot
```

Supporter-facing UX does not need major visual change in Phase 1.

The important change is in how the selected canvasser is stored.

---

## Candidate Report UX

### Before

```text
Field Team Performance
- Active Canvassers: 0
- Top Canvasser: Jamila Ibrahim

Leaderboard
1. Jamila Ibrahim .......... 29
2. Jamila Ibrahim Jauro .... 9
3. City boy movement ....... 2
```

Problems:

- mixes roster count with submission text
- same person can appear multiple times
- candidate cannot tell what is clean vs raw

### After

#### Overview

```text
Referral Activity
- Referred Supporters
- Direct Supporters
- Known Referral Sources
- Other Referral Names
```

#### Analytics

```text
Referral Activity

Referral Split
- Referred submissions
- Direct / self submissions

Top Known Sources
1. Jamila Jauro ............ 38

Other Referral Names
- Jamila Ibrahim ........... 29
- Jamila Ibrahim Jauro ..... 9
- City Boy Movement ........ 2

Helper note
Other referral names may contain alternate spellings or manually typed entries.
```

#### Supporters Tab

```text
Filters
- Search
- Status
- Role
- Referral Source

Detail sheet
- Referral type: Known / Manual / Direct
- Referral source name
- Referral source phone
```

### Candidate wording

Prefer skim-friendly terms:

- `Referred Supporters`
- `Direct Supporters`
- `Known Referral Sources`
- `Other Referral Names`

Avoid leading with:

- `Possible matches`
- `Alias`
- `Active Canvassers` when the metric is not truly activity-based

---

## Admin UX

### Before

One mixed canvasser page:

- preloaded dropdown list
- referral leaderboard
- self-identified count

### After

```text
Canvasser Attribution

[ Roster ] [ Referral Activity ] [ Possible Matches ]
```

### `Roster`

Purpose:

- maintain the clean public form dropdown

Features:

- paginated table
- search
- add/remove canvasser
- phone uniqueness guard
- zone support

### `Referral Activity`

Purpose:

- show what submissions are actually attributing

Features:

- paginated leaderboard
- search
- badges:
  - `Known`
  - `Manual`
- click row -> filtered submissions
- export

### `Possible Matches`

Purpose:

- help admin clean ambiguous manual names without rewriting history

Example:

```text
Jamila Ibrahim .............. 29
Suggested match: Jamila Jauro
[ Link to roster ] [ Keep separate ]

Jamila Ibrahim Jauro ........ 9
Suggested match: Jamila Jauro
[ Link to roster ] [ Keep separate ]
```

### `Self-Identified`

Keep as a stat/filter, not a whole separate management space.

That is a different signal:

- supporter role = `canvasser`

It should not be conflated with referral attribution.

---

## Matching Heuristics

### Safe auto-link

- exact phone match to one roster canvasser

### Suggest only

- normalized exact name match
- near-name token match
- same phone with slightly different name spelling

### Never auto-link

- similar name, different phone
- group/movement names
- empty/incomplete entries

### Group or movement names remain valid

Examples like:

- `City Boy Movement`
- `MGM Youth Team`

should remain as manual referral sources, not forced into person-based canvasser logic.

---

## Reporting Metric Rules

### Candidate report

`Referral Activity` should be based on submission attribution in the active filtered view.

Not on:

- raw roster count
- total preloaded canvassers

### Admin

Can still show both:

- roster size
- referral activity count

But they must remain visibly separate metrics.

---

## Edge Cases

### 1. Preloaded canvasser selected

- stable link stored
- future reporting groups correctly

### 2. Manual entry of same real person

- remains manual unless auto-link is high-confidence or admin links it

### 3. Same phone, different name

- strong candidate for linking

### 4. Same/similar name, different phone

- do not auto-link

### 5. Group name instead of person

- keep as manual referral source

### 6. Deleted roster canvasser

- keep submission snapshots
- `campaignCanvasserId` may go null via `onDelete: SetNull`
- historical report still renders the original snapshots

### 7. Current live campaigns without preloaded canvassers

- candidate report should still work using referral activity language
- admin cleanup remains possible later

### 8. Long names and mobile tables

- truncate in leaderboard/table rows
- show full value in sheet/detail

### 9. Pagination

- admin referral activity must be paginated
- roster should also be paginated once the count grows

---

## Phased Implementation Plan

### Phase 1 — Future Stable Attribution ✅ Shipped

- `campaignCanvasserId` added to `CollectSubmission` (FK to `CampaignCanvasser`, `onDelete: SetNull`)
- `selectedCampaignCanvasserId` added to screen5Schema / serverSubmitSchema
- Public form `canvasser-step.tsx` writes the ID when a preloaded canvasser is selected
- Server validates the ID belongs to the campaign before persisting (silently discards stale/crafted IDs)
- `campaign-registration-form.tsx` centrally clears the ID in both skip-canvasser-step paths

### Phase 2 — Candidate Reporting Rewrite ✅ Shipped

- `CampaignStats` gains filter-aware referral metrics: `referredCount`, `directCount`, `knownSourceCount`, `otherNameCount`, `topKnownSources`, `otherReferralNames`
- `CampaignHealth` slimmed: removed `canvasserCount` / `topCanvassers` (submission-driven metrics are in `stats` now)
- `FieldTeamPerformanceCard` → `ReferralActivityCard` in `insights-overview.tsx`
- New `InsightsReferral` component in Analytics tab: referral split, top known sources, other names with helper note
- `insights-supporters.tsx` detail sheet now shows referral type (Known / Manual / Direct)

### Phase 3 — Admin Canvasser UX Cleanup ✅ Shipped

- `campaign-canvassers.tsx` refactored into 3 tabs: **Roster** / **Referral Activity** / **Possible Matches**
- Referral Activity tab: Known/Manual badges, click Known row → drill-down by `campaignCanvasserId`
- Possible Matches tab: phone + normalized-name matching, Link-to-Roster action, Keep Separate (client-side)
- New API routes: `GET /canvassers/matches`, `POST /canvassers/link`
- `submission-query.ts` and `collect-api.ts` thread `campaignCanvasserId` filter end-to-end
- Canvasser export gains `Type` column (Known/Manual) appended at end

### Optional Phase 4 — Safe Legacy Auto-Link Backfill

Not implemented as a background script. Admin uses the "Link to Roster" action in Possible Matches for confirmed cases. Bulk exact-phone backfill can be a separate admin tool if needed later.

---

## Verification / Rollout Checklist

1. Future dropdown-selected canvasser submissions group under one known source.
2. Manual typed names still submit successfully.
3. Candidate report no longer shows misleading `Active Canvassers` based on roster size.
4. Old submissions remain historically intact.
5. Admin can distinguish:
   - roster canvassers
   - manual referral names
   - possible duplicates
6. Paginated canvasser tables remain fast and readable on mobile and desktop.

---

## Recommendation

Build this as a focused v4 feature, not a patch inside v3.

The safest product path is:

- preserve old truth
- clean future attribution
- improve candidate report language immediately
- add admin cleanup tools where uncertainty really belongs
