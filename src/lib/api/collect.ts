import type {
  Campaign,
  CampaignSummary,
  CollectSubmission,
  PublicCampaign,
  GeoLga,
  GeoWard,
  GeoPollingUnit,
  CanvasserSummary,
} from "@/types/collect";

// --- Helpers ---
async function publicApiCall<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`/api/collect${endpoint}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Error: ${response.statusText}`);
  }
  return response.json();
}

async function adminApiCall<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`/api/admin/collect${endpoint}`, {
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
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") sp.append(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// --- Public API ---
export const publicCollectApi = {
  getCampaign: (slug: string) =>
    publicApiCall<{ campaign: PublicCampaign }>(`/campaign/${slug}`),

  getLgas: (campaignSlug: string) =>
    publicApiCall<{ lgas: GeoLga[] }>(`/lgas?campaignSlug=${campaignSlug}`),

  getWards: (lgaId: number) =>
    publicApiCall<{ wards: GeoWard[] }>(`/wards?lgaId=${lgaId}`),

  getPollingUnits: (wardId: number) =>
    publicApiCall<{ pollingUnits: GeoPollingUnit[] }>(
      `/units?wardId=${wardId}`,
    ),

  submit: (data: Record<string, unknown>) =>
    publicApiCall<{ submission: { id: string }; count: number }>("/submit", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// --- Admin API ---
export const adminCollectApi = {
  // Campaigns
  getCampaigns: () =>
    adminApiCall<{ campaigns: CampaignSummary[] }>("/campaigns"),

  getCampaign: (id: string) =>
    adminApiCall<{ campaign: Campaign }>(`/campaigns/${id}`),

  createCampaign: (data: Record<string, unknown>) =>
    adminApiCall<{ campaign: Campaign }>("/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCampaign: (id: string, data: Record<string, unknown>) =>
    adminApiCall<{ campaign: Campaign }>(`/campaigns/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteCampaign: (id: string) =>
    adminApiCall<void>(`/campaigns/${id}`, { method: "DELETE" }),

  // Submissions
  getSubmissions: (
    campaignId: string,
    params?: {
      page?: number;
      pageSize?: number;
      search?: string;
      lgaId?: number;
      wardId?: number;
      role?: string;
      isFlagged?: boolean;
    },
  ) =>
    adminApiCall<{
      submissions: CollectSubmission[];
      total: number;
      page: number;
      pageSize: number;
    }>(
      `/campaigns/${campaignId}/submissions${qs({
        page: params?.page,
        pageSize: params?.pageSize,
        search: params?.search,
        lgaId: params?.lgaId,
        wardId: params?.wardId,
        role: params?.role,
        isFlagged:
          params?.isFlagged !== undefined
            ? String(params.isFlagged)
            : undefined,
      })}`,
    ),

  updateSubmission: (
    sid: string,
    data: { isFlagged?: boolean; adminNotes?: string; isVerified?: boolean },
  ) =>
    adminApiCall<{ submission: CollectSubmission }>(`/submissions/${sid}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteSubmission: (sid: string) =>
    adminApiCall<{ success: boolean }>(`/submissions/${sid}`, {
      method: "DELETE",
    }),

  // Export
  exportCsv: async (campaignId: string) => {
    const response = await fetch(
      `/api/admin/collect/campaigns/${campaignId}/export`,
    );
    if (!response.ok) throw new Error("Export failed");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `submissions-${campaignId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Canvassers
  getCanvassers: (campaignId: string) =>
    adminApiCall<{ canvassers: CanvasserSummary[] }>(
      `/campaigns/${campaignId}/canvassers`,
    ),

  // Geo (all LGAs for campaign wizard)
  getAllLgas: () => adminApiCall<{ lgas: GeoLga[] }>("/lgas"),
};
