# WardWise — Production Branding Spec

**Version:** 1.0
**Status:** Authoritative — supersedes all demo-era color values and provisional styles
**Source:** Poulis Co. brand guidelines (WardWise_Brand_Guidelines_Complete.pdf)
**Date:** 2026-03-28
**Branch:** `feature/branding-production`

---

## 1. Overview

This document defines the complete styling layer for WardWise in production. Every token maps directly from the finalized brand guidelines delivered by Poulis Co.

The demo used provisional colors (`#1f6b5e`, `#1a2926`, `#f0f4f1`, shadcn defaults) that were placeholders. This spec replaces all of those with the official brand palette.

---

## 2. Color Palette

### 2.1 Brand Colors

| Name           | Hex       | RGB           | Usage                                               |
| -------------- | --------- | ------------- | --------------------------------------------------- |
| **Off-White**  | `#F5F5ED` | 245, 245, 237 | Primary background (light mode)                     |
| **Pine**       | `#09282A` | 9, 40, 42     | Primary dark surface, dark mode bg, foreground text |
| **Lagoon**     | `#0A645A` | 10, 100, 90   | Brand primary — links, focus rings, key accents     |
| **Emerald**    | `#02C988` | 2, 201, 136   | CTA buttons, success states, highlights             |
| **Mint**       | `#06FDAF` | 6, 253, 175   | Hover states, bright accents, dark mode highlights  |
| **Dark Grey**  | `#525252` | 82, 82, 82    | Body text, secondary/muted text                     |
| **Light Grey** | `#C0BFBB` | 192, 191, 187 | Borders, dividers, disabled states                  |

### 2.2 Semantic Token Mapping

| Token                    | Light Mode            | Dark Mode                |
| ------------------------ | --------------------- | ------------------------ |
| `--background`           | Off-White `#F5F5ED`   | Pine `#09282A`           |
| `--foreground`           | Pine `#09282A`        | Off-White `#F5F5ED`      |
| `--primary`              | Lagoon `#0A645A`      | Emerald `#02C988`        |
| `--primary-foreground`   | White `#ffffff`       | Pine `#09282A`           |
| `--secondary`            | `#E8E8DF` (darker bg) | `rgba(9,40,42,0.75)`     |
| `--secondary-foreground` | Pine `#09282A`        | Light Grey `#C0BFBB`     |
| `--muted`                | `#E2E2D9` (visible)   | `rgba(9,40,42,0.5)`      |
| `--muted-foreground`     | Dark Grey `#525252`   | Light Grey `#C0BFBB`     |
| `--accent`               | Emerald `#02C988`     | Mint `#06FDAF`           |
| `--accent-foreground`    | Pine `#09282A`        | Pine `#09282A`           |
| `--border`               | Light Grey `#C0BFBB`  | `rgba(192,191,187,0.12)` |
| `--input`                | `#D6D6CE`             | `rgba(192,191,187,0.15)` |
| `--ring`                 | Lagoon `#0A645A`      | Emerald `#02C988`        |
| `--victory`              | Emerald `#02C988`     | Mint `#06FDAF`           |

**Key design decisions:**

- Light mode primary = Lagoon (authoritative, subdued). Dark mode primary = Emerald (high contrast on Pine).
- `--secondary` and `--muted` are intentionally darker than `--background` so hover states and muted surfaces are visible on Off-White.
- `--input` is lighter than `--border` for subtle input field boundaries.

### 2.3 Sidebar Tokens

| Token                          | Value                    | Notes                   |
| ------------------------------ | ------------------------ | ----------------------- |
| `--sidebar`                    | `rgba(9,40,42,0.97)`     | Pine (near-opaque)      |
| `--sidebar-foreground`         | `#F5F5ED`                | Off-White text          |
| `--sidebar-primary`            | `rgba(10,100,90,0.92)`   | Lagoon (active item bg) |
| `--sidebar-primary-foreground` | `#ffffff`                | White on Lagoon         |
| `--sidebar-accent`             | `rgba(245,245,237,0.1)`  | Off-White tint (hover)  |
| `--sidebar-accent-foreground`  | `#F5F5ED`                | Off-White               |
| `--sidebar-border`             | `rgba(255,255,255,0.08)` | Subtle white border     |
| `--sidebar-ring`               | `#0A645A`                | Lagoon focus ring       |

> **Note:** `--sidebar-accent` uses an Off-White tint, not Pine — Pine-on-Pine would be invisible.

### 2.4 What Changed from Demo

| Remove (Demo)                            | Replace With (Production)             |
| ---------------------------------------- | ------------------------------------- |
| `#1f6b5e` (old teal primary)             | `#0A645A` Lagoon                      |
| `#1a2926` (old dark green)               | `#09282A` Pine                        |
| `#1b4332` (old accent dark)              | `#0A645A` Lagoon or `#02C988` Emerald |
| `#f0f4f1` (old light green secondary)    | `#F5F5ED` Off-White                   |
| `#fcfdfc` (old background)               | `#F5F5ED` Off-White                   |
| `#d4ddd8` (old border)                   | `#C0BFBB` Light Grey                  |
| `#e2ebe6` (old input)                    | `#D6D6CE` (lighter than border)       |
| `#5a6b65` (old muted text)               | `#525252` Dark Grey                   |
| `#2f7f6b`, `#163a30` (sidebar gradient)  | Brand token utilities                 |
| `emerald-500` (Tailwind default)         | `brand-emerald` (`#02C988`)           |
| `rgba(70,194,167,...)` (old teal rgba)   | `rgba(2,201,136,...)` (Emerald)       |
| `rgba(31,107,94,...)` (old primary rgba) | `rgba(10,100,90,...)` (Lagoon)        |
| `rgba(20,53,46,...)` (old dark rgba)     | `rgba(9,40,42,...)` (Pine)            |

