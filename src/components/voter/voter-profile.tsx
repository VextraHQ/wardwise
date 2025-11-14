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
  HiTrendingUp,
  HiShieldCheck,
  HiExclamationCircle,
  HiArrowRight,
  HiExternalLink,
  HiRefresh,
  HiLockClosed,
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
import { generateRegistrationId } from "@/lib/registration-schemas";
import { toast } from "sonner";
import { mockApi } from "@/lib/mock/mockApi";
import { getSupportersCount } from "@/lib/helpers/voter-analytics";
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
      const result = await mockApi.getUserProfile(payload.nin);
      return result.voter;
    },
    enabled: !!payload.nin,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch candidate data
  const { data: candidateData, isLoading: isLoadingCandidate } = useQuery({
    queryKey: ["candidate", payload.candidate?.candidateId],
    queryFn: async () => {
      if (!payload.candidate?.candidateId) return null;
      const result = await mockApi.getCandidateById(
        payload.candidate.candidateId,
      );
      return result.candidate;
    },
    enabled: !!payload.candidate?.candidateId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Fetch survey data
  const { data: surveyData, isLoading: isLoadingSurvey } = useQuery({
    queryKey: ["survey", payload.candidate?.candidateId],
    queryFn: async () => {
      if (!payload.candidate?.candidateId) return null;
      const result = await mockApi.getCandidateSurvey(
        payload.candidate.candidateId,
      );
      return result.survey;
    },
    enabled: !!payload.candidate?.candidateId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Update registration state when voter data is fetched
  useEffect(() => {
    if (voterData) {
      update({
        nin: voterData.nin,
        phone: voterData.phoneNumber,
        basic: {
          firstName: voterData.firstName,
          lastName: voterData.lastName,
          dateOfBirth: voterData.dateOfBirth,
          age: voterData.age,
          gender: voterData.gender,
          occupation: voterData.occupation,
          religion: voterData.religion,
        },
        location: {
          state: voterData.state,
          lga: voterData.lga,
          ward: voterData.ward,
          pollingUnit: voterData.pollingUnit,
        },
        candidate: {
          candidateId: voterData.candidateId,
        },
        survey: {
          surveyId: "",
          answers: voterData.surveyAnswers || {},
        },
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

  // Calculate survey completion stats
  const surveyAnswers = payload.survey?.answers || {};
  const surveyQuestions = surveyData?.questions || [];
  const answeredCount = Object.keys(surveyAnswers).filter(
    (key) => !key.endsWith("_other_text") && surveyAnswers[key],
  ).length;
  const totalQuestions = surveyQuestions.length;
  const surveyProgress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const isSurveyComplete =
    totalQuestions > 0 && answeredCount === totalQuestions;

  // Get supporter count
  const supporterCount = payload.candidate?.candidateId
    ? getSupportersCount(payload.candidate.candidateId)
    : 0;

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

  // Loading state
  const isLoading = isLoadingVoter || isLoadingCandidate || isLoadingSurvey;

  // Show loading during hydration to prevent mismatch
  if (!isHydrated) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full max-w-md" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show unauthenticated state
  if (!isAuthenticated) {
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
        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          {/* Completion Summary */}
          <Card className="border-primary/20 from-primary/5 to-primary/10 bg-linear-to-br">
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {isLoading ? (
                <>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <div className="flex gap-3 sm:gap-6">
                    <div className="text-center">
                      <Skeleton className="h-8 w-12 sm:h-10 sm:w-16" />
                      <Skeleton className="mt-1 h-3 w-12" />
                    </div>
                    <div className="text-center">
                      <Skeleton className="h-8 w-12 sm:h-10 sm:w-16" />
                      <Skeleton className="mt-1 h-3 w-16" />
                    </div>
                    <div className="text-center">
                      <Skeleton className="h-8 w-12 sm:h-10 sm:w-16" />
                      <Skeleton className="mt-1 h-3 w-12" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Registration Status
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex h-2.5 w-2.5 rounded-full bg-green-500" />
                      <p className="text-foreground text-base font-semibold sm:text-lg">
                        Registration Complete
                      </p>
                    </div>
                    {voterData?.registrationDate && (
                      <p className="text-muted-foreground text-xs">
                        Registered on {registrationDate}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 sm:gap-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <p className="text-foreground text-xl font-bold sm:text-2xl">
                          100%
                        </p>
                        <HiCheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-muted-foreground text-xs">Profile</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <p className="text-foreground text-xl font-bold sm:text-2xl">
                          {payload.candidate?.candidateId ? "✓" : "—"}
                        </p>
                        {payload.candidate?.candidateId && (
                          <HiCheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">Candidate</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <p className="text-foreground text-xl font-bold sm:text-2xl">
                          {isSurveyComplete
                            ? "✓"
                            : totalQuestions > 0
                              ? `${Math.round(surveyProgress)}%`
                              : "—"}
                        </p>
                        {isSurveyComplete && (
                          <HiCheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">Survey</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
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
                label="Age"
                value={payload.basic?.age?.toString()}
                isLoading={isLoadingVoter && !payload.basic?.age}
              />
              <InfoRow
                label="Gender"
                value={
                  payload.basic?.gender
                    ? payload.basic.gender.charAt(0).toUpperCase() +
                      payload.basic.gender.slice(1)
                    : undefined
                }
                isLoading={isLoadingVoter && !payload.basic?.gender}
              />
              <InfoRow
                label="Occupation"
                value={
                  payload.basic?.occupation
                    ? payload.basic.occupation.replace(/-/g, " ")
                    : undefined
                }
                isLoading={isLoadingVoter && !payload.basic?.occupation}
              />
              <InfoRow
                label="Religion"
                value={
                  payload.basic?.religion
                    ? payload.basic.religion.charAt(0).toUpperCase() +
                      payload.basic.religion.slice(1)
                    : undefined
                }
                isLoading={isLoadingVoter && !payload.basic?.religion}
              />
              <InfoRow
                label="Phone"
                value={payload.phone}
                isLoading={isLoadingVoter && !payload.phone}
              />
            </ProfileInfoCard>

            {/* Voting Location */}
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

            {/* Candidate Support - Only show if candidate data exists */}
            {candidateData && (
              <Card className="hover:border-primary/50 transition-all duration-200">
                <CardHeader className="border-border border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-foreground text-base font-semibold sm:text-lg">
                      Candidate Support
                    </h3>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingCandidate ? (
                    <div className="space-y-4">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-0">
                      <div className="border-border/30 border-b py-4 last:border-0">
                        <dt className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase sm:text-sm">
                          Currently Supporting
                        </dt>
                        <dd className="text-foreground text-base font-semibold sm:text-lg">
                          {candidateData.name}
                        </dd>
                        <dd className="text-muted-foreground mt-1 text-sm">
                          {candidateData.party} • {candidateData.position}
                        </dd>
                      </div>
                      <div className="border-border/30 border-b py-4 last:border-0">
                        <div className="flex items-center justify-between">
                          <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase sm:text-sm">
                            Total Supporters
                          </dt>
                          <dd className="text-foreground flex items-center gap-1.5 text-sm font-semibold sm:text-base">
                            <HiTrendingUp className="text-primary h-4 w-4" />
                            {supporterCount.toLocaleString()}
                          </dd>
                        </div>
                      </div>
                      <div className="space-y-2 pt-4">
                        {canEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={
                              // () => router.push("/register/candidate")
                              () => {}
                            }
                            className="w-full gap-2"
                          >
                            <HiExternalLink className="h-4 w-4" />
                            Change Candidate
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            toast.info("Candidate profile view coming soon!");
                          }}
                          className="w-full gap-2"
                        >
                          View Candidate Profile
                          <HiArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Survey Status - Only show if survey exists */}
            {totalQuestions > 0 && (
              <Card className="hover:border-primary/50 transition-all duration-200">
                <CardHeader className="border-border border-b">
                  <h3 className="text-foreground text-base font-semibold sm:text-lg">
                    Survey Status
                  </h3>
                </CardHeader>
                <CardContent>
                  {isLoadingSurvey ? (
                    <div className="space-y-4">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-0">
                      <div className="border-border/30 border-b py-4 last:border-0">
                        <div className="flex items-center justify-between">
                          <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase sm:text-sm">
                            Status
                          </dt>
                          {isSurveyComplete ? (
                            <Badge variant="secondary" className="gap-1.5">
                              <HiCheckCircle className="h-3 w-3" />
                              Complete
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1.5">
                              <HiClock className="h-3 w-3" />
                              In Progress
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="border-border/30 border-b py-4 last:border-0">
                        <dt className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase sm:text-sm">
                          Questions Answered
                        </dt>
                        <div className="mb-2 flex items-center justify-between text-sm sm:text-base">
                          <dd className="text-foreground font-semibold">
                            {answeredCount} of {totalQuestions}
                          </dd>
                          <dd className="text-muted-foreground text-xs">
                            {Math.round(surveyProgress)}%
                          </dd>
                        </div>
                        <Progress value={surveyProgress} className="h-2" />
                      </div>
                      <div className="space-y-2 pt-4">
                        {!isSurveyComplete && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={
                              // () => router.push("/register/survey")
                              () => {}
                            }
                            className="w-full gap-2"
                          >
                            {answeredCount === 0
                              ? "Start Survey"
                              : "Continue Survey"}
                            <HiArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                        {isSurveyComplete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              toast.info("Survey responses view coming soon!");
                            }}
                            className="w-full gap-2"
                          >
                            View Responses
                            <HiArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
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
                  {payload.basic?.firstName && (
                    <div className="space-y-1">
                      <dt className="text-muted-foreground text-xs">
                        First Name
                      </dt>
                      <dd className="text-foreground text-xs font-medium sm:text-sm">
                        {payload.basic.firstName}
                      </dd>
                    </div>
                  )}
                  {payload.basic?.lastName && (
                    <div className="space-y-1">
                      <dt className="text-muted-foreground text-xs">
                        Last Name
                      </dt>
                      <dd className="text-foreground text-xs font-medium sm:text-sm">
                        {payload.basic.lastName}
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

              <Separator />

              {/* Candidate Information */}
              {candidateData && (
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-foreground flex items-center gap-2 text-xs font-semibold sm:text-sm">
                    <HiUsers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Candidate Support
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="space-y-1 sm:col-span-2">
                      <dt className="text-muted-foreground text-xs">
                        Candidate Name
                      </dt>
                      <dd className="text-foreground text-xs font-medium sm:text-sm">
                        {candidateData.name}
                      </dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-muted-foreground text-xs">Party</dt>
                      <dd className="text-foreground text-xs font-medium sm:text-sm">
                        {candidateData.party}
                      </dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-muted-foreground text-xs">
                        Position
                      </dt>
                      <dd className="text-foreground text-xs font-medium sm:text-sm">
                        {candidateData.position}
                      </dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-muted-foreground text-xs">
                        Constituency
                      </dt>
                      <dd className="text-foreground text-xs font-medium sm:text-sm">
                        {candidateData.constituency || "Not specified"}
                      </dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-muted-foreground text-xs">
                        Total Supporters
                      </dt>
                      <dd className="text-foreground text-xs font-medium sm:text-sm">
                        {supporterCount.toLocaleString()}
                      </dd>
                    </div>
                  </div>
                </div>
              )}

              {/* Survey Information */}
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

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-foreground text-base font-semibold sm:text-lg">
                Registration Timeline
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Your registration activity history
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {[
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
                    title: "Candidate Selected",
                    date: candidateData
                      ? formatActivityDate(voterData?.createdAt)
                      : null,
                    fullDate: candidateData
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
                    description: candidateData
                      ? `Supporting ${candidateData.name}`
                      : null,
                    completed: !!candidateData,
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
                ]
                  .filter(
                    (activity) =>
                      activity.completed ||
                      (activity.date && activity.description),
                  )
                  .map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 border-b pb-3 transition-all duration-200 last:border-0 last:pb-0 sm:gap-4 sm:pb-4"
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 sm:h-10 sm:w-10 ${
                          activity.completed
                            ? "bg-primary/10 text-primary"
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
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-3 sm:gap-4">
              <HiShieldCheck className="text-primary mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-foreground text-sm font-semibold sm:text-base">
                  Data Protection Notice
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
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
