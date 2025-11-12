// Candidate type matching Prisma Candidate model
export type Candidate = {
  id: string;
  name: string;
  party: string;
  position:
    | "Governor"
    | "Senator"
    | "House of Representatives"
    | "State Assembly";
  state: string;
  constituency: string;
  description?: string;
  supporters: number;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string

  // Additional fields for UI (not in Prisma but useful)
  photo?: string;
  surveyId?: string; // Link to survey ID
  tagline?: string;
  vision?: string;
};
