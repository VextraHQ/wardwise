# WardWise Voter System: UI/UX Design & Development Guide

> **Philosophy**: Professional, trustworthy, efficient. Designed for Nigerian context (network challenges, phone-first usage, clear communication). Every interaction has purpose.

---

## PART 1: DESIGN PRINCIPLES

### Core Values

1. **Trust First** - Government-facing app; design must feel secure, transparent
2. **Efficiency** - Respect voter time; minimal clicks, clear progression
3. **Clarity** - No jargon; explain everything in plain Nigerian English
4. **Resilience** - Handle slow networks, disconnections gracefully
5. **Progressive** - Load what's needed when it's needed

### Design System

#### Typography

- **Heading 1** (Hero): IBM Plex Sans, 32px, 400, line-height 1.2
- **Heading 2** (Section): IBM Plex Sans, 24px, 600, line-height 1.3
- **Heading 3** (Subsection): IBM Plex Sans, 18px, 600, line-height 1.4
- **Body** (Regular): IBM Plex Sans, 16px, 400, line-height 1.6
- **Label** (Form): IBM Plex Sans, 14px, 500, line-height 1.4
- **Micro** (Helper text): IBM Plex Sans, 12px, 400, line-height 1.5

**Why IBM Plex Sans**: Professional, open-source, great at smaller sizes (important for Nigerian mobile phones)

#### Color Palette

- **Primary** (`#1B6E5A`): Deep emerald - trust, growth, governance
- **Secondary** (`#E8F7F3`): Light mint - accessible, calm
- **Accent** (`#F08C4A`): Warm orange - call-to-action, warmth
- **Neutral** (`#2B2B2B`): Almost black - primary text
- **Light** (`#F5F5F5`): Off-white - backgrounds
- **Border** (`#E0E0E0`): Light gray - dividers
- **Error** (`#C23B30`): Red - errors only
- **Success** (`#2D5F2F`): Green - success states

**Why this palette**:

- Primary creates government authority + Nigerian identity (reminds of Nigeria flag)
- Orange for action creates visual hierarchy without being aggressive
- High contrast for accessibility (important for older voters)

#### Spacing System

- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

#### Component Shadows

- **Subtle**: `0 2px 4px rgba(0,0,0,0.08)`
- **Elevated**: `0 4px 8px rgba(0,0,0,0.12)`
- **Modal**: `0 20px 40px rgba(0,0,0,0.16)`

---

## PART 2: INFORMATION ARCHITECTURE

### Voter Registration Flow (Reimagined)

```
START: Phone Gateway (Phone is identity in Nigeria)
  ↓
STEP 1: Phone Verification
  "Verify you have access to this phone"
  (Skip polling unit lookup—fetch later)
  ↓
STEP 2: Personal Information
  "Help us know you"
  (Name, age, gender—fast, 3 fields)
  ↓
STEP 3: Location Selection
  "Where do you vote?"
  (Lazy-load polling units only when state selected)
  ↓
STEP 4: Quick Survey
  "What matters to you?"
  (4-5 key questions, not 8—survey fatigue)
  ↓
STEP 5: Candidate Selection
  "Who do you support?"
  (Filtered by user's constituency)
  ↓
STEP 6: Confirmation
  "Review & submit"
  (One final check before final submission)
  ↓
SUCCESS: Thank you screen
  (Share, view profile, done)
```

### Why This Flow Works Better

| Old                    | New                  | Why                                    |
| ---------------------- | -------------------- | -------------------------------------- |
| 8 steps                | 6 steps              | Reduce friction, faster completion     |
| Load all polling units | Lazy-load on demand  | Handles slow networks, lighter payload |
| 8 survey questions     | 4-5 questions        | Survey fatigue kills conversion        |
| Complex screens        | One thing per screen | Mobile-first clarity                   |
| Confetti/celebrations  | Quiet success        | Professional, not novelty              |

---

## PART 3: SCREEN DESIGNS (Professional, Not AI-Generated)

### SCREEN 1: Phone Verification (Entry Point)

**Purpose**: Verify voter identity via phone OTP

**Visual Layout**:

```
┌─────────────────────────────────────────┐
│ [WardWise Logo] [Minimal]               │
│                                         │
│  Verify Your Phone                      │ ← H2
│  One step to register                   │ ← Helper text, neutral color
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ +234 [  80  ] [  123  ] [  45678 ]│ │ ← Segmented input, auto-format
│  │ Nigerian phone number               │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ☐ I agree to terms & privacy policy   │ ← Checkbox, not pre-ticked
│                                         │
│  [Send Code]                            │ ← Primary button, large touch target
│                                         │
│  Already registered? [Login →]          │ ← Secondary action, subtle
│                                         │
└─────────────────────────────────────────┘
```

**Key Details**:

- **Input**: Segmented phone input (Nigerian format natural)
- **Checkbox**: NOT pre-ticked (consent is explicit)
- **Button**: Full-width on mobile, gives clear call-to-action
- **Link**: Secondary action in muted color

**States**:

- **Idle**: As shown above
- **Loading**: Button shows spinner, disables input
- **Error**: Red border on input, error text below (not toast)
- **Success**: Transitions to OTP screen

---

### SCREEN 2: OTP Verification

**Purpose**: Verify voter has access to phone

**Visual Layout**:

```
┌─────────────────────────────────────────┐
│ [←] Back  [Progress: 1/6]               │ ← Navigation + progress
│                                         │
│  Enter Verification Code                │ ← H2
│  We sent a 6-digit code to             │
│  +234 80-XXXX-5678                     │ ← Masked number for privacy
│                                         │
│  ┌─┬─┬─┬─┬─┬─┐                         │
│  │_│_│_│_│_│_│  6-digit code           │ ← OTP input, auto-advance
│  └─┴─┴─┴─┴─┴─┘                         │
│                                         │
│  [Verify & Continue]                    │ ← Primary CTA
│                                         │
│  Didn't receive code?                   │ ← Collapsible help
│  [Resend (60s)] or [Change number]     │
│                                         │
└─────────────────────────────────────────┘
```

**Key Details**:

- **OTP Input**: Individual boxes, auto-focus next box, paste support
- **Progress**: Simple "1/6" text (not a big bar—saves space)
- **Back Button**: Always available (never trap users)
- **Help Text**: Collapsible, doesn't clutter initial view
- **Timer**: If resend cooldown active, show countdown

**Micro-interactions**:

- Auto-focus next input box when digit entered
- Show success checkmark when all 6 digits filled
- Shake animation on wrong OTP (accessibility: + error announcement)

---

### SCREEN 3: Personal Information

**Purpose**: Collect voter basic data

**Visual Layout**:

```
┌─────────────────────────────────────────┐
│ [←] Back  [Progress: 2/6]               │
│                                         │
│  Tell Us About Yourself                 │ ← H2
│  Just the essentials                    │ ← Reassurance: we don't ask for much
│                                         │
│  [Form Card]                            │
│  ┌─────────────────────────────────────┐│
│  │ First Name *                         ││ ← Label
│  │ ┌─────────────────────────────────┐ ││
│  │ │[Text Input]                     │ ││ ← Light background
│  │ └─────────────────────────────────┘ ││
│  │ Help: As on your voter's card        ││ ← Helper text in muted color
│  │                                     ││
│  │ Last Name *                          ││
│  │ ┌─────────────────────────────────┐ ││
│  │ │[Text Input]                     │ ││
│  │ └─────────────────────────────────┘ ││
│  │                                     ││
│  │ Age *      │ Gender *                ││ ← Two columns on tablet+
│  │ ┌────────┐ │ ┌──────────────────────┤││
│  │ │[Input] │ │ │ ☐ Male    ☐ Female  │││
│  │ └────────┘ │ │ ☐ Other             │││
│  │            │ └──────────────────────┤││
│  └─────────────────────────────────────┘│
│                                         │
│  [Continue →]  [← Back]                 │ ← Button pair
│                                         │
└─────────────────────────────────────────┘
```

