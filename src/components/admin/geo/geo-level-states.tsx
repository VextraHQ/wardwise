"use client";

import { useMemo, useState, useEffect, Fragment } from "react";
import { HiCheck } from "react-icons/hi";
import { nigeriaStates, type StateData } from "@/lib/data/state-lga-locations";
import { useGeoStats } from "@/hooks/use-geo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import {
  AdminResourceState,
  adminResourceStateIcons,
} from "@/components/admin/shared/admin-resource-state";
import { cn } from "@/lib/utils";
import { IconChevronRight } from "@tabler/icons-react";

type SeedStatus = "all" | "complete" | "partial" | "not-seeded";

interface GeoLevelStatesProps {
  onDrillDown: (stateCode: string) => void;
}

const ZONES: StateData["zone"][] = [
  "North Central",
  "North East",
  "North West",
  "South East",
  "South South",
  "South West",
];

const VIEW_STORAGE_KEY = "geo-states-view";

export function GeoLevelStates({ onDrillDown }: GeoLevelStatesProps) {
  const { data: stats, isLoading } = useGeoStats();
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    if (typeof window !== "undefined") {
      return (
        (localStorage.getItem(VIEW_STORAGE_KEY) as "grid" | "list") || "grid"
      );
    }
    return "grid";
  });
  const [search, setSearch] = useState("");
  const [seedStatus, setSeedStatus] = useState<SeedStatus>("all");

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
  }, [viewMode]);

  const statesByZone = useMemo(() => {
    const grouped: Record<string, StateData[]> = {};
    for (const zone of ZONES) {
      grouped[zone] = nigeriaStates.filter((s) => s.zone === zone);
    }
    return grouped;
  }, []);

  const hasFilters = search.trim() !== "" || seedStatus !== "all";

  function resetFilters() {
    setSearch("");
    setSeedStatus("all");
  }

  const getStateStats = (code: string) => {
    return stats?.byState.find((s) => s.stateCode === code);
  };

  const statusCounts = useMemo(() => {
    const counts = { complete: 0, partial: 0, "not-seeded": 0 };
    for (const s of nigeriaStates) {
      const ss = getStateStats(s.code);
      if (!ss || ss.lgasSeeded === 0) counts["not-seeded"]++;
      else if (ss.lgasSeeded >= ss.lgasExpected) counts.complete++;
      else counts.partial++;
    }
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  const filteredStates = useMemo(() => {
    return nigeriaStates.filter((s) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.capital.toLowerCase().includes(q);

      const ss = getStateStats(s.code);
      const matchesStatus =
        seedStatus === "all"
          ? true
          : seedStatus === "not-seeded"
            ? !ss || ss.lgasSeeded === 0
            : seedStatus === "complete"
              ? !!(ss && ss.lgasSeeded >= ss.lgasExpected)
              : !!(ss && ss.lgasSeeded > 0 && ss.lgasSeeded < ss.lgasExpected);

      return matchesSearch && matchesStatus;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, seedStatus, stats]);

  const renderCompleteness = (stateCode: string) => {
    if (isLoading) return <Skeleton className="h-6 w-20 rounded-sm" />;
    const ss = getStateStats(stateCode);
    if (!ss || ss.lgasSeeded === 0) {
      return (
        <Badge
          variant="outline"
          className="border-border/60 bg-muted/50 text-muted-foreground shrink-0 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest whitespace-nowrap uppercase"
        >
          Not seeded
        </Badge>
      );
    }
    if (ss.lgasSeeded >= ss.lgasExpected) {
      return (
        <Badge
          variant="outline"
          className="border-primary/30 bg-primary/10 text-primary shrink-0 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest whitespace-nowrap uppercase"
        >
          <HiCheck className="mr-0.5 inline h-3 w-3 align-[-0.125em]" />
          Complete
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="shrink-0 rounded-sm border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest whitespace-nowrap text-amber-800 uppercase dark:text-amber-200"
      >
        {ss.lgasSeeded}/{ss.lgasExpected} LGAs
      </Badge>
    );
  };

  const renderProgressBar = (stateCode: string) => {
    const ss = getStateStats(stateCode);
    if (!ss || ss.lgasSeeded === 0 || ss.lgasSeeded >= ss.lgasExpected)
      return null;
    const pct = Math.round((ss.lgasSeeded / ss.lgasExpected) * 100);
    return (
      <div className="bg-muted mt-2 h-1 w-full overflow-hidden rounded-sm">
        <div
          className="h-full rounded-sm bg-amber-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  };

  const renderGeoTotals = (stateCode: string) => {
    if (isLoading) {
      return (
        <div className="my-3 grid grid-cols-2 gap-2">
          <Skeleton className="border-primary/15 h-13 rounded-sm border border-dashed" />
          <Skeleton className="border-primary/15 h-13 rounded-sm border border-dashed" />
        </div>
      );
    }
    const ss = getStateStats(stateCode);
    const wards =
      ss && typeof ss.totalWards === "number"
        ? ss.totalWards.toLocaleString()
        : "—";
    const pus =
      ss && typeof ss.totalPUs === "number"
        ? ss.totalPUs.toLocaleString()
        : "—";

    const wardsIsZero = !!ss && ss.totalWards === 0;
    const pusIsZero = !!ss && ss.totalPUs === 0;

    return (
      <dl className="my-3 grid grid-cols-2 gap-2">
        <div
          className={cn(
            "rounded-sm border border-dashed px-2.5 py-2",
            wardsIsZero
              ? "border-amber-500/45 bg-amber-500/8"
              : "border-primary/20 bg-primary/6",
          )}
        >
          <dt className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
            Wards
          </dt>
          <dd
            className={cn(
              "mt-1 font-mono text-sm leading-none font-semibold tabular-nums",
              wardsIsZero
                ? "text-amber-700 dark:text-amber-400"
                : "text-foreground",
            )}
          >
            {wards}
          </dd>
        </div>
        <div
          className={cn(
            "rounded-sm border border-dashed px-2.5 py-2",
            pusIsZero
              ? "border-amber-500/45 bg-amber-500/8"
              : "border-primary/20 bg-primary/6",
          )}
        >
          <dt className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
            Polling units
          </dt>
          <dd
            className={cn(
              "mt-1 font-mono text-sm leading-none font-semibold tabular-nums",
              pusIsZero
                ? "text-amber-700 dark:text-amber-400"
                : "text-foreground",
            )}
          >
            {pus}
          </dd>
        </div>
      </dl>
    );
  };

  const renderStateGridCard = (state: StateData) => {
    return (
      <button
        type="button"
        onClick={() => onDrillDown(state.code)}
        aria-label={`View LGAs in ${state.name}`}
        className={cn(
          "border-border/60 bg-card/50 hover:bg-card hover:border-primary/25 group flex min-h-0 min-w-0 cursor-pointer flex-col rounded-sm border p-4 text-left transition-colors",
          "focus-visible:ring-ring focus-visible:ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm leading-snug font-semibold tracking-tight">
              {state.name}
            </p>
            <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
              <span className="text-foreground font-mono text-[11px] font-semibold tracking-wide uppercase tabular-nums">
                {state.code}
              </span>
              <span className="text-muted-foreground/50" aria-hidden>
                &middot;
              </span>
              <span className="text-muted-foreground min-w-0">
                <span className="sr-only">Capital: </span>
                {state.capital}
              </span>
            </p>
          </div>
          <div className="shrink-0 pt-px">{renderCompleteness(state.code)}</div>
        </div>

        {renderGeoTotals(state.code)}

        {renderProgressBar(state.code)}

        <div className="text-muted-foreground group-hover:text-primary border-border/40 mt-auto flex items-center gap-1 border-t pt-2.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-colors">
          <span className="min-w-0">View LGAs</span>
          <IconChevronRight
            aria-hidden
            size={15}
            stroke={1.75}
            className="shrink-0 opacity-80"
          />
        </div>
      </button>
    );
  };

  const STATUS_TABS: { value: SeedStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "complete", label: "Complete" },
    { value: "partial", label: "Partial" },
    { value: "not-seeded", label: "Not Seeded" },
  ];

  return (
    <Card className="border-border/60 min-w-0 rounded-sm shadow-none">
      <CardHeader className="border-border/60 min-w-0 border-b">
        {/* Title row + toggle */}
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold tracking-tight">
            States
          </CardTitle>
          <ViewModeToggle value={viewMode} onValueChange={setViewMode} />
        </div>

        {/* Search */}
        <div className="mt-3 min-w-0">
          <AdminSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by state or capital…"
          />
        </div>

        {/* Status filter tabs */}
        <div className="border-border/60 bg-muted/20 mt-2 w-full min-w-0 overflow-hidden rounded-sm border p-1 sm:w-fit">
          <div
            role="group"
            aria-label="Filter states by seeding status"
            className={cn(
              "flex min-w-0 items-center gap-1 overflow-x-auto sm:flex-wrap sm:overflow-visible",
              "mask-[linear-gradient(90deg,#000_0,#000_calc(100%-2.5rem),transparent)] [-webkit-mask-image:linear-gradient(90deg,#000_0,#000_calc(100%-2.5rem),transparent)] sm:mask-none sm:[-webkit-mask-image:none]",
            )}
          >
            {STATUS_TABS.map(({ value, label }) => {
              const isActive = seedStatus === value;
              const count =
                value === "all"
                  ? nigeriaStates.length
                  : statusCounts[value as keyof typeof statusCounts];
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSeedStatus(value)}
                  className={cn(
                    "inline-flex min-w-max shrink-0 items-center justify-between gap-2 rounded-sm border px-2.5 py-1.5 text-left font-mono text-[10px] font-bold tracking-widest uppercase transition-colors sm:w-auto sm:min-w-0 sm:shrink sm:justify-center",
                    isActive
                      ? "border-primary/25 bg-primary/12 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-background/70 hover:text-foreground border-transparent",
                  )}
                >
                  <span className="truncate">{label}</span>
                  <span
                    className={cn(
                      "bg-background/80 text-muted-foreground/80 rounded-sm px-1.5 py-px text-[9px] tabular-nums sm:text-[10px]",
                      isActive && "bg-background text-primary shadow-sm",
                    )}
                  >
                    {isLoading ? "—" : count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredStates.length === 0 && !isLoading ? (
          <AdminResourceState
            title="No states match"
            description="Try adjusting your search or filter."
            action={{
              label: "Clear filters",
              onClick: resetFilters,
              icon: adminResourceStateIcons.alert,
              variant: "outline",
            }}
          />
        ) : viewMode === "grid" ? (
          /* Grid view — zone grouping only when no filter active */
          hasFilters ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredStates.map((state) => (
                <Fragment key={state.code}>
                  {renderStateGridCard(state)}
                </Fragment>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {ZONES.map((zone) => {
                const states = statesByZone[zone];
                return (
                  <div key={zone}>
                    <h3 className="text-muted-foreground mb-3 font-mono text-[10px] font-bold tracking-widest uppercase">
                      {zone}
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {states.map((state) => (
                        <Fragment key={state.code}>
                          {renderStateGridCard(state)}
                        </Fragment>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* List view */
          <div className="overflow-x-auto rounded-sm border">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 z-10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-muted-foreground h-10 w-14 text-center font-mono text-[10px] font-bold tracking-widest uppercase">
                    S/N
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                    State
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                    Capital
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                    Zone
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase">
                    LGAs
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase">
                    Wards
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase">
                    PUs
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStates.map((state, idx) => {
                  const ss = getStateStats(state.code);
                  return (
                    <TableRow
                      key={state.code}
                      className="hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => onDrillDown(state.code)}
                    >
                      <TableCell className="text-muted-foreground text-center font-mono text-xs tabular-nums">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {state.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {state.capital}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                        >
                          {state.zone}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {isLoading ? (
                          <Skeleton className="ml-auto h-4 w-8" />
                        ) : ss ? (
                          <span className="font-mono tabular-nums">{`${ss.lgasSeeded}/${ss.lgasExpected}`}</span>
                        ) : (
                          <span className="text-muted-foreground">&mdash;</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isLoading ? (
                          <Skeleton className="ml-auto h-4 w-8" />
                        ) : ss?.totalWards ? (
                          <span className="font-mono tabular-nums">
                            {ss.totalWards.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">&mdash;</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isLoading ? (
                          <Skeleton className="ml-auto h-4 w-8" />
                        ) : ss?.totalPUs ? (
                          <span className="font-mono tabular-nums">
                            {ss.totalPUs.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">&mdash;</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {renderCompleteness(state.code)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
