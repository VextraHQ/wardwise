# WardWise App Architecture & Folder Structure Spec

## Status

- **Future-state reference** — this document defines the target app structure and architectural rules for WardWise as the product grows.
- **Not a rewrite mandate** — do not mass-move files just to satisfy this doc. Use it for new work, follow-up refactors, onboarding, and long-term consistency.
- **Migration style** — incremental, feature-by-feature, with behavior changes separated from large relocations whenever possible.

## Why This Exists

WardWise is now beyond the size where a flat `components/`, `hooks/`, and `lib/` layout stays effortless. The app serves multiple product surfaces:

- public Collect registration
- admin campaign management
- candidate/client reporting
- geo management and canonical data workflows
- authentication and account recovery

That means architecture needs to optimize for:

- **human readability**
- **discoverability for new engineers**
- **clear ownership boundaries**
- **safe refactors**
- **future monorepo readiness**

This doc is the answer to: "If WardWise keeps growing, where should things live, how should they be named, and how do we stop the repo from becoming hard to reason about?"

---

## Core Principles

### 1. Feature-first by default

If code exists mainly for one domain, it should live with that domain.

Examples:

- Collect-only logic belongs under `features/collect/*`
- Geo-only logic belongs under `features/geo/*`
- Candidate-only logic belongs under `features/candidates/*`

Do **not** promote something to shared space just because two files happen to reuse it today. Shared code should be the exception, not the default.

### 2. Shared-by-exception

Only place code in global shared folders when it is genuinely cross-feature and likely to stay that way.

Examples of truly shared code:

- design-system primitives
- app-wide infrastructure like Prisma and rate limiting
- generic hooks like click-outside or mobile detection
- field schemas reused across multiple surfaces

Examples that are **not** automatically shared:

- offline queue logic for Collect
- candidate-specific overview helpers
- geo-admin formatting helpers

### 3. Thin route files, thin page files

Next.js route handlers and page files should mostly:

- parse params
- call feature/server logic
- return UI or HTTP responses

They should not become the long-term home for business rules.

### 4. Human-readable beats clever DRY

WardWise should favor:

- obvious control flow
- explicit state transitions
- focused modules with one job

over:

- abstraction for its own sake
- giant helper layers
- "one mega component with many variants"

If a refactor makes the code drier but harder for a new engineer to follow, it is probably not worth it.

### 5. Boundaries should feel monorepo-ready

Even in a single repo, features should be organized as if they could one day become packages or isolated workspaces.

That means:

- minimal cross-feature reach-through
- stable import directions
- no shared layer importing feature internals
- feature code grouped so ownership is obvious

### 6. Migration must be incremental

Architecture cleanups should not block product delivery.

Rule of thumb:

- **new code** should follow the target structure immediately
- **old code** moves when touched for a real reason, or in isolated relocation PRs

---

## Target `src/` Shape

This is the intended future app structure:

```text
src/
  app/
    (public)/
      page.tsx
      c/[slug]/
      ...
    (admin)/
      admin/
      ...
    (candidate)/
      dashboard/
      ...
    api/
      auth/
      collect/
      admin/
      ...

  features/
    collect/
      components/
      hooks/
      lib/
      server/
      schemas/
      types/
    candidates/
      components/
      hooks/
      lib/
      server/
      schemas/
      types/
    geo/
      components/
      hooks/
      lib/
      server/
      schemas/
      types/
    auth/
      components/
      hooks/
      lib/
      server/
      schemas/
      types/
    reporting/
      components/
      hooks/
      lib/
      server/
      schemas/
      types/
    admin-shell/
      components/
      hooks/
      lib/

  components/
    ui/
    shared/

  hooks/
    shared/

  lib/
    core/
    schemas/

  types/
```

This structure creates three clear levels:

1. **feature-owned code**
2. **shared app code**
3. **framework entrypoints**

---

## What Each Top-Level Area Means

