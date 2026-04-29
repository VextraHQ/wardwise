"use client";

import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StepCard, CardSectionHeader } from "@/components/collect/form-ui";
import { ShareInviteCard } from "@/components/collect/share-invite-card";
import {
  getVerificationRate,
  STATUS_COPY,
  timeAgo,
  type CampaignReportDelta,
} from "@/lib/collect/reporting";
import { formatGeoDisplayName } from "@/lib/geo/display";
import { formatPersonName } from "@/lib/utils";
import type {
  CampaignReportSubmission,
  CampaignReportSummary,
} from "@/types/campaign-report";
import {
  IconChartBar,
  IconClipboardList,
  IconCopy,
  IconFlag,
  IconMapPin,
  IconShieldCheck,
  IconSparkles,
  IconUsersGroup,
  IconExternalLink,
} from "@tabler/icons-react";
import { SubmissionStatusBadge } from "./insights-helpers";

const STATUS_BADGE: Record<string, { label: string; style: string }> = {
  active: {
    label: "Live",
    style: "bg-primary/10 text-primary border-primary/30",
  },
  paused: {
    label: "Paused",
    style: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  closed: {
    label: "Closed",
    style: "bg-destructive/10 text-destructive border-destructive/30",
  },
  draft: {
    label: "Draft",
    style: "bg-muted text-muted-foreground border-border/60",
  },
};

function OverviewPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border/60 min-w-0 overflow-hidden rounded-sm shadow-none">
      <CardHeader>
        <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function StatsGrid({
  total,
  verified,
  flagged,
  enabledLgaCount,
  deltas,
}: {
  total: number;
  verified: number;
  flagged: number;
  enabledLgaCount: number;
  deltas?: {
    total: CampaignReportDelta | null;
    verified: CampaignReportDelta | null;
    flagged: CampaignReportDelta | null;
  };
}) {
  const verifiedPct = getVerificationRate(total, verified);
  const cards = [
    {
      label: "Supporters Captured",
      value: total.toLocaleString(),
      subtitle: "All successful submissions",
      icon: IconClipboardList,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      delta: deltas?.total,
    },
    {
      label: "Verified Records",
      value: verified.toLocaleString(),
      subtitle: `${verifiedPct}% of total`,
      icon: IconShieldCheck,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      delta: deltas?.verified,
    },
    {
      label: "Needs Review",
      value: flagged.toLocaleString(),
      subtitle: "Flagged by admin",
      icon: IconFlag,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
    },
    {
      label: "Active LGAs",
      value: enabledLgaCount.toLocaleString(),
      subtitle: "Currently collecting",
      icon: IconMapPin,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="border-border/60 min-w-0 rounded-sm shadow-none"
        >
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
              {card.label}
            </CardTitle>
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm sm:h-9 sm:w-9 ${card.iconBg}`}
            >
              <card.icon
                className={`h-4 w-4 sm:h-5 sm:w-5 ${card.iconColor}`}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-xl font-semibold tabular-nums sm:text-2xl">
              {card.value}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-muted-foreground text-xs">{card.subtitle}</p>
              {card.delta && (
                <span
                  className={`font-mono text-[10px] font-bold ${card.delta.positive ? "text-primary" : "text-destructive"}`}
                >
                  {card.delta.value}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function NowCard({
  formStatus,
  lastSubmissionAt,
  periodCount,
  periodLabel,
  verificationRate,
}: {
  formStatus: string;
  lastSubmissionAt: string | null;
  periodCount: number;
  periodLabel: string;
  verificationRate: number;
}) {
  const badge = STATUS_BADGE[formStatus] ?? STATUS_BADGE.draft;
  const items = [
    { label: "Status", value: badge.label },
    {
      label: "Last activity",
      value: lastSubmissionAt ? timeAgo(lastSubmissionAt) : "No activity yet",
    },
    {
      label: periodLabel,
      value: `${periodCount.toLocaleString()} captured`,
    },
    {
      label: "Verification",
      value: `${verificationRate}% verified`,
    },
  ];

  return (
    <OverviewPanel title="Now">
      <div className="flex items-center gap-2">
        <p className="text-foreground text-sm font-medium">
          {STATUS_COPY[formStatus] ?? STATUS_COPY.draft}
        </p>
        <Badge
          variant="outline"
          className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase ${badge.style}`}
        >
          {badge.label}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="border-border/60 rounded-sm border border-dashed px-3 py-3"
          >
            <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
              {item.label}
            </p>
            <p className="text-foreground mt-2 text-sm font-semibold">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </OverviewPanel>
  );
}

function HotspotsCard({
  byLga,
  byWard,
}: {
  byLga: { lga: string; count: number }[];
  byWard: { ward: string; count: number }[];
}) {
  const topLga = byLga[0];
  const topWard = byWard[0];
  const summary =
    topLga && topWard
      ? `Most registrations are currently coming from ${formatGeoDisplayName(topLga.lga)}, with ${formatGeoDisplayName(topWard.ward)} leading at ward level.`
      : topLga
        ? `${formatGeoDisplayName(topLga.lga)} is currently leading supporter capture.`
        : "Geography insights will appear here once submissions start coming in.";

  return (
    <OverviewPanel title="Hotspots">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border-border/60 rounded-sm border px-3 py-3">
          <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
            Top LGA
          </p>
          <p className="text-foreground mt-2 text-base font-semibold">
            {topLga ? formatGeoDisplayName(topLga.lga) : "No data yet"}
          </p>
          {topLga && (
            <p className="text-muted-foreground mt-1 text-xs">
              {topLga.count.toLocaleString()} submissions
            </p>
          )}
        </div>

        <div className="border-border/60 rounded-sm border px-3 py-3">
          <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
            Top Ward
          </p>
          <p className="text-foreground mt-2 text-base font-semibold">
            {topWard ? formatGeoDisplayName(topWard.ward) : "No data yet"}
          </p>
          {topWard && (
            <p className="text-muted-foreground mt-1 text-xs">
              {topWard.count.toLocaleString()} submissions
            </p>
          )}
        </div>
      </div>

      <div className="bg-muted/20 border-border/60 rounded-sm border px-3 py-3">
        <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
          Insight
        </p>
        <p className="text-foreground mt-2 text-sm leading-relaxed">
          {summary}
        </p>
      </div>
    </OverviewPanel>
  );
}

function FieldTeamPerformanceCard({
  health,
}: Pick<CampaignReportSummary, "health">) {
  const lead = health.topCanvassers[0];
  const leaderboard = health.topCanvassers.slice(0, 3);

  return (
    <OverviewPanel title="Field Team Performance">
      {health.topCanvassers.length === 0 ? (
        <div className="border-border/60 flex flex-col items-center rounded-sm border border-dashed px-3 py-8 text-center">
          <IconUsersGroup className="text-muted-foreground/40 mb-2 h-7 w-7" />
          <p className="text-muted-foreground text-sm font-medium">
            No canvasser activity yet
          </p>
          <p className="text-muted-foreground/70 mt-1 text-xs">
            Once canvassers submit records, their contribution will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border-border/60 rounded-sm border px-3 py-3">
              <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                Active Canvassers
              </p>
              <p className="text-foreground mt-2 font-mono text-2xl font-semibold">
                {health.canvasserCount.toLocaleString()}
              </p>
            </div>

            <div className="border-border/60 rounded-sm border px-3 py-3">
              <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                Top Canvasser
              </p>
              <p className="text-foreground mt-2 text-base font-semibold">
                {lead.name}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {lead.count.toLocaleString()} submissions
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {leaderboard.map((canvasser, index) => (
              <div
                key={`${canvasser.name}-${index}`}
                className="border-border/60 flex items-center justify-between gap-4 rounded-sm border border-dashed px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    <span className="text-muted-foreground mr-1.5 font-mono text-xs">
                      {index + 1}.
                    </span>
                    {canvasser.name}
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold tabular-nums">
                  {canvasser.count}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </OverviewPanel>
  );
}

function RecentActivityCard({
  submissions,
  loading,
  error,
  emptyCopy = "Recent submissions will appear here once the campaign is live.",
}: {
  submissions: CampaignReportSubmission[];
  loading: boolean;
  error: Error | null;
  emptyCopy?: string;
}) {
  return (
    <OverviewPanel title="Recent Activity">
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-sm" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-sm border border-orange-500/20 bg-orange-500/10 px-3 py-4">
          <p className="text-sm font-medium text-orange-600">
            Unable to load recent activity right now.
          </p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="border-border/60 rounded-sm border border-dashed px-3 py-8 text-center">
          <p className="text-muted-foreground text-sm">{emptyCopy}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="border-border/60 flex flex-col gap-3 rounded-sm border px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-foreground text-sm font-semibold">
                    {formatPersonName(submission.fullName)}
                  </p>
                  <SubmissionStatusBadge
                    isVerified={submission.isVerified}
                    isFlagged={submission.isFlagged}
                  />
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {formatGeoDisplayName(submission.lgaName)} •{" "}
                  {formatGeoDisplayName(submission.wardName)}
                </p>
              </div>

              <div className="text-muted-foreground shrink-0 text-xs font-medium">
                {timeAgo(submission.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </OverviewPanel>
  );
}

export function ReadyToCollectState({
  slug,
  campaignName,
  party,
  constituency,
}: {
  slug: string;
  campaignName: string;
  party: string;
  constituency: string;
}) {
  const formUrl =
    typeof window !== "undefined"
      ? `${process.env.NEXT_PUBLIC_COLLECT_BASE_URL || window.location.origin}/c/${slug}`
      : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(formUrl).then(
      () => toast.success("Form link copied"),
      () => toast.error("Failed to copy"),
    );
  };

  const handleOpenForm = () => {
    if (!formUrl) return;
    window.open(formUrl, "_blank");
  };

  return (
    <StepCard>
      <CardSectionHeader
        title="Ready to Collect"
        subtitle="Campaign Insights"
        statusLabel="Awaiting First Submission"
        icon={<IconSparkles className="size-4.5" />}
      />

      <div className="space-y-5">
        <div className="border-border/60 bg-muted/15 flex flex-col items-center justify-center rounded-sm border border-dashed px-6 py-10 text-center">
          <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
            <IconChartBar className="text-muted-foreground h-7 w-7" />
          </div>
          <h2 className="text-foreground text-xl font-semibold tracking-tight">
            No supporter registrations yet
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-lg text-sm leading-relaxed">
            The public form is live and this report is ready. Once submissions
            start coming in, you&apos;ll see momentum, hotspots, field-team
            performance, and supporter records appear here automatically.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-9 rounded-sm font-mono text-[11px] tracking-widest uppercase"
              onClick={handleOpenForm}
            >
              <IconExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Open Form
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 rounded-sm font-mono text-[11px] tracking-widest uppercase"
              onClick={handleCopy}
            >
              <IconCopy className="mr-1.5 h-3.5 w-3.5" />
              Copy Form Link
            </Button>
          </div>
        </div>

        <ShareInviteCard
          campaignSlug={slug}
          campaignName={campaignName}
          party={party}
          constituency={constituency}
          qrSize={180}
        />
      </div>
    </StepCard>
  );
}

type InsightsOverviewProps = {
  summary: CampaignReportSummary;
  campaignName: string;
  deltas?: {
    total: CampaignReportDelta | null;
    verified: CampaignReportDelta | null;
    flagged: CampaignReportDelta | null;
  };
  recentSubmissions: CampaignReportSubmission[];
  recentLoading: boolean;
  recentError: Error | null;
  isFilteredView: boolean;
  isEmpty: boolean;
  recentWindowCount: number;
  verifiedRate: number;
};

export function InsightsOverview({
  summary,
  campaignName,
  deltas,
  recentSubmissions,
  recentLoading,
  recentError,
  isFilteredView,
  isEmpty,
  recentWindowCount,
  verifiedRate,
}: InsightsOverviewProps) {
  if (isEmpty) {
    return (
      <ReadyToCollectState
        slug={summary.campaign.slug}
        campaignName={campaignName}
        party={summary.campaign.party}
        constituency={summary.campaign.constituency}
      />
    );
  }

  return (
    <>
      <StatsGrid
        total={summary.stats.total}
        verified={summary.stats.verified}
        flagged={summary.stats.flagged}
        enabledLgaCount={summary.campaign.enabledLgaCount}
        deltas={deltas}
      />

      <div className="space-y-6">
        <NowCard
          formStatus={summary.health.formStatus}
          lastSubmissionAt={summary.health.lastSubmissionAt}
          periodCount={isFilteredView ? summary.stats.total : recentWindowCount}
          periodLabel={isFilteredView ? "Selected view" : "Last 7 days"}
          verificationRate={verifiedRate}
        />

        <HotspotsCard
          byLga={summary.stats.byLga}
          byWard={summary.stats.byWard}
        />

        <FieldTeamPerformanceCard health={summary.health} />

        <RecentActivityCard
          submissions={recentSubmissions}
          loading={recentLoading}
          error={recentError}
          emptyCopy={
            isFilteredView
              ? "No recent submissions match this date range or filter."
              : undefined
          }
        />

        <ShareInviteCard
          campaignSlug={summary.campaign.slug}
          campaignName={campaignName}
          party={summary.campaign.party}
          constituency={summary.campaign.constituency}
          qrSize={180}
        />
      </div>
    </>
  );
}
