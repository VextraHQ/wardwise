# WardWise Production Hardening Spec

> Security, data integrity, and architecture hardening for production launch.
> Branch: `main` | Last updated: 2026-04-10
> Future changes: branch off `main` → `fix/<area>-*` or `feature/<area>-*`

---

## Status

### Completed Hardening Items

- [x] **Cascade deletes** — Candidate → User, Campaign, Submissions all cascade properly
- [x] **Centralized auth helper** — `requireAdmin()` replaces 24 manual auth checks
- [x] **Server route guard** — `src/proxy.ts` protects `/admin/*` and `/dashboard/*` at Edge
- [x] **Secure account lifecycle** — candidate setup and recovery now use one-time auth links instead of admin-shared passwords
- [x] **Server-side Zod validation** — Candidate create/update, Campaign create/update, Submission update all validated
- [x] **Rate limiting** — Upstash Redis on `/api/collect/submit` (10/min) and `/api/auth` (5/min)
- [x] **Geo validation** — Submit verifies pollingUnit → ward → LGA hierarchy
- [x] **Submission delete context** — Optional `?campaignId` param prevents cross-campaign deletes
- [x] **Audit logging** — DB table + utility for candidate CRUD, campaign CRUD, password reset, submission delete
- [x] **Environment template** — `.env.example` with all required vars documented

---

## Architecture Decisions

### Auth: NextAuth (kept)

NextAuth v4 with JWT strategy and Credentials provider. The production hardening pass keeps this stack, but upgrades it with secure setup/reset links, session-version checks, and a shared auth wrapper layer. No provider change is needed until the product genuinely needs org-managed auth.

For the current canonical auth flow, see `docs/auth-system-spec.md`.

**Canvasser mobile app** (Phase 3) will need a separate auth endpoint (`/api/auth/canvasser-login`) since NextAuth is web-only. NextAuth won't interfere with this.

### Rate Limiting: Upstash Redis

Chosen over in-memory because the app deploys to Vercel (serverless — no shared memory across instances). Falls back gracefully if `UPSTASH_REDIS_REST_URL` is not set (rate limiting simply disabled).

### Audit Log: DB Only (No UI)

`AuditLog` table records sensitive actions. No admin UI page yet — query via Prisma Studio or SQL. UI will be built as part of the admin Activity/Analytics pages in a future sprint.

---

## Key Files

| File                               | Purpose                                                   |
| ---------------------------------- | --------------------------------------------------------- |
| `src/lib/auth/links.ts`            | One-time invite/reset link lifecycle                      |
| `src/lib/auth/guards.ts`           | Shared auth wrapper layer (`requireAdmin()`, page guards) |
| `src/proxy.ts`                     | Server-side Edge route protection (Next.js 16 proxy)      |
| `src/lib/core/rate-limit.ts`       | Upstash rate limiters (submit + auth)                     |
| `src/lib/core/audit.ts`            | `logAudit()` fire-and-forget utility                      |
| `src/lib/schemas/admin-schemas.ts` | All Zod schemas (candidate, canvasser, campaign)          |
| `.env.example`                     | Environment variable template                             |

---

## Deferred Admin Features

| Feature                 | Priority | When                                 |
| ----------------------- | -------- | ------------------------------------ |
| Analytics page          | Medium   | After Collect generates data         |
| Activity / Audit log UI | Medium   | After audit data accumulates         |
| Admin profile page      | Low      | When multi-admin is relevant         |
| Admin settings page     | Low      | When there are configurable settings |

---

## Development Phases

| Phase                   | Focus                                                          | Status      |
| ----------------------- | -------------------------------------------------------------- | ----------- |
| 1 — Admin + Collect     | Admin side, candidate CRUD, Collect v1 launch                  | **Current** |
| 2 — Candidate Dashboard | Candidates log in, see their own data, multi-tenant groundwork | Next        |
| 3 — Canvasser App       | Mobile app, campaign manager roles, field operations           | Future      |

---

## Environment Variables

| Variable                   | Required | Purpose                             |
| -------------------------- | -------- | ----------------------------------- |
| `DATABASE_URL`             | Yes      | Neon pooled connection              |
| `DIRECT_URL`               | Yes      | Neon direct connection (migrations) |
| `NEXTAUTH_URL`             | Yes      | App URL for NextAuth                |
| `NEXTAUTH_SECRET`          | Yes      | JWT signing secret                  |
| `UPSTASH_REDIS_REST_URL`   | No       | Rate limiting (graceful fallback)   |
| `UPSTASH_REDIS_REST_TOKEN` | No       | Rate limiting (graceful fallback)   |
