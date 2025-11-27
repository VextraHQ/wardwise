/**
 * Admin API Client
 *
 * Handles all admin operations: candidate management (CRUD) and voter management.
 * Used by admin dashboard for managing candidates and voters.
 *
 * MOCK vs PRODUCTION:
 * - Mock: Uses static data from @/lib/mock/data/candidates and voters
 * - Mock: Simulates API delays and generates mock user data
 * - Production: Replace with real API endpoints that interact with database
 *
 * TRANSITION TO PRODUCTION:
 * 1. Set NEXT_PUBLIC_USE_MOCK_API=false in production
 * 2. Update apiCall() endpoints to match your backend API
 * 3. Remove mock data imports
 * 4. Update error handling for real API responses
 */

import type { Candidate } from "@/types/candidate";
import type { Voter } from "@/types/voter";
import { candidates } from "@/lib/mock/data/candidates";
import { voters } from "@/lib/mock/data/voters";

// Types
export interface CandidateWithUser extends Candidate {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
  };
}

export interface CreateCandidateData {
  name: string;
  email: string;
  party: string;
  position: Candidate["position"];
  constituency: string;
  description?: string;
}

export interface UpdateCandidateData {
  id: string;
  name?: string;
  email?: string;
  party?: string;
  position?: Candidate["position"];
  constituency?: string;
  description?: string;
}

