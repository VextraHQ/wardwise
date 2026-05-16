import type {
  GeoLga,
  GeoWard,
  GeoPollingUnit,
  GeoStats,
  GeoImpact,
  PaginatedResponse,
  ImportPreviewResponse,
  ImportCommitResponse,
} from "@/types/geo";

async function adminApiCall<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`/api/admin/geo${endpoint}`, {
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

export const adminGeoApi = {
  // Stats
  getStats: () => adminApiCall<{ stats: GeoStats }>("/stats"),

  // LGAs
  getLgas: (params: {
    stateCode: string;
    page?: number;
    pageSize?: number;
    search?: string;
  }) =>
    adminApiCall<PaginatedResponse<GeoLga>>(
      `/lgas${qs({
        stateCode: params.stateCode,
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
      })}`,
    ),

  createLga: (data: { name: string; stateCode: string }) =>
    adminApiCall<{ lga: GeoLga }>("/lgas", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateLga: (id: number, data: { name?: string; stateCode?: string }) =>
    adminApiCall<{ lga: GeoLga }>(`/lgas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteLga: (id: number) =>
    adminApiCall<{ success: boolean }>(`/lgas/${id}`, { method: "DELETE" }),

  // Wards
  getWards: (params: {
    lgaId: number;
    page?: number;
    pageSize?: number;
    search?: string;
  }) =>
    adminApiCall<PaginatedResponse<GeoWard>>(
      `/wards${qs({
        lgaId: params.lgaId,
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
      })}`,
    ),

  createWard: (data: { code?: string; name: string; lgaId: number }) =>
    adminApiCall<{ ward: GeoWard }>("/wards", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateWard: (id: number, data: { code?: string | null; name?: string }) =>
    adminApiCall<{ ward: GeoWard }>(`/wards/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteWard: (id: number) =>
    adminApiCall<{ success: boolean }>(`/wards/${id}`, { method: "DELETE" }),

  // Polling Units
  getPollingUnits: (params: {
    wardId: number;
    page?: number;
    pageSize?: number;
    search?: string;
  }) =>
    adminApiCall<PaginatedResponse<GeoPollingUnit>>(
      `/polling-units${qs({
        wardId: params.wardId,
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
      })}`,
    ),

  createPollingUnit: (data: { code: string; name: string; wardId: number }) =>
    adminApiCall<{ pollingUnit: GeoPollingUnit }>("/polling-units", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updatePollingUnit: (id: number, data: { code?: string; name?: string }) =>
    adminApiCall<{ pollingUnit: GeoPollingUnit }>(`/polling-units/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deletePollingUnit: (id: number) =>
    adminApiCall<{ success: boolean }>(`/polling-units/${id}`, {
      method: "DELETE",
    }),

  // Impact check (pre-delete)
  getImpact: (type: string, id: number) =>
    adminApiCall<{ impact: GeoImpact }>(`/impact${qs({ type, id })}`),

  // Bulk CSV import
  importPreview: (data: { level: string; rows: Record<string, string>[] }) =>
    adminApiCall<ImportPreviewResponse>("/import", {
      method: "POST",
      body: JSON.stringify({ ...data, preview: true }),
    }),

  importCommit: (data: { level: string; rows: Record<string, string>[] }) =>
    adminApiCall<ImportCommitResponse>("/import", {
      method: "POST",
      body: JSON.stringify({ ...data, preview: false }),
    }),
};
