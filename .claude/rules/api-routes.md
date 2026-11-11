---
description: Rules for writing Next.js API route handlers under src/app/api/
globs: src/app/api/**/*.ts
---

# API Route Conventions

## Auth

- All `/api/admin/*` routes MUST use `requireAdmin()` from `@/lib/auth-helpers`
- Pattern: `const { error, session } = await requireAdmin(); if (error) return error;`
- Use `{ error }` (no session) for GET handlers that don't need the user ID
- Use `{ error, session }` for mutating handlers that need `session.user.id` for audit logging

## Validation

- All mutating routes (POST, PUT, PATCH) MUST validate with Zod `.safeParse()`
- Schemas live in `src/lib/schemas/admin-schemas.ts`
- On failure: `return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, { status: 400 })`
- Use `parsed.data` (not raw body) after validation

## Audit Logging

- All sensitive operations MUST call `logAudit()` from `@/lib/audit`
- Fire-and-forget with `void logAudit(...)` — never await in the response path
- Include `session!.user.id` as userId and relevant context in details

## Error Handling

- Catch Prisma errors: P2025 (not found) → 404, P2002 (unique constraint) → 400
- Generic errors → 500 with `console.error`
- Never expose internal error details to the client
