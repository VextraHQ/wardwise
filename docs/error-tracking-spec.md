# WardWise — Error Tracking Spec

> Status: **Planned** · Provider: **PostHog Error Tracking** (EU cloud, existing project) · Alerts: **Discord** · Last updated: 2026-11-11

Living spec for how WardWise finds out about production errors. Update it as phases land.

Visual explainer (before/after wireframe of one failed submission): private artifact "WardWise Error Tracking" in Hassan's Claude artifacts.

**Revision 2026-11-11 (after review):** delivery is now awaited instead of fire-and-forget; one shared scrubber covers logs, server events and browser exceptions; restored logs are sanitized summaries, not raw errors; error events carry no user or record IDs; the root-crash reporter works without the app's provider tree; the first alert ships with Phase 1; alerts go to Discord.

**Revision 2026-11-11 (second review):** error messages are dropped by default, not regex-redacted; the "unlinked" promise is scoped to server reports, and browser exceptions are documented as carrying the analytics identity of people who consented; delivery wording separates the post-response path from the bounded wait in `onRequestError`; nested `after()` confirmed.

**Revision 2026-11-11 (third review):** engine messages are normalised with placeholders instead of kept verbatim, since identifier-shaped names can be runtime values; `SafeError` codes are a fixed, type- and runtime-checked list. **Status: approved for implementation.**

---

## 1. Why

Today WardWise has **no error tracking, and in production it has almost no error logging either.**

| Finding                                            | Evidence                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `console.error` is stripped from production builds | `next.config.ts` sets `compiler.removeConsole: process.env.NODE_ENV === "production"`. The compiled submit route is `catch(e){return NextResponse.json({error:"Internal server error"},{status:500})}` — the log line is gone. This applies to all 72 app `console.error` calls (65 of them across 46 API route files). |
| PostHog exception capture is off                   | `src/lib/analytics/client.ts` initialises with `capture_exceptions: false`.                                                                                                                                                                                                                                             |
| PostHog only starts after cookie consent           | `enableAnalytics()` runs only after the consent banner. Anyone who declines is invisible.                                                                                                                                                                                                                               |
| Error boundaries don't report                      | `src/app/error.tsx` has `// TODO: Send this to an error reporting service`. `c/[slug]/error.tsx` and `r/[token]/error.tsx` only log. There is no `app/global-error.tsx`.                                                                                                                                                |
| Handled server errors are swallowed                | Routes catch, log (stripped), and return 500. No tool sees these unless we report them explicitly.                                                                                                                                                                                                                      |
| Receipt email can be cut off                       | `submit-registration.ts` fires `void sendRegistrationReceipt(...)` after the response. On serverless, unfinished work after the response may be stopped, with no error.                                                                                                                                                 |
| The browser scrubber only covers URL properties    | `sanitizeCaptureResult` in `client.ts` deletes top-level URL properties. It does not touch exception messages, stack frames or error causes.                                                                                                                                                                            |

The practical effect: during a registration drive, a failing submit route is discovered when a coordinator complains on WhatsApp, with no logs to diagnose it.

## 2. Goals and non-goals

**Goals**

- Know about a production error within minutes, before users report it.
- See each error once, grouped, with an event count, flow/campaign context, release, and a readable stack trace.
- Capture **handled** server errors (the catch-and-500 pattern), not just crashes.
- Never send supporter PII (phone, email, NIN, VIN, APC number, names, addresses) or secrets (setup tokens, report tokens, passcodes) to PostHog **or to Vercel logs**.
- Know whether a fix worked (event count drops to zero; reopened alert if it returns).

**Non-goals (for now)**

- Performance tracing / APM. If we need request-level tracing across frontend → API → DB, revisit Sentry then.
- Session replay. Stays disabled.
- Logging infrastructure (log drains, structured logging). Out of scope; may follow.
- Durable retries. `after()` runs within the route's execution limit; it is not a queue. If receipts must be guaranteed, add a retry job later (e.g. resend where `receiptEmailSentAt` is null).
- Counting unique affected supporters. Public errors are counted as events, not people (§5, "Identity").

