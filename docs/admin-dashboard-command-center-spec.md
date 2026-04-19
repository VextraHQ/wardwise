# WardWise Admin Dashboard Command Center Spec

> Living implementation spec for reworking `/admin` from a passive stats page into an operational command center.
> Last updated: 2026-04-19
> Status: **Shipped** on `develop` (M1–M4 complete, see Implementation Notes).
> Primary file: `src/components/admin/admin-dashboard.tsx`

---

## Decision

The admin dashboard should answer:

> What needs attention, and where do I click next?

The dashboard should not lead with passive totals. Metrics are still useful, but they should support admin work rather than define the page. The page should prioritize:

1. Actions first
2. Problems second
3. Metrics third
4. Live operational previews next
5. Coverage/context last

This keeps `/admin` distinct from `/admin/candidates` and `/admin/collect`, which are directory/table pages.

---

## Current Problem

The current dashboard:

- Starts with five large stat cards, so it reads like a report page.
- Shows recent candidates, but rows do not help the admin move quickly.
- Pushes real operational issues out of view or does not surface them at all.
- Requires admins to click "View All" before reaching the real work.
- Has snapshots that are informative but not actionable enough.

The redesigned dashboard should feel like a command center: compact, actionable, and operational.

---

## Final Wireframe

```txt
/admin

OPERATIONS OVERVIEW
WardWise Command Center
Platform readiness, live campaign activity, and admin shortcuts.
                                                [Create Candidate] [New Campaign]

QUICK ACTIONS
[Create Candidate] [New Collect Campaign] [Manage Campaigns]
[Candidate Accounts] [Geo Data]

NEEDS ATTENTION
Candidate Actions                         Campaign Actions
- Candidates without Collect              - Draft campaigns
- Pending credentials                     - Active campaigns with no submissions
- Suspended accounts                      - Stale active campaigns
- Missing constituency LGAs               - Campaign Insights off

CORE METRICS
[Candidates]          [Live Campaigns]       [Registrations]       [Needs Attention]
Links to candidates   Links to Collect       Links to Collect       Jumps to queue

LIVE CAMPAIGNS
Small action rows, not a full table:
Campaign name | status | submissions | last activity | CampaignActionsMenu

RECENT CANDIDATES
Small action rows:
Candidate name | party | position | status | View | Create Campaign / View Collect | Account

COVERAGE SNAPSHOT
Lower-priority context:
Party mix, top offices/positions, national vs constituency split.
```

---

## Section Specification

### 1. Operations Overview

Purpose: Establish the page as an admin launchpad.

Content:

- Title: `WardWise Command Center` or `Operations Overview`
- One sentence: "Platform readiness, live campaign activity, and admin shortcuts."
- Primary actions:
  - `Create Candidate` -> `/admin/candidates/new`
  - `New Campaign` -> `/admin/collect/campaigns/new`
  - Optional secondary: `Collect Campaigns` -> `/admin/collect`

Design:

- Keep compact. Do not create a tall hero.
- Use the existing admin/cockpit style: `rounded-sm`, `border-border/60`, `shadow-none`, mono command buttons.

### 2. Quick Actions

Purpose: Let admins start common tasks without first opening a directory.

Allowed actions for v1:

- `Create Candidate` -> `/admin/candidates/new`
- `New Collect Campaign` -> `/admin/collect/campaigns/new`
- `Manage Campaigns` -> `/admin/collect`
- `Candidate Accounts` -> `/admin/candidates`
- `Geo Data` -> `/admin/geo`

Rules:

- Do not include placeholder routes such as `Activity Logs`, `Analytics`, or `Settings` while they still point to `#`.
- Do not add "Review Submissions" unless there is a real global submissions route. Use `Manage Campaigns` / `Open Collect` instead.

### 3. Needs Attention

Purpose: Surface the work that requires admin follow-up.

Candidate-side checks:

- `Candidates without Collect`: candidates where `collectCampaign` is missing.
- `Pending credentials`: candidates with `onboardingStatus === "pending"` or `onboardingStatus === "credentials_sent"`.
- `Suspended accounts`: candidates with `onboardingStatus === "suspended"`.
- `Missing constituency LGAs`: constituency-level candidates with no `constituencyLgaIds`. This can be included if the data is already present in the candidate response; otherwise leave it for a later pass.

Campaign-side checks:

