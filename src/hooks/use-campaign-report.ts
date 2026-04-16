import { useMutation, useQuery } from "@tanstack/react-query";
import {
  campaignReportApi,
  type CampaignReportSubmissionsParams,
  type CampaignReportSummaryParams,
} from "@/lib/api/campaign-report";

export function useCampaignReportSummary(
  token: string,
  params?: CampaignReportSummaryParams,
) {
  return useQuery({
    queryKey: [
      "campaign-report-summary",
      token,
      params?.from,
      params?.to,
      params?.lga,
      params?.role,
    ],
    queryFn: () => campaignReportApi.getSummary(token, params),
    enabled: !!token,
    staleTime: 1000 * 60, // 1 minute
    placeholderData: (previous) => previous,
  });
}

export function useCampaignReportSubmissions(
  token: string,
  params?: CampaignReportSubmissionsParams,
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
