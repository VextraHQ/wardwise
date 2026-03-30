import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  publicCollectApi,
  adminCollectApi,
  type CampaignStats,
} from "@/lib/api/collect";

// === Public Hooks ===
export function usePublicCampaign(slug: string) {
  return useQuery({
    queryKey: ["public-campaign", slug],
    queryFn: async () => {
      const data = await publicCollectApi.getCampaign(slug);
      return data.campaign;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCampaignLgas(campaignSlug: string) {
  return useQuery({
    queryKey: ["campaign-lgas", campaignSlug],
    queryFn: async () => {
      const data = await publicCollectApi.getLgas(campaignSlug);
      return data.lgas;
    },
    enabled: !!campaignSlug,
    staleTime: 1000 * 60 * 10,
  });
}

export function useWards(lgaId: number | undefined) {
  return useQuery({
    queryKey: ["wards", lgaId],
    queryFn: async () => {
      const data = await publicCollectApi.getWards(lgaId!);
      return data.wards;
    },
    enabled: !!lgaId,
    staleTime: 1000 * 60 * 10,
  });
}

export function usePollingUnits(wardId: number | undefined) {
  return useQuery({
    queryKey: ["polling-units", wardId],
    queryFn: async () => {
      const data = await publicCollectApi.getPollingUnits(wardId!);
      return data.pollingUnits;
    },
    enabled: !!wardId,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSubmitRegistration() {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      publicCollectApi.submit(data),
  });
}

// === Admin Hooks ===
export function useCampaigns() {
  return useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const data = await adminCollectApi.getCampaigns();
      return data.campaigns;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ["admin-campaign", id],
    queryFn: async () => {
      const data = await adminCollectApi.getCampaign(id);
      return data.campaign;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      adminCollectApi.createCampaign(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-campaigns"] });
    },
  });
}

export function useUpdateCampaign(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      adminCollectApi.updateCampaign(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-campaigns"] });
      qc.invalidateQueries({ queryKey: ["admin-campaign", id] });
    },
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminCollectApi.deleteCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-campaigns"] });
    },
  });
}

export function useCampaignSubmissions(
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
) {
  return useQuery({
    queryKey: ["campaign-submissions", campaignId, params],
    queryFn: () => adminCollectApi.getSubmissions(campaignId, params),
    enabled: !!campaignId,
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev,
  });
}

export function useDeleteSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sid: string) => adminCollectApi.deleteSubmission(sid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaign-submissions"] });
    },
  });
}

export function useUpdateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sid,
      data,
    }: {
      sid: string;
      data: { isFlagged?: boolean; adminNotes?: string; isVerified?: boolean };
    }) => adminCollectApi.updateSubmission(sid, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaign-submissions"] });
    },
  });
}

export function useCampaignStats(campaignId: string) {
  return useQuery<CampaignStats>({
    queryKey: ["campaign-stats", campaignId],
    queryFn: () => adminCollectApi.getCampaignStats(campaignId),
    enabled: !!campaignId,
    staleTime: 1000 * 60,
  });
}

export function useCampaignCanvassers(campaignId: string) {
  return useQuery({
    queryKey: ["campaign-canvassers", campaignId],
    queryFn: async () => {
      const data = await adminCollectApi.getCanvassers(campaignId);
      return data.canvassers;
    },
    enabled: !!campaignId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAllLgas() {
  return useQuery({
    queryKey: ["all-lgas"],
    queryFn: async () => {
      const data = await adminCollectApi.getAllLgas();
      return data.lgas;
    },
    staleTime: 1000 * 60 * 30,
  });
}
