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
    <div className="border-border/60 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between sm:pb-5">
      <div className="min-w-0 space-y-1.5">
        <h1 className="text-base font-semibold tracking-tight">
          WardWise Command Center
        </h1>
        <div className="text-muted-foreground hidden flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:flex">
          <span className="whitespace-nowrap">
            {pluralize(liveCampaigns, "live campaign")}
          </span>
          <span aria-hidden>·</span>
          <span className="whitespace-nowrap">
            {pluralize(prioritySignals, "priority signal")}
          </span>
          <span aria-hidden>·</span>
          {summaryLoading ? (
            <span className="whitespace-nowrap">
              <Skeleton className="h-4 w-32 rounded-sm" />
            </span>
          ) : summaryError ? (
            <span className="text-muted-foreground/70 whitespace-nowrap italic">
              Couldn’t refresh totals
            </span>
          ) : registrationsToday !== null ? (
            <span className="whitespace-nowrap">
              {pluralize(registrationsToday, "registration")} today
            </span>
          ) : null}
          <span aria-hidden>·</span>
          <span className="whitespace-nowrap">
            {pluralize(staleCount, "stale campaign")}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:hidden">
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
      </div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
        <Button
          asChild
          variant="outline"
          className="h-11 min-h-11 min-w-0 flex-1 basis-30 justify-center gap-1.5 rounded-sm px-3 font-mono text-[10px] tracking-[0.18em] uppercase sm:h-auto sm:min-h-0 sm:flex-none sm:basis-auto sm:justify-start sm:px-4 sm:text-[11px] sm:tracking-widest"
        >
          <Link href="/admin/candidates/new">
            <IconUserPlus className="h-4 w-4" />
            Create Candidate
          </Link>
        </Button>
        <Button
          asChild
          className="h-11 min-h-11 min-w-0 flex-1 basis-30 justify-center gap-1.5 rounded-sm px-3 font-mono text-[10px] tracking-[0.18em] uppercase sm:h-auto sm:min-h-0 sm:flex-none sm:basis-auto sm:justify-start sm:px-4 sm:text-[11px] sm:tracking-widest"
        >
          <Link href="/admin/collect/campaigns/new">
            <IconClipboardList className="h-4 w-4" />
            New Campaign
          </Link>
        </Button>
        <CommandSummaryAsOf
          updatedAt={updatedAt}
          summaryLoading={summaryLoading}
          summaryError={summaryError}
        />
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
      className="text-muted-foreground inline-flex w-full min-w-0 items-center justify-end gap-1.5 font-mono text-[9px] font-bold tracking-wider uppercase sm:w-auto sm:max-w-[min(14rem,36vw)] sm:justify-start sm:text-[10px] sm:tracking-wider"
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
