import type { CandidateSelection } from "./voter";

export type RegistrationData = {
  nin: string;
  phone: string;
  electionYear?: number;
  basic: {
    role: "voter" | "supporter";
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: string;
    email: string;
    age: number;
    gender?: "male" | "female" | "other";
    occupation?: string;
    religion?: string;
    vin?: string;
  };
  location: {
    state: string;
    lga: string;
    ward: string;
    pollingUnit: string;
  };
  // Multi-candidate support: 5 mandatory positions
  candidates: {
    selections: CandidateSelection[];
  };
  // Canvasser referral code (optional)
  canvasser?: {
    canvasserCode?: string;
  };
  // Survey removed from mandatory registration
  survey?: {
    surveyId: string;
    answers: Record<string, string | string[]>;
  };
  // Old single-candidate field (deprecated)
  candidate?: {
    candidateId: string;
    candidateName?: string;
  };
};
