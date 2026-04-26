"use client";

import { useMemo, useState } from "react";
import { formatDateRangeLabel, type DateRange } from "@/lib/date-ranges";
import { formatGeoDisplayName } from "@/lib/geo/display";
import type { CampaignReportRangePreset } from "@/lib/collect/reporting";

export type CampaignInsightsScopePreset = CampaignReportRangePreset | "custom";

export type CampaignInsightsScope = {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  dateRange: DateRange;
  activeRange: CampaignInsightsScopePreset;
  compareOn: boolean;
  filterLga: string | null;
  filterRole: string | null;
  filtersOpen: boolean;
  hasRange: boolean;
  hasFilters: boolean;
  canCompare: boolean;
  effectiveCompareOn: boolean;
  hasScopeChanges: boolean;
  activeScopeCount: number;
  periodLabel: string;
  compactPeriodLabel: string;
  activeScopeLabel: string;
  setDateRange: (
    nextRange: DateRange,
    preset: CampaignInsightsScopePreset,
  ) => void;
  setCompareOn: (value: boolean) => void;
  toggleCompare: () => void;
  setFilterLga: (value: string | null) => void;
  setFilterRole: (value: string | null) => void;
  setFiltersOpen: (value: boolean) => void;
  clearDate: () => void;
  clearFilters: () => void;
  clearAll: () => void;
};

export function useCampaignInsightsScope(): CampaignInsightsScope {
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [activeRange, setActiveRange] =
    useState<CampaignInsightsScopePreset>("all");
  const [compareOn, setCompareOnState] = useState(false);
  const [filterLga, setFilterLga] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const dateRange = useMemo(
    () => ({ from: dateFrom, to: dateTo }),
    [dateFrom, dateTo],
  );
  const hasRange = !!dateFrom || !!dateTo;
  const hasFilters = !!filterLga || !!filterRole;
  const canCompare = !!dateFrom && !!dateTo;
  const effectiveCompareOn = compareOn && canCompare;
  const periodLabel = formatDateRangeLabel(dateRange);
  const compactPeriodLabel = formatDateRangeLabel(dateRange, {
    dateFormat: "dd MMM",
  });
  const activeScopeLabel = [
    periodLabel,
    filterLga ? formatGeoDisplayName(filterLga) : null,
    filterRole,
  ]
    .filter(Boolean)
    .join(" · ");
  const hasScopeChanges = hasRange || hasFilters || effectiveCompareOn;
  const activeScopeCount =
    (hasRange ? 1 : 0) +
    (filterLga ? 1 : 0) +
    (filterRole ? 1 : 0) +
    (effectiveCompareOn ? 1 : 0);

  const clearDate = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setActiveRange("all");
    setCompareOnState(false);
  };

  const clearFilters = () => {
    setFilterLga(null);
    setFilterRole(null);
  };

  return {
    dateFrom,
    dateTo,
    dateRange,
    activeRange,
    compareOn,
    filterLga,
    filterRole,
    filtersOpen,
    hasRange,
    hasFilters,
    canCompare,
    effectiveCompareOn,
    hasScopeChanges,
    activeScopeCount,
    periodLabel,
    compactPeriodLabel,
    activeScopeLabel,
    setDateRange: (nextRange, preset) => {
      setDateFrom(nextRange.from);
      setDateTo(nextRange.to);
      setActiveRange(preset);
      if (!nextRange.from || !nextRange.to) setCompareOnState(false);
    },
    setCompareOn: (value) => {
      setCompareOnState(value && canCompare);
    },
    toggleCompare: () => {
      if (!canCompare) return;
      setCompareOnState((prev) => !prev);
    },
    setFilterLga,
    setFilterRole,
    setFiltersOpen,
    clearDate,
    clearFilters,
    clearAll: () => {
      clearDate();
      clearFilters();
    },
  };
}
