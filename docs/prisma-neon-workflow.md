# Prisma + Neon Workflow

> Practical database workflow for this repo while we are still in the early `db push` phase.
> Last updated: 2026-04-09

---

## Quick Answer

- **Yes**, your local app and production app should point to **different databases**.
- **No**, pushing code to GitHub does **not** change the database.
- **Yes**, Prisma commands such as `db push` need database env vars available to the Prisma CLI.
- In this repo, the safest current setup is:
  - **local machine** -> `dev` database
  - **Vercel production** -> `prod` database

---

## The Core Mental Model

There are **4 different things** involved:

1. **App code**
   - Next.js, React, API routes, components
   - Tracked by Git

2. **Prisma schema**
   - [`prisma/schema.prisma`](/Users/nabeelhassan/Desktop/wardwise-demo/prisma/schema.prisma)
   - Also tracked by Git

3. **Database**
   - The actual Postgres/Neon tables and data
   - Not changed by Git

4. **Prisma command**
   - This is what actually changes a database
   - Examples:
     - `pnpm prisma generate`
     - `pnpm db:push`
     - `pnpm db:migrate`
     - `pnpm db:migrate:deploy`

### Important Rule

**Git push does not update the database.**

Database changes only happen when you run a Prisma command against a specific database.

---

## Why `db push` Did Not See `.env.local`

This is the confusing part, and it is normal.

- **Next.js app** loads `.env.local`
- **Prisma CLI** usually expects vars in:
  - process environment
  - root `.env`
  - sometimes `prisma/.env`

So your app can run fine with `.env.local`, while `pnpm db:push` still fails because Prisma cannot see `DATABASE_URL` and `DIRECT_URL`.

### Easiest Fix

Keep the same local dev DB URLs in **both**:

- `.env.local` -> for the app
- `.env` -> for Prisma CLI

Do **not** commit either one.

### Alternative

Instead of creating `.env`, you can source `.env.local` before a Prisma command:

```bash
set -a
source .env.local
set +a
pnpm db:push
```

This works, but having a root `.env` is usually easier for day-to-day development.

---

## Recommended Environment Setup

### Development

- Local app on your laptop
- Points to a **dev Neon database**

Files:

- `.env.local`
- `.env`

Both should point to the same **dev** DB.

### Production

- Vercel app
- Points to the **prod Neon database**

Configured in:

- Vercel Project Settings -> Environment Variables

Production should **not** use your local `.env.local`.

---

## Best Setup For This Repo Right Now

This repo currently has:

- Prisma scripts in [`package.json`](/Users/nabeelhassan/Desktop/wardwise-demo/package.json)
- **no committed `prisma/migrations/` directory**

That means the repo is effectively still in a **`db push` phase**, even though migration scripts exist.

### Recommended Current State

Use:

- `wardwise-prod` -> current live DB
- `wardwise-dev` -> separate dev/testing DB

Then:

- local `.env.local` + `.env` -> `wardwise-dev`
- Vercel env vars -> `wardwise-prod`

---

## Commands In This Repo

From [`package.json`](/Users/nabeelhassan/Desktop/wardwise-demo/package.json):

- `pnpm prisma generate`
  - Regenerates Prisma client/types after schema changes

- `pnpm db:push`
  - Pushes the schema directly into the target DB
  - Fast
  - No migration files

- `pnpm db:migrate`
  - Creates and applies a migration in development

- `pnpm db:migrate:deploy`
  - Applies committed migrations to production/staging

- `pnpm db:seed`
  - Seeds demo candidates/users from [`prisma/seed.ts`](/Users/nabeelhassan/Desktop/wardwise-demo/prisma/seed.ts)

- `pnpm db:seed:geo-core`
  - Seeds canonical state/LGA records

- `pnpm db:sync:adamawa-geo`
  - Syncs Adamawa wards/polling units

---

## Safe Workflow Right Now

While we are still using `db push`, use this workflow:

1. Change code
2. Change [`prisma/schema.prisma`](/Users/nabeelhassan/Desktop/wardwise-demo/prisma/schema.prisma) if needed
3. Run:

```bash
pnpm prisma generate
pnpm db:push
```

4. Test locally against the **dev** database
5. Push code to GitHub
6. Deploy app code when ready
7. Only update the **prod** database intentionally, as a separate step

### Important

You can safely push code to a **feature branch** before prod DB is updated.

But do **not** merge/deploy code that expects new DB columns until the target database has those columns.

Otherwise, runtime queries can fail.

---

## Can We Push The Branding Changes Already?

