# WardWise — Cockpit Dashboard Design System

> Reference document for the "Cockpit" UI applied across the entire WardWise application — Candidate Dashboard, Admin Dashboard, Collect forms, and Legal pages.

---

## Design Philosophy

The WardWise application uses a **dual-aesthetic** architecture:

| Layer        | Aesthetic                     | Purpose                                                            |
| ------------ | ----------------------------- | ------------------------------------------------------------------ |
| **Showroom** | Warm, editorial, hero-driven  | Landing page — marketing-facing, uses `rounded-full` on CTAs       |
| **Cockpit**  | Flat, data-dense, operational | Dashboards, Collect forms, Legal pages — functional, utility-first |

The "Cockpit" feel is inspired by **mission control centers** and **data terminals** — designed for users who are actively _operating_ a campaign and need information density over decoration.

### Architectural Markers

Cards with corner accent markers (the `border-primary border-t border-l` elements at corners) must have **no border-radius** — the sharp corners are required for the markers to render correctly. These are used on:

- Collect form `StepCard` containers
- Collect confirmation screen cards
- Legal page header cards
- Landing page CTA section and feature cards

---

## Cockpit Structural Tokens

These are the **non-negotiable** structural rules applied to every card, table, and container inside the dashboard:

### Cards

```
className="border-border/60 rounded-sm shadow-none"
```

- `rounded-sm` — Sharp, architectural corners. Never `rounded-lg` or `rounded-xl`.
- `border-border/60` — Subtle but visible border. Not full opacity.
- `shadow-none` — Zero drop shadows. Flat, disciplined surfaces.

### CardHeader

```
className="pb-3"
```

- Tighter bottom padding for a dense, compact feel.

### CardTitle

```
className="text-sm font-semibold tracking-tight"
```

- Small, tight, bold. No oversized headings inside cards.

### CardDescription (Human-readable)

```
className="text-muted-foreground mt-1 text-sm"
```

- Standard sans-serif. Used for sentences that explain what a section does.

### CardDescription (System taxonomy — mono eyebrow)

```
className="text-muted-foreground/70 font-mono text-[10px] tracking-widest uppercase"
```

- Used for short category/metric labels above data: `TOTAL SUPPORTERS`, `WARD COVERAGE`.
- **No fake prefixes** like `METRICS //` or `SYS_STAT //` — the mono uppercase treatment alone carries the Cockpit feel.

> [!IMPORTANT]
> **Labeling Philosophy:** The Cockpit aesthetic comes from the _typography_ (mono, uppercase, tracked), NOT from fake terminal syntax. Labels should be clean, human-readable text rendered in the Cockpit type treatment. Example: Use `Total Supporters` not `METRICS // TOTAL_SUPPORTERS`.

### Skeleton Loaders

```
className="border-border/50 bg-muted/20 rounded-sm border"
```

### Inner Stat Boxes

```
className="border-border/40 bg-muted/10 hover:bg-muted/20 hover:border-border/60 rounded-sm border p-3 text-center transition-all"
```

### Empty States

```
className="border-border/60 rounded-sm border border-dashed py-12 text-center"
```

- Use `border-dashed` to signal "awaiting content" — visually distinct from solid-bordered containers.

### Icon Containers

```
className="bg-primary/10 text-primary border-primary/20 rounded-sm border"
```

- Always `rounded-sm`, never `rounded-lg`.

---

## Typography Rules

> [!IMPORTANT]
> The most critical design decision: **where to use monospace and where NOT to.**

### Monospace (`font-mono`) — System / Data Layer

Use for elements that represent **machine-like data readouts, identifiers, and commands**:

