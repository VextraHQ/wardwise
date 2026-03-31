# WardWise Collect v2 — Feature Roadmap Spec

> Living document. Update as features are built or priorities shift.
> Last updated: 2026-03-30

## Status

- **Collect v1 complete** — merged to `main`, hardened (see `wardwise-collect-spec.md`)
- **v2 features**: In progress, tracked below by tier

---

## Tier 1 — High Impact (Next Up)

### 1. Filtered CSV Export

**Status:** Planned
**Why:** Admin applies filters (role, LGA, verified/flagged) in the submissions table but "Export CSV" downloads everything. Should export what admin is looking at.

**Approach:**

- Export route accepts same filter params as submissions list (`role`, `lgaId`, `wardId`, `isFlagged`, `isVerified`, `search`)
- Client passes current filter state to export function
- Infrastructure already exists: `useCampaignSubmissions` hook supports these params

**Files:** `export/route.ts`, `collect.ts` (API client), `campaign-submissions.tsx`

### 2. Date Range Picker for Analytics

**Status:** Planned
**Why:** "View stats for March 1-15" measures campaign pushes. Currently always shows all-time.

**Approach:**

- Stats endpoint accepts `from`/`to` query params
- Add `createdAt: { gte, lte }` to all `where` clauses
- Date range picker in overview UI

**Files:** `stats/route.ts`, `collect.ts`, `use-collect.ts`, `campaign-overview.tsx`

### 3. Campaign List Enhancements

**Status:** Planned
**Why:** Admin needs submission counts and last activity at a glance.

**Approach:**

- Show submission count badge on each campaign card
- Show "Last activity: 2 hours ago" text
- Show "No submissions in 48h" warning for active campaigns
- Data already available via `_count`

**Files:** Campaign list route + component

### 4. Canvasser Pre-load System

**Status:** Planned
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

**Status:** Planned
**Why:** "Ali collected 200, Bola collected 3." Campaign team needs to measure field agent productivity.

**Approach:**

- Stats endpoint adds `byCanvasser` aggregation (groupBy name+phone)
- Canvasser tab shows per-person table: submissions, verification rate, flag rate, last active

---

## Tier 2 — Medium Impact

### 6. Bulk Actions on Submissions

**Status:** Planned
**Why:** Verifying 500 submissions one-by-one is painful.

**Approach:**

- New bulk endpoint: `{ ids: string[], action: "verify" | "flag" | "unflag" | "delete" }`
- Checkbox column in submissions table
- Bulk action toolbar appears when items selected

### 7. Submission Edit Trail

**Status:** Planned
**Why:** When admin flags/verifies/deletes, no record of who changed what. Audit gap.

**Approach:**

- New `SubmissionAuditEntry` model (submissionId, action, userId, details, timestamp)
- Entries created on every PATCH/DELETE
- History visible in submission detail sheet

### 8. Redacted CSV Export

**Status:** Planned
**Why:** Share analytics with stakeholders without exposing PII.

**Approach:**

- Export route accepts `redacted=true` param
- Masks names (N\***\* H\*\*\***) and phones (+234\*\*\*789)
- "Export Redacted" option in export dropdown

### 9. PWA / Offline Mode

**Status:** Planned
**Why:** Field canvassers in rural Nigeria lose connectivity mid-form.

**Approach:**

- `src/app/manifest.ts` — Next.js App Router metadata manifest (type-safe, auto-detected)
- Service worker for caching public form pages
- IndexedDB-based submission queue, syncs on reconnect
- Visual sync status indicator on form

---

## Future Scope (Not This Cycle)

- **Analytics page** — Dedicated `/admin/analytics` with cross-campaign views (needs separate plan)
- **Activity logs page** — Dedicated admin activity log viewer (needs separate plan)
- **Cross-campaign phone check** — Flag returning supporters across campaigns for same candidate
- **Duplicate attempt log** — Show blocked duplicate registration attempts
- **Submission lag warning** — "No submissions in 48h" auto-alert on active campaigns
- **Template custom questions** — Library of pre-made question sets to copy between campaigns
- **Geographic heatmap** — Map visualization of submission density by ward/LGA

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

## Design Decisions

1. **One active campaign per candidate** — Multiple campaigns allowed (different cycles), but only one active at a time. Prevents split data and confused canvassers.
2. **Closed campaigns are immutable** — No delete/flag/verify on submissions after campaign closes. Preserves data integrity for reporting.
3. **Canvasser pre-load is additive** — When pre-loaded canvassers exist, form shows dropdown + "Other" option. Doesn't break campaigns without pre-loaded canvassers.
4. **PWA uses Next.js `manifest.ts`** — Type-safe, auto-detected by App Router. No manual `public/manifest.json`.
