# WardWise Voter System - Quick Start Guide

## 🎭 **DEMO MODE**

This system is currently running in **DEMO MODE** with mock data for testing. No real API calls are made.

### **Demo Phone Numbers**

- `+2348012345678` - **Aliyu Mohammed** (existing user)
- `+2348098765432` - **Fatima Ibrahim** (existing user)
- `+2348055555555` - **New user**
- `+2348077777777` - **New user**

### **Demo OTP Codes**

Any 6-digit number works, but these are provided:

- `123456`, `000000`, `111111`, `999999`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Git

### Installation

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd wardwise-demo

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

### Access the Voter System

Open your browser and navigate to:

- **Landing Page**: http://localhost:3000
- **Register**: http://localhost:3000/register
- **Voter Login**: http://localhost:3000/voter-login
- **Profile**: http://localhost:3000/voter/profile

## 📁 Project Structure

```
wardwise-demo/
├── src/
│   ├── app/
│   │   ├── (voter)/              # Voter route group
│   │   │   ├── layout.tsx        # Voter layout
│   │   │   ├── login/            # Login page
│   │   │   ├── register/         # Registration flow
│   │   │   └── voter/            # Voter dashboard
│   │   └── api/                  # API routes
│   ├── components/
│   │   ├── voter/                # Voter components
│   │   │   ├── steps/            # Registration steps
│   │   │   ├── voter-header.tsx
│   │   │   ├── voter-footer.tsx
│   │   │   ├── voter-login.tsx
│   │   │   └── voter-profile.tsx
│   │   └── ui/                   # shadcn components
│   ├── hooks/
│   │   └── use-registration.ts   # Registration state
│   └── lib/
│       ├── surveyData.ts         # Survey questions
│       ├── candidateData.ts      # Candidate data
│       └── locationData.ts       # Location data
├── VOTER_SYSTEM.md               # Full documentation
├── IMPLEMENTATION_SUMMARY.md     # Implementation details
├── VOTER_FLOW.md                 # Visual flow diagram
└── QUICK_START.md                # This file
```

## 🎯 Testing the Flow

### 1. Start Registration

1. Go to http://localhost:3000
2. Click "Register to Support a Candidate"
3. Enter a demo phone number (e.g., 08055555555)
4. Accept terms and click "Get Started"

### 2. Verify Phone

1. Enter any 6-digit OTP (e.g., 123456)
2. Or click "Resend Code" after cooldown
3. Click "Verify & Continue"

### 3. Complete Profile

1. Enter first name, last name, age
2. Select gender
3. Click "Continue"

### 4. Select Location

1. Choose State (Adamawa)
2. Choose LGA (e.g., Song)
3. Choose Ward
4. Choose Polling Unit
5. Click "Continue"

### 5. Answer Survey

1. Answer each question (8 total)
2. Use question navigator to jump around
3. Click "Next Question" or "Complete Survey"

### 6. Choose Candidate

1. Review available candidates
2. Select your preferred candidate
3. Click "Continue"

### 7. View Completion

1. See your registration summary
2. Share with friends (optional)
3. Click "View My Profile"

### 8. Access Dashboard

1. View your profile overview
2. Check full details
3. See activity timeline
4. Edit information (if within 7 days)

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# OTP Configuration (for production)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Database (if needed)
DATABASE_URL=your_database_url
```

### Survey Questions

Edit `src/lib/surveyData.ts` to customize survey questions:

```typescript
export const surveyQuestions: SurveyQuestion[] = [
  {
    id: "q1",
    question: "Your question here?",
    description: "Optional description",
    type: "single", // or "multiple"
    options: [
      { id: "opt1", label: "Option 1" },
      { id: "opt2", label: "Option 2" },
    ],
  },
  // Add more questions...
];
```

### Candidate Data

Edit `src/lib/candidateData.ts` to add/update candidates:

```typescript
export const candidatesByConstituency: Record<string, Candidate[]> = {
  "Song-Fufore": [
    {
      id: "cand-1",
      name: "Candidate Name",
      party: "Party",
      position: "Position",
      constituency: "Constituency Name",
      description: "Brief description",
      supporters: 1000,
    },
  ],
};
```

## 🎨 Customization

### Theme Colors

Edit `src/app/globals.css`:

```css
:root {
  --primary: #46c2a7; /* Main brand color */
  --secondary: #e6f4f0; /* Secondary color */
  --accent: #1d453a; /* Accent color */
  /* ... more colors */
}
```

### Components

All voter components are in `src/components/voter/`:

- Modify existing components
- Add new components
- Update styles

### Layout

Edit `src/app/(voter)/layout.tsx` to change:

- Header
- Footer
- Overall layout

## 📱 Testing on Mobile

### Local Network Testing

1. Find your local IP:

```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

