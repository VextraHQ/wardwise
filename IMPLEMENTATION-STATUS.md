# Multi-Candidate Implementation Status

## ✅ PHASE 1 & 2: BACKEND COMPLETE (100%)

### Database Schema

- ✅ Created `VoterCandidateSelection` junction table
- ✅ Added `email` (mandatory), `vin` (optional), `role` (voter/supporter) to Voter model
- ✅ Created `Canvasser` model with unique codes
- ✅ Updated `Candidate` model with `isNational` flag for Presidential candidates
- ✅ Migration applied successfully

### Seed Data

- ✅ 4 Presidential candidates (APC, PDP, Labour, NNPP)
- ✅ 8 State/LGA candidates for Adamawa (2 Governors, 2 Senators, 2 House Reps, 2 State Assembly)
- ✅ 7 Canvassers with unique codes (FINT-A001, AHMED-B002, etc.)
- ✅ 6 Demo voters/supporters with multi-candidate selections (5 positions each)
- ✅ 1 Supporter under 18 years old (demonstrates supporter vs voter distinction)

### Types & Schemas

- ✅ Updated `Voter` type with new fields
- ✅ Created `CandidateSelection` type
- ✅ Updated `RegistrationStep` type (removed "survey", added "canvasser")
- ✅ Created validation schemas for email, VIN, role, multi-candidate selections
- ✅ Updated registration store with new step order

---

## ✅ PHASE 3: FRONTEND COMPLETE (100%)

### Registration Flow Components - All Updated!

#### ✅ Completed Components:

1. **Canvasser Step** - `/register/canvasser/page.tsx`
   - ✅ Created component with optional code entry
   - ✅ Skip functionality included

2. **Profile Step** - `/components/voter/steps/profile-step-new.tsx`
   - ✅ Add role selection (Voter vs Supporter) at top of form
   - ✅ Add email field (mandatory)
   - ✅ Add VIN field (conditional - only show for voters with incentive messaging)
   - ✅ Make occupation/religion optional
   - ✅ Update age validation (voters ≥18, supporters ≥1)
   - ✅ Conditional alert if voter selected but age < 18

3. **Candidate Selection Step** - `/components/voter/steps/candidate-selection-step-new.tsx`
   - ✅ Update to show 5 tabs (President, Governor, Senator, House Rep, State Assembly)
   - ✅ Make all 5 selections mandatory
   - ✅ Presidential candidates visible to ALL voters (not filtered by state)
   - ✅ Store multiple selections in array format
   - ✅ Show progress: "X/5 positions selected"
   - ✅ Disable continue button until all 5 positions selected
   - ✅ Position-specific icons and badges

4. **Location Step** - `/components/voter/steps/location-step.tsx`
   - ✅ Navigation already goes to `/register/candidate` (no changes needed)

5. **NIN Entry Step** - `/register/page.tsx`
   - ✅ Routing to profile step works correctly (no changes needed)

6. **Completion Step** - `/components/voter/steps/completion-step.tsx`
   - ✅ Display all 5 selected candidates grouped by position
   - ✅ Show VIN status (verified/unverified) with badge
   - ✅ Show canvasser info if applicable
   - ✅ Remove survey-related messaging
   - ✅ Show email and role fields
   - ✅ Sort positions correctly (President first)

7. **Mock Data & Types**
   - ✅ Added 4 Presidential candidates to mock data
   - ✅ Updated Candidate type to include "President" position
   - ✅ Updated Candidate type to make state nullable (for Presidential candidates)
   - ✅ Updated candidate API to include Presidential candidates for all states

**Development Server Status:** ✅ Running successfully on port 3002 with no compilation errors

---

## 🚧 PHASE 4: API & BACKEND LOGIC (0%)

### Registration API

**File:** `/src/app/api/voters/route.ts` (or similar)

#### Changes Needed:

1. Accept `role`, `email`, `vin`, `canvasserCode` in request body
2. Accept `candidateSelections` array instead of single `candidateId`
3. Create voter record with new fields
4. Create multiple `VoterCandidateSelection` records (one for each of 5 positions)
5. Validate canvasser code if provided
6. Return success with all candidate selections

#### Example Request Body:

```json
{
  "nin": "12345678901",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+2348012345678",
  "dateOfBirth": "1990-01-01",
  "age": 34,
  "role": "voter",
  "vin": "90123456789012345678",
  "state": "Adamawa",
  "lga": "Yola North",
  "ward": "Karewa Ward",
  "pollingUnit": "Karewa Primary School - 001",
  "canvasserCode": "FINT-A001",
  "candidateSelections": [
    { "position": "President", "candidateId": "cand-president-apc" },
    { "position": "Governor", "candidateId": "cand-gov-apc-adamawa" },
    { "position": "Senator", "candidateId": "cand-sen-apc-adamawa" },
    {
      "position": "House of Representatives",
      "candidateId": "cand-hr-apc-adamawa"
    },
    { "position": "State Assembly", "candidateId": "cand-sa-apc-adamawa" }
  ]
}
```

---

## 🚧 PHASE 5: VOTER PROFILE & DASHBOARD VIEWS (0%)

