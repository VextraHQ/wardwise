import { format } from "date-fns";
import {
  formatQueryDate as formatSharedQueryDate,
  getPresetRange as getSharedPresetRange,
  type DateRangePreset,
} from "@/lib/date-ranges";
import { formatDisplayDate, formatRelativeTime } from "@/lib/date-format";

export type CampaignReportRangePreset = Extract<
  DateRangePreset,
  "today" | "7d" | "30d" | "all"
>;

export type CampaignReportDelta = { value: string; positive: boolean };

export type CampaignReportDailyPoint = {
  date: string;
  count: number;
  cumulative: number;
};

export const STATUS_COPY: Record<string, string> = {
  active: "Registrations are actively coming in and the form remains live.",
  paused:
    "New registrations are paused, while historical reporting stays available.",
  closed:
    "This campaign is closed to new registrations, with prior activity preserved.",
  draft: "This campaign has not started collecting live registrations yet.",
};

/** Formats a query date */
export function formatQueryDate(date: Date | undefined): string | undefined {
  return formatSharedQueryDate(date);
}

/** Parses a date key */
export function parseDateKey(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Formats a date key */
export function formatDateKey(
  value: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" },
): string {
  return formatDisplayDate(parseDateKey(value), options);
}

/** Gets the preset range for a campaign report */
export function getPresetRange(
  preset: CampaignReportRangePreset,
  now = new Date(),
): { from?: Date; to?: Date } {
  return getSharedPresetRange(preset, now);
}

/** Gets the prior range for a campaign report if a date range is provided */
export function getPriorRange(
  dateFrom?: Date,
  dateTo?: Date,
): { from: string; to: string } | null {
  if (!dateFrom || !dateTo) return null;

  const days =
    Math.round((dateTo.getTime() - dateFrom.getTime()) / 86_400_000) + 1;
  const priorTo = new Date(dateFrom);
  priorTo.setDate(priorTo.getDate() - 1);
  const priorFrom = new Date(priorTo);
  priorFrom.setDate(priorTo.getDate() - days + 1);

  return {
    from: format(priorFrom, "yyyy-MM-dd"),
    to: format(priorTo, "yyyy-MM-dd"),
  };
}

/** Computes the delta between two numbers if the previous value is not zero */
export function computeDelta(
  current: number,
  previous: number,
): CampaignReportDelta | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return { value: `+${current}`, positive: true };

  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return null;

  return {
    value: `${pct > 0 ? "+" : ""}${pct}%`,
    positive: pct > 0,
  };
}

/** Formats the updated ago for a timestamp */
export function formatUpdatedAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

/** Gets the recent window count for a campaign report if a daily point is provided */
export function getRecentWindowCount(
  daily: CampaignReportDailyPoint[],
  days = 7,
): number {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  const cutoffKey = format(cutoff, "yyyy-MM-dd");

  return daily.reduce((sum, entry) => {
    return entry.date >= cutoffKey ? sum + entry.count : sum;
  }, 0);
}

/** Gets the verification rate for a campaign report if a total and verified count are provided */
export function getVerificationRate(total: number, verified: number): number {
  return total > 0 ? Math.round((verified / total) * 100) : 0;
}

/** Formats the time ago for a ISO date */
export function timeAgo(isoDate: string | null): string {
  return formatRelativeTime(isoDate, {
    emptyLabel: "No submissions yet",
    includeYesterday: true,
    absoluteDateOptions: {
      day: "numeric",
      month: "short",
    },
  });
}

/** Capitalizes the first letter of a string */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Converts a string to title case */
export function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

/** Formats a role name to title case */
export function formatRole(role: string): string {
  return capitalize(role);
}
