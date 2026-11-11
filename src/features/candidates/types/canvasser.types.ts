export type Canvasser = {
  id: string;
  code: string; // Unique code like "FINT-A001"
  name: string;
  phone: string;
  candidateId: string;
  candidateName?: string; // For display purposes
  ward?: string;
  lga?: string;
  state?: string;
  votersCount?: number; // Number of voters registered by this canvasser
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

/** @keep Not used yet. Kept for future features (knip skips @keep). */
export type CanvasserWithCandidate = Canvasser & {
  candidate: {
    id: string;
    name: string;
    party: string;
    position: string;
  };
};
