/**
 * Voter API Client
 *
 * Handles all voter-related operations: NIN verification, registration checking,
 * profile retrieval, registration submission, and candidate switching.
 *
 * MOCK vs PRODUCTION:
 * - Uses NEXT_PUBLIC_USE_MOCK_API env var or NODE_ENV to switch
 * - Mock: Uses localStorage (Zustand persist) for incomplete registrations
 * - Mock: Uses static data from @/lib/mock/data/voters
 * - Production: Replace apiCall() endpoints with real backend URLs
 *
 * TRANSITION TO PRODUCTION:
 * 1. Set NEXT_PUBLIC_USE_MOCK_API=false in production
 * 2. Update apiCall() endpoints to match your backend API
 * 3. Remove mock data imports (getVoterByNIN, etc.)
 * 4. Update error handling for real API responses
 */

import type { CandidateSelection, Voter } from "@/types/voter";
import type { RegistrationData } from "@/types/registration";
import { getVoterByNIN } from "@/lib/mock/data/voters";
import { computeRegistrationStatus } from "@/lib/helpers/registration-helpers";
import type { RegistrationStep } from "@/types/voter";
import { voters } from "@/lib/mock/data/voters";

// Helper: Check localStorage for incomplete registration
function getIncompleteFromStorage(nin: string): Voter | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem("wardwise-registration");
    if (!stored) return null;

    const registrationData = JSON.parse(stored);
    const storedNIN = registrationData?.state?.payload?.nin;
    const storedStep = registrationData?.state?.step;
    const hasBasicData = !!registrationData?.state?.payload?.basic?.firstName;
    const hasLocation = !!registrationData?.state?.payload?.location?.state;

    if (storedNIN === nin && (hasBasicData || hasLocation)) {
      const payload = registrationData.state.payload;
      return {
        id: `incomplete-${nin}`,
        nin: payload.nin || nin,
        role: payload.basic?.role || "voter",
        firstName: payload.basic?.firstName || "",
        lastName: payload.basic?.lastName || "",
        middleName: payload.basic?.middleName,
        dateOfBirth: payload.basic?.dateOfBirth || "",
        email: payload.basic?.email || payload.email || "",
        phoneNumber: payload.phone || "",
        gender: payload.basic?.gender || "male",
        occupation: payload.basic?.occupation || "",
        religion: payload.basic?.religion || "",
        vin: payload.basic?.vin,
        age: payload.basic?.age || 0,
        state: payload.location?.state || "",
        lga: payload.location?.lga || "",
        ward: payload.location?.ward || "",
        pollingUnit: payload.location?.pollingUnit || "",
        canvasserCode: payload.canvasser?.canvasserCode,
        candidateSelections: payload.candidates?.selections || [],
        surveyAnswers: {},
        ninVerifiedAt: undefined, // Not verified yet (incomplete registration)
        phoneVerifiedAt: undefined,
        ninVerificationStatus: undefined,
        phoneVerificationStatus: undefined,
        registrationDate: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // registrationStatus is computed from lastCompletedStep
        lastCompletedStep: (storedStep as RegistrationStep) || "nin",
        surveyCompleted: false,
      };
    }
  } catch (error) {
    console.warn("Failed to check registration store:", error);
  }

  return null;
}

