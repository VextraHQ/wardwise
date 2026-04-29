import type { ReactNode } from "react";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignActionsMenu } from "@/components/admin/collect/campaign-actions-menu";

import type { CandidateWithUser } from "@/lib/api/admin";
import {
  campaignDisplay,
  formatStatusLabel,
  type PriorityBucket,
  resolveStateName,
} from "@/lib/admin/dashboard";
import { isStaleCampaign } from "@/lib/collect/campaign-health";
import { formatRelativeTime } from "@/lib/date-format";
import type { CampaignSummary } from "@/types/collect";
import { cn, formatPersonName } from "@/lib/utils";

// Badge color styles by priority
const PRIORITY_TONE = {
  high: {
    badge: "border-red-500/30 bg-red-500/10 text-red-600",
    label: "High",
  },
  med: {
    badge: "border-orange-500/30 bg-orange-500/10 text-orange-600",
    label: "Med",
  },
  low: {
    badge: "border-border/60 bg-muted text-muted-foreground",
    label: "Low",
  },
} as const;

// Badge color styles by campaign status
const CAMPAIGN_STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border/60",
  active: "bg-primary/10 text-primary border-primary/30",
  paused: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  closed: "bg-destructive/10 text-destructive border-destructive/30",
};

// Badge color styles by candidate onboarding status
const ONBOARDING_STATUS_STYLES: Record<string, string> = {
  pending: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  credentials_sent: "bg-muted text-muted-foreground border-border/60",
  active: "bg-primary/10 text-primary border-primary/30",
  suspended: "bg-destructive/10 text-destructive border-destructive/30",
};

export function PriorityQueueRow({
  bucket,
  showExamples,
}: {
  bucket: PriorityBucket;
  showExamples: boolean;
}) {
  const tone = PRIORITY_TONE[bucket.severity];
  const examplesLine =
    showExamples && bucket.examples.length > 0
      ? bucket.examples.join(" · ")
      : null;

  return (
    <div className="border-border/60 hover:border-border hover:bg-muted/20 flex flex-col gap-3 rounded-sm border p-3 transition-colors sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "rounded-sm px-1.5 py-0 font-mono text-[10px] font-bold tracking-widest uppercase",
              tone.badge,
            )}
          >
            {tone.label}
          </Badge>
          <span className="text-sm leading-snug font-semibold tracking-tight wrap-break-word">
            {bucket.title}
          </span>
          <Badge
            variant="outline"
            className="rounded-sm px-1.5 py-0 font-mono text-[10px] font-bold tracking-widest tabular-nums"
          >
            {bucket.count}
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs">{bucket.description}</p>
        {examplesLine && (
          <p className="text-muted-foreground/80 truncate text-xs">
            {examplesLine}
          </p>
        )}
      </div>
      <div className="sm:shrink-0">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-10 w-full justify-between gap-1 rounded-sm px-3 font-mono text-xs tracking-[0.12em] uppercase sm:h-7 sm:w-auto sm:justify-start sm:px-2 sm:text-[10px] sm:tracking-widest"
        >
          <Link href={bucket.cta.href}>
            {bucket.cta.label}
            <IconChevronRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function PriorityQueueRowSkeleton() {
  return (
    <div className="border-border/60 flex items-start gap-3 rounded-sm border border-dashed p-3">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-10 rounded-sm" />
          <Skeleton className="h-4 w-40 rounded-sm" />
          <Skeleton className="h-4 w-6 rounded-sm" />
        </div>
        <Skeleton className="h-3 w-3/4 rounded-sm" />
      </div>
      <Skeleton className="h-7 w-24 shrink-0 rounded-sm" />
    </div>
  );
}

