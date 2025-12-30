/**
 * Candidate Dashboard React Query Hooks
 *
 * Custom hooks for fetching candidate dashboard data using React Query.
 * All hooks filter by candidateId from NextAuth session to ensure data isolation.
 *
 * These hooks provide:
 * - Automatic caching and refetching
 * - Loading and error states
 * - Optimistic updates
 * - Proper query key management
 */

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { dashboardApi } from "@/lib/api/candidate-dashboard";
import { candidateApi } from "@/lib/api/candidate";

/**
 * Get candidateId from session
 * Returns null if not authenticated or no candidateId
 */
function useCandidateId(): string | null {
  const { data: session } = useSession();
  return session?.user?.candidateId || null;
}

/**
 * Hook to get comprehensive dashboard data for the logged-in candidate
 * Includes all key metrics: supporters, ward coverage, demographics, trends, surveys
 */
export function useCandidateDashboard() {
  const candidateId = useCandidateId();

  return useQuery({
    queryKey: ["candidate-dashboard", candidateId],
    queryFn: async () => {
      if (!candidateId) throw new Error("No candidate ID");
      const result = await dashboardApi.getCandidateDashboard(candidateId);
      return result.dashboard;
    },
    enabled: !!candidateId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get paginated supporters list with filters
 */
export function useCandidateSupporters(options?: {
  page?: number;
  pageSize?: number;
  ward?: string;
  lga?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  const candidateId = useCandidateId();

  return useQuery({
    queryKey: [
      "candidate-supporters",
      candidateId,
      options?.page,
      options?.pageSize,
      options?.ward,
      options?.lga,
      options?.search,
      options?.startDate,
      options?.endDate,
    ],
    queryFn: async () => {
      if (!candidateId) throw new Error("No candidate ID");
      const result = await dashboardApi.getCandidateSupporters(
        candidateId,
        options,
      );
      return result;
    },
    enabled: !!candidateId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
}

/**
 * Hook to get ward breakdown data
 */
export function useCandidateWardData() {
  const candidateId = useCandidateId();

  return useQuery({
    queryKey: ["candidate-ward-data", candidateId],
    queryFn: async () => {
      if (!candidateId) throw new Error("No candidate ID");
      const result = await dashboardApi.getCandidateWardData(candidateId);
      return result.wardData;
    },
    enabled: !!candidateId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get survey response analytics
 */
export function useCandidateSurveyResponses() {
  const candidateId = useCandidateId();

  return useQuery({
    queryKey: ["candidate-survey-responses", candidateId],
    queryFn: async () => {
      if (!candidateId) throw new Error("No candidate ID");
      const result =
        await dashboardApi.getCandidateSurveyResponses(candidateId);
      return result.surveyAnalytics;
    },
    enabled: !!candidateId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get demographic breakdown
 */
export function useCandidateDemographics() {
  const candidateId = useCandidateId();

  return useQuery({
    queryKey: ["candidate-demographics", candidateId],
    queryFn: async () => {
      if (!candidateId) throw new Error("No candidate ID");
      const result = await dashboardApi.getCandidateDemographics(candidateId);
      return result.demographics;
    },
    enabled: !!candidateId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get candidate profile information
 */
export function useCandidateProfile() {
  const candidateId = useCandidateId();

  return useQuery({
    queryKey: ["candidate-profile", candidateId],
    queryFn: async () => {
      if (!candidateId) throw new Error("No candidate ID");
      const result = await candidateApi.getCandidateById(candidateId);
      return result.candidate;
    },
    enabled: !!candidateId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to get candidate survey
 */
export function useCandidateSurvey() {
  const candidateId = useCandidateId();

  return useQuery({
    queryKey: ["candidate-survey", candidateId],
    queryFn: async () => {
      if (!candidateId) throw new Error("No candidate ID");
      const result = await candidateApi.getCandidateSurvey(candidateId);
      return result.survey;
    },
    enabled: !!candidateId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get survey by survey ID
 */
export function useSurveyById(surveyId: string | null) {
  return useQuery({
    queryKey: ["survey", surveyId],
    queryFn: async () => {
      if (!surveyId) throw new Error("No survey ID");
      const result = await candidateApi.getSurveyById(surveyId);
      return result.survey;
    },
    enabled: !!surveyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get registration trends for a specific period
 */
export function useCandidateRegistrationTrends(
  period: "daily" | "weekly" | "monthly" = "daily",
) {
  const candidateId = useCandidateId();

  return useQuery({
    queryKey: ["candidate-registration-trends", candidateId, period],
    queryFn: async () => {
      if (!candidateId) throw new Error("No candidate ID");
      const { getRegistrationTrends } =
        await import("@/lib/helpers/voter-analytics");
      return getRegistrationTrends(candidateId, period);
    },
    enabled: !!candidateId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Export candidateId hook for use in components that need it directly
 */
export { useCandidateId };