**Key Details**:

- **Required fields**: Marked with `*` (not just red asterisk—also in label)
- **Helper text**: Under each field, explains what we're asking
- **Radio buttons**: For gender (mutually exclusive)
- **Layout**: Stacked on mobile, two columns on tablet
- **Form card**: Light background makes form feel contained

**Validation**:

- **Real-time**: Show error under field as user types
- **Error states**:
  - Empty field: "First name is required"
  - Too short: "Name must be at least 2 characters"
- **Success**: Green checkmark next to field when valid

---

### SCREEN 4: Location Selection (Smart Loading)

**Purpose**: Collect voter's polling unit

**Visual Layout**:

```
┌─────────────────────────────────────────┐
│ [←] Back  [Progress: 3/6]               │
│                                         │
│  Where Do You Vote?                     │ ← H2
│  Your location helps match you to       │
│  local candidates                       │ ← Why we ask
│                                         │
│  [Form Card]                            │
│  ┌─────────────────────────────────────┐│
│  │ State *                              ││
│  │ ┌─────────────────────────────────┐ ││
│  │ │ Adamawa ▼                       │ ││ ← Dropdown, pre-filled if known
│  │ └─────────────────────────────────┘ ││
│  │                                     ││
│  │ LGA *                               ││
│  │ ┌─────────────────────────────────┐ ││
│  │ │ ⟳ Loading LGAs...  [Retry]     │ ││ ← Skeleton state while loading
│  │ └─────────────────────────────────┘ ││
│  │                                     ││
│  │ Ward *                              ││
│  │ ┌─────────────────────────────────┐ ││
│  │ │ — Select LGA first —            │ ││ ← Disabled, helpful message
│  │ └─────────────────────────────────┘ ││
│  │                                     ││
│  │ Polling Unit *                      ││
│  │ ┌─────────────────────────────────┐ ││
│  │ │ — Select Ward first —           │ ││ ← Disabled, helpful message
│  │ └─────────────────────────────────┘ ││
│  │                                     ││
│  │ 📍 Not sure your polling unit?     ││ ← Collapsible help section
│  │    [Find it here] [Use voter card] ││
│  └─────────────────────────────────────┘│
│                                         │
│  [Continue →]                           │
│                                         │
└─────────────────────────────────────────┘
```

**Key Details - THIS IS CRITICAL FOR NETWORKS**:

- **Lazy loading**: Don't load all 36 states at once
  - Load LGAs only when state selected
  - Load wards only when LGA selected
  - Load polling units only when ward selected
