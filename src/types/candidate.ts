// Candidate type matching Prisma Candidate model
export type Candidate = {
  id: string;
  name: string;
  party: string;
  position:
    | "President"
    | "Governor"
    | "Senator"
    | "House of Representatives"
    | "State Assembly";
  isNational: boolean;
  state: string | null; // Nullable for Presidential candidates (isNational = true)
  lga: string | null; // Nullable for Presidential candidates (isNational = true)
  constituency: string | null; // Nullable for Presidential candidates (isNational = true)
  description?: string;
  supporters: number;
  email: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string

  // Additional fields for UI (not in Prisma but useful)
  surveyId?: string; // Link to survey ID
  tagline?: string;
  vision?: string;
};
