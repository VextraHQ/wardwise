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

// Filters for listing submissions (pagination & search)
export type SubmissionListFilters = {
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
};

// Used for bulk actions on submissions (like bulk verify/delete)
export type BulkSubmissionActionInput = {
  action: string;
  ids?: string[];
  campaignId?: string;
  filters?: Omit<SubmissionListFilters, "page" | "pageSize">;
  scope?: "selected" | "filtered";
};

// Helpers

// Used for API calls that don't need to be admin/authenticated
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
    // Try to pull out a helpful detailed error message if there is one
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

// Used for API calls to admin endpoints
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

// Helper to construct a query string from an object
function qs(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") sp.append(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// Get a filename from the "Content-Disposition" header, if available
function parseFilenameFromDisposition(
  disposition: string | null,
): string | undefined {
  if (!disposition) return undefined;
  // Try to parse an UTF-8 filename (RFC 5987)
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
  // Fallback to plain filename
  const basicMatch = disposition.match(/filename="?([^"]+)"?/i);
  return basicMatch?.[1];
}

// Handles downloading a file response, given a fetch Response and fallback filename
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

// Public API methods (for general users)
export const publicCollectApi = {
  // Get the details of a campaign using the slug
  getCampaign: (slug: string) =>
    publicApiCall<{ campaign: PublicCampaign }>(`/campaign/${slug}`),

  // Get list of LGAs for a campaign
  getLgas: (campaignSlug: string) =>
    publicApiCall<{ lgas: GeoLga[] }>(`/lgas?campaignSlug=${campaignSlug}`),

  // Get list of wards for a given LGA
  getWards: (lgaId: number) =>
    publicApiCall<{ wards: GeoWard[] }>(`/wards?lgaId=${lgaId}`),

  // Get the polling units for a ward
  getPollingUnits: (wardId: number) =>
    publicApiCall<{ pollingUnits: GeoPollingUnit[] }>(
      `/units?wardId=${wardId}`,
    ),

  // Submit a new record (e.g. field data)
  submit: (data: Record<string, unknown>) =>
    publicApiCall<{ submission: { id: string }; count: number }>("/submit", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Download data needed for offline usage in an LGA
  getOfflinePack: (params: { campaignSlug: string; lgaIds: number[] }) =>
    publicApiCall<{
      campaignUpdatedAt: string;
      lgas: GeoLga[];
      wards: GeoWard[];
      pollingUnits: GeoPollingUnit[];
    }>("/offline-pack", {
      method: "POST",
      body: JSON.stringify(params),
    }),
};

// Admin API methods (for managing everything)
export const adminCollectApi = {
  // ----- Campaign Management -----
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
    adminApiCall<{ campaign: Campaign; clientReportPasscode?: string }>(
      `/campaigns/${id}`,
      { method: "PATCH", body: JSON.stringify(data) },
    ),

  // Generate a new token for viewing reports for this campaign
  regenerateReportToken: (id: string) =>
    adminApiCall<{ clientReportToken: string }>(
      `/campaigns/${id}/campaign-report/regenerate`,
      { method: "POST" },
    ),

  // Reset the client passcode for reports
  resetReportPasscode: (id: string) =>
    adminApiCall<{ passcode: string }>(
      `/campaigns/${id}/campaign-report/reset-passcode`,
      { method: "POST" },
    ),

  // Delete a campaign
  deleteCampaign: (id: string) =>
    adminApiCall<void>(`/campaigns/${id}`, { method: "DELETE" }),

  // ----- Submissions Management -----
  // List submissions, support filtering & pagination
  getSubmissions: (campaignId: string, params?: SubmissionListFilters) =>
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

  // Update a single submission (e.g. verify/flag/note)
  updateSubmission: (
    sid: string,
    data: { isFlagged?: boolean; adminNotes?: string; isVerified?: boolean },
  ) =>
    adminApiCall<{ submission: CollectSubmission }>(`/submissions/${sid}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Delete a single submission
  deleteSubmission: (sid: string) =>
    adminApiCall<{ success: boolean }>(`/submissions/${sid}`, {
      method: "DELETE",
    }),

  // Do a bulk action (e.g. bulk verify/bulk delete)
  bulkAction: (input: BulkSubmissionActionInput) =>
    adminApiCall<{ affected: number }>("/submissions/bulk", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  // Get the action history / audit trail for a submission
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

  // ----- Export Data -----
  // Export all submission data for a campaign (CSV/XLSX)
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

  // Export the canvasser leaderboard for a campaign
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

  // ----- Canvasser Management -----
  // Get all canvassers for a campaign
  getCanvassers: (campaignId: string) =>
    adminApiCall<{
      preloaded: CampaignCanvasserRecord[];
      canvassers: CanvasserSummary[];
      selfIdentifiedCount: number;
    }>(`/campaigns/${campaignId}/canvassers`),

  // Add a canvasser to a campaign
  addCanvasser: (
    campaignId: string,
    data: { name: string; phone: string; zone?: string },
  ) =>
    adminApiCall<{ canvasser: CampaignCanvasserRecord }>(
      `/campaigns/${campaignId}/canvassers`,
      { method: "POST", body: JSON.stringify(data) },
    ),

  // Remove a canvasser from the campaign
  removeCanvasser: (campaignId: string, canvasserId: string) =>
    adminApiCall<{ success: boolean }>(
      `/campaigns/${campaignId}/canvassers/${canvasserId}`,
      { method: "DELETE" },
    ),

  // ----- Aggregated Stats / Dashboard -----
  // Get campaign summary stats (for graphs etc)
  getCampaignStats: (
    campaignId: string,
    params?: { from?: string; to?: string },
  ) =>
    adminApiCall<CampaignStats>(
      `/campaigns/${campaignId}/stats${qs({ from: params?.from, to: params?.to })}`,
    ),

  // ----- Geo Data (for campaign setup flows) -----
  // Get all LGAs for wizard screens, etc.
  getAllLgas: () => adminApiCall<{ lgas: GeoLga[] }>("/lgas"),
};

// Shape of statistics data returned for a campaign
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
