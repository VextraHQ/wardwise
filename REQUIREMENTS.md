# WardWise Enhancement Requirements - Meeting Notes

**Date:** November 24, 2025
**Client:** Political Candidate (Politician himself)
**Goal:** Transform WardWise from election-only tool → sustainable constituent management platform
**Timeline:** Quick demo to secure funding from politicians

---

## 🎯 Core Vision

**Problem Statement:**

- Current app only useful during election period (2-3 months)
- No guarantee voters will actually vote for candidate (no commitment mechanism)
- Missing ground reality: Canvassers are backbone of Nigerian campaigns
- No post-election engagement between candidates and voters

**Solution:**
Multi-tier platform that serves candidates, voters, supporters, and survey clients before, during, and after elections.

---

## 📋 CONFIRMED Requirements from Client

### 1. Multi-Candidate Selection System

**Current State:**

- Voters select ONE candidate only
- Limited to 4 positions: Governor, Senator, House Rep, State Assembly

**Required Changes:**

- ✅ Add **President** position (general, not state-specific)
- ✅ Enable selection of **5 candidates total** (one per position):
  1. President
  2. Governor
  3. Senator
  4. House of Representatives
  5. State Assembly
- ✅ **All 5 selections MANDATORY** (client requirement)
- ✅ Clean migration: Wipe all existing voter-candidate associations

**Technical Notes:**

- Need new database structure (junction table or JSON field)
- Presidential candidates visible to ALL voters regardless of state
- State/LGA-specific candidates filtered as before

---

### 2. Supporter vs Voter Distinction

**New User Types:**

#### **SUPPORTER**

- **Age:** Any age (can be under 18)
- **Purpose:** Show support, help with campaigning, social media engagement
- **VIN:** NOT required
- **Surveys:** Cannot answer surveys
- **Value to Candidate:** Brand awareness, youth mobilization, social proof

#### **VOTER**

- **Age:** Must be 18+ (voting age in Nigeria)
- **Purpose:** Actual committed voters
- **VIN:** **MANDATORY** (client requirement)
- **Surveys:** Can answer surveys
- **Value to Candidate:** Actionable voting data, direct election impact

**Registration Flow:**

1. User selects: "Register as Supporter" OR "Register as Voter"
2. If Supporter: Skip VIN, allow any age
3. If Voter: Require VIN, validate age ≥ 18

**Client Reasoning:**

- VIN (PVC number) = proof of commitment ("this person will actually vote for me")
- Youth under 18 can still contribute as supporters
- Creates two-tier value system for candidates

---

### 3. Enhanced Profile Data Collection

**Current Fields:**

- Name, Date of Birth, Phone, Address, State, LGA, Ward, Polling Unit

**New Required Fields:**

- ✅ **Email** (mandatory for all users)
- ✅ **VIN/PVC Number** (mandatory for voters, not shown for supporters)

**Purpose:**

- Email enables post-election communication
- Candidates can send newsletters, town hall invites, progress updates
- Maintains relationship beyond election day (4-year cycle)
- VIN proves voter eligibility and commitment

**Technical Notes:**

- VIN format: 19-20 digits (no public validation API exists)
- Need client-side format validation
- Privacy: Encrypt VIN at rest, mask in candidate dashboard
- NDPR compliance (Nigerian Data Protection Regulation)

---

### 4. Canvasser/Field Agent System

**Background:**
In Nigerian politics, canvassers (also called coordinators, party agents, or field agents) are the backbone of campaigns. They mobilize voters ward-by-ward and bring blocks of voters to candidates.

**Hierarchy:**

```
Candidate
  ↓
Campaign Manager
  ↓
Ward Coordinators (5-20 per LGA)
  ↓
Street/Polling Unit Agents (100s)
  ↓
Individual Voters (1000s)
```

**Required Features:**

#### **During Voter/Supporter Registration:**

- Optional field: "Were you referred by a canvasser?"
- If yes: Enter canvasser code (e.g., "FINT-A001")
- If no: Register as individual
- Canvassers can work for multiple candidates

#### **Candidate Dashboard:**

- List of all canvassers
- Count of voters/supporters brought in by each canvasser
- Leaderboard: Top performing canvassers
- Breakdown by ward/polling unit
- Map visualization of canvasser coverage

**Client Reasoning:**

- Canvassers are paid based on performance (₦50k-500k based on numbers)
- Candidates need to track which canvassers are performing
- This feature alone could sell the platform to politicians

**Technical Considerations:**

- Canvasser accounts created by candidates
- Each canvasser gets unique code
- Attribution: First canvasser code entered = credited
- Prevent double-claiming of voters

