# WardWise Auth System Spec

> Living reference for WardWise authentication, account lifecycle, and access control.
> Branch: `main` | Last updated: 2026-04-16

---

## Overview

WardWise currently supports two first-class web roles:

- `admin`
- `candidate`

The product does **not** support multi-tenant org auth yet. For this phase, candidate records remain the account anchor for campaign operations, while the auth system is being hardened so future scope changes do not require a rewrite.

---

## Architecture Decisions

### Auth Stack

- Keep `NextAuth` credentials auth for now
- Keep JWT sessions
- Keep a shared `/login` entry point for admin and candidate users

This remains the right tradeoff for the current product shape. The main work is not replacing the auth provider, but making the existing account lifecycle and session behavior production-real.

### Access State

For the current phase, candidate `onboardingStatus` doubles as the access state:

- `pending` → account exists but is not ready for sign-in
- `credentials_sent` → secure setup link has been issued, but sign-in is not allowed yet
- `active` → candidate can sign in
- `suspended` → candidate is blocked from sign-in

This is intentionally simple for the current model. If WardWise later needs separate business onboarding vs access control states, that can be split without reworking the auth routes.

### Session Policy

- Standard sign-in uses a shorter session window
- `Remember me` extends the session window on the current device
- Password changes and suspension/reactivation bump `sessionVersion` so stale sessions can be rejected by server guards

### Invite / Recovery Model

- New candidate accounts are created with a **secure setup link**
- Password reset uses a **secure reset link**
- Email delivery is recommended for production via Resend
- Manual copy/share remains supported as an ops fallback

### Auth Page UX / Metadata

- Auth pages use minimal, non-indexable metadata via `createAuthMetadata()`
- `/login` and `/forgot-password` include generic titles/descriptions only
- `/reset-password/[token]` uses generic no-index metadata with no account, email, candidate, or token-specific details
- The login session-policy helper uses a click/tap popover so the explanation works on mobile and keyboard-accessible devices
- Login errors use balanced account-state feedback: invalid credentials stay generic, while pending/setup/suspended candidate states get clear next-step copy

---

## Main Flows

### Admin Creates Candidate

1. Admin creates candidate in the dashboard
2. Candidate record is created with `onboardingStatus = credentials_sent`
3. Candidate user account is created without a usable password
4. WardWise issues a one-time secure setup link
5. Link is emailed when configured, and always available for manual copy
6. Candidate sets password from `/reset-password/[token]`
7. Candidate becomes `active`

### Candidate Forgot Password

1. Candidate opens `/forgot-password`
2. Enters account email
3. WardWise attempts to create a one-time password reset link
4. Public recovery always returns a generic success response so account existence and delivery state are not exposed
5. Link is emailed only when delivery is configured and available
6. If email delivery is unavailable, the candidate is directed to contact their campaign admin for a manual reset
7. Candidate sets a new password from `/reset-password/[token]`

**Note:** A candidate in `credentials_sent` (or `pending`) can use the forgot-password flow to complete their account setup. This is intentional — both the invite link and the reset link prove email ownership and set a password, so the forgot-password flow acts as an equivalent path to setup completion. The candidate is promoted to `active` upon successful password creation, the same as if they had used their original invite link.

### Admin Resets Candidate Access

1. Admin opens Candidate Account tab
2. Uses `Send Reset Link`
3. WardWise issues a fresh secure reset link
4. Admin can rely on email delivery or manually copy the link

### Candidate Suspension

1. Admin changes onboarding status to `suspended`
2. Candidate can no longer sign in
3. Existing sessions are treated as stale by server-side auth guards

---

## Route Protection

### Entry Guard

`src/proxy.ts` protects:

- `/admin/*`
- `/dashboard/*`

It checks:

- role
- current session lifetime policy
- candidate active status from the JWT payload

**Revalidation window:** The proxy reads JWT claims only — it does not hit the database on every request. The JWT callback refreshes DB state every `SESSION_REVALIDATION_WINDOW_MS` (currently 5 minutes). This means that after a password reset, suspension, or email change, the proxy may still allow routing for up to 5 minutes based on stale JWT claims. This is routing-only — server guards recheck the database before rendering pages or serving API responses, so no data is exposed during this window.

### Server Guards

`src/lib/auth/guards.ts` is the main auth wrapper layer.

Current responsibilities:

- load the NextAuth session
- validate session lifetime
- compare JWT `sessionVersion` to the current DB value
- enforce candidate active status
- expose reusable helpers for admin/candidate routes and page layouts

This is the source of truth for server-side auth decisions.

---

## Auth Tokens

WardWise now stores invite and reset links in `AuthToken`.

### Supported Types

- `invite`
- `password_reset`

### Rules

- tokens are stored hashed
- tokens expire automatically
- tokens are one-time use
- issuing a fresh invite or reset link revokes previous unused auth links for that user
- successful password setup consumes the token and revokes other outstanding auth links for that user

---

## Environment Variables

| Variable          | Required | Purpose                                    |
| ----------------- | -------- | ------------------------------------------ |
| `NEXTAUTH_URL`    | Yes      | Base URL used for auth redirects and links |
| `NEXTAUTH_SECRET` | Yes      | JWT signing secret                         |
| `RESEND_API_KEY`  | No       | Enables production email delivery for auth |
| `AUTH_FROM_EMAIL` | No       | Sender identity for invite/reset email     |

If email delivery is not configured, WardWise still supports manual invite/reset link sharing from the admin UI.

---

## Key Files

| File                                                        | Purpose                                                        |
| ----------------------------------------------------------- | -------------------------------------------------------------- |
| `src/lib/auth/config.ts`                                    | NextAuth config, login rules, JWT/session fields               |
| `src/lib/auth/guards.ts`                                    | Shared server auth wrapper and role guards                     |
| `src/lib/auth/session.ts`                                   | Session lifetime policy helpers                                |
| `src/lib/auth/storage.ts`                                   | Auth-specific user/session persistence helpers                 |
| `src/lib/auth/links.ts`                                     | Invite/reset token issuing, hashing, consuming, emailing       |
| `src/lib/auth/client.ts`                                    | Browser auth client for login, forgot-password, and setup      |
| `src/lib/core/metadata.ts`                                  | Shared metadata helpers, including non-indexable auth metadata |
| `src/proxy.ts`                                              | Entry guard for protected routes                               |
| `src/app/(auth)/layout.tsx`                                 | Shared auth-page wrapper and redirect behavior                 |
| `src/app/(auth)/login/page.tsx`                             | Shared login route                                             |
| `src/app/(auth)/forgot-password/page.tsx`                   | Password recovery route                                        |
| `src/app/(auth)/reset-password/[token]/page.tsx`            | Setup/reset password route                                     |
| `src/components/auth/*`                                     | Shared auth screens and architectural auth card shell          |
| `src/app/api/auth/forgot-password/route.ts`                 | Forgot-password API                                            |
| `src/app/api/auth/complete-password-setup/route.ts`         | Password completion API                                        |
| `src/app/api/admin/candidates/route.ts`                     | Candidate creation + invite issuing                            |
| `src/app/api/admin/candidates/[id]/reset-password/route.ts` | Admin reset-link issuing                                       |

---

## Next Improvements

- Add focused auth tests around invite acceptance, forgot-password, suspension, and remember-me session rules
- Add explicit tests for generic forgot-password responses so account enumeration stays closed
- Add candidate-facing copy in docs and support playbooks for link expiry / resend behavior
- Evaluate whether admin accounts should also move to secure reset-link-first recovery if multiple staff accounts become common
- Split `onboardingStatus` from auth access state only when the product truly needs both