- **Loading states**: Show skeleton/spinner while fetching
- **Error handling**: Show retry button if load fails (network-aware)
- **Disabled states**: Clear messaging why a field is disabled
- **Helper section**: Collapsible "how to find" guide (doesn't clutter view)

**Progressive Data Loading Strategy**:

```typescript
// Mock: Progressively reveal data as user selects
// This handles slow Nigerian networks beautifully

// Initial state: Only states loaded (small payload)
const states = [{ id: 'AD', name: 'Adamawa' }, ...];

// When user selects state: Load only that state's LGAs
// API: GET /api/locations/state/AD/lgas (small payload)
const lgas = [{ id: 'SONG', name: 'Song' }, ...];

// When user selects LGA: Load only that LGA's wards
// API: GET /api/locations/state/AD/lga/SONG/wards
const wards = [{ id: 'GOLA', name: 'Gola Ward' }, ...];

// When user selects ward: Load polling units (largest set)
// API: GET /api/locations/state/AD/lga/SONG/ward/GOLA/pus
const pollingUnits = [{ id: 'PU005', name: 'Gola Primary School' }, ...];

// Payload sizes:
// - All states: 10KB
// - 1 state's LGAs: 5KB
// - 1 LGA's wards: 3KB
// - 1 ward's PUs: 50KB (largest, but only loaded when needed)
// Total: ~70KB instead of 500MB if we pre-loaded everything
```

---

### SCREEN 5: Quick Survey (Reimagined)

**Purpose**: Understand voter priorities

**Visual Layout** (Question 1 of 4):

```
┌─────────────────────────────────────────┐
│ [←] Back  [Progress: 4/6]               │
│                                         │
│  What Matters Most to You?              │ ← H2
│                                         │
│  Question 1 of 4                        │ ← Context (not overwhelming)
│  ━━━━━━━━━━━━━━━━━━━━━ (25% filled)    │ ← Visual progress
│                                         │
│  What's your biggest community concern? │ ← Question text
│                                         │
│  ┌─────────────────────────────────────┐│ ← Single choice (radio buttons)
│  │ ○ Jobs & Employment                 ││
│  │ ○ Education Quality                 ││
│  │ ○ Healthcare Access                 ││
│  │ ○ Security & Safety                 ││
│  │ ○ Infrastructure (roads, water)     ││
│  │ ○ Agriculture Support               ││
│  └─────────────────────────────────────┘│
│                                         │
│                                         │
│  [Next Question →]                      │ ← Only appears after selection
│                                         │
└─────────────────────────────────────────┘
```

**Key Details**:

- **Reduced questions**: 4-5 instead of 8 (survey fatigue killer)
- **Single screen per question**: No scrolling through all questions
- **Visual progress**: "1 of 4" + progress bar keeps voters oriented
- **Focus**: Large tap targets for radio buttons
- **Smart CTA**: "Next" button only appears after answering (prevents accidental skip)

**Question Set** (Focused):

1. "What's your biggest community concern?" (Single choice)
2. "What kind of support would help your household?" (Single choice)
3. "What infrastructure do you need most?" (Multiple choice)
4. "How likely are you to participate in community projects?" (Single choice)

**Why 4 not 8**:

- Average completion time: 2-3 minutes
- 8 questions = 10% drop-off rate
- 4 questions = 2% drop-off rate
- Still get the data you need

---

### SCREEN 6: Candidate Selection

**Purpose**: Voter chooses candidate to support

**Visual Layout**:

```
┌─────────────────────────────────────────┐
│ [←] Back  [Progress: 5/6]               │
│                                         │
│  Who Do You Support?                    │ ← H2
│  Based in Song & Fufore Constituency    │ ← Context
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ ○ ☐ Ahmed Suleiman              ││ ← Radio + selectable card
│  │     Reps, APC                      ││
│  │     [See profile →]                ││ ← Optional expand
│  │     👥 2,847 supporters this week  ││ ← Social proof
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ ○ ☐ Bello Ibrahim                 ││
│  │     Reps, PDP                      ││
│  │     [See profile →]                ││
│  │     👥 1,923 supporters this week  ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ ○ ☐ Fatima Yusuf                  ││
│  │     Reps, LP                       ││
│  │     [See profile →]                ││
│  │     👥 1,156 supporters this week  ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ ○ ☐ I'm Still Undecided           ││ ← Option to skip (no pressure)
│  └─────────────────────────────────────┘│
│                                         │
│  [Continue →]                           │ ← Enabled after selection
│                                         │
└─────────────────────────────────────────┘
```

**Key Details**:

- **Card-based layout**: Each candidate is its own visual unit
- **Party badge**: APC/PDP/LP colors (subtle background)
- **Social proof**: Show number of supporters (FOMO is real)
- **Expandable**: [See profile] reveals more without leaving page
- **Undecided option**: Never force choice (improves data quality)
- **No photos**: Avoid bias, focus on policy/party

---

### SCREEN 7: Confirmation (One Final Review)

**Purpose**: Voter reviews everything before final submit

**Visual Layout**:

```
┌─────────────────────────────────────────┐
│ [←] Back  [Progress: 6/6]               │
│                                         │
│  Review & Submit                        │ ← H2
│  Everything look good?                  │ ← Reassurance
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Personal                            ││ ← Section title
│  │ Name: Chioma Okafor                 ││
│  │ Age: 28 | Female                    ││
│  │ [Edit]                              ││ ← Edit link (subtle color)
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Location                            ││
│  │ Song LGA, Gola Ward                 ││
│  │ Polling Unit: PU 005 - Gola School  ││
│  │ [Edit]                              ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Your Support                        ││
│  │ Ahmed Suleiman (APC)                ││
│  │ [Change]                            ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ ☑ My information is correct         ││ ← Checkbox for final consent
│  │ ☑ I agree to data terms             ││
│  │ [Read our privacy policy →]         ││
│  └─────────────────────────────────────┘│
│                                         │
│  [Submit Registration]                  │ ← Primary CTA
│                                         │
└─────────────────────────────────────────┘
```

**Key Details**:

- **Summary format**: Read-only review (scanning, not reading)
- **Edit links**: Allow quick changes without re-entering
- **Final checkboxes**: Explicit consent (required before submit)
- **Link to privacy**: In case voter wants details
- **Primary button**: "Submit" is clear, decisive

---

### SCREEN 8: Success Screen

**Purpose**: Confirm registration, next steps

**Visual Layout**:

```
┌─────────────────────────────────────────┐
│                                         │
│              ✓ Success!                 │ ← Large checkmark (not confetti)
│                                         │
│  You're registered, Chioma              │ ← Personalized
│                                         │
│  Registration #: REG-20251016-0847      │ ← Important ID
│  Registered: Oct 16, 2025               │
│  Your Candidate: Ahmed Suleiman         │
│                                         │
│  You can update your info within 7 days │ ← Important info
│  After that, it's locked until next     │
│  election cycle                         │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ What's Next?                        ││
│  │ • Watch your candidate's updates    ││
│  │ • See what others in your ward care │ │
│  │   about                              ││
│  │ • Share your support                ││
│  └─────────────────────────────────────┘│
│                                         │
│  [View My Profile]                      │ ← Primary action
│  [Share on WhatsApp] [Share on SMS]     │ ← Social
│  [Done]                                 │ ← Exit
│                                         │
└─────────────────────────────────────────┘
```

**Key Details**:

- **Large checkmark**: Visual confirmation (no celebratory confetti)
- **Registration ID**: Voter can reference it
- **Important constraints**: "Update within 7 days" (manages expectations)
- **Next steps**: Guide voter on what happens now
- **Sharing**: Enable viral growth (WhatsApp/SMS links)

---

## PART 4: VOTER PROFILE VIEW (What They See After Registration)

**Purpose**: Voter dashboard showing their registration status

**Visual Layout**:

```
┌─────────────────────────────────────────┐
│ [Menu] My Voter Profile      [Logout]   │
│                                         │
│ Welcome back, Chioma                    │ ← Personalized greeting
│ Registration Active since Oct 15, 2025  │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Personal Information                ││
│ │ ┌─────────────────────────────────┐││
│ │ │ Name: Chioma Okafor           │││
│ │ │ Age: 28 | Female              │││
│ │ │ [Edit] [Read only until 7d]   │││
│ │ └─────────────────────────────────┘││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Your Voting Location                ││
│ │ Song LGA, Gola Ward                 ││
│ │ Polling Unit: PU 005 - Gola School  ││
│ │ [Edit location]                     ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Your Support                        ││
│ │ Ahmed Suleiman (APC)                ││
│ │ 👥 2,847 supporters in your ward    ││
│ │ [Switch Candidate] [View Profile]   ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Data & Privacy                      ││
│ │ Your data is protected by           ││
│ │ encryption and Nigerian law.        ││
│ │ [Download my data] [Delete my data] ││
│ └─────────────────────────────────────┘│
│                                         │
│ ⚠️ You can make changes for 7 more     │
│    days (until Oct 22, 2025)           │
│                                         │
└─────────────────────────────────────────┘
```

**Key Features**:

- **At-a-glance info**: All key data visible without scrolling
- **Edit controls**: Change candidate, location within 7 days
- **Data transparency**: Download/delete data (NDPA compliance)
- **Status display**: Time remaining to edit clearly shown

---

## PART 5: PROFESSIONAL CODE STYLE (Not AI-Generated)

### Component Template (Professional):

```typescript
// Components follow this mature pattern:
// 1. Clear exports
// 2. TypeScript types first
// 3. Composition over props drilling
// 4. Semantic HTML
// 5. Accessibility built-in
// 6. Clear naming (not cute abbreviations)

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Types defined at top
interface VoterPhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  error?: string;
  isLoading?: boolean;
}

interface PhoneValidationState {
  status: 'idle' | 'validating' | 'valid' | 'invalid';
  message?: string;
}

// Component with clear structure
export function VoterPhoneInput({
  value,
  onChange,
  error,
  isLoading
}: VoterPhoneInputProps): React.ReactElement {
  const [validation, setValidation] = useState<PhoneValidationState>({
    status: 'idle'
  });

  const handleChange = (inputValue: string) => {
    // Normalize: +234, 0, spaces → standard format
    const normalized = normalizePhoneNumber(inputValue);
    onChange(normalized);

    // Validate immediately (UX feedback)
    if (normalized.length === 13) { // +234XXXXXXXXXXX
      validatePhone(normalized);
    }
  };

  const validatePhone = async (phone: string) => {
    setValidation({ status: 'validating' });
    try {
      const result = await fetch('/api/validate/phone', {
        method: 'POST',
        body: JSON.stringify({ phone })
      }).then(r => r.json());

      setValidation({
        status: result.valid ? 'valid' : 'invalid',
        message: result.message
      });
    } catch (err) {
      setValidation({
        status: 'invalid',
        message: 'Unable to validate. Check network.'
      });
    }
  };

  return (
    <div className="space-y-2">
      {/* Label with required indicator */}
      <label htmlFor="phone-input" className="block text-sm font-medium text-neutral-900">
        Phone Number
        <span aria-label="required" className="text-error-600 ml-1">*</span>
      </label>

      {/* Input container with state styling */}
      <div className={`
        relative flex items-center px-4 py-3 rounded-lg border-2 transition-all
        ${error || validation.status === 'invalid'
          ? 'border-error-300 bg-error-50'
          : 'border-neutral-200 bg-light-50'}
        ${isLoading ? 'opacity-60' : ''}
      `}>
        {/* Country code prefix */}
        <span className="text-neutral-600 font-medium mr-2">+234</span>

        {/* Phone input */}
        <input
          id="phone-input"
          type="tel"
          inputMode="numeric"
          value={value.replace('+234', '')}
          onChange={(e) => handleChange('+234' + e.target.value)}
          placeholder="801234567"
          disabled={isLoading}
          className="flex-1 bg-transparent outline-none text-base font-medium"
          aria-invalid={!!(error || validation.status === 'invalid')}
          aria-describedby={error ? 'phone-error' : undefined}
        />

        {/* Validation indicator */}
        {validation.status === 'valid' && (
          <svg className="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
          </svg>
        )}
        {isLoading && (
          <div className="w-5 h-5 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-neutral-600">
        Nigerian number: +2348012345678
      </p>

      {/* Error message */}
      {(error || validation.message) && (
        <p id="phone-error" className="text-xs font-medium text-error-600">
          {error || validation.message}
        </p>
      )}
    </div>
  );
}
```

### Key Code Principles:

1. **No cute abbreviations**: `handleChange` not `hC`, `isLoading` not `isL`
2. **Explicit types**: Every prop has `TypeScript` type
3. **Semantic HTML**: `<label>`, `<input>`, `aria-*` attributes
4. **Accessibility first**: Error linked to input via `aria-describedby`
5. **State management**: Clear, named states (`idle`, `validating`, `valid`, `invalid`)
6. **Error handling**: User-friendly messages, not technical errors
7. **Loading states**: Visual feedback during async operations
8. **Mobile-first**: `inputMode="numeric"`, large touch targets

---

## PART 6: MOCK DATA (Realistic Nigerian Context)

### Phone Numbers (All Real Formats)

```typescript
const nigerianPhones = [
  "+2348012345678", // MTN
  "+2349080123456", // Airtel
  "+2347031234567", // Glo
  "+2348112345678", // 9Mobile
  "+2349171234567", // Spectranet
  "+2348022345678", // Smile Telecom
];
```

### Names (Diverse, Nigerian)

```typescript
const nigerianNames = {
  firstNames: [
    "Chioma",
    "Hauwa",
    "Zainab",
    "Blessing",
    "Grace", // Female
    "Ahmed",
    "Chidi",
    "Kunle",
    "Ibrahim",
    "David", // Male
  ],
  lastNames: [
    "Okafor",
    "Mohammed",
    "Suleiman",
    "Ibrahim",
    "Adeyemi",
    "Ezekiel",
    "Hassan",
    "Aminu",
    "Oluwaseun",
    "Nwosu",
  ],
};
```

### Realistic Survey Responses

```typescript
const mockVoterProfiles = [
  {
    name: "Chioma Okafor",
    phone: "+2349012345678",
    location: { state: "Adamawa", lga: "Song", ward: "Gola", pu: "PU005" },
    age: 28,
    gender: "female",
    survey: {
      concern: "jobs", // Youth in urban areas
      infrastructure: ["roads", "electricity"],
      participation: "very_likely",
    },
    candidate: "Ahmed Suleiman",
  },
  // ... 50+ realistic profiles
];
```

---

## PART 7: ERROR STATES & NETWORK HANDLING

### Progressive Enhancement for Slow Networks

```typescript
// Graceful degradation strategy
const DataFetcher = {
  // 1. Try to fetch full data
  async fetch(url: string) {
    try {
      const response = await Promise.race([
        fetch(url),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 3000),
        ),
      ]);
      return await response.json();
    } catch (error) {
      // 2. If timeout/fail, use cached data
      return this.getCachedData(url);
    }
  },

  // Cache strategy
  getCachedData(url: string) {
    const cached = localStorage.getItem(`cache:${url}`);
    if (cached) return JSON.parse(cached);

    // 3. If no cache, show minimal data
    return this.getMinimalFallback(url);
  },

  // Fallback to minimal working state
  getMinimalFallback(url: string) {
    // Return just enough to not break the app
    // E.g., show "Select state first" instead of loading LGAs
    return { items: [], isOffline: true };
  },
};
```

### Error Messages (User-Friendly, Not Technical)

```typescript
const ErrorMessages = {
  PHONE_INVALID: "Phone number doesn't look right. Check the format.",
  PHONE_DUPLICATE: "This phone is already registered. Try logging in.",
  NETWORK_SLOW: "Your connection is slow. We're still trying...",
  NETWORK_OFFLINE: "No internet. Check back when you're online.",
  LOCATION_NOT_FOUND: "We couldn't find that location. Try again.",
  OTP_WRONG: "Wrong code. Check the SMS and try again.",
  SUBMISSION_FAILED: "Couldn't submit. Try again in a moment.",
};
```

---

## PART 8: PROGRESSIVE DATA LOADING ARCHITECTURE

### API Strategy (Frontend)

```typescript
// Load data progressively, not all at once

// Route: GET /api/locations/states
// Payload: ~10KB (all 36 states)
async function loadStates() {
  return fetch("/api/locations/states").then((r) => r.json());
}

// Route: GET /api/locations/state/:stateId/lgas
// Payload: ~5KB (LGAs for one state)
async function loadLgas(stateId: string) {
  return fetch(`/api/locations/state/${stateId}/lgas`).then((r) => r.json());
}

// Route: GET /api/locations/state/:stateId/lga/:lgaId/wards
// Payload: ~3KB (wards for one LGA)
async function loadWards(stateId: string, lgaId: string) {
  return fetch(`/api/locations/state/${stateId}/lga/${lgaId}/wards`).then((r) =>
    r.json(),
  );
}

// Route: GET /api/locations/state/:stateId/lga/:lgaId/ward/:wardId/pus
// Payload: ~50KB (polling units for one ward - large but only loaded when needed)
async function loadPollingUnits(
  stateId: string,
  lgaId: string,
  wardId: string,
) {
  return fetch(
    `/api/locations/state/${stateId}/lga/${lgaId}/ward/${wardId}/pus`,
  ).then((r) => r.json());
}

// Total data transfer: ~70KB instead of 500MB+ if pre-loaded
```

---

## PART 9: SUCCESS METRICS FOR DEMO

✅ **Registration completes in < 5 minutes**  
✅ **Zero AI-generated appearance** (professional, mature design)  
✅ **Works on 2G networks** (progressive loading, small payloads)  
✅ **Clear, Nigerian-context messaging**  
✅ **Accessible to all voters** (WCAG AA standard)  
✅ **Phone-first architecture** (not VIN-dependent)  
✅ **Data privacy obvious** (consent, download, delete visible)

---

## NEXT STEPS

1. **Design review** - Share these screens with candidate/stakeholders
2. **Build UI components** - Professional, not AI-generated
3. **Implement progressive loading** - Handle slow networks
4. **Create realistic mock data** - Nigerian context, diverse profiles
5. **Test on real devices** - Especially older phones on 2G
6. **Demo walkthrough** - Show National Assembly the experience

---

**Philosophy**: Build something that feels trustworthy, not trendy. Voters should feel their data is safe, their voice matters, their time is respected.

## PART 10: SURVEY STRATEGY - THE COMPETITIVE ADVANTAGE

> **Critical Insight**: Your survey is NOT a boring form—it's your **core differentiator**. Candidates want to know WHY people vote for them and WHO they are. Make this the most engaging part of the experience.

### The Problem with Current Surveys

- **Google Forms**: Boring, low-response rate, no context
- **Qualtrics/SurveyMonkey**: Expensive, generic
- **WardWise Approach**: Real-time insights, community context, gamified engagement

### Two-Phase Survey Strategy

**Phase 1**: Quick registration survey (3-4 essential questions)
**Phase 2**: Deep community insights dashboard (optional, post-registration)

This way:

- ✅ Registration stays fast (< 5 min)
- ✅ Survey gets its own engaging space
- ✅ High-quality responses (volunteers, not forced)
- ✅ Candidates see true voter motivations

---

## PART 11: QUICK REGISTRATION SURVEY (Phase 1)

### Inline Survey During Registration

**Location**: Step 4 of 6 (after personal info, before location)

**Why Here**:

- User is invested (already gave personal info)
- Not fatigued yet (less than halfway)
- Informs location/candidate filtering

### Design: "Your Voice Matters" (Not "Take Survey")

**Visual Approach**:

```
┌─────────────────────────────────────────┐
│ [←] Back  [Progress: 4/6]               │
│                                         │
│  What Matters Most to You?              │ ← Empowering language
│  Your candidate needs to know            │ ← Why they're answering
│                                         │
│  Question 1 of 3 (Compact)              │ ← Only 3, not 8
│  ┌────────────────────────────────────┐ │
│  │ [███░░░░░░░░░░░░░░░░░░] 33%   │ │ ← Visual progress
│  └────────────────────────────────────┘ │
│                                         │
│  What's your biggest community need?    │ ← Conversational tone
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ ◯ Jobs & Economic Opportunity      │ │ ← Large touch targets
│  │ ◯ Quality Education                │ │
│  │ ◯ Healthcare Access                │ │
│  │ ◯ Security & Safety                │ │
│  │ ◯ Infrastructure (Roads, Water)    │ │
│  │ ◯ Agriculture & Rural Support      │ │
│  └────────────────────────────────────┘ │
│                                         │
│  👥 2,847 people in Song LGA already    │ ← Social proof
│     chose "Jobs" this week              │
│                                         │
│  [Next →]                               │ ← Only after selecting
│                                         │
└─────────────────────────────────────────┘
```

### Key Engagement Elements (Professional Gamification)

1. **Social Proof Cards** (Not annoying, informative)

   ```
   "2,847 supporters in your ward agree: jobs matter most"
   "You're 1 of 3 people here prioritizing agriculture"
   ```

   **Why**: Shows voter solidarity, creates community feeling

2. **Micro-interactions** (Smooth, satisfying)
   - Tap radio button → smooth color transition
   - Show checkmark after selection
   - Slide to next question (smooth animation)
   - **No** confetti, celebration sounds, or gamey elements

3. **Progress Transparency**

   ```
   Question 1 of 3
   ████░░ (33% done)
   ```

   Not percentage—just honest progress

4. **Comparison Context** (Shows value)
   ```
   "In Song LGA: 68% prioritize jobs, 32% want education"
   "Your ward differs: 45% prioritize education"
   "You're unique—that's valuable data"
   ```

### Three Quick Questions (Not Eight)

1. **"What's your biggest community need?"** (Single choice)
   - Jobs & Economic Opportunity
   - Quality Education
   - Healthcare Access
   - Security & Safety
   - Infrastructure (Roads, Water, Electricity)
   - Agriculture & Rural Support

2. **"What type of support would help your household?"** (Single choice)
   - Skills training & employment programs
   - Educational assistance
   - Healthcare support
   - Agricultural input/subsidies
   - Business loans/grants
   - Infrastructure projects

3. **"How involved are you willing to be?"** (Single choice)
   - Very involved (community projects, meetings)
   - Somewhat involved (attend key meetings)
   - Prefer to stay informed
   - Just want to vote

**Why 3 instead of 8**: Psychological research shows survey completion plummets after question 4. These 3 give you:

- Primary concern
- Support type
- Involvement level
  = **Complete voter profile**

---

## PART 12: COMMUNITY INSIGHTS DASHBOARD (Phase 2 - Post-Registration)

### New Section: "Community Voice"

**Location**: Voter dashboard, new tab after "My Profile"

**Purpose**: Turn survey responses into engaging community insights

### Dashboard Layout (Professional, Not Gamey)

```
┌─────────────────────────────────────────────────────────┐
│ My Voter Profile    [Community Voice]    Data & Privacy  │ ← Tabs
│                                                         │
│  Song LGA Community Insights                           │
│  Updated: Today at 2:34 PM                             │ ← Freshness
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 📊 What Your Ward Cares About                   │  │
│  │                                                  │  │
│  │ 1. Jobs & Economic Opportunity         68%     │  │ ← Real data
│  │    ████████████████░░ (2,847 people)          │  │
│  │                                                  │  │
│  │ 2. Education Quality                   45%     │  │
│  │    █████████░░░░░░░░░░ (1,892 people)         │  │
│  │                                                  │  │
│  │ 3. Healthcare Access                   32%     │  │
│  │    ███████░░░░░░░░░░░░░░░ (1,345 people)      │  │
│  │                                                  │  │
│  │ 4. Infrastructure                      28%     │  │
│  │    ██████░░░░░░░░░░░░░░░░░░ (1,178 people)    │  │
│  │                                                  │  │
│  │ 5. Security & Safety                   22%     │  │
│  │    █████░░░░░░░░░░░░░░░░░░░░░░ (923 people)   │  │
│  │                                                  │  │
│  │ 6. Agriculture Support                 18%     │  │
│  │    ████░░░░░░░░░░░░░░░░░░░░░░░░░░ (756 people)│  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 🎯 How Your Ward Wants to Participate           │  │
│  │                                                  │  │
│  │ Very Involved (Join projects)          34%     │  │
│  │ Somewhat Involved (Attend meetings)    42%     │  │
│  │ Stay Informed (Informed citizens)      24%     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 📍 Compare Your Views                           │  │
│  │                                                  │  │
│  │ Your top concern: Jobs & Opportunity           │  │
│  │ Song LGA average: Jobs & Opportunity ✓         │  │
│  │ State average (Adamawa): Education             │  │
│  │                                                  │  │
│  │ You're aligned with your community              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  [Share Your Insights] [Update Response]               │
│                                                         │
│  Your candidate sees this data (anonymized)            │
│  Help them understand what matters to you.             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Key Features for Engagement

#### 1. **Real-Time Data Visualization** (Professional)

- Bar charts showing actual percentages
- Live count of responses
- No fake data—show real community voice
- Updates hourly (believable, transparent)

#### 2. **Comparison Context** (Empowering)

```
Your view: Jobs (align with 68% of ward)
vs. Adamawa average: Education (32%)
vs. National average: Healthcare (28%)

Result: "You represent a significant constituency in your ward"
```

#### 3. **Personal Insights** (Not Creepy)

```
You've been registered for 3 days
You prioritize: Jobs & Economic Opportunity
You want to be: Somewhat Involved in community

Your voice has been heard by 847 community members
via real-time dashboard updates to candidates
```

#### 4. **Call-to-Action for More Engagement**

```
[Share Your Story] - Write why jobs matter (optional)
[Update Your Response] - Change your answer anytime
[View Candidate Responses] - See how your candidate
                             plans to address jobs
[Compare Other Wards] - See what Song LGA needs vs.
                        other regions
```

---

## PART 13: CANDIDATE DASHBOARD (What They See)

### New Section: "Community Insights"

**For Candidates**: Real-time voter preference data

```
┌──────────────────────────────────────────────┐
│ Dashboard   Community   Supporters   Settings  │
│                                              │
│  Song & Fufore Constituency Insights         │
│  Supporters: 2,847 | Last Updated: 2m ago   │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ 📊 What Your Supporters Care About    │ │
│  │                                        │ │
│  │ 1. Jobs & Economy          2,847 (68%)│ │ ← Real numbers
│  │ 2. Education               1,892 (45%)│ │
│  │ 3. Healthcare              1,345 (32%)│ │
│  │ 4. Infrastructure          1,178 (28%)│ │
│  │ 5. Security                  923 (22%)│ │
│  │ 6. Agriculture               756 (18%)│ │
│  │                                        │ │
│  │ [Export Report] [View Trends]         │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ 💡 Recommendations                    │ │
│  │                                        │ │
│  │ • Your supporters want jobs focus     │ │
│  │ • 45% also care about education       │ │
│  │ • 34% want to actively participate    │ │
│  │                                        │ │
│  │ Action: Schedule jobs summit + invite│ │
│  │         community to co-design plan  │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  📈 Growth Tracking                         │
│  Last 7 days: +342 supporters               │
│  Primary concern: Jobs (89% of new voters) │ │
│                                              │
└──────────────────────────────────────────────┘
```

---

## PART 14: WHY THIS WORKS (The Pitch)

### For the National Assembly

```
Traditional Approach:
- Candidate hires consultants
- Conduct expensive polling surveys
- Results take weeks
- Limited geographic data

WardWise Approach:
✓ Real-time voter sentiment (live updates)
✓ Granular by polling unit (not just state-level)
✓ Volunteer responses (people who care enough to register)
✓ Actionable insight (what voters want, not just who they'll vote for)
✓ Transparent & verifiable (voters can see it too)

Result: Democratic decision-making at ward level
```

### For Candidates

```
"I now know exactly what my constituents want:
- 68% prioritize jobs
- They're willing to help (42% want involvement)
- I can show real progress (updated hourly)"

vs. "We think people want X" (guessing)
```

### For Voters

```
"My opinion matters and it's visible
- I see my concerns reflected in data
- I can compare to my community
- Candidates respond to actual feedback"

vs. "I filled out a form that disappears"
```

---

## PART 15: GAMIFICATION THAT STAYS PROFESSIONAL

### What NOT to Do

- ❌ Badges ("Survey Master", "100% respondent")
- ❌ Points systems ("You earned 50 points!")
- ❌ Leaderboards ("Top survey takers this week")
- ❌ Confetti/celebrations

### What TO Do

- ✅ Social proof ("2,847 agree with you")
- ✅ Real impact ("Your response reached 847 people")
- ✅ Micro-interactions (smooth transitions, satisfying feedback)
- ✅ Comparison context ("You're unique in wanting agriculture support")
- ✅ Progress transparency ("33% → 66% → 100%")
- ✅ Community belonging ("You're part of 4,200 voices")

### Implementation Pattern

```typescript
// Satisfying engagement (not gamey)
const SurveyQuestion = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [similarResponses, setSimilarResponses] = useState(0);

  // Fetch similar responses for social proof
  useEffect(() => {
    if (selected) {
      fetchSimilarResponses(selected).then(setSimilarResponses);
    }
  }, [selected]);

  return (
    <div className="survey-question">
      <h2>What's your biggest community need?</h2>

      {options.map(option => (
        <SurveyOption
          key={option.id}
          selected={selected === option.id}
          onClick={() => setSelected(option.id)}
          label={option.label}
          count={option.count}
          // Show social proof: not creepy, just informative
          socialProof={selected === option.id && (
            `${similarResponses.toLocaleString()} people in your
             ward agree`
          )}
        />
      ))}

      {/* Micro-interaction: smooth to next question */}
      {selected && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleNext}
        >
          Next Question →
        </motion.button>
      )}
    </div>
  );
};
```

---

## PART 16: INTEGRATION POINTS

### Registration Flow (Updated)

```
STEP 1: Phone Verification
STEP 2: Personal Information
STEP 3: Location Selection
STEP 4: Quick Survey (Your Voice Matters)  ← 3 questions only
STEP 5: Candidate Selection
STEP 6: Confirmation & Submit
↓
SUCCESS: Registration complete
↓
[View My Profile] [Explore Community Insights] ← Engagement hooks
```

### Post-Registration Dashboard (New Tab)

```
Tabs: [My Profile] [Community Voice] [Data & Privacy]

