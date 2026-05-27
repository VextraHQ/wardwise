# WardWise Landing Page Revamp Spec

## Context

WardWise is starting to get real attention, and the landing page now needs to do a better job of explaining the product to non-technical political users.

The current site already has strong structure and visual treatment, but parts of the copy still feel:

- too technical for candidates and campaign managers
- too abstract in places
- slightly out of sync with the actual Collect and Reporting product
- not grounded enough in the Adamawa-specific reality we now have in the product

The goal of this pass is not to redesign the whole landing page. It is to make the page easier to understand, more politically credible, and more clearly tied to the actual value of WardWise Collect.

This spec also includes a support-center FAQ alignment pass, because the public support answers should match the same product story as the landing page.

There is also a visual-system alignment need: the landing page currently mixes a more editorial public-site feel with stronger cockpit/admin cues in some sections. The mix is not inherently wrong, but it now needs to feel intentional and systemized rather than accidental.

---

## Primary Goal

Help a non-technical candidate, campaign director, or politically active stakeholder understand:

1. what WardWise is
2. what WardWise Collect does
3. why it is better than generic forms, spreadsheets, notebooks, or WhatsApp updates
4. how it helps a real campaign make better field decisions

---

## Positioning Direction

WardWise should be presented as:

**A campaign field intelligence and supporter capture system built around real electoral geography.**

Not as:

- a generic data platform
- a civic-tech abstraction
- a technical dashboard demo
- an “advanced Google Form” with prettier UI

Core story:

**WardWise helps campaigns capture supporters from the field, organize them by LGA, ward, and polling unit, and use that information to make better campaign decisions.**

---

## Visual System Direction

### Landing mode vs cockpit mode

WardWise should not make the public landing page look exactly like the admin cockpit.

Instead:

- the landing page should feel **clearer, warmer, and more persuasive**
- the product-proof sections should borrow **selected operational cues** from the cockpit
- the full page should still feel like one brand family

### Intentional mix is allowed

This pass should not flatten sections that already look good.

The goal is:

- remove accidental inconsistency
- preserve intentional contrast
- protect sections that already have a strong public/product feel

So yes, the landing page can mix:

- calmer editorial sections
- more architectural or cockpit-adjacent product sections

as long as that contrast feels deliberate rather than random.

### Recommended ratio

Think of the landing page as:

- **70% landing/editorial**
- **30% cockpit/operational**

That means:

- the page should still feel premium and easy to understand for non-technical visitors
- only the sections that prove real product depth should lean more operational

### What should stay shared with the cockpit

These should feel consistent across public and admin surfaces:

- border color logic
- radius scale
- eyebrow/meta label language
- status-pill treatment
- typography hierarchy
- muted surface logic
- card spacing rhythm

### What should not be copied 1:1 from the cockpit

Avoid making the landing page feel like an admin dashboard by default.

Do not overuse:

- hard technical/internal codes
- overly dense panel stacks
- heavy operational chrome in every section
- admin-style information overload

### Section posture model

Use two visual postures on the landing page:

#### 1. Editorial sections

More open, more persuasive, more spacious.

Best for:

- How It Works
- Security
- CTA
- Support

#### 2. Operational sections

More structured, more data-shaped, more cockpit-adjacent.

Best for:

- Hero right-side command view
- Features
- Platform Pillars
- Impact
- Collect

### Shared shell rules

The landing page should use a limited number of shell styles, but it does not need to force every section into the same rounded bordered treatment.

Recommended:

1. **Open section shell**
   - mostly for narrative/editorial sections
   - uses spacing and typography as the primary structure

2. **Rounded bordered product surface**
   - for operational/product-proof sections
   - soft large radius
   - low-contrast border
   - restrained muted fill

Do not invent a new shell style per section without a clear reason.

Also:

- if a section already works well with a different but related shell treatment, preserve it
- alignment matters more than total visual sameness

### Radius and border discipline

The page should feel like one family.

Recommended:

- outer product modules: large rounded corners consistently
- inner cards: one smaller repeated radius
- avoid mixing sharp rectangles, rounded-sm, and very large radii without a hierarchy reason
- maintain one border opacity scale instead of section-specific random contrast

This does not mean every section must gain more rounded corners. If a section already feels right, leave it alone and align only the parts that feel out of family.

