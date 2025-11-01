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
    email: "aliyu.mohammed@example.com",
    phoneNumber: "+2348012345678",
    gender: "male",
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
    email: "hauwa.bello@example.com",
    phoneNumber: "+2348098765432",
    gender: "female",
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
    email: "musa.tukur@example.com",
    phoneNumber: "+2348055566677",
    gender: "male",
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
    email: "aisha.mohammed@example.com",
    phoneNumber: "+2348023344556",
    gender: "female",
    age: 34,
    state: "Adamawa State",
    lga: "Song",
    ward: "Song Ward 2",
    pollingUnit: "Unit 004 - Secondary School",
    candidateId: "cand-apc-4",
    // surveyAnswers: undefined, // Not collected/stored yet - will be used for dashboard analytics later
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
    email: "ibrahim.aliyu@example.com",
    phoneNumber: "+2348033445566",
    gender: "male",
    age: 37,
    state: "Adamawa State",
    lga: "Fufore",
    ward: "Fufore Ward 1",
    pollingUnit: "Unit 005 - Town Hall",
    candidateId: "cand-pdp-2",
    // surveyAnswers: undefined, // Not collected/stored yet - will be used for dashboard analytics later
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
    email: "fatima.usman@example.com",
    phoneNumber: "+2348044556677",
    gender: "female",
    age: 31,
    state: "Adamawa State",
    lga: "Yola South",
    ward: "Bamoi",
    pollingUnit: "Unit 006 - Health Centre",
    candidateId: "cand-apc-1",
    // surveyAnswers: undefined, // Not collected/stored yet - will be used for dashboard analytics later
    registrationDate: "2024-10-18",
    createdAt: "2024-10-18T11:00:00Z",
    updatedAt: "2024-10-18T11:00:00Z",
  },
];

/**
 * Helper function to get voter by NIN
 * Used by mockApi functions to ensure consistent data access
 */
export function getVoterByNIN(nin: string): Voter | undefined {
  return voters.find((voter) => voter.nin === nin);
}

/**
 * Helper function to get all voters supporting a candidate
 * Useful for dashboard aggregations
 */
export function getVotersByCandidate(candidateId: string): Voter[] {
  return voters.filter((voter) => voter.candidateId === candidateId);
}

/**
 * Analytics Helper Functions
 * These calculate real metrics from voter data for dashboard use
 * Currently minimal but will be expanded when building candidate dashboards
 */

/**
 * Get supporter count for a candidate (calculated from actual voters)
 * This replaces hardcoded supporters field in candidates
 *
 * FUTURE: When building dashboards, use this instead of hardcoded values
 */
export function getSupportersCount(candidateId: string): number {
  return getVotersByCandidate(candidateId).length;
}

/**
 * Get supporters grouped by ward
 * Useful for ward-level analytics and coverage metrics
 *
 * FUTURE: Dashboard use - ward progress charts, coverage maps
 */
export function getSupportersByWard(
  ward: string,
  candidateId?: string,
): Voter[] {
  let filtered = voters.filter((voter) => voter.ward === ward);
  if (candidateId) {
    filtered = filtered.filter((voter) => voter.candidateId === candidateId);
  }
  return filtered;
}

/**
 * Get supporters grouped by LGA
 * Useful for LGA-level analytics
 *
 * FUTURE: Dashboard use - LGA comparison charts, geographic insights
 */
export function getSupportersByLGA(lga: string, candidateId?: string): Voter[] {
  let filtered = voters.filter((voter) => voter.lga === lga);
  if (candidateId) {
    filtered = filtered.filter((voter) => voter.candidateId === candidateId);
  }
  return filtered;
}

/**
 * Get unique wards that have supporters (for a candidate or all)
 * Useful for calculating ward coverage percentage
 *
 * FUTURE: Dashboard use - "18/20 wards covered" metric calculation
 */
export function getUniqueWardsWithSupporters(candidateId?: string): string[] {
  let filtered = voters;
  if (candidateId) {
    filtered = getVotersByCandidate(candidateId);
  }
  return [...new Set(filtered.map((voter) => voter.ward))];
}

/**
 * Get unique polling units that have supporters (for a candidate or all)
 * Useful for calculating polling unit coverage
 *
 * FUTURE: Dashboard use - "420 polling units" metric calculation
 */
export function getUniquePollingUnitsWithSupporters(
  candidateId?: string,
): string[] {
  let filtered = voters;
  if (candidateId) {
    filtered = getVotersByCandidate(candidateId);
  }
  return [...new Set(filtered.map((voter) => voter.pollingUnit))];
}

/**
 * Get demographic breakdown
 * Returns age groups, gender distribution
 * Useful for demographic charts in dashboards
 *
 * FUTURE: Dashboard use - age group charts, gender pie charts, demographic insights
 */
export function getDemographics(candidateId?: string): {
  ageGroups: Record<string, number>;
  gender: Record<string, number>;
  totalCount: number;
} {
  let filtered = voters;
  if (candidateId) {
    filtered = getVotersByCandidate(candidateId);
  }

  const ageGroups: Record<string, number> = {
    "18-25": 0,
    "26-35": 0,
    "36-45": 0,
    "46-55": 0,
    "56+": 0,
  };

  const gender: Record<string, number> = {
    male: 0,
    female: 0,
    other: 0,
  };

  filtered.forEach((voter) => {
    // Age grouping
    switch (true) {
      case voter.age >= 18 && voter.age <= 25:
        ageGroups["18-25"]++;
        break;
      case voter.age >= 26 && voter.age <= 35:
        ageGroups["26-35"]++;
        break;
      case voter.age >= 36 && voter.age <= 45:
        ageGroups["36-45"]++;
        break;
      case voter.age >= 46 && voter.age <= 55:
        ageGroups["46-55"]++;
        break;
      case voter.age >= 56:
        ageGroups["56+"]++;
        break;
    }

    // Gender
    if (voter.gender) {
      gender[voter.gender] = (gender[voter.gender] || 0) + 1;
    }
  });

  return {
    ageGroups,
    gender,
    totalCount: filtered.length,
  };
}

/**
 * Get registration trends grouped by date
 * Returns count of registrations per date
 * Useful for trend charts showing registration growth
 *
 * FUTURE: Dashboard use - registration growth charts, daily/weekly trends
 */
export function getRegistrationTrends(
  candidateId?: string,
  startDate?: string,
  endDate?: string,
): Record<string, number> {
  let filtered = voters;
  if (candidateId) {
    filtered = getVotersByCandidate(candidateId);
  }

  const trends: Record<string, number> = {};

  filtered.forEach((voter) => {
    const date = voter.registrationDate; // Format: "YYYY-MM-DD"

    // Filter by date range if provided
    if (startDate && date < startDate) return;
    if (endDate && date > endDate) return;

    trends[date] = (trends[date] || 0) + 1;
  });

  return trends;
}
