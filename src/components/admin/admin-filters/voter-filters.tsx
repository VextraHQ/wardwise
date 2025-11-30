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

interface VoterFiltersProps {
  stateFilter: string;
  lgaFilter: string;
  sort: "name" | "date";
  uniqueStates: string[];
  uniqueLgas: string[];
  onFilterChange: (filter: {
    state?: string;
    lga?: string;
    sort?: "name" | "date";
  }) => void;
  onReset: () => void;
  hasFilters: boolean;
}

export function VoterFilters({
  stateFilter,
  lgaFilter,
  sort,
  uniqueStates,
  uniqueLgas,
  onFilterChange,
  onReset,
  hasFilters,
}: VoterFiltersProps) {
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
          value={sort}
          onValueChange={(value) =>
            onFilterChange({ sort: value as "name" | "date" })
          }
        >
          <SelectTrigger className="border-border/50 h-9 w-full sm:w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
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
