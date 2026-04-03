# Adamawa Ward + Polling Unit Sync

**Date:** April 3, 2026  
**Branch:** `develop`  
**Status:** Completed for Adamawa  
**Scope:** Replace Adamawa's partial demo ward / polling-unit data with the official INEC Adamawa directory from `02.pdf`

---

## Problem

Adamawa's current ward and polling-unit data in WardWise is partial and uses a mix of:

- legacy static seed data in [`src/lib/data/wards.ts`](/Users/nabeelhassan/Desktop/wardwise-demo/src/lib/data/wards.ts)
- legacy static polling units in [`src/lib/data/polling-units.ts`](/Users/nabeelhassan/Desktop/wardwise-demo/src/lib/data/polling-units.ts)
- partial database rows seeded from those files

This causes two issues:

1. polling-unit names are not consistently aligned with the official INEC directory
2. Adamawa coverage is incomplete, so even correct names live inside an incomplete state slice

---

## Official Source

**Primary source:** Adamawa INEC polling-unit PDF provided locally by the team

- PDF: `/Users/nabeelhassan/Downloads/02.pdf`
- Parsing mode: layout-aware text extraction
- Code example from source:

`195 ADAMAWA FUFORE BETI CHIGARI PRI. SCH. III 02-02-01-018`

For WardWise runtime:

- full source code stays useful for parsing and grouping
- stored `PollingUnit.code` remains the trailing segment only
- example stored code: `018`

---

## Verified Findings

Official Adamawa PDF totals:

- `21` LGAs
- `226` wards
- `4,104` polling units

Current live DB totals for Adamawa before sync:

- `82` wards
- `1,264` polling units

This confirms Adamawa is not just suffering from naming drift. The whole state slice is partial.

Post-sync verified totals:

- `226` wards
- `4,104` polling units
- post-sync dry-run shows `0` ward drift and `0` polling-unit drift against the generated official dataset

---

## Decision

Adamawa should be handled as the first **official state ward / polling-unit sync**, not as a manual UI cleanup.

That means:

- parse the official INEC PDF into structured state data
- dry-run compare it against the current DB
- replace Adamawa wards + polling units in the DB with the official set
- preserve submission history by nullifying stale `wardId` / `pollingUnitId` references before delete

We are **not** trying to patch the old Adamawa static seed by hand.

One more important conclusion from the official PDF:

- some wards are duplicated by **name** within the same LGA, but have different official ward codes
- some polling units are duplicated by **name** within the same ward, but have different official PU codes

So the runtime model must treat **official code** as the real unique identifier, not display name.

---

## Implementation

### 1. PDF extractor

Added a reusable extractor:

- [`scripts/extract_state_geo_from_inec_pdf.py`](/Users/nabeelhassan/Desktop/wardwise-demo/scripts/extract_state_geo_from_inec_pdf.py)

Purpose:

- reads a state INEC PDF
- extracts `LGA -> Ward -> Polling Units`
- keeps:
  - ward source code prefix, e.g. `02-02-01`
  - polling unit full code, e.g. `02-02-01-018`
  - stored polling unit code, e.g. `018`

### 2. State sync script

Added a reusable dry-run/apply sync script:

- [`scripts/sync_state_wards_pus.mjs`](/Users/nabeelhassan/Desktop/wardwise-demo/scripts/sync_state_wards_pus.mjs)

Behavior:

- dry-run by default
- compares current DB counts vs official dataset
- prints per-LGA drift
- on `--apply`:
  - nullifies stale submission foreign keys
  - deletes existing state wards + polling units
  - recreates the official state set

### 3. Adamawa dataset

Generated official Adamawa dataset:

- [`prisma/data/adamawa-wards-pus.json`](/Users/nabeelhassan/Desktop/wardwise-demo/prisma/data/adamawa-wards-pus.json)

### 4. Seed protection

Updated the legacy partial seed:

- [`prisma/seed-geo.ts`](/Users/nabeelhassan/Desktop/wardwise-demo/prisma/seed-geo.ts)

Adamawa is now excluded from the old partial ward/PU seed so stale demo rows cannot be reintroduced after the official sync.

### 5. Geo uniqueness correction

The geo schema is being corrected so it matches official INEC reality:

- `Ward` uniqueness should key off `code + lgaId`
- `PollingUnit` uniqueness should key off `code + wardId`

Why:

- display names are not always unique in official data
- official codes are the stable identifiers

This lets Adamawa load faithfully without inventing fake suffixes in names.

Examples now supported correctly in DB:

- two `MICHIKA` wards under Michika LGA, distinguished by ward codes `06` and `07`
- three `CAPITAL SCHOOL XVII` polling units inside Yola North / Doubeli, distinguished by PU codes `029`, `034`, and `035`

---

## Commands

Extract state data from a PDF:

```bash
pnpm data:extract:state-pdf --state-code AD --state-name Adamawa --pdf /Users/nabeelhassan/Downloads/02.pdf --out prisma/data/adamawa-wards-pus.json
```

Dry-run Adamawa sync:

```bash
pnpm db:sync:adamawa-geo:dry
```

Apply Adamawa sync:

```bash
pnpm db:sync:adamawa-geo
```

Generic state sync:

```bash
pnpm db:sync:state-wards-pus --file=/absolute/path/to/state-wards-pus.json
```

---

## Why Replace Instead Of Merge

Merge-only import is not enough here because:

- current Adamawa data is partial
- some current ward names are unofficial or legacy/demo names
- create-only imports would leave wrong rows in place

Replacing the Adamawa slice is cleaner than trying to infer rename mappings from incomplete legacy seed data.

Simple comparison:

- `Do nothing`: keep the current partial Adamawa state, which leaves wrong and missing ward / PU choices in place
- `Merge`: add missing official rows, but keep stale legacy rows too, which produces mixed and conflicting options
- `Replace`: clear only Adamawa's old ward / PU slice and reload the official Adamawa set, which gives one clean source of truth

---

## Edge Cases / Safeguards

- `CollectSubmission.wardName` and `CollectSubmission.pollingUnitName` remain as historical text
- only foreign keys are nulled before delete
- `PollingUnit.code` remains the trailing segment, not the full composite code
- the old static Adamawa seed is explicitly prevented from re-seeding into DB through `seed-geo.ts`

---

## Next

1. run Adamawa dry-run against the remote dev DB
2. review submission impact count
3. apply Adamawa official sync
4. verify `/admin/geo` counts and sample ward/PU names
5. reuse the same pattern for the next official state

Adamawa completion notes:

- remote Prisma schema pushed successfully
- Adamawa official sync applied successfully
- the sync script needed a longer interactive transaction timeout for full-state replacements
- route-side Prisma `findMany` sanity checks passed after the schema change
