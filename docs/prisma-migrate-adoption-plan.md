# Prisma Migrate Adoption Plan

> Repo-specific plan for moving WardWise from ad hoc `db push` changes to a proper Prisma Migrate workflow.
> Last updated: 2026-05-13

---

## Why This Exists

WardWise now has:

- a separate Neon `dev` branch
- a separate Neon `prod` branch
- real schema changes already happening in the app

What we do **not** have yet is a committed Prisma migration history.

That means the next job is not another feature. The next job is to turn our current schema into a safe, repeatable workflow so that:

- local development stays on `dev`
- production stays on `prod`
- schema changes move forward through migration files
- nobody has to keep switching their everyday local env between dev and prod

---

## Current State

As of now:

- [`prisma/schema.prisma`](/Users/nabeelhassan/Desktop/wardwise-demo/prisma/schema.prisma) is the source of truth for the intended schema
- [`package.json`](/Users/nabeelhassan/Desktop/wardwise-demo/package.json) already includes both `db:push` and Prisma Migrate scripts
- the repo has **no committed** `prisma/migrations/` directory yet
- local development should point to the Neon `dev` branch
- production hosting should point to the Neon `prod` branch
- the branding change (`Campaign.brandingType`, `Campaign.displayName`) is the first schema change we want to carry through the proper migration flow

---

## Target End State

We want WardWise to end up here:

```mermaid
flowchart LR
  A["Local code + schema.prisma"] --> B["Neon dev branch"]
  B --> C["prisma migrate dev"]
  C --> D["prisma/migrations/*.sql committed to Git"]
  D --> E["CI/CD or controlled release step"]
  E --> F["prisma migrate deploy on Neon prod branch"]
```

In that world:

- local app runtime uses `DATABASE_URL` for `dev`
- local Prisma CLI uses `DIRECT_URL` for `dev`
- Vercel runtime uses `DATABASE_URL` for `prod`
- production migrations run against `prod`
- `db push` stops being the normal schema workflow

---

## Environment Model

### Development

Local files:

- `.env`
- `.env.local`

Both should point to the **Neon dev branch**, not prod.

Example:

```bash
DATABASE_URL="postgresql://...dev-pooler..."
DIRECT_URL="postgresql://...dev-direct..."
```

### Production

Hosted env vars:

- Vercel Production `DATABASE_URL`
- Vercel Production `DIRECT_URL`

Both should point to the **Neon prod branch**.

Example:

```bash
DATABASE_URL="postgresql://...prod-pooler..."
DIRECT_URL="postgresql://...prod-direct..."
```

### What These Two URLs Mean

- `DATABASE_URL`
  - normal runtime connection
  - usually the pooled Neon URL
- `DIRECT_URL`
  - direct Postgres connection
  - used by Prisma schema operations and migrations

These two URLs are **not** dev vs prod.
They are two connection styles for the **same environment**.

---

## Recommended Strategy

Adopt Prisma Migrate in **two steps**:

1. **Baseline** the existing database state
2. Create the **first real migration** for the branding change

This is safer than trying to pretend the app started with migrations from day one.

---

## Phase 1: Baseline The Existing Database

### Goal

Tell Prisma:

- "This database already exists"
- "Treat its current structure as the starting point"
- "Do not try to recreate all existing tables in production"

### Important Rule

The baseline should represent the **current production database structure before new schema changes are promoted**.

For WardWise, that means:

- baseline the existing schema that already lives in Neon
- then make `add_campaign_branding` the next migration after baseline

### Why This Matters

If we baseline from the wrong schema, Prisma may later think production still needs to create tables or columns that already exist, or skip changes we actually need.

### How We Should Generate The Baseline

Use a read-only diff against the **production direct URL** or an exact untouched clone of production.

This command does **not** write to the database:

```bash
mkdir -p prisma/migrations/0_init
pnpm prisma migrate diff \
  --from-empty \
  --to-url "$BASELINE_DIRECT_URL" \
  --script \
  -o prisma/migrations/0_init/migration.sql
```

Notes:

- `BASELINE_DIRECT_URL` should be the direct connection string for the production-shaped database
- if `dev` is still an exact clone of prod and has not been schema-mutated, it can also be used
- if `dev` already has extra columns from testing, do **not** use it for the baseline

### What This Produces

It creates:

- [`prisma/migrations/0_init/migration.sql`](/Users/nabeelhassan/Desktop/wardwise-demo/prisma/migrations/0_init/migration.sql)

That file becomes the "database already existed before Prisma Migrate" snapshot.

### Mark The Baseline As Already Applied

After the baseline file exists, we record it as applied in both databases.

Run this once against **prod**:

```bash
pnpm prisma migrate resolve --applied 0_init
```

Run the same command once against **dev**:

```bash
pnpm prisma migrate resolve --applied 0_init
```

Important:

- the command is the same
- the target database changes based on the environment variables available to Prisma
- this step writes only to Prisma's `_prisma_migrations` table
- it does **not** rerun the SQL in `0_init`

### Success Check

Run:

```bash
pnpm prisma migrate status
```

Expected result:

- Prisma sees `0_init` in migration history
- Prisma does not ask to reset the database just because migrations were introduced

---

## Phase 2: Create The First Real Migration

