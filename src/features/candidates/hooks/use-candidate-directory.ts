"use client";

import { useMemo, useState } from "react";
import { useAdminCandidates } from "@/features/admin/hooks/use-admin";
import type { Candidate } from "@/features/candidates/types/candidate.types";
import type {
  CandidateCollectFilter,
  CandidateInsightsFilter,
  CandidateSort,
} from "@/features/admin/components/filters/candidate-filters";

export type CandidateStatusFilter =
  | "all"
  | "pending"
  | "credentials_sent"
  | "active"
  | "suspended";

export const CANDIDATE_STATUS_TABS: {
  value: CandidateStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "credentials_sent", label: "Credentials Sent" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

export function useCandidateDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<CandidateStatusFilter>("all");
  const [collectFilter, setCollectFilter] =
    useState<CandidateCollectFilter>("all");
  const [insightsFilter, setInsightsFilter] =
    useState<CandidateInsightsFilter>("all");
  const [partyFilter, setPartyFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [candidateSort, setCandidateSort] = useState<CandidateSort>("date");
  const [candidatePage, setCandidatePage] = useState(1);
  const [candidatePageSize, setCandidatePageSize] = useState(10);

  const { data: candidates = [], isLoading, error } = useAdminCandidates();
  const hasSearchQuery = searchQuery.trim().length > 0;

  const statusCounts: Record<CandidateStatusFilter, number> = useMemo(
    () => ({
      all: candidates.length,
      pending: candidates.filter((c) => c.onboardingStatus === "pending")
        .length,
      credentials_sent: candidates.filter(
        (c) => c.onboardingStatus === "credentials_sent",
      ).length,
      active: candidates.filter((c) => c.onboardingStatus === "active").length,
      suspended: candidates.filter((c) => c.onboardingStatus === "suspended")
        .length,
    }),
    [candidates],
  );

  const uniqueParties = useMemo(
    () =>
      Array.from(
        new Set(candidates.map((candidate) => candidate.party).filter(Boolean)),
      ).sort(),
    [candidates],
  );

  const uniquePositions = useMemo(
    () =>
      Array.from(
        new Set(
          candidates.map((candidate) => candidate.position).filter(Boolean),
        ),
      ).sort() as Candidate["position"][],
    [candidates],
  );

  const filteredCandidates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = candidates.filter((candidate) => {
      if (statusFilter !== "all" && candidate.onboardingStatus !== statusFilter)
        return false;

      if (collectFilter !== "all") {
        const hasCampaign =
          candidate.hasAnyCampaign ??
          ((candidate.campaignCount ?? 0) > 0 ||
            Boolean(candidate.collectCampaign));
        const hasActiveCampaign =
          candidate.hasActiveCampaign ??
          candidate.collectCampaign?.status === "active";
        if (collectFilter === "has-active" && !hasActiveCampaign) return false;
        if (
          collectFilter === "has-inactive" &&
          (!hasCampaign || hasActiveCampaign)
        )
          return false;
        if (collectFilter === "no-campaign" && hasCampaign) return false;
      }

      if (insightsFilter !== "all") {
        const hasCampaign =
          candidate.hasAnyCampaign ??
          ((candidate.campaignCount ?? 0) > 0 ||
            Boolean(candidate.collectCampaign));
        const insightsOn =
          candidate.hasInsightsEnabledCampaign ??
          Boolean(
            candidate.collectCampaign?.clientReportEnabled &&
            candidate.collectCampaign.clientReportToken,
          );
        if (!hasCampaign) return false;
        if (insightsFilter === "insights-on" && !insightsOn) return false;
        if (insightsFilter === "insights-off" && insightsOn) return false;
      }

      if (partyFilter !== "all" && candidate.party !== partyFilter)
        return false;
      if (positionFilter !== "all" && candidate.position !== positionFilter)
        return false;
      if (!query) return true;

      const searchableFields = [
        candidate.name,
        candidate.party,
        candidate.position,
        candidate.constituency,
        candidate.user?.email,
      ];
      return searchableFields.some((value) =>
        value?.toLowerCase().includes(query),
      );
    });

    filtered.sort((left, right) => {
      switch (candidateSort) {
        case "name":
          return left.name.localeCompare(right.name);
        case "campaigns":
          return (right.campaignCount ?? 0) - (left.campaignCount ?? 0);
        case "supporters":
          return (right.supporterCount ?? 0) - (left.supporterCount ?? 0);
        case "date":
        default:
          return (
            new Date(right.user.createdAt).getTime() -
            new Date(left.user.createdAt).getTime()
          );
      }
    });

    return filtered;
  }, [
    candidates,
    searchQuery,
    statusFilter,
    collectFilter,
    insightsFilter,
    partyFilter,
    positionFilter,
    candidateSort,
  ]);

  const candidateTotalPages = Math.max(
    1,
    Math.ceil(filteredCandidates.length / candidatePageSize),
  );

  const safeCandidatePage = Math.min(candidatePage, candidateTotalPages);

  const paginatedCandidates = useMemo(() => {
    const startIndex = (safeCandidatePage - 1) * candidatePageSize;
    return filteredCandidates.slice(startIndex, startIndex + candidatePageSize);
  }, [filteredCandidates, safeCandidatePage, candidatePageSize]);

  const activeFilters =
    hasSearchQuery ||
    statusFilter !== "all" ||
    collectFilter !== "all" ||
    insightsFilter !== "all" ||
    partyFilter !== "all" ||
    positionFilter !== "all" ||
    candidateSort !== "date";
  const hasActiveCandidateFilters =
    hasSearchQuery ||
    statusFilter !== "all" ||
    collectFilter !== "all" ||
    insightsFilter !== "all" ||
    partyFilter !== "all" ||
    positionFilter !== "all";

  const snOffset = (safeCandidatePage - 1) * candidatePageSize;
  const candidateCountLabel =
    filteredCandidates.length === candidates.length
      ? `${candidates.length.toLocaleString()} total`
      : `${filteredCandidates.length.toLocaleString()} shown`;

  function resetDirectoryFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setCollectFilter("all");
    setInsightsFilter("all");
    setPartyFilter("all");
    setPositionFilter("all");
    setCandidateSort("date");
    setCandidatePage(1);
  }

  return {
    candidates,
    isLoading,
    error,
    hasSearchQuery,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    collectFilter,
    setCollectFilter,
    insightsFilter,
    setInsightsFilter,
    partyFilter,
    setPartyFilter,
    positionFilter,
    setPositionFilter,
    candidateSort,
    setCandidateSort,
    candidatePage,
    setCandidatePage,
    candidatePageSize,
    setCandidatePageSize,
    statusCounts,
    uniqueParties,
    uniquePositions,
    filteredCandidates,
    paginatedCandidates,
    candidateTotalPages,
    safeCandidatePage,
    activeFilters,
    hasActiveCandidateFilters,
    snOffset,
    candidateCountLabel,
    resetDirectoryFilters,
  };
}