---

### 5. Survey System Evolution

**Current State:**

- Survey happens during registration (after candidate selection)
- Each candidate has their own survey
- Voters fill out survey for selected candidate

**Client Vision (Phased):**

#### **Phase 1 (Keep for Demo):**

- Survey during registration
- One survey per selected candidate (up to 5 surveys!)
- **Make surveys OPTIONAL** (not mandatory)

#### **Phase 2 (Post-Funding):**

- On-demand survey creation by candidates
- Candidates create surveys anytime
- Send email invitations to voters/supporters
- Example: "Roads are bad in Ward 5, let me survey my supporters there"

#### **Phase 3 (Revenue Stream):**

- **Survey-as-a-Service** for external clients:
  - INEC (pre-election polls)
  - Political parties (internal primaries)
  - Government agencies (NIA, INEC)
  - NGOs (voter sentiment research)
- Pricing: ₦500k-5M per survey campaign
- Geographic targeting, real-time analytics, export options

**Technical Notes:**

- Current: Keep survey in registration flow
- Make it clear surveys are optional
- Build survey creation UI mockup for demo
- Actual on-demand system built post-funding

---

### 6. Post-Election Engagement

**Client Insight:**
"The app is only useful for 2-3 months (campaign period), then it dies. How do we make it useful for 4 years until the next election?"

**Solution - Constituent Management System:**

#### **For Winners (After Election):**

- Send town hall meeting invites
- Share progress updates on campaign promises
- Conduct constituency polls
- Maintain voter database for re-election

#### **For Losers (After Election):**

- Stay connected with supporters
- Build base for next election cycle
- Send thought leadership content
- Prepare for party primaries (4 years later)

**Key Enabler:** Email + Phone database

**Technical Needs:**

- Email campaign system (SendGrid/Mailgun integration)
- SMS campaigns (optional)
- Broadcast messaging
- Segmentation (by ward, age, demographics)
- Unsubscribe management

---

### 7. Revenue Model & Sustainability

**Client Question:**
"How do we make money? Should we charge monthly subscriptions?"

**Proposed Model - Freemium Tiers:**

#### **FREE TIER** (Demo Tool)

- Up to 100 supporters/voters
- Basic dashboard
- Manual registration only
- WardWise branding
- **Purpose:** Get candidates hooked

#### **PRO TIER - ₦100,000/month** (~$120/month USD)

_Target: House of Reps candidates, State Assembly_

- Unlimited supporters/voters
- Canvasser management (up to 50 canvassers)
- Email campaigns (5,000 emails/month)
- Advanced analytics & heat maps
- Priority support
- **Total for 12-month campaign:** ₦1.2M (~$1,440)

#### **ENTERPRISE - ₦500,000/month** (~$600/month USD)

_Target: Governors, Senators, Party Chairmen_

- Multiple candidate accounts under one organization
- Unlimited canvassers
- Unlimited email/SMS campaigns
- White-label option (remove WardWise branding)
- API access for integration
- Dedicated account manager
- **Total for 12-month campaign:** ₦6M (~$7,200)

#### **SURVEY-AS-A-SERVICE** (Separate Revenue Stream)

_Target: INEC, government agencies, political parties, NGOs_

- Base: ₦500,000 per survey campaign
- Variable: ₦50 per response
- Custom survey design
- Geographic targeting
- Real-time analytics dashboard
- Export to PDF/Excel
- **Example:** 10,000-person survey = ₦500k + (10k × ₦50) = ₦1M total

**Revenue Projection (Conservative):**

- 20 Pro candidates × ₦1.2M/year = ₦24M
- 5 Enterprise × ₦6M/year = ₦30M
- 10 Survey campaigns/year × ₦1M avg = ₦10M
- **Total Annual:** ₦64M (~$77,000 USD)

**Note:** Nigeria has 774 LGAs, ~7,000+ candidates per election cycle = massive TAM (Total Addressable Market)

---

## 🚀 Implementation Phases

### **Phase 1: DEMO BUILD (This Week - 3-5 days)**

_Goal: Working demo to show politicians and secure funding_

**Must-Have Features:**

1. Multi-candidate selection (President + 4 positions, all mandatory)
2. Supporter vs Voter role selection
3. VIN field (mandatory for voters)
4. Email field (mandatory for all)
5. Canvasser code field (optional)
6. Presidential candidates in seed data
7. Basic canvasser stats in dashboard
8. Clean database migration (wipe and reseed)

**Show But Don't Build:**

- Mockup of email campaign interface
- Mockup of on-demand survey creation
- Slides explaining Survey-as-a-Service
- Pricing tier presentation
- Post-election use case examples

