# WardWise Collect Campaign Branding Spec

> Narrow bridge for movement/team-branded Collect campaigns without introducing a new Organizations system.
> Branch: `develop` | Last updated: 2026-04-08
> Future changes: branch off `develop` → `feature/collect-branding-*`

---

## Overview

WardWise Collect is currently candidate-first: every campaign belongs to a `Candidate`, campaign setup starts from `candidateId`, and most Collect surfaces render `candidateName` directly.

That works for real candidates like Governor Fintiri, but it becomes awkward for state-level movement or team campaigns such as:

- `City Boy Movement Adamawa`
- `Fintiri Canvassers`

The geo model already supports these campaigns operationally through the Governor path (`Governor` + `Adamawa` = all Adamawa LGAs). The gap is not geography. The gap is branding.

This spec introduces a small campaign-level branding layer so a campaign can be branded as a movement or team while still using the existing candidate anchor underneath.

---

## Product Decision

### Do Now

- Keep using the existing `Governor` + `Adamawa` candidate path for statewide Adamawa campaigns.
- Ship a small campaign-branding feature next, so Collect surfaces can show a movement/team label instead of always showing the underlying candidate name.

### Do Not Do Yet

- No `Organization` or `Movement` model
- No new admin section
- No login/auth changes
- No change to campaign ownership rules
- No change to candidate onboarding/account creation flow

### Why This Is The Best Immediate Action

- It solves the real pain point: misleading campaign naming on Collect surfaces.
- It preserves the existing geo and campaign logic, which already works.
- It avoids a premature ownership refactor while still reducing future mess.
- It creates a clean upgrade path to a full org model later if demand proves it.

---

## Architecture Decision

Separate these concerns explicitly:

- `Candidate` = internal scope and campaign anchor
- `Campaign` = Collect workflow and submissions
- `Campaign branding` = what the campaign is called on public/admin Collect surfaces
- `Account/login` = later phase, separate concern

### Chosen Design

Add two fields to `Campaign`:

| Field          | Type                           | Purpose                                                                                    |
| -------------- | ------------------------------ | ------------------------------------------------------------------------------------------ |
| `brandingType` | `String @default("candidate")` | Describes how the campaign should be branded: `candidate`, `movement`, or `team`           |
| `displayName`  | `String?`                      | Optional campaign-facing label such as `City Boy Movement Adamawa` or `Fintiri Canvassers` |

### Effective Name Rule

All Collect-facing surfaces should use:

```ts
const effectiveCampaignName = campaign.displayName ?? campaign.candidateName;
```

This keeps the current candidate snapshot intact while allowing cleaner campaign branding.

### Why Not `ownerType` Yet

`ownerType` sounds like a true ownership model. That is not what this phase is doing. The campaign still belongs to a candidate. This feature changes presentation only, not domain ownership.

### Why Not A Full `Organization` Model Yet

A full org model would require:

- nullable/alternative foreign keys on `Campaign`
- branching across campaign create/update/detail flows
- new admin CRUD surfaces
- future permission decisions

That is valid later, but too heavy for the current need.

---

## Data Model And API Changes

### Prisma

Add to `Campaign`:

```prisma
brandingType String @default("candidate")
displayName  String?
```

`candidateId` remains required.

### Validation

Campaign create/update schemas should support:

- `brandingType`: `candidate | movement | team`
- `displayName`: optional when `brandingType = candidate`
- `displayName`: required and trimmed when `brandingType = movement` or `team`

### API Contract

Do not remove `candidateName`.

Return the new fields in campaign APIs:

- `brandingType`
- `displayName`

Collect clients should derive `effectiveCampaignName` from `displayName ?? candidateName`.

This keeps the change additive and low-risk.

---

## UX Behavior

### Campaign Creation

Keep candidate selection exactly as it is today.

Add a small "Campaign Branding" section to the campaign wizard:

- Branding type: `Candidate`, `Movement`, `Team`
- Display name: text input
- Default behavior:
  - `Candidate` selected
  - `displayName` empty
  - UI preview resolves to candidate name

Examples:

- Candidate anchor: `Ahmadu Umaru Fintiri`
- Branding type: `team`
- Display name: `Fintiri Canvassers`

