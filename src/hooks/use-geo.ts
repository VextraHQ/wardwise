import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGeoApi } from "@/lib/api/geo";

// === Query Hooks ===
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

export function useGeoImpact(type: string | null, id: number | null) {
  return useQuery({
    queryKey: ["admin", "geo", "impact", type, id],
    queryFn: () => adminGeoApi.getImpact(type!, id!),
    enabled: !!type && !!id,
  });
}

// === Mutation Hooks ===
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

export function useDeleteLga() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminGeoApi.deleteLga(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "geo"] });
    },
  });
}

export function useCreateWard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; lgaId: number }) =>
      adminGeoApi.createWard(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "geo"] });
    },
  });
}

export function useUpdateWard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string } }) =>
      adminGeoApi.updateWard(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "geo"] });
    },
  });
}

export function useDeleteWard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminGeoApi.deleteWard(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "geo"] });
    },
  });
}

export function useCreatePollingUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { code?: string; name: string; wardId: number }) =>
      adminGeoApi.createPollingUnit(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "geo"] });
    },
  });
}

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
export function useGeoImportPreview() {
  return useMutation({
    mutationFn: (data: { level: string; rows: Record<string, string>[] }) =>
      adminGeoApi.importPreview(data),
  });
}

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
