---
description: Rules for modifying the Prisma schema
globs: prisma/schema.prisma
---

# Prisma Schema Conventions

- Use `prisma migrate dev` for schema changes (production-ready). `db push` only for quick prototyping.
- After any schema change: run the migration then `pnpm db:generate`
- New FK relations with parent ownership SHOULD have `onDelete: Cascade`
- State is always stored as `stateCode` (2-letter code like "AD"), never free-text
- Geo models use `@@unique` constraints: Lga `[name, stateCode]`, Ward `[name, lgaId]`, PollingUnit `[name, wardId]`
- PollingUnit `code` field is the INEC code — compulsory, primary identifier
- Don't remove Canvasser or Voter models — they're core to the product even though not fully built yet
