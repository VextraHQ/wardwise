# WardWise App Architecture and Refactor Migration Plan

## Status

- **Source of truth for app structure** as WardWise moves from the current layered layout into a feature-first layout.
- **Phase-gated migration plan** for a large refactor. Do not move the whole app in one PR.
- **No compatibility shims** once a file is moved. Old files should be removed and all imports should be updated in the same PR.
- **Behavior-preserving by default.** A phase should not change product behavior unless that phase explicitly says so.
- **Single dedicated refactor branch.** Create a new branch for this architecture migration, then keep all phases on that same branch. Do not create a separate branch per phase or per review checkpoint.
- **Last updated:** 2026-05-13.

This document is meant to be readable by every contributor, including a developer joining the project for the first time.

---

## Why This Exists

WardWise has outgrown the early structure where most code lives under broad technical folders:

```text
src/
  app/
  components/
  hooks/
  lib/
  types/
```

That structure was fine while the app was smaller. It is now harder to answer simple questions like:

- Where does Collect live?
- Which files belong to campaign management?
- Which hooks are shared and which hooks are feature-specific?
- Is this `lib` file infrastructure, business logic, or API client code?
- What needs to change when a developer works on candidates, geo, or reporting?

WardWise now has several real product domains:

- public Collect registration
- admin Collect campaign management
- candidate management
- candidate dashboard
- geo management
- campaign reporting and insights
- authentication and account recovery
- public marketing/support/legal pages
- admin shell and internal command surfaces

The structure needs to make those domains obvious.

---

## Refactor Principles

### 1. Product domain first, technical type second

Prefer:

```text
features/collect/components/
features/collect/hooks/
features/collect/lib/
```

over:

```text
components/collect/
hooks/use-collect.ts
lib/collect/
```

This keeps the full feature in one place.

### 2. `app/` stays thin

`src/app` is owned by Next.js routing.

Use it for:

- route segments
- layouts
- pages
- metadata
- route handlers
- loading/error/not-found files

Avoid putting long-term business logic inside `app/`. Route files should compose feature code, not become the feature.

### 3. Shared by exception

Do not promote code to shared just because two files use it once.

Shared code must be:

- understandable without product-specific context
- used by multiple stable areas
- unlikely to become feature-specific again

### 4. No old compatibility files

When a file moves:

- remove the old file
- update every import
- verify no stale path remains

Do not leave files like this behind:

```ts
export { CampaignRegistrationForm } from "@/features/collect/components/public/campaign-registration-form";
```

Those shims hide the migration state and make the repo harder to trust.

### 5. No behavior changes in relocation PRs

Relocation PRs should change paths and imports only.

If a file also needs cleanup, split that into a later PR unless the cleanup is tiny and required by the move.

### 6. Review after every phase

Each phase needs:

- code review
- import review
- doc review
- typecheck/lint/test/build verification
- a short written summary of what moved and what did not move

### 7. Create folders when needed

The target tree below is a blueprint, not a requirement to create empty folders.

A small feature can start with:

```text
features/waitlist/
  components/
  server/
  schemas/
```

Add `hooks`, `api`, `lib`, or `types` only when the feature actually needs them.

---

## Target Top-Level Structure

```text
src/
  app/
  features/
  components/
  hooks/
  lib/
  types/
```

### `src/app`

Next.js route entrypoints only.

```text
src/app/
  page.tsx
  layout.tsx
  providers.tsx
  globals.css
  not-found.tsx
  error.tsx
  manifest.ts

  (auth)/
  (public)/
  (legal)/
  admin/
  (candidate)/
  c/[slug]/
  r/[token]/
  api/
```

### `src/features`

Product/domain-owned code.

```text
src/features/
  collect/
  candidates/
  candidate-dashboard/
  geo/
  reporting/
  auth/
  admin-shell/
  public-site/
```

Future examples:

```text
src/features/
  billing/
  notifications/
  team-members/
  audit-log/
  exports/
  party-dashboard/
  field-director-dashboard/
```

### `src/components`

Only global UI primitives and genuinely shared app components.

```text
src/components/
  ui/
  shared/
```

### `src/hooks`

Only truly generic shared hooks.

```text
src/hooks/
  shared/
    use-mobile.ts
    use-click-outside.ts
    use-wizard-draft.ts
```

### `src/lib`

App-wide infrastructure and services that are not feature-owned.

```text
src/lib/
  core/
  email/
  analytics/
  exports/
  constants/
  utils.ts
  date-format.ts
  date-ranges.ts
```

### `src/types`

Only broad app-wide types.

Feature types should move into `features/<feature>/types`.

---

## Full Target Feature Blueprint

This is the long-term structure WardWise should move toward.

Do not create empty folders just to match this tree.