// Simple helper for API calls (for real API)
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/admin${endpoint}`, {
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

// Mock user data generator
const generateMockUser = (
  candidateId: string,
  email: string,
  name: string,
) => ({
  id: `user-${candidateId}`,
  email,
  name,
  role: "candidate" as const,
  createdAt: new Date().toISOString(),
});

export const adminApi = {
  candidates: {
    /**
     * Get all candidates with user data
     * MOCK: Returns from static data | PRODUCTION: API call
     */
    getAll: async (): Promise<CandidateWithUser[]> => {
      if (USE_MOCK) {
        // MOCK: Returns all candidates with mock user data
        console.log("👥 Mock: Getting all candidates");
        await new Promise((resolve) => setTimeout(resolve, 500));
        return candidates.map((candidate) => ({
          ...candidate,
          user: generateMockUser(
            candidate.id,
            `${candidate.name.toLowerCase().replace(/\s+/g, ".")}@wardwise.ng`,
            candidate.name,
          ),
        })) as CandidateWithUser[];
      }

      // PRODUCTION: Replace with real API call
      const data = await apiCall<{ candidates: CandidateWithUser[] }>(
        "/candidates",
      );
      return data.candidates;
    },

    /**
     * Get candidate by ID with user data
     * MOCK: Returns from static data | PRODUCTION: API call
     */
    getById: async (id: string): Promise<CandidateWithUser | null> => {
      if (USE_MOCK) {
        // MOCK: Returns candidate with mock user data
        console.log(`👤 Mock: Getting candidate ${id}`);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const candidate = candidates.find((c) => c.id === id);
        if (!candidate) return null;
        return {
          ...candidate,
          user: generateMockUser(
            candidate.id,
            `${candidate.name.toLowerCase().replace(/\s+/g, ".")}@wardwise.ng`,
            candidate.name,
          ),
        } as CandidateWithUser;
      }

      // PRODUCTION: Replace with real API call
      const data = await apiCall<{ candidate: CandidateWithUser }>(
        `/candidates/${id}`,
      );
      return data.candidate;
    },

    /**
     * Create a new candidate
     * MOCK: Generates mock ID, logs to console | PRODUCTION: Saves to database
     */
    create: async (data: CreateCandidateData): Promise<CandidateWithUser> => {
      if (USE_MOCK) {
        // MOCK: Creates candidate with mock ID
        console.log("📝 Mock: Creating candidate", data);
        await new Promise((resolve) => setTimeout(resolve, 800));
        const newCandidate: CandidateWithUser = {
          id: `cand-${Date.now()}`,
          name: data.name,
          party: data.party,
          position: data.position,
          state: "Adamawa State", // Default, should be configurable
          constituency: data.constituency,
          description: data.description || "",
          supporters: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: generateMockUser(`cand-${Date.now()}`, data.email, data.name),
        };
        console.log("Mock: Created candidate", newCandidate);
        return newCandidate;
      }

      // PRODUCTION: Replace with real API call
      const result = await apiCall<{ candidate: CandidateWithUser }>(
        "/candidates",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
      return result.candidate;
    },

    /**
     * Update an existing candidate
     * MOCK: Updates in-memory data | PRODUCTION: Updates database
     */
    update: async (data: UpdateCandidateData): Promise<CandidateWithUser> => {
      if (USE_MOCK) {
        // MOCK: Updates candidate data
        console.log("📝 Mock: Updating candidate", data);
        await new Promise((resolve) => setTimeout(resolve, 600));
        const candidate = candidates.find((c) => c.id === data.id);
        if (!candidate) {
          throw new Error("Candidate not found");
        }
        const updated: CandidateWithUser = {
          ...candidate,
          ...data,
          updatedAt: new Date().toISOString(),
          user: generateMockUser(
            candidate.id,
            data.email ||
              `${candidate.name.toLowerCase().replace(/\s+/g, ".")}@wardwise.ng`,
            data.name || candidate.name,
          ),
        };
        console.log("Mock: Updated candidate", updated);
        return updated;
      }

      // PRODUCTION: Replace with real API call
      const { id, ...updateData } = data;
      const result = await apiCall<{ candidate: CandidateWithUser }>(
        `/candidates/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        },
      );
      return result.candidate;
    },

    /**
     * Delete a candidate
     * MOCK: Logs deletion | PRODUCTION: Deletes from database
     */
    delete: async (id: string): Promise<void> => {
      if (USE_MOCK) {
        // MOCK: Simulates deletion
        console.log("🗑️ Mock: Deleting candidate", id);
        await new Promise((resolve) => setTimeout(resolve, 400));
        const candidate = candidates.find((c) => c.id === id);
        if (!candidate) {
          throw new Error("Candidate not found");
        }
        console.log("Mock: Deleted candidate", id);
        return;
      }

      // PRODUCTION: Replace with real API call
      await apiCall(`/candidates/${id}`, {
        method: "DELETE",
      });
    },
  },

  voters: {
    /**
     * Get all voters with optional filtering
     * MOCK: Returns from static data with filters | PRODUCTION: API call with query params
     */
    getAll: async (params?: {
      candidateId?: string;
      limit?: number;
      offset?: number;
    }): Promise<{ voters: Voter[]; total: number }> => {
      if (USE_MOCK) {
        // MOCK: Returns voters with optional filtering
        console.log("👥 Mock: Getting all voters", params);
        await new Promise((resolve) => setTimeout(resolve, 600));
        let filteredVoters = voters;

        if (params?.candidateId) {
          filteredVoters = voters.filter((v) =>
            v.candidateSelections?.some(
              (sel) => sel.candidateId === params.candidateId,
            ),
          ) as Voter[];
        }

        return {
          voters: filteredVoters,
          total: filteredVoters.length,
        };
      }

      // PRODUCTION: Replace with real API call
      const queryParams = new URLSearchParams();
      if (params?.candidateId)
        queryParams.append("candidateId", params.candidateId);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset)
        queryParams.append("offset", params.offset.toString());

      const queryString = queryParams.toString();
      const endpoint = `/voters${queryString ? `?${queryString}` : ""}`;

      return apiCall<{ voters: Voter[]; total: number }>(endpoint);
    },

    /**
     * Get voter by ID
     * MOCK: Returns from static data | PRODUCTION: API call
     */
    getById: async (id: string): Promise<Voter | null> => {
      if (USE_MOCK) {
        // MOCK: Returns voter from static data
        console.log(`👤 Mock: Getting voter ${id}`);
        await new Promise((resolve) => setTimeout(resolve, 300));
        return voters.find((v) => v.id === id) || null;
      }

      // PRODUCTION: Replace with real API call
      const data = await apiCall<{ voter: Voter }>(`/voters/${id}`);
      return data.voter;
    },

    /**
     * Get voter by NIN
     * MOCK: Returns from static data | PRODUCTION: API call
     */
    getByNIN: async (nin: string): Promise<Voter | null> => {
      if (USE_MOCK) {
        // MOCK: Returns voter from static data
        console.log(`🆔 Mock: Getting voter by NIN ${nin}`);
        await new Promise((resolve) => setTimeout(resolve, 300));
        return voters.find((v) => v.nin === nin) || null;
      }

      // PRODUCTION: Replace with real API call
      const data = await apiCall<{ voter: Voter | null }>(`/voters/nin/${nin}`);
      return data.voter;
    },

    /**
     * Delete a voter
     * MOCK: Logs deletion | PRODUCTION: Deletes from database
     */
    delete: async (id: string): Promise<void> => {
      if (USE_MOCK) {
        // MOCK: Simulates deletion
        console.log("🗑️ Mock: Deleting voter", id);
        await new Promise((resolve) => setTimeout(resolve, 400));
        const voter = voters.find((v) => v.id === id);
        if (!voter) {
          throw new Error("Voter not found");
        }
        console.log("Mock: Deleted voter", id);
        return;
      }

      // PRODUCTION: Replace with real API call
      await apiCall(`/voters/${id}`, {
        method: "DELETE",
      });
    },
  },
};
