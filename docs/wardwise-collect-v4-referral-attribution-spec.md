# WardWise Collect v4 — Streamlined Canvasser System Spec

> Current source of truth for canvasser attribution, admin canvasser activity, and candidate-facing canvasser reporting.
> Last updated: 2026-05-25
> Supersedes the earlier v4 direction that explored broader referral-cleanup and duplicate-resolution workflows.
> See also: `wardwise-collect-spec.md`, `wardwise-collect-v3-form-configuration-spec.md`, `campaign-insights-spec.md`

---

## Status

- **Implemented direction** — keep the canvasser system simple, honest, and easy to explain
- **Implemented direction** — saved-list selection remains the trusted attribution path
- **Implemented direction** — typed-in canvasser entries remain raw supporter-provided text
- **Implemented direction** — cleanup only helps with obvious typed-in -> saved-list matches
- **Explicitly not in scope** — typed-in -> typed-in dedupe, fuzzy merge engines, or historical rewriting

---

## Product Model

Collect now treats canvasser attribution as two practical states:

### 1. `From List`

- supporter selected a saved canvasser from the public form dropdown
- submission stores `campaignCanvasserId`
- original `canvasserName` / `canvasserPhone` snapshots are still preserved
- this is the trusted path used for cleaner grouping in admin and reporting

### 2. `Typed In`

- supporter typed a canvasser name manually
- submission keeps the raw `canvasserName` / `canvasserPhone`
- no stable list link is assumed unless admin explicitly links it later
- this is visible, useful, and intentionally a little messy

This is the entire production model. We do not introduce a third “smartly deduped” canvasser state in this version.

---

## Core Rules

### Public form

- Selecting a saved canvasser stores stable list attribution through `campaignCanvasserId`
- Typing a canvasser manually stores raw text only
- Manual entry must not force unexpected UI mode changes just because it resembles a saved canvasser
- Phone normalization can help recognize the same saved canvasser across display formats, but it must not turn free text into hidden auto-merges

### Admin

- `Canvasser Activity` is the main operational view
- row states remain only:
  - `From List`
  - `Typed In`
- cleanup is intentionally narrow:
  - only show typed-in entries that clearly match someone already on the saved canvasser list
  - do not compare typed-in entries against other typed-in entries
  - do not auto-merge by fuzzy name similarity
- deleting a saved canvasser removes them from future dropdown choices only
  - old submissions keep their original name/phone snapshots
  - old list-backed rows may fall back into the raw/manual bucket if the stable list record is gone

### Campaign Insights

- canvasser intelligence stays inside existing tabs:
  - `Overview`
  - `Supporters`
  - `Analytics`
- candidate-facing wording should stay simple:
  - `Canvasser Activity`
  - `Listed Canvassers`
  - `Typed Canvasser Names`
- reporting should not imply that typed-in names have been fully resolved unless they are truly linked to a saved canvasser

---

## Cleanup Scope

Cleanup is not a duplicate-resolution engine.

It exists only to answer one admin question:

> “Does this typed-in canvasser name clearly match someone already on my saved canvasser list?”

Allowed signals for cleanup suggestions:

- exact normalized phone match to a saved canvasser
- exact normalized name match to a saved canvasser

Not in scope:

- typed-in name vs another typed-in name
- fuzzy or token-overlap merges
- “probably the same person” suggestions without a saved-list anchor

Example:

- `Dauda Yunusa` typed with the same phone as a saved canvasser can appear in cleanup
- `Liman Yusuf` vs `Liman Yusuf Abdullahi` should remain two `Typed In` rows unless admin later creates or links a real saved-list canvasser entry

---

## UI Direction

### Admin canvasser screen

- Keep the main table primary and lightweight
- Use the same table/pagination language as the rest of admin
- Avoid wrapping the table in overly heavy dashboard cards
- Keep cleanup visually secondary so it reads like optional admin help, not half the feature
- `Manage Canvasser List` remains configuration
- `Canvasser Activity` remains the main operational view

### Candidate reporting

- Keep the canvasser story readable at a glance
- Use the same card/surface treatment as the rest of Campaign Insights
- Do not surface admin-cleanup concepts to candidates

---

## Data / Schema

No new schema changes are part of this streamlining pass.

The current stable attribution model remains:

- `campaignCanvasserId`
- `canvasserName`
- `canvasserPhone`

No alias model, typed-in dedupe model, or additional canvasser state is introduced here.

---

## Acceptance Criteria

- selecting a saved canvasser still stores stable attribution
- typing a canvasser manually still remains raw/manual
- `From List` and `Typed In` filters still work in admin
- export still respects the active canvasser filters
- cleanup only shows rows with clear saved-list matches
- typed-in rows that only resemble other typed-in rows do not appear in cleanup
- deleting a saved canvasser removes them from future dropdown choices without destroying old submission history
- Campaign Insights uses the same simplified canvasser vocabulary across tabs

---

## Notes For Later

If typed-in -> typed-in dedupe ever becomes important, treat it as a separate future feature with its own product decision, not as an extension of this streamlined canvasser system.
