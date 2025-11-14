"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowLeft,
  MapPin,
  Users,
  Loader2,
  AlertCircle,
  RefreshCw,
  Landmark,
  Scale,
  Building2,
  ShieldCheck,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StepProgress } from "@/components/ui/step-progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRegistrationStore } from "@/stores/registration-store";
import { cn } from "@/lib/utils";
import { mockApi } from "@/lib/mock/mockApi";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Candidate } from "@/types/candidate";
import { TrustIndicators } from "@/components/ui/trust-indicators";

export function CandidateSelectionStep() {
  const router = useRouter();
  const { update, payload } = useRegistrationStore();
  const [selectedCandidateId, setSelectedCandidateId] = useState("");

  // Get state and lga from payload
  const state = payload.location?.state;
  const lga = payload.location?.lga;

  // TODO: Replace with actual API call
  // Fetch candidates from mock API filtered by location
  const { data, isLoading, isPending, error, refetch } = useQuery({
    queryKey: ["candidates", state, lga],
    queryFn: async () => {
      // Use mock API for demo - pass location for filtering
      return await mockApi.getCandidates(state, lga);
    },
    enabled: !!state, // Only fetch when state is available
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // TODO: Replace with actual API call
  // Get candidates from mock API
  const candidates: Candidate[] = data?.candidates || [];

  // Helper to get position display info (icon, label, variant)
  const getPositionInfo = (position: Candidate["position"]) => {
    switch (position) {
      case "Governor":
        return {
          icon: Landmark,
          label: "Governor",
          variant: "default" as const,
        };
      case "Senator":
        return {
          icon: Scale,
          label: "Senator",
          variant: "secondary" as const,
        };
      case "House of Representatives":
        return {
          icon: Building2,
          label: "House of Reps",
          variant: "outline" as const,
        };
      case "State Assembly":
        return {
          icon: Building,
          label: "State House of Assembly",
          variant: "secondary" as const,
        };
      default:
        return {
          icon: MapPin,
          label: position,
          variant: "outline" as const,
        };
    }
  };

  // Handle submit button click
  const handleSubmit = () => {
    if (!selectedCandidateId) {
      toast.error("Please select a candidate to continue");
      return;
    }

    // Update the payload with the selected candidate id
    update({
      candidate: { candidateId: selectedCandidateId },
    });
    toast.success("Candidate selected!");
    // Redirect to the survey step
    router.push("/register/survey");
  };

  // Handle retry button click
  const handleRetry = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <StepProgress
        currentStep={4}
        totalSteps={6}
        stepTitle="Candidate Selection"
      />

      <div className="space-y-2 text-center">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Select Your Candidate
        </h1>
        <p className="text-muted-foreground text-sm">
          Choose the candidate you want to support in the upcoming election
        </p>
      </div>

      <div className="mx-auto w-full max-w-4xl">
        <Card>
          <CardHeader className="border-b">
            <h2 className="text-foreground text-base font-medium">
              Available Candidates
            </h2>
          </CardHeader>

          <CardContent>
            {isLoading || isPending ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 text-sm">
                  <Loader2 className="text-primary h-8 w-8 animate-spin" />
                  <div className="text-center">
                    <p className="text-foreground text-sm font-medium">
                      Loading candidates...
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      This may take a few moments
                    </p>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <div className="max-w-md space-y-4 text-center">
                  <div className="flex justify-center">
                    <AlertCircle className="text-destructive h-12 w-12" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-foreground text-lg font-semibold">
                      Failed to Load Candidates
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      We're having trouble connecting to our servers. Please
                      check your internet connection and try again.
                    </p>
                  </div>
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              </div>
            ) : data && candidates.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <div className="max-w-md space-y-4 text-center">
                  <div className="flex justify-center">
                    <Users className="text-muted-foreground h-12 w-12" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-foreground text-lg font-semibold">
                      No Candidates Available
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      There are currently no candidates registered for your
                      constituency ({payload.location?.lga}). This may be
                      because candidate registration is still ongoing.
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Please contact your local electoral office or try again
                      later.
                    </p>
                  </div>
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>
            ) : data && candidates.length > 0 ? (
              <RadioGroup
                value={selectedCandidateId}
                onValueChange={setSelectedCandidateId}
                className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
              >
                {candidates.map((candidate: Candidate) => {
                  const isSelected = selectedCandidateId === candidate.id;
                  const isUndecided = candidate.id === "cand-undecided";
                  const positionInfo = getPositionInfo(candidate.position);
                  const PositionIcon = positionInfo.icon;

                  return (
                    <div key={candidate.id} className="relative">
                      <RadioGroupItem
                        value={candidate.id}
                        id={candidate.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={candidate.id}
                        className={cn(
                          "block h-full cursor-pointer rounded-lg border p-4 transition-all duration-200 hover:shadow-sm",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:bg-muted/50",
                        )}
                      >
                        <div className="flex h-full flex-col">
                          {/* Header with avatar, name and radio button */}
                          <div className="mb-3 flex items-start gap-3">
                            {/* Avatar */}
                            <div className="shrink-0">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                  {candidate.name.charAt(0).toUpperCase() ||
                                    "N/A"}
                                </AvatarFallback>
                              </Avatar>
                            </div>

                            {/* Name and radio button */}
                            <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-foreground text-sm leading-tight font-semibold">
                                  {candidate.name}
                                </h3>
                              </div>

                              {/* Radio button indicator */}
                              <div className="shrink-0">
                                <div
                                  className={cn(
                                    "flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors",
                                    isSelected
                                      ? "border-primary bg-primary"
                                      : "border-muted-foreground/30",
                                  )}
                                >
                                  {isSelected && (
                                    <div className="bg-primary-foreground h-1.5 w-1.5 rounded-full" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Badges */}
                          {!isUndecided && (
                            <div className="mb-3 flex flex-wrap items-center gap-1.5">
                              <Badge
                                variant={positionInfo.variant}
                                className="gap-1 text-xs font-medium"
                              >
                                <PositionIcon className="h-3 w-3" />
                                {positionInfo.label}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="text-xs font-normal"
                              >
                                {candidate.party}
                              </Badge>
                            </div>
                          )}

                          {/* Details - flex-1 to push content to fill available space */}
                          <div className="flex-1 space-y-2">
                            {!isUndecided && (
                              <>
                                {/* Constituency */}
                                <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  <span className="truncate">
                                    {candidate.constituency}
                                  </span>
                                </div>

                                {/* Supporters */}
                                {candidate.supporters !== undefined && (
                                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                    <Users className="h-3 w-3 shrink-0" />
                                    <span>
                                      {candidate.supporters.toLocaleString()}{" "}
                                      supporters
                                    </span>
                                  </div>
                                )}

                                {/* Description */}
                                {candidate.description && (
                                  <p className="text-muted-foreground mt-2 line-clamp-3 text-xs leading-relaxed">
                                    {candidate.description}
                                  </p>
                                )}
                              </>
                            )}

                            {/* Undecided message */}
                            {isUndecided && (
                              <p className="text-muted-foreground text-xs leading-relaxed">
                                You can update your choice within 7 days of
                                registration.
                              </p>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            ) : null}

            {/* Action Buttons - Only show when candidates are successfully loaded */}
            {!isLoading &&
              !isPending &&
              !error &&
              data &&
              candidates.length > 0 && (
                <>
                  <div className="bg-muted mt-6 rounded-lg p-4">
                    <p className="text-muted-foreground text-xs">
                      <strong className="text-foreground font-medium">
                        Important:
                      </strong>{" "}
                      You can only select <strong>one candidate</strong> to
                      maintain data integrity. This helps candidates see their
                      registered supporters and prevents duplicate
                      registrations. You can change your selection once within 7
                      days of registration.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 pt-6 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/register/location")}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={handleSubmit} className="flex-1">
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}

            {/* Action Buttons for Error/Empty States - Only show when NOT loading */}
            {!isLoading && !isPending && error && (
              <div className="flex flex-col gap-3 pt-6 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/register/location")}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => {
                    toast.error(
                      "Please resolve the issue above before continuing",
                    );
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Resolve issues to continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Action Buttons for Empty State - Only show when data exists but no candidates */}
            {!isLoading &&
              !isPending &&
              !error &&
              data &&
              candidates.length === 0 && (
                <div className="flex flex-col gap-3 pt-6 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/register/location")}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => {
                      toast.error(
                        "No candidates available for your constituency.",
                      );
                    }}
                    variant="secondary"
                    className="flex-1"
                  >
                    Resolve issue and try again
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Subtle Trust Indicators */}
      <TrustIndicators
        items={[
          {
            icon: <ShieldCheck className="h-4 w-4" />,
            label: "Verified Candidates",
          },
          { icon: <MapPin className="h-4 w-4" />, label: "Location Scoped" },
          { icon: <Users className="h-4 w-4" />, label: "Data Integrity" },
        ]}
      />
    </div>
  );
}