| Element                     | Example                         | Class Pattern                                                    |
| --------------------------- | ------------------------------- | ---------------------------------------------------------------- |
| Card taxonomy eyebrows      | `TOTAL SUPPORTERS`              | `font-mono text-[10px] uppercase tracking-widest`                |
| Table column headers        | `NAME`, `LOCATION`, `STATUS`    | `font-mono text-[10px] font-bold uppercase tracking-widest`      |
| Badges & status indicators  | `ACTIVE`, `LIVE`, `HIGH`        | `font-mono text-[10px] or text-[11px] uppercase tracking-widest` |
| Sidebar group labels        | `OPERATIONS`, `TOOLS`, `SYSTEM` | `font-mono text-[10px] font-bold uppercase tracking-widest`      |
| Tabs                        | `WARD COVERAGE`, `ANALYTICS`    | `font-mono text-[10px] font-bold uppercase tracking-widest`      |
| Buttons (action commands)   | `EXPORT ALL`, `ADD WARD`        | `font-mono text-[10px] or text-[11px] uppercase tracking-widest` |
| Data point labels           | `REGISTERED`, `ACTIVE WARDS`    | `text-[10px] font-bold uppercase tracking-widest`                |
| Numeric data values         | `2,847`, `87%`                  | `font-mono text-xl font-bold tracking-tight`                     |
| Site header role indicator  | `CANDIDATE`, `ADMIN`            | `font-mono text-[10px] uppercase tracking-widest`                |
| Header breadcrumb separator | `//`                            | `font-mono text-xs text-muted-foreground/30`                     |
| Live status indicator       | `LIVE`                          | `font-mono text-[10px] uppercase tracking-widest`                |
| Pagination text             | `Page 1 of 5`, `Rows per page`  | `font-mono text-[11px] tracking-wider`                           |

### Sans-Serif (Default) — Human Context Layer

Use for elements that a **human reads as prose or instructions**:

| Element                            | Example                                     |
| ---------------------------------- | ------------------------------------------- |
| Card descriptions (sentences)      | "Track voter registration growth over time" |
| Help/FAQ content                   | "This page will contain documentation..."   |
| Empty state explanations           | "No ward data available yet..."             |
| Table body data (names, locations) | "Aliyu Ibrahim", "Jimeta Ward"              |
| Footer and footer text             | "Registered" label text in cards            |
| Paragraph content                  | Any multi-word explanation                  |
| **Search/text inputs**             | **Never mono — users type natural text**    |

### Font Size Scale

| Token         | Pixel Size | Use Case                                  |
| ------------- | ---------- | ----------------------------------------- |
| `text-[10px]` | 10px       | System taxonomy, labels, eyebrows         |
| `text-[11px]` | 11px       | Badges, status pills, buttons             |
| `text-sm`     | 14px       | Descriptions, table body text, paragraphs |
| `text-base`   | 16px       | Standard body text                        |

> [!WARNING]
> Never use `text-[9px]` — it's too small for comfortable reading and was the first iteration mistake.

---

## Color Palette

The Cockpit uses a **restrained, muted** color system with **theme tokens only** — no hardcoded Tailwind colors:

| Token                             | Usage                                       |
| --------------------------------- | ------------------------------------------- |
| `var(--primary)` (Teal)           | Primary actions, active states, key numbers |
| `var(--muted-foreground)`         | Secondary text, labels, descriptions        |
| `var(--border)` at 40-60% opacity | Card borders, dividers, table lines         |
| `var(--muted)` at 10-30% opacity  | Backgrounds, hover states, skeleton loaders |
| `var(--destructive)`              | Error states, delete actions                |
| `border-primary border-l-[3px]`   | Active sidebar item indicator               |

### Status Colors

For status-specific indicators, prefer theme tokens over hardcoded colors:

| State               | Pattern                                                                              |
| ------------------- | ------------------------------------------------------------------------------------ |
| Success / Positive  | `border-primary/30 text-primary bg-primary/10`                                       |
| Error / Negative    | `border-destructive/30 text-destructive bg-destructive/10`                           |
| Trending down badge | `border-red-500/30 text-red-500` (exception — semantic color)                        |
| Warning             | `border-orange-500/30 bg-orange-500/10` (exception — semantic color in landing only) |

> [!NOTE]
> The landing page hero mockup uses theme tokens (`text-foreground`, `bg-card`, `bg-muted`, `border-border`) for dark mode compatibility.

---

## Sidebar

### Active Item Indicator

The sidebar uses a **left-edge bar** instead of a rounded pill for active items:

```
data-[active=true]:border-primary data-[active=true]:border-l-[3px]
```

