"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  HiUser,
  HiExclamationCircle,
  HiRefresh,
  HiLockClosed,
} from "react-icons/hi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useRegistrationStore } from "@/stores/registration-store";
import { generateRegistrationId } from "@/lib/schemas/registration-schemas";
import { toast } from "sonner";
import { voterApi } from "@/lib/api/voter";
import { candidateApi } from "@/lib/api/candidate";
import type { Voter } from "@/types/voter";
import { ProfileHeader } from "@/components/voter/profile/profile-header";
import {
  ProfileNavigation,
  TabContent,
} from "@/components/voter/profile/profile-navigation";
import { DashboardTab } from "@/components/voter/profile/dashboard-tab";
import { EditProfileTab } from "@/components/voter/profile/edit-profile-tab";
import { SurveysTab } from "@/components/voter/profile/surveys-tab";
import { UpdatesTab } from "@/components/voter/profile/updates-tab";
import { SettingsTab } from "@/components/voter/profile/settings-tab";

/**
 * TODO: [BACKEND] Session management
 * - Implement proper JWT/session token validation
 * - Add refresh token logic for long sessions
 * - Handle session expiry gracefully (redirect to login)
 */

/**
 * TODO: [BACKEND] Real-time updates
 * - Consider WebSocket/SSE for live notifications
 * - Sync notifications from candidate dashboard
 * - Push new surveys when candidates create them
 */

/**
 * TODO: [SECURITY] Rate limiting
 * - Implement client-side rate limiting for API calls
 * - Show friendly message when rate limited
 * - Back off exponentially on repeated failures
 */

/**
 * Mocked client-side router.
 * TODO: [FRONTEND] Replace with Next.js useRouter in production
 */
const useMockRouter = () => {
  return {
    push: (path: string) => {
      window.location.href = path;
    },
    replace: (path: string) => {
      window.location.replace(path);
    },
  };
};

/**
 * Authentication check hook.
 * Checks if user has valid registration data in localStorage.
 *
 * TODO: [SECURITY] Strengthen auth check
 * - Validate session token with server on mount
 * - Handle token expiry
 * - Implement proper logout on invalid session
 */
const useAuthCheck = () => {
  const { payload } = useRegistrationStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const stored = localStorage.getItem("wardwise-registration");
        const parsed = stored ? JSON.parse(stored) : null;
        const storedNIN = parsed?.state?.payload?.nin;
        const storedBasic = parsed?.state?.payload?.basic?.firstName;

        const hasNIN = !!payload.nin || !!storedNIN;
        const hasBasicData =
          !!(payload.basic?.firstName && payload.location?.state) ||
          !!storedBasic;

        setIsAuthenticated(hasNIN || hasBasicData);
      } catch {
        const hasNIN = !!payload.nin;
        const hasBasicData = !!(
          payload.basic?.firstName && payload.location?.state
        );
        setIsAuthenticated(hasNIN || hasBasicData);
      } finally {
        setIsHydrated(true);
      }
    };

    checkAuth();
  }, [payload.nin, payload.basic?.firstName, payload.location?.state]);

  return { isAuthenticated, isHydrated };
};

/**
 * Calculate days remaining in edit window.
 * Edit window is 7 days from registration.
 *
 * TODO: [BACKEND] Server-side validation
 * - Don't trust client-side calculation for actual edits
 * - Server should validate edit window on every update request
 */
function calculateDaysRemaining(registrationDate?: string): number {
  if (!registrationDate) return 7; // Default to 7 days for new registrations

  const regDate = new Date(registrationDate);
  const today = new Date();
  const diffTime = today.getTime() - regDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const remaining = 7 - diffDays;

  return remaining > 0 ? remaining : 0;
}

