import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { dashboardApi } from "@/lib/api/candidate-dashboard";
import { candidateApi } from "@/lib/api/candidate";

// Reads candidateId from the active NextAuth session. Returns null if unauthenticated.
function useCandidateId(): string | null {
  const { data: session } = useSession();
  return session?.user?.candidateId || null;
}

// Fetches all key dashboard metrics (supporters, ward coverage, demographics, trends) for the logged-in candidate.
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

// Fetches a paginated, filterable supporters list for the candidate.
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

// Fetches a breakdown of supporter counts grouped by ward.
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

// Fetches a demographic breakdown (age, gender, etc.) of the candidate's supporters.
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

// Fetches the candidate's own profile information from the database.
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

// Fetches registration activity trends over a given period (daily/weekly/monthly).
export function useCandidateRegistrationTrends(
  period: "daily" | "weekly" | "monthly" = "daily",
) {
  const candidateId = useCandidateId();

  return useQuery({
    queryKey: ["candidate-registration-trends", candidateId, period],
    queryFn: async () => {
      if (!candidateId) throw new Error("No candidate ID");
      const { getRegistrationTrends } =
        await import("@/lib/candidate/analytics");
      return getRegistrationTrends(candidateId, period);
    },
    enabled: !!candidateId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export { useCandidateId };
