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

- **Auth**: All admin API routes use `requireAdmin()` from `src/lib/auth-helpers.ts` — never inline auth checks
- **Route protection**: `src/proxy.ts` (Next.js 16's Edge middleware, NOT `middleware.ts`)
- **Validation**: Zod schemas in `src/lib/schemas/admin-schemas.ts` (candidates, canvassers) and `src/lib/schemas/collect-schemas.ts` (campaigns, submissions), validated both client-side and server-side via `.safeParse()`
- **Audit logging**: `logAudit()` from `src/lib/audit.ts` on all sensitive operations (fire-and-forget)
- **Rate limiting**: `src/lib/core/rate-limit.ts` — Upstash Redis, null when env vars not set
- **Geo data**: Database-backed (Lga → Ward → PollingUnit), seeded via `prisma/seed-geo.ts`
- **State codes**: Always 2-letter codes (e.g., "AD" for Adamawa), never free-text names

### Database

- Transitioning to `prisma migrate dev` for production. Use migrations for schema changes going forward.
- Cascade deletes configured: Candidate → User, Candidate → Campaigns → Submissions
- Always run `pnpm db:generate` after schema changes

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
