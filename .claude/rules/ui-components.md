---
description: Rules for UI components and styling
globs: src/components/**/*.tsx
---

# UI Component Conventions

- No redundant padding wrappers around shadcn components — they include their own padding
- Keep the polished, professional look — match existing app theme, not generic defaults
- Semantic hardcoded colors stay as-is: emerald (success), amber (warning), orange (alerts) — don't replace with CSS theme variables
- Admin stat cards use Pattern 2: icon top-right, value + subtitle below label
- Dashboards should be operational surfaces, not passive report pages: prioritize shortcuts, attention queues, direct row actions, and useful links before decorative metrics
- For dashboard/admin list work, use compact action rows and shared action components where they already exist (for example `CampaignActionsMenu`) instead of duplicating dropdown logic
- Wizard forms use `StepCard`, `CardSectionHeader`, `NavButtons` etc. from `src/components/collect/form-ui.tsx`
- ComboboxSelect uses custom filter function for label+value+description search
- Responsive design: use Tailwind breakpoints, hide secondary columns on mobile
- Loading skeletons must mirror the final layout closely; avoid generic placeholder blocks that shift when data loads
- Be DRY where behavior is truly shared, but do not create broad abstractions for one-off UI sections
