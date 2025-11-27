"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  HiArrowRight,
  HiArrowLeft,
  HiLocationMarker,
  HiUsers,
  HiExclamationCircle,
  HiShieldCheck,
  HiSearch,
  HiX,
  HiViewGrid,
  HiViewList,
  HiCheckCircle,
  HiInformationCircle,
} from "react-icons/hi";
import { HiArrowPath } from "react-icons/hi2";
import { Vote } from "lucide-react";
import { PiSpinnerGapBold } from "react-icons/pi";
import {
  FaLandmark,
  FaBalanceScale,
  FaBuilding,
  FaUniversity,
  FaFlag,
} from "react-icons/fa";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StepProgress } from "@/components/ui/step-progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRegistrationStore } from "@/stores/registration-store";
import { cn } from "@/lib/utils";
import { candidateApi } from "@/lib/api/candidate";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Candidate } from "@/types/candidate";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { RegistrationStepHeader } from "../registration-step-header";

export function CandidateSelectionStep() {
  const router = useRouter();
  const { update, payload } = useRegistrationStore();
  // Track selections for positions - will be dynamically initialized based on available candidates
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};

    // Restore from payload if available
    if (payload.candidates?.selections) {
      payload.candidates.selections.forEach((selection) => {
        initial[selection.position] = selection.candidateId;
      });
    }

    return initial;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [partyFilter, setPartyFilter] = useState("all");
  const [sortOption, setSortOption] = useState<"name" | "supporters">("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Get state and lga from payload
  const state = payload.location?.state;
  const lga = payload.location?.lga;

  // Fetch candidates from mock API filtered by location
  const { data, isLoading, isPending, error, refetch, isRefetching } = useQuery(
    {
      queryKey: ["candidates", state, lga],
      queryFn: async () => {
        return await candidateApi.getCandidates(state, lga);
      },
      enabled: !!state,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 1000 * 60 * 5, // 5 minutes - candidates don't change frequently
      refetchOnWindowFocus: false, // Don't refetch when user switches tabs
    },
  );

  const candidates: Candidate[] = useMemo(
    () => data?.candidates || [],
    [data?.candidates],
  );

  // Group candidates by position - only include positions that have candidates (smart filtering)
  const candidatesByPosition = useMemo(() => {
    const grouped: Record<string, Candidate[]> = {};

    // First pass: group all candidates by position
    candidates.forEach((candidate) => {
      if (!grouped[candidate.position]) {
        grouped[candidate.position] = [];
      }
      grouped[candidate.position].push(candidate);
    });

    return grouped;
  }, [candidates]);

  // Get available positions (positions that have at least one candidate)
  const availablePositions = useMemo(() => {
    // Define the preferred order
    const positionOrder = [
      "President",
      "Governor",
      "Senator",
      "House of Representatives",
      "State Assembly",
    ];

    // Filter and sort by preferred order
    return positionOrder.filter(
      (position) => candidatesByPosition[position]?.length > 0,
    );
  }, [candidatesByPosition]);

  // Derive initial active tab - use first available position if not set
  const [activeTab, setActiveTab] = useState("");

  // Compute effective active tab (handles initialization without useEffect)
  const effectiveActiveTab =
    activeTab || (availablePositions.length > 0 ? availablePositions[0] : "");

  // Calculate progress based on AVAILABLE positions (smart filtering)
  // Handle undefined selections gracefully with || ""
  const totalPositions = availablePositions.length;
  const selectedCount = availablePositions.filter(
    (position) => selections[position] && selections[position] !== "",
  ).length;
  const isComplete = totalPositions > 0 && selectedCount === totalPositions;

  const uniqueParties = useMemo(
    () =>
      Array.from(
        new Set(
          candidates
            .map((candidate) => candidate.party)
            .filter((party): party is string => Boolean(party)),
        ),
      ).sort(),
    [candidates],
  );

  // Filter candidates based on search, party, and sort
  const getFilteredCandidates = (candidateList: Candidate[]) => {
    let filtered = [...candidateList];
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (partyFilter !== "all") {
      filtered = filtered.filter(
        (candidate) => candidate.party === partyFilter,
      );
    }

    if (normalizedSearch) {
      filtered = filtered.filter((candidate) => {
        const haystack = [
          candidate.name,
          candidate.party,
          candidate.constituency,
          candidate.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    }

    filtered.sort((a, b) => {
      if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      }
      const supportersA = a.supporters ?? -1;
      const supportersB = b.supporters ?? -1;
      return supportersB - supportersA;
    });

    return filtered;
  };

  const hasFiltersApplied =
    partyFilter !== "all" ||
    sortOption !== "name" ||
    searchTerm.trim().length > 0;

  // Get currently selected candidate for active tab
  const selectedCandidate = useMemo(
    () =>
      candidates.find(
        (candidate) => candidate.id === selections[effectiveActiveTab],
      ),
    [candidates, selections, effectiveActiveTab],
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setPartyFilter("all");
    setSortOption("name");
  };

  // Helper to get position display info (icon, label, variant)
  const getPositionInfo = (position: Candidate["position"]) => {
    switch (position) {
      case "President":
        return {
          icon: FaFlag,
          label: "President",
          variant: "default" as const,
        };
      case "Governor":
        return {
          icon: FaLandmark,
          label: "Governor",
          variant: "default" as const,
        };
      case "Senator":
        return {
          icon: FaBalanceScale,
          label: "Senator",
          variant: "secondary" as const,
        };
      case "House of Representatives":
        return {
          icon: FaBuilding,
          label: "House of Reps",
          variant: "outline" as const,
        };
      case "State Assembly":
        return {
          icon: FaUniversity,
          label: "State Assembly",
          variant: "secondary" as const,
        };
      default:
        return {
          icon: HiLocationMarker,
          label: position,
          variant: "outline" as const,
        };
    }
  };

  // Handle submit button click
  const handleSubmit = () => {
    if (!isComplete) {
      toast.error(
        `Please select candidates for all ${totalPositions} available positions (${selectedCount}/${totalPositions} selected)`,
      );
      return;
    }

    // Build candidate selections array - only include available positions with selections
    const candidateSelections = availablePositions
      .filter((position) => selections[position] && selections[position] !== "")
      .map((position) => {
        const candidateId = selections[position];
        const candidate = candidates.find((c) => c.id === candidateId);

        return {
          position: position as Candidate["position"],
          candidateId,
          candidateName: candidate?.name || "",
          candidateParty: candidate?.party || "",
        };
      });

    update({
      candidates: { selections: candidateSelections },
    });
    toast.success("All candidates selected!");
    router.push("/register/confirm");
  };

  // Handle retry button click
  const handleRetry = async () => {
    try {
      await refetch();
    } catch (err) {
      // Error is already handled by React Query's error state
      // This prevents unhandled promise rejection warnings
      console.error("Failed to refetch candidates:", err);
    }
  };

  return (
    <div className="space-y-6">
      <StepProgress
        currentStep={5}
        totalSteps={6}
        stepTitle="Candidate Selection"
      />

      <RegistrationStepHeader
        icon={Vote}
        badge="Make Your Choice"
        title="Select Your Candidates"
        description={
          totalPositions > 0
            ? `Choose one candidate for each of the ${totalPositions} available position${totalPositions !== 1 ? "s" : ""}`
            : "Loading available positions..."
        }
      />

      <div className="mx-auto w-full max-w-5xl">
        <Card className="border-border/60 bg-card/95 backdrop-blur-sm">
          <CardHeader className="border-border/60 border-b">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-foreground text-lg font-semibold tracking-tight">
                  Available Candidates
                </h2>
                <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                  {candidates.length} candidate
                  {candidates.length !== 1 ? "s" : ""} available
                </p>
              </div>
              <Badge
                variant={isComplete ? "default" : "secondary"}
                className="gap-1.5 text-xs font-semibold"
              >
                {isComplete ? (
                  <HiShieldCheck className="h-3.5 w-3.5" />
                ) : (
                  <HiUsers className="h-3.5 w-3.5" />
                )}
                {selectedCount}/{totalPositions} Selected
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Info Banner: Show when fewer than 5 positions available */}
            {!isLoading &&
              !isPending &&
              !error &&
              totalPositions > 0 &&
              totalPositions < 5 && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-200/60 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-950/10">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <HiInformationCircle className="h-4.5 w-4.5 text-amber-700 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 space-y-1 pt-0.5">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                      {totalPositions}{" "}
                      {totalPositions === 1 ? "position" : "positions"}{" "}
                      available in {payload.location?.lga}
                    </p>
                    <p className="text-xs leading-relaxed text-amber-800/90 dark:text-amber-200/80">
                      We're only showing positions with registered candidates in
                      your constituency.
                      {totalPositions < 5 &&
                        " Additional positions may become available as more candidates register."}
                    </p>
                  </div>
                </div>
              )}

            {/* Search and Filters */}
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <HiSearch className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, party, or constituency..."
                  className="pr-9 pl-9"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                    aria-label="Clear search"
                  >
                    <HiX className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filter Row */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <Select
                    value={partyFilter}
                    onValueChange={(value) => setPartyFilter(value)}
                  >
                    <SelectTrigger className="h-9 w-full sm:w-[160px]">
                      <SelectValue placeholder="All parties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All parties</SelectItem>
                      {uniqueParties.map((party) => (
                        <SelectItem key={party} value={party}>
                          {party}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortOption}
                    onValueChange={(value) =>
                      setSortOption(value as "name" | "supporters")
                    }
                  >
                    <SelectTrigger className="h-9 w-full sm:w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="supporters">
                        Most supporters
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Toggle - Hidden on mobile */}
                  <div className="border-border/60 bg-muted/30 hidden items-center rounded-lg border p-0.5 sm:flex">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "rounded-md p-1.5 transition-colors",
                        viewMode === "grid"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      aria-label="Grid view"
                    >
                      <HiViewGrid className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={cn(
                        "rounded-md p-1.5 transition-colors",
                        viewMode === "list"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      aria-label="List view"
                    >
                      <HiViewList className="h-4 w-4" />
                    </button>
                  </div>

                  {hasFiltersApplied && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilters}
                      className="h-9 text-xs"
                    >
                      <HiX className="mr-1.5 h-3.5 w-3.5" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Position Tabs */}
            {isLoading || isPending ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div
                  role="status"
                  aria-live="polite"
                  className="text-muted-foreground flex flex-col items-center justify-center gap-3 text-sm"
                >
                  <PiSpinnerGapBold className="text-primary h-8 w-8 animate-spin" />
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
              <div className="flex min-h-[300px] items-center justify-center">
                <div role="alert" className="max-w-md space-y-4 text-center">
                  <div className="flex justify-center">
                    <HiExclamationCircle className="text-destructive h-12 w-12" />
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
                    disabled={isRefetching}
                  >
                    {isRefetching ? (
                      <PiSpinnerGapBold className="h-4 w-4 animate-spin" />
                    ) : (
                      <HiArrowPath className="h-4 w-4" />
                    )}
                    {isRefetching ? "Retrying..." : "Try Again"}
                  </Button>
                </div>
              </div>
            ) : data && candidates.length === 0 ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="max-w-md space-y-4 text-center">
                  <div className="flex justify-center">
                    <HiUsers className="text-muted-foreground h-12 w-12" />
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
                      Please contact support or try again later.
                    </p>
                  </div>
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    className="gap-2"
                    disabled={isRefetching}
                  >
                    {isRefetching ? (
                      <PiSpinnerGapBold className="h-4 w-4 animate-spin" />
                    ) : (
                      <HiArrowPath className="h-4 w-4" />
                    )}
                    {isRefetching ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>
              </div>
            ) : (
              <Tabs
                value={effectiveActiveTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="overflow-x-auto pb-2">
                  <TabsList className="inline-flex h-auto w-full min-w-fit gap-1 bg-transparent pt-1 sm:w-auto">
                    {availablePositions.map((position) => {
                      const positionCandidates =
                        candidatesByPosition[position] || [];
                      const positionInfo = getPositionInfo(
                        position as Candidate["position"],
                      );
                      const PositionIcon = positionInfo.icon;
                      const isSelected =
                        selections[position] && selections[position] !== "";
                      const isActive = effectiveActiveTab === position;

                      return (
                        <TabsTrigger
                          key={position}
                          value={position}
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border-border/60 relative rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:px-4 sm:text-sm"
                        >
                          <PositionIcon className="mr-1.5 hidden h-3.5 w-3.5 sm:inline-block" />
                          <span className="hidden sm:inline">
                            {positionInfo.label}
                          </span>
                          <span className="sm:hidden">
                            {positionInfo.label.split(" ")[0]}
                          </span>
                          <Badge
                            variant={isSelected ? "default" : "outline"}
                            className={cn(
                              "relative z-10 ml-1.5 flex h-5 min-w-5 items-center justify-center gap-0.5 px-1.5 text-[10px] font-semibold",
                              isSelected &&
                                "border-green-800 bg-green-700 text-white",
                            )}
                          >
                            <HiUsers
                              className={cn(
                                "h-2.5 w-2.5",
                                isSelected
                                  ? "text-white"
                                  : isActive
                                    ? "text-primary-foreground"
                                    : "text-muted-foreground",
                              )}
                            />
                            <span
                              className={cn(
                                "text-xs",
                                isActive
                                  ? "text-primary-foreground"
                                  : isSelected
                                    ? "text-white"
                                    : "text-muted-foreground",
                              )}
                            >
                              {positionCandidates.length}
                            </span>
                          </Badge>
                          {isSelected && (
                            <div className="border-background absolute -top-1.5 -right-1 z-20 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-green-600">
                              <HiCheckCircle className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </div>

                {/* Candidates Content - Only render for available positions */}
                {availablePositions.map((position) => {
                  const positionCandidates =
                    candidatesByPosition[position] || [];
                  const filtered = getFilteredCandidates(positionCandidates);
                  const hasNoMatches =
                    positionCandidates.length > 0 && filtered.length === 0;

                  return (
                    <TabsContent
                      key={position}
                      value={position}
                      className="space-y-4"
                    >
                      {hasNoMatches ? (
                        <div className="border-border/60 bg-muted/20 flex min-h-[200px] items-center justify-center rounded-lg border p-8">
                          <div className="max-w-sm space-y-3 text-center">
                            <HiUsers className="text-muted-foreground mx-auto h-10 w-10" />
                            <div className="space-y-1">
                              <h3 className="text-foreground text-sm font-semibold">
                                No matches found
                              </h3>
                              <p className="text-muted-foreground text-xs">
                                Try adjusting your search or filters to see more
                                candidates.
                              </p>
                            </div>
                            {hasFiltersApplied && (
                              <Button
                                onClick={handleResetFilters}
                                variant="outline"
                                size="sm"
                              >
                                Clear filters
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : filtered.length > 0 ? (
                        <>
                          {/* Selected Candidate Filtered Out Indicator */}
                          {selectedCandidate &&
                            !filtered.some(
                              (c) => c.id === selectedCandidate.id,
                            ) && (
                              <div className="border-primary/20 bg-primary/5 rounded-lg border p-3 sm:p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex items-start gap-3">
                                    <HiExclamationCircle className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                                    <div className="min-w-0 flex-1 space-y-1">
                                      <p className="text-foreground text-sm font-semibold">
                                        Your selected candidate is hidden
                                      </p>
                                      <p className="text-muted-foreground text-xs">
                                        <span className="font-medium">
                                          {selectedCandidate.name}
                                        </span>{" "}
                                        is selected but not visible due to
                                        current filters or tab selection.
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                                    {hasFiltersApplied && (
                                      <Button
                                        onClick={handleResetFilters}
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                      >
                                        Clear filters
                                      </Button>
                                    )}
                                    {selectedCandidate.position !==
                                      position && (
                                      <Button
                                        onClick={() => {
                                          setActiveTab(
                                            selectedCandidate.position,
                                          );
                                        }}
                                        variant="default"
                                        size="sm"
                                        className="h-8 text-xs"
                                      >
                                        View in{" "}
                                        {
                                          getPositionInfo(
                                            selectedCandidate.position,
                                          ).label
                                        }
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                          <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1 sm:max-h-[500px] lg:max-h-[600px]">
                            <RadioGroup
                              value={selections[position]}
                              onValueChange={(value) =>
                                setSelections((prev) => ({
                                  ...prev,
                                  [position]: value,
                                }))
                              }
                              aria-label={`${position} candidate options`}
                              className={cn(
                                "w-full gap-3",
                                // Force list view on mobile, respect viewMode on larger screens
                                viewMode === "grid"
                                  ? "flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3"
                                  : "flex flex-col",
                              )}
                            >
                              {filtered.map((candidate: Candidate) => {
                                const isSelected =
                                  selections[position] === candidate.id;
                                const isUndecided =
                                  candidate.id === "cand-undecided";
                                const positionInfo = getPositionInfo(
                                  candidate.position,
                                );
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
                                        "group block cursor-pointer rounded-lg border transition-all duration-200",
                                        // Force list view on mobile
                                        viewMode === "grid"
                                          ? "h-full p-3 sm:p-4"
                                          : "p-3 sm:p-4",
                                        isSelected
                                          ? "border-primary bg-primary/5"
                                          : "border-border/60 bg-card hover:border-primary/40 hover:bg-muted/30",
                                      )}
                                    >
                                      {/* Force list view on mobile, respect viewMode on larger screens */}
                                      <div className="block sm:hidden">
                                        {/* Mobile: Always List View */}
                                        <div className="flex items-center gap-3">
                                          <Avatar className="border-border/60 h-10 w-10 shrink-0 border-2">
                                            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                              {candidate.name
                                                .charAt(0)
                                                .toUpperCase() || "N/A"}
                                            </AvatarFallback>
                                          </Avatar>

                                          <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="min-w-0 flex-1">
                                                <h3 className="text-foreground text-sm leading-tight font-semibold">
                                                  {candidate.name}
                                                </h3>
                                                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                                  {!isUndecided && (
                                                    <>
                                                      <Badge
                                                        variant={
                                                          positionInfo.variant
                                                        }
                                                        className="gap-1 text-[10px] font-medium"
                                                      >
                                                        <PositionIcon className="h-3 w-3" />
                                                        {positionInfo.label}
                                                      </Badge>
                                                      <span className="text-muted-foreground text-xs">
                                                        {candidate.party}
                                                      </span>
                                                      {candidate.supporters !==
                                                        undefined && (
                                                        <span className="text-muted-foreground text-xs">
                                                          •{" "}
                                                          {candidate.supporters.toLocaleString()}{" "}
                                                          supporters
                                                        </span>
                                                      )}
                                                    </>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Radio indicator */}
                                              <div className="shrink-0">
                                                <div
                                                  className={cn(
                                                    "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                                                    isSelected
                                                      ? "border-primary bg-primary"
                                                      : "border-muted-foreground/40 group-hover:border-primary/60",
                                                  )}
                                                >
                                                  {isSelected && (
                                                    <div className="bg-primary-foreground h-2.5 w-2.5 rounded-full" />
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {viewMode === "grid" ? (
                                        // Grid View - Desktop Only
                                        <div className="hidden h-full min-h-[180px] flex-col sm:flex">
                                          <div className="flex items-start gap-3">
                                            <Avatar className="border-border/60 h-11 w-11 shrink-0 border-2 sm:h-12 sm:w-12">
                                              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold sm:text-base">
                                                {candidate.name
                                                  .charAt(0)
                                                  .toUpperCase() || "N/A"}
                                              </AvatarFallback>
                                            </Avatar>

                                            <div className="min-w-0 flex-1 space-y-1.5">
                                              <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                  <h3 className="text-foreground text-sm leading-tight font-semibold">
                                                    {candidate.name}
                                                  </h3>
                                                  {!isUndecided && (
                                                    <p className="text-muted-foreground text-xs">
                                                      {candidate.party}
                                                    </p>
                                                  )}
                                                </div>

                                                {/* Radio indicator */}
                                                <div className="shrink-0">
                                                  <div
                                                    className={cn(
                                                      "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                                                      isSelected
                                                        ? "border-primary bg-primary"
                                                        : "border-muted-foreground/40 group-hover:border-primary/60",
                                                    )}
                                                  >
                                                    {isSelected && (
                                                      <div className="bg-primary-foreground h-2.5 w-2.5 rounded-full" />
                                                    )}
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Position Badge */}
                                              {!isUndecided && (
                                                <Badge
                                                  variant={positionInfo.variant}
                                                  className="gap-1 text-[10px] font-medium sm:text-xs"
                                                >
                                                  <PositionIcon className="h-3 w-3" />
                                                  {positionInfo.label}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>

                                          {/* Details */}
                                          {!isUndecided && (
                                            <>
                                              <Separator className="my-2" />
                                              <div className="space-y-1.5">
                                                <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                                  <HiLocationMarker className="h-3.5 w-3.5 shrink-0" />
                                                  <span className="truncate">
                                                    {candidate.constituency}
                                                  </span>
                                                </div>

                                                {candidate.supporters !==
                                                  undefined && (
                                                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                                    <HiUsers className="h-3.5 w-3.5 shrink-0" />
                                                    <span>
                                                      {candidate.supporters.toLocaleString()}{" "}
                                                      supporters
                                                    </span>
                                                  </div>
                                                )}

                                                {candidate.description && (
                                                  <p className="text-muted-foreground mt-1.5 line-clamp-2 text-xs leading-relaxed">
                                                    {candidate.description}
                                                  </p>
                                                )}
                                              </div>
                                            </>
                                          )}

                                          {/* Undecided message */}
                                          {isUndecided && (
                                            <p className="text-muted-foreground mt-auto text-xs leading-relaxed">
                                              You can update your choice within
                                              7 days of registration.
                                            </p>
                                          )}
                                        </div>
                                      ) : (
                                        // List View - Desktop Only (Mobile has separate view above)
                                        <div className="hidden items-center gap-3 sm:flex">
                                          <Avatar className="border-border/60 h-10 w-10 shrink-0 border-2 sm:h-12 sm:w-12">
                                            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                              {candidate.name
                                                .charAt(0)
                                                .toUpperCase() || "N/A"}
                                            </AvatarFallback>
                                          </Avatar>

                                          <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="min-w-0 flex-1">
                                                <h3 className="text-foreground text-sm leading-tight font-semibold">
                                                  {candidate.name}
                                                </h3>
                                                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                                  {!isUndecided && (
                                                    <>
                                                      <Badge
                                                        variant={
                                                          positionInfo.variant
                                                        }
                                                        className="gap-1 text-[10px] font-medium"
                                                      >
                                                        <PositionIcon className="h-3 w-3" />
                                                        {positionInfo.label}
                                                      </Badge>
                                                      <span className="text-muted-foreground text-xs">
                                                        {candidate.party}
                                                      </span>
                                                      {candidate.supporters !==
                                                        undefined && (
                                                        <span className="text-muted-foreground text-xs">
                                                          •{" "}
                                                          {candidate.supporters.toLocaleString()}{" "}
                                                          supporters
                                                        </span>
                                                      )}
                                                    </>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Radio indicator */}
                                              <div className="shrink-0">
                                                <div
                                                  className={cn(
                                                    "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                                                    isSelected
                                                      ? "border-primary bg-primary"
                                                      : "border-muted-foreground/40 group-hover:border-primary/60",
                                                  )}
                                                >
                                                  {isSelected && (
                                                    <div className="bg-primary-foreground h-2.5 w-2.5 rounded-full" />
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </Label>
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          </div>
                        </>
                      ) : null}
                    </TabsContent>
                  );
                })}
              </Tabs>
            )}

            {/* Action Buttons */}
            {!isLoading &&
              !isPending &&
              !error &&
              data &&
              candidates.length > 0 && (
                <>
                  <Separator />
                  {!isComplete && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900/50 dark:bg-amber-950/20">
                      <p className="font-medium text-amber-900 dark:text-amber-200">
                        ⚠️ All {totalPositions} available positions must be
                        selected
                      </p>
                      <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                        You have selected {selectedCount} out of{" "}
                        {totalPositions} available positions. Please complete
                        all selections to continue.
                      </p>
                    </div>
                  )}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/register/location")}
                      className="h-10 flex-1"
                    >
                      <HiArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground h-10 flex-1 bg-linear-to-r font-semibold transition-all duration-200"
                      disabled={!isComplete}
                    >
                      Continue
                      <HiArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}

            {/* Error State Actions */}
            {!isLoading && !isPending && error && (
              <>
                <Separator />
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/register/location")}
                    className="flex-1"
                  >
                    <HiArrowLeft className="mr-2 h-4 w-4" />
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
                    <HiArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trust Indicators */}
      <TrustIndicators
        items={[
          {
            icon: <HiShieldCheck className="h-4 w-4" />,
            label: "Verified Candidates",
          },
          {
            icon: <HiLocationMarker className="h-4 w-4" />,
            label: "Location Scoped",
          },
          { icon: <HiUsers className="h-4 w-4" />, label: "Data Integrity" },
        ]}
      />
    </div>
  );
}
