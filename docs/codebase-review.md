# WardWise Codebase Review

## Overview

| Metric                | Value                                                                             |
| --------------------- | --------------------------------------------------------------------------------- |
| **Stack**             | Next.js 16, React 19, TypeScript, Prisma, PostgreSQL, Tailwind v4, TanStack Query |
| **Source Files**      | 264 `.ts`/`.tsx` files                                                            |
| **Lines of Code**     | ~42,400                                                                           |
| **TypeScript Errors** | **0** ✅                                                                          |
| **Lint Errors**       | **0** ✅                                                                          |

---

## Category Ratings

### 1. Architecture & Project Structure — **8.5 / 10**

```
src/
├── app/           → Next.js App Router pages & API routes
├── components/    → Domain-scoped UI (admin/, collect/, landing/)
├── hooks/         → Dedicated TanStack Query hook files
├── lib/           → Business logic, schemas, API clients, utilities
└── types/         → Centralized TypeScript types
```

**Strengths:**

- **Clean layered architecture.** The codebase follows a clear `App Routes → Hooks → API Client → API Routes → Prisma` pipeline. Each layer has a single responsibility and data flows predictably through the stack.
- **Domain-scoped component organisation.** `components/admin/`, `components/collect/`, `components/landing/` — not dumped into one flat folder. Admin components further split into `candidates/`, `collect/`, `geo/`, `shared/`.
- **Dedicated hook layer.** React Query logic is fully extracted into `hooks/use-admin.ts`, `hooks/use-collect.ts`, `hooks/use-geo.ts` — not scattered across components. Each hook has a JSDoc comment explaining its purpose.
- **Client-side API abstraction** via `lib/api/admin.ts`, `lib/api/collect.ts`, `lib/api/geo.ts` — components never call `fetch()` directly.
- **Schema barrel file** (`lib/schemas/index.ts`) for clean imports.

**Areas for improvement:**

- Some schema duplication: `createCandidateSchema` / `updateCandidateSchema` share ~80% of their field definitions. Could use `.partial()` + `.extend()` pattern (already done for campaign schemas — should standardise).
- No `lib/api/` barrel file to match the schemas barrel.

---

### 2. Type Safety & TypeScript Usage — **9 / 10**

**Strengths:**

- **Zero TypeScript errors** with `strict: true` enabled — a strong signal of discipline.
- **Zod schemas as source of truth** for both client-side form validation and server-side API validation. The `z.infer<>` pattern is used consistently (`CreateCandidateFormValues`, `CreateCampaignData`, etc.).
- **Clean type exports** in `types/` — handwritten types that match API response shapes, with comments documenting enum values.
- **Server-specific schema derivation** — `serverSubmitSchema` extends the client schema with `.omit()` and `.extend()` for the slug, avoiding duplicated logic.
- **Consistent type-only imports** enforced via ESLint rule (`@typescript-eslint/consistent-type-imports`).

**Areas for improvement:**

- Some `Record<string, unknown>` escape hatches in mutation functions (e.g., `useCreateCampaign`, `useSubmitRegistration`). These bypass the type safety that Zod provides.
- The `transformCandidate` function uses `[key: string]: any` in the helper — worth tightening.
- The `Candidate["position"]` type is defined manually in `types/candidate.ts` and separately via `candidatePositionSchema` in the Zod schemas. Could reconcile into a single source.

---

### 3. Security — **7.5 / 10**

**Strengths:**

- **Server-side auth gating** via `requireAdmin()` helper on every admin API route, returning 401 early.
- **Middleware-based route protection** using `next-auth/middleware` `withAuth`.
- **bcrypt password hashing** with cost factor 12 — appropriate.
- **Rate limiting** on both form submissions (10/min) and auth attempts (5/min) via Upstash Redis, with graceful fallback if Redis isn't configured.
- **Zod validation on server side** — the POST handler for candidates parses with `.safeParse()` before touching the database.
- **Audit logging** — fire-and-forget `logAudit()` for critical admin actions. Plus `SubmissionAuditEntry` model for per-submission event trails.
- **Password generation** uses `crypto.randomInt()` (CSPRNG) — correct.
- **`poweredByHeader: false`** and console stripping in production.

**Areas for improvement:**

- **Credentials-only auth** (NextAuth v4) — no CSRF token rotation by default for credential-based flows; no account lockout after N failed attempts.
- `remotePatterns: [{ hostname: "**" }]` in `next.config.ts` allows **any** remote image host — potential for abuse in production.
- **No Content Security Policy** headers configured.
- The `onboardingStatus` field is now a Prisma enum, which prevents invalid auth-sensitive candidate states at the DB/schema level.

---

### 4. Data Layer & Database Design — **8 / 10**

**Strengths:**

- **Well-normalised schema** with proper foreign keys, cascading deletes, and composite unique constraints (`[campaignId, phone]`, `[name, stateCode]`).
- **Thoughtful indexing** — indexes on frequently queried columns (`campaignId`, `createdAt`, `lgaId`, `wardId`, `code`).
- **Prisma singleton** correctly implemented for dev hot-reload.
- **Audit trail** at two levels: global `AuditLog` for admin actions + `SubmissionAuditEntry` for per-record changes.
- **Offline-first support** via IndexedDB queue with smart retry logic (distinguishes permanent vs. transient failures).

**Areas for improvement:**

- Some string-based enums remain (`role`, campaign `status`, `constituencyType`). `onboardingStatus` has been promoted to a Prisma enum because it is now auth-sensitive.
- No `migrations/` directory visible — suggests `db push` is used in development, which is fine, but migration files should be committed before production.
- The `Voter` model appears to be a legacy model (with `canvasserCode` FK) that overlaps with the newer `CollectSubmission` model — potential confusion about which is the canonical data model.