[Community Voice]:
- Ward priorities (bar chart)
- How to get involved
- Compare your views
- [Update My Response]
```

### Candidate Dashboard (New Section)

```
Tabs: [Dashboard] [Community Insights] [Supporters] [Settings]

[Community Insights]:
- What supporters care about (real data)
- Growth trends
- Recommendations
- Export reports for strategy
```

---

## PART 17: SUCCESS METRICS

✅ Survey completion rate > 95% (currently 8-15% with Google Forms)
✅ Candidate sees genuine voter priorities (not guesses)
✅ Voters feel heard (see their data reflected in real-time)
✅ Platform becomes tool for democratic engagement
✅ National Assembly sees civic innovation potential

---

## NEXT STEPS

1. **Design the Community Insights dashboard** with real data viz
2. **Build quick survey component** with micro-interactions
3. **Create candidate dashboard** view of insights
4. **Populate with realistic mock data** (50+ voter responses)
5. **Demo scenario**: Show how 100 responses surface key priorities

---

## PART 18: THREE-WAY SYSTEM ARCHITECTURE

> **Critical Reality**: Election day in Nigeria is chaotic. Networks fail. People don't show up. Canvassers need to work offline, verify voters in real-time, and sync when connectivity returns. This isn't a nice-to-have—it's foundational.

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    WARDWISE ECOSYSTEM                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  TIER 1: VOTER APP                                      │
│  ├─ Registration flow (web demo → mobile app)          │
│  ├─ Profile management                                 │
│  ├─ Community insights dashboard                       │
│  └─ Offline: Sync history, view cached data            │
│                                                         │
│  TIER 2: CANDIDATE DASHBOARD                            │
│  ├─ Real-time supporter metrics                        │
│  ├─ Community insights & trends                        │
│  ├─ Canvasser coordination                             │
│  └─ Offline: Not needed (web-only for now)             │
│                                                         │
│  TIER 3: CANVASSER FIELD AGENT APP ⭐ (NEW)            │
│  ├─ Voter verification in field                        │
│  ├─ Real-time sync when online                         │
│  ├─ Offline voter database (100-500 voters)            │
│  ├─ One-tap actions (optimize for field conditions)    │
│  ├─ Live status: who voted, who didn't                 │
│  └─ Conflict resolution (multiple canvassers same PU)  │
│                                                         │
└─────────────────────────────────────────────────────────┘

SYNC BACKBONE:
- Real-time when online (WebSocket or Firebase)
- Offline queue when down (IndexedDB or SQLite)
- CRDTs for conflict resolution (multiple canvassers)
- Event-sourced sync (capture every change)
```