## `src/app/`

This stays Next.js-owned.

Use it for:

- App Router pages
- layouts
- route handlers
- route groups
- server entrypoints

Keep these files thin. They should compose feature code, not absorb it.

Good examples:

- `app/c/[slug]/page.tsx` loads campaign data and renders a feature component
- `app/api/collect/submit/route.ts` validates the request and delegates to a Collect server action

Bad examples:

- a route handler containing 250 lines of cross-cutting business logic
- a page file holding a feature's entire data pipeline

## `src/features/<feature>/`

This is the long-term home for domain code.

Each feature owns:

- UI specific to that feature
- feature hooks
- feature logic helpers
- feature server actions/services
- feature schemas/types

This should be the primary way new engineers navigate the app.

If a teammate asks "where does Collect live?" the answer should eventually be "inside `src/features/collect`."

## `src/components/ui/`

Design-system primitives and low-level reusable UI only.

Examples:

- button
- input
- sheet
- alert-dialog
- badge
- separator

No product business logic should live here.

## `src/components/shared/`

Reusable app-level components that are not design-system primitives and are not owned by a single feature.

Examples:

- date range filter used by multiple product surfaces
- shared status screens
- global navigation fragments

If a component becomes shared only by coincidence during a short refactor, leave it in the feature until that shared use is clearly stable.

## `src/hooks/shared/`

Generic hooks only.

Examples:

- `use-mobile`
- `use-click-outside`

Feature hooks should not live here.

## `src/lib/core/`

App-wide infrastructure and foundational utilities.

Examples:

- Prisma
- rate limiting
- environment helpers
- auth/session primitives
- audit infrastructure

This folder must stay feature-agnostic.

## `src/lib/schemas/`

Schemas that are truly cross-feature or are so foundational that keeping them at app-level is clearer than pushing them into a single feature.

Examples today:

- shared field schemas
- some auth/admin/collect schemas while the repo is still mid-migration

Long term, feature-local schemas can move into `features/<feature>/schemas/` where that improves ownership.

## `src/types/`

Only for truly broad app-wide types.

If a type exists only for one feature, it should prefer feature ownership.

---

## Recommended Feature Breakdown for WardWise

## `features/collect`

Owns:

- public registration flow
- Collect admin campaign management
- offline geo prep
- offline submission queue
- confirmation state machine
- failed review flow
- Collect reporting queries that are still domain-specific

Suggested internal structure:

```text
features/collect/
  components/
    campaign-registration-form.tsx
    collect-status-banners.tsx
    offline-prep-sheet.tsx
    failed-review-sheet.tsx
    steps/
  hooks/
    use-collect-offline-geo.ts
    use-collect-geo-resolution.ts
    use-collect-submission-sync.ts
    use-collect-failed-review.ts
  lib/
    branding.ts
    validation.ts
    offline-storage.ts
    offline-geo-pack.ts
    offline-submission-queue.ts
    offline-geo-health.ts
    offline-prep-selection.ts
  server/
    submit-registration.ts
    build-offline-pack.ts
    resolve-campaign-lgas.ts
  schemas/
  types/
```

## `features/candidates`

Owns:

- candidate CRUD
- candidate onboarding state
- candidate overview logic
- candidate-boundary editing helpers

This should include candidate-only hooks and lib files instead of leaving them scattered across root `hooks/` and admin components.

## `features/geo`

Owns:

- geo admin drill-down screens
- canonical data management
- geo sync helpers
- geo auditing and UI logic

This is a real bounded context in WardWise and should not be treated as a bag of random utilities.

## `features/auth`

Owns:

- login/recovery/reset UI
- auth-link generation helpers
- auth flows not used broadly enough to be core infra

Core auth infrastructure may still stay in `lib/core`, but feature behavior and screens belong together.

## `features/reporting`

Owns:

- campaign insights UI
- reporting filters and summary formatting
- read-only client-facing report logic