```text
src/features/
  collect/
    components/
      public/
        campaign-registration-form.tsx
        campaign-availability-screen.tsx
        form-shell.tsx
        form-ui.tsx
        share-invite-card.tsx
        collect-connectivity-banner.tsx
        failed-review-sheet.tsx
        offline-prep-sheet.tsx
        registration-step-header.tsx
        steps/
          splash-screen.tsx
          role-step.tsx
          personal-details-step.tsx
          location-step.tsx
          party-info-step.tsx
          canvasser-step.tsx
          confirmation-screen.tsx
      admin/
        campaign-list.tsx
        campaign-detail.tsx
        campaign-overview.tsx
        campaign-settings.tsx
        campaign-canvassers.tsx
        campaign-submissions.tsx
        campaign-submissions-table.tsx
        campaign-submission-detail-sheet.tsx
        campaign-submissions-toolbar.tsx
        campaign-submissions-bulk-toolbar.tsx
        campaign-actions-menu.tsx
        campaign-overview-date-filter.tsx
        wizard/
          campaign-wizard.tsx
          step-candidate-setup.tsx
          step-campaign-collect-config.tsx
          step-campaign-review.tsx
    hooks/
      use-collect.ts
      use-collect-form-persistence.ts
      use-collect-geo-resolution.ts
      use-collect-offline-geo.ts
      use-collect-service-worker.ts
      use-collect-submission-lifecycle.ts
      use-offline.ts
    api/
      collect-api.ts
      admin-collect-api.ts
    server/
      get-public-campaign.ts
      submit-registration.ts
      build-offline-pack.ts
      get-campaign-submissions.ts
      update-campaign-submission.ts
      campaign-report-access.ts
      collect-reporting.ts
    schemas/
      collect-schemas.ts
      collect-schemas.test.ts
    lib/
      analytics.ts
      branding.ts
      campaign-health.ts
      campaign-submissions.ts
      offline-geo-health.ts
      offline-geo-health.test.ts
      offline-geo-pack.ts
      offline-prep-selection.ts
      offline-prep-selection.test.ts
      offline-storage.ts
      phone-input-utils.ts
      phone-input-utils.test.ts
      reporting.ts
      step-flow.ts
      submission-query.ts
      submission-query.test.ts
      validation.ts
    types/
      collect.types.ts
      campaign-submissions.types.ts

  candidates/
    components/
      candidate-management.tsx
      candidate-detail.tsx
      candidate-overview.tsx
      candidate-account.tsx
      candidate-campaigns.tsx
      create-candidate-form.tsx
      credentials-dialog.tsx
      wizard/
        step-identity.tsx
        step-position.tsx
        step-boundary.tsx
        step-review.tsx
    hooks/
      use-candidates.ts
    api/
      candidates-api.ts
    server/
      create-candidate.ts
      update-candidate.ts
      reset-candidate-password.ts
      candidate-directory.ts
    schemas/
      candidate-schemas.ts
      candidate-schemas.test.ts
    lib/
      candidate-collect-summaries.ts
      directory.ts
    types/
      candidate.types.ts
      canvasser.types.ts

  candidate-dashboard/
    components/
      candidate-shell.tsx
      candidate-sidebar.tsx
      site-header.tsx
      dashboard-content.tsx
      analytics-content.tsx
      supporters-content.tsx
      wards-content.tsx
      messages-content.tsx
      reports-content.tsx
      export-content.tsx
      settings-content.tsx
      notifications-content.tsx
      pricing-content.tsx
      section-cards.tsx
      data-table.tsx
      chart-area-interactive.tsx
      chart-patterns.tsx
    hooks/
      use-candidate-dashboard.ts
    api/
      candidate-dashboard-api.ts
    server/
      get-candidate-dashboard.ts
    lib/
      analytics.ts
    types/
      candidate-dashboard.types.ts

  geo/
    components/
      geo-management.tsx
      geo-breadcrumb.tsx
      geo-stats-bar.tsx
      geo-level-states.tsx
      geo-level-lgas.tsx
      geo-level-wards.tsx
      geo-level-polling-units.tsx
      dialogs/
        bulk-import-dialog.tsx
    hooks/
      use-geo.ts
    api/
      geo-api.ts
      location-api.ts
    server/
      constituency-server.ts
      import-geo-data.ts
    schemas/
      geo-schemas.ts
    lib/
      constituency.ts
      display.ts
    data/
      nigerian-constituencies.ts
      nigerian-federal-constituencies.ts
      nigerian-senatorial-districts.ts
      state-lga-locations.ts
      wards.ts
      polling-units.ts
    types/
      geo.types.ts
      location.types.ts

  reporting/
    components/
      campaign-insights.tsx
      campaign-insights-header.tsx
      insights-hero.tsx
      insights-overview.tsx
      insights-breakdown.tsx
      insights-geography.tsx
      insights-momentum.tsx
      insights-supporters.tsx
      insights-export-menu.tsx
      report-gate.tsx
      report-unavailable.tsx
      report-site-header.tsx
      report-site-layout.tsx
    hooks/
      use-campaign-report.ts
      use-campaign-insights-scope.ts
    api/
      campaign-report-api.ts
    server/
      report-access.ts
    lib/
      insights-helpers.tsx
    types/
      campaign-report.types.ts

  auth/
    components/
      auth-page-shell.tsx
      auth-card.tsx
      login-screen.tsx
      forgot-password-screen.tsx
      password-setup-screen.tsx
      confirm-email-change-screen.tsx
    api/
      auth-api.ts
    server/
      complete-password-setup.ts
      forgot-password.ts
      confirm-email-change.ts
    schemas/
      auth-schemas.ts
    lib/
      client.ts
      config.ts
      errors.ts
      errors.test.ts
      guards.ts
      guards.test.ts
      links.ts
      links.test.ts
      redirects.ts
      redirects.test.ts
      session.ts
      session.test.ts
      storage.ts

  admin-shell/
    components/
      admin-shell.tsx
      admin-sidebar.tsx
      admin-header.tsx
      admin-search-bar.tsx
      admin-command-strip.tsx
      admin-account.tsx
      admin-dashboard.tsx
      admin-dashboard-sections.tsx
      admin-dashboard-rows.tsx
      admin-skeletons.tsx
      admin-pagination.tsx
      account/
        email-card.tsx
        password-card.tsx
        profile-card.tsx
        support-cards.tsx
        ui.tsx
      filters/
        campaign-filters.tsx
        candidate-filters.tsx
      shared/
        admin-resource-state.tsx
        admin-mobile-record-card.tsx
        admin-toolbar-filter-sheet.tsx
        constituency-boundary-alerts.tsx
        lga-checkbox-grid.tsx
        list-or-custom-field.tsx
        official-constituency-selector.tsx
    hooks/
      use-admin.ts
    api/
      admin-api.ts
    lib/
      account.ts
    server/
      admin-dashboard.ts

  public-site/
    components/
      landing/
        hero.tsx
        header.tsx
        features.tsx
        collect-section.tsx
        platform-pillars.tsx
        how-it-works.tsx
        impact.tsx
        security.tsx
        cta-section.tsx
        footer.tsx
        scroll-to-top.tsx
      legal/
        legal-page-layout.tsx
        privacy-content.tsx
        terms-content.tsx
        cookies-content.tsx
        legal-footer.tsx
      support/
        public-support-layout.tsx
        support-content.tsx
        contact-content.tsx
        turnstile-widget.tsx
    schemas/
      contact-schemas.ts
      contact-schemas.test.ts
    server/
      submit-contact-form.ts
    lib/
      landing-data.ts
      contact-reasons.ts
      turnstile.ts
      turnstile.test.ts
```