### Cockpit cues that are allowed

Use these selectively:

- eyebrow/meta labels
- dashed dividers
- state/status pills
- small operational summaries
- selector lists
- compact tables or path views
- map/report-style detail modules

### Cockpit cues that should be restrained

- pseudo-internal code names
- decorative system IDs that do not improve trust
- too many simultaneous data cards
- unnecessary technical abbreviations

---

## Top-to-Bottom Landing UX Pass

This pass should be reviewed as one continuous storytelling flow, not as disconnected sections.

### 1. Hero

Role:

- establish trust quickly
- explain WardWise clearly
- show one strong local proof point

Rules:

- keep Adamawa specificity here
- keep the right-side command panel operational and locally grounded
- do not broaden the hero into a generic all-Nigeria story
- the hero is the place where local realism is strongest

### 2. How It Works

Role:

- simplify the workflow
- reduce anxiety
- explain the product as a campaign process

Rules:

- should feel mostly editorial
- may keep subtle operational cues
- should not feel like a systems pipeline diagram

### 3. Features

Role:

- translate platform capabilities into campaign advantages

Rules:

- this can carry moderate cockpit flavor
- cards should feel structured and deliberate
- explanations should remain human and practical

### 4. Platform Pillars

Role:

- show how the system fits together

Rules:

- structured product surface is appropriate here
- card family should align with Features and Collect
- keep the hierarchy calm and readable

### 5. Impact

Role:

- show that WardWise scales beyond one live state without losing structure

Rules:

- keep this state-first, not wall-of-geography-first
- use a selector or guided path feel
- show the same hierarchy carrying from state to LGA to ward to polling unit
- this section should feel operational, but still easy to skim

Impact should not become:

- a random national heatmap
- a giant list of locations
- a generic “Nigeria expansion” boast

It should feel like:

- one live state example
- several next-state rollout paths
- one reusable geo structure

### 6. Security

Role:

- reassure without sounding paranoid or theatrical

Rules:

- keep it mostly editorial
- use cleaner trust language
- avoid “military-grade / sovereign-vault” overstatement

### 7. Collect

Role:

- prove the product in the clearest possible way

Rules:

- should be one of the strongest operational sections on the page
- may borrow cockpit cues more heavily than Security or CTA
- should feel like a real product module, not just a marketing card

### 8. CTA

Role:

- convert interest into demo/contact action

Rules:

- should become calmer again
- keep just enough system credibility
- do not overload the CTA with fake ops metadata

### 9. Support / FAQ

Role:

- reinforce understanding
- reduce confusion before contact

Rules:

- should feel editorial and helpful
- must use the same product voice as the landing page
- no separate “support department” language style

---

## Messaging Principles

### 1. Clarity over cleverness

If a phrase sounds premium but slows understanding, rewrite it.

### 2. Political realism over generic SaaS language

The copy should sound like it understands:

- ward politics
- local field operations
- grassroots mobilization
- campaign decision-making

### 3. Real geography builds trust

Use real Adamawa references where appropriate instead of placeholder territory labels.

### 4. Collect should be easy to explain

The user should quickly understand:

- supporters are captured in the field
- data is structured around where elections happen
- campaign teams can act on the results

### 5. Public copy must match product truth

No claims that overstate current product behavior.

---

## Critical Files

| Layer | File |
|---|---|
| Landing entry | `src/app/page.tsx` |
| Hero | `src/features/public-site/components/landing/hero.tsx` |
| Shared landing copy/data | `src/features/public-site/lib/landing-data.ts` |
| How it works | `src/features/public-site/components/landing/how-it-works.tsx` |
| Features | `src/features/public-site/components/landing/features.tsx` |
| Platform pillars | `src/features/public-site/components/landing/platform-pillars.tsx` |
| Impact | `src/features/public-site/components/landing/impact.tsx` |
| Collect section | `src/features/public-site/components/landing/collect-section.tsx` |
| Support page | `src/features/public-site/components/support/support-content.tsx` |
| Support FAQ data | `src/lib/constants/support-data.ts` |

---

## Phase 1 — Messaging Cleanup

### Objective

Establish a cleaner messaging baseline across the whole landing page.

### Required copy changes