- `SidebarMenuButton` uses `rounded-sm` (not `rounded-md`)
- Active state: left border accent + background highlight

### Group Labels

All sidebar nav sections use mono group labels:

| Sidebar   | Group          | Label        |
| --------- | -------------- | ------------ |
| Admin     | `NavMain`      | `OPERATIONS` |
| Candidate | `NavDocuments` | `TOOLS`      |
| Both      | `NavSecondary` | `SYSTEM`     |

### Logo

```
className="text-base font-bold tracking-tight"
```

- Logo icon container: `rounded-sm` (never `rounded-lg`)

### Header Breadcrumb

Both headers use `Admin // Dashboard` or `Candidate // Name` pattern:

```tsx
<span className="text-muted-foreground/30 hidden font-mono text-xs sm:inline-block">
  {"//"}
</span>
```

---

## Pagination Pattern

Unified across all tables (data-table, supporters, admin tables):

- **Navigation**: Icon-only buttons (first/prev/next/last) with `rounded-sm size-8`
- **Rows per page**: `Label` + `Select` with mono typography
- **Page indicator**: `Page {x} of {y}` in `font-mono text-[11px] tracking-wider`
- **Count**: `Showing {x} to {y} of {z}` in `font-mono text-[11px] tracking-wider`

---

## Form Accessibility (Collect Flow)

### Selector Buttons (gender, role, yes/no)

```tsx
<button
  role="radio"
  aria-checked={isSelected}
  aria-label="Select {option}"
  className="rounded-sm border-2 focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none"
>
```

### NavButtons (Back / Next)

```tsx
<NavButtons
  onBack={goBack}
  onNext={validateAndNext}
  nextLabel="Continue"
  isLoading={isSubmitting} // Shows spinner + "Submitting...", disables both buttons
/>
```

- Buttons use `rounded-sm` (not `rounded-xl`)
- `aria-label` on both Back and Next
- `isLoading` prop disables interaction and shows loading indicator

### Share Buttons

All share buttons (WhatsApp, SMS, Email, Copy) require `aria-label`:

```tsx
<Button aria-label="Share via WhatsApp" className="rounded-sm ...">
```

---

## Component Inventory

### Candidate Dashboard (`src/components/candidate-dashboard/`)

| Component                    | Status                                                          |
| ---------------------------- | --------------------------------------------------------------- |
| `site-header.tsx`            | ✅ Cockpit header with `//` separator, mono role prefix         |
| `app-sidebar.tsx`            | ✅ `rounded-sm` logo, `font-bold tracking-tight`                |
| `nav-main.tsx`               | ✅ Quick Actions button, optional `label` prop for group labels |
| `nav-secondary.tsx`          | ✅ `SYSTEM` group label, active state tracking                  |
| `nav-documents.tsx`          | ✅ `TOOLS` group label                                          |
| `nav-user.tsx`               | ✅ `rounded-sm` avatars/dropdowns                               |
| `section-cards.tsx`          | ✅ Mono taxonomy eyebrows                                       |
| `dashboard-content.tsx`      | ✅ Ward Coverage card, stat boxes                               |
| `chart-area-interactive.tsx` | ✅ Tags, toggle/select                                          |
| `chart-patterns.tsx`         | ✅ All 7 chart cards                                            |
| `data-table.tsx`             | ✅ Table headers, tabs, badges, pagination                      |
| `analytics-content.tsx`      | ✅ Tab triggers, cards, buttons                                 |
| `supporters-content.tsx`     | ✅ Table, pagination, empty state                               |
| `wards-content.tsx`          | ✅ Overview card, ward cards, dashed empty state                |
| `reports-content.tsx`        | ✅ Report cards, stat boxes, tables                             |
| `pricing-content.tsx`        | ✅ Plan cards, badges, buttons                                  |
| `notifications-content.tsx`  | ✅ Card + badge                                                 |
| `messages-content.tsx`       | ✅ Card                                                         |
| `settings-content.tsx`       | ✅ Card                                                         |
| `export-content.tsx`         | ✅ Card + export buttons                                        |
| `help/page.tsx`              | ✅ Card                                                         |

### Admin Dashboard (`src/components/admin/`)

