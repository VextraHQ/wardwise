# WardWise Collect v2 — Feature Roadmap Spec

> Living document. Update as features are built or priorities shift.
> Last updated: 2026-04-21
> See also: `wardwise-collect-spec.md` (v1), `wardwise-hardening-spec.md`, `collect-admin-export-plan.md`

## Status

- **Collect v1 complete** — merged to `main`, hardened (see `wardwise-collect-spec.md`)
- **Collect v2 features complete** — merged to `develop`, hardened via v2.1 pass (see below)
- **v2.1 hardening pass complete** — offline queue, cache invalidation, bulk audit, UI polish
- **v2.2 post-submission polish complete** — OpenGraph, returning visitor recognition, reference IDs, form UX audit fixes
- **v2.7 offline queue UX complete** — queued/confirmed/failed confirmation states, failed review sheet, and reload rehydration

---

## Tier 1 — High Impact (Next Up)

### 1. Filtered CSV Export

**Status:** Complete
**Why:** Admin applies filters (role, LGA, verified/flagged) in the submissions table but "Export CSV" downloads everything. Should export what admin is looking at.

**Approach:**

- Export route accepts same filter params as submissions list (`role`, `lgaId`, `wardId`, `isFlagged`, `isVerified`, `search`)
- Client passes current filter state to export function
- Infrastructure already exists: `useCampaignSubmissions` hook supports these params

**Files:** `export/route.ts`, `collect.ts` (API client), `campaign-submissions.tsx`

### 2. Date Range Picker for Analytics

**Status:** Complete
**Why:** "View stats for March 1-15" measures campaign pushes. Currently always shows all-time.

**Approach:**

- Stats endpoint accepts `from`/`to` query params
- Add `createdAt: { gte, lte }` to all `where` clauses
- Date range picker in overview UI

**Files:** `stats/route.ts`, `collect.ts`, `use-collect.ts`, `campaign-overview.tsx`

### 3. Campaign List Enhancements

**Status:** Complete
**Why:** Admin needs submission counts and last activity at a glance.

**Approach:**

- Show submission count badge on each campaign card
- Show "Last activity: 2 hours ago" text
- Show "No submissions in 48h" warning for active campaigns
- Data already available via `_count`

**Files:** Campaign list route + component

### 4. Canvasser Pre-load System

**Status:** Complete
**Why:** Currently canvasser name/phone is free text — typos everywhere, no clean analytics. Admin should add canvassers upfront, form uses a dropdown.

**Approach:**

- New `CampaignCanvasser` model (campaign-scoped, unique by phone)
- Admin UI to add/remove canvassers per campaign
- Public form shows combobox dropdown when campaign has pre-loaded canvassers
- Still allows "Other" for walk-in canvassers
- Existing `Canvasser` model stays for future full canvasser management

**Schema:**

```prisma
model CampaignCanvasser {
  id           String   @id @default(cuid())
  campaignId   String
  name         String
  phone        String
  zone         String?
  campaign     Campaign @relation(...)
  createdAt    DateTime @default(now())
  @@unique([campaignId, phone])
}
```

### 5. Canvasser Performance Dashboard

**Status:** Complete
**Why:** "Ali collected 200, Bola collected 3." Campaign team needs to measure field agent productivity.

**Approach:**

- Stats endpoint adds `byCanvasser` aggregation (groupBy name+phone)
- Canvasser tab shows per-person table: submissions, verification rate, flag rate, last active

---

## Tier 2 — Medium Impact

### 6. Bulk Actions on Submissions

**Status:** Complete
**Why:** Verifying 500 submissions one-by-one is painful.

**Approach:**

- Bulk endpoint supports selected IDs and filtered campaign scope: `{ ids?: string[], campaignId?: string, filters?: SubmissionFilters, scope: "selected" | "filtered", action: "verify" | "unverify" | "flag" | "unflag" | "delete" }`
- Checkbox column in submissions table
- Bulk action toolbar appears when items selected

### 7. Submission Edit Trail

**Status:** Complete
**Why:** When admin flags/verifies/deletes, no record of who changed what. Audit gap.

**Approach:**

- New `SubmissionAuditEntry` model (submissionId, action, userId, details, timestamp)
- Entries created on every PATCH/DELETE
- History visible in submission detail sheet

