"use client";

import { useState } from "react";
import { Activity, BarChart3, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import type { CampaignInsightsScope } from "@/hooks/use-campaign-insights-scope";
import {
  formatDateRangeLabel,
  getPresetRange,
  getReportingDatePickerEndMonth,
  getReportingDatePickerStartMonth,
  getToday,
} from "@/lib/date-ranges";
import {
  formatUpdatedAgo,
  type CampaignReportRangePreset,
} from "@/lib/collect/reporting";
import { formatGeoDisplayName } from "@/lib/geo/display";
import type { CampaignReportSummary } from "@/types/campaign-report";
import {
  IconArrowsExchange,
  IconCalendar,
  IconChevronDown,
  IconFilter,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";
import { Separator } from "@radix-ui/react-separator";

const REPORT_DATE_PRESETS = [
  { label: "Today", value: "today" },
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "All time", value: "all" },
] as const satisfies ReadonlyArray<{
  label: string;
  value: CampaignReportRangePreset;
}>;

type CampaignInsightsHeaderProps = {
  scope: CampaignInsightsScope;
  filterSource: CampaignReportSummary | null;
  dataUpdatedAt: number;
  isFetching: boolean;
  onRefresh: () => void;
};

function ReportFilterOptions({
  filterSource,
  filterLga,
  filterRole,
  onFilterLgaChange,
  onFilterRoleChange,
}: {
  filterSource: CampaignReportSummary | null;
  filterLga: string | null;
  filterRole: string | null;
  onFilterLgaChange: (value: string | null) => void;
  onFilterRoleChange: (value: string | null) => void;
}) {
  if (
    !filterSource ||
    (filterSource.stats.byLga.length === 0 &&
      filterSource.stats.byRole.length === 0)
  ) {
    return (
      <div className="border-border/60 rounded-sm border border-dashed px-3 py-5 text-center">
        <p className="text-muted-foreground text-xs">
          Filter options will appear once submissions start coming in.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filterSource.stats.byLga.length > 0 && (
        <div className="space-y-2">
          <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
            LGA
          </p>
          <div className="flex flex-wrap gap-1.5">
            {filterSource.stats.byLga.slice(0, 8).map((item) => (
              <Button
                key={item.lga}
                variant={filterLga === item.lga ? "default" : "outline"}
                size="sm"
                className="h-7 rounded-sm px-2.5 text-[10px]"
                onClick={() =>
                  onFilterLgaChange(filterLga === item.lga ? null : item.lga)
                }
              >
                {formatGeoDisplayName(item.lga)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {filterSource.stats.byRole.length > 0 && (
        <div className="space-y-2">
          <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
            Role
          </p>
          <div className="flex flex-wrap gap-1.5">
            {filterSource.stats.byRole.slice(0, 6).map((item) => (
              <Button
                key={item.role}
                variant={filterRole === item.role ? "default" : "outline"}
                size="sm"
                className="h-7 rounded-sm px-2.5 text-[10px] capitalize"
                onClick={() =>
                  onFilterRoleChange(
                    filterRole === item.role ? null : item.role,
                  )
                }
              >
                {item.role}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportDesktopDateFilter({ scope }: { scope: CampaignInsightsScope }) {
  const [customOpen, setCustomOpen] = useState(false);
  const today = getToday();
  const hasCustomSelection = !!scope.dateFrom || !!scope.dateTo;
  const customRangeLabel = hasCustomSelection
    ? formatDateRangeLabel(scope.dateRange, { dateFormat: "dd MMM" })
    : "Custom";

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
      <div className="text-muted-foreground flex shrink-0 items-center gap-2 font-mono text-[10px] font-bold tracking-widest uppercase">
        <IconCalendar className="h-4 w-4 shrink-0" aria-hidden />
        <span>Date range</span>
      </div>
      <div
        className="border-border/60 bg-muted/25 flex w-fit max-w-full min-w-0 items-center gap-1 overflow-x-auto rounded-sm border p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-label="Date range"
      >
        {REPORT_DATE_PRESETS.map((preset) => (
          <Button
            key={preset.value}
            type="button"
            variant={scope.activeRange === preset.value ? "default" : "ghost"}
            size="sm"
            className="h-7 shrink-0 rounded-sm px-2.5 font-mono text-[9px] font-bold tracking-wider uppercase"
            onClick={() =>
              scope.setDateRange(getPresetRange(preset.value), preset.value)
            }
          >
            {preset.label}
          </Button>
        ))}
        <Popover open={customOpen} onOpenChange={setCustomOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant={scope.activeRange === "custom" ? "default" : "outline"}
              size="sm"
              className="h-7 shrink-0 rounded-sm px-2.5 font-mono text-[9px] font-bold tracking-wider uppercase"
            >
              <span className="max-w-32 truncate">{customRangeLabel}</span>
              <IconChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="max-h-[min(82dvh,38rem)] w-max max-w-[calc(100vw-2rem)] overflow-y-auto rounded-sm p-0"
            align="start"
            side="bottom"
            sideOffset={8}
            collisionPadding={12}
          >
            <div className="min-w-0">
              <div className="border-border/60 bg-muted/20 border-b px-4 py-3">
                <p className="text-foreground text-sm font-semibold">
                  Custom date range
                </p>
                <p className="text-muted-foreground text-xs">
                  Choose a start and end date, or leave one side open.
                </p>
              </div>
              <div className="flex justify-center px-1 pt-0 pb-1">
                <Calendar
                  mode="range"
                  captionLayout="dropdown"
                  startMonth={getReportingDatePickerStartMonth()}
                  endMonth={getReportingDatePickerEndMonth(today)}
                  numberOfMonths={2}
                  selected={{ from: scope.dateFrom, to: scope.dateTo }}
                  onSelect={(range) =>
                    scope.setDateRange(
                      { from: range?.from, to: range?.to },
                      "custom",
                    )
                  }
                  disabled={(date) => date > today}
                  className="p-2! [--cell-size:1.9rem]"
                />
              </div>
              <div className="border-border/60 bg-muted/10 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-t px-3 py-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-sm px-2 font-mono text-[10px] font-bold tracking-widest uppercase"
                  onClick={scope.clearDate}
                >
                  Clear
                </Button>
                <p className="text-muted-foreground min-w-0 truncate text-center text-xs">
                  {hasCustomSelection
                    ? formatDateRangeLabel(scope.dateRange)
                    : "Choose a start or end date"}
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase"
                  onClick={() => setCustomOpen(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function ReportScopeSheetContent({
  scope,
  filterSource,
}: {
  scope: CampaignInsightsScope;
  filterSource: CampaignReportSummary | null;
}) {
  const today = getToday();
  const hasCustomSelection = !!scope.dateFrom || !!scope.dateTo;

  return (
    <>
      <SheetHeader className="border-border/60 bg-background/95 sticky top-0 z-10 border-b px-4 py-3 pr-10 backdrop-blur">
        <SheetTitle className="font-mono text-sm font-bold tracking-widest uppercase">
          Report Scope
        </SheetTitle>
        <SheetDescription>{scope.activeScopeLabel}</SheetDescription>
      </SheetHeader>

      <div className="max-h-[72dvh] space-y-5 overflow-y-auto px-4 py-4 pb-5">
        <section className="space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
              Date range
            </p>
            <p className="text-muted-foreground truncate text-xs">
              {hasCustomSelection
                ? formatDateRangeLabel(scope.dateRange)
                : "Choose a start or end date"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {REPORT_DATE_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                type="button"
                variant={
                  scope.activeRange === preset.value ? "default" : "outline"
                }
                size="sm"
                className="h-9 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
                onClick={() =>
                  scope.setDateRange(getPresetRange(preset.value), preset.value)
                }
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </section>

        <section className="border-border/60 overflow-hidden rounded-sm border">
          <div className="border-border/60 bg-muted/20 border-b px-4 py-3">
            <p className="text-foreground text-sm font-semibold">
              Custom date range
            </p>
            <p className="text-muted-foreground text-xs">
              Choose a start and end date, or leave one side open.
            </p>
          </div>
          <div className="flex justify-center px-1 pt-0 pb-1">
            <Calendar
              mode="range"
              captionLayout="dropdown"
              startMonth={getReportingDatePickerStartMonth()}
              endMonth={getReportingDatePickerEndMonth(today)}
              numberOfMonths={1}
              selected={{ from: scope.dateFrom, to: scope.dateTo }}
              onSelect={(range) =>
                scope.setDateRange(
                  { from: range?.from, to: range?.to },
                  "custom",
                )
              }
              disabled={(date) => date > today}
              className="p-2! [--cell-size:2rem]"
            />
          </div>
        </section>

        <section className="border-border/60 border-t pt-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                Compare periods
              </p>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                Show movement against the previous matching date range.
              </p>
            </div>
            <Button
              variant={scope.effectiveCompareOn ? "default" : "outline"}
              size="sm"
              className="h-8 shrink-0 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
              onClick={scope.toggleCompare}
              disabled={!scope.canCompare}
            >
              <IconArrowsExchange className="h-3.5 w-3.5" />
              {scope.effectiveCompareOn ? "On" : "Off"}
            </Button>
          </div>
          {!scope.canCompare && (
            <p className="text-muted-foreground mt-2 text-xs">
              Choose a complete date range to compare against the previous
              period.
            </p>
          )}
        </section>

        <section className="border-border/60 border-t pt-4">
          <p className="text-muted-foreground mb-3 font-mono text-[10px] font-bold tracking-widest uppercase">
            Filters
          </p>
          <ReportFilterOptions
            filterSource={filterSource}
            filterLga={scope.filterLga}
            filterRole={scope.filterRole}
            onFilterLgaChange={scope.setFilterLga}
            onFilterRoleChange={scope.setFilterRole}
          />
        </section>
      </div>

      <div className="border-border/60 bg-background/95 grid grid-cols-[auto_minmax(0,1fr)] gap-2 border-t px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] backdrop-blur">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase"
          onClick={scope.clearAll}
          disabled={!scope.hasScopeChanges}
        >
          Clear all
        </Button>
        <Button
          type="button"
          size="sm"
          className="h-9 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
          onClick={() => scope.setFiltersOpen(false)}
        >
          Done
        </Button>
      </div>
    </>
  );
}

function ReportScopeChips({ scope }: { scope: CampaignInsightsScope }) {
  if (!scope.hasScopeChanges) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {scope.hasRange && (
        <Badge
          variant="secondary"
          className="h-6 gap-1 rounded-sm pr-1 text-xs font-medium"
        >
          {scope.compactPeriodLabel}
          <button
            type="button"
            onClick={scope.clearDate}
            className="hover:text-foreground rounded-sm p-0.5"
            aria-label="Clear date range"
          >
            <IconX className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {scope.filterLga && (
        <Badge
          variant="secondary"
          className="h-6 gap-1 rounded-sm pr-1 text-xs font-medium"
        >
          {formatGeoDisplayName(scope.filterLga)}
          <button
            type="button"
            onClick={() => scope.setFilterLga(null)}
            className="hover:text-foreground rounded-sm p-0.5"
          >
            <IconX className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {scope.filterRole && (
        <Badge
          variant="secondary"
          className="h-6 gap-1 rounded-sm pr-1 text-xs font-medium capitalize"
        >
          {scope.filterRole}
          <button
            type="button"
            onClick={() => scope.setFilterRole(null)}
            className="hover:text-foreground rounded-sm p-0.5"
          >
            <IconX className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {scope.effectiveCompareOn && (
        <Badge
          variant="secondary"
          className="h-6 gap-1 rounded-sm pr-1 text-xs font-medium"
        >
          Compare
          <button
            type="button"
            onClick={() => scope.setCompareOn(false)}
            className="hover:text-foreground rounded-sm p-0.5"
          >
            <IconX className="h-3 w-3" />
          </button>
        </Badge>
      )}
      <button
        type="button"
        onClick={scope.clearAll}
        className="text-muted-foreground hover:text-foreground text-xs underline"
      >
        Clear all
      </button>
    </div>
  );
}

export function CampaignInsightsHeader({
  scope,
  filterSource,
  dataUpdatedAt,
  isFetching,
  onRefresh,
}: CampaignInsightsHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className="bg-background/95 sticky top-(--report-site-header-height) z-30 -mx-4 flex flex-col gap-3 border-b border-transparent px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
      <TabsList className="border-border/60 grid h-10 w-full grid-cols-3 rounded-sm border p-1 shadow-xs">
        <TabsTrigger
          className="h-full min-w-0 rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase focus-visible:ring-1 sm:px-4"
          value="overview"
        >
          <BarChart3 className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger
          className="h-full min-w-0 rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase focus-visible:ring-1 sm:px-4"
          value="supporters"
        >
          <ClipboardList className="h-4 w-4" />
          Supporters
        </TabsTrigger>
        <TabsTrigger
          className="h-full min-w-0 rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase focus-visible:ring-1 sm:px-4"
          value="analytics"
        >
          <Activity className="h-4 w-4" />
          Analytics
        </TabsTrigger>
      </TabsList>

      <div className="space-y-2">
        <div className="border-border/60 bg-card/80 flex w-full min-w-0 items-center gap-1 rounded-sm border p-1 shadow-xs">
          {isMobile ? (
            <Sheet open={scope.filtersOpen} onOpenChange={scope.setFiltersOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="focus-visible:border-primary/30 focus-visible:ring-primary/30 h-10 min-w-0 flex-1 justify-start rounded-sm px-2.5 font-mono text-[10px] font-bold tracking-wider uppercase focus-visible:ring-1"
                >
                  <IconCalendar className="h-3.5 w-3.5" />
                  <span className="truncate">{scope.compactPeriodLabel}</span>
                </Button>
              </SheetTrigger>

              <div className="bg-border/60 mx-0.5 h-6 w-px shrink-0" />

              <SheetTrigger asChild>
                <Button
                  variant={scope.hasScopeChanges ? "default" : "ghost"}
                  size="sm"
                  className="focus-visible:border-primary/30 focus-visible:ring-primary/30 h-10 shrink-0 rounded-sm px-2.5 font-mono text-[10px] font-bold tracking-wider uppercase focus-visible:ring-1"
                >
                  <IconFilter className="h-3.5 w-3.5" />
                  Refine
                  {scope.activeScopeCount > 0 && (
                    <span className="bg-background text-foreground ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold">
                      {scope.activeScopeCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>

              <SheetContent
                side="bottom"
                className="gap-0 overflow-y-auto rounded-t-2xl p-0"
              >
                <ReportScopeSheetContent
                  scope={scope}
                  filterSource={filterSource}
                />
              </SheetContent>
            </Sheet>
          ) : (
            <>
              <ReportDesktopDateFilter scope={scope} />
              <Separator
                orientation="vertical"
                className="bg-border/60 h-6 w-px shrink-0"
              />
              <div className="ml-auto flex shrink-0 items-center gap-1">
                <Button
                  variant={scope.effectiveCompareOn ? "default" : "ghost"}
                  size="sm"
                  className="h-9 min-w-0 rounded-sm px-3 font-mono text-[10px] font-bold tracking-wider uppercase"
                  onClick={scope.toggleCompare}
                  disabled={!scope.canCompare}
                >
                  <IconArrowsExchange className="mr-1 h-3.5 w-3.5" />
                  Compare
                </Button>

                <Popover
                  open={scope.filtersOpen}
                  onOpenChange={scope.setFiltersOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant={scope.hasFilters ? "default" : "ghost"}
                      size="sm"
                      className="h-9 min-w-0 rounded-sm px-3 font-mono text-[10px] font-bold tracking-wider uppercase"
                    >
                      <IconFilter className="mr-1 h-3.5 w-3.5" />
                      Filters
                      {scope.hasFilters && (
                        <span className="bg-background text-foreground ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold">
                          {(scope.filterLga ? 1 : 0) +
                            (scope.filterRole ? 1 : 0)}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-64 space-y-3 p-3"
                    align="end"
                    side="bottom"
                    sideOffset={10}
                    collisionPadding={16}
                  >
                    <p className="font-mono text-[10px] font-bold tracking-widest uppercase">
                      Filter by
                    </p>
                    <ReportFilterOptions
                      filterSource={filterSource}
                      filterLga={scope.filterLga}
                      filterRole={scope.filterRole}
                      onFilterLgaChange={scope.setFilterLga}
                      onFilterRoleChange={scope.setFilterRole}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}

          {dataUpdatedAt > 0 && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isFetching}
              aria-label="Refresh insights"
              className={
                isMobile
                  ? "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:border-primary/30 focus-visible:ring-primary/30 inline-flex h-10 w-9 shrink-0 items-center justify-center rounded-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:opacity-50"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-9 w-10 shrink-0 items-center justify-center rounded-sm transition-colors disabled:opacity-50"
              }
            >
              <IconRefresh
                className={`${isMobile ? "h-3.5 w-3.5" : "mr-1 h-3.5 w-3.5"} ${isFetching ? "animate-spin" : ""}`}
              />
              {isMobile ? (
                <span className="sr-only">Refresh</span>
              ) : (
                <span className="sr-only">
                  Refreshed {formatUpdatedAgo(dataUpdatedAt)}
                </span>
              )}
            </button>
          )}
        </div>

        <ReportScopeChips scope={scope} />
      </div>
    </div>
  );
}