| Component                                | Status                                                    |
| ---------------------------------------- | --------------------------------------------------------- |
| `admin-header.tsx`                       | ✅ `Admin //` prefix, Super Admin badge, mono description |
| `admin-sidebar.tsx`                      | ✅ `OPERATIONS` group label, `rounded-sm` logo            |
| `admin-nav-user.tsx`                     | ✅ `rounded-sm` avatar/dropdown                           |
| `admin-dashboard.tsx`                    | ✅ Stat cards, coverage snapshot, dashed empty states     |
| `admin-skeletons.tsx`                    | ✅ All `rounded-sm`                                       |
| `admin-search-bar.tsx`                   | ✅ `rounded-sm border-border/60`                          |
| `admin-pagination.tsx`                   | ✅ Mono labels, `rounded-sm` buttons                      |
| `admin-filters/candidate-filters.tsx`    | ✅ Cockpit selects/buttons                                |
| `candidates/candidate-management.tsx`    | ✅ Table view, S/N, Location column, pagination           |
| `candidates/candidate-detail.tsx`        | ✅ Breadcrumb, tabs, badges, gradient divider             |
| `candidates/candidate-overview.tsx`      | ✅ Stat cards, grouped sections, inline edit              |
| `candidates/candidate-campaigns.tsx`     | ✅ Table, S/N, pagination                                 |
| `candidates/candidate-account.tsx`       | ✅ Status select, password reset, danger zone             |
| `admin-dialogs/delete-candidate-dialog`  | ✅ `rounded-sm` dialog, cockpit buttons                   |
| `collect/campaign-list.tsx`              | ✅ Stat cards, table, dashed empty state                  |
| `collect/campaign-detail.tsx`            | ✅ Breadcrumb, tabs, badges                               |
| `collect/campaign-overview.tsx`          | ✅ Chart cards, dashed empty states                       |
| `collect/campaign-submissions.tsx`       | ✅ Table, search, dashed empty state                      |
| `collect/campaign-canvassers.tsx`        | ✅ Table, mono labels                                     |
| `collect/campaign-settings.tsx`          | ✅ Cards, danger zone                                     |
| `collect/wizard/` (4 files)              | ✅ All cockpit treatment                                  |
| `geo/geo-stats-bar.tsx`                  | ✅ Stat cards, mono labels                                |
| `geo/geo-breadcrumb.tsx`                 | ✅ `rounded-sm`                                           |
| `geo/geo-management.tsx`                 | ✅ Skeleton pattern                                       |
| `geo/geo-level-states.tsx`               | ✅ Cards, tables, badges                                  |
| `geo/geo-level-lgas.tsx`                 | ✅ Cards, tables, buttons                                 |
| `geo/geo-level-wards.tsx`                | ✅ Cards, tables                                          |
| `geo/geo-level-polling-units.tsx`        | ✅ Cards, tables                                          |
| `geo/geo-dialogs/bulk-import-dialog.tsx` | ✅ `rounded-sm` dialog                                    |

### Collect Flow (`src/components/collect/`)

| Component                         | Status                                                       |
| --------------------------------- | ------------------------------------------------------------ |
| `form-ui.tsx`                     | ✅ `NavButtons` with `isLoading`, `rounded-sm`, `aria-label` |
| `steps/splash-screen.tsx`         | ✅ `rounded-sm` buttons/containers                           |
| `steps/personal-details-step.tsx` | ✅ Gender selector with `role="radio"`, `aria-checked`       |
| `steps/role-step.tsx`             | ✅ Role cards with `role="radio"`, `rounded-sm`              |
| `steps/canvasser-step.tsx`        | ✅ Yes/No with `role="radio"`, `rounded-sm`                  |
| `steps/confirmation-screen.tsx`   | ✅ Share buttons with `aria-label`, `rounded-sm`             |

### Legal Pages (`src/components/legal/`, `src/components/layout/`)

