# Geo Admin UX + Data Operations Plan

## Context

WardWise now has two different geo-data jobs:

1. **Canonical rollout** — seed and sync official state/LGA/ward/polling-unit data safely
2. **Operational maintenance** — let admins inspect, review, fix, and top up geo data without touching the database directly

The current `/admin/geo` page is useful, but it is still closer to a generic CRUD browser than a true state-sync control center.

This document defines the intended split between scripts, database data, static files, and the admin UX.

---

## Alignment Check (2026-04-07)

This plan still points in the right direction, but it now needs to be read as a
`remaining geo admin UX work` document, not a from-scratch redesign.

### Already true now

- `/admin/geo` is no longer just a bare CRUD browser
- the app already has DB-backed admin geo APIs
- state overview + hierarchy drill-down already exist
- bulk corrections import already exists in admin
- shared geo display formatting is already in use across admin geo surfaces

### Still worth doing

- add a stronger state-level operations header
- add clearer sync/audit entry points for state-level work
- surface drift/status warnings more explicitly
- separate `official sync` from day-to-day correction imports in the UX
- add change history / operator visibility where it matters

### What should be tweaked

- Phase 2 is still useful, but it should focus on state operations and review UX,
  not re-describing the existing drill-down tables
- Phase 3 is partly done already because the shared display formatter exists; the
  remaining work is about consistency and raw-name visibility in audit contexts
- the old wording around `Import CSV` should now be read more broadly as
  `bulk corrections import`, which can support CSV and Excel templates without
  replacing the script-based official sync pipeline

### Recommendation

Yes, we should still do this plan, but as a narrower follow-on:

1. keep scripts as the canonical full-state sync path
2. keep admin geo as the operator console for review, corrections, and exports
3. redesign the next pass around `state operations`, not around deeper CRUD
4. trim or mark completed any items that are already in the product

---

## Current Reality

### Canonical / active now

- `src/lib/data/state-lga-locations.ts`
  - current canonical source for states + LGAs
- `prisma/seed-states-lgas.ts`
  - add-only canonical state/LGA seed
- `prisma/audit-geo.ts`
  - audit script for coverage, missing rows, duplicates, drift
- `scripts/extract_state_geo_from_inec_pdf.py`
  - extractor for official state ward/PU PDFs
- `scripts/sync_state_wards_pus.mjs`
  - state-level ward/PU dry-run + apply sync
- DB-backed admin geo APIs
  - canonical runtime/admin source for geo management

### Transitional / legacy for now

- `src/lib/data/wards.ts`
- `src/lib/data/polling-units.ts`
- `prisma/seed-geo.ts`
- `src/app/api/register/locations/route.ts`
- `src/lib/api/location.ts`

These should not be treated as long-term canonical runtime geo sources.
They still exist because:

- some partial seed flows still use them
- the future public voter/NIN flow may still reuse the legacy location route until it is re-pointed to DB-backed geo

---

## Decision 1: Keep the seed/sync scripts

The scripts are still needed.

They solve problems the UI should not be responsible for:

- parsing official source files
- dry-running large state-level replacements
- validating canonical diffs safely before apply
- making rollout repeatable for future states like Bauchi

### Principle

Use **scripts for canonical ingestion**, and use the **admin UI for review + maintenance**.

That means:

- scripts remain the safest path for full-state syncs
- UI handles quick fixes, search, review, small CRUD, and import previews
- we do not try to replace the sync scripts with raw manual CRUD

---

## Decision 2: Do not change stored official names just to make the UI prettier

Official INEC data often arrives in uppercase or mixed formatting:

- `CAPITAL SCHOOL XVII`
- `BETI`
- `PRI. SCH. III`

We should **store the official source value** in the database, but **format it better for display** in most user-facing UI.

### Why

If we mutate the stored name for presentation reasons:

- audits become harder
- source verification becomes harder
- imports/diffs become noisier
- future official syncs become harder to compare

### Recommended pattern

- **DB stores canonical official value**
- **UI derives display label**
- searches should remain case-insensitive
- admin geo UI should still be able to reveal the raw official name/code when needed

### Display rule

For most app surfaces:

- show title-cased or sentence-cased display labels
- preserve abbreviations, acronyms, numbers, and Roman numerals where appropriate

Examples:

- `CAPITAL SCHOOL XVII` -> `Capital School XVII`
- `BETI` -> `Beti`
- `PRI. SCH. III` -> `Pri. Sch. III`

### Admin nuance

On `/admin/geo`, the operator may need both:

- polished label for scanning
- raw official source value for trust/debugging

