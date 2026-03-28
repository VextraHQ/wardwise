"use client";

import { useMemo, useState, useEffect } from "react";
import { HiViewGrid, HiViewList, HiCheck } from "react-icons/hi";
import { nigeriaStates, type StateData } from "@/lib/data/state-lga-locations";
import { useGeoStats } from "@/hooks/use-geo";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const getStateStats = (code: string) => {
    return stats?.byState.find((s) => s.stateCode === code);
  };

  const renderCompleteness = (stateCode: string) => {
    if (isLoading) return <Skeleton className="h-5 w-16" />;
    const ss = getStateStats(stateCode);
    if (!ss || ss.lgasSeeded === 0) {
      return (
        <Badge
          variant="outline"
          className="bg-muted text-muted-foreground border-border/60 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
        >
          Not seeded
        </Badge>
      );
    }
    if (ss.lgasSeeded >= ss.lgasExpected) {
      return (
        <Badge
          variant="outline"
          className="border-brand-emerald/20 bg-brand-emerald/10 text-brand-lagoon rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
        >
          <HiCheck className="mr-0.5 h-3 w-3" />
          Complete
        </Badge>
      );
    }
    return (
      <span className="font-mono text-xs font-medium text-amber-600 tabular-nums dark:text-amber-400">
        {ss.lgasSeeded}/{ss.lgasExpected} LGAs
      </span>
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

  const renderMetadata = (stateCode: string) => {
    if (isLoading) return null;
    const ss = getStateStats(stateCode);
    if (!ss || (ss.totalWards === 0 && ss.totalPUs === 0)) return null;
    return (
      <p className="text-muted-foreground/70 mt-0.5 text-[11px]">
        {ss.totalWards.toLocaleString()} wards &middot;{" "}
        {ss.totalPUs.toLocaleString()} PUs
      </p>
    );
  };

  return (
    <Card className="border-border/60 rounded-sm shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold tracking-tight">
            States
          </CardTitle>
          <div className="border-border/60 bg-muted/30 flex items-center rounded-sm border p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-sm p-1.5 transition-colors",
                viewMode === "grid"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="Grid view"
            >
              <HiViewGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-sm p-1.5 transition-colors",
                viewMode === "list"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="List view"
            >
              <HiViewList className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {viewMode === "grid" ? (
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
                      <div
                        key={state.code}
                        className="border-border/60 bg-card/50 hover:bg-card hover:border-primary/20 cursor-pointer rounded-sm border p-4 transition-colors"
                        onClick={() => onDrillDown(state.code)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{state.name}</p>
                            <p className="text-muted-foreground text-xs">
                              {state.capital}
                            </p>
                            {renderMetadata(state.code)}
                          </div>
                          <div className="shrink-0">
                            {renderCompleteness(state.code)}
                          </div>
                        </div>
                        {renderProgressBar(state.code)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
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
                {nigeriaStates.map((state, idx) => {
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