### 8. Redacted CSV Export

**Status:** Complete
**Why:** Share analytics with stakeholders without exposing PII.

**Approach:**

- Export route accepts `redacted=true` param
- Masks names (N\***\* H\*\*\***) and phones (+234\*\*\*789)
- "Export Redacted" option in export dropdown

### 9. PWA / Offline Mode

**Status:** Complete
**Why:** Field canvassers in rural Nigeria lose connectivity mid-form.

**Approach:**

- `src/app/manifest.ts` — Next.js App Router metadata manifest (type-safe, auto-detected)
- Service worker scoped to `/c/` for static assets and GET API fallback caching; navigations/HTML stay network-first to avoid stale pages
- IndexedDB-based submission queue, syncs on reconnect when the Collect page is open
- Distinct confirmation states for `confirmed`, `queued`, and `failed` submissions
- Failed review sheet for permanently rejected offline submissions, with per-record dismiss and bulk clear
- Visual sync, pending, and needs-attention indicators on form
- Current limitation: geo lookup data (LGAs, wards, polling units) is only available offline after those API responses have already been fetched and cached on that device

---

## Future Scope (Not This Cycle)

- **Analytics page** — Dedicated `/admin/analytics` with cross-campaign views (needs separate plan)
- **Activity logs page** — Dedicated admin activity log viewer (needs separate plan)
- **Cross-campaign phone check** — Flag returning supporters across campaigns for same candidate
- **Duplicate attempt log** — Show blocked duplicate registration attempts
- **Submission lag warning** — "No submissions in 48h" auto-alert on active campaigns
- **Template custom questions** — Library of pre-made question sets to copy between campaigns (admin **Collect setup** step 2 is structured to absorb more fields / presets without another full wizard redesign)
- **Geographic heatmap** — Map visualization of submission density by ward/LGA
- **Offline geo catalogue preload** — Let field teams open a campaign while online and cache the campaign's LGA/ward/polling-unit catalogue for later offline starts. This should be scoped separately from submission queueing because it changes read-side caching and stale-data rules.

---

## Edge Cases Handled (v1 Hardening)

These were fixed in the `fix/collect-hardening` branch:

| Fix                                         | What it prevents                                           |
| ------------------------------------------- | ---------------------------------------------------------- |
| Export disabled when 0 submissions          | Downloading empty CSVs                                     |
| Specific error on duplicate slug            | Generic "failed" message → now shows "slug already exists" |
| Submission count in delete warning          | Accidental mass data deletion without awareness            |
| QR code hidden for non-active campaigns     | Sharing dead links                                         |
| Closed campaign blocks submission mutations | Data integrity violation after campaign ends               |
| One active campaign per candidate           | Duplicate data collection, confused canvassers             |
| VIN case normalization                      | Duplicate bypass via mixed case                            |
| Geo names from DB, not client               | Spoofed location names in exports                          |
| P2002 race condition handled                | Generic 500 on concurrent duplicates                       |
| Server-side analytics                       | Charts wrong after 100 submissions                         |
| Schema consolidation                        | Dual campaign schemas causing drift and 400 errors         |
| Dead config removal                         | `requireApcReg`/`requireVoterId` causing confusion         |

---

## Completed v2.1 Hardening (2026-03-31)

Post-merge polish and Codex-identified bug fixes applied on `develop`:

- [x] **Offline queue permanent failures** — Superseded by v2.7: 4xx responses are retained locally as failed rows, surfaced in the form, and excluded from retry until dismissed
- [x] **Date range end-of-day** — `to` date now includes `T23:59:59.999Z` so same-day ranges work correctly
- [x] **Bulk audit trail** — Bulk verify/flag/unflag now creates per-submission `SubmissionAuditEntry` records
- [x] **Cache invalidation** — `campaign-stats`, `campaign-canvassers`, and `submission-audit` queries invalidated after all mutations
- [x] **Canvasser phone normalization** — Admin canvasser add endpoint uses `phoneSchema.transform(normalizeNigerianPhoneInput)`
- [x] **Form header redesign** — Fixed text overlap, removed duplicate candidate name, responsive stacking
- [x] **Form footer redesign** — Matches landing footer pattern, `/contact` CTA, Vextra branding
- [x] **Export dropdown indicator** — Chevron icon on export button shows it's a dropdown
- [x] **Admin notes editable** — Textarea + save button in submission detail sheet (was read-only)
- [x] **AlertDialog confirmations** — Replaced browser `confirm()` with shadcn AlertDialog for delete actions
- [x] **Calendar date picker** — Replaced native `<input type="date">` with shadcn Calendar + Popover
- [x] **Role=canvasser submit UX** — "Submit Registration" label + loading spinner + inline error display
- [x] **DRY submit error component** — Extracted reusable `SubmitError` from form-ui.tsx

