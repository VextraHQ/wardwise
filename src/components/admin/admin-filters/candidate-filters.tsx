"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HiX } from "react-icons/hi";
import type { Candidate } from "@/types/candidate";

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
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Select
          value={partyFilter}
          onValueChange={(value) => onFilterChange({ party: value })}
        >
          <SelectTrigger className="border-border/60 h-9 w-full rounded-sm sm:w-[160px]">
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
          value={positionFilter}
          onValueChange={(value) => onFilterChange({ position: value })}
        >
          <SelectTrigger className="border-border/60 h-9 w-full rounded-sm sm:w-[180px]">
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

        <Select
          value={sort}
          onValueChange={(value) =>
            onFilterChange({ sort: value as "name" | "date" })
          }
        >
          <SelectTrigger className="border-border/60 h-9 w-full rounded-sm sm:w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Newest first</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="border-border/60 h-9 w-full gap-2 rounded-sm font-mono text-[11px] tracking-widest uppercase sm:w-auto"
        >
          <HiX className="h-3.5 w-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
