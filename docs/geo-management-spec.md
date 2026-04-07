# Geo Data Management — Admin UI Spec

## Problem

LGA, Ward, and Polling Unit data is seeded in the database but only accessible via dropdowns or direct DB queries. As we scale to all 36 states + FCT (~774 LGAs, ~8,800 wards, ~176,000+ polling units — potentially 700k+), we need a proper admin interface to view, search, filter, add, edit, and delete geo records.

## Location in App

**Route**: `/admin/geo`
**Sidebar**: New nav item "Geo Data" (or "Locations") in admin sidebar, below Collect and above Settings.
**Access**: Super Admin only.

## Architecture: Hierarchical Drill-Down

Flat tables won't work at this scale. The UI uses a **breadcrumb-driven drill-down** pattern:

```
All LGAs → [click] Fufore LGA → [click] Ward 04 → Polling Units in Ward 04
```

### Breadcrumb bar (persistent, top of page)

```
Geo Data / Adamawa / Fufore / Ward 04
           ↑ clickable crumbs to navigate back up
```

### Three "depth" views sharing the same page layout:

---

### Level 1: LGA List (default view)

| Column        | Notes                                 |
| ------------- | ------------------------------------- |
| Name          | LGA name                              |
| State         | Parent state (for multi-state future) |
| Wards         | Count of child wards                  |
| Polling Units | Total PUs across all wards            |
| Actions       | View (drill in), Edit, Delete         |

**Features**:

- Server-side paginated (default 20 per page, configurable via AdminPagination)
- Search bar: filter by LGA name
- "Add LGA" button opens dialog/sheet
- Bulk import button (CSV/Excel upload) for corrections and seeding support

---

### Level 2: Ward List (after clicking into an LGA)

| Column        | Notes                         |
| ------------- | ----------------------------- |
| Name          | Ward name                     |
| Code          | Ward code if exists           |
| Polling Units | Count of child PUs            |
| Actions       | View (drill in), Edit, Delete |

**Features**:

- Server-side paginated
- Search bar: filter by ward name
- Header shows parent LGA name + "Back to LGAs" breadcrumb
- "Add Ward" button

---

### Level 3: Polling Unit List (after clicking into a Ward)

| Column            | Notes                |
| ----------------- | -------------------- |
| Code              | PU code (e.g. "001") |
| Name              | PU name              |
| Registered Voters | If we store this     |
| Actions           | Edit, Delete         |

**Features**:

- Server-side paginated (critical — a single ward can have 50-200+ PUs)
- Search by name or code
- Header shows LGA > Ward breadcrumb
- "Add Polling Unit" button
- Bulk add (paste multiple PU names, one per line)

---

## CRUD Operations

### Add

- Dialog/Sheet form (not a separate page)
- LGA: name, state (select)
- Ward: name, code (optional), parent LGA (pre-filled from context)
- PU: code, name, parent ward (pre-filled from context)
- Client-side validation: name required, no duplicates within parent

### Edit

- Inline or dialog edit
- Only name/code fields editable (changing parent = delete + recreate)
- Warn if entity has associated submissions (Collect) or supporters

### Delete

- Confirmation dialog
- Show impact: "This ward has 42 polling units and 156 submissions that reference it"
- Soft-block if referenced by active campaigns (force-delete option for super admin)
- Cascade: deleting a ward deletes its PUs, deleting an LGA deletes its wards + PUs

---

## API Endpoints

```
GET    /api/admin/geo/lgas?page=1&pageSize=20&search=fufu
POST   /api/admin/geo/lgas                          { name, stateId }
PATCH  /api/admin/geo/lgas/:id                      { name }
DELETE /api/admin/geo/lgas/:id

GET    /api/admin/geo/lgas/:lgaId/wards?page=1&search=
POST   /api/admin/geo/lgas/:lgaId/wards             { name, code? }
PATCH  /api/admin/geo/wards/:id                     { name, code? }
DELETE /api/admin/geo/wards/:id

GET    /api/admin/geo/wards/:wardId/polling-units?page=1&search=
POST   /api/admin/geo/wards/:wardId/polling-units   { name, code }
PATCH  /api/admin/geo/polling-units/:id             { name, code }
DELETE /api/admin/geo/polling-units/:id

POST   /api/admin/geo/import                        CSV/Excel bulk import
```

All endpoints: auth-gated (super admin), server-side paginated, return `{ data, total, page, pageSize }`.

---

## Performance Considerations

1. **Server-side pagination everywhere** — never load all 700k PUs client-side
2. **Counts as aggregates** — ward count per LGA, PU count per ward via `_count` in Prisma, not client-side counting
3. **Search is server-side** — `WHERE name ILIKE '%query%'` with index on name columns
4. **No nested eager loading** — each level fetches only its direct children
5. **DB indexes** — ensure indexes on `Ward.lgaId`, `PollingUnit.wardId`, and name columns
6. **Consider adding a `State` model** if scaling beyond Adamawa (currently LGAs are top-level)

---

## Component Structure

```
src/
  app/admin/geo/
    page.tsx                          — Server component, renders GeoManagement
  components/admin/geo/
    geo-management.tsx                — Main client component (breadcrumb state, drill-down)
    lga-list.tsx                      — Level 1: LGA table with search/pagination
    ward-list.tsx                     — Level 2: Ward table
    polling-unit-list.tsx             — Level 3: PU table
    geo-breadcrumb.tsx                — Breadcrumb navigation bar
    add-lga-dialog.tsx                — Add/edit LGA form dialog
    add-ward-dialog.tsx               — Add/edit ward form dialog
    add-polling-unit-dialog.tsx       — Add/edit PU form dialog
    delete-geo-dialog.tsx             — Shared delete confirmation with impact summary
    bulk-import-dialog.tsx            — CSV/Excel bulk import
  hooks/
    use-geo.ts                        — React Query hooks for all geo CRUD
  lib/api/
    geo.ts                            — API client functions
```

---

## UI Reference

Should match the existing admin patterns:

- Use `AdminPagination` for all tables (page size selector, numbered pages)
- Use `Card` wrapper for tables (same as campaign-list)
- Use `ComboboxSelect` for any parent-entity selectors in forms
- Use `Sheet` or `Dialog` for add/edit forms (not separate pages)
- Use `AdminSearchBar` pattern for search
- Destructive actions use confirmation dialogs with impact warnings

---

## Implementation Order

1. **API routes** — LGA CRUD + Ward CRUD + PU CRUD with pagination/search
2. **Hooks** — React Query wrappers
3. **LGA list** — table, search, pagination, add/edit/delete
4. **Ward list** — drill-down from LGA, same pattern
5. **PU list** — drill-down from Ward, same pattern
6. **Breadcrumb** — navigation between levels
7. **Bulk import** — CSV/Excel upload for seeding and corrections
8. **Sidebar nav** — add "Geo Data" link