---

## Completed v2.2 — Post-Submission Polish (2026-04-03)

UX audit and post-submission improvements for the public registration form:

### OpenGraph Metadata for Social Sharing

**Status:** Complete
**Why:** WhatsApp link previews showed generic WardWise site title — no candidate name, no description. Low tap-through rate on shared links.

**Approach:**

- Added `openGraph` and `twitter` metadata to `generateMetadata()` in campaign page
- Properties: title, description, url, siteName, type
- OG image to be added later (requires custom image per campaign)

**Files:** `src/app/c/[slug]/page.tsx`

### Same-Device Reference Recall

**Status:** Complete
**Why:** Registration links circulate on WhatsApp for weeks. Supporters and canvassers still need a quick way to recover a recent reference code on the same device, but a full personalized "welcome back" takeover is too aggressive for a public shared-device flow.

**Approach:**

- After successful submission, persist `{ name, count, submittedAt, refCode }` to `localStorage` key `collect-submitted-${slug}` (separate from form progress key)
- Draft resume takes priority over same-device completion metadata
- Splash remains the standard registration start screen
- If no active draft exists, splash can show a subtle `Last registration on this device` utility with the reference code and completion date
- Users explicitly begin a new registration; the app does not automatically treat the next visitor as the same person

**Files:** `src/components/collect/campaign-registration-form.tsx`, `src/components/collect/steps/splash-screen.tsx`

### Reference ID on Confirmation Screen

**Status:** Complete
**Why:** No proof of registration once the browser tab closed. Supporters couldn't verify to canvassers that they'd registered.

**Approach:**

- `generateRefCode(id)` utility derives `WW-XXXXXXXX` from submission UUID
- Displayed as a mono-styled badge on the confirmation screen and surfaced later via the same-device reference utility
- Stored in `collect-submitted-${slug}` localStorage for persistence

**Files:** `src/lib/utils.ts`, `src/components/collect/steps/confirmation-screen.tsx`

### Form UX Polish

**Status:** Complete
**Why:** Audit identified multiple small UX issues: jargon on splash, unreadable error text, mobile overflow, broken offline display.

**Changes:**

- [x] **Splash copy** — "Campaign Onboarding" / "System Initialization" / "Ready" → "Supporter Registration" / "Get Started" / "Open"
- [x] **Offline confirmation text** — "You are supporter #—" → "Your registration is saved and will be submitted when you're back online."
- [x] **Error font size** — 9px uppercase → 11px sentence case for readability
- [x] **Phone placeholder** — Canvasser phone now shows `08012345678`
- [x] **Age placeholder** — "Enter your age" → "Age (18+)"
- [x] **Role grid responsive** — `grid-cols-3` → `grid-cols-1 sm:grid-cols-3` to prevent cramping on small phones
- [x] **Nav button overflow** — Back button padding reduced on mobile, next button text scaled down to prevent overflow on "SUBMIT REGISTRATION"
- [x] **Hydration fix** — `typeof window` checks replaced with `useState` + `useEffect` pattern for share URLs
- [x] **Confetti suppressed offline** — No confetti for queued submissions (misleading celebration)
- [x] **WhatsApp share text** — Now mentions "on WardWise" for brand recognition
- [x] **Confirmation screen progress save** — Fixed bug where `saveProgress` useEffect re-saved screen=6 after localStorage was cleared, causing stale confirmation on refresh
- [x] **Zod validation messages** — Location step `z.number()` now shows "Select your ward" instead of raw "Invalid input: expected number, received undefined". Also hardened `geo-schemas.ts`

