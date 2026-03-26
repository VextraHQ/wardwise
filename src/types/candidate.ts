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
  stateCode: string | null; // 2-letter code (e.g. "AD"), null for President
  lga: string | null;
  constituency: string | null;
  description?: string;
  phone: string | null;
  title: string | null; // Honorific: Hon., Sen., Dr., etc.
  onboardingStatus: string; // "pending" | "credentials_sent" | "active" | "suspended"
  email: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string

  // Computed by API (not stored in DB)
  supporterCount?: number;

  // Additional fields for UI (not in Prisma but useful)
  surveyId?: string;
  tagline?: string;
  vision?: string;
};
