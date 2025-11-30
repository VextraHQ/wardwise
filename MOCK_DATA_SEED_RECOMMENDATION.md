# Using Mock Data in Seed File - Recommendation

## Current Situation

**Seed file (`prisma/seed.ts`):**

- Has hardcoded candidate data (presidential + Adamawa candidates)
- Has hardcoded voter data
- Duplicates data that exists in mock files

**Mock data files:**

- `src/lib/mock/data/candidates.ts` - Has all candidates (presidential + state)
- `src/lib/mock/data/voters.ts` - Has all voters

## Recommendation: ✅ **YES, use mock data imports**

### Pros:

1. **Single source of truth** - Update data in one place, used everywhere
2. **Consistency** - Same data in mock API and database seed
3. **Easier maintenance** - No duplicate data to keep in sync
4. **Type safety** - Can use TypeScript types for validation

### Cons:

1. **Transformation needed** - Mock data has extra fields not in Prisma schema:
   - `photo`, `surveyId`, `tagline`, `vision` (not in Candidate model)
   - `email` (in User model, not Candidate)
   - Dates as ISO strings (need to convert to Date objects)
2. **Different IDs** - Some seed candidates have different IDs than mock:
   - Seed: `cand-gov-apc-adamawa`
   - Mock: `cand-apc-1`
   - **Solution**: Use mock IDs or create mapping

## Implementation Pattern

### 1. Import Mock Data

```typescript
import { candidates as mockCandidates } from "@/lib/mock/data/candidates";
import { voters as mockVoters } from "@/lib/mock/data/voters";
```

### 2. Create Transformation Helpers

```typescript
/**
 * Transform mock candidate to Prisma Candidate data
 * Filters out non-schema fields (photo, surveyId, tagline, vision)
 */
function transformCandidateForSeed(mockCandidate: (typeof mockCandidates)[0]) {
  const {
    photo, // ❌ Not in Prisma schema
    surveyId, // ❌ Not in Prisma schema
    tagline, // ❌ Not in Prisma schema
    vision, // ❌ Not in Prisma schema
    createdAt, // ❌ Prisma auto-generates
    updatedAt, // ❌ Prisma auto-generates
    email, // ⚠️ Goes to User model, not Candidate
    ...candidateData
  } = mockCandidate;

  return {
    candidateData: {
      id: candidateData.id,
      name: candidateData.name,
      party: candidateData.party,
      position: candidateData.position,
      isNational: candidateData.isNational,
      state: candidateData.state,
      lga: candidateData.lga,
      constituency: candidateData.constituency,
      description: candidateData.description,
      supporters: candidateData.supporters,
      // Don't set createdAt/updatedAt - Prisma uses @default(now())
    },
    email: email || "", // Extract for User model creation
  };
}

/**
 * Transform mock voter to Prisma Voter data
 * Converts ISO string dates to Date objects
 */
function transformVoterForSeed(mockVoter: (typeof mockVoters)[0]) {
  const { createdAt, updatedAt, ...voterData } = mockVoter;

  return {
    nin: voterData.nin,
    firstName: voterData.firstName,
    // ... other fields
    dateOfBirth: new Date(voterData.dateOfBirth), // ISO string → Date
    registrationDate: new Date(voterData.registrationDate),
    verifiedAt: voterData.verifiedAt ? new Date(voterData.verifiedAt) : null,
    // Don't set createdAt/updatedAt - Prisma uses @default(now())
    candidateSelections: voterData.candidateSelections
      ? {
          create: voterData.candidateSelections.map((s) => ({
            position: s.position,
            candidateId: s.candidateId,
          })),
        }
      : undefined,
  };
}
```

### 3. Use in Seed Function

```typescript
async function main() {
  // Use mock data for all candidates
  for (const mockCandidate of mockCandidates) {
    const { candidateData, email } = transformCandidateForSeed(mockCandidate);

    // Create candidate
    const candidate = await prisma.candidate.create({
      data: candidateData,
    });

    // Create user with email
    await prisma.user.create({
      data: {
        email,
        name: candidateData.name,
        role: "candidate",
        candidateId: candidate.id,
      },
    });
  }

  // Use mock data for all voters
  for (const mockVoter of mockVoters) {
    const voterData = transformVoterForSeed(mockVoter);
    await prisma.voter.create({ data: voterData });
  }
}
```

## Decision Needed

**Option 1: Use mock data as-is**

- ✅ Simpler
- ❌ Need to align candidate IDs between seed and mock
- ❌ Some seed candidates might not be in mock data

**Option 2: Keep seed-specific candidates separate**

- ✅ More flexible
- ❌ Still have some duplication
- ✅ Can have seed-only test data

**Option 3: Hybrid approach**

- Use mock data for candidates that exist in mock
- Keep seed-specific candidates (like test/demo ones) separate
- Use mock data for all voters

## My Recommendation

**Go with Option 3 (Hybrid):**

1. Use mock data imports for candidates that exist in mock
2. Use transformation helpers to filter non-schema fields
3. Keep any seed-specific test candidates separate
4. Use mock data for all voters (they align well)

This gives you:

- Single source of truth for most data
- Flexibility for seed-specific data
- Type safety and consistency

## Next Steps

If you want to proceed:

1. ✅ I've already added the transformation helpers to `prisma/seed.ts`
2. ⏳ Update the seed loop to use `mockCandidates` instead of hardcoded arrays
3. ⏳ Update voter seeding to use `mockVoters` with transformation
4. ⏳ Test that all data seeds correctly
5. ⏳ Verify candidate IDs match between mock and seed (or create mapping)

Would you like me to implement this refactor?
