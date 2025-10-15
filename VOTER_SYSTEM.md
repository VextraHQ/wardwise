# WardWise Voter Registration System

## Overview

The WardWise voter registration system has been completely rebuilt with modern UI/UX best practices, utilizing shadcn/ui components for a polished, accessible, and responsive experience.

## Architecture

### Route Structure

The voter system uses Next.js App Router with route groups for clean separation:

```
app/
├── (voter)/                    # Voter route group with shared layout
│   ├── layout.tsx             # Voter layout with header/footer
│   ├── voter-login/
│   │   └── page.tsx           # Voter login page
│   ├── register/
│   │   ├── layout.tsx         # Registration metadata
│   │   ├── page.tsx           # Step 1: Phone entry
│   │   ├── verify/
│   │   │   └── page.tsx       # Step 2: OTP verification
│   │   ├── check/
│   │   │   └── page.tsx       # Step 3: Duplicate check
│   │   ├── profile/
│   │   │   └── page.tsx       # Step 4: Personal info
│   │   ├── location/
│   │   │   └── page.tsx       # Step 5: Location selection
│   │   ├── survey/
│   │   │   └── page.tsx       # Step 6: Survey questions
│   │   ├── candidate/
│   │   │   └── page.tsx       # Step 7: Candidate selection
│   │   ├── complete/
│   │   │   └── page.tsx       # Step 8: Completion & sharing
│   │   └── already-registered/
│   │       └── page.tsx       # Already registered options
│   └── voter/
│       └── profile/
│           └── page.tsx       # Voter dashboard/profile
```

### Component Structure

```
components/
├── voter/
│   ├── voter-header.tsx       # Voter-specific header
│   ├── voter-footer.tsx       # Voter-specific footer
│   ├── voter-login.tsx        # Login component
│   ├── voter-profile.tsx      # Profile/dashboard component
│   └── steps/
│       ├── phone-entry-step.tsx
│       ├── otp-verify-step.tsx
│       ├── duplicate-check-step.tsx
│       ├── profile-step.tsx
│       ├── location-step.tsx
│       ├── survey-step.tsx
│       ├── candidate-selection-step.tsx
│       ├── completion-step.tsx
│       └── already-registered-step.tsx
```

## Key Features

### 1. Enhanced UI Components

- **InputOTP**: Native OTP input with auto-focus and paste support
- **Progress**: Visual progress indicators throughout the flow
- **RadioGroup**: Accessible radio selections with card-based UI
- **Form**: React Hook Form integration with Zod validation
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### 2. Registration Flow

#### Step 1: Phone Entry

- Nigerian phone number validation (+234 format)
- Terms & conditions acceptance
- Auto-formatting of phone numbers
- Clean, modern card-based UI

#### Step 2: OTP Verification

- 6-digit OTP input with auto-submit
- Resend functionality with 60s cooldown
- Visual progress indicators
- Masked phone number display

#### Step 3: Duplicate Check

- Automatic check for existing registration
- Loading states with animations
- Redirects to appropriate flow

#### Step 4: Personal Information

- First name, last name, age, gender
- Card-based radio selection for gender
- Form validation with error messages
- Progress tracking (43% complete)

#### Step 5: Location Selection

- Cascading dropdowns (State → LGA → Ward → Polling Unit)
- Disabled states until parent selected
- Help section for polling unit lookup
- Progress tracking (57% complete)

#### Step 6: Survey Questions

- Dynamic question rendering from mock data
- Single and multiple choice support
- Question navigator for easy navigation
- Visual progress per question
- "Why we ask" explanations
- Progress tracking (71-86% complete)

#### Step 7: Candidate Selection

- Card-based candidate display
- Party badges and supporter counts
- Constituency information
- "Undecided" option available
- Progress tracking (86% complete)

#### Step 8: Completion

- Success animation with confetti effect
- Registration summary display
- Social sharing options (WhatsApp, SMS, Email, Copy Link)
- Profile access button
- Important notices about update windows

### 3. Voter Dashboard

- **Overview Tab**: Quick summary cards
- **Details Tab**: Complete registration information
- **Activity Tab**: Registration timeline
- Edit capabilities (within 7-day window)
- Logout functionality

