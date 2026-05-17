"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AdminToolbarFilterSheet } from "@/features/admin-shell/components/shared/admin-toolbar-filter-sheet";

import type { Candidate } from "@/features/candidates/types/candidate.types";
import { cn } from "@/lib/utils";

export type CandidateCollectFilter =
  | "all"
  | "has-active"
  | "has-inactive"
  | "no-campaign";

export type CandidateInsightsFilter = "all" | "insights-on" | "insights-off";

export type CandidateSort = "date" | "name" | "campaigns" | "supporters";

interface CandidateFiltersProps {
  collectFilter: CandidateCollectFilter;
  insightsFilter: CandidateInsightsFilter;
  partyFilter: string;
  positionFilter: string;
  sort: CandidateSort;
  uniqueParties: string[];
  uniquePositions: Candidate["position"][];
  onFilterChange: (filter: {
    collect?: CandidateCollectFilter;
    insights?: CandidateInsightsFilter;
    party?: string;
    position?: string;
    sort?: CandidateSort;
  }) => void;
  onReset: () => void;
  hasFilters: boolean;
}

export function CandidateFilters({
  collectFilter,
  insightsFilter,
  partyFilter,
  positionFilter,
  sort,
  uniqueParties,
  uniquePositions,
  onFilterChange,
  onReset,
  hasFilters,
}: CandidateFiltersProps) {
  const refineCount =
    (collectFilter !== "all" ? 1 : 0) +
    (insightsFilter !== "all" ? 1 : 0) +
    (partyFilter !== "all" ? 1 : 0) +
    (positionFilter !== "all" ? 1 : 0) +
    (sort !== "date" ? 1 : 0);

  const selects = ({
    fieldLabels,
    fullWidthTriggers,
    triggerHeightClass,
  }: {
    fieldLabels: boolean;
    fullWidthTriggers: boolean;
    triggerHeightClass: string;
  }) => (
    <>
      <div className={cn(fieldLabels ? "space-y-2" : "contents")}>
        {fieldLabels ? (
          <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
            Collect
          </p>
        ) : null}
        <Select
          value={collectFilter}
          onValueChange={(value) =>
            onFilterChange({ collect: value as CandidateCollectFilter })
          }
        >
          <SelectTrigger
            className={cn(
              "border-border/60 rounded-sm shadow-none",
              triggerHeightClass,
              fullWidthTriggers ? "w-full" : "w-full md:w-[210px]",
            )}
          >
            <SelectValue placeholder="Any engagement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any engagement</SelectItem>
            <SelectItem value="has-active">Has active campaign</SelectItem>
            <SelectItem value="has-inactive">
              Has campaign (inactive)
            </SelectItem>
            <SelectItem value="no-campaign">No campaign yet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={cn(fieldLabels ? "space-y-2" : "contents")}>
        {fieldLabels ? (
          <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
            Insights
          </p>
        ) : null}
        <Select
          value={insightsFilter}
          onValueChange={(value) =>
            onFilterChange({ insights: value as CandidateInsightsFilter })
          }
        >
          <SelectTrigger
            className={cn(
              "border-border/60 rounded-sm shadow-none",
              triggerHeightClass,
              fullWidthTriggers ? "w-full" : "w-full md:w-[150px]",
            )}
          >
            <SelectValue placeholder="All insights" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All insights</SelectItem>
            <SelectItem value="insights-on">Insights on</SelectItem>
            <SelectItem value="insights-off">Insights off</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={cn(fieldLabels ? "space-y-2" : "contents")}>
        {fieldLabels ? (
          <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
            Position
          </p>
        ) : null}
        <Select
          value={positionFilter}
          onValueChange={(value) => onFilterChange({ position: value })}
        >
          <SelectTrigger
            className={cn(
              "border-border/60 rounded-sm shadow-none",
              triggerHeightClass,
              fullWidthTriggers ? "w-full" : "w-full md:w-[180px]",
            )}
          >
            <SelectValue placeholder="All positions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All positions</SelectItem>
            {uniquePositions.map((position) => (
              <SelectItem key={position} value={position}>
                {position}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={cn(fieldLabels ? "space-y-2" : "contents")}>
        {fieldLabels ? (
          <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
            Party
          </p>
        ) : null}
        <Select
          value={partyFilter}
          onValueChange={(value) => onFilterChange({ party: value })}
        >
          <SelectTrigger
            className={cn(
              "border-border/60 rounded-sm shadow-none",
              triggerHeightClass,
              fullWidthTriggers ? "w-full" : "w-full md:w-[160px]",
            )}
          >
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
      </div>

      <div className={cn(fieldLabels ? "space-y-2" : "contents")}>
        {fieldLabels ? (
          <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
            Sort
          </p>
        ) : null}
        <Select
          value={sort}
          onValueChange={(value) =>
            onFilterChange({ sort: value as CandidateSort })
          }
        >
          <SelectTrigger
            className={cn(
              "border-border/60 rounded-sm shadow-none",
              triggerHeightClass,
              fullWidthTriggers ? "w-full" : "w-full md:w-[180px]",
            )}
          >
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Newest first</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
            <SelectItem value="campaigns">Most campaigns</SelectItem>
            <SelectItem value="supporters">Most supporters</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  return (
    <div className="w-full min-w-0 xl:w-auto xl:shrink-0">
      <div className="md:hidden">
        <AdminToolbarFilterSheet
          triggerLabel="Directory filters"
          sheetTitle="Directory filters"
          sheetDescription="Engagement, demographics, and sort order. Account status and search stay on the screen above."
          refineCount={refineCount}
          showResetFooter={hasFilters}
          onReset={onReset}
        >
          <div className="flex flex-col gap-5">
            {selects({
              fieldLabels: true,
              fullWidthTriggers: true,
              triggerHeightClass: "h-10",
            })}
          </div>
        </AdminToolbarFilterSheet>
      </div>

      <div className="hidden flex-wrap items-center gap-2 md:flex md:gap-3">
        {selects({
          fieldLabels: false,
          fullWidthTriggers: false,
          triggerHeightClass: "h-9",
        })}
      </div>
    </div>
  );
}
