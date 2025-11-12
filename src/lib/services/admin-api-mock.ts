/**
 * Mock Admin API Service
 *
 * Uses mock data for development and demo purposes.
 * All operations simulate API calls with delays.
 */

import type {
  AdminApiService,
  CandidateWithUser,
  CreateCandidateData,
  UpdateCandidateData,
} from "@/lib/services/admin-api";
import type { Voter } from "@/types/voter";
import { candidates } from "@/lib/mock/data/candidates";
import { voters } from "@/lib/mock/data/voters";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

// Mock Admin API service implementation
export const adminApi: AdminApiService = {
  // Candidates API operations
  candidates: {
    getAll: async () => {
      // Simulate API delay
      await delay(500);
      // Map candidates to CandidateWithUser format
      return candidates.map((candidate) => ({
        ...candidate,
        user: generateMockUser(
          candidate.id,
          `${candidate.name.toLowerCase().replace(/\s+/g, ".")}@wardwise.ng`,
          candidate.name,
        ),
      })) as CandidateWithUser[];
    },

    getById: async (id: string) => {
      // Simulate API delay
      await delay(300);
      const candidate = candidates.find((c) => c.id === id);
      if (!candidate) return null;
      // Map candidate to CandidateWithUser format
      return {
        ...candidate,
        user: generateMockUser(
          candidate.id,
          `${candidate.name.toLowerCase().replace(/\s+/g, ".")}@wardwise.ng`,
          candidate.name,
        ),
      } as CandidateWithUser;
    },

    create: async (data: CreateCandidateData) => {
      // Simulate API delay
      await delay(800);
      // Create new candidate
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
      // In real app, this would be added to the data store
      console.log("Mock: Created candidate", newCandidate);
      return newCandidate;
    },

    // Update candidate
    update: async (data: UpdateCandidateData) => {
      // Simulate API delay
      await delay(600);
      const candidate = candidates.find((c) => c.id === data.id);
      if (!candidate) {
        throw new Error("Candidate not found");
      }
      // Map candidate to CandidateWithUser format
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
      // Log updated candidate
      console.log("Mock: Updated candidate", updated);
      return updated;
    },

    // Delete candidate
    delete: async (id: string) => {
      // Simulate API delay
      await delay(400);
      const candidate = candidates.find((c) => c.id === id);
      // Check if candidate exists
      if (!candidate) {
        throw new Error("Candidate not found");
      }
      console.log("Mock: Deleted candidate", id);
    },
  },

  // Voters API operations
  voters: {
    getAll: async (params?: {
      candidateId?: string;
      limit?: number;
      offset?: number;
    }) => {
      // Simulate API delay
      await delay(600);
      let filteredVoters = voters;

      // Filter voters by candidate ID
      if (params?.candidateId) {
        filteredVoters = voters.filter(
          (v) => v.candidateId === params.candidateId,
        ) as Voter[];
      }

      return {
        voters: filteredVoters,
        total: filteredVoters.length,
      };
    },

    // Get voter by ID
    getById: async (id: string) => {
      // Simulate API delay
      await delay(300);
      return voters.find((v) => v.id === id) || (null as Voter | null);
    },

    // Get voter by NIN
    getByNIN: async (nin: string) => {
      await delay(300);
      return voters.find((v) => v.nin === nin) || (null as Voter | null);
    },

    // Delete voter
    delete: async (id: string) => {
      await delay(400);
      const voter = voters.find((v) => v.id === id) as Voter | undefined;
      if (!voter) {
        throw new Error("Voter not found");
      }
      console.log("Mock: Deleted voter", id);
    },
  },
};
