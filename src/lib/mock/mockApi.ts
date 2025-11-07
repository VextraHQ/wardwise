/**
 * Mock API - API Simulation Layer
 *
 * This file contains ONLY API mocking logic (delays, error handling).
 * All data comes from centralized data files - single source of truth.
 *
 * When transitioning to real API, replace these functions with actual API calls.
 */

import {
  nigeriaStates,
  nigeriaLGAs,
  getStateByCode,
  getLGAsByState,
} from "@/lib/data/state-lga-locations";
import { getWardsByLGA } from "@/lib/data/wards";
import { getPollingUnitsByWard } from "@/lib/data/polling-units";

// Import types from centralized types folder
import type {
  Voter,
  Candidate,
  CandidateSurvey,
  RegistrationData,
  LocationState,
  LocationLGA,
  LocationWard,
  LocationPollingUnit,
} from "@/types";

// Import data from centralized data files (single source of truth)
import { getVoterByNIN } from "@/lib/mock/data/voters";
import { candidates } from "@/lib/mock/data/candidates";
import { getSurveyByCandidateId } from "@/lib/mock/data/candidate-surveys";
import { getCandidateById } from "@/lib/helpers/candidate-helpers";

// Mock API functions
export const mockApi = {
  // Verify NIN with mock API
  // IMPORTANT: First checks existing voters, then generates random data for new NINs
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
    console.log(`🆔 Mock: Verifying NIN ${nin}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // FIRST: Check if this NIN exists in our voter database
    // This ensures data consistency - existing users get their actual data
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

    // SECOND: If NIN doesn't exist, validate format and generate deterministic data
    // Uses NIN hash for consistent results - same NIN always returns same data
    // This ensures reliable demo experience while simulating NIMC verification
    if (nin.length === 11 && /^\d{11}$/.test(nin)) {
      // Simple hash function to convert NIN to a consistent number
      // This ensures the same NIN always produces the same data
      const hash = nin
        .split("")
        .reduce((acc, char) => acc + parseInt(char, 10), 0);

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

      // Use hash for deterministic selection (same NIN = same choices)
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
        verified: true,
        message: "NIN verified successfully",
        data: {
          firstName: selectedName.firstName,
          lastName: selectedName.lastName,
          dateOfBirth: `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
          state: selectedState.state,
          lga: selectedState.lgas[lgaIndex],
        },
      };
    }

    return {
      verified: false,
      message: "Invalid NIN format",
    };
  },

  // Check if voter already exists by NIN
  checkRegistration: async (
    nin: string,
    year: number,
  ): Promise<{ exists: boolean; voter?: Voter }> => {
    console.log(`🔍 Mock: Checking registration for NIN ${nin} in ${year}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Use helper function from data file (single source of truth)
    const voter = getVoterByNIN(nin);

    if (voter) {
      return {
        exists: true,
        voter,
      };
    }

    return {
      exists: false,
    };
  },

  // Get voter profile by NIN
  getUserProfile: async (nin: string): Promise<{ voter: Voter | null }> => {
    console.log(`👤 Mock: Getting profile for NIN ${nin}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Use helper function from data file (single source of truth)
    const voter = getVoterByNIN(nin);

    return {
      voter: voter || null,
    };
  },

  // Get candidates filtered by location (state, LGA)
  getCandidates: async (
    state?: string,
    lga?: string,
  ): Promise<{ candidates: Candidate[] }> => {
    console.log(`🗳️ Mock: Getting candidates for ${state || "all states"}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    let filtered = candidates;

    // Filter by state if provided
    if (state) {
      filtered = filtered.filter((candidate) => candidate.state === state);
    }

    // For House of Representatives, filter by LGA/constituency if provided
    if (lga && state) {
      filtered = filtered.filter((candidate) => {
        // Governors and Senators match the state
        if (
          candidate.position === "Governor" ||
          candidate.position === "Senator"
        ) {
          return candidate.state === state;
        }

        // House of Representatives: match if constituency contains the LGA
        if (candidate.position === "House of Representatives") {
          // Normalize by converting to lowercase and replacing spaces/hyphens with a common delimiter
          const normalize = (str: string) =>
            str.toLowerCase().replace(/[\s-]/g, "-");
          const constituencyNormalized = normalize(candidate.constituency);
          const lgaNormalized = normalize(lga);

          // Check if constituency contains the LGA name
          // Example: "Fufore/Song Federal Constituency" matches "Fufore" or "Song"
          // Also handles "Mayo Belwa" (space) matching "Mayo-Belwa" (hyphen)
          return (
            constituencyNormalized.includes(lgaNormalized) ||
            lgaNormalized.includes(constituencyNormalized.split("/")[0] || "")
          );
        }

        return true;
      });
    }

    return {
      candidates: filtered,
    };
  },

  // Get candidate by ID
  getCandidateById: async (
    candidateId: string,
  ): Promise<{ candidate: Candidate | null }> => {
    console.log(`👤 Mock: Getting candidate ${candidateId}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Use helper function from helpers (single source of truth)
    const candidate = getCandidateById(candidateId);

    return {
      candidate: candidate || null,
    };
  },

  // Get candidate survey by candidate ID
  getCandidateSurvey: async (
    candidateId: string,
  ): Promise<{ survey: CandidateSurvey | null }> => {
    console.log(`📋 Mock: Getting survey for candidate ${candidateId}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Use helper function from data file (single source of truth)
    const survey = getSurveyByCandidateId(candidateId);

    return {
      survey: survey || null,
    };
  },

  // Submit registration
  submitRegistration: async (
    data: RegistrationData,
  ): Promise<{ success: boolean; registrationId: string }> => {
    console.log(`📝 Mock: Submitting registration`, data);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate a mock registration ID
    const registrationId = `REG-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    return {
      success: true,
      registrationId,
    };
  },

  // Switch candidate support
  switchCandidate: async (
    nin: string,
    newCandidateId: string,
  ): Promise<{ success: boolean }> => {
    console.log(
      `🔄 Mock: Switching candidate for NIN ${nin} to ${newCandidateId}`,
    );

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find and update voter in mock data (single source of truth)
    const voter = getVoterByNIN(nin);
    if (voter) {
      // In a real implementation, this would update the database
      // For mock, we update the in-memory data
      voter.candidateId = newCandidateId;
      voter.updatedAt = new Date().toISOString();
    }

    return {
      success: !!voter,
    };
  },

  // Location API endpoints for optimized data fetching
  getStates: async (): Promise<{ states: LocationState[] }> => {
    console.log("🌍 Mock: Getting all states");

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Use data from nigeria-locations.ts (no redundancy)
    const states = nigeriaStates.map((state) => ({
      code: state.code,
      name: state.name,
    })) as LocationState[];

    return { states };
  },

  getLGAsByState: async (
    stateCode: string,
  ): Promise<{ lgas: LocationLGA[] }> => {
    console.log(`🏛️ Mock: Getting LGAs for state ${stateCode}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Use data from nigeria-locations.ts (no redundancy)
    const lgas = nigeriaLGAs.filter(
      (lga) => lga.stateCode === stateCode,
    ) as LocationLGA[];

    return { lgas };
  },

  getWardsByLGA: async (
    lgaCode: string,
  ): Promise<{ wards: LocationWard[] }> => {
    console.log(`🏘️ Mock: Getting wards for LGA ${lgaCode}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Use data from wards.ts (single source of truth)
    const wards = getWardsByLGA(lgaCode);

    return { wards };
  },

  getPollingUnitsByWard: async (
    wardCode: string,
  ): Promise<{ pollingUnits: LocationPollingUnit[] }> => {
    console.log(`🗳️ Mock: Getting polling units for ward ${wardCode}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Use data from polling-units.ts (single source of truth)
    const pollingUnits = getPollingUnitsByWard(wardCode);

    return { pollingUnits };
  },

  // Enhanced NIN verification that includes state/LGA codes for pre-population
  verifyNINWithLocation: async (
    nin: string,
  ): Promise<{
    verified: boolean;
    message: string;
    data?: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      stateCode: string;
      stateName: string;
      lgaCode: string;
      lgaName: string;
    };
  }> => {
    console.log(`🆔 Mock: Verifying NIN ${nin} with location data`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Verify NIN - accept any 11-digit NIN for demo
    if (nin.length === 11 && /^\d{11}$/.test(nin)) {
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
      ];

      // Weighted towards Adamawa for demo, but includes other major states
      const stateOptions = [
        { weight: 40, stateCode: "AD" }, // Adamawa - demo focus
        { weight: 20, stateCode: "LA" }, // Lagos - most populous
        { weight: 15, stateCode: "KN" }, // Kano - northern major state
        { weight: 10, stateCode: "RI" }, // Rivers - south south
        { weight: 5, stateCode: "AB" }, // Abia - south east
        { weight: 5, stateCode: "FC" }, // FCT - capital
        { weight: 5, stateCode: "KD" }, // Kaduna - north central
      ];

      // Select state based on weight
      const random = Math.random() * 100;
      let cumulative = 0;
      const selectedStateCode =
        stateOptions.find((state) => {
          cumulative += state.weight;
          return random <= cumulative;
        })?.stateCode || "AD";

      // Get state and LGA data
      const selectedState = getStateByCode(selectedStateCode);
      const availableLGAs = getLGAsByState(selectedStateCode);

      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomLGA =
        availableLGAs[Math.floor(Math.random() * availableLGAs.length)];
      const randomYear = 1985 + Math.floor(Math.random() * 20); // Ages 18-38
      const randomMonth = Math.floor(Math.random() * 12) + 1;
      const randomDay = Math.floor(Math.random() * 28) + 1;

      return {
        verified: true,
        message: "NIN verified successfully",
        data: {
          firstName: randomName.firstName,
          lastName: randomName.lastName,
          dateOfBirth: `${randomYear}-${randomMonth.toString().padStart(2, "0")}-${randomDay.toString().padStart(2, "0")}`,
          stateCode: selectedState?.code || "AD",
          stateName: selectedState?.name || "Adamawa State",
          lgaCode: randomLGA.code,
          lgaName: randomLGA.name,
        },
      };
    }

    return {
      verified: false,
      message: "Invalid NIN format",
    };
  },
};
