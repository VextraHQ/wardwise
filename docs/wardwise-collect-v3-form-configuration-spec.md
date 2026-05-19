# WardWise Collect v3 — Form Configuration + Verification Intelligence Spec

> Focused implementation spec for campaign-level form configuration, support-group capture, and verification-aware reporting.
> Last updated: 2026-05-19
> See also: `wardwise-collect-spec.md` (v1 canonical), `wardwise-collect-v2-spec.md`, `campaign-insights-spec.md`, `auth-system-spec.md`

---

## Status

- **Shipped** — all Phase 1–4 scope implemented
- **Direction chosen** — verification requirements move to per-campaign form configuration ✓
- **Direction chosen** — support-group capture becomes a first-class campaign field, not a generic custom question ✓
- **Direction chosen** — active campaigns can be updated in place; the public slug/link stays the same ✓
- **Direction chosen** — optional verification fields improve submission accessibility, while reporting makes missing verification visible ✓
- **Shipped** — opt-in registration receipt email now lives on the final review step, gated by campaign setting + valid email + configured transport

---

## Why This Exists

Collect v1/v2 proved the data pipeline, but client feedback exposed a product gap:

- compulsory `Membership / NIN` and `VIN` create distrust and reduce completion
- some campaigns want softer support capture, others still want stricter verification
- support groups / associations are politically meaningful and should be visible in exports and reporting
- candidates care about analytics, not just raw form collection

This spec defines the next layer:

- lower-friction public submission
- campaign-specific field rules
- better reporting of verification coverage
- better grouping of supporters by political/support structures

---

## Product Goals

1. Make the public form easier to complete without killing trust.
2. Let active campaigns relax or expand their form without changing the shared public link.
3. Keep the admin side truthful about weaker verification coverage when fields become optional.
4. Capture support-group affiliation in a way that is useful for exports, tables, and future analytics.
5. Preserve room for future survey-style custom questions instead of burning that feature on a common structured field.

---

## Core Decisions

### 1. Verification is per campaign, not global

Each campaign controls:

- `Membership / NIN`: `required | optional`
- `VIN`: `required | optional`

This allows:

- strict verification campaigns
- softer registration campaigns
- active-campaign changes without forcing a new slug

### 2. Support group is first-class, not a custom question

Campaign-level setting:

- `Support group field`: `off | optional`
- `Public label`: editable, default `Support group / association`

Reason:

- custom questions are for future survey/preset/manual prompts
- support-group data should appear consistently in:
  - submissions tables
  - detail sheets
  - exports
  - reporting
  - future filters/analytics

### 3. Email receipt is opt-in and privacy-aware

If enabled later, the user sees:

- `Email me my registration receipt`

Not:

- `Email me all my responses`

The receipt should contain confirmation-oriented details, not full sensitive identity values.

---

## Before / After Mental Wireframe

### Before

```text
Campaign Settings
- no verification flexibility
- no structured support-group field

Public Step 3
- Membership / NIN: required
- VIN: required

Public Step 4
- Role only

Admin / Reporting
- group/association data not structured
- no verification coverage analytics
```

### After

```text
Campaign Settings
--------------------------------------------------
Form Configuration

Verification Requirements
Membership / NIN   [ Required | Optional ]
VIN                [ Required | Optional ]

Support Network
Support group field   [ Off | Optional ]
Public label
[ Support group / association ]

Public Step 3
--------------------------------------------------
Verification Details

Membership / NIN   [Required/Optional]
- choose Membership or NIN if filled

VIN   [Required/Optional]

Public Step 4
--------------------------------------------------
Role & Support Network

Role
[ Volunteer ] [ Member ] [ Canvasser ]

Support group / association [Optional]
[ ________________________ ]

Public Step 5
--------------------------------------------------
Review & Submit

- full summary before submit
- section-level Edit actions
- "Save & Return" flow when editing from review
- optional receipt email checkbox when available

Admin / Campaign Insights
--------------------------------------------------
Supporters Table
Name | Phone | Ward | Role | Group | Status | Date

Overview / Analytics
- With VIN
- Missing VIN
- With Membership / NIN
- Missing Membership / NIN
- With Support Group
- Top Support Groups
```