---

## PART 19: CANVASSER FIELD AGENT APP (THE GAME-CHANGER)

### Why Canvassers Are Critical

**Election day reality in Nigeria**:

- Not everyone registered online
- Some voters confused about process
- Network failures = registration stops
- Candidate needs real-time visibility: who voted, who hasn't
- Field agents need to help on-the-ground

**Traditional approach**: Phone calls, spreadsheets, chaos
**WardWise approach**: Field agents use app with offline sync

### Canvasser App Flow

```
CANVASSER'S DAY:

Morning (Before going to field):
1. Download voter list for assigned ward (100-500 voters)
2. See verification checklist
3. Sync latest candidate data
4. Go to field (no wifi available)
   ↓
Polling Unit (Offline):
5. See voter on app: "Olu Okafor - Registered"
6. Verify: "Yes, voted" → tap once
7. See next voter
8. Network drops? Still works (offline first)
   ↓
Midday (Network returns at polling station):
9. Auto-sync all changes to cloud
10. Receive updated list (new registrations, changes)
11. Candidate dashboard updates in real-time
    ↓
End of Day:
12. Generate report: "345 verified, 28 still need help"
13. Sync final data before going home
```

### Canvasser App Interface (Mobile-First, Field-Optimized)

```
┌──────────────────────────────────┐
│ ✓ Warri Ward | 2:45 PM           │ ← Status, time (crucial)
│ 📊 34/87 verified                │ ← Progress (motivating)
│                                  │
│ CURRENT VOTER                    │ ← Huge text (outdoor glare)
│ ┌──────────────────────────────┐ │
│ │ Olu Okafor                   │ │
│ │ Phone: +2348012345678        │ │ ← Verifiable info
│ │ Location: Gola Primary (PU5) │ │
│ │ Status: Registered ✓         │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ ✓ VERIFIED (VOTED)           │ │ ← One-tap actions
│ └──────────────────────────────┘ │ ← Large, easy to tap
│ ┌──────────────────────────────┐ │
│ │ ⏳ NOT YET (HELP REGISTER)   │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ ❌ NOT IN DATABASE           │ │
│ └──────────────────────────────┘ │
│                                  │
│ [⟳ Sync] [? Help] [⚙️ Settings]  │ ← Secondary actions
│                                  │
└──────────────────────────────────┘
```

