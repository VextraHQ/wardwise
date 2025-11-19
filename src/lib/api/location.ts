/**
 * Location API Client
 *
 * Handles all location-related data: states, LGAs, wards, polling units.
 * Also includes enhanced NIN verification with location codes.
 *
 * MOCK vs PRODUCTION:
 * - Mock: Uses static data from @/lib/data/state-lga-locations, wards, polling-units
 * - Production: Replace with real API endpoints for location data
 *
 * TRANSITION TO PRODUCTION:
 * 1. Update apiCall() endpoints to match your backend
 * 2. Remove static data imports
 * 3. Update verifyNINWithLocation to use real SmileID/NIMC API
 */

import {
  nigeriaStates,
  nigeriaLGAs,
  getStateByCode,
  getLGAsByState,
} from "@/lib/data/state-lga-locations";
import { getWardsByLGA } from "@/lib/data/wards";
import { getPollingUnitsByWard } from "@/lib/data/polling-units";
import type {
  LocationState,
  LocationLGA,
  LocationWard,
  LocationPollingUnit,
} from "@/types/location";

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

export const locationApi = {
  /**
   * Get all Nigerian states
   * MOCK: Returns from static data | PRODUCTION: API call
   */
  getStates: async (): Promise<{ states: LocationState[] }> => {
    if (USE_MOCK) {
      // MOCK: Returns states from static data
      console.log("🌍 Mock: Getting all states");
      await new Promise((resolve) => setTimeout(resolve, 300));
      const states = nigeriaStates.map((state) => ({
        code: state.code,
        name: state.name,
      })) as LocationState[];
      return { states };
    }

    // PRODUCTION: Replace with real API call
    return apiCall("/register/locations?level=state");
  },

  /**
   * Get LGAs by state code
   * MOCK: Returns from static data | PRODUCTION: API call
   */
  getLGAsByState: async (
    stateCode: string,
  ): Promise<{ lgas: LocationLGA[] }> => {
    if (USE_MOCK) {
      // MOCK: Returns LGAs from static data filtered by state
      console.log(`🏛️ Mock: Getting LGAs for state ${stateCode}`);
      await new Promise((resolve) => setTimeout(resolve, 400));
      const lgas = nigeriaLGAs.filter(
        (lga) => lga.stateCode === stateCode,
      ) as LocationLGA[];
      return { lgas };
    }

    // PRODUCTION: Replace with real API call
    return apiCall(`/register/locations?level=lga&parent=${stateCode}`);
  },

  /**
   * Get wards by LGA code
   * MOCK: Returns from static data | PRODUCTION: API call
   */
  getWardsByLGA: async (
    lgaCode: string,
  ): Promise<{ wards: LocationWard[] }> => {
    if (USE_MOCK) {
      // MOCK: Returns wards from static data filtered by LGA
      console.log(`🏘️ Mock: Getting wards for LGA ${lgaCode}`);
      await new Promise((resolve) => setTimeout(resolve, 400));
      const wards = getWardsByLGA(lgaCode);
      return { wards };
    }

    // PRODUCTION: Replace with real API call
    return apiCall(`/register/locations?level=ward&parent=${lgaCode}`);
  },

  /**
   * Get polling units by ward code
   * MOCK: Returns from static data | PRODUCTION: API call
   */
  getPollingUnitsByWard: async (
    wardCode: string,
  ): Promise<{ pollingUnits: LocationPollingUnit[] }> => {
    if (USE_MOCK) {
      // MOCK: Returns polling units from static data filtered by ward
      console.log(`🗳️ Mock: Getting polling units for ward ${wardCode}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const pollingUnits = getPollingUnitsByWard(wardCode);
      return { pollingUnits };
    }

    // PRODUCTION: Replace with real API call
    return apiCall(`/register/locations?level=pu&parent=${wardCode}`);
  },

  /**
   * Enhanced NIN verification with location codes (state/LGA)
   * MOCK: Generates random location data | PRODUCTION: SmileID/NIMC API
   */
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
    if (USE_MOCK) {
      // MOCK: Enhanced NIN verification with location codes for pre-population
      console.log(`🆔 Mock: Verifying NIN ${nin} with location data`);
      await new Promise((resolve) => setTimeout(resolve, 1500));

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

        // Weighted towards Adamawa for demo
        const stateOptions = [
          { weight: 40, stateCode: "AD" },
          { weight: 20, stateCode: "LA" },
          { weight: 15, stateCode: "KN" },
          { weight: 10, stateCode: "RI" },
          { weight: 5, stateCode: "AB" },
          { weight: 5, stateCode: "FC" },
          { weight: 5, stateCode: "KD" },
        ];

        const random = Math.random() * 100;
        let cumulative = 0;
        const selectedStateCode =
          stateOptions.find((state) => {
            cumulative += state.weight;
            return random <= cumulative;
          })?.stateCode || "AD";

        const selectedState = getStateByCode(selectedStateCode);
        const availableLGAs = getLGAsByState(selectedStateCode);

        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomLGA =
          availableLGAs[Math.floor(Math.random() * availableLGAs.length)];
        const randomYear = 1985 + Math.floor(Math.random() * 20);
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
    }

    // PRODUCTION: Replace with real API call (e.g., SmileID integration)
    return apiCall("/register/verify-nin", {
      method: "POST",
      body: JSON.stringify({ nin }),
    });
  },
};