---

## Scope

### In scope

- per-campaign verification requirements
- first-class optional support-group field
- public form updates
- admin campaign settings updates
- server validation and submission persistence updates
- admin submissions detail/export visibility
- Campaign Insights reporting updates
- active-campaign safe rollout behavior
- focused docs updates

### Out of scope for initial implementation

- hard dedupe by membership/NIN
- admin-managed dropdown lists of support groups
- group autocomplete
- self-service candidate write access
- SMS sending
- rich survey builder replacing custom questions

### Phase 2 / follow-up scope

- support-group filters
- “missing verification” quick filters
- richer Top Groups charts
- possible admin-defined support-group options for cleaner analytics

---

## Data Model

### Campaign

Add:

- `identityRequirement` — `"required" | "optional"`
- `voterIdRequirement` — `"required" | "optional"`
- `supportGroupFieldMode` — `"off" | "optional"`
- `supportGroupFieldLabel` — `String?`
- `receiptEmailMode` — `"off" | "opt_in"`

### CollectSubmission

Add:

- `identityType` — `"membership" | "nin" | null`
- `supportGroupName` — `String?`
- `supportGroupKey` — `String?`
- `wantsEmailReceipt` — `Boolean @default(false)`
- `receiptEmailSentAt` — `DateTime?`

### Important note

Persisting `identityType` becomes more important once `identityValue` is optional. Without it, later reporting cannot reliably distinguish:

- party membership identifiers
- NIN-based identifiers

### Support group normalization

Persist two forms:

- `supportGroupName` = human-facing trimmed value
- `supportGroupKey` = normalized grouping key

Normalization rules:

- trim outer whitespace
- collapse repeated internal spaces
- lowercase
- strip non-essential punctuation noise for grouping only

Goal:

- `MGM Support Group`
- `mgm support group`
- `MGM   Support   Group`

should group together analytically while still preserving the supporter’s typed display value.

---

## Admin UX

### Campaign Settings

Add a new `Form Configuration` section.

```text
Form Configuration
--------------------------------------------------
Verification Requirements

Membership / NIN
[ Required ] [ Optional ]

Voter ID (VIN)
[ Required ] [ Optional ]

Support Network

Support group field
[ Off ] [ Optional ]

Public label
[ Support group / association ]

Helper
Optional fields reduce friction, but weaker verification may increase manual review later.
```

### Active campaign behavior

This must work on active campaigns.

Public rule:

- same campaign
- same slug
- same public link
- new settings take effect immediately for new visits/submits

### Active campaign warnings

`Required -> Optional`

- safe
- no heavy warning required

`Optional -> Required`

- allowed, but requires warning
- message should explain that:
  - saved progress may need updating
  - offline queued rows may fail if missing newly required data

Suggested warning:

```text
You are making this active form stricter.
People who already started the form may need to complete the new required fields before submitting.
```

---

## Public Form UX

### Step 3 — Verification Details

Behavior:

- show `Required` or `Optional` badges per field
- keep the explanation calm and trust-oriented
- do not imply suspicious use of IDs

Suggested content model:

```text
Verification Details

Membership / NIN [Required/Optional]
This helps the campaign verify your registration.

VIN [Required/Optional]
This can help reduce duplicate records and improve verification.
```

### Identity input logic

If the user fills identity:

- they must choose `Party Membership` or `National ID (NIN)`
- entered value must match the chosen method

If identity is optional and left blank:

- allow progression

### Step 4 — Role & Support Network

Place support-group field near role, not identity.

Reason:

- it is a network/affiliation detail
- it reads more naturally beside supporter role
- it reduces the “KYC” feel of Step 3

Suggested layout:

