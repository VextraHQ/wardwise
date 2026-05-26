"use client";

import { useRouter } from "next/navigation";
import { HiOutlineUserAdd, HiX } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminSearchBar } from "@/components/shared/admin/admin-search-bar";
import { CandidateFilters } from "@/features/admin/components/filters/candidate-filters";
import { AdminFilterTabs } from "@/components/shared/admin/admin-filter-tabs";
import { cn } from "@/lib/utils";
import {
  CANDIDATE_STATUS_TABS,
  useCandidateDirectory,
} from "@/features/candidates/hooks/use-candidate-directory";
import { CandidateDirectoryRecords } from "@/features/candidates/components/candidate-directory-records";

export function CandidateManagement() {
  const router = useRouter();
  const directory = useCandidateDirectory();

  const {
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
  } = directory;

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <div className="border-border/60 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-primary mb-1 font-mono text-[10px] font-bold tracking-widest uppercase">
            Directory
          </p>
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            Candidate Accounts
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Profiles, constituency scope, account status, and Collect shortcuts.
          </p>
        </div>

        <Button
          onClick={() => router.push("/admin/candidates/new")}
          className="h-9 w-full gap-2 rounded-sm font-mono text-[11px] tracking-widest uppercase sm:w-auto"
        >
          <HiOutlineUserAdd className="h-4 w-4" />
          Create Candidate
        </Button>
      </div>

      {!error ? (
        isLoading ? (
          <div className="border-border/60 flex flex-col gap-2 border-b py-2 md:flex-row md:items-center md:justify-between md:gap-3 md:py-1">
            <div className="flex w-full min-w-0 items-center gap-1.5 overflow-hidden md:flex-1">
              {["w-12", "w-20", "w-32", "w-16", "w-24"].map((widthClass, i) => (
                <Skeleton
                  key={i}
                  className={cn("h-7 shrink-0 rounded-sm", widthClass)}
                />
              ))}
            </div>
            <Skeleton className="h-4 w-20 shrink-0 rounded-sm md:ml-auto" />
          </div>
        ) : (
          <div className="border-border/60 flex flex-col gap-2 border-b py-2 md:flex-row md:items-center md:justify-between md:gap-3 md:py-1">
            <AdminFilterTabs
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCandidatePage(1);
              }}
              ariaLabel="Filter candidates by account status"
              className="max-w-fit md:flex-1"
              options={CANDIDATE_STATUS_TABS.map(({ value, label }) => ({
                value,
                label,
                count: statusCounts[value],
              }))}
            />

            <div className="border-border/40 text-muted-foreground flex w-full items-center justify-end gap-3 border-t pt-2 md:w-auto md:shrink-0 md:justify-end md:border-t-0 md:pt-0 md:pl-2">
              <span className="font-mono text-[10px] font-bold tracking-widest whitespace-nowrap uppercase tabular-nums">
                {candidateCountLabel}
              </span>
              {activeFilters ? (
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={resetDirectoryFilters}
                  aria-label="Reset search and filters"
                  className="border-border/60 hover:bg-muted h-7 shrink-0 gap-1.5 rounded-sm px-2.5 font-mono text-[10px] font-bold tracking-widest uppercase shadow-none"
                >
                  <HiX className="h-3 w-3" />
                  Reset
                </Button>
              ) : null}
            </div>
          </div>
        )
      ) : null}

      <div className="border-border/60 flex flex-col gap-3 border-b py-4">
        <AdminSearchBar
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value);
            setCandidatePage(1);
          }}
          onClear={() => setCandidatePage(1)}
          placeholder="Search candidates by name, email, party, position, or constituency"
          mobilePlaceholder="Search name, email, party…"
        />

        <CandidateFilters
          collectFilter={collectFilter}
          insightsFilter={insightsFilter}
          partyFilter={partyFilter}
          positionFilter={positionFilter}
          sort={candidateSort}
          uniqueParties={uniqueParties}
          uniquePositions={uniquePositions}
          onFilterChange={({ collect, insights, party, position, sort }) => {
            if (collect !== undefined) setCollectFilter(collect);
            if (insights !== undefined) setInsightsFilter(insights);
            if (party !== undefined) setPartyFilter(party);
            if (position !== undefined) setPositionFilter(position);
            if (sort !== undefined) setCandidateSort(sort);
            setCandidatePage(1);
          }}
          onReset={resetDirectoryFilters}
          hasFilters={activeFilters}
        />
      </div>

      <CandidateDirectoryRecords
        isLoading={isLoading}
        error={error}
        hasSearchQuery={hasSearchQuery}
        hasActiveCandidateFilters={hasActiveCandidateFilters}
        filteredCandidates={filteredCandidates}
        paginatedCandidates={paginatedCandidates}
        filteredCount={filteredCandidates.length}
        snOffset={snOffset}
        safeCandidatePage={safeCandidatePage}
        candidateTotalPages={candidateTotalPages}
        candidatePageSize={candidatePageSize}
        onResetFilters={resetDirectoryFilters}
        onPageChange={setCandidatePage}
        onPageSizeChange={setCandidatePageSize}
      />
    </div>
  );
}