---

### **Phase 2: POST-FUNDING MVP (1-3 months)**

_Goal: Production-ready platform for first paying candidates_

**Features:**

1. Full canvasser management system
   - Canvasser accounts and login
   - Performance tracking
   - Map visualization
   - Commission tracking (optional)

2. Email campaign system
   - SendGrid/Mailgun integration
   - Template builder
   - Segmentation tools
   - Analytics (open rates, click rates)
   - Unsubscribe management

3. On-demand survey creation
   - Drag-and-drop survey builder
   - Email/SMS invitations
   - Real-time response dashboard
   - Export results

4. Payment & subscription system
   - Paystack/Flutterwave integration
   - Subscription management
   - Free → Pro upgrade flow
   - Usage limits enforcement

5. Enhanced security
   - PII encryption
   - Penetration testing
   - NDPR compliance audit
   - Privacy policy + Terms of Service

6. Advanced analytics
   - Predictive modeling
   - Voter turnout probability
   - Ward-level insights
   - Competitor analysis

---

### **Phase 3: SCALE (3-6 months post-funding)**

_Goal: National platform with mobile apps_

**Features:**

1. Mobile apps
   - Canvasser mobile app (offline-first)
   - Voter engagement app
   - Push notifications

2. SMS campaigns
   - Bulk SMS integration
   - Two-way messaging
   - WhatsApp Business API

3. Survey-as-a-Service platform
   - Self-service portal for agencies
   - Payment per survey
   - White-label options

4. API & integrations
   - Public API for third-party tools
   - Zapier integration
   - CRM integrations (HubSpot, Salesforce)

5. AI-powered insights
   - Sentiment analysis
   - Churn prediction
   - Optimal messaging times
   - Automated reporting

---

## 🎬 Demo Script for Politicians

**Opening (30 seconds):**
"WardWise isn't just for elections - it's your constituent management system for your entire political career."

**Act 1 - Registration Types (2 mins):**

- Show supporter registering (under 18, no VIN, just wants to help)
- Show voter registering (18+, enters VIN, selects 5 candidates)
- Show canvasser code being entered
- Explain: "VIN ensures these are real voters who can actually vote for you"

**Act 2 - Multi-Candidate Selection (1 min):**

- Show 5-step selection: President → Governor → Senator → House Rep → State Assembly
- Explain: "One platform, complete political profile"

**Act 3 - Canvasser Power (2 mins):**

- Show dashboard with canvasser leaderboard
- "Chioma in Ward 5 brought in 47 voters, while Ibrahim in Ward 3 only brought 12"
- "You can see which wards need more ground game"
- Map visualization of canvasser coverage

**Act 4 - Data Goldmine (2 mins):**

- Demographics dashboard (age, gender, location)
- Survey results: "62% say roads are top priority in your constituency"
- Heat map: "You're strong in urban areas, weak in rural wards"
- Email/phone database: "3,247 verified voters you can reach anytime"

**Act 5 - Beyond Election Day (2 mins):**

- Show email campaign mockup
- "After you win, send town hall invites to all your voters in Ward 5"
- "Track campaign promises: 'I promised to fix roads - here's the progress update'"
- "Stay connected for 4 years till next election"
- Show pricing: "₦100k/month = ₦1.2M for entire campaign season"

**Act 6 - Revenue Streams (1 min):**

- "We're also building Survey-as-a-Service"
- "INEC, political parties, agencies pay for access to voters"
- "This platform scales beyond individual campaigns"

**Close (30 seconds):**
"With canvassers, verified voters, and post-election engagement, WardWise becomes your political operating system. Let's discuss how we can customize it for your campaign."

---

## ⚠️ Technical Concerns & Considerations

### 1. VIN Mandatory Requirement

**Concern:** Major barrier to entry, will significantly reduce sign-ups

**Reality:**

- Most Nigerians don't have their 19-digit PVC number memorized
- No public API to validate VIN exists
- Typing 19 digits on mobile = high error rate
- Privacy concern: VIN is sensitive personal data

**Alternatives to Consider:**

- Make VIN optional but incentivized ("Verified Voter" badge)
- Allow photo upload of PVC card instead
- Partial VIN (last 6 digits) for verification
- Two-tier: "Supporters" (no VIN) vs "Verified Voters" (with VIN)

---

### 2. 5 Mandatory Candidate Selections

**Concern:** Long registration flow = high drop-off rates

**Reality:**

- Many voters only care about 1-2 positions (President or Governor)
- 5 selections + 5 surveys (if each candidate has survey) = 30+ minutes registration
- Mobile users will abandon halfway

