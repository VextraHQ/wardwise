# Constituency Architecture: Candidate-Driven Geo Scope

> Restructure how WardWise handles constituency and LGA data — candidate owns electoral identity, campaign inherits it.
> Branch: `develop` | Last updated: 2026-04-01
> See also: `wardwise-candidates-spec.md`, `wardwise-collect-spec.md`, `geo-management-spec.md`

---

## Status

- **Problem identified** — constituency is free text, geo entered twice, LGA filtering broken for multi-LGA constituencies
- **Implementation**: In progress on `develop` (2026-04-01)
- **Launch exception approved** — constituency candidates may be saved without LGAs when geo data is incomplete; campaign creation remains blocked until LGAs are defined
- **UX decision finalized** — candidate boundary selection uses a searchable checkbox grid, not a tag-style multi-select
- **Guardrails added** — suspiciously broad boundaries now show soft warnings; impossible state/LGA mismatches are blocked server-side

---

## Problem

Three issues stem from a data-model gap:

1. **Same geography entered twice** — candidate has free-text constituency/lga, campaign re-asks for the same info
2. **Campaign setup too complex** — admins must understand constituency types and manually select LGAs
3. **LGA filtering broken** — Boya (FUFORE/SONG) sees all 21 Adamawa LGAs instead of just Fufore and Song

### Root Cause

`Candidate` stores `constituency` and `lga` as free text. There's no structured link to the actual `Lga` database records. `Campaign` duplicates this info and adds its own `enabledLgaIds` — effectively making the admin define the candidate's geography from scratch every time they create a campaign.

---

## Design Principles

1. **Candidate owns electoral identity** — position, state, constituency boundary. Campaign inherits by default.
2. **Campaign should be lightweight** — select candidate + slug + optional questions. No re-entering geography.
3. **Geo scope must be explicit in data** — free text for display labels only. `constituencyLgaIds Int[]` on Candidate is the source of truth for which LGAs belong to a constituency.

---

## Architecture Decision: `Int[]` vs Join Table

Codex proposed a `CandidateCoverage` join table (`candidateId + lgaId`). We chose `constituencyLgaIds Int[]` on Candidate instead:

| Approach               | Pros                                                                               | Cons                                                   |
| ---------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `Int[]` array (chosen) | Consistent with existing `Campaign.enabledLgaIds`, simpler queries, no extra model | Can't attach per-LGA metadata                          |
| Join table             | More normalized, allows metadata                                                   | Extra model, extra queries, overkill for this use case |

The `Int[]` pattern is already proven in the codebase and sufficient for our needs.

### Precision Note

LGA-level boundaries are an approximation. Some State Assembly seats split within a single LGA at the ward level. LGA granularity covers ~95% of cases and is the right v1 choice. Ward-level precision is a future extension point — adding `constituencyWardIds Int[]` later requires no breaking changes to the existing model.

---

## Position → Scope Rules

| Position                 | State                 | LGA Selection                | Scope                                     |
| ------------------------ | --------------------- | ---------------------------- | ----------------------------------------- |
| President                | Optional (home state) | None                         | Nationwide — all seeded LGAs              |
| Governor                 | Required              | None                         | All LGAs in state                         |
| Senator                  | Required              | Multi-select from state LGAs | Selected LGAs define senatorial district  |
| House of Representatives | Required              | Multi-select from state LGAs | Selected LGAs define federal constituency |
| State Assembly           | Required              | Multi-select from state LGAs | Selected LGAs define state constituency   |

---

## UX Changes

### Candidate Creation (before → after)

**Before:** Position → State → type single LGA name (free text) → type constituency name (free text)

**After:** Position → State → searchable checkbox grid for constituency LGAs → constituency name auto-suggested (e.g., "Fufore/Song") with manual override for official labels like "Adamawa Central Senatorial District". States without seeded LGA data show a warning banner — candidate can be saved without LGAs and edited later.

Why checkbox grid instead of compact multi-select:

- Boundary definition is a high-trust admin task, not a casual tag picker
- Visibility matters more than compactness
- Reviewing all selected LGAs at once is safer for electoral geography
- Search is still available, but the selection stays visible and easier to audit

### Campaign Creation (before → after)

**Before (3 steps):**

1. Select candidate → re-enter title, constituency, constituency type → slug
2. LGA coverage — shows ALL state LGAs (broken)
3. Questions + review

**After (2 steps, then 3 steps from 2026-04):**