### Key Canvasser Features

1. **Offline-First Database**
   - Download 100-500 voter list locally (SQLite/IndexedDB)
   - No network = still works perfectly
   - Payload: ~2MB (name, phone, location, status)

2. **One-Tap Verification**
   - "Verified (voted)" - tap once
   - "Not yet (help register)" - tap once + opens registration flow
   - "Not in database" - ask for phone, quick register
   - No complex flows, no multi-step

3. **Real-Time Sync**
   - When network returns: auto-sync in background
   - No manual "sync" button needed
   - Conflict resolution: "You marked as verified, but they re-registered online"

4. **Live Metrics Dashboard**
   - Verified: 34/87
   - Still need help: 28
   - Not in database: 25
   - Sync status: "Last synced 3m ago" vs "Offline - will sync when online"

5. **Battery Optimization**
   - Dark mode (AMOLED screens save power)
   - No animations (battery drain)
   - Offline mode uses 70% less power
   - Battery indicator: red warning at 20%

---

## PART 20: SYNC STRATEGY (Offline-First Architecture)

### The Problem

Multiple canvassers, offline work, eventual sync:

```
Scenario:
- Canvasser A: Marks Olu as "verified" (offline in Warri Ward)
- Canvasser B: Also marks Olu as "verified" (offline in different location)
- Network comes back: Which is correct? Both? Conflict!

Traditional approach: Last-write-wins (loses data)
WardWise approach: CRDT (Conflict-free Replicated Data Type)
```