## 3. Provider decision

**PostHog Error Tracking**, because:

- Already installed (`posthog-js` 1.365.1), already on EU cloud, already proxied via `/ingest`.
- The hard parts — explicit capture of handled errors, PII scrubbing, source maps, alerts, consent handling — are the same work with any provider.
- Generous free allowance and unlimited teammates (per PostHog pricing; re-check `posthog.com/pricing` before relying on numbers).

Revisit **Sentry** only if we need distributed tracing or PostHog's issue workflow proves insufficient in practice.

**Packages.** Server capture uses `posthog-node` directly with our own `onRequestError`. We do **not** depend on `@posthog/next` for v1: it is documented as prerelease, and its request hook passes the original exception through (§7). `@posthog/nextjs-config` is used only for source maps (Phase 3).

## 4. Architecture

```
Browser                                    Server (Vercel, Node runtime)
───────                                    ─────────────────────────────
error.tsx (inside providers)               instrumentation.ts
  └─ captureClientError()                    └─ onRequestError ──► uncaught errors in
     (only after consent, see §6)                                  route handlers, server
                                                                   components, actions
global-error.tsx (no providers)            reportServerError(error, ctx)
  └─ reportRootCrash()                       └─ every catch-and-500 path
     reads saved consent itself                 ├─ logServerError() → safe summary in Vercel logs
                                                └─ after(): capture + await flush (2 s wait cap)
capture_exceptions: true
  └─ unhandled errors / rejections         src/lib/core/safe-error.ts
     (only after consent)                    └─ toSafeError(): one scrubber for logs,
                                                server events and browser exceptions
before_send → scrubs $exception too
```

### New / changed files

| File                                                                             | Purpose                                                                                                                                                            |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/lib/core/safe-error.ts`                                                     | `toSafeError(error)` and `logServerError(label, error, ref?)`. Provider-free, so it belongs in `lib/core`. Used by logs, the server reporter and the browser hook. |
| `src/lib/analytics/server.ts`                                                    | Lazy `getPostHogServer()` singleton (posthog-node). Server-only.                                                                                                   |
| `src/lib/analytics/errors.ts`                                                    | `reportServerError(error, context)` and `captureServerErrorNow(error, context)`. The only server entry points features use.                                        |
| `src/instrumentation.ts`                                                         | `register()` and our own `onRequestError`, built on `getPostHogServer()` + `toSafeError()`.                                                                        |
| `src/app/global-error.tsx`                                                       | New. Root-layout crash boundary with its own `<html>/<body>`. Reports through `reportRootCrash()`, not the provider tree.                                          |
| `src/lib/analytics/root-crash.ts`                                                | `reportRootCrash(error)`: reads the saved consent cookie; only if accepted, sends one scrubbed exception without relying on `AnalyticsProvider`.                   |
| `src/app/error.tsx`, `src/app/c/[slug]/error.tsx`, `src/app/r/[token]/error.tsx` | Call `captureClientError()` in their `useEffect`.                                                                                                                  |
| `src/lib/analytics/client.ts`                                                    | `capture_exceptions: true`, export `captureClientError()`, extend `sanitizeCaptureResult` to scrub `$exception` events.                                            |
| `next.config.ts`                                                                 | `removeConsole: { exclude: ["error", "warn"] }` — only after server logs go through `logServerError`. Later wrapped with `withPostHogConfig` for source maps.      |
| `src/app/(legal)/privacy/page.tsx`                                               | Wording for technical error diagnostics (Phase 1).                                                                                                                 |

`lib/analytics` is an app-wide service, so features may import `reportServerError` from it. `lib/core` stays provider-free.

### Environment variables

| Var                         | Where                | Notes                                                                                              |
| --------------------------- | -------------------- | -------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_POSTHOG_KEY`   | existing             | Project token. Reused by the server client.                                                        |
| `NEXT_PUBLIC_POSTHOG_HOST`  | existing (`/ingest`) | **Relative — cannot be used server-side.**                                                         |
| `POSTHOG_SERVER_HOST`       | new                  | `https://eu.i.posthog.com`. Server client host.                                                    |
| `POSTHOG_API_KEY`           | new, build only      | Personal API key with error-tracking write scope, for source-map upload. Never `NEXT_PUBLIC_`.     |
| `POSTHOG_PROJECT_ID`        | new, build only      | For source-map upload.                                                                             |
| `ENABLE_ERROR_TRACKING_DEV` | new, optional        | `"true"` to send errors from local dev. Default off, mirroring `NEXT_PUBLIC_ENABLE_ANALYTICS_DEV`. |

