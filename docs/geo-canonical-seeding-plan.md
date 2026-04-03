# Canonical Geo Data + Constituency Seed Plan

> Audit and harden WardWise's base geography before expanding official constituency presets.
> Branch: `develop` | Last updated: 2026-04-03
> See also: `collect-candidate-geo-rethink.md`, `wardwise-candidates-spec.md`, `geo-management-spec.md`

---

## Status

- **Audit started** — local state/LGA source reviewed against current app usage
- **Base geo source looks structurally sound** — `37` state entries and `774` LGAs in `state-lga-locations.ts`
- **Canonical LGA seed is complete** — live DB now contains all `774` LGAs across `37/37` states/FCT
- **No live duplicate LGAs found** — current DB has no duplicate `(stateCode, name)` rows
- **Canonical drift corrections applied** — `Bekwarra`, `Igbo-Etiti`, `Shongom`, `Nasarawa Eggon`, and `Oriire` were corrected in source + DB
- **Senator presets are now source-audited** — rebuilt from the official INEC workbook and validated for exact per-state LGA coverage
- **HoR whole-LGA rollout is complete** — `350` safe federal constituency presets were generated from the official INEC workbook
- **Split-LGA HoR seats are explicitly unsupported** — `10` official constituencies are excluded from the preset dropdown until ward/RA precision exists
- **Implementation expanded** — canonical geo audit, add-only core seed, drift-fix, and Senator/HoR rebuild scripts are now in the repo
- **Transitional files labeled** — static ward / polling-unit files and the old location API are now explicitly marked legacy/transitional

---

## Problem

We are now using geography as a product primitive:

1. Candidate boundaries depend on real LGA IDs
2. Collect campaign filtering depends on those candidate boundaries
3. Official constituency presets are only useful if the underlying geo data is canonical

That means we need to separate three different concerns clearly:

1. **Base geo seed** — states + LGAs + later wards/polling units
2. **Official constituency presets** — Senator first, HoR later
3. **Admin import workflow** — how we safely bring canonical geo data into the database without duplicate or drift

These layers used to be mixed, and that was the reason for this plan:

- `state-lga-locations.ts` is acting like a canonical source
- `seed-geo.ts` only seeds LGAs that already have ward data
- the old hand-maintained Senator preset block did not fully match the official INEC composition we audited

---

## Audit Findings

### 1. Base state + LGA data

`src/lib/data/state-lga-locations.ts` currently contains:

- `37` state-level entries (`36` states + `FCT`)
- `774` LGAs
- no duplicate LGA names within the same state in the checked-in source

This file is good enough to become the **v1 canonical seed source** for states + LGAs.

### 2. Current live database

Live database check after canonical seed + drift correction on 2026-04-03:

- `774` LGAs currently stored
- `37/37` states/FCT represented in LGA rows
- duplicate `(stateCode, name)` rows found: `0`
- non-canonical DB LGAs found: `0`

So the database is now fully seeded for the state/LGA layer.

### 3. Current geo seed behavior

`prisma/seed-geo.ts` is safe to re-run for the rows it manages because:

- it checks `Lga` by `name + stateCode`
- Prisma schema enforces `@@unique([name, stateCode])`
- wards are checked by `name + lgaId`
- polling units are checked by `name + wardId`

However, `seed-geo.ts` is **not** the right script for full canonical geo seeding because it only seeds LGAs that already have ward data in local files.

### 4. Senator presets

The Senator preset layer has now been rebuilt from the official INEC workbook and validated against the canonical LGA source.

Audit result:

- official INEC spreadsheet was fetched and parsed
- `scripts/rebuild-senator-presets.ts` now regenerates the Senator dataset from source
- the generated output in `src/lib/data/nigerian-senatorial-districts.ts` validates exact per-state LGA coverage
- a small set of source-era spelling drifts and legacy sheet spellings are normalized during generation

Conclusion:

- **HoR now builds on top of the audited Senator foundation**
- Senator and HoR presets should no longer be edited by hand in the old monolithic file

### 5. HoR feasibility

