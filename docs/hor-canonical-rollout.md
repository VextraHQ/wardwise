# Canonical HoR Preset Rollout

> Official House of Representatives preset rollout for WardWise candidate boundary selection.
> Branch: `develop` | Last updated: 2026-04-03
> See also: `geo-canonical-seeding-plan.md`, `wardwise-candidates-spec.md`

---

## Status

- **Official HoR source parsed** — the INEC workbook `FED. CONST.` sheet was audited and processed
- **Safe HoR presets shipped** — `350` whole-LGA federal constituencies are now available as runtime presets
- **Split-LGA seats excluded on purpose** — `10` official constituencies are not shown in the preset dropdown yet
- **Candidate create/edit is aligned** — preset UX now supports HoR and explains unsupported split seats in affected states

---

## Problem

WardWise now depends on real constituency boundaries for:

1. candidate setup
2. collect campaign inheritance
3. public location filtering

That means HoR presets must be politically correct, not just convenient.

The challenge is that the official INEC HoR list is mixed:

- most seats can be represented by whole LGAs
- some seats split inside a single LGA and cannot be modeled correctly with the current `constituencyLgaIds` approach

If we fake those split seats as whole-LGA presets, we create bad political geography.

---

## Decision

WardWise now ships:

- all **safe whole-LGA HoR constituencies**
- no **split-LGA HoR constituencies**

This keeps the preset dropdown trustworthy while leaving room for later ward/RA precision.

---

## Source

Official workbook used:

- [INEC constituency workbook](https://www.inecnigeria.org/wp-content/uploads/2019/02/Name-of-Senatorial-DistrictsFederal-and-State-Constituencies-Nationwide-1.xls)

Sheet used:

- `FED. CONST.`

Counts:

- official HoR rows in workbook: `360`
- shipped safe presets: `350`
- intentionally unsupported split-LGA rows: `10`

---

## Unsupported Seats

These official HoR constituencies are intentionally excluded from the preset dropdown for now:

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

Reason:

- each one is defined as only **part of** a larger LGA area
- the current candidate boundary model only supports whole-LGA selection

---

## Files

| File                                                       | Role                                                       |
| ---------------------------------------------------------- | ---------------------------------------------------------- |
| `scripts/constituency-workbook-helpers.ts`                 | Shared INEC workbook parsing + name normalization helpers  |
| `scripts/rebuild-hor-presets.ts`                           | Generates safe HoR presets and unsupported split-seat list |
| `src/lib/data/nigerian-federal-constituencies.ts`          | Generated HoR preset data                                  |
| `src/lib/data/nigerian-constituencies.ts`                  | Runtime wrapper exposing Senator + HoR presets             |
| `src/components/admin/candidates/wizard/step-boundary.tsx` | Candidate create Step 3 preset / boundary UX               |
| `src/components/admin/candidates/candidate-overview.tsx`   | Candidate edit preset UX                                   |

---

## UX Notes

- HoR presets behave like Senator presets: choosing one auto-fills LGAs and the constituency name
- manual override is still allowed
- if manual LGA selection exactly matches an official HoR preset, the app does **not** show a false mismatch warning
- Lagos and Rivers now show an informational note that some official HoR seats are not yet available as presets because they require finer-grained boundaries

---

## Future Work

To support the excluded seats properly, WardWise will need:

1. ward-level or RA-level boundary modeling
2. preset definitions that can target part-of-LGA coverage
3. equivalent treatment for State Assembly constituencies

Until then, those seats remain manual-only by design.

---

## Summary

The HoR rollout is now in a safe state:

1. official workbook source is wired into generation
2. `350` trustworthy whole-LGA HoR presets are live
3. `10` split-LGA exceptions are clearly documented and intentionally excluded

That keeps the candidate boundary flow robust without pretending the current model can represent seats it actually cannot.
