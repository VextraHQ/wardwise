/**
 * Admin API Client
 *
 * Handles all admin operations: candidate, voter, and canvasser management (CRUD).
 * Used by admin dashboard for managing all users in the system.
 *
 * MOCK vs PRODUCTION:
 * - Mock: Uses static data from @/lib/mock/data/* (only if NEXT_PUBLIC_USE_MOCK_API=true)
 * - Mock: Simulates API delays and generates mock user data
 * - Production: Uses real API calls to /api/admin/* routes (default behavior)
 *
 * Configuration:
 * - Set NEXT_PUBLIC_USE_MOCK_API=true to use mock data
 * - Leave unset or set to "false" to use real API (default)
 *
 * Real API endpoints:
 * - /api/admin/candidates - GET (all), POST (create)
 * - /api/admin/candidates/[id] - GET, PUT, DELETE
 * - /api/admin/voters - GET (all with filters)
 * - /api/admin/voters/[id] - GET, DELETE
 * - /api/admin/canvassers - GET (all with filters), POST (create)
 * - /api/admin/canvassers/[id] - GET, PUT, DELETE
 * - /api/admin/canvassers/code/[code] - GET
 *
 * TO REMOVE MOCK CODE (after testing):
 * 1. Remove mock data imports (lines ~30-32): candidates, voters, canvassers
 * 2. Remove USE_MOCK constant and all `if (USE_MOCK) { ... }` blocks
 * 3. Remove helper functions: generateEmailFromName, generateMockUser
 * 4. Remove mockCreatedCandidates array
 * 5. Keep only the real API calls (apiCall() functions)
 * 6. Remove mock-related comments
 *
 * This will reduce file size by ~60% and simplify the codebase.
 */

import type { Candidate } from "@/types/candidate";
import type { Voter } from "@/types/voter";
import type { Canvasser } from "@/types/canvasser";
import { candidates } from "@/lib/mock/data/candidates";
import { voters } from "@/lib/mock/data/voters";
import { canvassers } from "@/lib/mock/data/canvassers";

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
  state?: string;
  lga?: string;
  description?: string;
}

export interface UpdateCandidateData {
  id: string;
  name?: string;
  email?: string;
  party?: string;
  position?: Candidate["position"];
  constituency?: string;
  state?: string;
  lga?: string;
  description?: string;
}

export interface CanvasserWithCandidate extends Canvasser {
  candidate: {
    id: string;
    name: string;
    party: string;
    position: string;
  };
}

export interface CreateCanvasserData {
  code: string;
  name: string;
  phone: string;
  candidateId: string;
  ward?: string;
  lga?: string;
  state?: string;
}

export interface UpdateCanvasserData {
  id: string;
  code?: string;
  name?: string;
  phone?: string;
  candidateId?: string;
  ward?: string;
  lga?: string;
  state?: string;
}
// Real API call to /api/admin/* routes
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`/api/admin${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.statusText}`;
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        // If JSON parsing fails, use status text
        if (response.status === 404) {
          errorMessage = "Resource not found";
        } else if (response.status === 401) {
          errorMessage = "Unauthorized. Please log in again.";
        } else if (response.status === 403) {
          errorMessage = "You don't have permission to perform this action";
        } else if (response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Network error. Please check your internet connection and try again.",
      );
    }
    // Re-throw if it's already an Error
    if (error instanceof Error) {
      throw error;
    }
    // Fallback for unknown errors
    throw new Error("An unexpected error occurred. Please try again.");
  }
}

// Mock mode: true if explicitly set, or default to mock in development
// Production mode: false if explicitly set, or default in production
const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK_API === "true" ||
  (!process.env.NEXT_PUBLIC_USE_MOCK_API &&
    process.env.NODE_ENV === "development");

/**
 * Generate professional email from candidate name
 * Uses firstname.lastname format (e.g., "Dr. Ahmadu Umaru Fintiri" -> "ahmadu.fintiri@wardwise.ng")
 */
