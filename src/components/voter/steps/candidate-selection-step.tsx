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
} from "react-icons/hi";
import { HiArrowPath } from "react-icons/hi2";
import { PiSpinnerGapBold } from "react-icons/pi";
import {
  FaLandmark,
  FaBalanceScale,
  FaBuilding,
  FaUniversity,
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

export function CandidateSelectionStep() {
  const router = useRouter();
  const { update, payload } = useRegistrationStore();
  const [selectedCandidateId, setSelectedCandidateId] = useState(
    payload.candidate?.candidateId || "",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [partyFilter, setPartyFilter] = useState("all");
  const [sortOption, setSortOption] = useState<"name" | "supporters">("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");

  // Get state and lga from payload
  const state = payload.location?.state;
  const lga = payload.location?.lga;

  // Fetch candidates from mock API filtered by location
  const { data, isLoading, isPending, error, refetch } = useQuery({
    queryKey: ["candidates", state, lga],
    queryFn: async () => {
      return await candidateApi.getCandidates(state, lga);
    },
    enabled: !!state,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const candidates: Candidate[] = useMemo(
    () => data?.candidates || [],
    [data?.candidates],
  );

  // Group candidates by position for future multi-selection
  const candidatesByPosition = useMemo(() => {
    const grouped: Record<string, Candidate[]> = {
      all: candidates,
      Governor: [],
      Senator: [],
      "House of Representatives": [],
      "State Assembly": [],
    };

    candidates.forEach((candidate) => {
      if (candidate.position in grouped) {
        grouped[candidate.position].push(candidate);
      }
    });

    return grouped;
  }, [candidates]);

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

  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => candidate.id === selectedCandidateId),
    [candidates, selectedCandidateId],
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setPartyFilter("all");
    setSortOption("name");
  };

  // Helper to get position display info (icon, label, variant)
  const getPositionInfo = (position: Candidate["position"]) => {
    switch (position) {
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
    if (!selectedCandidateId) {
      toast.error("Please select a candidate to continue");
      return;
    }

    update({
      candidate: { candidateId: selectedCandidateId },
    });
    toast.success("Candidate selected!");
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
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          Select Your Candidate
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Choose the candidate you want to support in the upcoming election
        </p>
      </div>

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
              {selectedCandidate && (
                <Badge
                  variant="default"
                  className="gap-1.5 text-xs font-semibold"
                >
                  <HiShieldCheck className="h-3.5 w-3.5" />
                  Selected: {selectedCandidate.name}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
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
                  >
                    <HiArrowPath className="h-4 w-4" />
                    Try Again
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
                  >
                    <HiArrowPath className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>
            ) : (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="overflow-x-auto pb-2">
                  <TabsList className="inline-flex h-auto w-full min-w-fit gap-1 bg-transparent p-0 sm:w-auto">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border-border/60 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:px-4 sm:text-sm"
                    >
                      All ({candidates.length})
                    </TabsTrigger>
                    {Object.entries(candidatesByPosition).map(
                      ([position, positionCandidates]) => {
                        if (
                          position === "all" ||
                          positionCandidates.length === 0
                        )
                          return null;

                        const positionInfo = getPositionInfo(
                          position as Candidate["position"],
                        );
                        const PositionIcon = positionInfo.icon;

                        return (
                          <TabsTrigger
                            key={position}
                            value={position}
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border-border/60 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:px-4 sm:text-sm"
                          >
                            <PositionIcon className="mr-1.5 hidden h-3.5 w-3.5 sm:inline-block" />
                            <span className="hidden sm:inline">
                              {positionInfo.label}
                            </span>
                            <span className="sm:hidden">
                              {positionInfo.label.split(" ")[0]}
                            </span>
                            <Badge
                              variant="secondary"
                              className="ml-1.5 h-4 min-w-6 px-1 text-[10px] font-semibold"
                            >
                              {positionCandidates.length}
                            </Badge>
                          </TabsTrigger>
                        );
                      },
                    )}
                  </TabsList>
                </div>

                {/* Candidates Content */}
                {Object.entries(candidatesByPosition).map(
                  ([position, positionCandidates]) => {
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
                                  Try adjusting your search or filters to see
                                  more candidates.
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
                                value={selectedCandidateId}
                                onValueChange={setSelectedCandidateId}
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
                                    selectedCandidateId === candidate.id;
                                  const isUndecided =
                                    candidate.id === "cand-undecided";
                                  const positionInfo = getPositionInfo(
                                    candidate.position,
                                  );
                                  const PositionIcon = positionInfo.icon;

                                  return (
                                    <div
                                      key={candidate.id}
                                      className="relative"
                                    >
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
                                                    variant={
                                                      positionInfo.variant
                                                    }
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
                                                You can update your choice
                                                within 7 days of registration.
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
                  },
                )}
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
                  <div className="bg-muted/50 border-border/60 rounded-lg border p-4">
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      <strong className="text-foreground font-semibold">
                        Note:
                      </strong>{" "}
                      Currently, you can select <strong>one candidate</strong>{" "}
                      to maintain data integrity. In the future, you'll be able
                      to select one candidate per position (Governor, Senator,
                      House of Reps, State Assembly). You can change your
                      selection once within 7 days of registration.
                    </p>
                  </div>
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
                      disabled={!selectedCandidateId}
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
