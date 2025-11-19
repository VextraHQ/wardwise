/**
 * Dashboard API Client
 *
 * Handles all candidate dashboard analytics: supporters list, ward data,
 * survey responses, and demographic breakdowns.
 *
 * MOCK vs PRODUCTION:
 * - Mock: Uses analytics helpers from @/lib/helpers/voter-analytics
 * - Mock: Filters supporters with pagination, search, date ranges
 * - Production: Replace with real API endpoints that query database
 *
 * TRANSITION TO PRODUCTION:
 * 1. Update apiCall() endpoints to match your backend
 * 2. Backend should handle all filtering, pagination, and analytics
 * 3. Remove analytics helper imports
 */

import type { Voter } from "@/types/voter";

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

export const dashboardApi = {
  getCandidateDashboard: async (
    candidateId: string,
  ): Promise<{
    dashboard: ReturnType<
      typeof import("@/lib/helpers/voter-analytics").getCandidateDashboardData
    >;
  }> => {
    if (USE_MOCK) {
      // MOCK: Returns dashboard data using analytics helpers
      console.log(
        `📊 Mock: Getting dashboard data for candidate ${candidateId}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 800));
      const { getCandidateDashboardData } = await import(
        "@/lib/helpers/voter-analytics"
      );
      const dashboard = getCandidateDashboardData(candidateId);
      return { dashboard };
    }

    // PRODUCTION: Replace with real API call
    return apiCall(`/candidates/${candidateId}/dashboard`);
  },

  getCandidateSupporters: async (
    candidateId: string,
    options?: {
      page?: number;
      pageSize?: number;
      ward?: string;
      lga?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<{
    supporters: Voter[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    if (USE_MOCK) {
      // MOCK: Returns paginated supporters with filters
      console.log(
        `👥 Mock: Getting supporters for candidate ${candidateId}`,
        options,
      );
      await new Promise((resolve) => setTimeout(resolve, 600));

      const { getVotersByCandidate } = await import("@/lib/mock/data/voters");
      let supporters = getVotersByCandidate(candidateId);

      // Apply filters
      if (options?.ward) {
        supporters = supporters.filter((v) => v.ward === options.ward);
      }
      if (options?.lga) {
        supporters = supporters.filter((v) => v.lga === options.lga);
      }
      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        supporters = supporters.filter(
          (v) =>
            v.firstName.toLowerCase().includes(searchLower) ||
            v.lastName.toLowerCase().includes(searchLower) ||
            v.nin.includes(searchLower) ||
            v.phoneNumber?.toLowerCase().includes(searchLower) ||
            v.email?.toLowerCase().includes(searchLower),
        );
      }
      if (options?.startDate) {
        supporters = supporters.filter(
          (v) => v.registrationDate >= options.startDate!,
        );
      }
      if (options?.endDate) {
        supporters = supporters.filter(
          (v) => v.registrationDate <= options.endDate!,
        );
      }

      const total = supporters.length;
      const page = options?.page || 1;
      const pageSize = options?.pageSize || 25;
      const totalPages = Math.ceil(total / pageSize);

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedSupporters = supporters.slice(startIndex, endIndex);

      return {
        supporters: paginatedSupporters,
        total,
        page,
        pageSize,
        totalPages,
      };
    }

    // PRODUCTION: Replace with real API call
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.pageSize)
      params.append("pageSize", options.pageSize.toString());
    if (options?.ward) params.append("ward", options.ward);
    if (options?.lga) params.append("lga", options.lga);
    if (options?.search) params.append("search", options.search);
    if (options?.startDate) params.append("startDate", options.startDate);
    if (options?.endDate) params.append("endDate", options.endDate);

    return apiCall(
      `/candidates/${candidateId}/supporters?${params.toString()}`,
    );
  },

  getCandidateWardData: async (
    candidateId: string,
  ): Promise<{
    wardData: ReturnType<
      typeof import("@/lib/helpers/voter-analytics").getWardCoverage
    >;
  }> => {
    if (USE_MOCK) {
      // MOCK: Returns ward breakdown data
      console.log(`🏘️ Mock: Getting ward data for candidate ${candidateId}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const { getWardCoverage } = await import("@/lib/helpers/voter-analytics");
      const wardData = getWardCoverage(candidateId);
      return { wardData };
    }

    // PRODUCTION: Replace with real API call
    return apiCall(`/candidates/${candidateId}/ward-data`);
  },

  getCandidateSurveyResponses: async (
    candidateId: string,
  ): Promise<{
    surveyAnalytics: ReturnType<
      typeof import("@/lib/helpers/voter-analytics").getSurveyAnalytics
    >;
  }> => {
    if (USE_MOCK) {
      // MOCK: Returns survey response analytics
      console.log(
        `📋 Mock: Getting survey responses for candidate ${candidateId}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      const { getSurveyAnalytics } = await import(
        "@/lib/helpers/voter-analytics"
      );
      const surveyAnalytics = getSurveyAnalytics(candidateId);
      return { surveyAnalytics };
    }

    // PRODUCTION: Replace with real API call
    return apiCall(`/candidates/${candidateId}/survey-responses`);
  },

  getCandidateDemographics: async (
    candidateId: string,
  ): Promise<{
    demographics: ReturnType<
      typeof import("@/lib/helpers/voter-analytics").getDemographics
    >;
  }> => {
    if (USE_MOCK) {
      // MOCK: Returns demographic breakdown
      console.log(`📊 Mock: Getting demographics for candidate ${candidateId}`);
      await new Promise((resolve) => setTimeout(resolve, 400));
      const { getDemographics } = await import("@/lib/helpers/voter-analytics");
      const demographics = getDemographics(candidateId);
      return { demographics };
    }

    // PRODUCTION: Replace with real API call
    return apiCall(`/candidates/${candidateId}/demographics`);
  },
};