// Helper: Generate deterministic data for new NINs using actual voters array
// Uses voters array for realistic data generation
// Supports both voters (18+) and supporters (any age) scenarios
function generateNINData(nin: string) {
  const hash = nin.split("").reduce((acc, char) => acc + parseInt(char, 10), 0);

  // Pick a voter from the array deterministically
  const voterIndex = hash % voters.length;
  const baseVoter = voters[voterIndex];

  // Generate age deterministically - mix of voters (18+) and supporters (any age)
  const currentYear = new Date().getFullYear();
  const isVoterScenario = hash % 3 === 0; // 33% chance of voter scenario
  const age = isVoterScenario
    ? 18 + ((hash * 5) % 63) // Voter: 18-80 years old
    : 8 + ((hash * 7) % 78); // Supporter: 8-85 years old (includes under 18)

  const year = currentYear - age;
  const month = ((hash * 3) % 12) + 1;
  const day = ((hash * 5) % 28) + 1;

  return {
    firstName: baseVoter.firstName,
    lastName: baseVoter.lastName,
    dateOfBirth: `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
    state: baseVoter.state,
    lga: baseVoter.lga,
  };
}

// Simple helper for API calls (for real API)
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `API error: ${response.statusText}`);
  }

  return response.json();
}

// Mock mode: true if explicitly set, or default to mock in development
// Production mode: false if explicitly set, or default in production
const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK_API === "true" ||
  (!process.env.NEXT_PUBLIC_USE_MOCK_API &&
    process.env.NODE_ENV === "development");

export const voterApi = {
  /**
   * Verify NIN (National Identification Number)
   *
   * MOCK: First checks existing voters, then generates deterministic data for new NINs
   * PRODUCTION: Calls SmileID or NIMC API for real verification
   *
   * @param nin - 11-digit NIN string
   * @returns Verification result with user data if verified
   */
  verifyNIN: async (
    nin: string,
  ): Promise<{
    verified: boolean;
    message: string;
    data?: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      state: string;
      lga: string;
    };
  }> => {
    if (USE_MOCK) {
      // MOCK: Check existing voters first, then generate deterministic data
      console.log(`🆔 Mock: Verifying NIN ${nin}`);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const existingVoter = getVoterByNIN(nin);
      if (existingVoter) {
        return {
          verified: true,
          message: "NIN verified successfully",
          data: {
            firstName: existingVoter.firstName,
            lastName: existingVoter.lastName,
            dateOfBirth: existingVoter.dateOfBirth,
            state: existingVoter.state,
            lga: existingVoter.lga,
          },
        };
      }

      if (nin.length === 11 && /^\d{11}$/.test(nin)) {
        const data = generateNINData(nin);
        return {
          verified: true,
          message: "NIN verified successfully",
          data,
        };
      }

      return { verified: false, message: "Invalid NIN format" };
    }

    // Real API call
    return apiCall("/register/verify-nin", {
      method: "POST",
      body: JSON.stringify({ nin }),
    });
  },

  /**
   * Check if a voter is already registered
   *
   * MOCK: Checks both mock voters array AND localStorage (Zustand persist) for incomplete registrations
   * PRODUCTION: Queries database via API
   *
   * @param nin - 11-digit NIN string
   * @param year - Election year
   * @returns Registration status: "new" | "complete" | "incomplete"
   */
  checkRegistration: async (
    nin: string,
    year: number,
  ): Promise<{
    exists: boolean;
    status?: "new" | "complete" | "incomplete";
    voter?: Voter;
    lastStep?: string;
  }> => {
    if (USE_MOCK) {
      // MOCK: Check mock voters array first
      console.log(`🔍 Mock: Checking registration for NIN ${nin}`);
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const voter = getVoterByNIN(nin);
      if (voter) {
        return {
          exists: true,
          status: computeRegistrationStatus(voter.lastCompletedStep),
          voter,
          lastStep: voter.lastCompletedStep,
        };
      }

      const incompleteVoter = getIncompleteFromStorage(nin);
      if (incompleteVoter) {
        return {
          exists: true,
          status: "incomplete",
          voter: incompleteVoter,
          lastStep: incompleteVoter.lastCompletedStep || "nin",
        };
      }

      return { exists: false, status: "new" };
    }

    // Real API call
    return apiCall("/register/check", {
      method: "POST",
      body: JSON.stringify({ nin, year }),
    });
  },

  /**
   * Get voter profile by NIN
   *
   * MOCK: Returns voter from static data
   * PRODUCTION: Fetches from database via API
   *
   * @param nin - 11-digit NIN string
   * @returns Voter profile or null
   */
  getUserProfile: async (nin: string): Promise<{ voter: Voter | null }> => {
    if (USE_MOCK) {
      // MOCK: Get from static data
      console.log(`👤 Mock: Getting profile for NIN ${nin}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const voter = getVoterByNIN(nin);
      return { voter: voter || null };
    }

    // Real API call
    return apiCall(`/voters/nin/${nin}`);
  },

  /**
   * Submit completed registration
   *
   * MOCK: Generates mock registration ID, simulates delay
   * PRODUCTION: Saves to database, returns real registration ID
   *
   * @param data - Complete registration payload (accepts Partial for flexibility)
   * @returns Success status and registration ID
   */
  submitRegistration: async (
    data: Partial<RegistrationData> | RegistrationData,
  ): Promise<{ success: boolean; registrationId: string }> => {
    if (USE_MOCK) {
      // MOCK: EXACT COPY from mockApi.ts - generates mock ID
      console.log(`📝 Mock: Submitting registration`, data);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const registrationId = `REG-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      return { success: true, registrationId };
    }

    // PRODUCTION: Replace with real API call
    return apiCall("/register/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Switch voter's candidate support
   *
   * MOCK: Updates in-memory voter data
   * PRODUCTION: Updates database record
   *
   * @param nin - 11-digit NIN string
   * @param candidateSelections - New candidate selections to support
   * @returns Success status
   */
  switchCandidate: async (
    nin: string,
    candidateSelections: CandidateSelection[],
  ): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
      // MOCK: Update in-memory data
      // TODO: Implement and change to multiple candidates now supported check if it's good?
      console.log(`🔄 Mock: Switching candidate`, candidateSelections);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const voter = getVoterByNIN(nin);
      if (voter) {
        voter.candidateSelections = candidateSelections;
        voter.updatedAt = new Date().toISOString();
        return { success: true };
      }
      return { success: false };
    }

    // Real API call
    return apiCall<{ success: boolean }>("/register/switch-candidate", {
      method: "POST",
      body: JSON.stringify({ nin, candidateSelections }),
    }) as Promise<{ success: boolean }>;
  },
};
