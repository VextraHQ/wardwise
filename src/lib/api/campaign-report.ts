import type {
  CampaignReportSubmissionsResponse,
  CampaignReportSummary,
} from "@/types/campaign-report";

export type CampaignReportSummaryParams = {
  from?: string;
  to?: string;
  lga?: string;
  role?: string;
};

export type CampaignReportSubmissionsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  from?: string;
  to?: string;
  lga?: string;
  role?: string;
};

async function campaignReportApiCall<T>(
  token: string,
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`/api/campaign-report/${token}${endpoint}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Error: ${response.statusText}`);
  }

  return response.json();
}

function qs(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") sp.append(key, String(value));
  });
  const query = sp.toString();
  return query ? `?${query}` : "";
}

export const campaignReportApi = {
  unlock: (token: string, passcode: string) =>
    campaignReportApiCall<{ ok: true }>(token, "/unlock", {
      method: "POST",
      body: JSON.stringify({ passcode }),
    }),

  getSummary: (token: string, params?: CampaignReportSummaryParams) =>
    campaignReportApiCall<CampaignReportSummary>(
      token,
      `/summary${qs({
        from: params?.from,
        to: params?.to,
        lga: params?.lga,
        role: params?.role,
      })}`,
    ),

  getSubmissions: (token: string, params?: CampaignReportSubmissionsParams) =>
    campaignReportApiCall<CampaignReportSubmissionsResponse>(
      token,
      `/submissions${qs({
        page: params?.page,
        pageSize: params?.pageSize,
        search: params?.search,
        status: params?.status,
        from: params?.from,
        to: params?.to,
        lga: params?.lga,
        role: params?.role,
      })}`,
    ),

  exportUrl: (
    token: string,
    params?: {
      format?: "csv" | "xlsx";
      redacted?: boolean;
      search?: string;
      status?: string;
    },
  ) =>
    `/api/campaign-report/${token}/export${qs({
      format: params?.format || "csv",
      redacted: params?.redacted ? "true" : undefined,
      search: params?.search,
      status: params?.status,
    })}`,
};
