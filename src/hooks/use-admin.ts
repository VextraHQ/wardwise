import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminApi,
  type CreateCandidateData,
  type UpdateCandidateData,
} from "@/lib/api/admin";

// === Query Hooks ===

// Fetches all candidate accounts for the admin dashboard and management list.
export function useAdminCandidates() {
  return useQuery({
    queryKey: ["admin", "candidates"],
    queryFn: () => adminApi.candidates.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Platform-wide period summary for the admin command-center strip and health rail.
export function useAdminDashboardSummary() {
  return useQuery({
    queryKey: ["admin", "dashboard-summary"],
    queryFn: () => adminApi.dashboard.getSummary(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// === Mutation Hooks ===

// Creates a new candidate account and refreshes the candidates list.
export function useCreateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCandidateData) => adminApi.candidates.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "candidates"] });
    },
  });
}

// Updates a candidate's profile fields (name, party, position, etc.).
export function useUpdateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCandidateData) => adminApi.candidates.update(data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["admin", "candidates", variables.id],
      });
      qc.invalidateQueries({ queryKey: ["admin", "candidates"] });
      qc.invalidateQueries({ queryKey: ["admin-campaigns"] });
      qc.invalidateQueries({ queryKey: ["admin-campaign"] });
    },
  });
}

// Updates a candidate's onboarding status (pending → active → suspended, etc.).
export function useUpdateCandidateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.candidates.update({ id, onboardingStatus: status }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["admin", "candidates", variables.id],
      });
      qc.invalidateQueries({ queryKey: ["admin", "candidates"] });
    },
  });
}

// Permanently deletes a candidate account and all associated data.
export function useDeleteCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.candidates.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "candidates"] });
    },
  });
}

// Issues a fresh secure reset link for a candidate account.
export function useResetCandidatePassword() {
  return useMutation({
    mutationFn: (id: string) => adminApi.candidates.resetPassword(id),
  });
}
