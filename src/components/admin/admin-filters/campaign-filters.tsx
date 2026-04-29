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

export type CampaignSort =
  | "recent-activity"
  | "newest-first"
  | "most-submissions"
  | "name-a-z";

export type CampaignStatusFilter =
  | "all"
  | "active"
  | "draft"
  | "paused"
  | "closed";

export type CampaignReportFilter = "all" | "insights-on" | "insights-off";

interface CampaignFiltersProps {
  reportFilter: CampaignReportFilter;
  sort: CampaignSort;
  onFilterChange: (filter: {
    report?: CampaignReportFilter;
    sort?: CampaignSort;
  }) => void;
  onReset: () => void;
  hasFilters: boolean;
}

export function CampaignFilters({
  reportFilter,
  sort,
  onFilterChange,
  onReset,
  hasFilters,
}: CampaignFiltersProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
      <Select
        value={reportFilter}
        onValueChange={(value) =>
          onFilterChange({ report: value as CampaignReportFilter })
        }
      >
        <SelectTrigger className="border-border/60 h-9 w-full rounded-sm sm:w-[160px]">
          <SelectValue placeholder="All reports" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All reports</SelectItem>
          <SelectItem value="insights-on">Insights on</SelectItem>
          <SelectItem value="insights-off">Insights off</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sort}
        onValueChange={(value) =>
          onFilterChange({ sort: value as CampaignSort })
        }
      >
        <SelectTrigger className="border-border/60 h-9 w-full rounded-sm sm:w-[190px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent-activity">Recent activity</SelectItem>
          <SelectItem value="newest-first">Newest first</SelectItem>
          <SelectItem value="most-submissions">Most submissions</SelectItem>
          <SelectItem value="name-a-z">Name (A–Z)</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="border-border/60 col-span-2 h-9 w-full gap-2 rounded-sm font-mono text-[11px] tracking-widest uppercase sm:w-auto"
        >
          <HiX className="h-3.5 w-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
