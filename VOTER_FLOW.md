# WardWise Voter Registration Flow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        LANDING PAGE                              │
│                    (wardwise.com)                                │
│                                                                  │
│  [Register to Support a Candidate] ──────────────────┐          │
│  Already registered? [Login]                          │          │
└───────────────────────────────────────────────────────┼──────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: PHONE ENTRY                                            │
│  /register                                                       │
│                                                                  │
│  WardWise - Your Voice Shapes Tomorrow                          │
│  Register to participate in Adamawa State elections             │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐          │
│  │ Enter Phone Number: +234 [__________]            │          │
│  │ ☑ I agree to Terms & Privacy Policy              │          │
│  │ [Get Started →]                                   │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                  │
│  Already registered? [Login]                                    │
└─────────────────────────────────────────────────────┼──────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: OTP VERIFICATION                                       │
│  /register/verify                                                │
│                                                                  │
│  Progress: ●━●━○━○━○━○━○  (2 of 7)                             │
│                                                                  │
│  Enter Verification Code                                        │
│  We sent a 6-digit code to 080-XXXX-5678                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐          │
│  │ [_] [_] [_] [_] [_] [_]                          │          │
│  │                                                   │          │
│  │ Didn't receive? [Resend Code] (wait 60s)         │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                  │
│  [← Back]                            [Verify & Continue →]      │
└─────────────────────────────────────────────────────┼──────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: DUPLICATE CHECK                                        │
│  /register/check                                                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐          │
│  │         ⟳ Checking registration status...         │          │
│  │         Please wait while we verify...            │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                  │
│  IF EXISTS ──────────────┐                                      │
│  IF NOT EXISTS ──────────┼────────────────┐                    │
└──────────────────────────┼────────────────┼────────────────────┘
                           │                │
                           ▼                ▼
        ┌─────────────────────────┐  ┌────────────────────────┐
        │ ALREADY REGISTERED      │  │ STEP 4: PROFILE        │
        │ /register/already-reg   │  │ /register/profile      │
        │                         │  │                        │
        │ You're already here!    │  │ Progress: 43%          │
        │                         │  │                        │
        │ [View Profile]          │  │ Tell Us About Yourself │
        │ [Switch Candidate]      │  │                        │
        │ [Logout]                │  │ First Name: [____]     │
        └─────────────────────────┘  │ Last Name:  [____]     │
                                     │ Age:        [__]       │
                                     │ Gender: ○M ○F ○Other   │
                                     │                        │
                                     │ [← Back] [Continue →]  │
                                     └────────┬───────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: LOCATION                                               │
