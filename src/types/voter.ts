import type { Candidate } from "@/types/candidate";

export type Voter = {
  id: string;
  nin: string; // National Identification Number (11 digits, unique)
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  email: string; // Now mandatory
  phoneNumber: string;
  gender: "male" | "female" | "other";
  occupation?: string;
  religion?: string;
  age: number;
  state: string;
  lga: string;
  ward: string;
  pollingUnit: string;
  role: "voter" | "supporter"; // User role
  vin?: string; // Voter Identification Number (optional, for verified voters)
  canvasserCode?: string; // Optional canvasser referral code
  candidateSelections?: CandidateSelection[]; // Multi-candidate selections
  surveyAnswers?: Record<string, string | string[]>; // JSON structure (optional)
  verifiedAt?: string; // ISO datetime string
  registrationDate: string; // ISO date string
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  // Production-ready fields for registration status tracking
  // registrationStatus is computed from lastCompletedStep (see registration-helpers.ts)
  lastCompletedStep?: RegistrationStep;
  surveyCompleted?: boolean; // Whether survey is fully completed
};

export type CandidateSelection = {
  position: Candidate["position"];
  candidateId: string;
  candidateName?: string;
  candidateParty?: string;
};

export type RegistrationStep =
  | "nin"
  | "role"
  | "profile"
  | "location"
  | "candidate"
  | "confirm";
