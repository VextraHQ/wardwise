import type { ReactNode } from "react";
import Link from "next/link";
import {
  IconClipboardList,
  IconClock,
  IconUserPlus,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/date-format";
import { pluralize } from "@/lib/admin/dashboard";
import { cn } from "@/lib/utils";

export function CommandStrip({
  liveCampaigns,
  prioritySignals,
  staleCount,
  registrationsToday,
  summaryLoading,
  summaryError,
  updatedAt,
}: {
  liveCampaigns: number;
  prioritySignals: number;
  staleCount: number;
  registrationsToday: number | null;
  summaryLoading: boolean;
  summaryError: boolean;
  updatedAt: string | null;
}) {
  return (
    <div className="border-border/60 flex flex-col gap-4 border-b pb-2 md:flex-row md:items-start md:justify-between md:pb-3">
      <div className="min-w-0 space-y-1.5">
        <p className="text-primary/80 font-mono text-[10px] font-bold tracking-widest uppercase">
          Operations Overview
        </p>
        <h2 className="text-foreground text-lg font-semibold tracking-tight">
          WardWise Command Center
        </h2>
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          <DesktopMetaPill
            label="Live"
            value={pluralize(liveCampaigns, "campaign")}
          />
          <DesktopMetaPill
            label="Priority"
            value={pluralize(prioritySignals, "signal")}
          />
          {summaryLoading ? (
            <DesktopMetaPill
              label="Today"
              value={<Skeleton className="h-4 w-20 rounded-sm" />}
            />
          ) : summaryError ? (
            <DesktopMetaPill
              label="Today"
              value="Couldn’t refresh"
              tone="muted"
            />
          ) : (
            <DesktopMetaPill
              label="Today"
              value={pluralize(registrationsToday ?? 0, "registration")}
            />
          )}
          <DesktopMetaPill
            label="Stale"
            value={pluralize(staleCount, "campaign")}
            tone={staleCount > 0 ? "warning" : "default"}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 md:hidden">
          <StripStatChip
            label="Live campaigns"
            value={liveCampaigns.toLocaleString()}
          />
          <StripStatChip
            label="Priority signals"
            value={prioritySignals.toLocaleString()}
          />
          <StripStatChip
            label="Registrations today"
            value={
              summaryLoading
                ? null
                : summaryError
                  ? "—"
                  : (registrationsToday ?? 0).toLocaleString()
            }
            tone={summaryError ? "muted" : "default"}
          />
          <StripStatChip
            label="Stale campaigns"
            value={staleCount.toLocaleString()}
            tone={staleCount > 0 ? "warning" : "default"}
          />
        </div>
        <div className="pt-1 md:hidden">
          <CommandSummaryAsOf
            updatedAt={updatedAt}
            summaryLoading={summaryLoading}
            summaryError={summaryError}
          />
        </div>
      </div>
      <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:flex-col md:items-end md:gap-1.5">
        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
          <Button
            asChild
            variant="outline"
            className="h-11 min-h-11 min-w-0 flex-1 basis-30 justify-center gap-1.5 rounded-sm px-3 font-mono text-[10px] tracking-[0.18em] uppercase md:h-auto md:min-h-0 md:flex-none md:basis-auto md:justify-start md:px-4 md:text-[11px] md:tracking-widest"
          >
            <Link href="/admin/candidates/new">
              <IconUserPlus className="h-4 w-4" />
              Create Candidate
            </Link>
          </Button>
          <Button
            asChild
            className="h-11 min-h-11 min-w-0 flex-1 basis-30 justify-center gap-1.5 rounded-sm px-3 font-mono text-[10px] tracking-[0.18em] uppercase md:h-auto md:min-h-0 md:flex-none md:basis-auto md:justify-start md:px-4 md:text-[11px] md:tracking-widest"
          >
            <Link href="/admin/collect/campaigns/new">
              <IconClipboardList className="h-4 w-4" />
              New Campaign
            </Link>
          </Button>
        </div>
        <div className="hidden md:flex">
          <CommandSummaryAsOf
            updatedAt={updatedAt}
            summaryLoading={summaryLoading}
            summaryError={summaryError}
          />
        </div>
      </div>
    </div>
  );
}

function CommandSummaryAsOf({
  updatedAt,
  summaryLoading,
  summaryError,
}: {
  updatedAt: string | null;
  summaryLoading: boolean;
  summaryError: boolean;
}) {
  if (summaryError) return null;

  const showTime = Boolean(updatedAt && !summaryLoading);
  const relative =
    updatedAt !== null
      ? formatRelativeTime(updatedAt, {
          emptyLabel: "—",
          invalidLabel: "—",
          olderDateStyle: "months",
        })
      : null;

  return (
    <p
      className="text-muted-foreground inline-flex min-w-0 items-center gap-1.5 font-mono text-[9px] font-bold tracking-wider uppercase md:max-w-[min(14rem,36vw)] md:text-[10px] md:tracking-wider"
      title={updatedAt ?? undefined}
    >
      <IconClock className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
      <span className="min-w-0 truncate">
        {summaryLoading && !updatedAt ? (
          "Loading…"
        ) : showTime && relative ? (
          <>Refreshed {relative}</>
        ) : (
          "—"
        )}
      </span>
    </p>
  );
}

function DesktopMetaPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  tone?: "default" | "warning" | "muted";
}) {
  const toneClass =
    tone === "warning"
      ? "border-orange-500/25 bg-orange-500/5 text-orange-700 dark:text-orange-300"
      : tone === "muted"
        ? "border-border/60 bg-muted/40 text-muted-foreground"
        : "border-border/60 bg-muted/20 text-muted-foreground";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-1",
        toneClass,
      )}
    >
      <span className="font-mono text-[9px] font-bold tracking-wider uppercase">
        {label}
      </span>
      <span className="text-foreground text-xs font-medium">{value}</span>
    </div>
  );
}

function StripStatChip({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | null;
  tone?: "default" | "warning" | "muted";
}) {
  const toneClass =
    tone === "warning"
      ? "border-orange-500/25 bg-orange-500/5"
      : tone === "muted"
        ? "border-border/60 bg-muted/30"
        : "border-border/60 bg-background";

  return (
    <div className={cn("rounded-sm border px-3 py-2.5", toneClass)}>
      <div className="font-mono text-[10px] tracking-[0.16em] uppercase">
        {label}
      </div>
      {value === null ? (
        <Skeleton className="mt-2 h-5 w-16 rounded-sm" />
      ) : (
        <div className="mt-1 text-base font-semibold tracking-tight">
          {value}
        </div>
      )}
    </div>
  );
}
