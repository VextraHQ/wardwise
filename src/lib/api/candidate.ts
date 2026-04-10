/**
 * Candidate API Client
 *
 * Handles candidate data retrieval and filtering by location.
 *
 * MOCK vs PRODUCTION:
 * - Mock: Uses static data from @/lib/mock/data/candidates
 * - Mock: Filters candidates by state/LGA with complex matching logic
 * - Production: Replace with real API endpoints
 *
 * TRANSITION TO PRODUCTION:
 * 1. Update apiCall() endpoints to match your backend
 * 2. Remove static data imports
 * 3. Backend should handle location-based filtering
 */

import type { Candidate } from "@/types/candidate";
import { candidates } from "@/lib/mock/data/candidates";
import { getCandidateByIdWithSupporters } from "@/lib/candidate/directory";

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

export const candidateApi = {
  getCandidates: async (
    state?: string,
    lga?: string,
  ): Promise<{ candidates: Candidate[] }> => {
    if (USE_MOCK) {
      // MOCK: Returns candidates filtered by location
      console.log(`🗳️ Mock: Getting candidates for ${state || "all states"}`);
      await new Promise((resolve) => setTimeout(resolve, 800));

      let filtered = candidates;

      if (state) {
        // Presidential candidates (state = null) should always be included
        // State/LGA candidates should be filtered by location
        filtered = filtered.filter((candidate) => {
          // Include Presidential candidates (isNational = true, state = null)
          if (
            candidate.position === "President" &&
            candidate.stateCode === null
          ) {
            return true;
          }
          // Include candidates matching the state
          return candidate.stateCode === state;
        });
      }

      // For House of Representatives and State Assembly, filter by LGA/constituency if provided
      if (lga && state) {
        filtered = filtered.filter((candidate) => {
          // Presidential candidates always included
          if (candidate.position === "President") {
            return true;
          }

          // Governors and Senators match the state
          if (
            candidate.position === "Governor" ||
            candidate.position === "Senator"
          ) {
            return candidate.stateCode === state;
          }

          // House of Representatives: match if constituency contains the LGA
          if (candidate.position === "House of Representatives") {
            // Skip if constituency is null
            if (!candidate.constituency) {
              return false;
            }
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

          // State Assembly: match if constituency contains the LGA or ward
          // State Assembly constituencies are typically based on LGAs or combinations of wards
          if (candidate.position === "State Assembly") {
            // Skip if constituency is null
            if (!candidate.constituency) {
              return false;
            }
            const normalize = (str: string) =>
              str.toLowerCase().replace(/[\s-]/g, "-");
            const constituencyNormalized = normalize(candidate.constituency);
            const lgaNormalized = normalize(lga);

            // Check if constituency contains the LGA name
            // Example: "Song State Constituency" matches "Song" LGA
            return (
              constituencyNormalized.includes(lgaNormalized) ||
              lgaNormalized.includes(constituencyNormalized.split(" ")[0] || "")
            );
          }

          return true;
        });
      }

      return { candidates: filtered };
    }

    // PRODUCTION: Replace with real API call
    return apiCall(
      `/register/candidates?${state ? `state=${state}` : ""}${lga ? `&lga=${lga}` : ""}`,
    );
  },

  getCandidateById: async (
    candidateId: string,
  ): Promise<{ candidate: Candidate | null }> => {
    if (USE_MOCK) {
      // MOCK: Returns candidate with dynamically calculated supporters
      console.log(`👤 Mock: Getting candidate ${candidateId}`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      const candidate = getCandidateByIdWithSupporters(candidateId);
      return { candidate: candidate || null };
    }

    // PRODUCTION: Replace with real API call
    return apiCall(`/candidates/${candidateId}`);
  },

  /**
   * Get multiple candidates by their IDs (for multi-candidate support)
   * Used to fetch all 5 selected candidates at once
   */
  getCandidatesByIds: async (
    candidateIds: string[],
  ): Promise<{ candidates: Candidate[] }> => {
    if (USE_MOCK) {
      // MOCK: Returns multiple candidates with dynamically calculated supporters
      console.log(`👥 Mock: Getting ${candidateIds.length} candidates`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const fetchedCandidates = candidateIds
        .map((id) => getCandidateByIdWithSupporters(id))
        .filter((c): c is Candidate => c !== null);
      return { candidates: fetchedCandidates };
    }

    // PRODUCTION: Replace with real API call
    return apiCall(`/candidates/batch?ids=${candidateIds.join(",")}`);
  },
};
