# Type Strategy Guide: Prisma vs Custom Types

## When to Use Each Type

### Prisma Types (from `@prisma/client`)

**Use for:**

- Database operations (queries, mutations)
- Type-safe database interactions
- Internal server logic

**Characteristics:**

- Generated from Prisma schema
- Includes `DateTime` objects (not JSON serializable)
- Includes relations as objects
- Fully type-safe with database

**Example:**

```typescript
// Prisma returns this type
const candidate: Prisma.CandidateGetPayload<{
  include: { user: true }
}> = await prisma.candidate.findUnique({ ... });

// candidate.createdAt is a Date object
// candidate.user is a User object (if included)
```

### Custom Types (from `@/types/*`)

**Use for:**

- API responses
- Frontend components
- Data that crosses the network boundary

**Characteristics:**

- Dates are ISO strings (JSON serializable)
- Matches what frontend expects
- May include computed/display fields
- Optimized for API responses

**Example:**

```typescript
// Custom type for API
type Candidate = {
  id: string;
  name: string;
  createdAt: string; // ISO string, not Date
  email: string; // Computed from user relation
};
```

## Best Practice Pattern

### 1. Use Prisma Types for Database Operations

```typescript
// ✅ Good: Use Prisma types for queries
const candidate = await prisma.candidate.findUnique({
  where: { id },
  include: { user: true },
});
// candidate is Prisma type with Date objects
```

### 2. Transform to Custom Types for API Responses

```typescript
// ✅ Good: Transform before sending to client
return NextResponse.json({
  candidate: {
    ...candidate,
    createdAt: candidate.createdAt.toISOString(), // Date → string
    email: candidate.user?.email || "", // Extract from relation
  },
});
```

### 3. Why Transform?

- **JSON Serialization**: `DateTime` objects can't be JSON stringified
- **Frontend Compatibility**: Frontend expects ISO strings
- **Type Safety**: Custom types match frontend component props
- **Computed Fields**: Add fields like `email` from relations

## Common Patterns

### Pattern 1: Simple Transformation

```typescript
// Prisma query
const data = await prisma.model.findMany();

// Transform dates
const transformed = data.map((item) => ({
  ...item,
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString(),
}));
```

### Pattern 2: With Relations

```typescript
// Prisma query with relation
const candidate = await prisma.candidate.findUnique({
  include: { user: true },
});

// Transform and extract
const transformed = {
  ...candidate,
  email: candidate.user?.email || "", // Extract from relation
  createdAt: candidate.createdAt.toISOString(),
  user: candidate.user
    ? {
        ...candidate.user,
        createdAt: candidate.user.createdAt.toISOString(),
      }
    : null,
};
```

### Pattern 3: Type Assertions

```typescript
// When Prisma returns string but custom type expects union
position: candidate.position as Candidate["position"];
// This tells TypeScript the string matches the union type
```

## API Routes Pattern

**The Rule: Use Prisma types for database operations, transform to custom types for responses**

### Pattern 1: With Type Assertions (Candidates)

```typescript
// ✅ CORRECT: Import custom type when you need type assertions
import { Prisma } from "@prisma/client";
import type { Candidate } from "@/types/candidate"; // Import for type assertions

export async function GET() {
  // 1. Database query - returns Prisma types (with Date objects)
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: { user: true },
  });

  // 2. Transform Prisma type → Custom type for API response
  return NextResponse.json({
    candidate: {
      ...candidate,
      position: candidate.position as Candidate["position"], // ⚠️ Type assertion needed
      createdAt: candidate.createdAt.toISOString(), // Date → ISO string
      updatedAt: candidate.updatedAt.toISOString(),
    },
  });
}
```

**Why import `Candidate`?** Because `position` is a union type (`"President" | "Governor" | ...`), and Prisma returns a string. The type assertion ensures TypeScript knows it matches the union.

### Pattern 2: Without Type Assertions (Voters/Canvassers)

```typescript
// ✅ CORRECT: No import needed if no type assertions
import { Prisma } from "@prisma/client";
// No custom type import - just transform dates

export async function GET() {
  // 1. Database query - returns Prisma types
  const voters = await prisma.voter.findMany();

  // 2. Transform dates only (no type assertions needed)
  return NextResponse.json({
    voters: voters.map((voter) => ({
      ...voter,
      dateOfBirth: voter.dateOfBirth.toISOString(), // Simple transformation
      createdAt: voter.createdAt.toISOString(),
      updatedAt: voter.updatedAt.toISOString(),
    })),
  });
}
```

**Why no import?** Because all fields are simple types (string, number, etc.) - no union types that need assertions.

### When to Import Custom Types in Routes

| Scenario                            | Import Custom Type? | Example                      |
| ----------------------------------- | ------------------- | ---------------------------- |
| Need type assertion for union types | ✅ **Yes**          | `as Candidate["position"]`   |
| Just transforming dates             | ❌ **Optional**     | `createdAt.toISOString()`    |
| Want TypeScript to verify shape     | ✅ **Yes**          | Type checking transformation |
| Simple date transformations only    | ❌ **No**           | Just convert Date → string   |

**Both patterns are valid!** Import custom types when you need type safety for complex transformations or union types.

## Summary

| Use Case                      | Type to Use      | Reason                                  |
| ----------------------------- | ---------------- | --------------------------------------- |
| Database queries              | Prisma types     | Type-safe, matches schema               |
| API responses                 | Custom types     | JSON serializable, frontend-compatible  |
| Internal logic                | Prisma types     | Full type safety                        |
| Component props               | Custom types     | Matches frontend expectations           |
| **Type assertions in routes** | **Custom types** | **For `as Candidate["position"]` etc.** |

## Seed Files (`prisma/seed.ts`)

**Best Practice: Use plain objects (no types needed)**

```typescript
// ✅ Good: Plain objects, Prisma handles conversion
const candidates = [
  {
    id: "cand-1",
    name: "John Doe",
    party: "APC",
    position: "Governor",
    isNational: false,
    state: "Lagos",
    // Don't set createdAt/updatedAt - Prisma uses @default(now())
  },
];

// ❌ Avoid: Custom types (have dates as ISO strings)
import type { Candidate } from "@/types/candidate";
const candidates: Candidate[] = [...]; // Wrong - dates are strings, not Date objects

// ❌ Avoid: Setting dates manually
await prisma.candidate.create({
  data: {
    ...candidate,
    createdAt: new Date().toISOString(), // Wrong - Prisma handles this
  },
});
```

**Why?**

- Prisma automatically handles `createdAt`/`updatedAt` with `@default(now())`
- Plain objects are simpler and Prisma infers types from schema
- Custom types are for API responses, not database operations

## Key Takeaway

**Always transform Prisma types to custom types before sending API responses.**

This ensures:

1. Dates are JSON serializable (ISO strings)
2. Frontend receives expected format
3. Type safety across the stack
4. Computed fields are included

**For seed files: Use plain objects and let Prisma handle dates automatically.**
