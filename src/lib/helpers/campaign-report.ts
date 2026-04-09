import { format } from "date-fns";

export type CampaignReportRangePreset = "today" | "7d" | "30d" | "all";

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

export function formatQueryDate(date: Date | undefined): string | undefined {
  return date ? format(date, "yyyy-MM-dd") : undefined;
}

export function getPresetRange(
  preset: CampaignReportRangePreset,
  now = new Date(),
): { from?: Date; to?: Date } {
  switch (preset) {
    case "today": {
      const from = new Date(now);
      from.setHours(0, 0, 0, 0);
      return { from, to: now };
    }
    case "7d": {
      const from = new Date(now);
      from.setDate(from.getDate() - 6);
      return { from, to: now };
    }
    case "30d": {
      const from = new Date(now);
      from.setDate(from.getDate() - 29);
      return { from, to: now };
    }
    default:
      return {};
  }
}

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

export function formatUpdatedAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

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

export function getVerificationRate(total: number, verified: number): number {
  return total > 0 ? Math.round((verified / total) * 100) : 0;
}

export function timeAgo(isoDate: string | null): string {
  if (!isoDate) return "No submissions yet";

  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;

  return new Date(isoDate).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function formatRole(role: string): string {
  return capitalize(role);
}