1. Select candidate → slug → read-only scope summary (inherited from candidate)
2. Collect configuration — custom questions + optional "Restrict to part of constituency" toggle
3. Review & create — read-only summary with section Edit + submit

_(Earlier geo-rethink shipped a 2-step variant: questions + restrict lived on one screen with inline review; see `wardwise-collect-spec.md` for the current 3-step UX.)_

### Public Form

**Before:** Voter sees all 21 Adamawa LGAs

**After:** Voter sees only Fufore and Song (or whichever LGAs belong to the candidate's constituency)

---

## Data Model Changes

### Candidate (add field)

```prisma
constituencyLgaIds Int[] @default([])
```

- Stores LGA IDs that define the constituency boundary
- Empty for President/Governor (scope is implicit)
- Expected for Senator/HoR/State Assembly (soft requirement — campaign API guard enforces before campaign creation)
- Old `lga` field kept but deprecated (backward compat)

### Campaign (no schema change)

- `enabledLgaIds` stays as-is — populated from `candidate.constituencyLgaIds` at creation time
- Optional "restrict" toggle in UI lets admin deselect LGAs from the inherited set; API stores the reduced array as `enabledLgaIds` — no new boolean field needed
- Restriction mode cannot submit an empty LGA list; admin must keep at least one LGA selected or turn restriction off to inherit the full constituency
- Campaign create and campaign update both enforce that `enabledLgaIds` must stay within the candidate's constituency boundary
- `constituency`, `constituencyType`, `candidateName`, `party` still denormalized (set server-side, not by admin form)

---

## Boundary Guardrails

The product still allows temporary flexibility for launch, but the following guardrails are now part of the intended behavior:

### Soft warnings (UI)

- **Boundary incomplete** — candidate saved without LGAs is allowed during rollout, but Collect stays blocked
- **Full-state coverage selected** — if a constituency position selects all LGAs in a state, show a warning because that is unusual for Senator / HoR / State Assembly
- **Very broad boundary** — if ~80% or more of a state's LGAs are selected, show a review warning
- **Custom constituency label** — if the typed constituency name differs from the current auto-suggested LGA combination, show an informational warning
- **Existing campaigns will not auto-sync** — editing a candidate boundary does not rewrite `enabledLgaIds` on already-created campaigns; campaign settings should expose an explicit reset-to-candidate-boundary action instead of silently changing live coverage

Warnings are advisory, not blocking, because the geo rollout is still in progress.

### Hard validation (API / schema)

- Candidate `constituencyLgaIds` are deduplicated and normalized before save
- Candidate `constituencyLgaIds` must belong to the selected `stateCode`
- Positions that do not use LGA-defined constituency scope (`President`, `Governor`) store `constituencyLgaIds = []`
- `Governor + FCT` is invalid in this flow
- `State Assembly + FCT` is invalid in this flow
- Campaign create and campaign update both reject LGAs outside the candidate boundary

---

## Data Flow

```
Candidate: name, party, [14, 15] (Fufore + Song IDs), "Fufore/Song" (auto-generated)
    ↓ (server inherits automatically at campaign creation)
Campaign: name, party, "Fufore/Song", "federal", [14, 15]
    ↓ (public API reads enabledLgaIds)
Public form: LGA dropdown shows Fufore and Song only
```

---

## Implementation Phases

### Phase 1: Schema + Shared Utilities

- [x] Add `constituencyLgaIds Int[]` to Candidate model (Prisma migration)
- [x] Extract `positionToConstituencyType()` helper to `src/features/geo/lib/constituency.ts`
- [x] Extract `LgaCheckboxGrid` shared component from existing `step-coverage-requirements.tsx`

### Phase 2: Candidate Creation — Add Boundary LGA Selection

- [x] Update `createCandidateSchema` — add `constituencyLgaIds`
- [x] Update admin candidate boundary step (`wizard/step-boundary.tsx`; LGA/boundary UI was split out of the earlier combined `step-position.tsx`) — replace single LGA dropdown with searchable checkbox-grid constituency picker. Electoral office / `position` remains in `wizard/step-position.tsx`.
- [x] Update candidate creation API — persist `constituencyLgaIds`
- [x] Update candidate detail page — display/edit constituency LGAs
- [x] Update `useCreateCandidate` and `useUpdateCandidate` hooks in `use-admin.ts`
- [x] Align candidate edit UX with candidate create UX (same state reset + constituency reset rules)

### Phase 3: Campaign Creation — Simplify to 2 Steps

- [x] Simplify `createCampaignSchema` — remove admin-entered constituency fields from the form, derive them server-side, keep `enabledLgaIds` as the stored coverage array
- [x] Update campaign creation API — derive `candidateName`, `party`, `constituency`, `constituencyType` from candidate; populate `enabledLgaIds` from `candidate.constituencyLgaIds` (or admin-restricted subset)
- [x] Add guard: constituency positions with empty `constituencyLgaIds` → 400 error
- [x] Simplify campaign wizard to 2 steps
- [x] Add "Restrict to part of constituency" advanced toggle
- [x] Delete `step-coverage-requirements.tsx`

### Phase 4: Validation

- [x] `pnpm tsc --noEmit` passes
- [x] `pnpm lint` passes
- [x] UX finalized: searchable checkbox grid used for candidate boundary selection; labels clarified ("Electoral Boundary", "Constituency LGAs")
- [x] Soft block: unseeded states show warning banner, candidate saveable without LGAs, campaign API guard enforces
- [x] Campaign restriction behavior tightened: empty restricted selection now shows validation message instead of silently inheriting all LGAs
- [x] Campaign PATCH guard added: updates cannot set LGAs outside the candidate boundary
- [x] Candidate boundary warnings added: incomplete, full-state, very broad, custom-name, existing-campaign drift
- [x] Candidate create/update validation tightened: constituency LGAs must belong to selected state; FCT invalid combos blocked
- [x] Create candidate (Senator) → select LGAs → constituency auto-generates
- [ ] Create campaign → inherits LGAs → public form shows correct scope
- [ ] Existing campaigns continue working unchanged

---

## Migration Strategy

- **Existing candidates**: `constituencyLgaIds` defaults to `[]`. Admin must edit candidate to add LGAs before creating new campaigns.
- **Existing campaigns**: Keep their `enabledLgaIds` as-is. No data migration.
- **Guard**: Campaign creation API returns 400 if candidate needs LGAs but has none — "Please add constituency LGAs to this candidate before creating a campaign."

---

## Temporary Launch Rule

- Candidate completeness is temporarily split into two stages:
- Stage 1: admin may save a constituency candidate without LGAs (regardless of whether the state has seeded geo data)
- Stage 2: collect campaign creation is blocked until constituency LGAs are defined

This exception is intentional for faster Collect launch. It allows admins to onboard candidates immediately and define constituency boundaries later. Should be removed once geo coverage is mature enough to make constituency LGAs mandatory at candidate creation time.

---

## Key Files

| File                                                                    | Role                                                                          |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `prisma/schema.prisma`                                                  | Candidate model — add `constituencyLgaIds`                                    |
| `src/features/geo/lib/constituency.ts`                                  | Shared helpers (position → type, warning rules, LGA name generation)          |
| `src/features/geo/server/constituency-server.ts`                        | Server-side constituency LGA normalization + state validation                 |
| `src/components/admin/shared/lga-checkbox-grid.tsx`                     | Shared searchable checkbox grid for candidate boundary + campaign restriction |
| `src/components/admin/shared/constituency-boundary-alerts.tsx`          | Reusable UI for soft warning banners                                          |
| `src/features/candidates/schemas/candidate-schemas.ts`                  | Candidate validation — add `constituencyLgaIds`                               |
| `src/features/collect/schemas/collect-schemas.ts`                       | Campaign validation — simplify                                                |
| `src/features/candidates/components/wizard/step-boundary.tsx`           | Candidate create Step 3: LGA boundary + presets                               |
| `src/features/candidates/components/wizard/step-review.tsx`             | Candidate create Step 4 — review + boundary warning summary                   |
| `src/features/candidates/components/candidate-overview.tsx`             | Candidate edit page — same boundary UX + warnings                             |
| `src/features/collect/components/admin/wizard/campaign-wizard.tsx`      | 3-step flow: candidate setup → collect config → review & create               |
| `src/features/collect/components/admin/wizard/step-candidate-setup.tsx` | Candidate scope summary + inherited boundary warnings                         |
| `src/app/api/admin/collect/campaigns/route.ts`                          | Server-side field derivation                                                  |
| `src/app/api/admin/candidates/route.ts`                                 | Candidate create validation + persistence                                     |
| `src/app/api/admin/candidates/[id]/route.ts`                            | Candidate update validation + persistence                                     |
| `src/hooks/use-admin.ts`                                                | Update candidate mutation hooks                                               |
