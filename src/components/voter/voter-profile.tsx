"use client";

import { useEffect, useState } from "react";
// Comment out real next/router navigation for routing mock
// import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  HiUser,
  HiLocationMarker,
  HiUsers,
  HiClipboardList,
  HiCheckCircle,
  HiClock,
  HiShieldCheck,
  HiExclamationCircle,
  HiExternalLink,
  HiRefresh,
  HiLockClosed,
  HiMail,
} from "react-icons/hi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRegistrationStore } from "@/stores/registration-store";
import { generateRegistrationId } from "@/lib/schemas/registration-schemas";
import { toast } from "sonner";
import { voterApi } from "@/lib/api/voter";
import { candidateApi } from "@/lib/api/candidate";
import type { Voter } from "@/types/voter";
import { ProfileHeader } from "@/components/voter/profile/profile-header";
import {
  ProfileInfoCard,
  InfoRow,
} from "@/components/voter/profile/profile-info-card";
import { ProfileTabs } from "@/components/voter/profile/profile-tabs";
import { TabsContent } from "@/components/ui/tabs";

/**
 * MOCKED CLIENT SIDE ROUTER.
 * This is a mock implementation for router.push and router.replace.
 * It does nothing, so .push("/") won't actually navigate.
 * The shape matches Next.js useRouter for compatibility.
 */
const useMockRouter = () => {
  return {
    push: (_: string) => {},
    replace: (_: string) => {},
    prefetch: (_: string) => {},
    // add more methods if needed
  };
};

/**
 * Simple authentication check.
 * In production, replace with real auth (e.g., NextAuth session check).
 * Handles hydration properly by checking only on client.
 */