---

## Current-to-Target Mapping

Use this table when reviewing migration PRs.

| Current location                                                                                                                | Target location                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/components/collect/*`                                                                                                      | `src/features/collect/components/public/*`                                                                                                       |
| `src/components/collect/steps/*`                                                                                                | `src/features/collect/components/public/steps/*`                                                                                                 |
| `src/components/admin/collect/*`                                                                                                | `src/features/collect/components/admin/*`                                                                                                        |
| `src/components/admin/collect/wizard/*`                                                                                         | `src/features/collect/components/admin/wizard/*`                                                                                                 |
| `src/hooks/use-collect*.ts`                                                                                                     | `src/features/collect/hooks/*`                                                                                                                   |
| `src/hooks/use-offline.ts`                                                                                                      | `src/features/collect/hooks/use-offline.ts` unless it becomes truly app-wide                                                                     |
| `src/lib/collect/*`                                                                                                             | `src/features/collect/lib/*`                                                                                                                     |
| `src/lib/api/collect.ts`                                                                                                        | `src/features/collect/api/collect-api.ts`                                                                                                        |
| `src/lib/schemas/collect-schemas.ts`                                                                                            | `src/features/collect/schemas/collect-schemas.ts`                                                                                                |
| `src/types/collect.ts`                                                                                                          | `src/features/collect/types/collect.types.ts`                                                                                                    |
| `src/types/campaign-submissions.ts`                                                                                             | `src/features/collect/types/campaign-submissions.types.ts`                                                                                       |
| `src/components/admin/candidates/*`                                                                                             | `src/features/candidates/components/*`                                                                                                           |
| `src/components/admin/candidates/wizard/*`                                                                                      | `src/features/candidates/components/wizard/*`                                                                                                    |
| `src/hooks/use-wizard-draft.ts`                                                                                                 | `src/hooks/shared/use-wizard-draft.ts` (resolved in Phase 4 — promoted to shared because both candidate and Collect campaign wizards consume it) |
| `src/lib/api/candidate.ts`                                                                                                      | `src/features/candidates/api/candidates-api.ts`                                                                                                  |
| `src/lib/schemas/admin-schemas.ts` candidate pieces                                                                             | `src/features/candidates/schemas/candidate-schemas.ts`                                                                                           |
| `src/types/candidate.ts`                                                                                                        | `src/features/candidates/types/candidate.types.ts`                                                                                               |
| `src/types/canvasser.ts`                                                                                                        | `src/features/candidates/types/canvasser.types.ts` or Collect if canvassers become Collect-owned                                                 |
| `src/components/candidate-dashboard/*`                                                                                          | `src/features/candidate-dashboard/components/*`                                                                                                  |
| `src/hooks/use-candidate-dashboard.ts`                                                                                          | `src/features/candidate-dashboard/hooks/use-candidate-dashboard.ts`                                                                              |
| `src/lib/api/candidate-dashboard.ts`                                                                                            | `src/features/candidate-dashboard/api/candidate-dashboard-api.ts`                                                                                |
| `src/lib/candidate/directory.ts`                                                                                                | `src/features/candidates/lib/directory.ts` (resolved in Phase 4 fixup — admin candidate API consumes it)                                         |
| `src/lib/candidate/analytics.ts`                                                                                                | `src/features/candidate-dashboard/lib/analytics.ts` (resolved in Phase 7)                                                                        |
| `src/components/admin/geo/*`                                                                                                    | `src/features/geo/components/*`                                                                                                                  |
| `src/hooks/use-geo.ts`                                                                                                          | `src/features/geo/hooks/use-geo.ts`                                                                                                              |
| `src/lib/api/geo.ts`                                                                                                            | `src/features/geo/api/geo-api.ts`                                                                                                                |
| `src/lib/api/location.ts`                                                                                                       | `src/features/geo/api/location-api.ts`                                                                                                           |
| `src/lib/geo/*`                                                                                                                 | `src/features/geo/lib/*` or `src/features/geo/server/*`                                                                                          |
| `src/lib/schemas/geo-schemas.ts`                                                                                                | `src/features/geo/schemas/geo-schemas.ts`                                                                                                        |
| `src/lib/data/nigerian-{constituencies,federal-constituencies,senatorial-districts,state-lga-locations,wards,polling-units}.ts` | `src/features/geo/data/*` (resolved in Phase 5)                                                                                                  |
| `src/lib/data/nigerian-parties.ts`                                                                                              | `src/features/candidates/data/nigerian-parties.ts` (resolved in Phase 5 fixup — Candidates is the sole consumer)                                 |
| `src/types/geo.ts`                                                                                                              | `src/features/geo/types/geo.types.ts` (resolved in Phase 5 fixup)                                                                                |
| `src/types/location.ts`                                                                                                         | `src/features/geo/types/location.types.ts` (resolved in Phase 5 fixup)                                                                           |
| `src/components/campaign-report/*.tsx` (excluding `insights-helpers.tsx`)                                                       | `src/features/reporting/components/*`                                                                                                            |
| `src/components/campaign-report/insights-helpers.tsx`                                                                           | `src/features/reporting/lib/insights-helpers.tsx` (kept `.tsx` extension — file exports JSX-returning helpers around the Badge primitive)        |
| `src/hooks/use-campaign-report.ts`                                                                                              | `src/features/reporting/hooks/use-campaign-report.ts`                                                                                            |
| `src/hooks/use-campaign-insights-scope.ts`                                                                                      | `src/features/reporting/hooks/use-campaign-insights-scope.ts`                                                                                    |
| `src/lib/api/campaign-report.ts`                                                                                                | `src/features/reporting/api/campaign-report-api.ts`                                                                                              |
| `src/lib/server/report-access.ts`                                                                                               | `src/features/reporting/server/report-access.ts`                                                                                                 |
| `src/lib/server/collect-reporting.ts`                                                                                           | `src/features/collect/server/collect-reporting.ts` (resolved in Phase 3 — Collect owns the shared reporting queries)                             |
| `src/types/campaign-report.ts`                                                                                                  | `src/features/reporting/types/campaign-report.types.ts`                                                                                          |
| `src/components/auth/*`                                                                                                         | `src/features/auth/components/*`                                                                                                                 |
| `src/components/auth/confirm-email-change-screen.tsx`                                                                           | `src/features/auth/components/confirm-email-change-screen.tsx`                                                                                   |
| `src/lib/auth/*`                                                                                                                | `src/features/auth/lib/*` unless the file is app-wide auth infrastructure                                                                        |
| `src/lib/schemas/auth-schemas.ts`                                                                                               | `src/features/auth/schemas/auth-schemas.ts`                                                                                                      |
| `src/components/admin/admin-*`                                                                                                  | `src/features/admin-shell/components/*`                                                                                                          |
| `src/components/admin/account/*`                                                                                                | `src/features/admin-shell/components/account/*`                                                                                                  |
| `src/components/admin/admin-filters/*`                                                                                          | `src/features/admin-shell/components/filters/*`                                                                                                  |
| `src/components/admin/shared/*`                                                                                                 | `src/features/admin-shell/components/shared/*` unless truly cross-feature                                                                        |
| `src/hooks/use-admin.ts`                                                                                                        | `src/features/admin-shell/hooks/use-admin.ts`                                                                                                    |
| `src/lib/admin/account.ts`                                                                                                      | `src/features/admin-shell/lib/account.ts`                                                                                                        |
| `src/lib/admin/dashboard.ts`                                                                                                    | `src/features/admin-shell/server/admin-dashboard.ts`                                                                                             |
| `src/components/landing/*`                                                                                                      | `src/features/public-site/components/landing/*`                                                                                                  |
| `src/components/legal/*`                                                                                                        | `src/features/public-site/components/legal/*`                                                                                                    |
| `src/components/public/*`                                                                                                       | `src/features/public-site/components/support/*`                                                                                                  |
| `src/lib/contact/*`                                                                                                             | `src/features/public-site/lib/*` or `src/features/public-site/server/*`                                                                          |
| `src/lib/schemas/contact-schemas.ts`                                                                                            | `src/features/public-site/schemas/contact-schemas.ts`                                                                                            |
| `src/lib/landing-data.ts`                                                                                                       | `src/features/public-site/lib/landing-data.ts`                                                                                                   |
| `src/components/layout/logo.tsx`                                                                                                | `src/components/shared/logo.tsx`                                                                                                                 |
| `src/components/layout/app-footer.tsx`                                                                                          | `src/components/shared/app-footer.tsx`                                                                                                           |
| `src/components/layout/cookie-consent.tsx`                                                                                      | `src/components/shared/cookie-consent.tsx`                                                                                                       |
| `src/components/system/*`                                                                                                       | `src/components/shared/*`                                                                                                                        |
| `src/components/ui/*`                                                                                                           | stays `src/components/ui/*`                                                                                                                      |
| `src/hooks/use-mobile.ts`                                                                                                       | `src/hooks/shared/use-mobile.ts`                                                                                                                 |
| `src/hooks/use-click-outside.ts`                                                                                                | `src/hooks/shared/use-click-outside.ts`                                                                                                          |
| `src/lib/core/*`                                                                                                                | stays `src/lib/core/*`                                                                                                                           |
| `src/lib/core/ip.ts`                                                                                                            | stays `src/lib/core/ip.ts`                                                                                                                       |
| `src/lib/email/*`                                                                                                               | stays `src/lib/email/*`                                                                                                                          |
| `src/lib/analytics/*`                                                                                                           | stays `src/lib/analytics/*`                                                                                                                      |
| `src/lib/exports/*`                                                                                                             | stays `src/lib/exports/*` until exports become a feature                                                                                         |

---

## Import Direction Rules

### Allowed

`app/*` may import from:

- `features/*`
- `components/ui`
- `components/shared`
- `hooks/shared`
- `lib/core`
- other app-wide `lib` services
- `types`

`features/*` may import from:

- the same feature
- `components/ui`
- `components/shared`
- `hooks/shared`
- `lib/core`
- app-wide `lib` services such as email or analytics when appropriate
- broad app-wide `types`

### Avoid

- one feature deep-importing another feature's private internals
- shared components importing feature code
- `components/ui` importing product code
- `lib/core` importing feature code
- broad barrels that hide ownership

If a feature needs to expose a stable cross-feature function, expose a deliberately named file rather than importing a random internal helper.

Good:

```ts
import { getCampaignDisplayHeadline } from "@/features/collect/lib/branding";
```

Risky:

```ts
import { getCampaignDisplayHeadline } from "@/features/collect/components/public/internal-card";
```

### Known intentional cross-feature surfaces

These are deliberate exceptions accepted during phased migration. They are not "private internal" imports — they treat one feature's public surface as a stable dependency for another. Revisit during Phase 9 documentation cleanup if any become painful.

- **Reporting → Collect (Phase 6).** `src/features/reporting/components/*` imports from `@/features/collect/lib/{reporting,branding}` (helper functions) and from `@/features/collect/components/public/{form-ui,share-invite-card,registration-step-header}` (visual primitives shared with the public registration shell). The lib imports are stable named cross-feature surfaces. The component imports are pragmatic — the public report intentionally mirrors the registration shell's look. If `form-ui` and friends start needing a Reporting-specific variant, promote the shared bits to `src/components/shared/` rather than forking.
- **Candidates → Geo (Phase 4 + 5).** Candidate schemas import `getPositionStateValidationMessage` from `@/features/geo/lib/constituency`; admin candidate components import geo data files (`state-lga-locations`, `nigerian-constituencies`, etc.). Geo is a domain support feature with intentionally public data and lib surfaces.

---

## Naming Rules

### Files

Use product-meaningful names.

Prefer:

- `campaign-registration-form.tsx`
- `offline-geo-health.ts`
- `campaign-submissions-table.tsx`
- `candidate-boundary-summary.tsx`

Avoid:

- `helpers.ts`
- `misc.ts`
- `shared.ts`
- `stuff.ts`
- `types.ts` inside large features unless the feature is still very small

### Hooks

Feature hooks should keep feature context in the name.

Examples:

- `use-collect-offline-geo`
- `use-candidate-dashboard`
- `use-campaign-insights-scope`

Shared hooks can use short names only when truly generic:

- `use-mobile`
- `use-click-outside`

### Tests

Colocate tests with the file they protect.

```text
offline-geo-health.ts
offline-geo-health.test.ts
```

---

## Migration Phases

All phases should happen on one dedicated architecture-refactor branch.

Each phase should still be reviewed as a checkpoint, but the checkpoint should happen through commits, PR updates, review comments, or internal review notes on the same branch. Do not open a new branch for every phase.

Recommended branch name:

```text
codex/feature-first-architecture
```

If the team prefers a different naming convention, use one equivalent dedicated branch and keep the whole migration there.

### Phase 0 - Architecture Control Document

Status: **in progress**

Goal:

- establish this document as the central source of truth
- agree on target structure
- agree on migration rules
- avoid moving code before the review process is clear

Scope:

- update `docs/wardwise-app-architecture-spec.md`
- do not move source files yet

Done when:

- this document is reviewed
- the team agrees on feature boundaries
- the first migration phase is selected

### Phase 1 - Prepare Guardrails

Goal:

- make future moves easier to review and less likely to break imports

Scope:

- add `src/features/` only when the first feature migration starts
- decide whether to add ESLint import boundary rules
- confirm path alias strategy stays `@/*`
- confirm shadcn still writes primitives to `src/components/ui`
- document review commands in `README.md` or `CLAUDE.md` if the team wants them visible there too

Do not:

- create empty feature folders for every future feature
- move product code yet unless this phase is combined with Phase 2 by explicit agreement

Done when:

- contributors know the import rules
- no code behavior has changed

### Phase 2 - Collect Pure Relocation

Goal:

- move Collect into a single feature home without changing behavior

Scope:

- `src/components/collect/*`
- `src/components/admin/collect/*`
- `src/hooks/use-collect*.ts`
- `src/hooks/use-offline.ts` if it is Collect-only
- `src/lib/collect/*`
- `src/lib/api/collect.ts`
- `src/lib/schemas/collect-schemas.ts`
- `src/types/collect.ts`
- `src/types/campaign-submissions.ts`

Expected target:

```text
src/features/collect/
  components/
  hooks/
  api/
  schemas/
  lib/
  types/
```

Rules:

- no old files left behind
- no re-export compatibility files
- update all imports in the same PR
- do not rewrite component internals unless required by the move

Review checks:

```bash
rg "@/components/collect|@/components/admin/collect|@/lib/collect|@/hooks/use-collect|@/hooks/use-offline|@/types/collect|@/types/campaign-submissions" src
pnpm exec tsc --noEmit --pretty false
pnpm test
pnpm build
```

### Phase 3 - Collect Route and Server Thinning

Goal:

- move Collect-specific route logic into Collect server modules

Scope examples:

- public campaign loading for `/c/[slug]`
- collect submit route orchestration
- offline pack route orchestration
- collect campaign admin route helpers

Expected target:

```text
src/features/collect/server/
```

Rules:

- keep route handlers thin
- add or adjust tests around pure server helpers where practical
- behavior should remain unchanged

Done when:

- `app/c/[slug]/page.tsx` primarily composes feature code
- `app/api/collect/*` delegates to feature server logic

### Phase 4 - Candidates Relocation

Goal:

- move candidate management into `features/candidates`

Scope:

- `src/components/admin/candidates/*`
- candidate wizard steps
- candidate API client
- candidate schemas currently inside admin schemas
- candidate-specific hooks
- candidate-specific types and directory helpers

Expected target:

```text
src/features/candidates/
  components/
  hooks/
  api/
  server/
  schemas/
  lib/
  types/
```

Special decision:

- decide whether `canvasser` belongs to `candidates` or `collect`
- if canvasser management is mostly campaign collection work, prefer `features/collect`

### Phase 5 - Geo Relocation

Goal:

- move geo management into `features/geo`

Scope:

- `src/components/admin/geo/*`
- `src/hooks/use-geo.ts`
- `src/lib/geo/*`
- `src/lib/api/geo.ts`
- `src/lib/api/location.ts`
- `src/lib/schemas/geo-schemas.ts`
- geo data files if they are not broadly shared

Expected target:

```text
src/features/geo/
  components/
  hooks/
  api/
  server/
  schemas/
  lib/
  data/
```

Special caution:

- large static data imports can affect bundles
- verify that moved geo data is not accidentally imported by client components that do not need it

### Phase 6 - Reporting Relocation

Goal:

- move campaign insights and report access into `features/reporting`

Scope:

- `src/components/campaign-report/*`
- `src/hooks/use-campaign-report.ts`
- `src/hooks/use-campaign-insights-scope.ts`
- `src/lib/api/campaign-report.ts`
- `src/lib/server/report-access.ts`
- `src/types/campaign-report.ts`

Note: `collect-reporting.ts` was relocated to `src/features/collect/server/` in Phase 3 (Collect owns the shared reporting queries); it is not part of Phase 6 scope.

Expected target:

```text
src/features/reporting/
  components/
  hooks/
  api/
  server/
  lib/
  types/
```

Special decision:

- if a reporting helper is truly Collect-specific, keep it in `features/collect`
- if it powers the client-facing report route, prefer `features/reporting`

### Phase 7 - Candidate Dashboard Relocation

Goal:

- move candidate-facing dashboard code into `features/candidate-dashboard`

Scope:

- `src/components/candidate-dashboard/*`
- `src/hooks/use-candidate-dashboard.ts`
- `src/lib/api/candidate-dashboard.ts`
- candidate dashboard analytics helpers

Expected target:

```text
src/features/candidate-dashboard/
  components/
  hooks/
  api/
  server/
  lib/
  types/
```

Done when:

- pages under `app/(candidate)/dashboard/*` import from `features/candidate-dashboard`

### Phase 8 - Auth, Admin Shell, and Public Site

Goal:

- move remaining domain UI out of global component folders

Scope:

- `src/components/auth/*` -> `features/auth/components`
- `src/lib/auth/*` -> `features/auth/lib` unless app-wide infrastructure
- `src/components/admin/admin-*` -> `features/admin-shell/components`
- `src/components/admin/account/*` -> `features/admin-shell/components/account`
- `src/components/admin/shared/*` -> `features/admin-shell/components/shared`
- `src/lib/admin/account.ts` -> `features/admin-shell/lib/account.ts`
- `src/components/landing/*` -> `features/public-site/components/landing`
- `src/components/legal/*` -> `features/public-site/components/legal`
- `src/components/public/*` -> `features/public-site/components/support`

Done when:

- `src/components` contains only `ui` and `shared`
- feature-specific hooks are no longer in root `src/hooks`
- feature-specific logic is no longer in broad root `src/lib`

### Phase 9 - Documentation Alignment Sweep

Goal:

- update every doc to match the new architecture

Scope:

- `README.md`
- `CLAUDE.md`
- `docs/wardwise-collect-spec.md`
- `docs/wardwise-collect-v2-spec.md`
- `docs/collect-campaign-branding-spec.md`
- `docs/collect-candidate-geo-rethink.md`
- `docs/campaign-insights-spec.md`
- `docs/geo-management-spec.md`
- `docs/geo-canonical-seeding-plan.md`
- `docs/hor-canonical-rollout.md`
- `docs/adamawa-ward-pu-sync.md`
- `docs/wardwise-candidates-spec.md`
- `docs/auth-system-spec.md`
- `docs/admin-dashboard-command-center-spec.md`
- `docs/cockpit-design-system.md`
- `docs/wardwise-hardening-spec.md`
- `docs/codebase-review.md`
- `docs/prisma-neon-workflow.md`

Rules:

- current implementation paths must match the new structure
- historical notes can mention old paths only if clearly marked as historical
- examples and onboarding instructions must point to the current folders
- do not leave docs saying "components/collect" after Collect moves

Useful doc search commands:

```bash
rg "src/components|@/components|src/hooks|@/hooks|src/lib/collect|@/lib/collect|src/lib/schemas|@/lib/schemas|src/types|@/types" README.md CLAUDE.md docs
rg "components/collect|components/admin|components/campaign-report|components/candidate-dashboard|lib/collect|lib/geo|lib/auth|hooks/use-" README.md CLAUDE.md docs
```

---

## Per-Phase Definition of Done

Every migration PR must satisfy this checklist.

### Code

- moved files are removed from old locations
- no compatibility re-export files are left behind
- all imports compile through the new location
- route files stay thin or become thinner
- no unrelated formatting churn
- no unrelated refactors
- no behavior change unless explicitly listed in the PR

### Tests and checks

Run the strongest practical checks for the phase:

```bash
pnpm exec tsc --noEmit --pretty false
pnpm test
pnpm build
```

For smaller phases, also run targeted lint on changed files:

```bash
pnpm exec eslint <changed files>
```

### Search checks

Each phase must search for stale old paths.

Examples:

```bash
rg "@/components/collect|@/lib/collect|@/hooks/use-collect" src
rg "src/components/collect|src/lib/collect|src/hooks/use-collect" README.md CLAUDE.md docs
```

The expected result after a migration is either:

- no matches, or
- matches that are intentionally historical and clearly marked

### Documentation

For every phase:

- update this document's status if needed
- update the feature spec affected by that phase
- update onboarding docs if a new contributor would otherwise follow stale paths
- document any boundary decision that came up during the move

### Review summary

Each PR description should include:

- files moved
- files intentionally not moved
- behavior changes, ideally none
- verification commands run
- docs updated
- known follow-up phases

---

## Documentation Ownership Map

Use this map to avoid missing old docs.

| Domain              | Docs to update when moved                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Architecture        | `docs/wardwise-app-architecture-spec.md`, `README.md`, `CLAUDE.md`                                                                                     |
| Collect             | `docs/wardwise-collect-spec.md`, `docs/wardwise-collect-v2-spec.md`, `docs/collect-campaign-branding-spec.md`, `docs/collect-candidate-geo-rethink.md` |
| Candidates          | `docs/wardwise-candidates-spec.md`, `docs/auth-system-spec.md` when onboarding/auth paths are referenced                                               |
| Candidate dashboard | `docs/codebase-review.md`, dashboard-related sections in `README.md` and `CLAUDE.md`                                                                   |
| Geo                 | `docs/geo-management-spec.md`, `docs/geo-canonical-seeding-plan.md`, `docs/hor-canonical-rollout.md`, `docs/adamawa-ward-pu-sync.md`                   |
| Reporting           | `docs/campaign-insights-spec.md`, reporting sections in Collect docs                                                                                   |
| Admin shell         | `docs/admin-dashboard-command-center-spec.md`, `docs/cockpit-design-system.md`                                                                         |
| Auth                | `docs/auth-system-spec.md`, `docs/wardwise-hardening-spec.md`, `CLAUDE.md`                                                                             |
| Public site         | `README.md`, public/contact/support docs if created later                                                                                              |
| Infrastructure      | `docs/wardwise-hardening-spec.md`, `docs/prisma-neon-workflow.md`, `CLAUDE.md`                                                                         |

---

## How New Work Scales

### New public page

Route goes in `app`; product code goes in `features/public-site` unless it becomes a real product domain.

```text
src/app/(public)/pricing/page.tsx
src/features/public-site/components/pricing/pricing-page.tsx
```

If the page becomes a workflow with data, emails, admin review, or state, make it its own feature:

```text
src/features/waitlist/
src/features/referrals/
src/features/onboarding/
```

### New dashboard

Route group goes in `app`; dashboard code gets its own feature.

```text
src/app/(party)/dashboard/page.tsx
src/features/party-dashboard/
```

If dashboards share a domain, create a domain feature instead of duplicating logic:

```text
src/features/notifications/
src/features/billing/
src/features/team-members/
src/features/reporting/
```

### New shared UI primitive

Put it in:

```text
src/components/ui/
```

Only if it is design-system level and product-agnostic.

### New reusable product component

Put it in:

```text
src/components/shared/
```

Only if multiple stable features use it and it does not depend on one feature's internal types.

### New infrastructure helper

Put it in:

```text
src/lib/core/
```

Only if it is app-wide infrastructure, such as Prisma, metadata, audit, auth primitives, or rate limiting.

---

## Reviewer Checklist

Use this checklist for every migration PR.

### Structure

- Does each moved file now live in the correct feature?
- Are old files deleted?
- Are there no compatibility shims?
- Is `src/components` closer to only `ui` and `shared`?
- Is `src/hooks` closer to only `shared`?
- Is `src/lib` closer to only infrastructure and app-wide services?

### Imports

- Are imports updated to the new paths?
- Are there stale docs or code references to old paths?
- Is any feature importing another feature's private internals?
- Are shared folders free from feature imports?

### Behavior

- Is the PR behavior-preserving?
- If behavior changed, is it explicitly documented?
- Are route handlers still working?
- Are client/server boundaries still valid?

### Verification

- Did typecheck pass?
- Did tests pass?
- Did build pass?
- Was targeted lint run on changed files?
- Were stale-path `rg` searches run?

### Documentation

- Did the affected feature spec get updated?
- Did onboarding docs get updated if needed?
- Does this architecture doc still reflect reality?

---

## Peer Review Workflow

For this refactor, a second reviewer is strongly recommended after each phase.

The reviewer can be another developer, Claude, Codex, or both. The important part is that the reviewer has a narrow job: verify the migration, not redesign the phase during review.

All peer review should happen against the same dedicated refactor branch. A review checkpoint can be tied to a commit range or PR update, but it should not create a new branch unless the team explicitly abandons and restarts the migration branch.

### Recommended workflow

1. Create or continue from the dedicated architecture-refactor branch.
2. Implement one phase as a focused commit or commit group.
3. Run the phase verification commands.
4. Ask the peer reviewer to check the phase against this document.
5. Fix review findings.
6. Re-run typecheck, tests, build, and stale-path searches.
7. Mark the phase clean before starting the next phase on the same branch.

### Reviewer should check

- moved files match the current-to-target mapping
- old files were removed
- no compatibility shims were left behind
- imports use the new paths
- docs no longer point to stale current paths
- app behavior is unchanged
- client/server boundaries are still valid
- feature code does not leak into `components/ui`, `components/shared`, `hooks/shared`, or `lib/core`

### Reviewer should avoid

- broad style rewrites
- opportunistic component redesigns
- renaming files outside the phase
- fixing unrelated bugs in the same PR
- moving a second feature while reviewing the first one

If the reviewer finds a bigger improvement, record it as a follow-up task unless it is required to make the current phase pass.

---

## Current Status Tracker

| Phase                                        | Status      | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 0 - Architecture Control Document      | Complete    | Doc reviewed; target structure and migration rules agreed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Phase 1 - Prepare Guardrails                 | Complete    | Import direction documented in `CLAUDE.md`. ESLint boundary plugin deferred until after the first vertical lands.                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Phase 2 - Collect Pure Relocation            | Complete    | Collect components, hooks, lib (incl. `offline-queue.ts`), api, schemas, and types now under `src/features/collect/`.                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Phase 3 - Collect Route and Server Thinning  | Complete    | `collect-reporting.{ts,test.ts}` now in `features/collect/server`; public Collect routes thinned via `getPublicCampaign`, `submitRegistration`, `buildOfflinePack`, and `getCampaignLgas` helpers.                                                                                                                                                                                                                                                                                                                                                                    |
| Phase 4 - Candidates Relocation              | Complete    | Admin candidate components, wizard, API, types, schemas, and `candidate-collect-summaries` now under `src/features/candidates/`. `use-wizard-draft` promoted to `src/hooks/shared/`. Legacy `Canvasser` stays with candidates; `CampaignCanvasser` already in Collect. `updateSubmissionSchema` folded into `features/collect/schemas/collect-schemas.ts` (Phase 2 cleanup).                                                                                                                                                                                          |
| Phase 5 - Geo Relocation                     | Complete    | Admin geo components, hook, lib (incl. `constituency-server` → `server/`), api (renamed `{geo,location}-api.ts`), schemas, types (`geo.types.ts`, `location.types.ts`), and 6 geo data files (`nigerian-{constituencies,federal-constituencies,senatorial-districts}`, `state-lga-locations`, `wards`, `polling-units`) now under `src/features/geo/`. `nigerian-parties.ts` moved to `src/features/candidates/data/` (Candidates is the sole consumer). Bundle composition preserved — file moves only, no barrel re-exports introduced.                             |
| Phase 6 - Reporting Relocation               | Complete    | 13 `campaign-report` components, `insights-helpers.tsx` (kept `.tsx` because JSX) into `features/reporting/lib`, 2 hooks, `campaign-report-api`, `report-access` server module, and `campaign-report.types.ts` now under `src/features/reporting/`. `collect-reporting.ts` correctly left in `features/collect/server` (Phase 3 ownership).                                                                                                                                                                                                                           |
| Phase 7 - Candidate Dashboard Relocation     | Complete    | 17 dashboard components, `use-candidate-dashboard` hook, `candidate-dashboard-api` (renamed), and `lib/analytics.ts` now under `src/features/candidate-dashboard/`. Cross-feature dep resolved up-front by inlining a local `getSupportersCount` helper in `features/candidates/lib/directory.ts` so candidates no longer reaches into candidate-dashboard's analytics module.                                                                                                                                                                                        |
| Phase 8 - Auth, Admin Shell, and Public Site | Next        | Move `components/auth/*`, `lib/auth/*` (keeping app-wide infra in `lib/core` if any), `components/admin/admin-*`, `account/`, `admin-filters/`, `shared/`, `use-admin`, `lib/admin/{account,dashboard}.ts`, `components/{landing,legal,public}/*`, `lib/contact/*`, `lib/schemas/contact-schemas.ts`, `lib/landing-data.ts`. Also promote `components/layout/{logo,app-footer,cookie-consent}` + `components/system/*` to `components/shared/`, and `hooks/{use-mobile,use-click-outside}` to `hooks/shared/`. Fold `src/types/voter.ts` once consumer audit is done. |
| Phase 9 - Documentation Alignment Sweep      | Not started | Final full-doc search and cleanup.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

---

## Immediate Next Todos

1. ~~Review and approve this architecture document.~~ (done)
2. ~~Create the dedicated architecture-refactor branch.~~ (done — `codex/feature-first-architecture`)
3. Keep every migration phase on that same branch.
4. ~~Decide whether Phase 1 should add ESLint import restrictions now or after the first migration.~~ (deferred until after a feature lands)
5. ~~Start Phase 2 with Collect as the first vertical slice.~~ (done)
6. Keep each phase behavior-preserving unless explicitly documented.
7. Run verification before every review checkpoint.
8. ~~Update Collect docs immediately after the Collect move.~~ (done)
9. ~~Start Phase 3 (Collect route and server thinning): move `src/lib/server/collect-reporting.{ts,test.ts}` and any orchestration in `src/app/api/collect/*` / `src/app/c/[slug]/` into `src/features/collect/server/`.~~ (done — `collect-reporting`, `submitRegistration`, `buildOfflinePack`, `getPublicCampaign`, `getCampaignLgas` helpers now own the orchestration)
10. ~~Start Phase 4 (Candidates relocation). Decide canvasser ownership (`candidates` vs `collect`) before moving so the canvasser model lands in the right feature.~~ (done — legacy `Canvasser` + `canvasser-schemas.ts` stay with candidates; `CampaignCanvasser` is already Collect-owned. `use-wizard-draft` promoted to `hooks/shared/` because both candidate and campaign wizards depend on it.)
11. ~~Start Phase 5 (Geo relocation). Move `src/components/admin/geo/*`, `use-geo`, `lib/geo/*`, geo API clients, schemas, and data files. Watch bundle impact for static geo data.~~ (done — all geo files now under `src/features/geo/`; CLI scripts and prisma seed files updated to new paths. Phase 5 fixup additionally moved `src/types/{geo,location}.ts` into `features/geo/types/` and relocated `nigerian-parties.ts` to `features/candidates/data/`.)
12. ~~Start Phase 6 (Reporting relocation). Move `src/components/campaign-report/*`, `use-campaign-report`, `use-campaign-insights-scope`, `lib/api/campaign-report.ts`, `lib/server/report-access.ts`, `src/types/campaign-report.ts` into `features/reporting/`.~~ (done — all reporting components, hooks, API, server module, and types now under `src/features/reporting/`. `insights-helpers.tsx` placed in `features/reporting/lib/` per spec while keeping the `.tsx` extension for its JSX exports.)
13. ~~Start Phase 7 (Candidate dashboard relocation). Move `src/components/candidate-dashboard/*`, `use-candidate-dashboard`, `lib/api/candidate-dashboard.ts`, and `src/lib/candidate/analytics.ts`. Resolve the `features/candidates/lib/directory.ts → analytics.ts` cross-feature dependency before completing the move.~~ (done — analytics now in `features/candidate-dashboard/lib/`; candidates' directory.ts holds a local `getSupportersCount` that reads `getVotersByCandidateId(id).length` directly.)
14. Start Phase 8 (Auth, Admin Shell, and Public Site). Move auth, admin-shell, and public-site components/hooks/lib/schemas. Also fold `src/types/voter.ts` to its rightful feature (likely candidate-dashboard) once the consumer audit completes.

---

## Final Target

The migration is successful when:

- new developers can find a product area by opening `src/features`
- `src/components` contains only global UI and shared app components
- `src/hooks` contains only generic shared hooks
- `src/lib` contains infrastructure and app-wide services, not scattered product logic
- route files under `src/app` are thin
- docs point to the same structure as the codebase
- each phase has been reviewed and verified before the next one starts

That is the standard for this refactor.
