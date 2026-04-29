import type { ReactNode } from "react";
import Link from "next/link";
import {
  IconChevronRight,
  IconCircleCheck,
  IconClipboardList,
  IconMap,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { CandidateWithUser } from "@/lib/api/admin";
import { formatRelativeTime } from "@/lib/date-format";
import type { CampaignSummary } from "@/types/collect";
import { cn } from "@/lib/utils";

import {
  type DashboardSummary,
  formatDelta,
  type PriorityBucket,
  pluralize,
} from "@/lib/admin/dashboard";
import {
  CampaignRow,
  CandidateRow,
  EmptyRow,
  PriorityQueueRow,
  PriorityQueueRowSkeleton,
  RowSkeleton,
} from "@/components/admin/admin-dashboard-rows";

const DELTA_TONE_CLASS: Record<"up" | "down" | "flat", string> = {
  up: "text-primary",
  down: "text-destructive/80",
  flat: "text-muted-foreground",
};

type HealthRailProps = {
  isLoadingEntities: boolean;
  summary: DashboardSummary | undefined;
  summaryLoading: boolean;
  summaryError: boolean;
  pendingCredentialsCount: number;
  candidatesWithoutCollectCount: number;
  activeCampaignsCount: number;
  draftCampaignsCount: number;
  staleCampaignsCount: number;
  insightsOffCount: number;
};

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
        {updatedAt && !summaryLoading && !summaryError && (
          <p className="text-muted-foreground/60 font-mono text-[10px] tracking-widest uppercase">
            Updated{" "}
            {formatRelativeTime(updatedAt, {
              emptyLabel: "—",
              invalidLabel: "—",
              olderDateStyle: "months",
            })}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:flex-wrap sm:gap-2">
        <Button
          asChild
          variant="outline"
          className="h-11 justify-center gap-1.5 rounded-sm px-3 font-mono text-[10px] tracking-[0.18em] uppercase sm:h-auto sm:justify-start sm:px-4 sm:text-[11px] sm:tracking-widest"
        >
          <Link href="/admin/candidates/new">
            <IconUserPlus className="h-4 w-4" />
            Create Candidate
          </Link>
        </Button>
        <Button
          asChild
          className="h-11 justify-center gap-1.5 rounded-sm px-3 font-mono text-[10px] tracking-[0.18em] uppercase sm:h-auto sm:justify-start sm:px-4 sm:text-[11px] sm:tracking-widest"
        >
          <Link href="/admin/collect/campaigns/new">
            <IconClipboardList className="h-4 w-4" />
            New Campaign
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function QuickMoves() {
  return (
    <div className="border-border/60 bg-muted/10 grid grid-cols-3 gap-2 rounded-sm border p-2 sm:flex sm:flex-wrap sm:border-0 sm:bg-transparent sm:p-0">
      <QuickActionButton
        href="/admin/collect"
        icon={<IconClipboardList className="h-4 w-4" />}
        label="Manage Campaigns"
      />
      <QuickActionButton
        href="/admin/candidates"
        icon={<IconUsers className="h-4 w-4" />}
        label="Candidate Accounts"
      />
      <QuickActionButton
        href="/admin/geo"
        icon={<IconMap className="h-4 w-4" />}
        label="Geo Data"
      />
    </div>
  );
}

export function PriorityQueue({
  isLoading,
  buckets,
  total,
}: {
  isLoading: boolean;
  buckets: PriorityBucket[];
  total: number;
}) {
  const visible = buckets.filter((bucket) => bucket.count > 0);

  return (
    <Card
      id="priority-queue"
      className="border-border/60 scroll-mt-20 rounded-sm shadow-none"
    >
      <CardHeader className="border-border/60 border-b">
        <CardDescription className="text-muted-foreground/70 font-mono text-[10px] tracking-widest uppercase">
          Priority Queue
        </CardDescription>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold tracking-tight">
            Operational follow-ups
          </CardTitle>
          {total > 0 && (
            <Badge
              variant="outline"
              className="rounded-sm border-orange-500/30 bg-orange-500/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-orange-600 uppercase"
            >
              {total} {total === 1 ? "signal" : "signals"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <PriorityQueueRowSkeleton key={index} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="border-primary/20 bg-primary/5 flex flex-col items-center gap-3 rounded-sm border border-dashed py-10 text-center">
            <div className="bg-primary/10 border-primary/20 flex h-10 w-10 items-center justify-center rounded-sm border">
              <IconCircleCheck className="text-primary h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold tracking-tight">
                All caught up
              </p>
              <p className="text-muted-foreground text-sm">
                No urgent admin follow-ups right now.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map((bucket, index) => (
              <PriorityQueueRow
                key={bucket.key}
                bucket={bucket}
                showExamples={index < 3}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function HealthRail({
  isLoadingEntities,
  summary,
  summaryLoading,
  summaryError,
  pendingCredentialsCount,
  candidatesWithoutCollectCount,
  activeCampaignsCount,
  draftCampaignsCount,
  staleCampaignsCount,
  insightsOffCount,
}: HealthRailProps) {
  return (
    <Card className="border-border/60 rounded-sm shadow-none">
      <CardHeader className="border-border/60 border-b">
        <CardDescription className="text-muted-foreground/70 font-mono text-[10px] tracking-widest uppercase">
          Platform Health
        </CardDescription>
        <CardTitle className="text-sm font-semibold tracking-tight">
          Period context & state
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <RegistrationsPanel
            summary={summary}
            loading={summaryLoading}
            error={summaryError}
          />
          <HealthDivider />
          <CandidateSetupPanel
            summary={summary}
            summaryLoading={summaryLoading}
            summaryError={summaryError}
            isLoadingEntities={isLoadingEntities}
            pendingCount={pendingCredentialsCount}
            withoutCollectCount={candidatesWithoutCollectCount}
          />
          <HealthDivider />
          <CampaignStatePanel
            loading={isLoadingEntities}
            active={activeCampaignsCount}
            draft={draftCampaignsCount}
            stale={staleCampaignsCount}
          />
          <HealthDivider />
          <InsightsAccessPanel
            loading={isLoadingEntities}
            insightsOff={insightsOffCount}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function LiveCampaignsSection({
  campaigns,
  isLoading,
}: {
  campaigns: CampaignSummary[];
  isLoading: boolean;
}) {
  return (
    <Card className="border-border/60 rounded-sm shadow-none">
      <CardHeader className="border-border/60 border-b">
        <CardDescription className="text-muted-foreground/70 font-mono text-[10px] tracking-widest uppercase">
          Live Campaigns
        </CardDescription>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold tracking-tight">
            Recent campaign activity
          </CardTitle>
          {campaigns.length > 0 && (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-7 rounded-sm px-2 font-mono text-[10px] tracking-widest uppercase"
            >
              <Link href="/admin/collect">
                All
                <IconChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <RowSkeleton key={index} />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <EmptyRow
            icon={
              <IconClipboardList className="text-muted-foreground h-8 w-8" />
            }
            title="No campaigns yet"
            description="Create a Collect campaign to start gathering supporters."
            ctaHref="/admin/collect/campaigns/new"
            ctaLabel="New Collect Campaign"
          />
        ) : (
          <div className="space-y-2">
            {campaigns.map((campaign) => (
              <CampaignRow key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RecentCandidatesSection({
  candidates,
  isLoading,
}: {
  candidates: CandidateWithUser[];
  isLoading: boolean;
}) {
  return (
    <Card className="border-border/60 rounded-sm shadow-none">
      <CardHeader className="border-border/60 border-b">
        <CardDescription className="text-muted-foreground/70 font-mono text-[10px] tracking-widest uppercase">
          Recent Candidate Setup
        </CardDescription>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold tracking-tight">
            Newest accounts to finish setting up
          </CardTitle>
          {candidates.length > 0 && (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-7 rounded-sm px-2 font-mono text-[10px] tracking-widest uppercase"
            >
              <Link href="/admin/candidates">
                All
                <IconChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <RowSkeleton key={index} />
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <EmptyRow
            icon={<IconUsers className="text-muted-foreground h-8 w-8" />}
            title="No candidates yet"
            description="Add your first candidate account to get started."
            ctaHref="/admin/candidates/new"
            ctaLabel="Create First Candidate"
          />
        ) : (
          <div className="space-y-2">
            {candidates.map((candidate) => (
              <CandidateRow key={candidate.id} candidate={candidate} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CoverageStrip({
  isLoading,
  totalCandidates,
  nationalCandidates,
  distinctParties,
  topPositions,
}: {
  isLoading: boolean;
  totalCandidates: number;
  nationalCandidates: number;
  distinctParties: number;
  topPositions: [string, number][];
}) {
  return (
    <section className="border-border/60 space-y-3 border-t pt-5">
      <h2 className="text-muted-foreground/70 font-mono text-[10px] font-bold tracking-widest uppercase">
        Coverage Snapshot
      </h2>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Skeleton className="h-4 w-40 rounded-sm" />
            <Skeleton className="h-4 w-28 rounded-sm" />
            <Skeleton className="h-4 w-32 rounded-sm" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 rounded-sm" />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-3 w-24 rounded-sm" />
                    <Skeleton className="h-3 w-6 rounded-sm" />
                  </div>
                  <Skeleton className="h-1 w-full rounded-sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : totalCandidates === 0 ? (
        <p className="text-muted-foreground text-sm">
          Distribution data appears once candidate accounts exist.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
            <CoverageStat
              label="Constituency-linked"
              value={totalCandidates - nationalCandidates}
            />
            <CoverageStat label="National" value={nationalCandidates} />
            <CoverageStat label="Distinct parties" value={distinctParties} />
          </div>
          {topPositions.length > 0 && (
            <div className="space-y-2">
              <p className="text-muted-foreground/70 font-mono text-[10px] font-bold tracking-widest uppercase">
                Top positions
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {topPositions.map(([position, count]) => (
                  <div key={position} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-muted-foreground truncate">
                        {position}
                      </span>
                      <span className="font-mono font-medium tabular-nums">
                        {count}
                      </span>
                    </div>
                    <div className="bg-muted h-1 rounded-sm">
                      <div
                        className="bg-primary h-1 rounded-sm"
                        style={{
                          width: `${(count / Math.max(totalCandidates, 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
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

function CoverageStat({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-baseline gap-1.5 text-sm">
      <span className="text-muted-foreground text-xs sm:text-sm">{label}</span>
      <span className="font-mono font-medium tabular-nums">{value}</span>
    </span>
  );
}

function QuickActionButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Button
      asChild
      variant="outline"
      className="h-16 min-w-0 flex-col justify-center gap-1 rounded-sm px-2 py-2 font-mono text-[10px] tracking-[0.16em] uppercase sm:h-auto sm:flex-row sm:justify-start sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[11px] sm:tracking-widest"
    >
      <Link href={href}>
        {icon}
        <span className="truncate text-center leading-tight">{label}</span>
      </Link>
    </Button>
  );
}

function HealthDivider() {
  return <div className="border-border/60 border-t" />;
}

function HealthPanelHeader({ label }: { label: string }) {
  return <p className="text-foreground/80 text-xs font-medium">{label}</p>;
}

function HealthPanelLine({
  primary,
  secondary,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span>{primary}</span>
      {secondary && <span className="text-muted-foreground">{secondary}</span>}
    </div>
  );
}

function RegistrationsPanel({
  summary,
  loading,
  error,
}: {
  summary: DashboardSummary | undefined;
  loading: boolean;
  error: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        <HealthPanelHeader label="Registrations" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32 rounded-sm" />
          <Skeleton className="h-4 w-40 rounded-sm" />
          <Skeleton className="h-3 w-28 rounded-sm" />
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="space-y-2">
        <HealthPanelHeader label="Registrations" />
        <p className="text-muted-foreground/80 text-sm italic">
          Couldn’t refresh totals
        </p>
      </div>
    );
  }

  const { today, last7d, previous7d } = summary.registrations;
  const delta = formatDelta(last7d, previous7d);

  return (
    <div className="space-y-2">
      <HealthPanelHeader label="Registrations" />
      <div className="space-y-1.5">
        <HealthPanelLine
          primary={
            <>
              <span className="font-mono font-semibold tabular-nums">
                {today.toLocaleString()}
              </span>{" "}
              today
            </>
          }
        />
        <HealthPanelLine
          primary={
            <>
              <span className="font-mono font-semibold tabular-nums">
                {last7d.toLocaleString()}
              </span>{" "}
              last 7d
            </>
          }
        />
        {delta && (
          <p
            className={cn(
              "font-mono text-[11px] tracking-tight",
              DELTA_TONE_CLASS[delta.tone],
            )}
          >
            {delta.text}
          </p>
        )}
      </div>
    </div>
  );
}

function CandidateSetupPanel({
  summary,
  summaryLoading,
  summaryError,
  isLoadingEntities,
  pendingCount,
  withoutCollectCount,
}: {
  summary: DashboardSummary | undefined;
  summaryLoading: boolean;
  summaryError: boolean;
  isLoadingEntities: boolean;
  pendingCount: number;
  withoutCollectCount: number;
}) {
  const new7d = summary?.candidates.new7d ?? 0;
  const previous7d = summary?.candidates.previous7d ?? 0;
  const delta =
    !summaryLoading && !summaryError && summary
      ? formatDelta(new7d, previous7d)
      : null;

  return (
    <div className="space-y-2">
      <HealthPanelHeader label="Candidate setup" />
      {isLoadingEntities ? (
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40 rounded-sm" />
          <Skeleton className="h-4 w-44 rounded-sm" />
        </div>
      ) : (
        <div className="space-y-1.5 text-sm">
          <HealthPanelLine
            primary={
              <>
                <span className="font-mono font-semibold tabular-nums">
                  {pendingCount.toLocaleString()}
                </span>{" "}
                pending credentials
              </>
            }
          />
          <HealthPanelLine
            primary={
              <>
                <span className="font-mono font-semibold tabular-nums">
                  {withoutCollectCount.toLocaleString()}
                </span>{" "}
                without Collect
              </>
            }
          />
          {summaryLoading ? (
            <Skeleton className="h-3 w-32 rounded-sm" />
          ) : summaryError ? null : (
            <HealthPanelLine
              primary={
                <>
                  <span className="font-mono font-semibold tabular-nums">
                    {new7d.toLocaleString()}
                  </span>{" "}
                  new this week
                </>
              }
              secondary={
                delta && (
                  <span
                    className={cn(
                      "font-mono text-[11px]",
                      DELTA_TONE_CLASS[delta.tone],
                    )}
                  >
                    {delta.text}
                  </span>
                )
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

function CampaignStatePanel({
  loading,
  active,
  draft,
  stale,
}: {
  loading: boolean;
  active: number;
  draft: number;
  stale: number;
}) {
  return (
    <div className="space-y-2">
      <HealthPanelHeader label="Campaign state" />
      {loading ? (
        <Skeleton className="h-4 w-48 rounded-sm" />
      ) : (
        <p className="text-sm">
          <span className="font-mono font-semibold tabular-nums">{active}</span>{" "}
          active{" · "}
          <span className="font-mono font-semibold tabular-nums">
            {draft}
          </span>{" "}
          draft{" · "}
          <span
            className={cn(
              "font-mono font-semibold tabular-nums",
              stale > 0 ? "text-destructive/80" : undefined,
            )}
          >
            {stale}
          </span>{" "}
          stale
        </p>
      )}
    </div>
  );
}

function InsightsAccessPanel({
  loading,
  insightsOff,
}: {
  loading: boolean;
  insightsOff: number;
}) {
  return (
    <div className="space-y-2">
      <HealthPanelHeader label="Insights access" />
      {loading ? (
        <Skeleton className="h-4 w-44 rounded-sm" />
      ) : insightsOff === 0 ? (
        <p className="text-muted-foreground text-sm">
          All live campaigns share insights.
        </p>
      ) : (
        <p className="text-sm">
          <span className="font-mono font-semibold tabular-nums">
            {insightsOff}
          </span>{" "}
          campaign{insightsOff === 1 ? "" : "s"} with insights off
        </p>
      )}
    </div>
  );
}
