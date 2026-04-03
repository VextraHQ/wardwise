import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGeoApi } from "@/lib/api/geo";

// === Query Hooks ===

// Fetches overall database counts (LGAs, Wards, PUs) for the geo matrix dashboard.
export function useGeoStats() {
  return useQuery({
    queryKey: ["admin", "geo", "stats"],
    queryFn: async () => {
      const data = await adminGeoApi.getStats();
      return data.stats;
    },
    staleTime: 1000 * 60 * 2,
  });
}

// Fetches a paginated, filterable list of LGAs for a selected state.
export function useGeoLgas(
  stateCode: string | null,
  params?: { page?: number; pageSize?: number; search?: string },
) {
  return useQuery({
    queryKey: ["admin", "geo", "lgas", stateCode, params],
    queryFn: () => adminGeoApi.getLgas({ stateCode: stateCode!, ...params }),
    enabled: !!stateCode,
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev,
  });
}

// Fetches a paginated, filterable list of Wards under a selected LGA.
export function useGeoWards(
  lgaId: number | null,
  params?: { page?: number; pageSize?: number; search?: string },
) {
  return useQuery({
    queryKey: ["admin", "geo", "wards", lgaId, params],
    queryFn: () => adminGeoApi.getWards({ lgaId: lgaId!, ...params }),
    enabled: !!lgaId,
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev,
  });
}

// Fetches a paginated, filterable list of Polling Units under a selected Ward.
export function useGeoPollingUnits(
  wardId: number | null,
  params?: { page?: number; pageSize?: number; search?: string },
) {
  return useQuery({
    queryKey: ["admin", "geo", "polling-units", wardId, params],
    queryFn: () => adminGeoApi.getPollingUnits({ wardId: wardId!, ...params }),
    enabled: !!wardId,
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev,
  });
}

// Analyzes the cascading deletion impact (how many children will be lost) for a node.
export function useGeoImpact(type: string | null, id: number | null) {
  return useQuery({
    queryKey: ["admin", "geo", "impact", type, id],
    queryFn: () => adminGeoApi.getImpact(type!, id!),
    enabled: !!type && !!id,
  });
}

// === Mutation Hooks ===

// Creates a new Local Government Area entity.
export function useCreateLga() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; stateCode: string }) =>
      adminGeoApi.createLga(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "geo"] });
    },
  });
}

// Updates the metadata properties (name, code) of an existing LGA.
export function useUpdateLga() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name?: string; stateCode?: string };
    }) => adminGeoApi.updateLga(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "geo"] });
    },
  });
}

// Permanently deletes an LGA and purges all cascading Wards and Polling Units.
export function useDeleteLga() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminGeoApi.deleteLga(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "geo"] });
    },
  });
}

// Creates a new Ward entity under a specific LGA parent.
export function useCreateWard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { code?: string; name: string; lgaId: number }) =>
      adminGeoApi.createWard(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "geo"] });
    },
  });
}

// Updates the metadata properties (name) of an existing Ward.
export function useUpdateWard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { code?: string; name?: string };
    }) => adminGeoApi.updateWard(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "geo"] });
    },
  });
}

// Permanently deletes a Ward and purges all cascading Polling Units.
export function useDeleteWard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminGeoApi.deleteWard(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "geo"] });
    },
  });
}

// Creates a new Polling Unit entity under a specific Ward parent.
export function useCreatePollingUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { code: string; name: string; wardId: number }) =>
      adminGeoApi.createPollingUnit(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "geo"] });
    },
  });
}

// Updates the metadata properties (name, code) of an existing Polling Unit.
export function useUpdatePollingUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { code?: string; name?: string };
    }) => adminGeoApi.updatePollingUnit(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "geo"] });
    },
  });
}

// Permanently deletes a specific Polling Unit entity.
export function useDeletePollingUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminGeoApi.deletePollingUnit(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "geo"] });
    },
  });
}

// === Bulk Import Hooks ===

// Runs pre-flight validation checks on bulk parsed CSV spreadsheet data.
export function useGeoImportPreview() {
  return useMutation({
    mutationFn: (data: { level: string; rows: Record<string, string>[] }) =>
      adminGeoApi.importPreview(data),
  });
}

// Commits clean spreadsheet data to the database in bulk and refreshes the geo-matrix.
export function useGeoImportCommit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { level: string; rows: Record<string, string>[] }) =>
      adminGeoApi.importCommit(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "geo"] });
    },
  });
}
