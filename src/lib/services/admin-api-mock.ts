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
} from "./admin-api";
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

export const adminApi: AdminApiService = {
  candidates: {
    getAll: async () => {
      await delay(500);
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
      await delay(300);
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
    },

    create: async (data: CreateCandidateData) => {
      await delay(800);
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

    update: async (data: UpdateCandidateData) => {
      await delay(600);
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
    },

    delete: async (id: string) => {
      await delay(400);
      const candidate = candidates.find((c) => c.id === id);
      if (!candidate) {
        throw new Error("Candidate not found");
      }
      console.log("Mock: Deleted candidate", id);
    },
  },

  voters: {
    getAll: async (params?: {
      candidateId?: string;
      limit?: number;
      offset?: number;
    }) => {
      await delay(600);
      let filteredVoters = voters;

      if (params?.candidateId) {
        filteredVoters = voters.filter(
          (v) => v.candidateId === params.candidateId,
        );
      }

      const total = filteredVoters.length;
      const offset = params?.offset || 0;
      const limit = params?.limit || 50;
      const paginated = filteredVoters.slice(offset, offset + limit);

      return {
        voters: paginated,
        total,
      };
    },

    getById: async (id: string) => {
      await delay(300);
      return voters.find((v) => v.id === id) || null;
    },

    getByNIN: async (nin: string) => {
      await delay(300);
      return voters.find((v) => v.nin === nin) || null;
    },

    delete: async (id: string) => {
      await delay(400);
      const voter = voters.find((v) => v.id === id);
      if (!voter) {
        throw new Error("Voter not found");
      }
      console.log("Mock: Deleted voter", id);
    },
  },
};