### 4. SEO Optimization

Each page includes:

- Unique metadata titles
- Descriptive meta descriptions
- OpenGraph tags (ready for social sharing)
- Semantic HTML structure

### 5. Accessibility

- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Color contrast compliance

## Data Flow

### State Management

Uses Zustand with persistence:

```typescript
// hooks/use-registration.ts
{
  step: WizardStep;
  payload: {
    phone: string;
    basic: {
      (firstName, lastName, age, gender);
    }
    location: {
      (state, lga, ward, pollingUnit);
    }
    survey: {
      (priorities, comments);
    }
    candidate: {
      candidateId;
    }
    electionYear: number;
  }
  // ... methods
}
```

### API Integration

The system integrates with existing API routes:

- `/api/register/otp` - Send OTP
- `/api/register/otp/verify` - Verify OTP
- `/api/register/check` - Check for duplicates
- `/api/register/candidates` - Fetch candidates
- `/api/register/locations` - Fetch location data
- `/api/register/submit` - Final submission

## Survey System

### Survey Data Structure

```typescript
type SurveyQuestion = {
  id: string;
  question: string;
  description?: string;
  type: "single" | "multiple";
  options: {
    id: string;
    label: string;
    icon?: string;
  }[];
};
```

### Mock Survey Questions

The system includes 8 comprehensive survey questions covering:

1. Biggest community concern
2. Education quality rating
3. Infrastructure improvements needed
4. Youth employment importance
5. Household support preferences
6. Communication preferences
7. Primary occupation
8. Community participation likelihood

**Important**: In production, these questions should be dynamically loaded from the candidate's admin panel, allowing candidates to customize surveys for their constituency.

## Theme Integration

The voter system uses the existing WardWise theme:

```css
Primary: #46c2a7 (Teal/Green)
Secondary: #e6f4f0 (Light teal)
Accent: #1d453a (Dark green)
Background: #f9fbfa (Off-white)
Foreground: #10211d (Dark text)
```

## Responsive Design

- **Mobile**: Single column, full-width cards
- **Tablet**: Optimized spacing and typography
- **Desktop**: Multi-column layouts where appropriate

## Performance Optimizations

1. **Code Splitting**: Each step is a separate route
2. **Lazy Loading**: Components load on demand
3. **Image Optimization**: Next.js Image component
4. **Minimal Client JS**: Server components where possible
5. **Efficient State**: Zustand with persistence

## Security Features

1. **Phone Verification**: OTP-based authentication
2. **Data Encryption**: All sensitive data encrypted
3. **Rate Limiting**: Cooldown on OTP resends
4. **Input Validation**: Zod schemas for all forms
5. **Update Window**: 7-day limit on profile changes

## Future Enhancements

### Phase 1 (Immediate)

- [ ] Connect to real backend APIs
- [ ] Add actual candidate photos
- [ ] Implement real survey loading from admin
- [ ] Add analytics tracking

### Phase 2 (Short-term)

- [ ] Email notifications
- [ ] SMS confirmations
- [ ] PDF registration receipt
- [ ] QR code for quick access

### Phase 3 (Long-term)

- [ ] Multi-language support
- [ ] Offline mode with sync
- [ ] Push notifications
- [ ] Advanced analytics dashboard

## Testing Checklist

- [ ] Phone number validation (various formats)
- [ ] OTP flow (send, verify, resend)
- [ ] Duplicate detection
- [ ] Form validations (all steps)
- [ ] Location cascading
- [ ] Survey navigation
- [ ] Candidate selection
- [ ] Social sharing
- [ ] Mobile responsiveness
- [ ] Accessibility (screen readers)
- [ ] Browser compatibility
- [ ] Performance (Lighthouse scores)

## Deployment Notes

1. Ensure all environment variables are set
2. Test OTP delivery in production
3. Verify API endpoints are accessible
4. Check CORS settings for API calls
5. Monitor error rates and user drop-offs
6. Set up analytics tracking

## Support & Maintenance

For issues or questions about the voter system:

1. Check this documentation
2. Review component source code
3. Test in development environment
4. Check browser console for errors
5. Verify API responses

---

**Built with**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Query, Zod
