---
description: Project workflow, docs, and verification expectations
globs: "**/*"
---

# WardWise Workflow Rules

- Check the relevant docs in `docs/` before large product, UI, auth, Collect, campaign-report, or dashboard changes.
- If a feature changes product behavior or user flow, update the matching spec doc in the same work session.
- Work step by step from the agreed plan/checklist and keep changes scoped to the task.
- Prefer existing project patterns and components before adding new files.
- Keep code readable for other developers: small local helpers are fine, but avoid broad abstractions unless behavior is reused in multiple places.
- DRY repeated user-facing behavior where it avoids drift, especially menus, export actions, share actions, and status rendering.
- After each meaningful phase, give a short beginner-friendly summary of what changed and why it matters.
- Checks are automated by hooks in `.claude/settings.json`: each edited file is
  formatted and linted, and a turn that ends with changes runs `pnpm format:check`,
  `pnpm lint`, `pnpm typecheck` and `pnpm test`. Fix what they report.
- Run `pnpm build` yourself for route, config or dependency changes.
- `pnpm knip` reports unused code. Never remove or keep anything on your own:
  list the findings and ask the user per item. To keep an unused export for
  later, put `/** @keep Not used yet. ... */` above it; for whole files or
  folders, add them to `knip.json`.
- If checks are not run, clearly explain why.