Add all to `.env.example` and Vercel (Production + Preview).

## 5. Server capture design

```ts
// src/lib/analytics/errors.ts (shape, not final code)
type ErrorFlow =
  | "collect_submit"
  | "receipt_email"
  | "auth_email"
  | "contact"
  | "campaign_report"
  | "admin_mutation"
  | "geo_import"
  | "export"
  | "other";

type ErrorContext = {
  flow: ErrorFlow;
  route?: string; // route template, e.g. "/api/collect/submit" — never the raw URL
  campaignSlug?: string; // already public in the Collect URL
  actor?: "public" | "candidate" | "admin";
};

// Inside a request (route handler, server action): logs now, sends in after().
export function reportServerError(error: unknown, context: ErrorContext): void;

// Already inside an after() callback or onRequestError: await it directly.
export function captureServerErrorNow(
  error: unknown,
  context: ErrorContext,
): Promise<void>;
```

### Delivery

PostHog's Node docs are explicit: `flushAt: 1` only _starts_ a background flush, and on serverless the function can freeze before it finishes. So:

- **Caught errors (`reportServerError`).** Writes the safe log line immediately, then schedules `captureServerErrorNow` with `after()`. The capture and flush run **after the response is sent**, so they never delay the user.
- **Already inside an `after()` callback** (receipt email, stamp update). Call `captureServerErrorNow` and await it directly. Nested `after()` also works (Next 16.0.10 handles it), but the direct call is simpler.
- **Uncaught errors (`onRequestError`).** Next runs this hook while handling the failed request, and our implementation awaits `captureServerErrorNow`. This wait is **not** post-response: it can add up to the timeout to a request that is already failing. Use a shorter cap here (1 s) and measure it in Phase 1.
- **What the timeout means.** `captureServerErrorNow` queues the event and awaits `flush()` inside a `Promise.race` with the cap. The cap only limits how long we wait. It does not cancel the network request, and a completed flush does not prove PostHog ingested the event. Delivery is best-effort; the safe Vercel log line is the fallback record.
- Any PostHog failure or timeout is caught and logged once. Reporting never throws and never changes a response's status or body.

### Identity

- Every report gets a random `requestRef` (UUID). It is the event's `distinct_id` and is printed in the matching Vercel log line, so the two can be joined.
- Events are sent with `$process_person_profile: false`. No person profiles are created from errors.
- **No user, submission, or record IDs.** No `session.user.id`, `submissionId`, ward name or ref code. Campaign + ward + time can narrow a public error to one supporter, so v1 keeps only the campaign slug.
- **Server error reports are not linked to analytics profiles.** This covers `reportServerError`, `captureServerErrorNow` and `onRequestError`. Browser exceptions are different; see §6, "Browser identity".
- Issue counts are **events**, not people.

### Other rules

- **Runtime**: Node only (`process.env.NEXT_RUNTIME === "nodejs"`). Leave posthog-node's own exception autocapture off; `onRequestError` covers uncaught errors through our scrubber.
- **Release**: tag every event with `VERCEL_GIT_COMMIT_SHA` (short) and `VERCEL_ENV`.
- **Expected outcomes are not errors.** Don't report validation failures (400), rate limits (429), duplicates (P2002 → 400), not-found (P2025 → 404), wrong passcodes. Report only the 500 path.