│  /register/location                                              │
│                                                                  │
│  Progress: ████████░░░░░░  57%                                  │
│                                                                  │
│  Where Do You Vote?                                             │
│                                                                  │
│  State:        [Adamawa ▼]                                      │
│  LGA:          [Song ▼]                                         │
│  Ward:         [Gola Ward ▼]                                    │
│  Polling Unit: [PU 005 - Gola Primary School ▼]                │
│                                                                  │
│  ℹ Not sure? Find your polling unit on your voter's card       │
│                                                                  │
│  [← Back]                                 [Continue →]          │
└─────────────────────────────────────────────────────┼──────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: SURVEY (Question 1 of 8)                              │
│  /register/survey                                                │
│                                                                  │
│  Progress: ████████████░  71%                                   │
│                                                                  │
│  Help Us Understand Your Priorities                             │
│  Your answers remain confidential                               │
│                                                                  │
│  Q1: What is your biggest concern?                             │
│  ℹ Select one option                                            │
│                                                                  │
│  ○ Security and Safety                                          │
│  ○ Education Quality                                            │
│  ○ Healthcare Access                                            │
│  ○ Job Creation                                                 │
│  ○ Infrastructure Development                                   │
│  ○ Agriculture Support                                          │
│                                                                  │
│  💡 Why we ask: Your candidate needs to know what matters       │
│                                                                  │
│  [← Previous]                          [Next Question →]        │
│                                                                  │
│  Question Navigator: ● ○ ○ ○ ○ ○ ○ ○                          │
└─────────────────────────────────────────────────────┼──────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 7: CANDIDATE SELECTION                                    │
│  /register/candidate                                             │
│                                                                  │
│  Progress: ████████████████  86%                                │
│                                                                  │
│  ✓ Based on Your Survey Responses                              │
│  Choose Your Candidate                                          │
│  House of Representatives - Song & Fufore Constituency          │
│                                                                  │
│  ┌────────────────────────────────────────────────┐            │
│  │ ○ [AS] Hon. Ahmed Suleiman (APC)               │            │
│  │    House of Representatives                     │            │
│  │    📍 Song & Fufore Federal Constituency        │            │
│  │    👥 2,847 supporters                          │            │
│  └────────────────────────────────────────────────┘            │
│                                                                  │
│  ┌────────────────────────────────────────────────┐            │
│  │ ○ [BI] Alhaji Bello Ibrahim (PDP)              │            │
│  │    House of Representatives                     │            │
│  │    📍 Song & Fufore Federal Constituency        │            │
│  │    👥 1,923 supporters                          │            │
│  └────────────────────────────────────────────────┘            │
│                                                                  │
│  ┌────────────────────────────────────────────────┐            │
│  │ ○ [FY] Dr. Fatima Yusuf (LP)                   │            │
│  │    House of Representatives                     │            │
│  │    📍 Song & Fufore Federal Constituency        │            │
│  │    👥 1,156 supporters                          │            │
│  └────────────────────────────────────────────────┘            │
│                                                                  │
│  ○ I'm still undecided                                          │
│                                                                  │
│  [← Back]                                 [Continue →]          │
└─────────────────────────────────────────────────────┼──────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 8: COMPLETION                                             │
│  /register/complete                                              │
│                                                                  │
│           ┌─────────┐                                           │
│           │    ✓    │  Registration Complete!                   │
│           └─────────┘  Thank you, Aliyu Mohammed                │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐          │
│  │ Your Registration Summary                         │          │
│  │                                                   │          │
│  │ 👤 Personal Information                           │          │
│  │    Name: Aliyu Mohammed                           │          │
│  │    Age: 28 | Gender: Male                         │          │
│  │                                                   │          │
│  │ 📍 Voting Location                                │          │
│  │    Song LGA, Gola Ward                            │          │
│  │    PU 005 - Gola Primary School                   │          │
│  │                                                   │          │
│  │ ✓ Survey: 8 of 8 questions completed             │          │
│  │ ✓ Supporting: Hon. Ahmed Suleiman (APC)          │          │
│  │                                                   │          │
│  │ ⚠️ You can update once within 7 days              │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                  │
│  [View My Profile]  [Return to Home]                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐          │
│  │ 📤 Share WardWise                                 │          │
│  │                                                   │          │
│  │ [WhatsApp] [SMS] [Email] [Copy Link]             │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────┼──────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  VOTER DASHBOARD                                                │
│  /voter/profile                                                  │
│                                                                  │
│  My Profile                                    [Logout]          │
│  View and manage your voter registration                        │
│                                                                  │
│  ✓ Registration Active | Registered: Oct 15, 2025              │
│                                                                  │
│  Tabs: [Overview] [Full Details] [Activity]                    │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐                     │
│  │ Personal Info   │  │ Location        │                     │
│  │ [Edit]          │  │ [Edit]          │                     │
│  │                 │  │                 │                     │
│  │ Name: ...       │  │ State: ...      │                     │
│  │ Age: ...        │  │ LGA: ...        │                     │
│  └─────────────────┘  └─────────────────┘                     │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐                     │
│  │ Survey Status   │  │ Candidate       │                     │
│  │ ✓ Complete      │  │ [Change]        │                     │
│  │ 8 of 8          │  │ Hon. Ahmed...   │                     │
│  └─────────────────┘  └─────────────────┘                     │
│                                                                  │
│  🛡️ Data Protection: Update within 7 days, then locked         │
└─────────────────────────────────────────────────────────────────┘
```

## Alternative Paths

### Login Flow (Returning Voters)

```
Landing Page
     │
     ▼
[Login] ────────────────────────────────────────────┐
     │                                               │
     ▼                                               │
Phone Entry (/voter-login)                          │
     │                                               │
     ▼                                               │
OTP Verification                                     │
     │                                               │
     ▼                                               │
Duplicate Check                                      │
     │                                               │
     ├─── IF EXISTS ──► Already Registered ──► Profile
     │
     └─── IF NOT EXISTS ──► Continue Registration
```

### Update Flow (Within 7 Days)

```
Profile Dashboard
     │
     ▼
[Edit] Button
     │
     ├─── Personal Info ──► Update Form ──► Save ──► Profile
     ├─── Location ──────► Update Form ──► Save ──► Profile
     └─── Candidate ─────► New Selection ──► Save ──► Profile
```

## Key Features Per Step

### Step 1: Phone Entry

- ✅ Auto-format phone numbers
- ✅ Real-time validation
- ✅ Terms acceptance
- ✅ Clean, modern UI

### Step 2: OTP Verification

- ✅ 6-digit input with auto-focus
- ✅ Auto-submit on complete
- ✅ Resend with cooldown
- ✅ Masked phone display

### Step 3: Duplicate Check

- ✅ Automatic detection
- ✅ Loading animation
- ✅ Smart routing

### Step 4: Profile

- ✅ Form validation
- ✅ Card-based gender selection
- ✅ Progress indicator

### Step 5: Location

- ✅ Cascading dropdowns
- ✅ Help section
- ✅ Disabled states

### Step 6: Survey

- ✅ 8 comprehensive questions
- ✅ Single/multiple choice
- ✅ Question navigator
- ✅ Progress per question

### Step 7: Candidate

- ✅ Rich candidate cards
- ✅ Supporter counts
- ✅ Party badges
- ✅ Undecided option

### Step 8: Completion

- ✅ Success animation
- ✅ Summary display
- ✅ Social sharing
- ✅ Profile access

## Mobile Experience

All steps are fully responsive with:

- Touch-friendly buttons
- Optimized spacing
- Mobile navigation
- Adaptive layouts
- Readable typography

## Accessibility

Every step includes:

- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management
- Error announcements

---

**Total Flow**: 8 steps, ~5-10 minutes to complete, optimized for conversion