Once baseline is in place, we can create the first normal migration from code.

For WardWise, that should be the branding change already designed in:

- [collect-campaign-branding-spec.md](/Users/nabeelhassan/Desktop/wardwise-demo/docs/collect-campaign-branding-spec.md)

### On Dev Only

With local `.env` and `.env.local` pointing at the Neon `dev` branch:

```bash
pnpm prisma migrate dev --name add_campaign_branding
```

This should:

- compare the baseline migration history against the current Prisma schema
- create a new timestamped migration folder
- apply that migration to `dev`
- update `_prisma_migrations` on `dev`
- regenerate Prisma Client

### Expected Output

You should now have something like:

```text
prisma/migrations/
  0_init/
    migration.sql
  20260513xxxxxx_add_campaign_branding/
    migration.sql
```

### After That

Run local checks:

```bash
pnpm prisma generate
pnpm typecheck
```

Then test the branding flow against `dev`.

---

## Phase 3: Commit The Migration History

Once `add_campaign_branding` works on `dev`, commit:

- code changes
- [`prisma/schema.prisma`](/Users/nabeelhassan/Desktop/wardwise-demo/prisma/schema.prisma)
- the entire `prisma/migrations/` directory

At that point, the repo finally has:

- database history in Git
- repeatable schema changes
- a clean starting point for future teammates

---

## Phase 4: Promote To Production

### Recommended Long-Term Way

Run production migrations in CI/CD, not as part of normal everyday local development.

Production should receive:

```bash
pnpm prisma migrate deploy
```

with production env vars.

### What `migrate deploy` Actually Does

- reads committed migration files from `prisma/migrations`
- checks `_prisma_migrations` in the target database
- skips anything already recorded as applied
- applies only pending migrations

So in WardWise production, after baseline:

- `0_init` is already marked as applied
- `migrate deploy` should apply `add_campaign_branding`
- it should **not** try to recreate the whole database

### Short-Term Practical Option

If CI/CD is not wired yet, you can run `pnpm prisma migrate deploy` manually in a controlled production shell.

But this should be:

- rare
- deliberate
- done with production-only env vars

It should **not** become the everyday workflow.

---

## Phase 5: Normal Workflow After Adoption

After baseline and the first real migration are done, the day-to-day process becomes simple.

### Developer Workflow

1. Edit app code
2. Edit [`prisma/schema.prisma`](/Users/nabeelhassan/Desktop/wardwise-demo/prisma/schema.prisma) if needed
3. Run:

```bash
pnpm prisma migrate dev --name your_change_name
```

4. Test locally on `dev`
5. Commit:
   - code
   - schema
   - migration files
6. Open PR

### Release Workflow

1. Merge reviewed code
2. Run:

```bash
pnpm prisma migrate deploy
```

against `prod` 3. Deploy app code

---

## What We Should Stop Doing

Once this migration workflow is live, we should stop treating these as normal:

- running `db push` as the standard schema workflow
- pointing local everyday development at production
- shipping schema changes without a migration file
- assuming Git deployment updates the database automatically

`db push` can still exist as an emergency or prototype tool, but not the default team workflow.

---

## Repo-Specific Notes

### 1. Branding Is The First Real Migration

The branding fields on `Campaign` are the ideal first real migration because:

- they are additive
- they are low-risk
- they match a real product need already decided

### 2. Dev Must Stay On Dev

From now on:

- local app runtime -> Neon `dev`
- local Prisma CLI -> Neon `dev`
- production runtime -> Neon `prod`

No more normal development against production.

### 3. Expect `migrate dev` To Use A Shadow Database Internally

That is normal.

With Prisma + Neon using a direct connection, this should work as part of the normal development flow. If it fails, treat that as a configuration problem to solve once, not a reason to go back to ad hoc `db push`.

---

## Immediate Next Actions

Do these next, in order:

1. Confirm which database shape should be used for baseline
   - prod direct URL is safest
2. Create `prisma/migrations/0_init/migration.sql`
3. Mark `0_init` as applied on `prod`
4. Mark `0_init` as applied on `dev`
5. Run `pnpm prisma migrate dev --name add_campaign_branding` on `dev`
6. Test the branding flow
7. Commit the new migration history

---

## Quick Cheat Sheet

### Right now

- local envs -> `dev`
- Vercel envs -> `prod`
- baseline first
- branding migration second

### Later, for every schema change

```bash
pnpm prisma migrate dev --name your_change
git add prisma/schema.prisma prisma/migrations
git commit
```

### Release

```bash
pnpm prisma migrate deploy
```

against production envs.

---

## References

- Prisma baselining guide: [prisma.io/docs/orm/prisma-migrate/workflows/baselining](https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining)
- Prisma development vs production workflow: [prisma.io/docs/orm/prisma-migrate/workflows/development-and-production](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production)
- Prisma `migrate deploy`: [docs.prisma.io/docs/cli/migrate/deploy](https://docs.prisma.io/docs/cli/migrate/deploy)
- Neon connection pooling guidance: [neon.com/docs/connect/connection-pooling](https://neon.com/docs/connect/connection-pooling)
- Neon Prisma migration guide: [neon.com/docs/guides/prisma-migrations](https://neon.com/docs/guides/prisma-migrations)