---

## 3. Typography

### 3.1 Font Family

**Geist** — already loaded via `next/font/google` in `app/layout.tsx`. No changes needed.

### 3.2 Type Scale

| Role       | Size            | Weight  | Usage                         |
| ---------- | --------------- | ------- | ----------------------------- |
| H1         | 2rem / 32px     | 700     | Page titles                   |
| H2         | 1.5rem / 24px   | 600     | Section headings              |
| H3         | 1.125rem / 18px | 600     | Card headers                  |
| Body       | 1rem / 16px     | 400     | Paragraph text                |
| Body Small | 0.875rem / 14px | 400     | Labels, captions, table cells |
| Caption    | 0.75rem / 12px  | 400–500 | Helper text, timestamps       |

---

## 4. Logo

### 4.1 Assets

```
public/brand/
  logomark-lagoon.svg       ← light backgrounds (primary)
  logotype-lagoon.svg       ← light backgrounds (primary)
  logomark-offwhite.svg     ← dark backgrounds (sidebar, Pine surfaces)
  logotype-offwhite.svg     ← dark backgrounds
```

### 4.2 Variant Selection

| Background                | Logo Variant |
| ------------------------- | ------------ |
| Off-White / White         | Lagoon       |
| Pine (dark mode, sidebar) | Off-White    |
| Lagoon surface            | Off-White    |
| Emerald surface           | Pine         |

### 4.3 Sizing

- Logotype minimum width: **120px**
- Logomark minimum size: **24×24px** (icon contexts), **32×32px** (general UI)
- Sidebar logomark: **32×32px** to **40×40px**

### 4.4 Prohibited

- Do not distort or alter proportions
- Do not tilt or rotate
- Do not alter colors outside approved variants
- Do not place on low-contrast backgrounds

---

## 5. Component Conventions

### 5.1 Buttons

| Variant             | Background  | Text           | Hover         |
| ------------------- | ----------- | -------------- | ------------- |
| `default` (primary) | Lagoon      | White          | Lagoon darker |
| CTA / accent        | Emerald     | Pine           | Mint          |
| `outline`           | Transparent | Lagoon         | Lagoon/10%    |
| `ghost`             | Transparent | Pine/Dark Grey | Off-White/bg  |
| `destructive`       | Red         | White          | Red darker    |

### 5.2 Cards

- Background: white `#ffffff` on Off-White page (subtle lift)
- Border: Light Grey `#C0BFBB`
- Shadow: `shadow-sm` default, `shadow-md` on hover

### 5.3 Sidebar

```
Background: Pine (#09282A) via --sidebar token
Active item: Lagoon (#0A645A)
Active text: Off-White (#F5F5ED)
Inactive text: Light Grey (#C0BFBB)
Inactive hover: rgba(255,255,255,0.06)
Logo: Off-White variant
```

### 5.4 Badges

| Context            | Colors                                    |
| ------------------ | ----------------------------------------- |
| Success / Verified | Emerald bg, Pine text                     |
| Active / Live      | Brand Emerald with pulse                  |
| Neutral            | Light Grey bg, Dark Grey text             |
| Warning            | Amber (keep as semantic hardcoded)        |
| Alert / Error      | Orange / Red (keep as semantic hardcoded) |

### 5.5 Data Tables

- Header: Off-White bg, Dark Grey text, uppercase, `0.75rem`
- Row hover: `rgba(10,100,90,0.04)` (Lagoon tint)
- Row border: Light Grey `#C0BFBB`

---

## 6. Brand Copy

**Primary tagline:** "From Ward to Victory"
**Supporting line:** "Empowering citizens, canvassers, and candidates with ward-level precision."

> Note: "Civic Intelligence Platform" was a demo-era descriptor and has been removed from the logo component.

---

## 7. Tailwind v4 Integration

Brand colors are exposed via `@theme inline` in `globals.css`:

```css
@theme inline {
  --color-brand-offwhite: #f5f5ed;
  --color-brand-pine: #09282a;
  --color-brand-lagoon: #0a645a;
  --color-brand-emerald: #02c988;
  --color-brand-mint: #06fdaf;
  --color-brand-darkgrey: #525252;
  --color-brand-lightgrey: #c0bfbb;
}
```

This enables utilities: `bg-brand-lagoon`, `text-brand-pine`, `border-brand-emerald/20`, etc.

---

## 8. Implementation Checklist

- [x] `src/app/globals.css` — CSS custom properties updated (`:root` + `.dark` + `@theme inline`)
- [x] `public/brand/` — logo SVGs added (4 files: logomark + logotype × lagoon + offwhite)
- [x] `src/components/layout/logo.tsx` — refactored to use SVG logomark via `next/image`
- [x] `src/components/admin/admin-sidebar.tsx` — uses logomark via `next/image`, no hardcoded gradient hex
- [x] `src/components/candidate-dashboard/app-sidebar.tsx` — uses logomark via `next/image`, no hardcoded gradient hex
- [x] All provisional hex values removed (grep confirms zero matches)
- [x] All `emerald-500` Tailwind utilities replaced with `brand-emerald`
- [x] Landing page gradients updated to brand rgba values
- [x] `public/wardwise-logo.svg` — updated with brand colors
- [x] `src/app/icon.svg` — favicon with W mark (Off-White on Pine)
- [ ] Dark mode tested (Pine bg, Emerald primary, Off-White text)
- [ ] `pnpm build` passes