The official INEC spreadsheet contains `360` federal constituency rows.

But HoR is not perfectly LGA-shaped:

- most HoR constituencies can be represented by whole LGAs
- some are split within an LGA, e.g.:
  - `Lagos Island I / II`
  - `Mushin I / II`
  - `Oshodi/Isolo I / II`
  - `Surulere I / II`
  - `Port Harcourt I / II`

That means HoR needs a careful rollout:

- ship safe whole-LGA constituencies now
- leave split-LGA constituencies explicitly unsupported for now
- add ward/RA precision later for the excluded seats

### 6. Current `src/lib/data/*` file status

Not all files in `src/lib/data/` serve the same purpose. To reduce confusion for future dev work:

#### Canonical / active sources

- `src/lib/data/state-lga-locations.ts`
  - current canonical source for state metadata + LGA metadata
  - actively used by candidate, collect, geo admin stats, geo import validation
- `src/lib/data/nigerian-parties.ts`
  - active runtime options for candidate forms
- `src/lib/data/legal-data.ts`
  - unrelated to geo, but active runtime content

#### Active, but needs rebuild / correction

- `src/lib/data/nigerian-constituencies.ts`
  - active runtime source for official constituency presets
  - currently used in candidate create/edit
  - Senator section must be rebuilt from official INEC source before expansion

#### Transitional static seed sources

- `src/lib/data/wards.ts`
  - still used by `prisma/seed-geo.ts`
  - still used by `/api/register/locations`
  - should be treated as a transitional seed/input file, not canonical long-term runtime geo
- `src/lib/data/polling-units.ts`
  - still used by `prisma/seed-geo.ts`
  - still used by `/api/register/locations`
  - contains both real seeded data and fallback generation behavior, so it is not a clean canonical source

#### Likely legacy path to retire later

- `/api/register/locations` still reads static `state-lga-locations.ts`, `wards.ts`, and `polling-units.ts`
- `src/lib/api/location.ts` still exists as a client for that route
- current in-repo search found no active frontend callers to `src/lib/api/location.ts`

Conclusion:

- do **not** delete `wards.ts` or `polling-units.ts` yet
- but do mark them as **transitional / legacy seed sources**
- the long-term goal is to move runtime location reads fully onto DB-backed geo APIs

---

## Architecture Decisions

### Decision 1: Separate canonical geo seed from constituency presets

We will treat these as separate layers:

1. **Canonical Geo Layer**
   - states
   - LGAs
   - later wards
   - later polling units

2. **Constituency Layer**
   - Senator presets
   - House of Representatives presets
   - later State Assembly precision

This keeps the app from confusing:

- "what locations exist in Nigeria"
- with "how INEC groups those locations into districts"

### Decision 2: Seed states + LGAs first

The next canonical seed step should be:

- seed all `37` states
- seed all `774` LGAs
- do **not** block on ward/polling-unit completeness

This gives candidate boundary selection a full national LGA base without waiting for deeper geo rollout.

### Decision 3: Rebuild Senator presets before HoR

Order matters:

1. base geo seed
2. rebuild official Senator presets
3. only then add HoR presets

This avoids compounding bad constituency data.

### Decision 4: Do not use current model to fake split HoR seats

If a federal constituency is only "part of" an LGA, we should not pretend it maps to the whole LGA just to fill the dropdown.

That would create false political geography and eventually corrupt campaign coverage.

### Decision 5: Use seed scripts for canonical rollout, bulk import for operational maintenance

Bulk import and seed scripts solve different problems:

- **Seed scripts** are best for canonical national rollout
  - version-controlled
  - repeatable
  - auditable
  - easier to review in PRs
- **Bulk upload** is best for admin operations after the base layer exists
  - fixing gaps
  - adding late state data
  - making supervised corrections through preview/validate/commit

WardWise already has a useful DB-backed import route at `src/app/api/admin/geo/import/route.ts`:

- preview mode
- duplicate checks
- foreign-key validation
- formula-string sanitization
- batch commit with `skipDuplicates`

So the recommendation is:

