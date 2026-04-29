import type { Candidate } from "@/types/candidate";
import type { Voter } from "@/types/voter";
import type { Canvasser } from "@/types/canvasser";

export interface CandidateWithUser extends Candidate {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
  };
  campaignCount?: number;
  collectCampaign?: CandidateCollectCampaignSummary | null;
}

export interface CandidateCollectCampaignSummary {
  id: string;
  slug: string;
  status: string;
  submissionsCount: number;
  clientReportEnabled: boolean;
  clientReportToken: string | null;
  clientReportLastViewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateResponse {
  candidate: CandidateWithUser;
  setupUrl: string;
  setupExpiresAt: string;
  deliveryMethod: "email" | "manual";
}

export interface CreateCandidateData {
  name: string;
  email: string;
  party: string;
  position: Candidate["position"];
  constituency: string;
  constituencyLgaIds?: number[];
  stateCode?: string;
  lga?: string;
  description?: string;
  phone?: string;
  title?: string;
}

export interface UpdateCandidateData {
  id: string;
  name?: string;
  email?: string;
  party?: string;
  position?: Candidate["position"];
  constituency?: string;
  constituencyLgaIds?: number[];
  stateCode?: string;
  lga?: string;
  description?: string;
  phone?: string;
  title?: string;
  onboardingStatus?: string;
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

export interface AdminDashboardSummary {
  updatedAt: string;
  registrations: {
    total: number;
    today: number;
    yesterday: number;
    last7d: number;
    previous7d: number;
  };
  candidates: {
    total: number;
    new7d: number;
    previous7d: number;
  };
}

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
        if (response.status === 404) {
          errorMessage = "Resource not found";
        } else if (response.status === 401) {
          errorMessage = "Unauthorized. Please log in again.";
        } else if (response.status === 403) {
          errorMessage = "You don't have permission to perform this action.";
        } else if (response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      }

      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Network error. Please check your internet connection and try again.",
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("An unexpected error occurred. Please try again.");
  }
}

function buildQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const adminApi = {
  candidates: {
    getAll: async (): Promise<CandidateWithUser[]> => {
      const data = await apiCall<{ candidates: CandidateWithUser[] }>(
        "/candidates",
      );
      return data.candidates;
    },

    getById: async (id: string): Promise<CandidateWithUser | null> => {
      const data = await apiCall<{ candidate: CandidateWithUser }>(
        `/candidates/${id}`,
      );
      return data.candidate;
    },

    create: async (
      data: CreateCandidateData,
    ): Promise<CreateCandidateResponse> => {
      return apiCall<CreateCandidateResponse>("/candidates", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    resetPassword: async (
      id: string,
    ): Promise<{
      resetUrl: string;
      expiresAt: string;
      deliveryMethod: "email" | "manual";
    }> => {
      return apiCall<{
        resetUrl: string;
        expiresAt: string;
        deliveryMethod: "email" | "manual";
      }>(`/candidates/${id}/reset-password`, { method: "POST" });
    },

    update: async (data: UpdateCandidateData): Promise<CandidateWithUser> => {
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

    delete: async (id: string): Promise<void> => {
      await apiCall(`/candidates/${id}`, {
        method: "DELETE",
      });
    },
  },

  voters: {
    getAll: async (params?: {
      candidateId?: string;
      state?: string;
      lga?: string;
      limit?: number;
      offset?: number;
    }): Promise<{ voters: Voter[]; total: number }> => {
      return apiCall<{ voters: Voter[]; total: number }>(
        `/voters${buildQueryString({
          candidateId: params?.candidateId,
          state: params?.state,
          lga: params?.lga,
          limit: params?.limit,
          offset: params?.offset,
        })}`,
      );
    },

    getById: async (id: string): Promise<Voter | null> => {
      const data = await apiCall<{ voter: Voter }>(`/voters/${id}`);
      return data.voter;
    },

    delete: async (id: string): Promise<void> => {
      await apiCall(`/voters/${id}`, {
        method: "DELETE",
      });
    },
  },

  canvassers: {
    getAll: async (params?: {
      candidateId?: string;
      state?: string;
      lga?: string;
      limit?: number;
      offset?: number;
    }): Promise<{ canvassers: CanvasserWithCandidate[]; total: number }> => {
      return apiCall<{ canvassers: CanvasserWithCandidate[]; total: number }>(
        `/canvassers${buildQueryString({
          candidateId: params?.candidateId,
          state: params?.state,
          lga: params?.lga,
          limit: params?.limit,
          offset: params?.offset,
        })}`,
      );
    },

    getById: async (id: string): Promise<CanvasserWithCandidate | null> => {
      const data = await apiCall<{ canvasser: CanvasserWithCandidate }>(
        `/canvassers/${id}`,
      );
      return data.canvasser;
    },

    getByCode: async (code: string): Promise<CanvasserWithCandidate | null> => {
      const data = await apiCall<{ canvasser: CanvasserWithCandidate | null }>(
        `/canvassers/code/${code}`,
      );
      return data.canvasser;
    },

    create: async (
      data: CreateCanvasserData,
    ): Promise<CanvasserWithCandidate> => {
      const result = await apiCall<{ canvasser: CanvasserWithCandidate }>(
        "/canvassers",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
      return result.canvasser;
    },

    update: async (
      data: UpdateCanvasserData,
    ): Promise<CanvasserWithCandidate> => {
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

    delete: async (id: string): Promise<void> => {
      await apiCall(`/canvassers/${id}`, {
        method: "DELETE",
      });
    },
  },

  dashboard: {
    getSummary: async (): Promise<AdminDashboardSummary> => {
      const data = await apiCall<{ summary: AdminDashboardSummary }>(
        "/dashboard/summary",
      );
      return data.summary;
    },
  },
};
