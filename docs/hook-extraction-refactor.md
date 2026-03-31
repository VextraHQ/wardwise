# Hook Extraction Refactor

> Extract all inline React Query calls from admin components into a dedicated `use-admin.ts` hook file.
> Created: 2026-03-31
> Branch: `main` — create `refactor/hook-extraction` before starting

---

## Summary

The candidate dashboard (`use-candidate-dashboard.ts`), collect module (`use-collect.ts`), and geo module (`use-geo.ts`) all follow the same clean pattern: every `useQuery` and `useMutation` call lives in a dedicated hook file under `src/hooks/`, and components import those hooks.

The **admin candidates** module does not follow this pattern. All queries and mutations are written inline inside component files. This creates duplication and makes cache invalidation harder to reason about.

---

## Full DRY Audit

### Duplicated query: `["admin", "candidates"]`

This exact query (same key, same API call, same `staleTime`, same `refetchOnWindowFocus`) appears in **two** components:

| Location        | File                          |
| --------------- | ----------------------------- |
| Inline query #1 | `admin-dashboard.tsx:36`      |
| Inline query #2 | `candidate-management.tsx:78` |

**Fix:** Extract to `useAdminCandidates()` in `use-admin.ts`. Both components import the same hook.

### Duplicated query: `["admin-campaigns"]`

This query appears as:

| Location           | File                                   | How                               |
| ------------------ | -------------------------------------- | --------------------------------- |
| Extracted hook ✓   | `use-collect.ts:71` → `useCampaigns()` | Proper hook, used by 1 component  |
| Inline duplicate ✗ | `admin-dashboard.tsx:43`               | Copy-pasted inline, same API call |

**Fix:** `admin-dashboard.tsx` should `import { useCampaigns } from "@/hooks/use-collect"` instead of re-writing the query inline.

### Remaining inline queries and mutations (not duplicated, but not extracted)

| File                           | Type     | Key / Action             | Used Elsewhere? |
| ------------------------------ | -------- | ------------------------ | --------------- |
| `candidate-account.tsx:70`     | Mutation | Delete candidate         | No — single use |
| `candidate-account.tsx:82`     | Mutation | Reset password           | No — single use |
| `candidate-account.tsx:94`     | Mutation | Update onboarding status | No — single use |
| `candidate-overview.tsx:135`   | Mutation | Update candidate profile | No — single use |
| `create-candidate-form.tsx:64` | Mutation | Create candidate         | No — single use |

These aren't duplicated today, but extracting them keeps the pattern consistent and prevents future drift.

### Already clean — no action needed

| Module              | File                                                      | Status                                                    |
| ------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| Collect             | `use-collect.ts`                                          | ✓ All 20 hooks extracted, all components import from here |
| Geo                 | `use-geo.ts`                                              | ✓ All 13 hooks extracted, all components import from here |
| Candidate Dashboard | `use-candidate-dashboard.ts`                              | ✓ All 6 hooks extracted, all components import from here  |
| Utilities           | `use-mobile.ts`, `use-click-outside.ts`, `use-offline.ts` | ✓ Clean                                                   |

### Query key consistency note

The codebase uses **two conventions** for query keys:

- **Flat strings:** `["admin-campaigns"]`, `["campaign-stats"]` — used in `use-collect.ts`
- **Hierarchical arrays:** `["admin", "geo", "lgas"]`, `["admin", "candidates"]` — used in `use-geo.ts` and admin components

The hierarchical approach is better because `invalidateQueries({ queryKey: ["admin", "geo"] })` wipes all geo caches in one call, and the admin header's `invalidateQueries({ queryKey: ["admin"] })` can refresh everything.

This is a future cleanup, not part of this refactor — but worth noting.

---

## Architecture: Flat `hooks/` Folder vs Feature Co-location

### Option A: Flat `hooks/` folder (current approach)

```
src/hooks/
  use-admin.ts
  use-candidate-dashboard.ts
  use-collect.ts
  use-geo.ts
  use-click-outside.ts
  use-mobile.ts
  use-offline.ts
```

**Used by:** Next.js projects, smaller-to-mid apps, most shadcn/ui starters.
**Pros:** Simple, predictable, easy to find hooks. Everything is in one place.
**Cons:** Doesn't scale past ~15 hook files. Can become a dumping ground.

### Option B: Feature co-located hooks

```
src/features/
  admin/
    hooks/
      use-admin.ts
    components/
      admin-dashboard.tsx
    api/
      admin.ts
  collect/
    hooks/
      use-collect.ts
    components/
      campaign-list.tsx
    api/
      collect.ts
  candidate-dashboard/
    hooks/
      use-candidate-dashboard.ts
    components/
      dashboard-content.tsx
```

