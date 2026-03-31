# Constituency Architecture: Candidate-Driven Geo Scope

> Restructure how WardWise handles constituency and LGA data — candidate owns electoral identity, campaign inherits it.
> Branch: `develop` | Last updated: 2026-03-31
> See also: `wardwise-candidates-spec.md`, `wardwise-collect-spec.md`, `geo-management-spec.md`

---

## Status

- **Problem identified** — constituency is free text, geo entered twice, LGA filtering broken for multi-LGA constituencies
- **Implementation**: Planned (see phases below)

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

| Approach | Pros | Cons |
|----------|------|------|
| `Int[]` array (chosen) | Consistent with existing `Campaign.enabledLgaIds`, simpler queries, no extra model | Can't attach per-LGA metadata |
| Join table | More normalized, allows metadata | Extra model, extra queries, overkill for this use case |

The `Int[]` pattern is already proven in the codebase and sufficient for our needs.

### Precision Note

LGA-level boundaries are an approximation. Some State Assembly seats split within a single LGA at the ward level. LGA granularity covers ~95% of cases and is the right v1 choice. Ward-level precision is a future extension point — adding `constituencyWardIds Int[]` later requires no breaking changes to the existing model.

---

## Position → Scope Rules

| Position | State | LGA Selection | Scope |
|----------|-------|---------------|-------|
| President | Optional (home state) | None | Nationwide — all seeded LGAs |
| Governor | Required | None | All LGAs in state |
| Senator | Required | Multi-select from state LGAs | Selected LGAs define senatorial district |
| House of Representatives | Required | Multi-select from state LGAs | Selected LGAs define federal constituency |
| State Assembly | Required | Multi-select from state LGAs | Selected LGAs define state constituency |

---

## UX Changes

### Candidate Creation (before → after)

**Before:** Position → State → type single LGA name (free text) → type constituency name (free text)

**After:** Position → State → select LGAs from checkbox grid → constituency name auto-suggested (e.g., "Fufore/Song") with manual override for official labels like "Adamawa Central Senatorial District"

### Campaign Creation (before → after)

**Before (3 steps):**
1. Select candidate → re-enter title, constituency, constituency type → slug
2. LGA coverage — shows ALL state LGAs (broken)
3. Questions + review

**After (2 steps):**
1. Select candidate → slug → read-only scope summary (inherited from candidate)
2. Questions + review → optional "Restrict to part of constituency" toggle

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
- Required for Senator/HoR/State Assembly
- Old `lga` field kept but deprecated (backward compat)

### Campaign (no schema change)

- `enabledLgaIds` stays as-is — populated from `candidate.constituencyLgaIds` at creation time
- Optional "restrict" toggle in UI lets admin deselect LGAs from the inherited set; API stores the reduced array as `enabledLgaIds` — no new boolean field needed
- `constituency`, `constituencyType`, `candidateName`, `party` still denormalized (set server-side, not by admin form)

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

- [ ] Add `constituencyLgaIds Int[]` to Candidate model (Prisma migration)
- [ ] Extract `positionToConstituencyType()` helper to `src/lib/utils/constituency.ts`
- [ ] Extract `LgaCheckboxGrid` shared component from existing `step-coverage-requirements.tsx`

### Phase 2: Candidate Creation — Add LGA Multi-Select

- [ ] Update `createCandidateSchema` — add `constituencyLgaIds`, require non-empty for constituency positions
- [ ] Update `step-position.tsx` — replace single LGA dropdown with checkbox grid
- [ ] Update candidate creation API — persist `constituencyLgaIds`
- [ ] Update candidate detail page — display/edit constituency LGAs
- [ ] Update `useCreateCandidate` and `useUpdateCandidate` hooks in `use-admin.ts`

### Phase 3: Campaign Creation — Simplify to 2 Steps

- [ ] Simplify `createCampaignSchema` — remove admin-entered constituency fields from the form, derive them server-side, keep `enabledLgaIds` as the stored coverage array
- [ ] Update campaign creation API — derive `candidateName`, `party`, `constituency`, `constituencyType` from candidate; populate `enabledLgaIds` from `candidate.constituencyLgaIds` (or admin-restricted subset)
- [ ] Add guard: constituency positions with empty `constituencyLgaIds` → 400 error
- [ ] Simplify campaign wizard to 2 steps
- [ ] Add "Restrict to part of constituency" advanced toggle
- [ ] Delete `step-coverage-requirements.tsx`

### Phase 4: Validation

- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] Create candidate (Senator) → select LGAs → constituency auto-generates
- [ ] Create campaign → inherits LGAs → public form shows correct scope
- [ ] Existing campaigns continue working unchanged

---

## Migration Strategy

- **Existing candidates**: `constituencyLgaIds` defaults to `[]`. Admin must edit candidate to add LGAs before creating new campaigns.
- **Existing campaigns**: Keep their `enabledLgaIds` as-is. No data migration.
- **Guard**: Campaign creation API returns 400 if candidate needs LGAs but has none — "Please add constituency LGAs to this candidate before creating a campaign."

---

## Key Files

| File | Role |
|------|------|
| `prisma/schema.prisma` | Candidate model — add `constituencyLgaIds` |
| `src/lib/utils/constituency.ts` | Shared helpers (position → type, LGA name generation) |
| `src/components/admin/shared/lga-checkbox-grid.tsx` | Reusable LGA multi-select grid |
| `src/lib/schemas/admin-schemas.ts` | Candidate validation — add `constituencyLgaIds` |
| `src/lib/schemas/collect-schemas.ts` | Campaign validation — simplify |
| `src/components/admin/candidates/wizard/step-position.tsx` | Candidate LGA selection |
| `src/components/admin/collect/wizard/campaign-wizard.tsx` | Simplified 2-step flow |
| `src/app/api/admin/collect/campaigns/route.ts` | Server-side field derivation |
| `src/hooks/use-admin.ts` | Update candidate mutation hooks |