**Alternatives to Consider:**

- Require minimum 1 selection, allow up to 5
- Progressive disclosure: Select Governor first, then "Want to select more?"
- Save progress: Allow users to complete later

---

### 3. Survey Overload

**Concern:** If each of 5 candidates has their own survey = voter fatigue

**Reality:**

- Nobody will complete 5 surveys during registration
- Each survey could have 10-20 questions
- Registration becomes a chore, not a quick sign-up

**Recommendation:**

- Remove surveys from registration flow for now
- Make surveys optional post-registration
- Limit survey length (max 5 questions)
- Or: One general survey (not per candidate)

---

### 4. Canvasser Attribution Disputes

**Concern:** Multiple canvassers will claim the same voter

**Reality:**

- Political campaigns are competitive internally
- Canvassers paid based on performance = incentive to cheat
- Voter might enter wrong code or multiple codes

**Solutions:**

- First code entered = credited (clear rule)
- Voters choose their canvasser (they know who recruited them)
- Time-stamped attribution logs
- Dispute resolution mechanism in candidate dashboard

---

### 5. Data Privacy & Security

**Concern:** Collecting VIN + Email + Phone + Political affiliation = high-value data

**Reality:**

- If database is hacked = major scandal
- Political opponents could weaponize data
- NDPR (Nigerian Data Protection Regulation) compliance required

**Required Measures:**