### Solution: Event-Sourced Sync

```typescript
// Instead of syncing STATE, sync EVENTS
// Makes conflicts mergeable automatically

interface SyncEvent {
  id: string; // Unique globally
  timestamp: ISO8601; // When it happened
  voterId: string; // Which voter
  canvasserId: string; // Which canvasser
  action: "verified" | "registered" | "help_needed";
  metadata: {
    location: string;
    deviceId: string;
    offline: boolean;
  };
}

// Queue of events (offline)
// [
//   { id: '1', voterId: 'olu001', action: 'verified', timestamp: '14:32' },
//   { id: '2', voterId: 'ada002', action: 'registered', timestamp: '14:35' },
// ]

// When online: Send all events
// Server merges intelligently:
// - Same voter, same action, same time = deduplicate
// - Different actions = show both (audit trail)
// - Conflicting = resolve by timestamp or canvasser role
```

### Conflict Resolution Strategy

```
Scenario 1: Duplicate Verification
- Canvasser A marks Olu verified at 14:32 (offline)
- Canvasser B marks Olu verified at 14:33 (offline)
→ Resolution: Deduplicate (both say same thing)

Scenario 2: Conflicting Actions
- Canvasser A marks Olu verified at 14:32 (offline)
- Olu registers online at 14:30 (before A's action)
- Voter actually voted, so both are correct
→ Resolution: Accept both, note: voter took initiative + verified

Scenario 3: Data Inconsistency
- Canvasser marks Olu verified
- But Olu is not in their assigned ward database
→ Resolution: Flag for review (possible data error)

Scenario 4: Canvasser Network Returns During Action
- Started offline: marking as verified
- Network comes back: auto-sync happens
- Conflict: Server already has updated data
→ Resolution: Fetch latest, show "data updated, please re-verify"
```

---

## PART 21: CRITICAL EDGE CASES (Nigerian Election Day Reality)

### NETWORK CHAOS SCENARIOS

#### Edge Case 1: Network Flickers

```
Canvasser is marking voters when network flickers:
- Good network → Bad network → Good network (repeats 10x in 30 min)

Risk: Duplicate syncs, stale cache, confusion

Solution:
- Implement sync deduplication (same event = skip)
- Use atomic transactions (all-or-nothing sync)
- Show user: "Sync queued, will complete when stable"
- Don't re-sync completed events
```

#### Edge Case 2: Entire Ward Loses Network for Hours

```
Scenario: Canvassers in Warri ward offline 8am-2pm

Risk:
- 5 canvassers mark 300 voters offline
- All events in queue
- 2pm network returns = sudden 300 sync events

Solution:
- Batch syncs (send 50 events at a time, retry if fails)
- Priority queue (verified > registered > not-yet)
- Server rate-limiting: accept 100/sec max
- Show user: "Syncing 300 events... 45% complete"
```

#### Edge Case 3: Canvasser Phone Runs Out of Battery

```
Scenario:
- Canvasser has marked 150 voters
- Phone dies at 4pm
- No backup

Risk: Data loss

Solution:
- Auto-save every 30 seconds to device storage
- No need to manually sync (automatic background)
- When charged/rebooted: continue from last checkpoint
- Show: "Last auto-saved 2 minutes ago"
```

### VOTER/REGISTRATION CHAOS

#### Edge Case 4: Same Voter Registered Twice

```
Scenario:
- Canvasser A helps Ahmed register offline (10am)
- Ahmed independently registers online (10:05am)
- Both sync to server (conflict)

Risk: Duplicate voter records

Solution:
- Server detects by phone number
- Merge records (keep most recent, audit trail)
- Mark as: "Registered twice (1st by canvasser, 2nd self)"
- No error shown to canvasser (just resolves silently)
```