const useAuthCheck = () => {
  const { payload } = useRegistrationStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Check auth only on client (after hydration)
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

export function VoterProfile() {
  // const router = useRouter();
  const _router = useMockRouter(); // Reserved for future use when transitioning to real routing
  const { payload, reset, update } = useRegistrationStore();
  const { isAuthenticated, isHydrated } = useAuthCheck();

  // Calculate days remaining for editing (7 days from registration)
  const calculateDaysRemaining = (registrationDate?: string): number => {
    if (!registrationDate) return 0;
    const regDate = new Date(registrationDate);
    const today = new Date();
    const diffTime = today.getTime() - regDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = 7 - diffDays;
    return daysRemaining > 0 ? daysRemaining : 0;
  };

  // Fetch voter data if we have NIN
  const {
    data: voterData,
    isLoading: isLoadingVoter,
    error: voterError,
  } = useQuery({
    queryKey: ["voter-profile", payload.nin],
    queryFn: async (): Promise<Voter | null> => {
      if (!payload.nin) return null;
      const result = await voterApi.getUserProfile(payload.nin);
      return result.voter;
    },
    enabled: !!payload.nin,
    staleTime: 1000 * 60 * 5,
  });

  // Multi-candidate support - fetch all 5 selected candidates
  const candidateIds =
    payload.candidates?.selections?.map((s) => s.candidateId) || [];

  const { data: candidatesData, isLoading: isLoadingCandidates } = useQuery({
    queryKey: ["candidates-multi", candidateIds],
    queryFn: async () => {
      if (candidateIds.length === 0) return { candidates: [] };
      return await candidateApi.getCandidatesByIds(candidateIds);
    },
    enabled: candidateIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  // Survey disabled for now
  // const surveyData = null;
  const isLoadingSurvey = false;

  // Update registration state when voter data is fetched
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

  const fullName = `${
    payload.basic?.firstName || ""
  } ${payload.basic?.lastName || ""}`.trim();

  // Use actual registration date from voter data
  const actualRegistrationDate =
    voterData?.registrationDate || payload.basic?.dateOfBirth;
  const registrationDate = actualRegistrationDate
    ? new Date(actualRegistrationDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // Format dates for activity timeline
  const formatActivityDate = (dateString?: string | null): string | null => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
      }

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch {
      return null;
    }
  };

  // Get last updated timestamp
  const lastUpdated = voterData?.updatedAt
    ? formatActivityDate(voterData.updatedAt)
    : null;

  // Calculate days remaining for editing
  const daysRemaining = calculateDaysRemaining(
    voterData?.registrationDate || actualRegistrationDate,
  );
  const canEdit = daysRemaining > 0;

  // Calculate survey completion stats - disabled for multi-candidate support
  const answeredCount = 0;
  const totalQuestions = 0;
  const surveyProgress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  // Use voterData.surveyCompleted if available (production-ready), otherwise calculate
  const isSurveyComplete =
    voterData?.surveyCompleted ??
    (totalQuestions > 0 && answeredCount === totalQuestions);

  // Handle logout
  const handleLogout = () => {
    reset();
    toast.success("Logged out successfully");

    // For mock: Show logged out state briefly, then redirect
    // In production: Uncomment router.push("/voter-login")
    setTimeout(() => {
      // Using window.location for hard redirect (works in mock and production)
      // In production with NextAuth: router.push("/voter-login")
      window.location.href = "/voter-login";
    }, 500); // Brief delay to show success toast
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Loading state - consolidate hydration and data fetching
  const isLoading =
    !isHydrated || isLoadingVoter || isLoadingCandidates || isLoadingSurvey;

  // Show unauthenticated state
  if (isHydrated && !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 px-4 text-center sm:space-y-8">
        <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-full sm:h-24 sm:w-24">
          <HiLockClosed className="text-muted-foreground h-10 w-10 sm:h-12 sm:w-12" />
        </div>
        <div className="space-y-2 sm:space-y-3">
          <h2 className="text-foreground text-xl font-semibold sm:text-2xl">
            Authentication Required
          </h2>
          <p className="text-muted-foreground mx-auto max-w-md text-sm leading-relaxed sm:text-base">
            Please log in to view your voter profile. You need to be
            authenticated to access this page.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={() => {
              // In production: router.push("/voter-login")
              window.location.href = "/voter-login";
            }}
            variant="default"
            className="gap-2"
          >
            <HiUser className="h-4 w-4" />
            Go to Login
          </Button>
          <Button
            onClick={() => {
              // In production: router.push("/")
              window.location.href = "/";
            }}
            variant="outline"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // Error state
  if (voterError) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Alert className="border-red-200 bg-red-50">
          <HiExclamationCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Failed to load profile data. Please try again later.
          </AlertDescription>
        </Alert>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={handleRetry} variant="default" className="gap-2">
            <HiRefresh className="h-4 w-4" />
            Retry
          </Button>
          <Button
            onClick={() => {
              // In production: router.push("/")
              toast.info("Redirecting to home");
            }}
            variant="outline"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Profile Header */}
      <div className="space-y-2">
        <ProfileHeader
          fullName={fullName}
          state={payload.location?.state || ""}
          registrationId={generateRegistrationId(payload)}
          registrationDate={registrationDate}
          daysRemaining={daysRemaining}
          isLoading={isLoading}
          onLogout={handleLogout}
          role={payload.basic?.role}
          vin={payload.basic?.vin}
        />
        {/* Last Updated Indicator */}
        {!isLoading && lastUpdated && (
          <div className="flex items-center justify-end gap-1.5">
            <p className="text-muted-foreground text-xs">
              Last updated: {lastUpdated}
            </p>
          </div>
        )}
      </div>

      {/* Main Content Tabs */}
      <ProfileTabs>
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Candidates Section - Wide Grid */}
          {payload.candidates?.selections &&
            payload.candidates.selections.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">
                      Selected Candidates
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      Your chosen representatives for the upcoming election
                    </p>
                  </div>
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-xs"
                      onClick={() => {
                        // router.push("/register/candidate")
                      }}
                    >
                      <HiExternalLink className="h-3 w-3" />
                      Change Candidates
                    </Button>
                  )}
                </div>

                {isLoadingCandidates ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {payload.candidates.selections.map((selection, index) => {
                      const fullCandidate = candidatesData?.candidates?.find(
                        (c) => c.id === selection.candidateId,
                      );
                      return (
                        <Card
                          key={index}
                          className="hover:border-primary/50 group overflow-hidden transition-all duration-300"
                        >
                          <CardContent>
                            <div className="flex flex-col gap-3">
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <Badge
                                    variant="outline"
                                    className="bg-background/50 mb-2 text-[10px] tracking-wider uppercase"
                                  >
                                    {selection.position}
                                  </Badge>
                                  {fullCandidate?.supporters !== undefined && (
                                    <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
                                      <HiUsers className="h-3 w-3" />
                                      {fullCandidate.supporters.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-foreground line-clamp-1 font-semibold">
                                  {selection.candidateName ||
                                    fullCandidate?.name ||
                                    selection.candidateId}
                                </h4>
                                <p className="text-muted-foreground text-xs">
                                  {selection.candidateParty ||
                                    fullCandidate?.party}
                                </p>
                              </div>

                              {fullCandidate?.constituency && (
                                <div className="bg-muted/30 text-muted-foreground -mx-4 mt-1 -mb-4 flex items-center gap-2 border-t px-4 py-2 text-[10px]">
                                  <HiLocationMarker className="h-3 w-3 shrink-0" />
                                  <span className="truncate">
                                    {fullCandidate.constituency}
                                  </span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column: Personal & Canvasser */}
            <div className="space-y-6">
              {/* Personal Information */}
              <ProfileInfoCard
                title="Personal Information"
                canEdit={canEdit}
                isLoading={isLoading}
              >
                <InfoRow
                  label="Full Name"
                  value={fullName || undefined}
                  isLoading={isLoadingVoter && !fullName}
                />
                <InfoRow
                  label="Email"
                  value={payload.basic?.email}
                  isLoading={isLoadingVoter && !payload.basic?.email}
                />
                <InfoRow
                  label="Registration Role"
                  value={
                    payload.basic?.role
                      ? payload.basic.role.charAt(0).toUpperCase() +
                        payload.basic.role.slice(1)
                      : undefined
                  }
                  isLoading={isLoadingVoter && !payload.basic?.role}
                />
                {payload.basic?.vin && (
                  <InfoRow
                    label="VIN Status"
                    value="Verified"
                    isLoading={isLoadingVoter}
                  />
                )}
                <InfoRow
                  label="Phone"
                  value={payload.phone}
                  isLoading={isLoadingVoter && !payload.phone}
                />
              </ProfileInfoCard>

              {/* Canvasser Referral */}
              {payload.canvasser?.canvasserCode && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                        <HiUsers className="text-primary h-4 w-4" />
                      </div>
                      <h3 className="text-foreground font-semibold">
                        Canvasser Referral
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        Referral Code
                      </span>
                      <Badge
                        variant="outline"
                        className="border-primary/30 bg-primary/10 text-primary font-mono"
                      >
                        {payload.canvasser.canvasserCode}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-2 text-xs">
                      You registered via a campaign canvasser.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Location & Survey */}
            <div className="space-y-6">
              <ProfileInfoCard
                title="Voting Location"
                canEdit={canEdit}
                isLoading={isLoading}
              >
                <InfoRow
                  label="State"
                  value={payload.location?.state}
                  isLoading={isLoadingVoter && !payload.location?.state}
                />
                <InfoRow
                  label="LGA"
                  value={payload.location?.lga}
                  isLoading={isLoadingVoter && !payload.location?.lga}
                />
                <InfoRow
                  label="Ward"
                  value={payload.location?.ward}
                  isLoading={isLoadingVoter && !payload.location?.ward}
                />
                <InfoRow
                  label="Polling Unit"
                  value={payload.location?.pollingUnit}
                  isLoading={isLoadingVoter && !payload.location?.pollingUnit}
                />
              </ProfileInfoCard>

              {/* Survey Status - Compact */}
              {totalQuestions > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-foreground font-semibold">
                        Voter Survey
                      </h3>
                      {isSurveyComplete ? (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <HiCheckCircle className="h-3 w-3" />
                          Complete
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <HiClock className="h-3 w-3" />
                          In Progress
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span className="font-medium">
                            {Math.round(surveyProgress)}%
                          </span>
                        </div>
                        <Progress value={surveyProgress} className="h-1.5" />
                      </div>
                      {!isSurveyComplete && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full text-xs"
                        >
                          Continue Survey
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-foreground text-base font-semibold sm:text-lg">
                Registration Details
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Complete breakdown of your registration information
              </p>
            </CardHeader>
            <CardContent className="space-y-6 sm:space-y-8">
              {/* Personal Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-foreground flex items-center gap-2 text-xs font-semibold sm:text-sm">
                  <HiUser className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Personal Information
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="space-y-1">
                    <dt className="text-muted-foreground text-xs">Full Name</dt>
                    <dd className="text-foreground text-xs font-medium sm:text-sm">
                      {fullName}
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-muted-foreground text-xs">Email</dt>
                    <dd className="text-foreground text-xs font-medium sm:text-sm">
                      {payload.basic?.email}
                    </dd>
                  </div>
                  {payload.basic?.role && (
                    <div className="space-y-1">
                      <dt className="text-muted-foreground text-xs">Role</dt>
                      <dd className="text-foreground text-xs font-medium capitalize sm:text-sm">
                        {payload.basic.role}
                      </dd>
                    </div>
                  )}
                  {payload.basic?.vin && (
                    <div className="space-y-1">
                      <dt className="text-muted-foreground text-xs">
                        VIN (Verified)
                      </dt>
                      <dd className="text-foreground font-mono text-xs font-medium sm:text-sm">
                        {payload.basic.vin}
                      </dd>
                    </div>
                  )}
                  {payload.basic?.dateOfBirth && (
                    <div className="space-y-1">
                      <dt className="text-muted-foreground text-xs">
                        Date of Birth
                      </dt>
                      <dd className="text-foreground text-xs font-medium sm:text-sm">
                        {new Date(payload.basic.dateOfBirth).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </dd>
                    </div>
                  )}
                  {payload.basic?.age && (
                    <div className="space-y-1">
                      <dt className="text-muted-foreground text-xs">Age</dt>
                      <dd className="text-foreground text-xs font-medium sm:text-sm">
                        {payload.basic.age}
                      </dd>
                    </div>
                  )}
                  {payload.basic?.gender && (
                    <div className="space-y-1">
                      <dt className="text-muted-foreground text-xs">Gender</dt>
                      <dd className="text-foreground text-xs font-medium capitalize sm:text-sm">
                        {payload.basic.gender}
                      </dd>
                    </div>
                  )}
                  {payload.basic?.occupation && (
                    <div className="space-y-1">
                      <dt className="text-muted-foreground text-xs">
                        Occupation
                      </dt>
                      <dd className="text-foreground text-xs font-medium capitalize sm:text-sm">
                        {payload.basic.occupation.replace(/-/g, " ")}
                      </dd>
                    </div>
                  )}
                  {payload.basic?.religion && (
                    <div className="space-y-1">
                      <dt className="text-muted-foreground text-xs">
                        Religion
                      </dt>
                      <dd className="text-foreground text-xs font-medium capitalize sm:text-sm">
                        {payload.basic.religion}
                      </dd>
                    </div>
                  )}
                  {payload.phone && (
                    <div className="space-y-1">
                      <dt className="text-muted-foreground text-xs">
                        Phone Number
                      </dt>
                      <dd className="text-foreground text-xs font-medium sm:text-sm">
                        {payload.phone}
                      </dd>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Location Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-foreground flex items-center gap-2 text-xs font-semibold sm:text-sm">
                  <HiLocationMarker className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Location Information
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  {payload.location?.state && (
                    <div className="space-y-1">
                      <dt className="text-muted-foreground text-xs">State</dt>
                      <dd className="text-foreground text-xs font-medium sm:text-sm">
                        {payload.location.state}
                      </dd>
                    </div>
                  )}
                  {payload.location?.lga && (
                    <div className="space-y-1">
                      <dt className="text-muted-foreground text-xs">LGA</dt>
                      <dd className="text-foreground text-xs font-medium sm:text-sm">
                        {payload.location.lga}
                      </dd>
                    </div>
                  )}
                  {payload.location?.ward && (
                    <div className="space-y-1">
                      <dt className="text-muted-foreground text-xs">Ward</dt>
                      <dd className="text-foreground text-xs font-medium sm:text-sm">
                        {payload.location.ward}
                      </dd>
                    </div>
                  )}
                  {payload.location?.pollingUnit && (
                    <div className="space-y-1 sm:col-span-2">
                      <dt className="text-muted-foreground text-xs">
                        Polling Unit
                      </dt>
                      <dd className="text-foreground text-xs font-medium sm:text-sm">
                        {payload.location.pollingUnit}
                      </dd>
                    </div>
                  )}
                </div>
              </div>

              {/* Canvasser Info (If Present) */}
              {payload.canvasser?.canvasserCode && (
                <>
                  <Separator />
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-foreground flex items-center gap-2 text-xs font-semibold sm:text-sm">
                      <HiUsers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Referral Information
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                      <div className="space-y-1">
                        <dt className="text-muted-foreground text-xs">
                          Referred By Canvasser
                        </dt>
                        <dd className="text-foreground font-mono text-xs font-medium sm:text-sm">
                          {payload.canvasser.canvasserCode}
                        </dd>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Survey Information (If Present) */}
              {totalQuestions > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-foreground flex items-center gap-2 text-xs font-semibold sm:text-sm">
                      <HiClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Survey Information
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                      <div className="space-y-1">
                        <dt className="text-muted-foreground text-xs">
                          Status
                        </dt>
                        <dd className="text-foreground text-xs font-medium sm:text-sm">
                          {isSurveyComplete ? (
                            <Badge variant="secondary" className="gap-1">
                              <HiCheckCircle className="h-3 w-3" />
                              Complete
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <HiClock className="h-3 w-3" />
                              In Progress
                            </Badge>
                          )}
                        </dd>
                      </div>
                      <div className="space-y-1">
                        <dt className="text-muted-foreground text-xs">
                          Progress
                        </dt>
                        <dd className="text-foreground text-xs font-medium sm:text-sm">
                          {answeredCount} of {totalQuestions} questions
                        </dd>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <dt className="text-muted-foreground text-xs">
                          Completion
                        </dt>
                        <div className="mt-1">
                          <Progress value={surveyProgress} className="h-2" />
                          <p className="text-muted-foreground mt-1 text-xs">
                            {Math.round(surveyProgress)}% complete
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Updates Tab */}
        <TabsContent value="updates" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-foreground text-base font-semibold sm:text-lg">
                Notifications & Updates
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Latest news from your candidates and registration activity
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {(
                  [
                    {
                      icon: HiMail,
                      title: "Campaign Update: Town Hall",
                      date: "Today",
                      fullDate: new Date().toLocaleDateString(),
                      description:
                        "Your selected Governor candidate is hosting a virtual town hall next Tuesday. Check your email for the link.",
                      completed: false,
                      highlight: true,
                    },
                    {
                      icon: HiShieldCheck,
                      title: "Profile Verified",
                      date:
                        formatActivityDate(voterData?.verifiedAt) || "Recently",
                      fullDate: voterData?.verifiedAt
                        ? new Date(voterData.verifiedAt).toLocaleDateString()
                        : "",
                      description:
                        "Your voter registration details have been verified successfully.",
                      completed: true,
                    },
                    {
                      icon: HiCheckCircle,
                      title: "Registration Completed",
                      date: formatActivityDate(
                        voterData?.registrationDate || actualRegistrationDate,
                      ),
                      fullDate: registrationDate,
                      description:
                        "Your voter registration was successfully completed",
                      completed: true,
                    },
                    {
                      icon: HiUsers,
                      title: "Candidates Selected",
                      date:
                        payload.candidates?.selections &&
                        payload.candidates.selections.length > 0
                          ? formatActivityDate(voterData?.createdAt)
                          : null,
                      fullDate:
                        payload.candidates?.selections &&
                        payload.candidates.selections.length > 0
                          ? voterData?.createdAt
                            ? new Date(voterData.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : registrationDate
                          : null,
                      description:
                        payload.candidates?.selections &&
                        payload.candidates.selections.length > 0
                          ? `Selected ${payload.candidates.selections.length} candidates`
                          : null,
                      completed:
                        payload.candidates?.selections &&
                        payload.candidates.selections.length > 0,
                    },
                    {
                      icon: HiClipboardList,
                      title: "Survey Completed",
                      date: isSurveyComplete
                        ? formatActivityDate(voterData?.updatedAt)
                        : null,
                      fullDate: isSurveyComplete
                        ? voterData?.updatedAt
                          ? new Date(voterData.updatedAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )
                          : registrationDate
                        : null,
                      description: isSurveyComplete
                        ? "Survey responses submitted"
                        : totalQuestions > 0
                          ? `${answeredCount} of ${totalQuestions} questions answered`
                          : null,
                      completed: isSurveyComplete,
                    },
                  ] as {
                    icon: React.ComponentType<{ className?: string }>;
                    title: string;
                    date: string | null;
                    fullDate: string | null;
                    description: string | null;
                    completed: boolean | undefined | null;
                    highlight?: boolean;
                  }[]
                )
                  .filter(
                    (activity) =>
                      activity.completed ||
                      (activity.date && activity.description) ||
                      activity.highlight,
                  )
                  .map((activity, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 border-b pb-3 transition-all duration-200 last:border-0 last:pb-0 sm:gap-4 sm:pb-4 ${
                        activity.highlight ? "bg-primary/5 -mx-4 px-4 py-3" : ""
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 sm:h-10 sm:w-10 ${
                          activity.completed
                            ? "bg-primary/10 text-primary"
                            : activity.highlight
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <activity.icon className="h-4 w-4 transition-transform duration-200 sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-foreground text-xs font-medium sm:text-sm">
                            {activity.title}
                          </p>
                          {activity.completed && (
                            <HiCheckCircle className="h-3 w-3 text-green-600 transition-opacity duration-200" />
                          )}
                          {activity.highlight && (
                            <Badge
                              variant="default"
                              className="h-4 px-1.5 text-[9px]"
                            >
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {activity.description}
                        </p>
                        {activity.date && (
                          <div className="flex items-center gap-1">
                            <p className="text-muted-foreground text-xs">
                              {activity.date}
                            </p>
                            {activity.fullDate &&
                              activity.fullDate !== activity.date && (
                                <Tooltip delayDuration={200}>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      className="text-muted-foreground hover:text-foreground cursor-help text-xs underline-offset-2 transition-colors hover:underline"
                                      aria-label={`Full date: ${activity.fullDate}`}
                                    >
                                      (view full date)
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" align="start">
                                    <p className="font-medium">
                                      {activity.fullDate}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <h3 className="text-foreground text-base font-semibold sm:text-lg">
                  Data Rights
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Your rights under NDPA 2023
                </p>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      Data Collection
                    </span>
                    <Badge variant="secondary">Transparent</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      Data Storage
                    </span>
                    <Badge variant="secondary">Encrypted</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      Data Sharing
                    </span>
                    <Badge variant="secondary">Restricted</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-foreground text-base font-semibold sm:text-lg">
                  Privacy Settings
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Control your data visibility
                </p>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      Profile Visibility
                    </span>
                    <Badge variant="secondary">Private</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      Survey Responses
                    </span>
                    <Badge variant="secondary">Anonymous</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      Contact Information
                    </span>
                    <Badge variant="secondary">Private</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Protection Notice */}
          <Card className="border-border bg-muted/30">
            <CardContent className="flex items-start gap-3 sm:gap-4">
              <HiShieldCheck className="text-primary mt-0.5 h-5 w-5 shrink-0" />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-foreground text-sm font-semibold">
                  Data Protection Notice
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Your information is protected by Nigerian Data Protection Act
                  (NDPA) 2023. We use encryption, secure servers, and strict
                  access controls. Your data is never sold to third parties and
                  is only used for election-related purposes.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </ProfileTabs>
    </div>
  );
}