### Call-site priority

| Priority | Flow                                       | Sites                                                                                                                                                                       |
| -------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | `collect_submit`                           | `api/collect/submit/route.ts` catch                                                                                                                                         |
| P0       | `receipt_email`                            | `submit-registration.ts` receipt `.catch` and `receiptEmailSentAt` stamp `.catch` — moved into `after()`                                                                    |
| P0       | `auth_email`                               | `features/auth/lib/links.ts`, `api/auth/forgot-password`, `api/auth/complete-password-setup`, `api/auth/confirm-email-change`, `api/admin/candidates` (welcome/setup email) |
| P1       | public reads                               | `api/collect/campaign/[slug]`, `lgas`, `wards`, `units`, `offline-pack`                                                                                                     |
| P1       | `campaign_report`                          | `api/campaign-report/[token]/*` (summary, submissions, export, unlock)                                                                                                      |
| P1       | `contact`                                  | `api/contact/route.ts`                                                                                                                                                      |
| P2       | `admin_mutation` / `export` / `geo_import` | remaining `api/admin/**` routes                                                                                                                                             |
| P2       | other                                      | `lib/core/audit.ts` (audit write failures), `candidate-dashboard/lib/metadata-helpers.ts`                                                                                   |

## 6. Client capture and consent

- Turn on `capture_exceptions: true` in the existing `posthog.init` (unhandled errors + promise rejections; console errors stay off).
- `error.tsx` boundaries call `captureClientError(error)` in `useEffect`, with `error.digest` as a property so it can be matched to the server-side event.
- `before_send` gets an `$exception` branch (§7.3). The current `sanitizeCaptureResult` alone is **not** enough.

**Browser identity.** Browser exceptions go through the same PostHog instance as analytics, which calls `posthog.identify(user.id)` for signed-in admins and candidates (`client.ts`, `identifyAuthenticatedUser`). So a browser exception from someone who accepted analytics **is linked** to their analytics identity and session: the user ID for signed-in users, the anonymous analytics ID for public visitors. We accept this because:

- It only happens for people who accepted analytics, and the event follows the same consent.
- The message is dropped by default (§7.1), so the linked data is the error class, stack frames and route.
- The privacy page wording (Phase 1) says error diagnostics may be linked to analytics for people who accepted analytics.

Root-crash reports (`reportRootCrash`) run without the provider tree and carry no identity: a random `distinct_id` and `$process_person_profile: false`.

**Root crashes.** `global-error.tsx` replaces the root layout, so `AnalyticsProvider` may never have run and PostHog may not be initialised. `reportRootCrash(error)`:

1. Reads the saved consent cookie directly. No consent → send nothing.
2. With consent, sends one scrubbed exception without the provider tree (initialise PostHog on demand, or post a single `$exception` to `/ingest` — pick whichever is simpler in Phase 2).
3. Never throws; the fallback screen must render even if reporting fails.

**Consent decision (v1): browser errors are captured only for people who accepted analytics.** PostHog's opt-out blocks `captureException` too, and our init doesn't run before consent. We accept this gap because:

- The business-critical failures (submit, receipts, auth emails, report links) are on the **server**, and server capture stores nothing on the user's device, so it isn't gated by the cookie banner.
- The alternative, PostHog `cookieless_mode`, changes how all analytics work and must be enabled in project settings. Revisit in Phase 5 if client-only bugs are being missed.

## 7. Privacy and scrubbing

WardWise handles phone numbers, emails, NIN, VIN, APC membership numbers, names and addresses. **Nothing from a form body is ever sent or logged.**

One function, `toSafeError(error)` in `src/lib/core/safe-error.ts`, decides what leaves the process. Vercel logs, server events and browser exceptions all use it.

