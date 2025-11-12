/**
 * Voter Types
 *
 * These types align with the Prisma schema to ensure consistency
 * between data and production database models.
 *
 * When transitioning to real API, these types will match Prisma generated types.
 */

// Voter type matching Prisma Voter model
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
  candidateId: string;
  surveyAnswers: Record<string, string | string[]>; // JSON structure
  verifiedAt: string; // ISO datetime string
  registrationDate: string; // ISO date string
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
};