1. **Seed first** for canonical states + LGAs
2. then use **bulk import** as the controlled admin tool for later ward / PU growth and corrections

This avoids turning CSV uploads into the primary national source-of-truth.

---

## Seed Safety

### Will new geo seeding duplicate the current database?

For exact matches, no.

Why:

- `Lga` has `@@unique([name, stateCode])` in Prisma
- current DB already has `0` duplicate `(stateCode, name)` rows
- a proper upsert/find-first strategy will reuse existing LGAs instead of creating new duplicates

### Real risk to watch

The real risk is not exact duplicates.

The real risk is **canonical-name drift**, for example:

- old row uses one spelling
- new canonical source uses a corrected spelling
- app ends up with two politically equivalent rows that are technically different names

Current audit did **not** find duplicates in the live DB, which is good.
But the new full seed script should still include a dry-run/audit mode before writing.

### Important operational rule

Do **not** replace or delete existing LGAs in the first pass.

First pass should:

- create missing states/LGAs
- reuse exact existing matches
- report mismatches for manual review

That is much safer than destructive normalization.

---

## Proposed Scripts

### 1. `prisma/seed-states-lgas.ts`

Purpose:

- seed all states
- seed all LGAs from `state-lga-locations.ts`
- idempotent
- safe to re-run

Behavior:

- create missing states if we add a `State` model later, or continue using static state metadata if we keep state as code-only
- for LGAs:
  - match by `name + stateCode`
  - create only when missing
  - never delete
  - never rename automatically
- dry-run by default; write mode requires explicit `--apply`

### 2. `prisma/audit-geo.ts`

Purpose:

- compare canonical source vs live DB before and after seed

Checks:

- total states count
- total LGA count
- duplicate `(stateCode, name)` rows
- missing LGAs by state
- unexpected extra LGAs in DB
- likely spelling drift / alias candidates

### 3. `scripts/rebuild-senator-presets.ts` or equivalent utility

Purpose:

- rebuild Senator presets from the official INEC source
- map official names to canonical app LGA names
- emit clean preset objects for `nigerian-constituencies.ts`

This should not directly mutate DB data.
It should produce reviewed source-controlled preset data.

### 4. Later cleanup: deprecate static runtime ward / PU sources

After DB-backed geo coverage is mature enough:

- migrate any remaining consumers off `/api/register/locations`
- stop treating `wards.ts` and `polling-units.ts` as runtime read sources
- keep them only as archival/seed references if still useful
- or move them into a clearer folder such as `prisma/seed-sources/` or `src/lib/legacy-geo/`

---

## Implementation Phases

### Phase 1: Canonical Geo Seed

- [x] Create `seed-states-lgas.ts`
- [x] Seed all `774` LGAs from `state-lga-locations.ts`
- [x] Reuse existing exact `(name, stateCode)` matches
- [x] Verify no duplicate rows are created
- [x] Add audit output by state
- [x] Keep current `seed-geo.ts` for partial ward/PU seed use, but stop treating it as the national geo seed

### Phase 2: Senator Preset Rebuild

- [x] Parse official INEC Senator district data
- [x] Normalize official names to app LGA names
- [x] Replace incorrect Senator presets in `nigerian-constituencies.ts`
- [x] Verify each Senator preset maps cleanly against canonical LGAs
- [x] Add doc note that Senator presets are now source-audited

### Phase 3: HoR Safe Rollout

- [x] Extract all `360` official HoR rows
- [x] Split into:
  - whole-LGA constituencies
  - partial-LGA constituencies
- [x] Add only whole-LGA HoR presets first
- [x] Leave split-LGA HoR seats explicitly unsupported for now
- [x] Document the unsupported list

### Phase 4: Later Precision Work

- [ ] Add ward-level or RA-level coverage model for split constituencies
- [ ] Revisit unsupported HoR seats
- [ ] Design State Assembly precision on top of ward/RA coverage
- [ ] Decide when `/api/register/locations` can be retired or re-pointed to DB-backed geo

---

## Verification

### Geo Seed

