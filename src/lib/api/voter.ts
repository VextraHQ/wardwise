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

import type { Voter } from "@/types/voter";
import type { RegistrationData } from "@/types/registration";
import { getVoterByNIN } from "@/lib/mock/data/voters";
import { computeRegistrationStatus } from "@/lib/helpers/registration-helpers";
import type { RegistrationStep } from "@/types/voter";

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
        firstName: payload.basic?.firstName || "",
        lastName: payload.basic?.lastName || "",
        middleName: payload.basic?.middleName,
        dateOfBirth: payload.basic?.dateOfBirth || "",
        email: payload.email,
        phoneNumber: payload.phone || "",
        gender: payload.basic?.gender || "male",
        occupation: payload.basic?.occupation || "",
        religion: payload.basic?.religion || "",
        age: payload.basic?.age || 0,
        state: payload.location?.state || "",
        lga: payload.location?.lga || "",
        ward: payload.location?.ward || "",
        pollingUnit: payload.location?.pollingUnit || "",
        candidateId: payload.candidate?.candidateId,
        surveyAnswers: payload.survey?.answers || {},
        verifiedAt: new Date().toISOString(),
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

// Helper: Generate deterministic data for new NINs
// EXACT COPY from mockApi.ts - DO NOT MODIFY
function generateNINData(nin: string) {
  const hash = nin.split("").reduce((acc, char) => acc + parseInt(char, 10), 0);

  const names = [
    { firstName: "Aisha", lastName: "Mohammed" },
    { firstName: "Ibrahim", lastName: "Aliyu" },
    { firstName: "Fatima", lastName: "Usman" },
    { firstName: "Musa", lastName: "Ahmad" },
    { firstName: "Zainab", lastName: "Hassan" },
    { firstName: "Yusuf", lastName: "Ibrahim" },
    { firstName: "Amina", lastName: "Suleiman" },
    { firstName: "Mohammed", lastName: "Yakubu" },
    { firstName: "Hauwa", lastName: "Bello" },
    { firstName: "Aliyu", lastName: "Wakili" },
    { firstName: "Maryam", lastName: "Tukur" },
    { firstName: "Ahmadu", lastName: "Fintiri" },
    { firstName: "Halima", lastName: "Jibrilla" },
    { firstName: "Umar", lastName: "Bindow" },
    { firstName: "Hadiza", lastName: "Shehu" },
    { firstName: "Sani", lastName: "Ibrahim" },
  ];

  const states = [
    {
      state: "Adamawa State",
      lgas: [
        "Song",
        "Fufore",
        "Yola North",
        "Yola South",
        "Mubi North",
        "Mubi South",
        "Ganye",
        "Toungo",
        "Mayo Belwa",
        "Jimeta",
        "Numan",
        "Demsa",
        "Girei",
        "Hong",
        "Michika",
        "Maiha",
        "Shelleng",
        "Lamurde",
        "Guyuk",
        "Madagali",
      ],
    },
    {
      state: "Lagos State",
      lgas: [
        "Ikeja",
        "Eti-Osa",
        "Surulere",
        "Mushin",
        "Oshodi-Isolo",
        "Kosofe",
      ],
    },
    {
      state: "Kano State",
      lgas: [
        "Kano Municipal",
        "Nassarawa",
        "Gwale",
        "Tarauni",
        "Dala",
        "Fagge",
      ],
    },
  ];

  const nameIndex = hash % names.length;
  const stateIndex = (hash * 7) % states.length;
  const selectedState = states[stateIndex];
  const lgaIndex = (hash * 13) % selectedState.lgas.length;
  const yearOffset = hash % 20; // Ages 25-44 (realistic voting age range)
  const monthOffset = (hash * 3) % 12;
  const dayOffset = (hash * 5) % 28;

  const selectedName = names[nameIndex];
  const year = 1980 + yearOffset;
  const month = monthOffset + 1;
  const day = dayOffset + 1;

  return {
    firstName: selectedName.firstName,
    lastName: selectedName.lastName,
    dateOfBirth: `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
    state: selectedState.state,
    lga: selectedState.lgas[lgaIndex],
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

// Use mock if NEXT_PUBLIC_USE_MOCK_API is true, or in development
const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK_API === "true" ||
  process.env.NODE_ENV === "development";

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
   * @param data - Complete registration payload
   * @returns Success status and registration ID
   */
  submitRegistration: async (
    data: RegistrationData,
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
   * @param candidateId - New candidate ID to support
   * @returns Success status
   */
  switchCandidate: async (
    nin: string,
    candidateId: string,
  ): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
      // MOCK: Update in-memory data
      console.log(`🔄 Mock: Switching candidate`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const voter = getVoterByNIN(nin);
      if (voter) {
        voter.candidateId = candidateId;
        voter.updatedAt = new Date().toISOString();
      }
      return { success: !!voter };
    }

    // Real API call
    return apiCall("/register/switch-candidate", {
      method: "POST",
      body: JSON.stringify({ nin, candidateId }),
    });
  },
};