**Used by:** Large monorepos, Next.js apps with 10+ feature domains (Vercel's commerce template, T3 stack at scale, enterprise codebases).
**Pros:** Perfect colocation — hooks live next to the components that use them. Scales to large teams.
**Cons:** More boilerplate. Requires strict conventions. Overkill for 4-5 feature modules.

### Option C: Grouped `hooks/` with subfolders (middle ground)

```
src/hooks/
  admin/
    use-candidates.ts
    use-dashboard.ts
  collect/
    use-campaigns.ts
    use-submissions.ts
  candidate-dashboard/
    use-dashboard.ts
  shared/
    use-click-outside.ts
    use-mobile.ts
    use-offline.ts
```

**Used by:** Mid-size apps that outgrow a flat folder but don't need a full feature reorganization.
**Pros:** Still one `hooks/` directory, but with internal structure. Easy mental model.
**Cons:** Import paths get a bit longer.

### Recommendation for WardWise

**Stay with Option A (flat `hooks/`) for now.** Here's why:

1. You have 4 domain modules (admin, collect, geo, candidate-dashboard) + 3 utilities = **7 files.** That's well within the manageable range for a flat folder.
2. Your app is a product with a small team, not a large company monorepo. Co-locating would add friction with no real benefit yet.
3. The naming convention (`use-admin.ts`, `use-collect.ts`, `use-geo.ts`) already groups by feature domain — the file name **is** the folder.

**When to reconsider:** If `hooks/` grows past ~12-15 files, or if you ever split into a monorepo with shared packages, move to Option B or C.

---

## Hooks To Create in `use-admin.ts`

| Hook Name                     | Type     | Source Component                        |
| ----------------------------- | -------- | --------------------------------------- |
| `useAdminCandidates()`        | Query    | Deduplicates 2 identical inline queries |
| `useDeleteCandidate()`        | Mutation | From `candidate-account.tsx`            |
| `useResetCandidatePassword()` | Mutation | From `candidate-account.tsx`            |
| `useUpdateCandidateStatus()`  | Mutation | From `candidate-account.tsx`            |
| `useUpdateCandidate()`        | Mutation | From `candidate-overview.tsx`           |
| `useCreateCandidate()`        | Mutation | From `create-candidate-form.tsx`        |

The `["admin-campaigns"]` inline query in `admin-dashboard.tsx` is **not** extracted — it should import the existing `useCampaigns()` from `use-collect.ts`.

---

## Implementation Plan

### Phase 1: Create `use-admin.ts` hook file

- [x] Create `src/hooks/use-admin.ts`
- [x] Extract `useAdminCandidates()` query hook (replaces both inline copies)
- [x] Extract all 5 mutation hooks with proper cache invalidation
- [x] Add concise 1-liner comments (same style as the rest of the hooks folder)

### Phase 2: Rewire admin components

- [x] `admin-dashboard.tsx` — replace inline candidates query with `useAdminCandidates()`, replace inline campaigns query with `useCampaigns()` from `use-collect.ts`
- [x] `candidate-management.tsx` — replace inline candidates query with `useAdminCandidates()`
- [x] `candidate-account.tsx` — replace 3 inline mutations with extracted hooks
- [x] `candidate-overview.tsx` — replace inline mutation with `useUpdateCandidate()`
- [x] `create-candidate-form.tsx` — replace inline mutation with `useCreateCandidate()`

### Phase 3: Validate

- [x] `pnpm build` passes with no errors
- [x] `pnpm lint` clean
- [x] Admin dashboard loads candidates + campaigns correctly
- [x] Candidate list page loads and filters correctly
- [x] Create candidate wizard works end-to-end
- [x] Edit candidate profile works
- [x] Reset password works
- [x] Delete candidate works
- [x] Status change works

---

## Design Decision: Hook owns invalidation, component owns UX

```ts
// In use-admin.ts — hook owns cache invalidation
export function useDeleteCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.candidates.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "candidates"] });
    },
  });
}

// In candidate-account.tsx — component owns UX side effects
const deleteMutation = useDeleteCandidate();
deleteMutation.mutate(candidate.id, {
  onSuccess: () => {
    toast.success("Deleted");
    router.push("/admin/candidates");
  },
});
```

This mirrors how `use-collect.ts` already works.

---

## Risk Assessment

| Risk                          | Severity | Mitigation                                              |
| ----------------------------- | -------- | ------------------------------------------------------- |
| Cache key mismatch            | Medium   | Copy exact keys from inline, don't reinvent             |
| `onSuccess` side effects lost | High     | Components keep UX callbacks via `.mutate()` second arg |
| Breaking status dropdown      | Low      | Straightforward extraction                              |
| Import churn                  | Low      | 5 component files, all in `admin/`                      |

---

## Files Changed

| File                                                        | Change                                  |
| ----------------------------------------------------------- | --------------------------------------- |
| `src/hooks/use-admin.ts`                                    | **NEW** — 1 query + 5 mutation hooks    |
| `src/components/admin/admin-dashboard.tsx`                  | Remove 2 inline queries, import hooks   |
| `src/components/admin/candidates/candidate-management.tsx`  | Remove 1 inline query, import hook      |
| `src/components/admin/candidates/candidate-account.tsx`     | Remove 3 inline mutations, import hooks |
| `src/components/admin/candidates/candidate-overview.tsx`    | Remove 1 inline mutation, import hook   |
| `src/components/admin/candidates/create-candidate-form.tsx` | Remove 1 inline mutation, import hook   |

Total: **1 new file**, **5 modified files**, **0 deleted files**.