- `Draft campaigns`: campaigns with `status === "draft"`.
- `Active campaigns with no submissions`: active campaigns where `_count.submissions === 0`.
- `Stale active campaigns`: active campaigns with submissions but no `lastSubmissionAt` in the last 48 hours.
- `Campaign Insights off`: non-draft campaigns where `clientReportEnabled` is false or `clientReportToken` is missing. Draft campaigns already appear under `Draft campaigns`, so do not double-count them here.

Behavior:

- Each attention row should have a direct action.
- Candidate items should link to `/admin/candidates` or the candidate detail page when listing individual rows.
- Campaign items should link to `/admin/collect` or campaign detail/settings as appropriate.
- If there are no issues, show a compact healthy state: "No urgent admin actions right now."

Design:

- This should be one of the most prominent sections on the page.
- Prefer concise issue rows over large cards.
- Use amber for warning/attention, destructive only for truly blocked/suspended states.

### 4. Core Metrics

Purpose: Give quick readouts after actions/problems are visible.

Cards:

- `Candidates` -> `/admin/candidates`
- `Live Campaigns` -> `/admin/collect`
- `Registrations` -> `/admin/collect`
- `Needs Attention` -> `#needs-attention`

Rules:

- Every card must be clickable/actionable.
- Avoid five or more equal stat cards at the top.
- Keep metric copy operational, for example:
  - "4 accounts"
  - "2 live campaigns"
  - "1,248 registrations"
  - "3 items to review"

### 5. Live Campaigns

Purpose: Show active campaign operations without turning the dashboard into another full table.

Rows should include:

- Campaign name
- Status badge
- Submission count
- Last activity
- Stale indicator when applicable
- Shared `CampaignActionsMenu`

Data:

- Use `useCampaigns()`.
- Prioritize active campaigns first.
- Include stale/draft campaigns if there are no active campaigns or if they need attention.
- Limit to 5 rows.

Action menu:

- Reuse `src/components/admin/collect/campaign-actions-menu.tsx`.
- Do not create a second campaign dropdown implementation.

### 6. Recent Candidates

Purpose: Help admin finish setup after candidate creation.

Rows should include:

- Candidate name with title if present
- Party badge
- Position and constituency/state
- Onboarding status
- Actions:
  - `View` -> `/admin/candidates/[id]`
  - `Create Campaign` -> `/admin/collect/campaigns/new?candidateId=[id]` when no Collect campaign exists
  - `View Collect` when a campaign exists
  - `Account` -> `/admin/candidates/[id]?tab=account`

Data:

- Use `useAdminCandidates()`.
- Sort by `user.createdAt` descending.
- Limit to 5 rows.

Design:

- Compact row list, not a full table.
- Avoid adding another heavy dropdown unless the row becomes crowded.

### 7. Coverage Snapshot

Purpose: Provide lower-priority context after the admin has seen actions, issues, metrics, and live operations.

Content:

- Distinct parties
- Top positions/offices
- National vs constituency-linked candidates

Rules:

- Keep below operational sections.
- Do not let coverage dominate the page.
- Link to filtered views only if filters are already supported. Otherwise keep it informational.

---

## Data Derivations

Use existing data first. Do not add new API routes in the first implementation pass unless absolutely required.

Available hooks:

- `useAdminCandidates()` in `src/hooks/use-admin`
- `useCampaigns()` in `src/hooks/use-collect`

Derived values:

```ts
const candidatesWithoutCollect = candidates.filter(
  (candidate) => !candidate.collectCampaign,
);

const pendingCredentials = candidates.filter((candidate) =>
  ["pending", "credentials_sent"].includes(candidate.onboardingStatus),
);

const suspendedCandidates = candidates.filter(
  (candidate) => candidate.onboardingStatus === "suspended",
);

const activeCampaigns = campaigns.filter(
  (campaign) => campaign.status === "active",
);

const draftCampaigns = campaigns.filter(
  (campaign) => campaign.status === "draft",
);

const activeCampaignsWithNoSubmissions = activeCampaigns.filter(
  (campaign) => campaign._count.submissions === 0,
);

const staleActiveCampaigns = activeCampaigns.filter((campaign) => {
  if (campaign._count.submissions === 0) return false;
  if (!campaign.lastSubmissionAt) return true;
  return (
    Date.now() - new Date(campaign.lastSubmissionAt).getTime() >
    48 * 60 * 60 * 1000
  );
});

const campaignInsightsOff = campaigns.filter(
  (campaign) =>
    campaign.status !== "draft" &&
    (!campaign.clientReportEnabled || !campaign.clientReportToken),
);
```

Potential later data:

- Global recent submissions
- Global review queue counts
- Activity log preview

These should wait until real routes/data are available.

