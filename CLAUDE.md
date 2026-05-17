# WardWise

Political campaign management platform built by Vextra Limited for Nigerian elections.

## Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Database**: PostgreSQL (Neon) via Prisma ORM
- **Auth**: NextAuth v4 (JWT strategy, Credentials provider)
- **UI**: shadcn/ui + Tailwind CSS + Radix primitives
- **Rate Limiting**: Upstash Redis (graceful fallback when not configured)
- **Deployment**: Vercel (serverless)

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint
pnpm tsc --noEmit # Type check (no output)
pnpm db:migrate   # Run migrations (prod-ready schema changes)
pnpm db:push      # Quick schema push (prototyping only)
pnpm db:generate  # Regenerate Prisma client after schema changes
pnpm db:seed      # Seed candidates, users, canvassers, voters
pnpm email:dev    # React Email live preview (port 3001; run beside `pnpm dev` on 3000)
```

## Architecture

Three user types:

1. **Admin** (Vextra/Hassan) — `/admin/*` routes
2. **Candidates** — B2B clients, created by admin, dashboard at `/dashboard/*`
3. **Canvassers** — field operatives (mobile app planned, not web)

### Key Patterns

- **Auth**: All admin API routes use `requireAdmin()` from `src/features/auth/lib/guards.ts` — never inline auth checks
- **Route protection**: `src/proxy.ts` (Next.js 16's Edge middleware, NOT `middleware.ts`)
- **Validation**: Zod schemas live next to their feature: `src/features/candidates/schemas/{candidate,canvasser}-schemas.ts`, `src/features/collect/schemas/collect-schemas.ts` (campaigns + submission moderation), `src/features/admin-shell/schemas/admin-schemas.ts` (admin self-service profile/email/password), `src/features/auth/schemas/auth-schemas.ts`, `src/features/public-site/schemas/contact-schemas.ts`, `src/features/geo/schemas/geo-schemas.ts`. Field-level primitives (phone, email, NIN/VIN/APC) stay in `src/lib/schemas/field-schemas.ts`. All mutating routes validate via `.safeParse()` on both client and server.
- **Audit logging**: `logAudit()` from `src/lib/core/audit.ts` on all sensitive operations (fire-and-forget)
- **Rate limiting**: `src/lib/core/rate-limit.ts` — Upstash Redis, null when env vars not set
- **Geo data**: Database-backed (Lga → Ward → PollingUnit), seeded via `prisma/seed-geo.ts`
- **State codes**: Always 2-letter codes (e.g., "AD" for Adamawa), never free-text names

### Database

- Transitioning to `prisma migrate dev` for production. Use migrations for schema changes going forward.
- Cascade deletes configured: Candidate → User, Candidate → Campaigns → Submissions
- Always run `pnpm db:generate` after schema changes

### Feature-First Architecture

The codebase is laid out feature-first under `src/features/<feature>/` (collect, candidates, candidate-dashboard, geo, reporting, auth, admin-shell, public-site). See `docs/wardwise-app-architecture-spec.md` for the target structure, current-to-target mapping table, and per-phase migration history.

Import direction (enforced by convention until ESLint boundaries are added):

- `app/*` may import from `features/*`, `components/{ui,shared}`, `hooks/shared`, `lib/core`, app-wide `lib` services (`lib/email`, `lib/analytics`, `lib/exports`, etc.), and broad `types`.
- `features/*` may import from the same feature, `components/{ui,shared}`, `hooks/shared`, `lib/core`, and app-wide `lib` services. A feature must not deep-import another feature's private internals; if a cross-feature surface is needed, expose it from a deliberately named file (e.g. `features/collect/lib/branding.ts`).
- `components/ui`, `components/shared`, `hooks/shared`, and `lib/core` must not import feature code. They are feature-agnostic base layers; features depend on them, never the other way around.
- Path alias stays `@/*` → `./src/*`. shadcn primitives still land in `src/components/ui`.

When adding new code, prefer placing it inside the owning `src/features/<feature>/` tree. Promote to `components/shared`, `hooks/shared`, or `lib/core` only when the code is genuinely product-agnostic and used by multiple stable features.

`src/lib/email` is an intentional app-wide email service: provider wrapper, shared components, and the central React Email templates + previews directory. Domain-shaped email files (`account-welcome.ts`, `auth.ts`, the auth/admin templates) live here so the React Email preview workflow stays simple. Move an email module into a feature's own `email/` subfolder **only** when it would otherwise need to import feature internals — as `features/public-site/email/contact-email.ts` does for `contact-reasons`.

## Specs & Docs

Living specs in `docs/` — update these when making decisions or completing features. Create new spec docs for major new features when the user requests it (don't auto-create every chat).

- `docs/wardwise-collect-spec.md` — Collect v1 feature (complete, on main)
- `docs/wardwise-collect-v2-spec.md` — Collect v2 roadmap (filtered export, canvassers, bulk ops, PWA, offline geo prep)
- `docs/wardwise-candidates-spec.md` — Candidate management
- `docs/wardwise-hardening-spec.md` — Security & architecture decisions
- `docs/campaign-insights-spec.md` — Campaign insights / client report
- `docs/geo-management-spec.md` — Geo drill-down UI
- `docs/cockpit-design-system.md` — UI/UX design tokens
- `docs/admin-dashboard-command-center-spec.md` — Admin dashboard command-center redesign
- `docs/wardwise-app-architecture-spec.md` — Future app-wide folder structure and feature architecture

## Branch Convention

- `main` — production branch
- `fix/<area>-*` — bug fixes (e.g., `fix/collect-dedup-check`)
- `feature/<area>-*` — new features (e.g., `feature/candidates-bulk-import`)
- Keep branches short-lived and scoped to one change

## UI Conventions

- No redundant padding wrappers on shadcn components — they have their own padding
- Polished, professional UI — match the existing app theme, not generic defaults
- Semantic hardcoded colors (emerald for success, amber for warning, orange for alerts) stay as-is — don't replace with theme tokens
- INEC Code is the primary PU identifier — show it first, name is secondary

## Working Workflow

- For larger UI/product changes, read the relevant docs first, then implement against the spec/checklist.
- Keep implementation senior but simple: avoid overengineering, avoid broad abstractions, and only DRY repeated behavior that is clearly shared.
- Match loading skeletons to the final UI structure, not generic blocks.
- Use existing app patterns before creating new components, helpers, or folders.
- After each meaningful phase, summarize in beginner-friendly terms what changed and why.
- Verification should include formatting plus checks when code changes: `pnpm exec prettier --write <changed files>`, targeted `pnpm exec eslint <changed files>`, and `pnpm exec tsc --noEmit --pretty false`.