### 7.1 What `toSafeError` keeps

| Error kind                                                                                         | Message                                                                                                                      | Also kept                                             |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `PrismaClientKnownRequestError`                                                                    | Controlled text: `"Prisma <code>"`. The original message is dropped.                                                         | `code`, `meta.modelName`, `meta.target` (field names) |
| `PrismaClientValidationError`                                                                      | Controlled text: `"Invalid Prisma query arguments"`. The message (query args) is dropped.                                    | class name                                            |
| `PrismaClientInitializationError`, `PrismaClientUnknownRequestError`, `PrismaClientRustPanicError` | Controlled text per class. The message is dropped.                                                                           | class name, `errorCode` if present                    |
| Our own `SafeError(code)`                                                                          | The `code`, which must come from the fixed `SafeErrorCode` list (e.g. `"receipt_send_failed"`)                               | class name, `code`                                    |
| `TypeError` / `ReferenceError` whose message matches a known engine shape (7.2)                    | **Normalised** shape with every name replaced by a placeholder, e.g. `Cannot read properties of null (reading '[property]')` | class name                                            |
| Provider errors (Resend, fetch, Node system errors)                                                | Controlled text: class name. The message is dropped.                                                                         | `code`, `statusCode` / `status` if numeric            |
| **Everything else**                                                                                | Controlled text: class name. **The message is dropped.**                                                                     | class name, `digest` if present                       |

- **Stack**: rebuilt from frame lines only (`at fn (file:line:col)`). The first line of `error.stack` repeats the message, so it is never copied as-is.
- **`cause`**: processed the same way, up to 3 levels.
- No other properties are copied from the error object.
- **Default is drop.** Any message that doesn't match a row above that keeps it is replaced with the class name. A generic message such as `Error("Registration failed for Amina Yusuf")` becomes `Error`. Grouping still works: PostHog groups on class + stack frames, and source maps (Phase 3) give the exact line.

### 7.2 Kept messages and redaction

Engine messages are never kept verbatim. A name that looks like a code identifier can still be a runtime value: a dynamic lookup such as `obj[key]` produces `Cannot read properties of null (reading 'TOKEN_demo_abc123')`. So known shapes are **normalised**, keeping the shape and replacing every name with a placeholder:

| Engine message                                              | Sent as                                                              |
| ----------------------------------------------------------- | -------------------------------------------------------------------- |
| `Cannot read properties of (undefined\|null) (reading 'x')` | `Cannot read properties of (undefined\|null) (reading '[property]')` |
| `x is not a function`                                       | `[expression] is not a function`                                     |
| `x is not defined`                                          | `[identifier] is not defined`                                        |

The shapes live next to `toSafeError` with a test per shape, including a runtime-value case like the token above. Any message that doesn't match a shape, including `SyntaxError` from `JSON.parse` (newer engines quote the input), is dropped to the class name. The stack frames and source maps (Phase 3) point to the exact line, so the placeholder loses little.

**`SafeError` codes are a fixed list.** `SafeErrorCode` is a string union in `safe-error.ts` (`"receipt_send_failed"`, `"auth_email_failed"`, …). The constructor only accepts that type, and `toSafeError` checks the code at runtime too: anything not in the list is sent as `"unknown_safe_error"`. Codes never include interpolated values.

Pattern redaction (Nigerian phone numbers `+234…` / `0[7-9][01]…`, emails, 11-digit NIN, VIN patterns, `WW-XXXXXXXX` ref codes → `[redacted]`) still runs on every message that leaves `toSafeError` as a backstop. It is **not** the main protection: regexes can't catch names, addresses or arbitrary tokens, which is why the default is to drop.

### 7.3 Every capture path