export function VoterProfile() {
  const router = useMockRouter();
  const { payload, reset, update } = useRegistrationStore();
  const { isAuthenticated, isHydrated } = useAuthCheck();

  /**
   * Fetch voter data from API
   *
   * TODO: [BACKEND] Voter profile endpoint
   * - GET /api/voters/:nin/profile
   * - Should return full voter details including:
   *   - Personal info
   *   - Location
   *   - Candidate selections
   *   - Registration date
   *   - Edit window status
   */
  const {
    data: voterData,
    isLoading: isLoadingVoter,
    error: voterError,
    refetch: refetchVoter,
  } = useQuery({
    queryKey: ["voter-profile", payload.nin],
    queryFn: async (): Promise<Voter | null> => {
      if (!payload.nin) return null;
      const result = await voterApi.getUserProfile(payload.nin);
      return result.voter;
    },
    enabled: !!payload.nin,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  /**
   * Get candidate IDs from selections
   *
   * TODO: [EDGE CASE] Orphaned candidates
   * - What if a candidate is removed from ballot?
   * - Should show "Candidate no longer available" instead of crashing
   * - May need to prompt user to select replacement
   */
  const candidateIds =
    payload.candidates?.selections?.map((s) => s.candidateId) || [];

  /**
   * Fetch candidate data
   *
   * TODO: [BACKEND] Batch candidate fetch
   * - GET /api/candidates/batch?ids=x,y,z
   * - Should handle missing candidates gracefully
   */
  const { data: candidatesData, isLoading: isLoadingCandidates } = useQuery({
    queryKey: ["candidates-multi", candidateIds],
    queryFn: async () => {
      if (candidateIds.length === 0) return { candidates: [] };
      return await candidateApi.getCandidatesByIds(candidateIds);
    },
    enabled: candidateIds.length > 0,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  /**
   * Sync voter data to Zustand store
   *
   * TODO: [OPTIMIZATION] Selective updates
   * - Only update fields that changed
   * - Prevent unnecessary re-renders
   */
  useEffect(() => {
    if (voterData) {
      update({
        nin: voterData.nin,
        phone: voterData.phoneNumber,
        basic: {
          role: voterData.role || "voter",
          firstName: voterData.firstName,
          middleName: voterData.middleName,
          lastName: voterData.lastName,
          email: voterData.email || "",
          dateOfBirth: voterData.dateOfBirth,
          age: voterData.age,
          gender: voterData.gender,
          occupation: voterData.occupation,
          religion: voterData.religion,
          vin: voterData.vin,
        },
        location: {
          state: voterData.state,
          lga: voterData.lga,
          ward: voterData.ward,
          pollingUnit: voterData.pollingUnit,
        },
        candidates: voterData.candidateSelections
          ? { selections: voterData.candidateSelections }
          : undefined,
      });
    }
  }, [voterData, update]);

  // Derived values
  const fullName = `${
    payload.basic?.firstName || ""
  } ${payload.basic?.lastName || ""}`.trim();

  const actualRegistrationDate =
    voterData?.registrationDate || payload.basic?.dateOfBirth;

  const registrationDate = actualRegistrationDate
    ? new Date(actualRegistrationDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recently";

  const daysRemaining = calculateDaysRemaining(
    voterData?.registrationDate || actualRegistrationDate,
  );
  const canEdit = daysRemaining > 0;

  /**
   * TODO: [FEATURE] Election period lockdown
   * - During active election, ALL edits should be locked
   * - Should show special message explaining why
   * - Requires checking election status from backend
   */

  // Handlers
  const handleLogout = () => {
    reset();
    toast.success("Logged out successfully");
    setTimeout(() => {
      router.push("/voter-login");
    }, 500);
  };

  const handleRetry = () => {
    refetchVoter();
  };

  /**
   * Handle profile save
   *
   * TODO: [BACKEND] Update profile API
   * - PATCH /api/voters/:nin/profile
   * - Validate edit window server-side
   * - Return updated voter data
   * - Log change in audit trail
   */
  const handleProfileSave = async (data: {
    email?: string;
    phone?: string;
    occupation?: string;
  }) => {
    // In production, call API here
    console.log("Saving profile:", data);

    // Update local state optimistically
    update({
      basic: {
        role: payload.basic?.role ?? "voter",
        firstName: payload.basic?.firstName ?? "",
        lastName: payload.basic?.lastName ?? "",
        dateOfBirth: payload.basic?.dateOfBirth ?? "",
        age: payload.basic?.age ?? 0,
        email: data.email ?? payload.basic?.email ?? "",
        occupation: data.occupation ?? payload.basic?.occupation ?? "",
        middleName: payload.basic?.middleName,
        gender: payload.basic?.gender,
        religion: payload.basic?.religion,
        vin: payload.basic?.vin,
      },
      phone: data.phone ?? payload.phone ?? "",
    });
  };

  // Loading state
  const isLoading = !isHydrated || isLoadingVoter || isLoadingCandidates;

  /**
   * TODO: [EDGE CASE] Notification counts
   * - Should come from API, not hardcoded
   * - Sync with candidate dashboard notifications
   */
  const surveyBadge = 2; // Hardcoded for demo
  const updatesBadge = 2; // Hardcoded for demo

  // ========== RENDER STATES ==========

  // 1. Unauthenticated State
  if (isHydrated && !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border-border/60 bg-card relative max-w-sm overflow-hidden border p-8 text-center"
        >
          <div className="border-primary absolute top-0 left-0 size-4 border-t border-l" />
          <div className="border-primary absolute top-0 right-0 size-4 border-t border-r" />

          <div className="bg-muted/50 mx-auto mb-5 flex size-16 items-center justify-center rounded-xl">
            <HiLockClosed className="text-muted-foreground size-8" />
          </div>
          <h2 className="text-foreground mb-1 text-lg font-bold">
            Authentication Required
          </h2>
          <p className="text-muted-foreground font-mono text-[10px] font-medium tracking-widest uppercase">
            Access Control <span className="text-primary/40 mx-1">|</span>{" "}
            <span className="text-foreground font-bold">Protected</span>
          </p>
          <p className="text-muted-foreground mt-4 mb-6 text-xs">
            Please log in to view your voter profile.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => router.push("/voter-login")}
              className="h-10 gap-2 rounded-lg text-[10px] font-bold tracking-widest uppercase"
            >
              <HiUser className="size-4" />
              Go to Login
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="h-10 rounded-lg text-[10px] font-bold tracking-widest uppercase"
            >
              Go Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. Error State
  if (voterError) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-4">
        <Alert className="border-destructive/20 bg-destructive/5">
          <HiExclamationCircle className="text-destructive size-4" />
          <AlertDescription className="text-destructive text-sm">
            Failed to load profile. Please check your connection and try again.
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button
            onClick={handleRetry}
            className="h-10 gap-2 rounded-lg text-[10px] font-bold tracking-widest uppercase"
          >
            <HiRefresh className="size-4" />
            Retry
          </Button>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="h-10 rounded-lg text-[10px] font-bold tracking-widest uppercase"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // 3. Main Profile View
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Profile Header */}
      <ProfileHeader
        fullName={fullName || "Voter"}
        state={payload.location?.state || "Nigeria"}
        registrationId={generateRegistrationId(payload) || "WW-XXXXXX"}
        registrationDate={registrationDate}
        daysRemaining={daysRemaining}
        isLoading={isLoading}
        role={payload.basic?.role}
        vin={payload.basic?.vin}
        canvasserCode={payload.canvasser?.canvasserCode}
      />

      {/* Navigation & Content */}
      <ProfileNavigation
        defaultValue="dashboard"
        surveyBadge={surveyBadge}
        updatesBadge={updatesBadge}
      >
        <TabContent value="dashboard">
          <DashboardTab
            payload={payload}
            candidatesData={candidatesData}
            isLoading={isLoading}
            isLoadingVoter={isLoadingVoter}
            isLoadingCandidates={isLoadingCandidates}
            canEdit={canEdit}
            fullName={fullName}
          />
        </TabContent>

        <TabContent value="edit">
          <EditProfileTab
            payload={payload}
            canEdit={canEdit}
            daysRemaining={daysRemaining}
            onSave={handleProfileSave}
          />
        </TabContent>

        <TabContent value="surveys">
          <SurveysTab />
        </TabContent>

        <TabContent value="updates">
          <UpdatesTab />
        </TabContent>

        <TabContent value="settings">
          <SettingsTab onLogout={handleLogout} />
        </TabContent>
      </ProfileNavigation>
    </div>
  );
}