---

## Implementation Plan

### Phase 1 - Structure and Derived Data

- [x] Keep work in `src/components/admin/admin-dashboard.tsx` unless a subcomponent is clearly reusable.
- [x] Replace top button-only strip with a compact Operations Overview section.
- [x] Add derived arrays/counts for attention items.
- [x] Build reusable local helpers inside the file:
  - `relativeTime`
  - `isStaleCampaign`
  - `formatStatusLabel`
  - small local card/row components if needed

### Phase 2 - Command Sections

- [x] Add Quick Actions with only real routes.
- [x] Add Needs Attention section with candidate and campaign groups.
- [x] Add actionable Core Metric cards.
- [x] Ensure `Needs Attention` has an anchor id (`id="needs-attention"`) for the metric card jump.

### Phase 3 - Operational Previews

- [x] Replace `Recent Candidate Accounts` card with `Recent Candidate Setup`.
- [x] Add direct row actions: View, Create Campaign/View Collect, Account.
- [x] Add `Live Campaigns` compact rows.
- [x] Reuse `CampaignActionsMenu` for campaign rows.

### Phase 4 - Coverage and Polish

- [x] Keep Coverage Snapshot lower on the page.
- [x] Preserve top positions and party/national/constituency insights.
- [x] Add polished empty states for no candidates/campaigns/issues.
- [x] Make loading skeletons match the final layout.
- [x] Check mobile stacking at 375px, tablet, and desktop.

---

## Layout Guidance

Recommended desktop grid:

```txt
Header: full width
Quick Actions: full width
Needs Attention + Campaign Operations: 1.1fr / 1fr
Core Metrics: 4 cards full width
Recent Candidates + Coverage Snapshot: 1.1fr / 0.9fr
```

Recommended mobile flow:

```txt
Header actions stack
Quick actions become 2-column buttons
Needs Attention full width
Metrics 2-column
Live Campaigns full width
Recent Candidates full width
Coverage full width
```

Important:

- Use small action rows, not large table blocks.
- Keep dashboard scannable without forcing horizontal scroll.
- Do not use charts in this pass. Charts belong in campaign analytics/report surfaces, not the admin landing dashboard.

---

## UI Standard

- Follow `docs/cockpit-design-system.md`.
- Cards: `border-border/60 rounded-sm shadow-none`.
- Buttons: mono uppercase command style.
- Badges: mono uppercase, semantic colors.
- Use Tabler icons for any new icons.
- Prefer concise, human labels. No fake terminal prefixes.
- No new purple/dark visual direction.
- No dead links or placeholder actions.

---

## Files Expected To Change

Primary:

- `src/components/admin/admin-dashboard.tsx`

Likely reused:

- `src/components/admin/collect/campaign-actions-menu.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/badge.tsx`

Do not change unless needed:

- API routes
- Prisma schema
- Campaign/candidate list pages

---

## Verification Checklist

- [x] `pnpm exec prettier --check src/components/admin/admin-dashboard.tsx`
- [x] `pnpm exec eslint src/components/admin/admin-dashboard.tsx`
- [x] `pnpm exec tsc --noEmit --pretty false`
- [x] Dashboard loads with zero candidates.
- [x] Dashboard loads with candidates but no campaigns.
- [x] Dashboard loads with active, draft, paused, and closed campaigns.
- [x] Candidates without campaigns appear in Needs Attention.
- [x] Draft campaigns appear in Needs Attention.
- [x] Active campaigns with zero submissions appear in Needs Attention.
- [x] Stale active campaigns appear in Needs Attention.
- [x] Campaign Insights off appears in Needs Attention.
- [x] Quick Actions only link to real routes.
- [x] Core metric cards are clickable/actionable.
- [x] Live campaign rows use `CampaignActionsMenu`.
- [x] Recent candidate rows include useful direct actions.
- [x] Mobile layout does not require horizontal scrolling.
- [x] Loading skeletons match the new layout.

---

## Claude Implementation Prompt

Use this when handing the task to Claude:

```txt
Please implement the admin dashboard redesign from docs/admin-dashboard-command-center-spec.md.

Scope:
- Update src/components/admin/admin-dashboard.tsx.
- Reuse existing hooks: useAdminCandidates() and useCampaigns().
- Reuse CampaignActionsMenu for campaign rows.
- Do not add new API routes or Prisma changes.
- Keep helper components local to admin-dashboard.tsx unless clearly reusable.
- Do not include placeholder links to routes that currently use "#".

Target UX:
- Actions first, problems second, metrics third.
- Dashboard should feel like an admin command center, not a passive stats report.
- Use compact action rows, not big tables.
- Keep Coverage Snapshot lower priority.

Run:
- pnpm exec prettier --write src/components/admin/admin-dashboard.tsx
- pnpm exec eslint src/components/admin/admin-dashboard.tsx
- pnpm exec tsc --noEmit --pretty false

After implementation, summarize what changed and call out any tradeoffs.
```