---

### 5. Frontend Patterns & React Quality — **8.5 / 10**

**Strengths:**

- **"Always-On Shell" pattern** in admin layout — the sidebar/header render instantly while content loads independently. This is a documented architectural decision (comment block in `admin/layout.tsx`).
- **Proper React Query usage** — `staleTime` tuned per-query, `placeholderData: (prev) => prev` for paginated lists (smooth page transitions), `enabled` guards with `!!value`.
- **Memoised computed values** — `useMemo` for derived stats on the dashboard (totals, top positions, unique parties).
- **shadcn/ui component library** properly integrated with Radix primitives, CVA variants, and `cn()` utility.
- **Skeleton states** — dedicated `AdminSkeletons` component for loading states.

**Areas for improvement:**

- The admin layout uses `"use client"` with `useEffect` + `redirect()` for auth — this flashes content briefly before redirecting. A server component check or middleware redirect would be smoother.
- `admin-dashboard.tsx` at 427 lines is manageable but the stat cards are highly repetitive — could be extracted into a `<StatCard>` component.
- The `QueryClient` in providers has no configured `defaultOptions` — no global error handling, no default `staleTime`, no `retry` configuration.

---

### 6. Code Quality & Maintainability — **8.5 / 10**

**Strengths:**

- **Clean, readable code** with consistent naming conventions (camelCase functions, PascalCase components/types).
- **JSDoc comments on every hook** explaining what it does and when it's used.
- **Well-documented architectural decisions** (the "Always-On Shell" comment block, the "one-time only — never stored in plaintext" note on passwords).
- **Error handling is thorough** — the `apiCall` wrapper has specific handling for network errors, HTTP status codes, and JSON parse failures.
- **ESLint configuration is production-grade** — Prettier integration, consistent-type-imports, unused-var with underscore pattern.
- **`.env.example`** provided for onboarding.

**Areas for improvement:**

- **Debug console.logs in auth** (`🔐 Auth attempt:`, `👤 User found:`, etc.) — these should be behind a debug flag or removed, separate from the `removeConsole` production compiler flag.
- Several files use `react-icons/hi` while the project also has `@heroicons/react`, `@tabler/icons-react`, and `lucide-react` — four icon libraries is excessive.

---

### 7. Testing — **2 / 10**

> [!WARNING]
> **No test files exist anywhere in the project.** Zero unit tests, zero integration tests, zero end-to-end tests.

This is the single biggest gap in the codebase. At minimum, the following should be tested:

- **Zod schemas** — validation edge cases (Nigerian phone normalization, NIN/VIN validation)
- **API routes** — auth gating, CRUD operations, error responses
- **Utility functions** — `normalizeNigerianPhoneInput`, `validateApcOrNin`, constituency helpers
- **Critical user flows** — registration form submission, campaign creation

---

### 8. Performance & Optimization — **7.5 / 10**

**Strengths:**

- **Turbopack** enabled for development (`next dev --turbopack`).
- **Selective Prisma includes** — `CANDIDATE_INCLUDE` picks only the fields needed, not full model hydration.
- **Smart stale times** — geo data cached 10 min, campaigns 2 min, submissions 1 min, matching their expected change frequency.
- **`placeholderData`** for paginated queries eliminates layout shift during page navigation.
- **Offline queue** with IndexedDB for field workers in low-connectivity areas — real-world-aware engineering.

**Areas for improvement:**

- No `React.lazy()` / dynamic imports for heavy admin components — the entire admin bundle loads upfront.
- The `nigerian-constituencies.ts` (1,475 lines) and `state-lga-locations.ts` (1,022 lines) are static data files imported as modules — should be JSON files or loaded on-demand.
- No image optimization beyond Next.js defaults (no `sizes`, no explicit `priority` on hero images).

---

## Score Summary

| Category                 | Score        |
| ------------------------ | ------------ |
| Architecture & Structure | 8.5          |
| Type Safety              | 9.0          |
| Security                 | 7.5          |
| Data Layer               | 8.0          |
| Frontend Patterns        | 8.5          |
| Code Quality             | 8.5          |
| Testing                  | 2.0          |
| Performance              | 7.5          |
| **Weighted Overall**     | **7.5 / 10** |

---

## Verdict

> [!NOTE]
> This is a **well-architected, production-oriented codebase** that demonstrates strong engineering discipline in its layered architecture, type safety, schema-validated APIs, and real-world considerations like offline support and rate limiting. The zero TS errors / zero lint errors on ~42K lines is impressive.
>
> The architecture you've built — with dedicated hook layers, domain-scoped API clients, shared Zod schemas, and audit logging — is genuinely above-average for a project at this stage. The code reads cleanly and would be easy for another developer to pick up.
>
> The "always-on shell" pattern, the offline IndexedDB queue, and the Nigerian phone normalization show thoughtful, domain-aware engineering rather than generic CRUD scaffolding.

> [!IMPORTANT]
> **The biggest drag on the score is the complete absence of tests.** Adding even basic test coverage on your schemas, API routes, and utility functions would bump this into the high 8s. The other improvement areas (middleware placement, icon library consolidation, string-based enums) are minor relative to the overall quality.

### Priority Action Items

1. **Add tests** — start with Zod schema tests and API route integration tests (Vitest + MSW or similar)
2. **Tighten image remote patterns** — replace `hostname: "**"` with specific allowed domains
3. **Consolidate icon libraries** — pick one (lucide-react pairs best with shadcn/ui) and migrate
4. **Configure QueryClient defaults** — add global error handler, retry config, default staleTime