- Reduce technical/internal labels like:
  - `PROC_FLOW_V1.4`
  - `SYS_ARCH`
  - `MOD_CORE`
  - `TRK_GEN_08`
  - `NODE_SYNC_BASE`
- Keep the visual tone premium, but remove labels that feel like internal system codes unless they meaningfully aid trust.
- Replace vague product language with concrete political outcomes.

### Tone direction

Prefer:

- “supporters”
- “field teams”
- “wards and polling units”
- “real-time campaign picture”
- “where support is growing”
- “where the campaign needs attention”

Avoid leaning too heavily on:

- “campaign intelligence platform” without explanation
- “civic intelligence engine”
- “proprietary” unless the claim is essential
- “constituents” when “supporters” is clearer

---

## Phase 1B — Visual System Alignment

### Objective

Turn the landing page into a deliberate public-facing design system rather than a section-by-section mix of admin and editorial patterns.

### Required outcomes

- define which sections are editorial vs operational
- align radius, border, and surface logic across the page where needed
- keep cockpit cues only where product proof matters
- remove accidental inconsistency between sections
- do not rewrite strong sections just for sameness

### Key decisions

#### Hero

- keep Adamawa-specific proof
- preserve operational right-side module
- preserve the architectural/cockpit cues on the right side

#### Impact

- use a guided rollout view
- state selector on the left
- structured geo detail on the right
- state-first reading model, ward/polling-unit one layer deeper
- bring it closer to the product-proof family without cloning the hero

#### Collect

- preserve stronger product-module feel

#### Security / CTA / Support

- remain calmer and more editorial

### Protection rule

If a section already looks good and matches its intended posture, do not “fix” it just to make it more similar to another section.

Examples:

- Hero right-side command view should keep its architectural/cockpit cues
- Collect can keep a stronger rounded product-surface feel
- Impact can be aligned without being visually identical to Hero or Collect

### Clean PR framing

This should be implemented as a focused **landing visual-system alignment PR**, not as an unbounded redesign.

The PR should cover:

- section-shell consistency
- radius/border/surface consistency
- impact-section geo rollout treatment
- cockpit-cue restraint and placement
- support/FAQ voice alignment if still pending

---

## Phase 2 — Hero Refinement

### Objective

Keep the hero layout and visual direction, but make the right-side demo panel and supporting language more credible and locally grounded.

### Keep

- current two-column structure
- major headline treatment
- trust/benefit point layout
- overall visual quality

### Change

- Replace inaccurate or generic geography labels.
- Use real Adamawa context in the right-side command hub.

### Example direction

Replace:

- `Node: Adamawa Central • Northern Geo-Zone`

With something like:

- `Yola Command Node • Adamawa State • North East`
- or `Adamawa Central Senatorial District • North East`

### Demo data direction

Use real Adamawa references where it improves trust:

- Yola North
- Yola South
- Fufore
- Girei
- Song
- Jambutu
- Karewa
- Ajiya

### Hero subcopy direction

The hero paragraph should clearly explain:

- WardWise helps campaigns capture and organize supporter data
- the data is tied to real electoral geography
- the result is better decision-making

Example direction:

> WardWise helps your campaign capture supporters from the field, organize them by LGA, ward, and polling unit, and see where support is growing in real time.

---

## Phase 3 — Section-by-Section Content Cleanup

### How It Works

Current section is visually strong but overly system-like.

Refocus the three-step story around:

1. Share or deploy the form
2. Capture supporters from the field
3. See where support is building and where to act next

The section should read like a campaign workflow, not a software pipeline.

### Features

Refine features so they sound like practical campaign advantages, not product specs.

Examples:

- `Granular Ward Mapping` → keep concept, simplify explanation
- `Field Synchronization` → explain as “works even in low-signal field conditions”
- `Role-Based Integrity` → explain in terms of controlled access and trustworthy records

### Platform Pillars

Simplify and humanize.

The current copy is visually polished but sometimes too abstract. Each pillar should answer:

- what this part of WardWise does
- why a campaign would care

### Impact

Reduce “national ambition” abstraction unless tied to a clear, simple meaning.

This section should emphasize:

- structured grassroots growth
- visibility across real locations
- credible field reporting

Impact should now be treated as a **guided rollout visual**, not just a copy block.

Preferred behavior:

- selector-style state list
- selected-state detail panel
- visible `state -> LGA -> ward -> polling unit` hierarchy
- one live proof state plus several next-state rollout paths

### Collect Section

This is one of the most important sections on the page.

It should answer plainly:

- what Collect is
- why campaigns need it
- why it is more useful than a generic form

Core explanation to anchor here:

> Collect is the field registration side of WardWise. It helps campaigns capture supporters in a structured mobile flow and immediately organize those records by the places that matter politically: LGAs, wards, and polling units.

### Strong product contrast

Collect should be framed as:

- more than a form
- more than a spreadsheet
- more than a notebook-and-WhatsApp workflow

It is:

- a supporter capture system
- a field operations tool
- a live feed into campaign reporting

---

## Phase 4 — Support Center / FAQ Alignment

### Objective

Make sure the support page explains the current product honestly and in the same voice as the landing page.

### Why this is needed

Current FAQ wording contains a few mismatches:

- too much “premier platform” / polished marketing language
- references that overstate current verification behavior
- language that does not match the new Collect v3/v4 positioning
- some older terms like PVC phrasing that are no longer the cleanest explanation path

### Required adjustments

- Reframe `What is WardWise?` in simpler, candidate-readable language
- Update the canvasser-related FAQ so it matches the actual field/referral model
- Remove or soften wording that sounds more advanced than the shipped product
- Ensure Collect is described as:
  - mobile field capture
  - ward/polling-unit organization
  - cleaner supporter intelligence for campaigns

### FAQ topics that should exist or be improved

1. What is WardWise?
2. What is WardWise Collect?
3. How is this different from Google Forms or spreadsheets?
4. How does WardWise help canvassers and field teams?
5. How is supporter data organized?
6. How does WardWise reduce duplicate or messy field records?
7. Is supporter data secure?

### Principle

The support center should not feel like a separate product voice.

Landing page, contact page, and support FAQs should all reinforce the same simple story.

---

## Phase 5 — Candidate-Facing Pitch Consistency

### Objective

Ensure the landing page aligns with the candidate pitch language used in demos, outreach, and contact follow-up.

### Core candidate value statement

WardWise should consistently communicate that it helps campaigns:

- capture real supporters from the field
- organize support by actual electoral geography
- understand where support is strong or weak
- coordinate field teams better
- make faster, more informed campaign decisions

### Practical Adamawa framing

For Adamawa-specific outreach, the site should feel like it understands the operating reality of:

- state-level races
- LGA-level differences
- ward-level organizing
- polling-unit-based mobilization

---

## Suggested Copy Direction

### Short version

> WardWise helps campaigns capture supporters from the field, organize them by LGA, ward, and polling unit, and see where support is growing in real time.

### Slightly longer version

> WardWise gives your campaign one clear system for collecting supporter data from the field, reducing messy records, and turning grassroots activity into useful political insight.

### Collect-specific version

> WardWise Collect is the field registration side of the platform. It helps your team register supporters in a mobile-friendly flow and immediately feed those records into a structured campaign reporting system.

---

## Non-Goals

This pass should not:

- redesign the full page structure from scratch
- introduce new product claims that are not yet shipped
- turn the landing page into a technical architecture showcase
- widen into unrelated dashboard or product redesign work
- make the public landing page visually identical to the admin cockpit

---

## Verification

### Content verification

1. A non-technical campaign manager should understand what WardWise does within the hero and first two sections.
2. A candidate should be able to explain Collect after reading the Collect section once.
3. Support FAQ answers should match the actual shipped product behavior.
4. Adamawa references should feel real, not placeholder.

### UI verification

1. Hero right-side demo panel still looks premium after data/content changes.
2. Mobile readability remains strong.
3. No section becomes too dense after copy cleanup.
4. Impact reads as a guided geo rollout path, not a wall of locations.
5. The landing page feels like one intentional visual family from top to bottom.
6. Editorial sections and operational sections feel deliberately different, not randomly inconsistent.

---

## Implementation Note

This should be treated as a **copy, positioning, and landing visual-system alignment pass**, not a full visual rebuild.

The visual language already has strong ingredients. The opportunity now is to make it:

- easier to understand
- easier to trust
- easier to sell
- more internally consistent
- more clearly separated from the admin cockpit without losing product credibility