2. Access from mobile device:

```
http://YOUR_IP:3000
```

### Responsive Testing in Browser

1. Open DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Select device or custom dimensions
4. Test all breakpoints

## 🐛 Debugging

### Common Issues

#### Phone Validation Fails

- Ensure format is +234XXXXXXXXXX
- Check regex in `phoneSchema`

#### OTP Not Sending

- Check API route `/api/register/otp`
- Verify Twilio credentials (production)
- Check console for errors

#### State Not Persisting

- Check Zustand store in `use-registration.ts`
- Clear localStorage if needed
- Check browser console

#### Components Not Rendering

- Check import paths
- Verify TypeScript types
- Run `pnpm build` to check for errors

### Debug Tools

```typescript
// In any component
import { useRegistration } from "@/hooks/use-registration";

function MyComponent() {
  const { payload } = useRegistration();
  console.log("Current state:", payload);
  // ...
}
```

## 📊 Analytics (Optional)

### Add Google Analytics

1. Install package:

```bash
pnpm add @next/third-parties
```

2. Add to layout:

```typescript
import { GoogleAnalytics } from '@next/third-parties/google'

export default function Layout({ children }) {
  return (
    <>
      {children}
      <GoogleAnalytics gaId="G-XXXXXXXXXX" />
    </>
  )
}
```

### Track Events

```typescript
// Track registration completion
gtag("event", "registration_complete", {
  event_category: "voter",
  event_label: "registration",
});
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

### Other Platforms

1. Build the project:

```bash
pnpm build
```

2. Start production server:

```bash
pnpm start
```

## 📝 Development Workflow

### Making Changes

1. Create a new branch:

```bash
git checkout -b feature/your-feature
```

2. Make your changes

3. Test thoroughly:

```bash
pnpm dev
# Test in browser
```

4. Build to check for errors:

```bash
pnpm build
```

5. Commit and push:

```bash
git add .
git commit -m "Description of changes"
git push origin feature/your-feature
```

### Code Style

- Use TypeScript for type safety
- Follow existing patterns
- Add comments for complex logic
- Use meaningful variable names
- Keep components small and focused

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)
- [Zustand State](https://zustand-demo.pmnd.rs)

## 🆘 Getting Help

### Documentation

1. Read `VOTER_SYSTEM.md` for detailed docs
2. Check `VOTER_FLOW.md` for flow diagram
3. Review `IMPLEMENTATION_SUMMARY.md`

### Code

1. Check inline comments
2. Review TypeScript types
3. Look at similar components

### Community

1. Check GitHub issues
2. Ask in team chat
3. Review pull requests

## ✅ Pre-Launch Checklist

- [ ] Test all registration steps
- [ ] Verify OTP delivery
- [ ] Test on mobile devices
- [ ] Check accessibility
- [ ] Test with screen readers
- [ ] Verify API endpoints
- [ ] Test error handling
- [ ] Check loading states
- [ ] Test social sharing
- [ ] Verify data persistence
- [ ] Test logout flow
- [ ] Check SEO metadata
- [ ] Test in different browsers
- [ ] Verify responsive design
- [ ] Check performance (Lighthouse)

## 🎉 You're Ready!

The voter system is now ready for development and testing. Follow this guide to get started quickly, and refer to the other documentation files for more detailed information.

---

**Need help?** Check the other documentation files or review the code comments.
