/**
 * Registration Types
 *
 * Types for voter registration data submission.
 */

export type RegistrationData = {
  nin: string;
  phone?: string;
  basic: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    age: number;
    gender: "male" | "female" | "other";
    occupation: string;
    religion: string;
  };
  location: {
    state: string;
    lga: string;
    ward: string;
    pollingUnit: string;
  };
  candidate: {
    candidateId: string;
    candidateName?: string;
  };
  survey: {
    surveyId: string;
    answers: Record<string, string | string[]>;
  };
  electionYear: number;
};