- Encrypt PII (VIN, email, phone) at rest
- Hash VINs (don't store plaintext)
- Mask VIN in dashboards (show "VIN ending in ...4567")
- Penetration testing before launch
- Privacy policy + explicit consent
- Data retention policy (delete after election?)
- Role-based access control

---

### 6. Scalability

**Concern:** Nationwide elections = millions of users simultaneously

**Reality:**

- Election Day: Spike traffic (candidates checking stats)
- Registration period: Gradual load (weeks/months)
- Survey campaigns: Burst traffic (email → app visits)

**Architecture Needs:**

- Serverless/auto-scaling infrastructure (Vercel, AWS Lambda)
- Database optimization (indexing, caching)
- CDN for static assets
- Redis for session management
- Rate limiting to prevent abuse

---

### 7. Presidential Candidates (General vs State-Specific)

**Technical Decision Needed:**

Presidential candidates should be:

- Visible to ALL voters in Nigeria (not filtered by state)
- Limited to major parties (10-15 candidates max)
- Different data model: No state/LGA in Presidential candidate record

**Database Schema:**

```prisma
model Candidate {
  position     String  // "President" | "Governor" | "Senator" | etc.
  isNational   Boolean @default(false)  // true for President
  state        String? // null for Presidential candidates
  lga          String? // null for Presidential candidates
  constituency String? // null for Presidential candidates
}
```

---

## 📊 Database Schema Changes Required

### Current Schema (Single Candidate):

```prisma
model Voter {
  candidateId String?  // ❌ Single candidate only
}
```

### New Schema (Multi-Candidate):

**Option A: Separate Junction Table (Recommended)**

```prisma
model VoterCandidateSelection {
  id          String    @id @default(cuid())
  voterId     String
  candidateId String
  position    String    // "President", "Governor", etc.
  createdAt   DateTime  @default(now())

  voter       Voter     @relation(fields: [voterId], references: [id], onDelete: Cascade)
  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)

  @@unique([voterId, position])  // One selection per position
  @@index([voterId])
  @@index([candidateId])
  @@index([position])
}
```

**Option B: JSON Field (Faster but less queryable)**

```prisma
model Voter {
  candidateSelections Json?
  // Example: { "President": "cand-id-1", "Governor": "cand-id-2" }
}
```

**Recommendation:** Use Option A (junction table) for:

- Better query performance
- Easier analytics
- Referential integrity
- Future flexibility

---

### Enhanced Voter Model:

```prisma
model Voter {
  // Existing fields
  id                 String    @id @default(cuid())
  nin                String    @unique
  firstName          String
  middleName         String?
  surname            String
  dateOfBirth        DateTime
  phone              String
  address            String
  state              String
  lga                String
  ward               String
  pollingUnit        String

  // NEW FIELDS
  email              String    // ✅ Mandatory for all
  vin                String?   // ✅ Mandatory for voters, null for supporters
  role               String    @default("voter")  // ✅ "voter" | "supporter"
  canvasserCode      String?   // ✅ Optional canvasser reference

  // Relationships
  candidateSelections VoterCandidateSelection[]  // ✅ One-to-many
  canvasser          Canvasser? @relation(fields: [canvasserCode], references: [code])

  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
}
```

---

### New Canvasser Model:

```prisma
model Canvasser {
  id           String   @id @default(cuid())
  code         String   @unique  // e.g., "FINT-A001"
  name         String
  phone        String
  candidateId  String
  ward         String?
  lga          String?
  state        String?

  candidate    Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  voters       Voter[]

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([candidateId])
  @@index([code])
}
```

---

## 🎯 Success Metrics for Demo

**Immediate Goals (Funding Secured):**

- 3-5 politicians commit to paid pilots
- ₦5-10M in projected first-year revenue
- Clear roadmap agreement

**Demo Feedback to Capture:**

1. Which feature impressed them most?
2. What's missing that they need?
3. What pricing feels right?
4. Would they use it post-election?
5. Do they have canvassers who'd use this?

---

## 📝 Open Questions for Client

**Before Implementation:**

1. **VIN Collection:**
   - Truly mandatory (will reduce sign-ups by ~60-70%)?
   - Or optional with incentive ("Verified Voter" badge)?

2. **Survey Flow:**
   - Keep in registration (5 surveys!) or remove for now?
   - Make surveys optional or mandatory?

3. **Candidate Selection:**
   - All 5 positions mandatory?
   - Or allow partial selection (min 1, max 5)?

4. **Canvasser Management:**
   - Just tracking (voter enters code)?
   - Or full system (canvasser accounts, login, dashboard)?

5. **Presidential Candidates:**
   - How many to seed? (Top 4 parties or all 18 registered parties?)
   - Curated list or open registration?

6. **Data Ownership:**
   - Who owns voter data after election? (Candidate or WardWise?)
   - Can WardWise use aggregated data for Survey-as-a-Service?

7. **Pricing Validation:**
   - Is ₦100k/month realistic for House of Reps candidates?
   - Would they pay more for exclusivity (only candidate in constituency)?

---

## 🚧 Out of Scope (For Now)

**Not building for demo:**

- Payment/subscription system
- Email campaign integration (just mockup)
- SMS campaigns
- Canvasser mobile app
- On-demand survey creation (just mockup)
- Survey-as-a-Service platform
- API access
- White-label branding
- Advanced AI/ML analytics

**Build post-funding with clear requirements and budget.**

---

## 📅 Timeline

**Demo Build:** 3-5 days (targeting end of this week)

**Breakdown:**

- Day 1: Database schema changes + migration
- Day 2: Multi-candidate selection UI + backend
- Day 3: Supporter/Voter distinction + VIN field + Email field
- Day 4: Canvasser system (basic) + Presidential candidates
- Day 5: Polish, testing, mockups, demo prep

**Demo Presentation:** Next week (once ready)

**Post-Funding:** 1-3 months for MVP with paid features

---

## 💡 Additional Ideas (Nice to Have)

**Gamification:**

- Leaderboards for canvassers
- Badges for voters ("Early Supporter", "Survey Champion")
- Referral bonuses (bring 5 friends → get ₦500 airtime)

**Social Features:**

- Share candidate profile on WhatsApp/Facebook
- "I'm supporting [Candidate]" social media cards
- Viral growth loops

**Offline Support:**

- Canvasser can register voters offline (no internet)
- Sync when connected
- Critical for rural areas

**WhatsApp Integration:**

- WhatsApp Business API for broadcast
- Two-way messaging with voters
- More used than email in Nigeria

**Candidate Verification:**

- Verify candidate identity before account creation
- Prevents fake candidates
- INEC candidate list integration?

---

## 🎓 Key Learnings for Pitch

**For Politicians:**

1. "This isn't just campaign software - it's your political CRM for life"
2. "The canvasser feature alone pays for itself" (show ROI)
3. "Your opponents are using spreadsheets - you'll have live dashboards"
4. "After you win, you'll have direct line to 10,000+ constituents"

**For Investors:**

- ₦64M+ ARR potential with just 25 candidates
- Nigeria has 7,000+ candidates per election = massive TAM
- Survey-as-a-Service = additional revenue stream (INEC, agencies)
- Recurring revenue (candidates pay for 4 years, not just 3 months)
- Expansion: Replicate in Kenya, Ghana, South Africa (similar politics)

---

## ✅ Next Steps

1. **Get client sign-off** on:
   - VIN: Mandatory or optional?
   - Surveys: In registration or remove?
   - Canvasser: Basic tracking or full system?

2. **Create this documentation** (you are here!)

3. **Get technical advice** from development team

4. **Start implementation** once scope is locked

5. **Schedule demo** with target politicians

---

**Document Owner:** Development Team
**Last Updated:** November 24, 2025
**Status:** DRAFT - Awaiting Client Confirmation