| Path                                          | Protection                                                                                                                                                                                                                                                                        |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vercel logs                                   | `logServerError(label, error, requestRef)` prints `label`, `requestRef` and `toSafeError(error)`. Raw `console.error(label, error)` is replaced on the server **before** `removeConsole` stops stripping it.                                                                      |
| `reportServerError` / `captureServerErrorNow` | `toSafeError` + allow-listed `ErrorContext` only. No spreading of request bodies, `parsed.data` or Prisma records.                                                                                                                                                                |
| `onRequestError`                              | Our own implementation. Path normalised to the route template (`/r/[token]`, `/api/campaign-report/[token]/…`, setup / email-change links). PostHog's ready-made hook can override `$pathname` via `beforeCapture` but still forwards the original exception, so we don't use it. |
| Browser (`before_send`)                       | For `$exception` events: apply the §7.1 rules to every entry in `$exception_list` (each `value`, including cause entries), normalise any URL in frames to the route template, and keep the existing URL property deletion. Identity follows analytics consent (§6).               |
| Root crash (`reportRootCrash`)                | Same browser scrubbing, applied before sending.                                                                                                                                                                                                                                   |
| posthog-node `before_send`                    | The Node docs only document `beforeSend` for metrics. Even if the installed version supports it for events, we scrub in our own code and don't depend on it.                                                                                                                      |

### 7.4 Verification