Yes, but with an important condition.

### Safe

- Commit the code
- Push to a branch
- Open a PR
- Continue testing on the **dev** DB

### Not Safe Yet

- Merge to the production branch
- Deploy to production

until the database schema change has been applied to the production DB too.

---

## How To Create A Dev Database

### Option A — Fresh Dev Database + Seed Data

Best if you want clean development data.

1. Create a new Neon database/project
2. Put its URLs in local `.env.local` and `.env`
3. Run:

```bash
pnpm prisma generate
pnpm db:push
pnpm db:seed
pnpm db:seed:geo-core
pnpm db:sync:adamawa-geo
```

This gives you:

- tables from the current Prisma schema
- demo users/candidates
- geo data needed for Collect testing

### Option B — Exact Clone Of Production

Best if you want dev to look exactly like production.

This is valid in testing, but be careful because it can copy real supporter data too.

Preferred ways:

1. **Neon clone / branch / copy workflow**
   - Use Neon’s database copy/branching features if available in your plan

2. **Postgres dump + restore**
   - Export prod
   - Restore into dev

Typical flow:

```bash
pg_dump "$PROD_DATABASE_URL" > prod.sql
psql "$DEV_DATABASE_URL" < prod.sql
```

After the clone:

- point local `.env.local` and `.env` to the **dev clone**
- do all Prisma work there

### Recommended Choice

For your current phase, an **exact clone into a separate dev DB** is fine.

That gives you:

- realistic testing data
- no risk of accidentally changing prod while developing

---

## Suggested Local File Setup

### `.env.local`

Use for the local app:

```bash
DATABASE_URL="dev-pooled-url"
DIRECT_URL="dev-direct-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
```

### `.env`

Use for Prisma CLI:

```bash
DATABASE_URL="dev-pooled-url"
DIRECT_URL="dev-direct-url"
```

Keep them aligned for development.

### Vercel Production Env Vars

Use:

- `DATABASE_URL="prod-pooled-url"`
- `DIRECT_URL="prod-direct-url"`

Do not point Vercel to the dev DB.

---

## Current Recommended Release Flow

### For Schema Changes Today

1. Update schema locally
2. Run `pnpm prisma generate`
3. Run `pnpm db:push` against **dev**
4. Test locally
5. Push code to a branch
6. When approved, update **prod DB** intentionally
7. Deploy code

### For Normal Code-Only Changes

1. Change code
2. Push branch
3. Deploy as usual

No Prisma command needed if the schema did not change.

---

## The Scalable Team Workflow Later

Once the project stabilizes, move to Prisma migrations.

### What Changes Then

Instead of `db push`, developers will usually do:

```bash
pnpm db:migrate --name some_change
```

That creates a real migration file in `prisma/migrations`.

Then teammates pull code and apply the same migration to their own dev DBs.

Production gets updated with:

```bash
pnpm db:migrate:deploy
```

### Why Teams Prefer This

- migration history is committed
- every schema change is versioned
- teammates stay in sync
- production updates are more predictable

---

## Best Migration Transition Plan For This Repo

Because this repo does not yet have a clean migration history, do **not** force migrations onto the current drifted database first.

Instead:

1. Separate `dev` and `prod` immediately
2. Keep using `db push` for a short time
3. When ready, create a **fresh clean dev database**
4. Run:

```bash
pnpm db:migrate --name init
```

5. Commit the new `prisma/migrations` folder
6. From then on, use migrations as the standard workflow

This is the cleanest way to become team-scalable.

---

## Rules To Keep You Safe

- Never run destructive Prisma reset commands against production
- Never use production as your day-to-day development database
- Always test schema changes in dev first
- Push code freely to branches, but only deploy schema-dependent code after the DB is updated
- Prefer additive schema changes first:
  - add nullable column
  - deploy
  - backfill
  - remove old column later

---

## Repo-Specific Bootstrap Commands

If you create a brand-new dev DB for this repo, this is the likely bootstrap order:

```bash
pnpm prisma generate
pnpm db:push
pnpm db:seed
pnpm db:seed:geo-core
pnpm db:sync:adamawa-geo
```

Use this if you want a clean seeded dev database instead of a full production clone.

---

## Bottom Line

For WardWise right now:

- keep the current DB as **prod**
- create a separate **dev** DB
- point local env files to **dev**
- use `db push` there while you are still iterating quickly
- push code to feature branches safely
- do not deploy schema-dependent changes until the production DB is updated too

That is the safest and most understandable path from where the repo is today.