- [x] DB contains `774` LGAs after full seed
- [x] DB contains `37` state codes represented in LGA rows
- [x] No duplicate `(stateCode, name)` rows exist
- [x] Candidate create/edit can select from every state's LGAs

### Senator Presets

- [x] `109` Senator presets exist
- [x] each preset maps to canonical LGA names in app source
- [x] preset dropdown autofills correct LGAs for audited sample states
- [x] manual exact match does not trigger false preset warning

### HoR Preparation

- [x] official HoR source rows extracted and categorized
- [x] whole-LGA seats identified cleanly
- [x] split-LGA seats documented before UI rollout
- [x] candidate preset UX manually verified for HoR states with supported seats
- [x] unsupported-seat info note manually verified in Lagos and Rivers

---

## Migration Strategy

- **Current DB stays intact** — no destructive cleanup in Phase 1
- **Existing exact LGAs are reused** — full seed adds missing rows only
- **Senator preset correction is source-level first** — fix code file before relying on those presets in more flows
- **HoR comes only after Senator is trustworthy** — no parallel expansion on shaky constituency data

---

## Key Files

| File                                              | Role                                                                    |
| ------------------------------------------------- | ----------------------------------------------------------------------- |
| `prisma/audit-geo.ts`                             | Canonical geo audit: coverage, missing LGAs, duplicates, drift checks   |
| `prisma/seed-states-lgas.ts`                      | Add-only canonical state/LGA seed script                                |
| `prisma/fix-lga-canonical-names.ts`               | Applies verified canonical LGA name corrections to the live DB          |
| `prisma/geo-canonical.ts`                         | Shared canonical geo helpers for audit + seed                           |
| `src/lib/data/state-lga-locations.ts`             | Canonical v1 source for states + LGAs                                   |
| `prisma/seed-geo.ts`                              | Current partial geo seed (LGAs with ward data only)                     |
| `scripts/rebuild-senator-presets.ts`              | Rebuilds source-audited Senator presets from the official INEC workbook |
| `src/lib/data/nigerian-senatorial-districts.ts`   | Generated Senator presets validated against canonical LGAs              |
| `scripts/rebuild-hor-presets.ts`                  | Rebuilds safe HoR presets + unsupported split-LGA list from INEC        |
| `src/lib/data/nigerian-federal-constituencies.ts` | Generated HoR presets (`350`) + unsupported split-LGA seats (`10`)      |
| `src/lib/data/nigerian-constituencies.ts`         | Thin constituency preset wrapper used by candidate create/edit          |
| `src/lib/data/wards.ts`                           | Transitional static ward seed source                                    |
| `src/lib/data/polling-units.ts`                   | Transitional static polling-unit seed source                            |
| `src/app/api/register/locations/route.ts`         | Legacy static runtime location route kept for future public voter / NIN |
| `src/lib/api/location.ts`                         | Legacy static client for `/api/register/locations`                      |
| `prisma/schema.prisma`                            | `Lga`, `Ward`, `PollingUnit` uniqueness constraints                     |
| `docs/collect-candidate-geo-rethink.md`           | Candidate-driven geo architecture already shipped                       |

---

## Unsupported HoR Seats

The current HoR preset rollout intentionally excludes these `10` official split-LGA constituencies:

- `Lagos Island I`
- `Lagos Island II`
- `Mushin I`
- `Mushin II`
- `Oshodi/Isolo I`
- `Oshodi/Isolo II`
- `Surulere I`
- `Surulere II`
- `Port Harcourt I`
- `Port Harcourt II`

They remain manual-only until the product supports finer-grained ward/RA boundary modeling.

## Summary

The canonical geo foundation is now strong enough for national candidate boundary work:

1. base state/LGA geo is fully seeded and audited
2. Senator presets are rebuilt from the official INEC source
3. HoR whole-LGA presets are now shipped in a controlled, source-audited form
4. the remaining precision work is isolated to split-LGA HoR seats and later State Assembly support

That gives WardWise a safer foundation for candidate boundaries, campaign inheritance, and future geo tooling.
