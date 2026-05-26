import type { ReferralActivityItem } from "@/features/collect/types/collect.types";
import type {
  CampaignCanvasserRecord,
  PossibleMatch,
} from "@/features/collect/types/collect.types";
import type { ExportFormat } from "@/lib/exports/shared";
import { IconFileTypeCsv, IconFileTypeXls } from "@tabler/icons-react";

export const exportFormatMeta = {
  csv: { label: "CSV", icon: IconFileTypeCsv },
  xlsx: { label: "Excel", icon: IconFileTypeXls },
} satisfies Record<
  ExportFormat,
  { label: string; icon: React.ComponentType<{ className?: string }> }
>;

export type SourceFilter = "all" | "known" | "manual";

export const EMPTY_PRELOADED: CampaignCanvasserRecord[] = [];
export const EMPTY_REFERRAL_ACTIVITY: ReferralActivityItem[] = [];
export const EMPTY_MATCHES: PossibleMatch[] = [];

export function sourceFilterLabel(filter: Exclude<SourceFilter, "all">) {
  return filter === "known" ? "From List" : "Typed In";
}

export function sourceTypeLabel(type: ReferralActivityItem["type"]) {
  return type === "known" ? "From List" : "Typed In";
}

export function normalizeCleanupName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function cleanupConfidenceMeta({
  confidence,
  namesMatch,
}: {
  confidence: "high" | "medium";
  namesMatch: boolean;
}) {
  return confidence === "high"
    ? {
        label: namesMatch ? "Exact phone + name match" : "Exact phone match",
        badgeClass:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      }
    : {
        label: "Exact name match",
        badgeClass:
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
      };
}
