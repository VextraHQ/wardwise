import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminApi,
  type CandidateWithUser,
  type ChangeAdminPasswordData,
  type CreateCandidateData,
  type DeleteCandidateData,
  type RequestAdminEmailChangeData,
  type UpdateAdminProfileData,
  type UpdateCandidateData,
} from "@/features/admin-shell/api/admin-api";

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

/** Single candidate for detail routes and admin chrome (shared query key with `CandidateDetail`). */
export function useAdminCandidate(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "candidates", id],
    queryFn: () => adminApi.candidates.getById(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60,
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

// Sync candidate caches to ensure data consistency across components.
export function syncCandidateCaches(
  qc: ReturnType<typeof useQueryClient>,
  candidate: CandidateWithUser,
) {
  qc.setQueryData(["admin", "candidates", candidate.id], candidate);
  qc.setQueryData(
    ["admin", "candidates"],
    (current: CandidateWithUser[] | undefined) =>
      current?.map((item) => (item.id === candidate.id ? candidate : item)) ??
      current,
  );
}

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
    onSuccess: (data, variables) => {
      syncCandidateCaches(qc, data);
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
    onSuccess: (data, variables) => {
      syncCandidateCaches(qc, data);
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
    mutationFn: ({ id, confirmationEmail }: DeleteCandidateData) =>
      adminApi.candidates.delete(id, confirmationEmail),
    onSuccess: (_data, variables) => {
      qc.removeQueries({
        queryKey: ["admin", "candidates", variables.id],
      });
      qc.invalidateQueries({ queryKey: ["admin", "candidates"] });
      qc.invalidateQueries({ queryKey: ["admin-campaigns"] });
    },
  });
}

// Issues a fresh secure reset link for a candidate account.
export function useResetCandidatePassword() {
  return useMutation({
    mutationFn: (id: string) => adminApi.candidates.resetPassword(id),
  });
}

// === Admin self-service account ===

const ADMIN_ACCOUNT_KEY = ["admin", "account"] as const;

// Loads the current admin's account, pending email change (if any), and recent activity.
export function useAdminAccount() {
  return useQuery({
    queryKey: ADMIN_ACCOUNT_KEY,
    queryFn: () => adminApi.account.get(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// Updates the signed-in admin's display name. Stays in-session.
export function useUpdateAdminProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAdminProfileData) =>
      adminApi.account.updateProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_ACCOUNT_KEY });
    },
  });
}

// Issues an email-change confirmation link to the new address.
export function useRequestAdminEmailChange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RequestAdminEmailChangeData) =>
      adminApi.account.requestEmailChange(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_ACCOUNT_KEY });
    },
  });
}

// Cancels the currently pending admin email change and revokes its tokens.
export function useCancelAdminEmailChange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.account.cancelEmailChange(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_ACCOUNT_KEY });
    },
  });
}

// Changes the current admin's password. Forces a re-auth.
export function useChangeAdminPassword() {
  return useMutation({
    mutationFn: (data: ChangeAdminPasswordData) =>
      adminApi.account.changePassword(data),
  });
}