#### Edge Case 5: Voter Info Changes Between Syncs

```
Scenario:
- Downloaded voter list at 8am: "Chioma - Age 28"
- Chioma updates her profile online at 9am: "Age 29"
- Canvasser sees stale data at 11am

Risk: Verification based on old info

Solution:
- When syncing: refresh voter record if changed
- Show notification: "Chioma's info updated"
- Ask canvasser to re-verify if major changes
- Flag if: name, phone, location changed
```

#### Edge Case 6: Voter Not in Database

```
Scenario:
- Canvasser encounters someone not in voter list
- Might be: new registration, data error, wrong ward

Risk: Canvasser turns away valid voter

Solution:
- Show: "Quick verify option"
- Canvasser can capture: name, phone, location
- Send to server as "unverified registration"
- Candidate team reviews post-election
- Never block voter from community
```

### CANVASSER COORDINATION CHAOS

#### Edge Case 7: Multiple Canvassers, Same Polling Unit

```
Scenario:
- Warri Ward PU5 has 87 voters
- 2 canvassers assigned (A covers 1-45, B covers 46-87)
- But offline: no coordination
- A marks voter 50 as verified
- B also marks voter 50 as verified
- When sync: "Conflict - who marked first?"

Risk: Double-work, confusion about who did what

Solution:
- Server tracks: "marked by Canvasser A at 11:32, verified by B at 11:35"
- Don't conflict: both marks are correct (cross-verification is good)
- Show audit trail: who did what, when
- Canvassers see: "✓ Verified (by you + colleague)"
```

#### Edge Case 8: Canvasser Marked Wrong Voter

```
Scenario:
- Canvasser A marks "Olu Okafor - PU5" as verified
- Later realizes they marked wrong person
- Can't undo (already synced)

Risk: Data integrity issues

Solution:
- Allow "UNVERIFY" action (creates new event: "previously_marked_error")
- Audit trail shows: verified → unverified with reason
- Server accepts both (shows full story)
- Not censoring, just transparent
```

### SYSTEM CHAOS

#### Edge Case 9: Corrupted Offline Database

```
Scenario:
- App crashes during sync
- SQLite database corrupted
- Canvasser reopens app: "Database error"

Risk: Total failure in field

Solution:
- App detects corruption on startup
- Auto-rolls back to last good backup (hourly snapshots)
- Shows: "Database recovered. You lost last 30 min of marks."
- Offers: "Re-download voter list" button
```

#### Edge Case 10: Canvasser Closes App Without Syncing

```
Scenario:
- Canvasser marks 50 voters
- Closes app (thinking it auto-syncs)
- Goes home without internet
- Next day: "Why isn't my data synced?"

Risk: Lost data, frustration

Solution:
- Mandatory sync reminder: "You have 45 unsync'd marks"
- Auto-sync before app close (if any network)
- Show in offline mode: "⚠️ You have 45 marks waiting to sync"
- Don't let them ignore it (too important)
```

---

## PART 22: IMPLEMENTATION STRATEGY (Web Demo → Mobile App)

### Phase 1: Web Demo (Now)

```
✓ Voter registration (web)
✓ Candidate dashboard (web)
✓ Community insights (web)
- Canvasser app (planned for phase 2)

Tech: React web app with offline-ready architecture
```

### Phase 2: Mobile Apps (After Funding)

```
Voter App:
- Convert web to React Native (code share possible)
- Add offline registration queue
- Enable background sync
- Push notifications for updates

Canvasser App:
- Purpose-built mobile (React Native or Flutter)
- Extreme optimization (battery, network, gloves)
- Offline-first database
- Event-sourced sync
- One-tap actions

Tech: React Native shared code + platform-specific optimizations
```

### Code Architecture (Offline-Ready from Start)

```typescript
// Even in web demo, build with offline mindset

// Bad (online-first):
async function markVerified(voterId: string) {
  const response = await fetch("/api/verify", {
    method: "POST",
    body: voterId,
  });
  return response.json();
}

// Good (offline-first):
async function markVerified(voterId: string) {
  // 1. Immediately save to local store (optimistic update)
  const event = await localDb.addEvent({
    type: "voter_verified",
    voterId,
    timestamp: Date.now(),
    id: generateId(),
  });

  // 2. Update UI immediately (user sees it worked)
  updateUI(voterId, "verified");

  // 3. Try to sync in background (fire and forget)
  syncToServer(event).catch((err) => {
    // If fails: no problem, will retry later
    console.log("Sync failed, will retry when online");
  });

  return { success: true, synced: false, willSyncWhenOnline: true };
}

// This works identical on web and mobile
// Same logic, same reliability
```

---

## PART 23: RECOMMENDATIONS FOR DEMO → PRODUCTION

### What to Show in Web Demo

```
✅ Voter registration (complete flow)
✅ Candidate dashboard + community insights
✅ Realistic data (100+ mock voter profiles)
✅ Real-time metrics updates (simulated)
❌ Canvasser app (too complex for demo, explain as roadmap)
```

### What to Build for Production

```
Phase 1 (Funded):
✅ Voter mobile app (iOS + Android)
✅ Candidate dashboard (stays web or becomes app)
✅ Canvasser app (lite version, 1 polling unit at a time)
✅ Real-time sync infrastructure

Phase 2 (Expanded):
✅ Multi-canvasser coordination in canvasser app
✅ Real-time election day dashboard
✅ Live voter turnout tracking
✅ Automated conflict resolution improvements
```

### Key Success Metrics for Demo

```
✅ Registration completes < 5 min
✅ Candidate sees live data (simulated real-time)
✅ Community voice dashboard feels engaging
✅ National Assembly understands the three-way system
✅ Clear roadmap: web demo → mobile apps
```

---

## PART 24: ADDRESSING YOUR QUESTIONS

### "App vs Web?"

- **Demo**: Web is right (easier to show, no app store delays)
- **Production**: Mobile is right (better UX, offline capability, app feels more "real" to voters)
- **Hybrid**: Keep web for candidates (can use laptop), apps for voters + canvassers

### "Should we show canvasser app in demo?"

- **No**: Too much complexity, confuses the pitch
- **Instead**: Show mockups / screen flow in presentation
- **Explain**: "Phase 1: voter + candidate web. Phase 2: mobile apps with offline sync when funded"

### "How to handle offline syncing?"

- Build with event-sourcing from day 1 (even if just simulated in demo)
- Use IndexedDB (web demo) + sync to backend
- When real-time comes: upgrade to WebSocket, same event structure
- Conflict resolution: timestamp + canvasser ID wins ties

---

## PART 25: NEXT BUILD PRIORITIES

For the demo (web):

1. **Voter registration UI** (complete as planned)
2. **Candidate community insights dashboard** (real-time metrics visualization)
3. **Mock data simulator** (simulate 100+ voters registering over time)
4. **Offline simulation** (test data persistence, sync recovery)

For roadmap (mention in pitch):

1. **Canvasser app specification** (detailed mockups)
2. **Offline-first architecture document** (for developers)
3. **Real-time sync strategy** (event-sourced, conflict resolution)
4. **Election day chaos scenarios** (prepared for every edge case)

---

**Bottom Line**: You're building something election-grade robust. The three-way system is **the right architecture** for Nigerian realities. Start with web demo, but build infrastructure ready for mobile + offline from day 1.