**Files:** `src/components/collect/form-ui.tsx`, `src/components/collect/steps/personal-details-step.tsx`, `src/components/collect/steps/canvasser-step.tsx`, `src/components/collect/steps/role-step.tsx`, `src/components/collect/steps/confirmation-screen.tsx`, `src/components/collect/campaign-registration-form.tsx`

---

## Completed v2.3 — Admin UX Polish (2026-04-07)

- [x] **Smart bulk actions** — Bulk toolbar now shows contextual buttons based on selected rows' state (Verify/Unverify, Flag/Unflag). Added `unverify` action to bulk API endpoint with audit trail.
- [x] **Geo display in charts** — LGA and Ward names in campaign overview charts now formatted via `formatGeoDisplayName()` (was showing raw CAPS from DB).
- [x] **Audit trail race condition** — Audit entry write is now awaited before the response is sent in the single-submission PATCH route. Fixes history not showing new entries immediately after verify/flag actions.
- [x] **History section scroll** — Added `max-h-40 overflow-y-auto` to submission detail History section to prevent unbounded growth.
- [x] **Canvasser tab overhaul** — Redesigned layout hierarchy: Referral Leaderboard is now the hero content above the fold with search/export toolbar. Pre-loaded canvasser management moved to a side Sheet ("Public Form Canvassers"). Self-identified canvassers shown as compact stat pill. Added Zod validation, AlertDialog confirmations with referral count context, leaderboard CSV export with `sanitizeCell()`, keyboard-accessible row click-through to submissions filtered by `canvasserName`+`canvasserPhone` (exact match). Submissions tab reads `canvasserName`, `canvasserPhone`, and `role` from URL params with dismissable filter chip.
- [x] **Public form canvasser dropdown** — Replaced plain `<Select>` with searchable `ComboboxSelect` in `canvasser-step.tsx`. Scales to 50+ preloaded canvassers with type-to-search.
- [x] **Admin reference lookup** — Admin submissions search now accepts registration references (`WW-XXXXXXXX`), and the submissions table/detail sheet surface the same reference code used on the public confirmation screen. This gives support/admin a simple lookup flow without introducing a separate support console.

---

## Completed v2.4 — Admin Export Centralization (2026-04-07)

- [x] **Shared export layer** — Added `src/lib/exports/` with shared sanitize/redaction helpers, CSV rendering, XLSX rendering, submissions export mapping, and canvasser leaderboard export mapping.
- [x] **Submissions CSV + Excel export** — Existing admin submissions export route now supports `format=csv|xlsx` while preserving redacted export support and campaign-specific filenames.
- [x] **Leaderboard export moved server-side** — Canvasser leaderboard export no longer assembles files inside the React component; it now downloads from a dedicated admin export route.
- [x] **Filter alignment improved** — Submissions list and submissions export now share the same filter parsing/building path for `search`, geo filters, verification/flag status, role, and canvasser filters.
- [x] **Admin export UI expanded** — Submissions dropdown now exposes CSV, Excel, redacted CSV, and redacted Excel. Both export menus also remember the last-used format locally and surface it as the preferred option in the dropdown.
- [x] **Verification complete** — `pnpm typecheck` and `pnpm build` passed. Smoke test confirmed empty export headers, blank optional cells, escaped multiline CSV content, and spreadsheet formula sanitization. Manual browser QA also confirmed CSV/XLSX downloads, redacted exports, and filter-aligned output. Unauthenticated requests to both export routes were verified to return `401 Unauthorized`.

---

## Completed v2.5 — Admin Review Queue (2026-04-17)

- [x] **Review-first submissions UX** — Submissions tab now frames verification as a `Review Queue` with inline status chips for Pending Review, Verified, Flagged, and All Records.
- [x] **All-records default with discoverable Pending count** — Submissions open to `All` so search/lookup works predictably; the `Pending` chip shows the pending count so admins can jump into the review queue when needed.
- [x] **Lean table scanning** — The main table keeps scan-friendly fields only. APC/NIN and VIN remain available in the detail sheet and exports, not the primary table.
- [x] **All matching bulk actions** — After selecting the current page, admin can escalate to all records matching the active review filters, then verify/flag/unverify/unflag with confirmation.
- [x] **Filtered bulk endpoint** — Bulk API now supports `scope: "filtered"` with campaign-scoped filters while preserving selected-ID actions.
- [x] **Audit preserved** — Filtered bulk actions create per-submission audit entries and a campaign-level audit log entry with count, action, scope, and filters.