- **Before real traffic (unit tests):** feed synthetic errors through `toSafeError`, `logServerError` and the server reporter, and intercept the **outbound payload** (posthog-node's custom `fetch` option). Cases must include fake phone numbers, emails, NINs, VINs, ref codes and token URLs:
  - inside a **generic** `Error` message (e.g. `"Registration failed for Amina Yusuf, 08031234567"`),
  - inside a **nested `cause`** two levels deep,
  - in a real `PrismaClientValidationError`,
  - in a provider-style error with a message and `statusCode`,
  - as a dynamic property name in a `TypeError` (`reading 'TOKEN_demo_abc123'`),
  - as an unlisted `SafeError` code (forced past the type).

  Assert none of the fake values appear anywhere in the payload or log line.

- **Browser (on a preview, not a mock):** trigger an exception with the same synthetic values and capture the **actual outgoing `/ingest` request** (Playwright request interception or the browser network log, with posthog-js compression disabled for the test or the body decoded). Assert the fake values are absent and check which `distinct_id` is sent. A mocked `before_send` input alone doesn't prove what leaves the browser.
- **After launch (supplementary):** inspect the first 20 real events by hand.

## 8. Source maps

- Package: `@posthog/nextjs-config`, `withPostHogConfig(nextConfig, { personalApiKey, projectId, host, sourcemaps: { enabled: true, releaseName: "wardwise", releaseVersion: <commit sha>, deleteAfterUpload: true } })`.
- Runs during `next build` on Vercel; needs `POSTHOG_API_KEY` and `POSTHOG_PROJECT_ID` in Vercel env.
- `deleteAfterUpload: true` so maps are never served publicly.
- Upstream source-map tooling handles Next 16 and Turbopack. Still check with our pinned versions: a preview build, our `next.config.ts` (TS, custom `generateBuildId`, `rewrites`), and that **server** stack traces are mapped too, not just browser ones.

## 9. Alerts and triage

**Channel: Discord** (private server, `#wardwise-alerts`, phone notifications on). PostHog error alerts support Slack, Discord, Microsoft Teams and HTTP webhooks — **not email**. Move to Slack when the team grows; it's a destination change in PostHog, no code.

| Alert     | Trigger                                                                           | Channel | Ships in |
| --------- | --------------------------------------------------------------------------------- | ------- | -------- |
| New issue | First occurrence of a new issue                                                   | Discord | Phase 1  |
| Reopened  | A resolved issue happens again                                                    | Discord | Phase 4  |
| Spike     | Issue rate above baseline (min threshold ~10 events / 5 min to start, tune later) | Discord | Phase 4  |

- PostHog documents a free-plan limit of **5 alerts in total** on its insight-alerts page. It doesn't say whether error-tracking notifications count toward the same limit; check in our project (Phase 1) before budgeting.
- Optional email backup: a trend alert on the `$exception` event count (insight alerts can email). This one is an insight alert, so it does count toward the 5.

Triage routine:

- Every alert: open the issue, decide fix / snooze / suppress within the same day. During registration drives, check within 15 minutes.
- Resolve issues **in the release that fixes them** so a recurrence reopens them.
- Suppression rules only for known noise (browser extensions, network aborts). Review monthly.

Burst protection: posthog-js limits each exception type to 10 per 10 s by default, then 1 per 10 s. Keep the default.

## 10. Implementation plan

Each phase is one short-lived branch and is useful on its own.

### Phase 0 — Safe logs and quick fixes, no PostHog changes (`fix/observability-safe-logs`)

- [ ] `src/lib/core/safe-error.ts`: `toSafeError`, `SafeError` and `logServerError`, with the synthetic-PII unit tests from §7.4 (generic messages, nested causes, Prisma, provider errors, engine-message normalisation, unlisted `SafeError` codes).
- [ ] Replace server-side `console.error(label, error)` calls with `logServerError(label, error)`. Audit `console.warn` the same way.
- [ ] Only then: `next.config.ts` → `removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false`.
- [ ] Move receipt email + `receiptEmailSentAt` stamp into `after()` from `next/server`.
- [ ] Add `src/app/global-error.tsx` matching `AppStatusScreen` styling (reporting comes in Phase 2).
- [ ] Verify: `pnpm build`; on a preview, force a Prisma validation error in the submit route and confirm the Vercel log shows the safe summary and no submitted values.

### Phase 1 — Server capture + first alert (`feature/observability-server-errors`)

- [ ] Add `posthog-node@5` (≥ 5.61.1).
- [ ] `src/lib/analytics/server.ts` (EU host, dev gate, Node only).
- [ ] `src/lib/analytics/errors.ts`: `reportServerError` (log + `after()`) and `captureServerErrorNow` (awaited flush with a wait cap: 2 s in `after()`, 1 s in `onRequestError`), `requestRef`, `$process_person_profile: false`.
- [ ] `src/instrumentation.ts` with `register()` + our own scrubbed `onRequestError`.
- [ ] Outbound-payload tests (§7.4) pass before any real traffic.
- [ ] Wire all **P0** call sites.
- [ ] Env vars in `.env.example` and Vercel.
- [ ] Privacy page wording (`src/app/(legal)/privacy/page.tsx`): technical error diagnostics, without form contents, are processed to keep the service working; for people who accepted analytics, browser error diagnostics may be linked to their analytics data.
- [ ] Discord server + `#wardwise-alerts` webhook; **new-issue alert** in PostHog; test it. Note how it counts against the plan's alert limit.
- [ ] Measure how much the `onRequestError` wait adds to a forced uncaught error.
- [ ] Verify on a preview deploy: force an error in the submit route → one grouped issue with `flow`, `campaignSlug`, release; Discord alert arrives; raw event JSON has no PII; the log line and event share the same `requestRef`.

### Phase 2 — Client capture (`feature/observability-client-errors`)

- [ ] `capture_exceptions: true`, `captureClientError()`, and the `$exception` branch in `before_send`.
- [ ] Report from `error.tsx`, `c/[slug]/error.tsx`, `r/[token]/error.tsx`.
- [ ] `reportRootCrash()` and wire it into `global-error.tsx`.
- [ ] Verify on preview:
  - Throw in a test component with consent accepted → issue appears; with consent declined → nothing sent.
  - **Root crash on a fresh page load with consent previously accepted** → issue appears, fallback screen renders.
  - The **real outgoing `/ingest` request** contains none of the synthetic values (§7.4), and its `distinct_id` matches the documented identity behaviour (§6).

### Phase 3 — Source maps (`feature/observability-sourcemaps`)

- [ ] `@posthog/nextjs-config` + `withPostHogConfig`, `deleteAfterUpload: true`, release = commit SHA.
- [ ] Build env vars in Vercel.
- [ ] Verify: production stack trace shows `submit-registration.ts:<line>`, not a chunk name; `.map` files are not publicly reachable.

### Phase 4 — More alerts (PostHog UI, no code)

- [ ] Reopened and spike alerts per §9; test each with "Test function".
- [ ] Optional: email backup via a trend alert.
- [ ] Add a short "When an alert fires" section to this doc.

### Phase 5 — Coverage and follow-ups

- [ ] Wire **P1** then **P2** call sites.
- [ ] Revisit client consent (`cookieless_mode`) based on what we're missing.
- [ ] Consider an ESLint rule or review checklist item: every `catch` that returns 500 calls `reportServerError`; no raw `console.error(…, error)` on the server.
- [ ] Revisit durable receipt retries if `receipt_email` issues show up.

## 11. Acceptance criteria

- A forced error in `POST /api/collect/submit` on production creates **one** PostHog issue within 2 minutes, with flow, campaign, release and a readable stack trace, and fires a Discord alert.
- A failed receipt email creates a `receipt_email` issue; the submission still succeeds.
- Outbound payload tests with synthetic PII pass for every path in §7.3, including generic messages and nested causes; raw event JSON for a real submit failure contains no phone, email, NIN, VIN, name, ref code or URL token.
- A real browser `/ingest` request captured on preview contains none of the synthetic values.
- Production Vercel logs contain a safe summary line (label, `requestRef`, class/code, stack frames) for the same failure — and no submitted values.
- A crash in a page shows the existing error screen and creates an issue (for consenting users), including a root-layout crash on a fresh load.
- A PostHog outage or timeout never changes a response's status or body. Caught-error reporting adds no time to the response (it runs after it). `onRequestError` adds at most its 1 s cap to an already-failing request.

## 12. Open questions

- **Q1.** Does posthog-node 5 honour `$process_person_profile: false` on exception events? (Phase 1)
- **Q2.** Do error-tracking notifications count toward the plan's 5-alert limit? (Phase 1)
- **Q3.** Retention: how long PostHog keeps exception events on our plan, and whether that's acceptable under NDPA.
- **Q4.** Who else gets Discord alerts as the team grows, and when to move to Slack.

Resolved:

- ~~Affected people for public errors~~ → counted as events (§5, Identity).
- ~~Alert channel~~ → Discord (§9).
- ~~Nested `after()`~~ → supported by Next 16.0.10; the receipt path still calls `captureServerErrorNow` directly (§5, Delivery).
- ~~`createOnRequestError` scrubbing~~ → `beforeCapture` can override `$pathname` but forwards the original exception; we write our own `onRequestError`.
- ~~`@posthog/next` Next 16 support~~ → not needed for v1; source-map tooling supports Next 16/Turbopack upstream, verify in Phase 3.

## 13. References

- PostHog: Next.js error tracking install — `posthog.com/docs/error-tracking/installation/nextjs`
- PostHog: capture API, burst protection — `posthog.com/docs/error-tracking/capture`
- PostHog: Node SDK, serverless flushing — `posthog.com/docs/libraries/node`
- PostHog: source maps for Next.js — `posthog.com/docs/error-tracking/upload-source-maps/nextjs`
- PostHog: error alerts and spikes — `posthog.com/docs/error-tracking/alerts`, `/spikes`; alert plan limits — `posthog.com/docs/alerts`
- PostHog: privacy, opt-out, cookieless — `posthog.com/docs/privacy/data-collection`
- PostHog source: request hook — `github.com/PostHog/posthog-js/blob/main/packages/next/src/server/captureRequestError.ts`
- Next.js: `after()` — `nextjs.org/docs/app/api-reference/functions/after`
- Related specs: `wardwise-hardening-spec.md` (security decisions), `wardwise-collect-spec.md` (submit flow)