| Component               | Status                                                                          |
| ----------------------- | ------------------------------------------------------------------------------- |
| `legal-page-layout.tsx` | ✅ Sidebar nav with active left-border, `rounded-sm` cards, sharp-corner header |
| `privacy-content.tsx`   | ✅ Uses `LegalSectionContent`                                                   |
| `terms-content.tsx`     | ✅ Uses `LegalSectionContent`                                                   |
| `cookies-content.tsx`   | ✅ Uses `LegalSectionContent`                                                   |
| `support-content.tsx`   | ✅ Accordion `rounded-sm`, contact cards, cockpit button                        |
| `contact-content.tsx`   | ✅ Theme token alerts, `rounded-sm` inputs, cockpit submit                      |

### Landing Page (`src/components/landing/`)

| Component             | Status                                                      |
| --------------------- | ----------------------------------------------------------- |
| `header.tsx`          | ✅ `rounded-sm` mobile menu, `rounded-full` CTA             |
| `hero.tsx`            | ✅ Theme tokens for dashboard mockup (dark mode compatible) |
| `features.tsx`        | ✅ Showroom aesthetic, sharp-corner feature cards           |
| `how-it-works.tsx`    | ✅ Showroom aesthetic                                       |
| `collect-section.tsx` | ✅ `rounded-sm` icon containers, sharp-corner cards         |
| `cta-section.tsx`     | ✅ `rounded-full` CTAs, sharp-corner architectural frame    |
| `footer.tsx`          | ✅ `rounded-full` CTA button                                |

### Shared UI (`src/components/ui/`)

| Component     | Status                                                                  |
| ------------- | ----------------------------------------------------------------------- |
| `sidebar.tsx` | ✅ `SidebarMenuButton` `rounded-sm` + `border-l-[3px]` active indicator |
| `table.tsx`   | ✅ Default `hover:bg-muted/50` on `TableRow`                            |

---

## Quick Reference — Copy-Paste Patterns

### Standard Card

```tsx
<Card className="border-border/60 rounded-sm shadow-none">
  <CardHeader className="pb-3">
    <CardTitle className="text-sm font-semibold tracking-tight">
      Title Here
    </CardTitle>
    <CardDescription className="text-muted-foreground mt-1 text-sm">
      Human readable description here
    </CardDescription>
  </CardHeader>
  <CardContent>{/* content */}</CardContent>
</Card>
```

### System Taxonomy Card

```tsx
<Card className="border-border/60 rounded-sm shadow-none">
  <CardHeader className="pb-3">
    <CardTitle className="text-sm font-semibold tracking-tight">
      Title Here
    </CardTitle>
    <CardDescription className="text-muted-foreground/70 font-mono text-[10px] tracking-widest uppercase">
      Category Label
    </CardDescription>
  </CardHeader>
</Card>
```

### Cockpit Badge

```tsx
<Badge
  variant="outline"
  className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
>
  STATUS
</Badge>
```

### Cockpit Button

```tsx
<Button
  variant="outline"
  className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
>
  Action Label
</Button>
```

### Cockpit Table Header

```tsx
<TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
  Column Name
</TableHead>
```

### Cockpit Tab Trigger

```tsx
<TabsTrigger
  className="font-mono text-[10px] font-bold tracking-widest uppercase"
  value="tab-id"
>
  Tab Label
</TabsTrigger>
```

### Empty State

```tsx
<div className="border-border/60 rounded-sm border border-dashed py-12 text-center">
  <IconUsers className="text-muted-foreground mx-auto mb-4 size-12" />
  <h3 className="mb-2 text-sm font-semibold tracking-tight">No Data Yet</h3>
  <p className="text-muted-foreground text-sm">Description here</p>
</div>
```

### Accessible Selector Button

```tsx
<button
  type="button"
  role="radio"
  aria-checked={isSelected}
  aria-label="Select option"
  className={cn(
    "border-border bg-card hover:border-primary/50 focus-visible:ring-primary rounded-sm border-2 transition-all focus-visible:ring-2 focus-visible:outline-none",
    isSelected &&
      "border-primary bg-primary/10 ring-primary/20 ring-2 ring-offset-1",
  )}
>
  Option
</button>
```

### Architectural Card (with corner markers — NO border-radius)

```tsx
<div className="border-border/60 bg-card relative overflow-hidden border shadow-none">
  <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
  <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />
  <div className="p-6">{/* content */}</div>
</div>
```
