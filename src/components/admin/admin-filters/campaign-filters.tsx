"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminToolbarFilterSheet } from "@/components/admin/shared/admin-toolbar-filter-sheet";

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

export type CampaignActivityFilter =
  | "all"
  | "live"
  | "stale"
  | "no-submissions";

interface CampaignFiltersProps {
  activityFilter: CampaignActivityFilter;
  reportFilter: CampaignReportFilter;
  sort: CampaignSort;
  onFilterChange: (filter: {
    activity?: CampaignActivityFilter;
    report?: CampaignReportFilter;
    sort?: CampaignSort;
  }) => void;
  onReset: () => void;
  hasFilters: boolean;
}

export function CampaignFilters({
  activityFilter,
  reportFilter,
  sort,
  onFilterChange,
  onReset,
  hasFilters,
}: CampaignFiltersProps) {
  const refineCount =
    (activityFilter !== "all" ? 1 : 0) +
    (reportFilter !== "all" ? 1 : 0) +
    (sort !== "recent-activity" ? 1 : 0);

  return (
    <div className="w-full min-w-0 xl:w-auto xl:shrink-0">
      <div className="md:hidden">
        <AdminToolbarFilterSheet
          triggerLabel="Campaign filters"
          sheetTitle="Campaign filters"
          sheetDescription="Activity, insights, and sort order. Use the status tabs below for Active, Draft, Paused, or Closed. Search stays above."
          refineCount={refineCount}
          showResetFooter={hasFilters}
          onReset={onReset}
        >
          <div className="flex flex-col gap-5">
            <div className="space-y-2">
              <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                Activity
              </p>
              <Select
                value={activityFilter}
                onValueChange={(value) =>
                  onFilterChange({ activity: value as CampaignActivityFilter })
                }
              >
                <SelectTrigger className="border-border/60 h-10 w-full rounded-sm shadow-none">
                  <SelectValue placeholder="All activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All activity</SelectItem>
                  <SelectItem value="live">Live (≤ 48h)</SelectItem>
                  <SelectItem value="stale">Stale (&gt; 48h)</SelectItem>
                  <SelectItem value="no-submissions">
                    No submissions yet
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                Insights
              </p>
              <Select
                value={reportFilter}
                onValueChange={(value) =>
                  onFilterChange({ report: value as CampaignReportFilter })
                }
              >
                <SelectTrigger className="border-border/60 h-10 w-full rounded-sm shadow-none">
                  <SelectValue placeholder="All reports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All reports</SelectItem>
                  <SelectItem value="insights-on">Insights on</SelectItem>
                  <SelectItem value="insights-off">Insights off</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                Sort
              </p>
              <Select
                value={sort}
                onValueChange={(value) =>
                  onFilterChange({ sort: value as CampaignSort })
                }
              >
                <SelectTrigger className="border-border/60 h-10 w-full rounded-sm shadow-none">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent-activity">
                    Recent activity
                  </SelectItem>
                  <SelectItem value="newest-first">Newest first</SelectItem>
                  <SelectItem value="most-submissions">
                    Most submissions
                  </SelectItem>
                  <SelectItem value="name-a-z">Name (A–Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </AdminToolbarFilterSheet>
      </div>

      <div className="hidden flex-wrap items-center gap-2 md:flex">
        <Select
          value={activityFilter}
          onValueChange={(value) =>
            onFilterChange({ activity: value as CampaignActivityFilter })
          }
        >
          <SelectTrigger className="border-border/60 h-9 w-[170px] rounded-sm shadow-none">
            <SelectValue placeholder="All activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All activity</SelectItem>
            <SelectItem value="live">Live (≤ 48h)</SelectItem>
            <SelectItem value="stale">Stale (&gt; 48h)</SelectItem>
            <SelectItem value="no-submissions">No submissions yet</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={reportFilter}
          onValueChange={(value) =>
            onFilterChange({ report: value as CampaignReportFilter })
          }
        >
          <SelectTrigger className="border-border/60 h-9 w-[160px] rounded-sm shadow-none">
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
          <SelectTrigger className="border-border/60 h-9 w-[190px] rounded-sm shadow-none">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent-activity">Recent activity</SelectItem>
            <SelectItem value="newest-first">Newest first</SelectItem>
            <SelectItem value="most-submissions">Most submissions</SelectItem>
            <SelectItem value="name-a-z">Name (A–Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