So the admin table/detail should eventually support:

- primary display label
- secondary code/raw source context

---

## Decision 3: The geo page should become a state operations console

The current drill-down CRUD is useful, but the main workflow problem is this:

- the highest-risk job is not “edit one ward”
- it is “correct an entire state safely”

So the geo page should evolve from generic hierarchy CRUD into a **state-first operations tool**.

---

## Recommended UX Direction

### Level A: State overview stays

Keep the state cards/grid because it gives:

- coverage visibility
- completeness visibility
- a clean entry point for drill-down

But add more operational meaning to each state card:

- canonical status: `Not seeded`, `Partial`, `Official`, `Needs review`
- last sync date
- source type: `Legacy`, `Official PDF`, `Manual`
- actions: `Review`, `Sync`, `Import`, `Audit`

### Level B: State detail becomes the key screen

When you open a state like Bauchi, the top of the page should act like a command bar:

- `Run audit`
- `Upload official file`
- `Preview sync`
- `Apply sync`
- `Export current data`
- `Bulk import corrections`

And the page should show a summary:

- LGAs expected vs seeded
- wards expected vs seeded
- polling units expected vs seeded
- drift warnings
- duplicate-name/code issues
- last successful sync

### Level C: Replace generic corrections import with guided import modes

The current bulk import action is useful, but too generic for large official corrections.

Recommended import choices:

1. `Official state sync`
   - upload official file or pre-generated JSON
   - preview diff
   - replace/merge by state
2. `Bulk corrections`
   - upload CSV or Excel for ward/PU fixes
   - add/update targeted rows
3. `Manual CRUD`
   - small one-off edits only

This makes the operator intent clear.

### Level D: CRUD remains, but becomes secondary

Keep add/edit/delete for:

- quick repairs
- typo fixes
- one-off ward or PU additions

But don’t make manual CRUD the primary tool for fixing a broken state.

For Bauchi-level corrections, manual CRUD alone is too slow and too risky.

---

## Recommended Page Structure

### 1. State overview

- state cards with completeness + sync status
- filter by region / status
- search by state

### 2. State operations header

- official sync status
- last update metadata
- action buttons for audit/import/sync/export

### 3. Drift panel

- counts mismatch
- missing LGAs/wards/PUs
- stale legacy data warnings
- submission impact warnings before destructive apply

### 4. Drill-down explorer

- LGAs
- wards
- polling units
- fast search and sort
- row edit actions

### 5. Activity/history

- last imports
- last syncs
- who changed what
- whether change came from script/import/manual edit

---

## Decision 4: Bauchi should follow the Adamawa pipeline, not ad hoc CRUD

For Bauchi, the recommended path is:

1. obtain official source file
2. extract structured state data
3. dry-run diff against DB
4. review submission impact
5. apply by state
6. use admin UI for follow-up spot fixes only

That is more scalable and safer than:

- manually editing dozens or hundreds of wards/PUs
- relying on generic corrections import alone

---

## Naming UX Recommendation

### Final recommendation

- store official names as canonical source values
- use a shared display formatter in UI
- make search case-insensitive
- show raw code/source context in admin geo surfaces

### Where to use formatted display labels

- public collect flows
- candidate-facing flows
- state/LGA/ward/PU admin list primary labels

### Where to preserve stronger official/raw visibility

- admin geo edit dialogs
- sync preview/diff screens
- audit/export views

---

## What To Build Next

### Phase 1: Finish the data foundation

- continue official state sync pipeline state by state
- Bauchi next
- keep audit and sync scripts as canonical ingestion tools

### Phase 2: Improve geo admin UX

- add state-level operations header
- add state sync preview/apply entry point
- add drift/status panel
- distinguish `official sync` from `bulk corrections import`

### Phase 3: Add display-name polish

- introduce shared geo display formatter
- use formatted labels in public/admin UI
- preserve raw official names in audit/edit contexts

### Phase 4: Retire transitional static runtime geo

- re-point remaining legacy location consumers to DB-backed geo
- retire `wards.ts` and `polling-units.ts` from runtime usage
- keep only canonical source artifacts and sync pipeline files

---

## Summary

The best long-term model is not:

- scripts only
- or CRUD only

It is:

- **scripts for official state-level ingestion**
- **admin UI for review, visibility, and small fixes**
- **DB as the runtime source of truth**
- **display formatting in UI instead of mutating official stored names**

That gives WardWise a cleaner path for Bauchi next, HoR later, and the rest of the national geo rollout without turning `/admin/geo` into a fragile spreadsheet clone.