export function CampaignRow({ campaign }: { campaign: CampaignSummary }) {
  const stale = isStaleCampaign(campaign);
  const statusStyle =
    CAMPAIGN_STATUS_STYLES[campaign.status] ??
    "bg-muted text-muted-foreground border-border/60";
  const submissions = campaign._count?.submissions ?? 0;
  const detailHref = `/admin/collect/campaigns/${campaign.id}`;

  return (
    <div className="border-border/60 hover:border-border hover:bg-muted/20 flex items-start gap-3 rounded-sm border p-3 transition-colors">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={detailHref}
            className="hover:text-primary truncate text-sm font-semibold tracking-tight transition-colors"
          >
            {campaignDisplay(campaign)}
          </Link>
          <Badge
            variant="outline"
            className={cn(
              "rounded-sm px-1.5 py-0 font-mono text-[10px] font-bold tracking-widest uppercase",
              statusStyle,
            )}
          >
            {formatStatusLabel(campaign.status)}
          </Badge>
          {stale && (
            <Badge
              variant="outline"
              className="border-destructive/30 bg-destructive/10 text-destructive rounded-sm px-1.5 py-0 font-mono text-[10px] font-bold tracking-widest uppercase"
            >
              Stale
            </Badge>
          )}
        </div>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {campaign.displayName?.trim() && (
            <span className="truncate">
              {formatPersonName(campaign.candidateName)}
            </span>
          )}
          <span className="font-mono tabular-nums">
            {submissions.toLocaleString()}{" "}
            {submissions === 1 ? "submission" : "submissions"}
          </span>
          <span>
            {campaign.lastSubmissionAt
              ? formatRelativeTime(campaign.lastSubmissionAt, {
                  emptyLabel: "—",
                  invalidLabel: "—",
                  olderDateStyle: "months",
                })
              : "No submissions yet"}
          </span>
        </div>
      </div>
      <div className="shrink-0">
        <CampaignActionsMenu
          campaign={{
            id: campaign.id,
            slug: campaign.slug,
            clientReportEnabled: campaign.clientReportEnabled,
            clientReportToken: campaign.clientReportToken,
          }}
          ariaLabel={`Actions for ${campaignDisplay(campaign)}`}
        />
      </div>
    </div>
  );
}

export function CandidateRow({ candidate }: { candidate: CandidateWithUser }) {
  const statusStyle =
    ONBOARDING_STATUS_STYLES[candidate.onboardingStatus] ??
    "bg-muted text-muted-foreground border-border/60";
  const detailHref = `/admin/candidates/${candidate.id}`;
  const accountHref = `/admin/candidates/${candidate.id}?tab=account`;
  const collectAction = candidate.collectCampaign
    ? {
        href: `/admin/collect/campaigns/${candidate.collectCampaign.id}`,
        label: "View Collect",
      }
    : {
        href: `/admin/collect/campaigns/new?candidateId=${candidate.id}`,
        label: "Create Campaign",
      };
  const locationLabel =
    candidate.constituency ||
    resolveStateName(candidate.stateCode) ||
    (candidate.isNational ? "National" : null);

  return (
    <div className="border-border/60 hover:border-border hover:bg-muted/20 flex flex-col gap-3 rounded-sm border p-3 transition-colors sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={detailHref}
            className="hover:text-primary truncate text-sm font-semibold tracking-tight transition-colors"
          >
            {candidate.title
              ? `${candidate.title} ${candidate.name}`
              : candidate.name}
          </Link>
          {candidate.party && (
            <Badge
              variant="outline"
              className="border-border/60 rounded-sm px-1.5 py-0 font-mono text-[10px] font-bold tracking-widest uppercase"
            >
              {candidate.party}
            </Badge>
          )}
          <Badge
            variant="outline"
            className={cn(
              "rounded-sm px-1.5 py-0 font-mono text-[10px] font-bold tracking-widest uppercase",
              statusStyle,
            )}
          >
            {formatStatusLabel(candidate.onboardingStatus)}
          </Badge>
        </div>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span>{candidate.position}</span>
          {locationLabel && <span>{locationLabel}</span>}
        </div>
      </div>
      <div className="grid w-full grid-cols-3 gap-1.5 sm:flex sm:w-auto sm:shrink-0 sm:flex-wrap">
        <RowAction href={detailHref} label="View" />
        <RowAction href={collectAction.href} label={collectAction.label} />
        <RowAction href={accountHref} label="Account" />
      </div>
    </div>
  );
}

// Row link button
function RowAction({ href, label }: { href: string; label: string }) {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="h-8 w-full rounded-sm px-2 font-mono text-[10px] tracking-widest uppercase sm:h-7 sm:w-auto"
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
}

export function RowSkeleton() {
  return (
    <div className="border-border/60 flex items-center gap-3 rounded-sm border border-dashed p-3">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2 rounded-sm" />
        <Skeleton className="h-3 w-3/4 rounded-sm" />
      </div>
      <Skeleton className="h-7 w-20 shrink-0 rounded-sm" />
    </div>
  );
}

export function EmptyRow({
  icon,
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="border-border/60 flex flex-col items-center gap-3 rounded-sm border border-dashed py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center">{icon}</div>
      <div className="space-y-1">
        <p className="text-sm font-semibold tracking-tight">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Button
        asChild
        size="sm"
        className="rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
      >
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>
    </div>
  );
}
