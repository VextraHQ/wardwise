export type Voter = {
  id: string;
  nin: string; // National Identification Number (11 digits, unique)
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  email?: string;
  phoneNumber: string;
  gender: "male" | "female" | "other";
  occupation: string;
  religion: string;
  age: number;
  state: string;
  lga: string;
  ward: string;
  pollingUnit: string;
  candidateId?: string; // Optional for incomplete registrations
  surveyAnswers: Record<string, string | string[]>; // JSON structure
  verifiedAt: string; // ISO datetime string
  registrationDate: string; // ISO date string
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  // Production-ready fields for registration status tracking
  // registrationStatus is computed from lastCompletedStep (see registration-helpers.ts)
  lastCompletedStep?: RegistrationStep;
  surveyCompleted?: boolean; // Whether survey is fully completed
};

export type RegistrationStep =
  | "nin"
  | "profile"
  | "location"
  | "candidate"
  | "survey"
  | "confirm";
