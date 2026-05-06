"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { HiX } from "react-icons/hi";

import { AdminToolbarFilterSheet } from "@/components/admin/shared/admin-toolbar-filter-sheet";

import type { Candidate } from "@/types/candidate";
import { cn } from "@/lib/utils";

interface CandidateFiltersProps {
  partyFilter: string;
  positionFilter: string;
  sort: "name" | "date";
  uniqueParties: string[];
  uniquePositions: Candidate["position"][];
  onFilterChange: (filter: {
    party?: string;
    position?: string;
    sort?: "name" | "date";
  }) => void;
  onReset: () => void;
  hasFilters: boolean;
}

export function CandidateFilters({
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
            Sort
          </p>
        ) : null}
        <Select
          value={sort}
          onValueChange={(value) =>
            onFilterChange({ sort: value as "name" | "date" })
          }
        >
          <SelectTrigger
            className={cn(
              "border-border/60 rounded-sm shadow-none",
              triggerHeightClass,
              fullWidthTriggers ? "w-full" : "w-full md:w-[160px]",
            )}
          >
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Newest first</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  return (
    <div className="w-full">
      <div className="md:hidden">
        <AdminToolbarFilterSheet
          triggerLabel="Directory filters"
          sheetTitle="Directory filters"
          sheetDescription="Party, office, and sort order. Search stays on the screen above."
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

      <div className="hidden flex-col gap-3 md:flex md:flex-row md:items-start md:justify-between">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {selects({
            fieldLabels: false,
            fullWidthTriggers: false,
            triggerHeightClass: "h-9",
          })}
        </div>

        {hasFilters ? (
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={onReset}
            className="border-border/60 h-9 shrink-0 gap-2 rounded-sm font-mono text-[11px] tracking-widest uppercase shadow-none"
          >
            <HiX className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        ) : null}
      </div>
    </div>
  );
}
