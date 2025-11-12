/**
 * Mock Voter Data
 *
 * Single source of truth for all mock voter data.
 * This data aligns with Prisma Voter model structure.
 *
 * DEMO NINs for Testing (Login & Registration):
 * - "12345678901" - Aliyu Mohammed (registered, can login, has survey answers for dashboard demo)
 * - "98765432109" - Hauwa Bello (registered, can login, has survey answers for dashboard demo)
 * - "11223344556" - Musa Ahmad Tukur (registered, can login, partial survey answers)
 * - "22334455667" - Aisha Mohammed (new registration demo, no survey answers yet)
 * - "33445566778" - Ibrahim Aliyu (new registration demo, no survey answers yet)
 * - "44556677889" - Fatima Usman (new registration demo, no survey answers yet)
 *
 * NOTE on surveyAnswers:
 * - Currently optional (not actively displayed/stored in mock)
 * - Included in Prisma schema for future dashboard analytics
 * - Keep only for registered users that demonstrate full profiles
 * - Will be used when building candidate dashboards to show survey response analytics
 *
 * NOTE on registrationDate, createdAt, updatedAt, verifiedAt:
 * - These timestamps are collected but not currently analyzed
 * - Will be used for registration trend charts (daily/weekly/monthly growth)
 * - Useful for tracking campaign progress over time
 * - Example: "Registrations this week: +125"
 *
 * NOTE on age, gender, location fields:
 * - Collected during registration but not aggregated
 * - Will be used for demographic breakdowns in dashboards
 * - Age groups: 18-25, 26-35, 36-45, 46-55, 56+
 * - Gender distribution: male/female/other pie charts
 * - Geographic heat maps: support by LGA/ward
 *
 * For any other 11-digit NIN:
 * - Data is generated deterministically (same NIN = same data)
 * - This ensures consistent demo experience
 * - First checks this list, then falls back to deterministic generation
 */

import type { Voter } from "@/types";