If reporting remains tightly tied to Collect, it can temporarily stay under Collect until it genuinely becomes its own domain. This doc leaves room for either path.

## `features/admin-shell`

Owns:

- admin layout shell
- admin nav
- admin global toolbar patterns
- admin-only visual scaffolding reused across features

This avoids putting every admin-specific shared component into unrelated feature folders.

---

## Naming Conventions

Naming needs to help humans, not just be technically valid.

## Hooks

### Feature hooks

Use feature-prefixed hook names:

- `use-collect-offline-geo`
- `use-collect-geo-resolution`
- `use-candidate-dashboard`
- `use-campaign-insights-scope`

If a hook is feature-specific, its name should say so.

### Shared hooks

Use short names only when truly generic:

- `use-mobile`
- `use-click-outside`

Avoid ambiguous names like:

- `use-offline`
- `use-data`
- `use-form-state`

unless the hook is truly app-wide.

## Logic files

Name logic files after the job they do, not generic buckets.

Prefer:

- `offline-geo-health.ts`
- `submission-query.ts`
- `resolve-campaign-lgas.ts`

Avoid:

- `helpers.ts`
- `utils.ts`
- `misc.ts`

unless the file is extremely small and tightly scoped inside a feature.

## Components

Component names should reflect product meaning.

Prefer:

- `failed-review-sheet.tsx`
- `offline-prep-sheet.tsx`
- `collect-status-banners.tsx`

Avoid names that only describe implementation:

- `alert-stack.tsx`
- `multi-banner.tsx`
- `generic-modal.tsx`

## Tests

Colocate tests with the files they protect whenever possible:

- `offline-geo-health.ts`
- `offline-geo-health.test.ts`

This is already a repo pattern and should stay the default.

---

## Import Direction Rules

These rules are the backbone of long-term maintainability.

## Allowed direction

- `app/*` can import from `features/*`, `components/shared`, `components/ui`, `hooks/shared`, `lib/core`, `lib/schemas`, and `types`
- `features/*` can import from:
  - their own feature
  - `components/ui`
  - `components/shared`
  - `hooks/shared`
  - `lib/core`
  - `lib/schemas` when truly shared
  - `types` when truly shared

## Disallowed direction

- `components/ui` must not import feature code
- `components/shared` must not import feature internals
- `hooks/shared` must not import feature code
- `lib/core` must not import feature code
- one feature should not deep-import random files from another feature

If cross-feature coordination is needed, expose a clear public surface rather than reaching into internals.

Good:

```ts
import { buildCollectReference } from "@/features/collect/lib/reference";
```

Bad:

```ts
import { something } from "@/features/collect/components/steps/internal-file";
```

## Barrel files

Do not create broad barrels just to shorten imports.

Allow a feature-level barrel only when:

- the public boundary is stable
- it reduces import sprawl
- it does not hide ownership

Avoid barrel trees that make it hard to find where code really lives.

---

## Human-Readable Code Rules

This section matters as much as folder layout.

## 1. One file, one main job

A file can coordinate more than one detail, but it should still feel like it has one clear responsibility.

Examples:

- a page orchestrates a screen
- a hook resolves one slice of derived state
- a helper computes one concept

When a file reads like two or three different jobs at once, split it.

## 2. Prefer explicit state machines

For user flows like Collect, keep important states obvious:

- `confirmed`
- `queued`
- `failed`
- `scope_invalid`

Do not hide critical product states inside overly generic helpers.

## 3. Extract pure logic before extracting orchestration

The safest refactors usually go in this order:

1. extract pure helper
2. test pure helper
3. extract hook around it if needed
4. move UI shell later if still necessary

That keeps behavior easier to verify.

## 4. Duplicate a little when it keeps meaning obvious

Small, local duplication is better than one reusable abstraction that collapses genuinely different product states into "just a variant."

This is especially true for:

- alerts
- confirmation states
- admin vs public flows

## 5. Comment invariants, not trivia

Good comments explain:

- why a state must not happen
- why a fallback exists
- why a helper cannot infer something from missing data

Bad comments narrate what the next line already says plainly.

---

## Recommended Refactor Strategy

WardWise should migrate toward this architecture in small, reviewable steps.

## Phase 1 — New code follows the target shape

Starting now:

- new feature-local logic should prefer feature folders
- new hooks should use feature-prefixed names
- new pure helpers should be colocated with feature code and tests

## Phase 2 — Collect becomes the first vertical slice

Collect is the best first migration target because:

- it is already large
- it has real bounded behavior
- it mixes public UI, admin UI, offline logic, and confirmation states
- it is now a product selling point

Good follow-up PRs:

- readability refactor of `campaign-registration-form.tsx`
- move more Collect-only files into a single Collect home
- create a clearer status/banner system

## Phase 3 — Geo, Candidates, and Reporting follow

Migrate the next-biggest domains one at a time.

Each migration PR should choose one of these scopes:

- pure relocation
- behavior cleanup
- readability refactor

Avoid combining all three when possible.

## Phase 4 — Thin route handlers and pages

As features stabilize:

- move route logic into `features/<feature>/server/*`
- keep route handlers thin
- keep page files focused on composition

## Phase 5 — Optional monorepo transition later

If WardWise grows into multiple apps or packages, the feature boundaries in this doc should make that move easier.

Examples of future package candidates:

- shared design system
- geo domain
- reporting
- candidate-facing dashboard

---

## Pull Request Guidelines for Architecture Work

These rules will save review time.

## 1. Separate behavior change from relocation when possible

Best:

- PR 1: fix offline bug
- PR 2: pure file move/rename

Acceptable:

- small rename inside a behavior PR when the file is newly introduced or the import change is trivial

## 2. Keep migrations feature-bounded

Avoid repo-wide "cleanups" that touch five unrelated domains at once.

Good:

- `refactor: thin collect registration orchestrator`

Bad:

- `cleanup: move hooks, libs, and components everywhere`

## 3. Update docs when conventions change

If a structural decision becomes intentional, record it.

At minimum update:

- this architecture doc
- the feature spec if affected
- `CLAUDE.md` if future contributors should follow it immediately

## 4. Prefer codemod-friendly naming

Avoid names that are too generic to search safely.

Feature-prefixed names are better because they:

- communicate ownership
- reduce collisions
- make grep-based refactors easier

---

## Working Defaults for the Team

If a teammate is unsure where something should go, use these defaults:

### Put it in the feature if:

- only one domain uses it
- the name needs domain context to make sense
- changing it would primarily affect one product area

### Put it in shared if:

- at least two stable features use it
- the code is understandable without product context
- future ownership is clearly cross-feature

### Extract a new file when:

- a file reads like multiple jobs
- a pure helper can be named clearly
- tests would become easier and faster

### Leave code where it is for now when:

- moving it would create a wide diff with little immediate value
- the feature is still in active churn
- the refactor would mix structural cleanup with risky behavior changes

---

## What Success Looks Like

When this architecture is working well, a new engineer should be able to:

1. identify a feature boundary quickly
2. find the relevant hook/component/helper without guesswork
3. understand which code is shared and which code is feature-owned
4. make a change without accidentally crossing app-wide boundaries
5. review a PR and understand whether it is a behavior change, a relocation, or both

That is the standard this doc is aiming for.

---

## Near-Term Recommendation

After the current offline PR lands, the next architectural cleanup should **not** be a repo-wide move. It should be a focused, human-readable Collect refactor:

- calm the Collect UX presentation
- thin `campaign-registration-form.tsx`
- keep state transitions explicit
- continue moving Collect toward a clear vertical slice

Collect is now the best place to prove this architecture before the rest of the app follows.
