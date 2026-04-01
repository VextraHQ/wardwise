# WardWise

WardWise is a campaign intelligence and field operations platform built for political teams. It helps candidates, admins, and canvassers coordinate voter registration, manage campaign data, monitor ward-level coverage, and collect supporter information with polling-unit precision.

This repo contains a full-stack Next.js application with role-based dashboards, public campaign registration flows, Prisma-backed data models, and optional rate limiting for production hardening.

## What the App Does

- Candidate dashboard for campaign analytics, supporter insights, ward coverage, and operational visibility
- Admin dashboard for candidate management, geo management, campaign oversight, and submission review
- Public campaign registration flow at `/c/[slug]` for collecting supporter data
- Canvasser-friendly data collection workflows with structured location capture
- Geographic hierarchy support for State -> LGA -> Ward -> Polling Unit
- Audit-friendly data handling with submission activity tracking and optional rate limiting

## Main Flows

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

## Local Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create your environment file

Copy `.env.example` to `.env` and set the required values:

```bash
cp .env.example .env
```

Required environment variables:

```env
DATABASE_URL=""
DIRECT_URL=""
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""
```

Optional:

```env
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

### 3. Push the database schema

```bash
pnpm db:push
```

### 4. Seed demo data

```bash
pnpm db:seed
```

### 5. Start the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Credentials

The seed script creates demo users you can use immediately.

Admin:

- Email: `admin@wardwise.ng`
- Password: `admin123`

Candidate accounts:

- Seeded candidate emails use the `@wardwise.ng` domain
- Password for seeded candidate accounts: `demo123`

Examples from the seed data include:

- `ahmadu.fintiri@wardwise.ng`
- `aishatu.binani@wardwise.ng`
- `bola.tinubu@wardwise.ng`
- `atiku.abubakar@wardwise.ng`

## Useful Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm format
pnpm db:push
pnpm db:migrate
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
  Product, branding, geo, collect, and hardening specs
```

## Documentation

The `/docs` folder contains product and implementation notes for the app, including:

- [collect-candidate-geo-rethink.md](docs/collect-candidate-geo-rethink.md)
- [geo-management-spec.md](docs/geo-management-spec.md)
- [wardwise-branding-spec.md](docs/wardwise-branding-spec.md)
- [wardwise-candidates-spec.md](docs/wardwise-candidates-spec.md)
- [wardwise-collect-spec.md](docs/wardwise-collect-spec.md)
- [wardwise-collect-v2-spec.md](docs/wardwise-collect-v2-spec.md)
- [wardwise-hardening-spec.md](docs/wardwise-hardening-spec.md)

## Notes

- Prisma client is generated automatically on install via `postinstall`
- Upstash Redis is optional; the app falls back gracefully when rate-limit env vars are not set
- This project uses `pnpm` as the package manager

## Deployment

For production, provide a PostgreSQL database, set the NextAuth secrets and app URL, then run:

```bash
pnpm build
pnpm start
```