export const voters: Voter[] = [
  {
    id: "voter-1",
    nin: "12345678901",
    firstName: "Aliyu",
    middleName: undefined,
    lastName: "Mohammed",
    dateOfBirth: "1996-03-15",
    email: "aliyumohammed96@gmail.com",
    phoneNumber: "+2348034567890",
    gender: "male",
    occupation: "farmer",
    religion: "islam",
    age: 28,
    state: "Adamawa State",
    lga: "Song",
    ward: "Song Ward 1",
    pollingUnit: "Unit 001 - Community Centre",
    candidateId: "cand-apc-4", // Supporting Hon. Aliyu Wakili Boya
    surveyAnswers: {
      q1: "opt-good",
      q2: ["opt-roads", "opt-electricity"],
      q3: "4",
      q4: "opt-farming",
      q5: "We need better road access to our farms and improved electricity supply for our businesses.",
    },
    verifiedAt: "2024-10-15T10:30:00Z",
    registrationDate: "2024-10-15",
    createdAt: "2024-10-15T10:00:00Z",
    updatedAt: "2024-10-15T10:30:00Z",
  },
  {
    id: "voter-2",
    nin: "98765432109",
    firstName: "Hauwa",
    middleName: undefined,
    lastName: "Bello",
    dateOfBirth: "1992-07-22",
    email: "hauwa.bello92@yahoo.com",
    phoneNumber: "+2347067890123",
    gender: "female",
    occupation: "teacher",
    religion: "islam",
    age: 32,
    state: "Adamawa State",
    lga: "Fufore",
    ward: "Malabu Ward",
    pollingUnit: "Unit 002 - Malabu Primary School",
    candidateId: "cand-apc-4", // Supporting Hon. Aliyu Wakili Boya
    surveyAnswers: {
      q1: "opt-fair",
      q2: ["opt-schools", "opt-healthcare"],
      q3: "3",
      q4: "opt-government",
      q5: "Better educational facilities and healthcare access would transform our community.",
    },
    verifiedAt: "2024-10-14T14:20:00Z",
    registrationDate: "2024-10-14",
    createdAt: "2024-10-14T14:00:00Z",
    updatedAt: "2024-10-14T14:20:00Z",
  },
  {
    id: "voter-3",
    nin: "11223344556",
    firstName: "Musa",
    middleName: "Ahmad",
    lastName: "Tukur",
    dateOfBirth: "1988-11-05",
    email: "musaahmad88@outlook.com",
    phoneNumber: "+2348123456789",
    gender: "male",
    occupation: "civil-servant",
    religion: "islam",
    age: 36,
    state: "Adamawa State",
    lga: "Yola North",
    ward: "Jambutu",
    pollingUnit: "Unit 003 - Jambutu Primary School",
    candidateId: "cand-apc-1", // Supporting Dr. Ahmadu Umaru Fintiri
    surveyAnswers: {
      q1: "opt-insecurity",
      q2: ["opt-security-ops", "opt-infrastructure"],
    },
    verifiedAt: "2024-10-13T09:15:00Z",
    registrationDate: "2024-10-13",
    createdAt: "2024-10-13T09:15:00Z",
    updatedAt: "2024-10-13T09:15:00Z",
  },
  {
    id: "voter-4",
    nin: "22334455667",
    firstName: "Aisha",
    lastName: "Mohammed",
    dateOfBirth: "1990-05-12",
    email: "aishamohammed90@gmail.com",
    phoneNumber: "+2348156789012",
    gender: "female",
    occupation: "trader",
    religion: "islam",
    age: 34,
    state: "Adamawa State",
    lga: "Song",
    ward: "Song Ward 2",
    pollingUnit: "Unit 004 - Secondary School",
    candidateId: "cand-apc-4",
    surveyAnswers: {},
    verifiedAt: "2024-10-16T09:00:00Z",
    registrationDate: "2024-10-16",
    createdAt: "2024-10-16T09:00:00Z",
    updatedAt: "2024-10-16T09:00:00Z",
  },
  {
    id: "voter-5",
    nin: "33445566778",
    firstName: "Ibrahim",
    lastName: "Aliyu",
    dateOfBirth: "1987-08-20",
    email: "ibrahim.aliyu87@yahoo.com",
    phoneNumber: "+2349087654321",
    gender: "male",
    occupation: "private-sector",
    religion: "islam",
    age: 37,
    state: "Adamawa State",
    lga: "Fufore",
    ward: "Fufore Ward 1",
    pollingUnit: "Unit 005 - Town Hall",
    candidateId: "cand-pdp-2",
    surveyAnswers: {},
    verifiedAt: "2024-10-17T10:00:00Z",
    registrationDate: "2024-10-17",
    createdAt: "2024-10-17T10:00:00Z",
    updatedAt: "2024-10-17T10:00:00Z",
  },
  {
    id: "voter-6",
    nin: "44556677889",
    firstName: "Fatima",
    lastName: "Usman",
    dateOfBirth: "1993-11-03",
    email: "fatimausman93@gmail.com",
    phoneNumber: "+2347012345678",
    gender: "female",
    occupation: "healthcare-worker",
    religion: "christianity",
    age: 31,
    state: "Adamawa State",
    lga: "Yola South",
    ward: "Bamoi",
    pollingUnit: "Unit 006 - Health Centre",
    candidateId: "cand-apc-1",
    surveyAnswers: {},
    verifiedAt: "2024-10-18T11:00:00Z",
    registrationDate: "2024-10-18",
    createdAt: "2024-10-18T11:00:00Z",
    updatedAt: "2024-10-18T11:00:00Z",
  },
];

// Helper function to get voter by NIN - Used by mockApi functions to ensure consistent data access
export function getVoterByNIN(nin: string): Voter | undefined {
  return voters.find((voter) => voter.nin === nin);
}

// Helper function to get all voters supporting a candidate - Useful for dashboard aggregations
export function getVotersByCandidate(candidateId: string): Voter[] {
  return voters.filter((voter) => voter.candidateId === candidateId);
}
