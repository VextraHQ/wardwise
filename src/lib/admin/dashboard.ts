import type { AdminDashboardSummary, CandidateWithUser } from "@/lib/api/admin";
import { nigeriaStates } from "@/lib/data/state-lga-locations";
import type { CampaignSummary } from "@/types/collect";
import { formatPersonName } from "@/lib/utils";

export type PrioritySeverity = "high" | "med" | "low";

export type PriorityBucket = {
  key: string;
  severity: PrioritySeverity;
  title: string;
  description: string;
  count: number;
  cta: { href: string; label: string };
  examples: string[];
};

export function resolveStateName(
  stateCode: string | null | undefined,
): string | null {
  if (!stateCode) return null;
  return (
    nigeriaStates.find((state) => state.code === stateCode)?.name ?? stateCode
  );
}

export function formatStatusLabel(value: string): string {
  if (!value) return "";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function campaignDisplay(campaign: CampaignSummary): string {
  return (
    campaign.displayName?.trim() || formatPersonName(campaign.candidateName)
  );
}

export function candidateDisplay(candidate: CandidateWithUser): string {
  return candidate.title
    ? `${candidate.title} ${candidate.name}`
    : candidate.name;
}

export function pluralize(
  value: number,
  singular: string,
  plural?: string,
): string {
  return `${value.toLocaleString()} ${value === 1 ? singular : (plural ?? `${singular}s`)}`;
}

export function formatDelta(
  current: number,
  previous: number,
): { text: string; tone: "up" | "down" | "flat" } | null {
  if (current === 0 && previous === 0) return null;
  if (previous === 0) {
    return {
      text: `+${current.toLocaleString()} vs prior 7d`,
      tone: "up",
    };
  }

  const rawPct = ((current - previous) / previous) * 100;
  const capped = Math.max(-999, Math.min(999, rawPct));
  const pct = Math.round(Math.abs(capped));

  if (pct === 0) return { text: "Flat vs prior 7d", tone: "flat" };

  const tone: "up" | "down" = rawPct > 0 ? "up" : "down";
  const arrow = tone === "up" ? "↑" : "↓";

  return { text: `${arrow} ${pct}% vs prior 7d`, tone };
}

export type DashboardSummary = AdminDashboardSummary;
