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

interface CanvasserFiltersProps {
  stateFilter: string;
  lgaFilter: string;
  candidateFilter: string;
  sort: "name" | "voters" | "date";
  uniqueStates: string[];
  uniqueLgas: string[];
  uniqueCandidates: Array<{ id: string; name: string }>;
  onFilterChange: (filter: {
    state?: string;
    lga?: string;
    candidate?: string;
    sort?: "name" | "voters" | "date";
  }) => void;
  onReset: () => void;
  hasFilters: boolean;
}

export function CanvasserFilters({
  stateFilter,
  lgaFilter,
  candidateFilter,
  sort,
  uniqueStates,
  uniqueLgas,
  uniqueCandidates,
  onFilterChange,
  onReset,
  hasFilters,
}: CanvasserFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Select
          value={stateFilter}
          onValueChange={(value) => onFilterChange({ state: value })}
        >
          <SelectTrigger className="border-border/50 h-9 w-full sm:w-[160px]">
            <SelectValue placeholder="All states" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            {uniqueStates.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={lgaFilter}
          onValueChange={(value) => onFilterChange({ lga: value })}
        >
          <SelectTrigger className="border-border/50 h-9 w-full sm:w-[160px]">
            <SelectValue placeholder="All LGAs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All LGAs</SelectItem>
            {uniqueLgas.map((lga) => (
              <SelectItem key={lga} value={lga}>
                {lga}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={candidateFilter}
          onValueChange={(value) => onFilterChange({ candidate: value })}
        >
          <SelectTrigger className="border-border/50 h-9 w-full sm:w-[180px]">
            <SelectValue placeholder="All candidates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All candidates</SelectItem>
            {uniqueCandidates.map((candidate) => (
              <SelectItem key={candidate.id} value={candidate.id}>
                {candidate.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(value) =>
            onFilterChange({ sort: value as "name" | "voters" | "date" })
          }
        >
          <SelectTrigger className="border-border/50 h-9 w-full sm:w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="voters">Most voters</SelectItem>
            <SelectItem value="date">Newest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="border-border/50 h-9 w-full gap-2 sm:w-auto"
        >
          <HiX className="h-3.5 w-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
