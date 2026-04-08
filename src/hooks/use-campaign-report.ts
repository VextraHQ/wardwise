import { useMutation, useQuery } from "@tanstack/react-query";
import { campaignReportApi } from "@/lib/api/campaign-report";

export function useCampaignReportSummary(token: string) {
  return useQuery({
    queryKey: ["campaign-report-summary", token],
    queryFn: () => campaignReportApi.getSummary(token),
    enabled: !!token,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useCampaignReportSubmissions(
  token: string,
  params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
  },
) {
  return useQuery({
    queryKey: ["campaign-report-submissions", token, params],
    queryFn: () => campaignReportApi.getSubmissions(token, params),
    enabled: !!token,
    staleTime: 1000 * 30, // 30 seconds
    placeholderData: (previous) => previous,
  });
}

export function useUnlockCampaignReport(token: string) {
  return useMutation({
    mutationFn: (passcode: string) => campaignReportApi.unlock(token, passcode),
  });
}