---

## Implementation Notes (shipped 2026-04-19)

What shipped matches the spec. A few decisions worth recording so future work doesn't re-litigate them:

- **`Missing constituency LGAs` uses `positionRequiresLgas(position)`**, not `!isNational`. Only Senator, House of Reps, and State Assembly seats are flagged. Governor / President / statewide candidates legitimately have no constituency LGAs and would have produced false positives.
- **`Campaign Insights off` excludes drafts.** Drafts already surface under their own row, so including them here double-counted and made the queue noisier than the underlying problem.
- **Recent Candidates row resolves `stateCode` to a full state name** via `nigeriaStates` (`src/lib/data/state-lga-locations.ts`) so admins see "Adamawa State" instead of "AD".
- **`CampaignRow` shows "No submissions yet"** when `lastSubmissionAt` is null, instead of an em-dash, because the dash read like a missing-data error rather than an expected state for a fresh campaign.
- **Status color maps and `relativeTime` are duplicated locally** rather than extracted to `src/lib/date.ts` / a shared status module. Mirrors the same maps in `candidate-management.tsx` and `campaign-list.tsx`. Recorded as a follow-up in the Future Enhancements list below — not done in this pass to keep the PR scoped.
- **Coverage Snapshot is purely informational.** No filter links: the candidate/campaign list pages do not yet support the corresponding filters, and dead links would have violated the "no placeholder routes" rule.
- **All clickable surfaces are real routes** (verified against the App Router file tree before linking). No `#` placeholders.

---

## Future Enhancements (research-backed, not yet decided)

Research into operational dashboard patterns (Linear's dashboards guidance, Pencil & Paper's UX-pattern analysis, Refactoring UI, Xenia's operational-dashboard guide, Button's "Mission Control" case study) surfaced suggestions that would meaningfully sharpen this surface. None are committed — they are parked here so the next iteration starts with options on the table rather than gut reactions.

1. **Pair every Core Metric with a delta or comparison** ("+12 this week" / "↓ 3% vs last 7d"). Source: Linear — "pair metrics with historical comparison so viewers can instantly see if something was good, bad, or in line." Today's cards show raw counts and don't tell the admin whether today is normal.
2. **Reconsider what occupies the top-left.** Source: Pencil & Paper F/Z scan analysis. The decorative `WardWise Command Center` header card sits in the highest-attention slot. Either compress it to a single line (no card) or replace it with a one-line "today" status strip (`3 pending credentials · 2 stale campaigns · 47 new submissions today`).
3. **Differentiate visual weight between sections.** Source: Refactoring UI — "deliberate de-emphasis of secondary content makes primary content powerful by contrast." All four lower sections currently use identical card chrome. Letting Coverage become a flat strip and lightening Recent Candidate Setup would make Needs Attention pop without changing its own styling.
4. **Add a celebratory healthy state for Needs Attention.** Source: Eleken empty-state research. The current `No urgent admin actions right now.` reads as system status. A single primary-tinted check icon plus warmer copy would land the inbox-zero feeling without violating cockpit constraints.
5. **Audit `Candidates: 4 accounts` for vanity.** Source: Xenia operational-dashboard rule — "every metric should drive a task." The raw candidate count rarely changes day-to-day. Could be replaced with a daily-delta metric (e.g. "New this week: 1") or folded into a platform-health strip, freeing that card slot for something more action-driving.
6. **Extract shared helpers** (`relativeTime`, `CAMPAIGN_STATUS_STYLES`, `ONBOARDING_STATUS_STYLES`) when a third consumer appears. Currently duplicated across this file, `candidate-management.tsx`, and `campaign-list.tsx`. Three usages is the natural threshold for extraction.

---

## Review Notes For Codex

When reviewing Claude's implementation, prioritize:

1. Does the dashboard help admins move faster?
2. Are attention items accurate and non-duplicative?
3. Are all links real and useful?
4. Are campaign actions using the shared menu?
5. Is the page compact on desktop and readable on mobile?
6. Did the implementation avoid unnecessary new files or abstractions?
7. Are loading, empty, and error states polished?
