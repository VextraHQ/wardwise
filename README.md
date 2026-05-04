# WardWise

WardWise is a campaign intelligence and field operations platform built for political teams. It helps candidates, admins, and canvassers coordinate voter registration, manage campaign data, monitor ward-level coverage, and collect supporter information with polling-unit precision.

This repository contains the full-stack WardWise app: role-based dashboards, public campaign collection flows, Prisma-backed data models, transactional email hooks, analytics consent handling, and optional production hardening such as rate limiting and bot protection.

## Product Surface

- Candidate workspace for campaign analytics, supporter insights, ward coverage, and field visibility
- Admin workspace for candidate management, geographic data, campaign oversight, and submission review
- Public campaign collection pages for supporter registration and canvasser-friendly data capture
- Geographic hierarchy support for State -> LGA -> Ward -> Polling Unit
- Audit-friendly workflows for account, campaign, submission, and auth activity
- Optional email, analytics, bot protection, and rate-limit integrations

## Main Routes

- Landing page: marketing site and product overview
- Login: shared authentication entry point for admin and candidate users
- Candidate workspace: `/dashboard`
- Admin workspace: `/admin`
- Public collect form: `/c/[slug]`

## Tech Stack

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS 4
- Prisma ORM
- PostgreSQL
- NextAuth
- React Query
- Zod
- Radix UI + shadcn-style component patterns

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create your environment file

Copy `.env.example` to `.env` and fill in local development values:

```bash
cp .env.example .env
```

Minimum required values:

```env
DATABASE_URL=""
DIRECT_URL=""
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""
```

Optional integrations are also documented in `.env.example`, including email delivery, Turnstile, Upstash Redis, and PostHog.

For local secrets, use generated or development-only values. Do not reuse production credentials in local development.

### 3. Prepare the database

Push the schema to your development database:

```bash
pnpm db:push
```

Seed local demo data:

```bash
pnpm db:seed
```

### 4. Start the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Transactional email previews (optional)

To iterate on React Email templates in the browser (hot reload, separate from the Next app):

```bash
pnpm email:dev
```

Opens the preview UI at [http://localhost:3001](http://localhost:3001). Templates live under `src/lib/email/templates/`; dev fixtures under `src/lib/email/previews/`.

## Local Demo Access

The seed script creates local-only demo users for development and QA. Check `prisma/seed.ts` when you need the current seeded accounts.

Treat seeded credentials as disposable development data. They must never be reused for staging, production, or shared client demos.

## Useful Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm test
pnpm lint
pnpm typecheck
pnpm format
pnpm format:check
pnpm db:push
pnpm db:migrate
pnpm db:migrate:deploy
pnpm db:seed
pnpm db:studio
```

## Project Structure

```text
src/
  app/             Next.js routes, layouts, API routes, and role-based pages
  components/      UI and feature components for landing, admin, auth, collect, and dashboard flows
  hooks/           React hooks for admin, collect, geo, offline, and dashboard behavior
  lib/             API clients, schemas, helpers, mock data, auth, and shared utilities
  types/           Shared TypeScript types

prisma/
  schema.prisma    Database schema
  seed.ts          Demo data seeding

docs/
  Product, auth, geo, collect, design, and hardening notes
```

## Documentation

The `/docs` folder contains product and implementation notes for the team. Treat these files as internal working documentation unless they have been reviewed for external sharing.

## Security and Data Safety

- Keep `.env`, `.env.local`, database dumps, and production credentials out of git.
- Use `.env.example` for placeholders only.
- Do not commit real voter, supporter, campaign, contact, or analytics exports.
- Keep seed credentials local-only and rotate any credential that may have been copied into a shared channel.
- Prefer development databases for local work; production data should only be accessed through approved operational workflows.

## Notes

- Prisma client is generated automatically on install via `postinstall`
- Upstash Redis is optional; the app falls back gracefully when rate-limit env vars are not set
- PostHog analytics is optional and only starts after explicit cookie consent
- This project uses `pnpm` as the package manager

## Deployment

For production, configure environment variables in the deployment platform rather than committing them to the repo. At minimum, production needs a PostgreSQL database, a stable app URL, and a strong NextAuth secret.

Run production migrations before starting the app:

```bash
pnpm db:migrate:deploy
pnpm build
pnpm start
```

Before launch, confirm that demo credentials are disabled or changed, email delivery is configured, bot protection/rate limits are enabled where appropriate, and no real data exports are present in the repository.