function generateEmailFromName(name: string): string {
  const parts = name
    .toLowerCase()
    .trim()
    // Remove titles and punctuation
    .replace(/\b(dr|mr|mrs|ms|prof|engr|senator|hon)\.?\s*/gi, "")
    .replace(/[^\w\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "candidate@wardwise.ng";
  if (parts.length === 1) return `${parts[0]}@wardwise.ng`;

  // Use firstname.lastname format (professional and scalable)
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return `${firstName}.${lastName}@wardwise.ng`;
}

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

// In-memory storage for mock created candidates
const mockCreatedCandidates: CandidateWithUser[] = [];

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

        // Map static candidates with user data
        const staticCandidatesWithUser = candidates.map((candidate) => ({
          ...candidate,
          user: generateMockUser(
            candidate.id,
            generateEmailFromName(candidate.name),
            candidate.name,
          ),
        })) as CandidateWithUser[];

        // Merge static candidates with created candidates and deduplicate by email
        const allCandidates = [
          ...staticCandidatesWithUser,
          ...mockCreatedCandidates,
        ];
        const seen = new Set<string>();
        return allCandidates.filter((c) => {
          const email = c.user.email.toLowerCase();
          if (seen.has(email)) return false;
          seen.add(email);
          return true;
        });
      }

      // Real API call to /api/admin/candidates
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

        // Check in created candidates first
        const createdCandidate = mockCreatedCandidates.find((c) => c.id === id);
        if (createdCandidate) {
          return createdCandidate;
        }

        // Check in static candidates
        const candidate = candidates.find((c) => c.id === id);
        if (!candidate) return null;
        return {
          ...candidate,
          user: generateMockUser(
            candidate.id,
            generateEmailFromName(candidate.name),
            candidate.name,
          ),
        } as CandidateWithUser;
      }

      // Real API call to /api/admin/candidates/[id]
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

        // Check for duplicate email
        const emailLower = data.email.toLowerCase();
        const existingCandidate = mockCreatedCandidates.find(
          (c) => c.user.email.toLowerCase() === emailLower,
        );
        if (existingCandidate) {
          throw new Error(`Email already exists: ${data.email}`);
        }

        const candidateId = `cand-${Date.now()}`;
        // For mock, infer isNational from position (President = national)
        const isNational = data.position === "President";
        const newCandidate: CandidateWithUser = {
          id: candidateId,
          name: data.name,
          party: data.party,
          position: data.position,
          isNational,
          state: null, // Mock doesn't track state/lga - would need to be added to CreateCandidateData
          lga: null,
          constituency: data.constituency || null,
          description: data.description || "",
          supporters: 0,
          email: data.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: generateMockUser(candidateId, data.email, data.name),
        };

        // Add to mock storage
        mockCreatedCandidates.push(newCandidate);
        console.log("Mock: Created candidate", newCandidate);
        return newCandidate;
      }

      // Real API call to /api/admin/candidates (POST)
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

        // Check for duplicate email if being changed
        if (data.email) {
          const emailLower = data.email.toLowerCase();
          const existingCandidate = mockCreatedCandidates.find(
            (c) =>
              c.user.email.toLowerCase() === emailLower && c.id !== data.id,
          );
          if (existingCandidate) {
            throw new Error(`Email already exists: ${data.email}`);
          }
        }

        // Check in created candidates first
        const createdIndex = mockCreatedCandidates.findIndex(
          (c) => c.id === data.id,
        );
        if (createdIndex !== -1) {
          const existing = mockCreatedCandidates[createdIndex];
          const updated: CandidateWithUser = {
            ...existing,
            ...data,
            updatedAt: new Date().toISOString(),
            user: {
              ...existing.user,
              email: data.email || existing.user.email,
              name: data.name || existing.user.name,
            },
          };
          mockCreatedCandidates[createdIndex] = updated;
          console.log("Mock: Updated candidate", updated);
          return updated;
        }

        // Check in static candidates
        const candidate = candidates.find((c) => c.id === data.id);
        if (!candidate) {
          throw new Error("Candidate not found");
        }

        const updatedName = data.name || candidate.name;
        const updated: CandidateWithUser = {
          ...candidate,
          ...data,
          updatedAt: new Date().toISOString(),
          user: generateMockUser(
            candidate.id,
            data.email || generateEmailFromName(updatedName),
            updatedName,
          ),
        };
        console.log("Mock: Updated candidate", updated);
        return updated;
      }

      // Real API call to /api/admin/candidates/[id] (PUT)
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

        // Check in created candidates first
        const createdIndex = mockCreatedCandidates.findIndex(
          (c) => c.id === id,
        );
        if (createdIndex !== -1) {
          mockCreatedCandidates.splice(createdIndex, 1);
          console.log("Mock: Deleted candidate from created candidates", id);
          return;
        }

        // Check in static candidates (can't actually delete from static array, just validate)
        const candidate = candidates.find((c) => c.id === id);
        if (!candidate) {
          throw new Error("Candidate not found");
        }
        console.log("Mock: Deleted candidate (static)", id);
        return;
      }

      // Real API call to /api/admin/candidates/[id] (DELETE)
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

        // In production, voters are linked to candidates through canvassers.
        // In mock mode, all voters belong to the demo candidate.
        if (params?.candidateId) {
          filteredVoters = [...voters];
        }

        return {
          voters: filteredVoters,
          total: filteredVoters.length,
        };
      }

      // Real API call to /api/admin/voters (with query params)
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

      // Real API call to /api/admin/voters/[id]
      const data = await apiCall<{ voter: Voter }>(`/voters/${id}`);
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

      // Real API call to /api/admin/voters/[id] (DELETE)
      await apiCall(`/voters/${id}`, {
        method: "DELETE",
      });
    },
  },

  canvassers: {
    /**
     * Get all canvassers with optional filtering
     * MOCK: Returns from static data with filters | PRODUCTION: API call with query params
     */
    getAll: async (params?: {
      candidateId?: string;
      state?: string;
      lga?: string;
      limit?: number;
      offset?: number;
    }): Promise<{ canvassers: CanvasserWithCandidate[]; total: number }> => {
      if (USE_MOCK) {
        // MOCK: Returns canvassers with optional filtering
        console.log("👥 Mock: Getting all canvassers", params);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Map canvassers with candidate data
        let filteredCanvassers = canvassers.map((canv) => {
          const candidate = candidates.find((c) => c.id === canv.candidateId);
          return {
            ...canv,
            candidate: candidate
              ? {
                  id: candidate.id,
                  name: candidate.name,
                  party: candidate.party,
                  position: candidate.position,
                }
              : {
                  id: canv.candidateId,
                  name: canv.candidateName || "Unknown",
                  party: "Unknown",
                  position: "Unknown",
                },
          } as CanvasserWithCandidate;
        });

        // Apply filters
        if (params?.candidateId) {
          filteredCanvassers = filteredCanvassers.filter(
            (c) => c.candidateId === params.candidateId,
          );
        }
        if (params?.state) {
          filteredCanvassers = filteredCanvassers.filter(
            (c) => c.state === params.state,
          );
        }
        if (params?.lga) {
          filteredCanvassers = filteredCanvassers.filter(
            (c) => c.lga === params.lga,
          );
        }

        return {
          canvassers: filteredCanvassers,
          total: filteredCanvassers.length,
        };
      }

      // Real API call to /api/admin/canvassers (with query params)
      const queryParams = new URLSearchParams();
      if (params?.candidateId)
        queryParams.append("candidateId", params.candidateId);
      if (params?.state) queryParams.append("state", params.state);
      if (params?.lga) queryParams.append("lga", params.lga);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset)
        queryParams.append("offset", params.offset.toString());

      const queryString = queryParams.toString();
      const endpoint = `/canvassers${queryString ? `?${queryString}` : ""}`;

      return apiCall<{ canvassers: CanvasserWithCandidate[]; total: number }>(
        endpoint,
      );
    },

    /**
     * Get canvasser by ID
     * MOCK: Returns from static data | PRODUCTION: API call
     */
    getById: async (id: string): Promise<CanvasserWithCandidate | null> => {
      if (USE_MOCK) {
        // MOCK: Returns canvasser from static data
        console.log(`👤 Mock: Getting canvasser ${id}`);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const canvasser = canvassers.find((c) => c.id === id);
        if (!canvasser) return null;

        const candidate = candidates.find(
          (c) => c.id === canvasser.candidateId,
        );
        return {
          ...canvasser,
          candidate: candidate
            ? {
                id: candidate.id,
                name: candidate.name,
                party: candidate.party,
                position: candidate.position,
              }
            : {
                id: canvasser.candidateId,
                name: canvasser.candidateName || "Unknown",
                party: "Unknown",
                position: "Unknown",
              },
        } as CanvasserWithCandidate;
      }

      // Real API call to /api/admin/canvassers/[id]
      const data = await apiCall<{ canvasser: CanvasserWithCandidate }>(
        `/canvassers/${id}`,
      );
      return data.canvasser;
    },

    /**
     * Get canvasser by code
     * MOCK: Returns from static data | PRODUCTION: API call
     */
    getByCode: async (code: string): Promise<CanvasserWithCandidate | null> => {
      if (USE_MOCK) {
        // MOCK: Returns canvasser from static data
        console.log(`🆔 Mock: Getting canvasser by code ${code}`);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const canvasser = canvassers.find((c) => c.code === code);
        if (!canvasser) return null;

        const candidate = candidates.find(
          (c) => c.id === canvasser.candidateId,
        );
        return {
          ...canvasser,
          candidate: candidate
            ? {
                id: candidate.id,
                name: candidate.name,
                party: candidate.party,
                position: candidate.position,
              }
            : {
                id: canvasser.candidateId,
                name: canvasser.candidateName || "Unknown",
                party: "Unknown",
                position: "Unknown",
              },
        } as CanvasserWithCandidate;
      }

      // Real API call to /api/admin/canvassers/code/[code]
      const data = await apiCall<{ canvasser: CanvasserWithCandidate | null }>(
        `/canvassers/code/${code}`,
      );
      return data.canvasser;
    },

    /**
     * Create a new canvasser
     * MOCK: Generates mock ID, logs to console | PRODUCTION: Saves to database
     */
    create: async (
      data: CreateCanvasserData,
    ): Promise<CanvasserWithCandidate> => {
      if (USE_MOCK) {
        // MOCK: Creates canvasser with mock ID
        console.log("📝 Mock: Creating canvasser", data);
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Check for duplicate code
        const existingCanvasser = canvassers.find((c) => c.code === data.code);
        if (existingCanvasser) {
          throw new Error(`Canvasser with code ${data.code} already exists`);
        }

        const candidate = candidates.find((c) => c.id === data.candidateId);
        if (!candidate) {
          throw new Error(`Candidate with ID ${data.candidateId} not found`);
        }

        const canvasserId = `canv-${Date.now()}`;
        const newCanvasser: CanvasserWithCandidate = {
          id: canvasserId,
          code: data.code,
          name: data.name,
          phone: data.phone,
          candidateId: data.candidateId,
          candidateName: candidate.name,
          ward: data.ward,
          lga: data.lga,
          state: data.state,
          votersCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          candidate: {
            id: candidate.id,
            name: candidate.name,
            party: candidate.party,
            position: candidate.position,
          },
        };

        // Add to mock storage (in a real app, this would be in-memory storage)
        canvassers.push(newCanvasser);
        console.log("Mock: Created canvasser", newCanvasser);
        return newCanvasser;
      }

      // Real API call to /api/admin/canvassers (POST)
      const result = await apiCall<{ canvasser: CanvasserWithCandidate }>(
        "/canvassers",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
      return result.canvasser;
    },

    /**
     * Update an existing canvasser
     * MOCK: Updates in-memory data | PRODUCTION: Updates database
     */
    update: async (
      data: UpdateCanvasserData,
    ): Promise<CanvasserWithCandidate> => {
      if (USE_MOCK) {
        // MOCK: Updates canvasser data
        console.log("📝 Mock: Updating canvasser", data);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const canvasserIndex = canvassers.findIndex((c) => c.id === data.id);
        if (canvasserIndex === -1) {
          throw new Error("Canvasser not found");
        }

        const existing = canvassers[canvasserIndex];
        const candidateId = data.candidateId || existing.candidateId;
        const candidate = candidates.find((c) => c.id === candidateId);

        if (!candidate) {
          throw new Error(`Candidate with ID ${candidateId} not found`);
        }

        const updated: CanvasserWithCandidate = {
          ...existing,
          ...data,
          candidateId,
          updatedAt: new Date().toISOString(),
          candidate: {
            id: candidate.id,
            name: candidate.name,
            party: candidate.party,
            position: candidate.position,
          },
        };

        canvassers[canvasserIndex] = updated;
        console.log("Mock: Updated canvasser", updated);
        return updated;
      }

      // Real API call to /api/admin/canvassers/[id] (PUT)
      const { id, ...updateData } = data;
      const result = await apiCall<{ canvasser: CanvasserWithCandidate }>(
        `/canvassers/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        },
      );
      return result.canvasser;
    },

    /**
     * Delete a canvasser
     * MOCK: Logs deletion | PRODUCTION: Deletes from database
     */
    delete: async (id: string): Promise<void> => {
      if (USE_MOCK) {
        // MOCK: Simulates deletion
        console.log("🗑️ Mock: Deleting canvasser", id);
        await new Promise((resolve) => setTimeout(resolve, 400));
        const canvasserIndex = canvassers.findIndex((c) => c.id === id);
        if (canvasserIndex === -1) {
          throw new Error("Canvasser not found");
        }
        canvassers.splice(canvasserIndex, 1);
        console.log("Mock: Deleted canvasser", id);
        return;
      }

      // Real API call to /api/admin/canvassers/[id] (DELETE)
      await apiCall(`/canvassers/${id}`, {
        method: "DELETE",
      });
    },
  },
};
