# Geo Admin UX + Data Operations Status

## Status (2026-04-29)

This file is no longer a full implementation plan.

The `admin/geo` UI has moved far enough that most of the older UX ideas here
have already landed in some form. Because of that, this document should be read
as a lightweight status note, not as the active spec for current geo admin work.

The better reference for the shipped admin/geo experience is
`docs/geo-management-spec.md`.

---

## What Already Exists

The current admin geo experience already includes:

- overall geo stats
- state overview with grid/list browsing
- state -> LGA -> ward -> polling unit drill-down
- search, sort, and pagination across hierarchy levels
- CRUD flows for LGAs, wards, and polling units
- delete impact checks
- bulk corrections import with CSV/Excel support
- shared geo display formatting in admin UI

That means the older version of this doc overstates how much geo admin UX still
needs to be built.

---

## What Is Still Unshipped

This doc only still has value if we plan to build a more operational,
state-first geo console for official sync work.

The main ideas that are still not present in the current UI are:

- a state operations header for audit/import/sync/export actions
- explicit official sync entry points in the UI
- a drift/status panel for mismatch and coverage warnings
- activity/history for imports, syncs, and manual changes
- a clearer split between `official sync` and `bulk corrections`

These are meaningful features, but they are not required for the current CRUD +
review + corrections workflow to function.

---

## Recommendation

Keep this file only if one of these is still on the roadmap:

- building a proper state sync console in the admin UI
- rolling out more official state geo data soon
- giving operators audit/history visibility beyond basic CRUD

If not, this file can be archived or deleted without losing anything critical.

My current recommendation is:

- `keep` it as a short note if geo state-sync tooling is still planned
- `delete` it if the current admin/geo scope is meant to stay focused on CRUD,
  browsing, and corrections

---

## Canonical Doc Split

- `docs/geo-management-spec.md`
  Current admin/geo product behavior
- `docs/geo-admin-ux-plan.md`
  Optional future state-operations note
- seed/sync scripts and related data docs
  Canonical ingestion workflow

---

## Bottom Line

As of 2026-04-29, this file is optional, not required.

It should not drive immediate UI work unless we explicitly decide to build the
state-sync console next.