Result:

- Campaign geography still comes from the Governor/Adamawa candidate anchor
- Public/admin Collect surfaces show `Fintiri Canvassers`

### Public Collect Surfaces

Update Collect-facing copy to use `effectiveCampaignName`:

- campaign metadata/title
- splash screen headline
- confirmation screen
- share/invite card text
- any user-facing header badge

When `brandingType !== candidate`, avoid copy that implies the label is a person. Use neutral phrasing like:

- `Supporter registration for {effectiveCampaignName}`
- `Join {effectiveCampaignName} on WardWise`

Avoid possessive copy like:

- `{candidateName}'s supporter registration`

### Admin Collect Surfaces

Update Collect-only admin views to use `effectiveCampaignName`:

- campaign list
- campaign detail
- campaign settings
- campaign wizard review/summary

Candidate admin remains unchanged. The underlying anchor still appears in candidate management because that is still the true system model in this phase.

---

## Scope Boundaries

### In Scope

- Campaign branding fields
- Collect public naming/copy
- Collect admin campaign naming/copy
- Additive schema and API changes only

### Out Of Scope

- Candidate management redesign
- Real movement/org ownership
- Multi-tenant permissions
- Self-service movement logins
- New organization/team admin pages
- Migration away from candidate-backed campaign scope

---

## Immediate Operations Guidance

Until this feature ships:

- create `Fintiri Canvassers` using `Governor` + `Adamawa`
- create `City Boy Movement Adamawa` using `Governor` + `Adamawa`
- treat the candidate record as an internal campaign anchor, not a finalized client-facing identity

Once this feature ships:

- existing campaigns can be updated with `brandingType` + `displayName`
- no geo migration is required
- no submission migration is required

---

## Rollout Plan

### Phase 0 — Immediate

- Continue using the Governor workaround for statewide Adamawa campaigns
- Do not build a new section or ownership model yet

### Phase 1 — Branding Bridge

- Add `brandingType` and `displayName` to `Campaign`
- Update schemas, API types, and campaign routes
- Update Collect public/admin naming surfaces to use `displayName ?? candidateName`

### Phase 2 — Account Decoupling

- Revisit whether candidate creation should always imply a user account
- Keep this as a separate problem from campaign presentation

### Phase 3 — Full Org Model Only If Needed

Build a first-class org/movement entity only when at least one of these becomes true:

- multiple movement/team clients need clean CRUD
- org-level reporting is needed
- org-managed login/permissions are needed
- campaign ownership must no longer depend on a candidate anchor

---

## Acceptance Criteria

- A statewide Adamawa campaign can still be created through a Governor candidate anchor with no geo regressions.
- A campaign can be labeled `Fintiri Canvassers` or `City Boy Movement Adamawa` without changing its geo behavior.
- Public Collect pages show `displayName` when present, otherwise fall back to `candidateName`.
- Collect admin campaign views show `displayName` when present, otherwise fall back to `candidateName`.
- Existing campaigns continue working unchanged without requiring backfill.
- Candidate management and auth flows remain untouched.

---

## Key Files

| File                                                | Purpose                                           |
| --------------------------------------------------- | ------------------------------------------------- |
| `prisma/schema.prisma`                              | Add campaign branding fields                      |
| `src/lib/schemas/collect-schemas.ts`                | Validate `brandingType` and `displayName`         |
| `src/app/api/admin/collect/campaigns/route.ts`      | Persist new fields on create                      |
| `src/app/api/admin/collect/campaigns/[id]/route.ts` | Persist new fields on update                      |
| `src/app/api/collect/campaign/[slug]/route.ts`      | Return branding fields to public form             |
| `src/components/admin/collect/*`                    | Show effective campaign name in Collect admin UI  |
| `src/components/collect/*`                          | Show effective campaign name in public Collect UI |

---

## Summary

The best move now is not a full organizations system. It is a small, additive campaign-branding bridge:

- keep the current candidate-backed scope model
- add campaign-facing branding fields
- use them only on Collect surfaces
- defer ownership, auth, and org CRUD until the product truly needs them

That gives WardWise a safer path: clean enough for client growth, small enough not to destabilize the current system.