### Voter Profile Page

**File:** `/src/app/(voter)/profile/page.tsx` or similar

#### Changes Needed:

1. Fetch voter with `candidateSelections` included
2. Display all 5 selected candidates grouped by position
3. Show role (Voter or Supporter)
4. Show VIN status with badge (Verified Voter / Unverified)
5. Show canvasser info if applicable
6. Remove survey-related UI

#### Example UI:

```
Your Profile
Role: Voter ✓ Verified

Your Selected Candidates:
🏛️ President: Bola Ahmed Tinubu (APC)
🏛️ Governor: Ahmadu Umaru Fintiri (APC)
🏛️ Senator: Mohammed Jibrilla Bindow (APC)
🏛️ House of Representatives: Abdulrazak Namdas (APC)
🏛️ State Assembly: Ibrahim Usman (APC)

Referred by: Chioma Okonkwo (FINT-A001)
```

---

## 🚧 PHASE 6: CANDIDATE DASHBOARD UPDATES (0%)

### Analytics Functions

**File:** `/src/lib/helpers/voter-analytics.ts`

#### Changes Needed:

1. Update `getSupportersCount(candidateId)` to query `VoterCandidateSelection` table
2. Update all analytics functions to use junction table
3. Add canvasser analytics functions:
   - `getCanvasserPerformance(candidateId)`
   - `getTopCanvassers(candidateId, limit)`

### Candidate Dashboard - Canvasser Section

**File:** `/src/components/candidate-dashboard/canvassers-section.tsx` (new file)

#### Features to Build:

1. List of all canvassers for this candidate
2. Voters/supporters brought in by each canvasser
3. Leaderboard (Top 5 performers)
4. Simple table view with:
   - Canvasser name
   - Code
   - Phone
   - Ward
   - Total referrals (voters + supporters)

#### Example UI:

```
🏆 Top Canvassers

1. Chioma Okonkwo (FINT-A001) - 47 voters, 12 supporters
2. Ibrahim Yusuf (FINT-A002) - 34 voters, 8 supporters
3. Fatima Bello (FINT-A003) - 29 voters, 15 supporters

[View All Canvassers]
```

### Dashboard Supporter List

**File:** `/src/components/candidate-dashboard/supporters-list.tsx`

#### Changes Needed:

1. Update query to fetch from `VoterCandidateSelection` where `candidateId = X`
2. Join with `Voter` table to get full voter info
3. Display position they selected you for
4. Show canvasser who brought them in

---

## 📋 TESTING CHECKLIST

### Registration Flow

- [ ] Can register as Supporter (under 18, no VIN)
- [ ] Can register as Voter (18+, optional VIN with incentive)
- [ ] Email field is mandatory for all
- [ ] Must select all 5 candidates (President, Governor, Senator, House Rep, State Assembly)
- [ ] Presidential candidates visible to all states
- [ ] State/LGA candidates filtered correctly
- [ ] Canvasser code is optional
- [ ] Can skip canvasser step
- [ ] No survey step in flow
- [ ] Completion page shows all 5 selections

### Candidate Dashboard

- [ ] Supporter count reflects multi-candidate selections
- [ ] Analytics work with junction table
- [ ] Canvasser section shows all canvassers
- [ ] Canvasser leaderboard displays correctly
- [ ] Supporters list shows position selected

### Voter Profile

- [ ] Shows all 5 selected candidates
- [ ] Displays role (Voter/Supporter)
- [ ] Shows VIN status if applicable
- [ ] Shows canvasser referral if applicable

---

## 🎯 PRIORITY ORDER

**If time is limited, implement in this order:**

### Priority 1 (Must Have):

1. Update profile step (role, email, VIN)
2. Update candidate selection step (5 positions mandatory)
3. Update registration API (handle multi-candidate)
4. Update completion step (show all 5)

### Priority 2 (Should Have):

5. Update voter profile page (display all selections)
6. Update candidate analytics (use junction table)
7. Add canvasser section to dashboard

### Priority 3 (Nice to Have):

8. Canvasser leaderboard with charts
9. Advanced filtering in supporter list
10. Email templates referencing new structure

---

## 📝 NOTES

### Testing Credentials:

- **Admin:** admin@wardwise.ng / admin123
- **Presidential Candidate:** tinubu@wardwise.ng / demo123
- **Governor Candidate:** fintiri@wardwise.ng / demo123
- **All Candidates:** password is `demo123`

### Canvasser Codes for Testing:

- FINT-A001 (Chioma Okonkwo - APC Governor)
- AHMED-B002 (Hauwa Ibrahim - PDP Governor)
- TINUBU-001 (Adamu Garba - APC President)
- ATIKU-001 (Zainab Musa - PDP President)

### Demo Voters:

- NIN: 12345678901 - Voter with VIN, referred by FINT-A001
- NIN: 98765432109 - Voter with VIN, referred by AHMED-B002
- NIN: 22334455667 - Voter without VIN, no canvasser
- NIN: 33445566778 - Supporter (age 17), referred by FINT-A001

---

**Last Updated:** November 25, 2025
**Status:** Backend Complete, Frontend 30% Complete
