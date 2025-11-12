/**
 * Real Admin API Service
 *
 * Uses actual API endpoints for production.
 * All operations make real HTTP requests to the backend.
 */

import type {
  AdminApiService,
  CandidateWithUser,
  CreateCandidateData,
  UpdateCandidateData,
} from "@/lib/services/admin-api";
import type { Voter } from "@/types/voter";

const API_BASE = "/api/admin";

// Helper for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
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

export const adminApi: AdminApiService = {
  candidates: {
    getAll: async () => {
      const data = await apiCall<{ candidates: CandidateWithUser[] }>(
        "/candidates",
      );
      return data.candidates;
    },

    getById: async (id: string) => {
      const data = await apiCall<{ candidate: CandidateWithUser }>(
        `/candidates/${id}`,
      );
      return data.candidate;
    },

    create: async (data: CreateCandidateData) => {
      const result = await apiCall<{ candidate: CandidateWithUser }>(
        "/candidates",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
      return result.candidate;
    },

    update: async (data: UpdateCandidateData) => {
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

    delete: async (id: string) => {
      await apiCall(`/candidates/${id}`, {
        method: "DELETE",
      });
    },
  },

  voters: {
    getAll: async (params?: {
      candidateId?: string;
      limit?: number;
      offset?: number;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.candidateId)
        queryParams.append("candidateId", params.candidateId);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset)
        queryParams.append("offset", params.offset.toString());

      const queryString = queryParams.toString();
      const endpoint = `/voters${queryString ? `?${queryString}` : ""}`;

      const data = await apiCall<{ voters: Voter[]; total: number }>(endpoint);
      return data;
    },

    getById: async (id: string) => {
      const data = await apiCall<{ voter: Voter }>(`/voters/${id}`);
      return data.voter;
    },

    getByNIN: async (nin: string) => {
      const data = await apiCall<{ voter: Voter | null }>(`/voters/nin/${nin}`);
      return data.voter;
    },

    delete: async (id: string) => {
      await apiCall(`/voters/${id}`, {
        method: "DELETE",
      });
    },
  },
};
