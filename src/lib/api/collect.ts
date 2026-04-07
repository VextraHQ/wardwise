import type {
  Campaign,
  CampaignSummary,
  CollectSubmission,
  PublicCampaign,
  GeoLga,
  GeoWard,
  GeoPollingUnit,
  CanvasserSummary,
  CampaignCanvasserRecord,
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
    const firstDetail =
      error.details && typeof error.details === "object"
        ? Object.values(error.details)
            .flat()
            .find((value) => typeof value === "string" && value.length > 0)
        : undefined;
    const message =
      typeof firstDetail === "string" && firstDetail.length > 0
        ? `${error.error || "Validation failed"}: ${firstDetail}`
        : error.error || `Error: ${response.statusText}`;
    throw new Error(message);
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

function parseFilenameFromDisposition(
  disposition: string | null,
): string | undefined {
  if (!disposition) return undefined;
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
  const basicMatch = disposition.match(/filename="?([^"]+)"?/i);
  return basicMatch?.[1];
}

async function downloadFileResponse(
  response: Response,
  fallbackFilename: string,
): Promise<void> {
  if (!response.ok) {
    throw new Error("Export failed");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download =
    parseFilenameFromDisposition(response.headers.get("Content-Disposition")) ||
    fallbackFilename;
  anchor.click();
  URL.revokeObjectURL(url);
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
      isVerified?: boolean;
      canvasserName?: string;
      canvasserPhone?: string;
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
        isVerified:
          params?.isVerified !== undefined
            ? String(params.isVerified)
            : undefined,
        canvasserName: params?.canvasserName,
        canvasserPhone: params?.canvasserPhone,
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

  bulkAction: (ids: string[], action: string) =>
    adminApiCall<{ affected: number }>("/submissions/bulk", {
      method: "POST",
      body: JSON.stringify({ ids, action }),
    }),

  getSubmissionAudit: (sid: string) =>
    adminApiCall<{
      entries: {
        id: string;
        action: string;
        userId: string;
        userName: string;
        details: string | null;
        createdAt: string;
      }[];
    }>(`/submissions/${sid}/audit`),

  // Export
  exportSubmissions: async (
    campaignId: string,
    filters?: {
      search?: string;
      lgaId?: number;
      wardId?: number;
      role?: string;
      isFlagged?: boolean;
      isVerified?: boolean;
      canvasserName?: string;
      canvasserPhone?: string;
      format?: "csv" | "xlsx";
      redacted?: boolean;
    },
  ) => {
    const params = qs({
      search: filters?.search,
      lgaId: filters?.lgaId,
      wardId: filters?.wardId,
      role: filters?.role,
      isFlagged:
        filters?.isFlagged !== undefined
          ? String(filters.isFlagged)
          : undefined,
      isVerified:
        filters?.isVerified !== undefined
          ? String(filters.isVerified)
          : undefined,
      canvasserName: filters?.canvasserName,
      canvasserPhone: filters?.canvasserPhone,
      format: filters?.format || "csv",
      redacted: filters?.redacted ? "true" : undefined,
    });
    const response = await fetch(
      `/api/admin/collect/campaigns/${campaignId}/export${params}`,
    );
    await downloadFileResponse(
      response,
      `submissions-${campaignId}.${filters?.format || "csv"}`,
    );
  },

  exportCanvasserLeaderboard: async (
    campaignId: string,
    filters?: {
      search?: string;
      format?: "csv" | "xlsx";
    },
  ) => {
    const params = qs({
      search: filters?.search,
      format: filters?.format || "csv",
    });
    const response = await fetch(
      `/api/admin/collect/campaigns/${campaignId}/canvassers/export${params}`,
    );
    await downloadFileResponse(
      response,
      `canvasser-leaderboard-${campaignId}.${filters?.format || "csv"}`,
    );
  },

  // Canvassers
  getCanvassers: (campaignId: string) =>
    adminApiCall<{
      preloaded: CampaignCanvasserRecord[];
      canvassers: CanvasserSummary[];
      selfIdentifiedCount: number;
    }>(`/campaigns/${campaignId}/canvassers`),

  addCanvasser: (
    campaignId: string,
    data: { name: string; phone: string; zone?: string },
  ) =>
    adminApiCall<{ canvasser: CampaignCanvasserRecord }>(
      `/campaigns/${campaignId}/canvassers`,
      { method: "POST", body: JSON.stringify(data) },
    ),

  removeCanvasser: (campaignId: string, canvasserId: string) =>
    adminApiCall<{ success: boolean }>(
      `/campaigns/${campaignId}/canvassers/${canvasserId}`,
      { method: "DELETE" },
    ),

  // Stats (server-side aggregations for overview dashboard)
  getCampaignStats: (
    campaignId: string,
    params?: { from?: string; to?: string },
  ) =>
    adminApiCall<CampaignStats>(
      `/campaigns/${campaignId}/stats${qs({ from: params?.from, to: params?.to })}`,
    ),

  // Geo (all LGAs for campaign wizard)
  getAllLgas: () => adminApiCall<{ lgas: GeoLga[] }>("/lgas"),
};

// Stats response shape
export type CampaignStats = {
  total: number;
  verified: number;
  flagged: number;
  daily: { date: string; count: number; cumulative: number }[];
  byLga: { lga: string; count: number }[];
  byWard: { ward: string; count: number }[];
  byRole: { role: string; count: number }[];
  bySex: { sex: string; count: number }[];
};