---

## Completed v2.6 — Campaign wizard + public form parity (2026-04-19)

- [x] **Admin New Campaign wizard — 3 steps** — `Select Candidate` → **Collect setup** (custom questions + optional LGA restrict; headroom for more / prebuilt question sets) → **Review & create** (summary card with section-level **Edit**, same pattern as create-candidate review). Files: `campaign-wizard.tsx`, `step-campaign-collect-config.tsx`, `step-campaign-review.tsx` (replaces the old combined questions+review step).
- [x] **Campaign draft persistence** — `useWizardDraft` with key `wardwise:campaign-wizard:draft:v2` (version bump invalidates prior 2-step drafts), restore banner + Discard, `clear()` on successful create. See `wardwise-collect-spec.md` for full detail.
- [x] **Public `/c/[slug]` Party Information step** — Renders the same footer **TrustIndicators** strip as Personal Details and Location (`DATA_PRIVACY`, `SECURE_ENCRYPTION`, `VERIFIED_CAMPAIGN`) so identity-heavy steps feel consistent.

---

## Completed v2.7 — Offline Queue Confirmation + Failed Review (2026-04-21)

- [x] **Queued confirmation is distinct from confirmed success** — Offline submits now show an amber `Pending Upload` confirmation instead of the green `Registration Complete` receipt. Queued state hides reference codes, share actions, and confetti until the server accepts the record.
- [x] **Queued to confirmed flip** — When a queued submission syncs successfully, the UI can flip to the confirmed state with the real `WW-XXXXXXXX` reference because the sync result carries the server `submissionId` and count.
- [x] **Failed records stay visible** — Permanent 4xx sync failures are no longer deleted from IndexedDB. Rows are marked `status: "failed"` with `lastError` and `failedAt`, excluded from future retries, and counted separately from pending uploads.
- [x] **Failed confirmation state** — The active queued confirmation flips to a red `Needs Attention` / `Upload Failed` state when that record is rejected. It shows the server error and avoids any "complete", "verified", or "uploaded" language.
- [x] **Persistent failed banner** — A destructive banner appears whenever `failedCount > 0`, so missed toasts no longer hide rejected offline records.
- [x] **Failed review sheet** — The banner's `Review` action opens a sheet listing failed rows newest-first with registrant name when available, rejection time, server error, per-record `Dismiss`, and bulk `Clear all failed notices`.
- [x] **Active failed rehydration** — The form stores a slug-scoped `{ id }` pointer for the active failed row. On reload, if that row still exists, the user returns to the red failed confirmation with the current `lastError`; stale pointers are removed silently.
- [x] **Analytics** — Added events for confirmation state views, failed notice dismiss, failed review open, failed row dismiss, and active failed rehydrate. Rehydrate/dismiss paths include `error_category`.
- [x] **Back-compat** — Legacy queue rows without `status` are treated as pending. `TrustIndicators` keeps the old `canvasser` prop while adding explicit variants.

**Files:** `src/lib/offline-queue.ts`, `src/hooks/use-offline.ts`, `src/components/collect/campaign-registration-form.tsx`, `src/components/collect/steps/confirmation-screen.tsx`, `src/components/collect/failed-review-sheet.tsx`, `src/components/ui/trust-indicators.tsx`, `src/lib/analytics/client.ts`

**Deliberately not included:** edit-and-retry from a failed row, background sync with the tab closed, CSV export of failed local rows, IndexedDB indexes on `status`, and user-controlled failed-list filtering.

---

## Design Decisions

1. **One active campaign per candidate** — Multiple campaigns allowed (different cycles), but only one active at a time. Prevents split data and confused canvassers.
2. **Closed campaigns are immutable** — No delete/flag/verify on submissions after campaign closes. Preserves data integrity for reporting.
3. **Canvasser pre-load is additive** — When pre-loaded canvassers exist, form shows dropdown + "Other" option. Doesn't break campaigns without pre-loaded canvassers.
4. **PWA uses Next.js `manifest.ts`** — Type-safe, auto-detected by App Router. No manual `public/manifest.json`.