```text
Role & Support Network

Role
[ Volunteer ] [ Member ] [ Canvasser ]

Support group / association [Optional]
[ ________________________ ]
```

### Step 5 — Review & Submit

The public form now ends with a dedicated review step before the confirmation screen.

Goals:

- give supporters one final calm summary
- make receipt opt-in feel like a delivery preference, not a random side field
- allow targeted edits without walking through every later step again

Suggested interaction:

```text
Review & Submit

Personal Details      [ Edit ]
Location              [ Edit ]
Verification          [ Edit ]
Role & Support        [ Edit ]
Canvasser Referral    [ Edit ]
Receipt Email         [ Optional checkbox when available ]

[ Back ] [ Submit Registration ]
```

### Edit and return behavior

If a supporter taps `Edit` from review:

- they are taken to the relevant step
- the primary action becomes `Save & Return`
- after validation, they jump straight back to review

Special case:

- editing `Role & Support` may still route through the canvasser referral step when the selected role requires it

Safety rule:

- if the supporter exits an edit via `Return to review`, the previously reviewed snapshot is restored so half-finished edits do not leak back into the summary

### Why not use custom questions here?

Because this field is not merely “extra text.” It should later support:

- reporting
- filtering
- grouped exports
- future “Top Groups” analytics

Custom questions remain available for genuine survey prompts.

---

## Validation Rules

### Membership / NIN

If campaign setting = `required`:

- `identityType` required
- `identityValue` required
- validate by chosen method

If campaign setting = `optional`:

- both fields may be blank
- if one is present, require the other
- still validate by chosen method when provided

### VIN

If campaign setting = `required`:

- required
- must pass existing VIN format validation

If campaign setting = `optional`:

- blank allowed
- still validate format when provided

### Support group / association

Always optional in v1.

Rules:

- trim outer whitespace
- collapse repeated spaces
- max length: `80` or `100`
- if non-empty, require at least one letter or number
- do not enforce narrow party-specific formatting rules

### Recommended validation tone

Avoid hard-edged wording like:

- `Invalid group`

Prefer:

- `Enter a short group or association name`

---

## Server Submit Behavior

### Deduplication

Keep:

- phone as required + hard unique per campaign

Adjust:

- VIN dedupe only runs when VIN is present

Do not add:

- hard dedupe by membership/NIN in v1 of this change

Reason:

- the trust problem is already high
- the immediate goal is lower-friction capture, not stricter exclusion

### Persistence

Store:

- `identityType`
- `identityValue`
- `voterIdNumber`
- `supportGroupName`
- `supportGroupKey`

---

## Admin Submissions UX

### Table

Keep the table lean.

Add:

- `Group` column only when support-group field is enabled for the campaign

Suggested table:

```text
Name | Phone | Ward | Role | Group | Status | Date
```

Do not move `Membership / NIN` and `VIN` into the main scanning table.

They stay in:

- detail sheet
- export

### Detail sheet

Add:

- `Identity type`
- `Membership / NIN`
- `VIN`
- `Support Group`

### Search

Extend supporter search to include:

- support group name

### Future admin filters

Planned follow-up:

- `Has VIN`
- `Missing VIN`
- `Has Identity`
- `Missing Identity`
- `Support Group`

---

## Campaign Insights / Reporting UX

This is the part political clients will actually feel as “analytics.”

### Overview additions

Add cards or readable metrics for:

- `With VIN`
- `Missing VIN`
- `With Membership / NIN`
- `Missing Membership / NIN`
- `With Support Group`

### Analytics additions

Add:

- `Top Support Groups`
- `Support Group Capture Rate`
- `Verification Coverage`

Suggested metrics:

- `% with VIN`
- `% with Membership / NIN`
- `% with both`
- `% with support group`

### Supporters tab

Show `Group` column when relevant.

Detail sheet should show:

- support group
- identity type
- identity / VIN values when available

### Suggested follow-up exports

High-value export ideas:

- `Supporters missing VIN`
- `Supporters missing Membership / NIN`
- `Supporters missing any verification detail`
- `Supporters by group`

These are highly practical for campaign follow-up work.

---

## Email Receipt Feature

### Recommendation

Add later as an opt-in feature:

- `Email me my registration receipt`

Do not implement as:

- `Email me all my answers`

### Why

People already distrust entering IDs.

Sending back full raw values for:

- NIN
- VIN
- phone

by email can make the product feel less safe, not more.

### Receipt content

Include:

- campaign/candidate name
- registration reference
- submitted at
- LGA / ward / polling unit
- role
- support group if provided
- review/verification next-step copy

Avoid including:

- full NIN
- full VIN
- raw sensitive answer dump

### Delivery rules

Only show the opt-in control if:

- email field is present and valid
- campaign receipt email mode is enabled
- email transport is configured

Offline behavior:

- if selected offline, send only after successful sync

---

## Edge Cases and Failure Handling

### 1. Active campaign relaxed

Case:

- `required -> optional`

Handling:

- safe
- apply immediately
- no slug change
- no migration of existing submissions needed

### 2. Active campaign tightened

Case:

- `optional -> required`

Handling:

- warning before save
- saved progress may need updated fields
- offline rows may fail on sync if missing newly required data

### 3. Saved local progress

Handling:

- re-read campaign rules before final submit
- if stricter rules now apply, route back to the affected step with clear explanation

### 4. Offline queued rows

Handling:

- validate against server truth during sync
- if rejected because rules became stricter, mark failed with a clear message
- support-group field being optional should not cause failures

### 5. Support-group label changes mid-campaign

Handling:

- public label may change
- exports and reporting keep a stable system label: `Support Group`

### 6. Messy manual group names

Handling:

- preserve raw display value
- group analytically by normalized key

### 7. Field disabled after use

Handling:

- old submissions keep stored values
- new submissions stop showing the field

### 8. Email receipt transport unavailable

Handling:

- hide the opt-in toggle
- do not expose a broken promise in the UI

---

## Build Order

### Phase 1 — Form configuration + persistence

- campaign schema/settings for:
  - `identityRequirement`
  - `voterIdRequirement`
  - `supportGroupFieldMode`
  - `supportGroupFieldLabel`
- submission schema/storage for:
  - `identityType`
  - `supportGroupName`
  - `supportGroupKey`
- public form updates
- server submit validation updates
- active campaign support

### Phase 2 — Admin visibility

- admin submissions table conditional `Group` column
- detail sheet additions
- export additions
- search by support group

### Phase 3 — Campaign Insights analytics

- verification coverage metrics
- support-group capture metrics
- supporters tab `Group` display
- Top Groups module
- follow-up export affordances

### Phase 4 — Optional email receipt

Implemented:

- campaign setting via `receiptEmailMode`
- public opt-in on the review step
- transactional registration receipt template
- delivery only when email is valid, campaign mode is enabled, and transport is configured
- offline-compatible behavior: queued submissions send the receipt only after a successful sync

---

## Definition of Done

### Product

- admins can relax or expand active campaigns without changing the public link
- public form feels less intimidating
- support-group capture is visible and useful in reporting
- candidates can see verification coverage, not just submission totals

### Engineering

- campaign settings and submit route use one source of truth for field requirements
- optional fields do not break existing active campaigns
- queued/offline failures are understandable
- reporting/export headers remain stable even when the public label changes

### UX

- required/optional states are visually clear
- support-group field is positioned naturally
- tables stay readable
- reporting emphasizes actionability, not just raw record counts

---

## Suggested Future Iterations

- admin-defined support-group suggestions or dropdown options
- support-group autocomplete on the public form
- group-level charts by LGA/ward
- “missing verification” saved filters
- role + group cross-tab analytics
- candidate-side filtered export presets such as:
  - `Missing VIN`
  - `Missing Identity`
  - `Top Groups`
