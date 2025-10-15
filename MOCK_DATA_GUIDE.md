# WardWise Voter System - Mock Data Implementation

## 🎭 **DEMO MODE ACTIVE**

This system is currently running in **DEMO MODE** with mock data for UI testing and design validation. All API calls have been replaced with mock implementations to allow for seamless testing without requiring real backend services.

## 📱 **Demo Phone Numbers**

Use these phone numbers for testing:

- `+2348012345678` - **Aliyu Mohammed** (existing user - will redirect to profile)
- `+2348098765432` - **Fatima Ibrahim** (existing user - will redirect to profile)
- `+2348055555555` - **New user** (will redirect to registration)
- `+2348077777777` - **New user** (will redirect to registration)

## 🔐 **Demo OTP Codes**

Any 6-digit number works for OTP verification, but these are provided for convenience:

- `123456`
- `000000`
- `111111`
- `999999`

## 🏗️ **Mock API System**

### **File Structure**

```
src/lib/mock/
└── mockApi.ts          # Complete mock API implementation
```

### **Mock Functions**

#### **Authentication**

- `sendOtp(phone)` - Simulates sending OTP (always succeeds)
- `verifyOtp(phone, otp)` - Accepts any 6-digit OTP
- `checkRegistration(phone, year)` - Checks against mock user database

#### **Data Retrieval**

- `getCandidates(state, lga)` - Returns mock candidate list
- `getUserProfile(phone)` - Returns mock user profile

#### **Registration**

- `submitRegistration(data)` - Simulates successful registration

### **Mock Data**

#### **Mock Users**

```typescript
const mockUsers = [
  {
    id: "user-1",
    phone: "+2348012345678",
    firstName: "Aliyu",
    lastName: "Mohammed",
    // ... complete profile data
  },
  // ... more users
];
```

#### **Mock Candidates**

```typescript
const mockCandidates = [
  {
    id: "cand-apc-1",
    name: "Hon. Ahmed Suleiman",
    party: "APC",
    supporters: 2847,
    // ... complete candidate data
  },
  // ... more candidates
];
```

## 🔄 **How Mock System Works**

### **1. Phone Entry**

- User enters phone number
- Mock API simulates OTP sending
- Shows demo message: "🎭 DEMO MODE: OTP sent successfully"

### **2. OTP Verification**

- User enters any 6-digit code
- Mock API accepts any valid format
- Proceeds to duplicate check

### **3. Duplicate Check**

- Checks against mock user database
- Existing users → Profile page
- New users → Registration flow

### **4. Registration Flow**

- All steps use mock data
- Survey questions from mock data
- Candidate selection from mock candidates
- Completion shows mock success

### **5. Profile View**

- Displays mock user data
- Shows registration details
- Allows profile management (demo)

## 🎯 **Testing Scenarios**

### **Scenario 1: Existing User Login**

1. Go to `/voter-login`
2. Enter `+2348012345678`
3. Click "Login"
4. Should redirect to `/voter/profile`

### **Scenario 2: New User Registration**

1. Go to `/register`
2. Enter `+2348055555555`
3. Complete OTP verification
4. Fill registration form
5. Complete survey
6. Select candidate
7. View completion page

### **Scenario 3: OTP Testing**

1. Enter any phone number
2. Use any 6-digit OTP code
3. Should always verify successfully

## 🚀 **Production Migration**

When ready for production:

1. **Replace Mock Calls**

   ```typescript
   // Replace this:
   return await mockApi.sendOtp(phone);

   // With this:
   const res = await fetch("/api/register/otp", {
     method: "POST",
     body: JSON.stringify({ phone }),
   });
   ```

2. **Remove Demo UI Elements**
   - Remove demo phone number buttons
   - Remove demo OTP code buttons
   - Remove demo messages

3. **Update Error Handling**
   - Add real error states
   - Implement retry logic
   - Add loading states

4. **Environment Configuration**
   ```typescript
   const isDemo = process.env.NODE_ENV === "development";
   const apiCall = isDemo ? mockApi.sendOtp : realApi.sendOtp;
   ```

## 📋 **Mock Data Features**

### **Realistic Data**

- Nigerian phone number formats
- Realistic candidate names and parties
- Proper survey question structure
- Location hierarchy (State → LGA → Ward → PU)

### **Network Simulation**

- Realistic delays (500ms - 1500ms)
- Success/error responses
- Loading states

### **State Management**

- Persistent registration state
- Form validation
- Progress tracking

## 🎨 **UI/UX Benefits**

### **Design Testing**

- Test complete user flows
- Validate UI components
- Check responsive design
- Verify accessibility

### **User Experience**

- Smooth transitions
- Loading states
- Error handling
- Success feedback

### **Development**

- No backend dependency
- Fast iteration
- Easy debugging
- Component isolation

## 🔧 **Configuration**

### **Enable/Disable Demo Mode**

```typescript
// In mockApi.ts
export const DEMO_MODE = true; // Set to false for production

// Usage
if (DEMO_MODE) {
  return await mockApi.sendOtp(phone);
} else {
  return await realApi.sendOtp(phone);
}
```

### **Customize Mock Data**

```typescript
// Add more demo users
export const mockUsers = [
  // ... existing users
  {
    id: "user-3",
    phone: "+2348088888888",
    firstName: "Test",
    lastName: "User",
    // ... profile data
  },
];
```

## 📊 **Performance**

### **Build Stats**

- ✅ Build successful
- ✅ No TypeScript errors
- ✅ All routes working
- ✅ Mock data loading correctly

### **Bundle Size**

- Mock API: ~2KB
- No impact on production bundle
- Easy to remove for production

## 🎉 **Ready for Demo**

The system is now fully configured for demo purposes with:

- ✅ Mock API implementation
- ✅ Demo phone numbers
- ✅ Demo OTP codes
- ✅ Realistic user flows
- ✅ Complete UI testing
- ✅ Build verification

**Perfect for showcasing the voter registration system without requiring real backend services!**
