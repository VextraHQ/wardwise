"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconClipboardList,
  IconUserPlus,
  IconUsers,
  IconActivity,
  IconChartBar,
  IconExclamationCircle,
  IconChevronRight,
  IconMap,
  IconBolt,
  IconCircleCheck,
  IconUserExclamation,
  IconUserOff,
  IconMapOff,
  IconFileText,
  IconAlertCircle,
  IconClockExclamation,
  IconReportOff,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "@/components/admin/admin-skeletons";
import { CampaignActionsMenu } from "@/components/admin/collect/campaign-actions-menu";

import { useAdminCandidates } from "@/hooks/use-admin";
import { useCampaigns } from "@/hooks/use-collect";
import type { CampaignSummary } from "@/types/collect";
import type { CandidateWithUser } from "@/lib/api/admin";
import { positionRequiresLgas } from "@/lib/geo/constituency";
import { nigeriaStates } from "@/lib/data/state-lga-locations";
import { cn, formatPersonName } from "@/lib/utils";

// ---------- Local helpers ----------

const STALE_MS = 48 * 60 * 60 * 1000;

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "—";
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.round(months / 12);
  return `${years}y ago`;
}

function isStaleCampaign(campaign: CampaignSummary): boolean {
  if (campaign.status !== "active") return false;
  if ((campaign._count?.submissions ?? 0) === 0) return false;
  if (!campaign.lastSubmissionAt) return true;
  return Date.now() - new Date(campaign.lastSubmissionAt).getTime() > STALE_MS;
}

function resolveStateName(stateCode: string | null | undefined): string | null {
  if (!stateCode) return null;
  return nigeriaStates.find((s) => s.code === stateCode)?.name ?? stateCode;
}

function formatStatusLabel(value: string): string {
  if (!value) return "";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

const CAMPAIGN_STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border/60",
  active: "bg-primary/10 text-primary border-primary/30",
  paused: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  closed: "bg-destructive/10 text-destructive border-destructive/30",
};

const ONBOARDING_STATUS_STYLES: Record<string, string> = {
  pending: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  credentials_sent: "bg-muted text-muted-foreground border-border/60",
  active: "bg-primary/10 text-primary border-primary/30",
  suspended: "bg-destructive/10 text-destructive border-destructive/30",
};

// ---------- Component ----------

export function AdminDashboard() {
  const {
    data: candidates = [],
    isLoading: candidatesLoading,
    error: candidatesError,
  } = useAdminCandidates();
  const {
    data: campaigns = [],
    isLoading: campaignsLoading,
    error: campaignsError,
  } = useCampaigns();

  const isLoading = candidatesLoading || campaignsLoading;

  // ---- Candidate derivations ----
  const candidatesWithoutCollect = useMemo(
    () => candidates.filter((c) => !c.collectCampaign),
    [candidates],
  );

  const pendingCredentials = useMemo(
    () =>
      candidates.filter((c) =>
        ["pending", "credentials_sent"].includes(c.onboardingStatus),
      ),
    [candidates],
  );

  const suspendedCandidates = useMemo(
    () => candidates.filter((c) => c.onboardingStatus === "suspended"),
    [candidates],
  );

  const missingConstituencyLgas = useMemo(
    () =>
      candidates.filter(
        (c) =>
          positionRequiresLgas(c.position) &&
          (c.constituencyLgaIds?.length ?? 0) === 0,
      ),
    [candidates],
  );

  // ---- Campaign derivations ----
  const activeCampaigns = useMemo(
    () => campaigns.filter((c) => c.status === "active"),
    [campaigns],
  );

  const draftCampaigns = useMemo(
    () => campaigns.filter((c) => c.status === "draft"),
    [campaigns],
  );

  const activeCampaignsNoSubmissions = useMemo(
    () => activeCampaigns.filter((c) => (c._count?.submissions ?? 0) === 0),
    [activeCampaigns],
  );

  const staleActiveCampaigns = useMemo(
    () => activeCampaigns.filter(isStaleCampaign),
    [activeCampaigns],
  );

  // Exclude drafts so they don't double-count under "Draft campaigns".
  const insightsOff = useMemo(
    () =>
      campaigns.filter(
        (c) =>
          c.status !== "draft" &&
          (!c.clientReportEnabled || !c.clientReportToken),
      ),
    [campaigns],
  );

  // ---- Aggregates for metrics ----
  const totalSubmissions = useMemo(
    () => campaigns.reduce((sum, c) => sum + (c._count?.submissions ?? 0), 0),
    [campaigns],
  );

  const attentionTotal =
    candidatesWithoutCollect.length +
    pendingCredentials.length +
    suspendedCandidates.length +
    missingConstituencyLgas.length +
    draftCampaigns.length +
    activeCampaignsNoSubmissions.length +
    staleActiveCampaigns.length +
    insightsOff.length;

  // ---- Live Campaigns priority sort: active first (recent), then drafts, then stale ----
  const liveCampaigns = useMemo(() => {
    const ranked = [...campaigns].sort((a, b) => {
      const rank = (c: CampaignSummary) => {
        if (c.status === "active") return 0;
        if (c.status === "draft") return 1;
        return 2;
      };
      const r = rank(a) - rank(b);
      if (r !== 0) return r;
      const aTime = new Date(
        a.lastSubmissionAt ?? a.updatedAt ?? a.createdAt,
      ).getTime();
      const bTime = new Date(
        b.lastSubmissionAt ?? b.updatedAt ?? b.createdAt,
      ).getTime();
      return bTime - aTime;
    });
    return ranked.slice(0, 5);
  }, [campaigns]);

  // ---- Recent Candidates (most recent 5) ----
  const recentCandidates = useMemo(
    () =>
      [...candidates]
        .sort(
          (a, b) =>
            new Date(b.user.createdAt).getTime() -
            new Date(a.user.createdAt).getTime(),
        )
        .slice(0, 5),
    [candidates],
  );

  // ---- Coverage snapshot data ----
  const uniqueParties = useMemo(
    () =>
      Array.from(
        new Set(candidates.map((c) => c.party).filter(Boolean)),
      ).sort(),
    [candidates],
  );

  const nationalCandidates = useMemo(
    () => candidates.filter((c) => c.isNational).length,
    [candidates],
  );

  const topPositions = useMemo(() => {
    const counts = candidates.reduce<Record<string, number>>((acc, c) => {
      acc[c.position] = (acc[c.position] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [candidates]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* 1. Operations Overview ---------------------------------------- */}
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardDescription className="text-muted-foreground/70 font-mono text-[10px] tracking-widest uppercase">
              Operations Overview
            </CardDescription>
            <CardTitle className="text-base font-semibold tracking-tight">
              WardWise Command Center
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Platform readiness, live campaign activity, and admin shortcuts.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:shrink-0">
            <Button
              asChild
              variant="outline"
              className="gap-1.5 rounded-sm font-mono text-[11px] tracking-widest uppercase"
            >
              <Link href="/admin/candidates/new">
                <IconUserPlus className="h-4 w-4" />
                Create Candidate
              </Link>
            </Button>
            <Button
              asChild
              className="gap-1.5 rounded-sm font-mono text-[11px] tracking-widest uppercase"
            >
              <Link href="/admin/collect/campaigns/new">
                <IconClipboardList className="h-4 w-4" />
                New Campaign
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Errors -------------------------------------------------------- */}
      {(candidatesError || campaignsError) && (
        <Alert
          variant="destructive"
          className="border-destructive/30 bg-destructive/10 rounded-sm shadow-none"
        >
          <IconExclamationCircle className="h-4 w-4" />
          <AlertTitle className="font-mono text-[11px] font-bold tracking-widest uppercase">
            {candidatesError && campaignsError
              ? "Failed to load dashboard data"
              : candidatesError
                ? "Failed to load candidates"
                : "Failed to load campaigns"}
          </AlertTitle>
          <AlertDescription className="text-destructive/80 text-xs">
            {candidatesError instanceof Error
              ? candidatesError.message
              : campaignsError instanceof Error
                ? campaignsError.message
                : "An unexpected error occurred."}
          </AlertDescription>
        </Alert>
      )}

      {/* 2. Quick Actions --------------------------------------------- */}
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader className="pb-3">
          <CardDescription className="text-muted-foreground/70 font-mono text-[10px] tracking-widest uppercase">
            Quick Actions
          </CardDescription>
          <CardTitle className="text-sm font-semibold tracking-tight">
            Jump straight into common admin tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            <QuickActionButton
              href="/admin/candidates/new"
              icon={<IconUserPlus className="h-4 w-4" />}
              label="Create Candidate"
            />
            <QuickActionButton
              href="/admin/collect/campaigns/new"
              icon={<IconBolt className="h-4 w-4" />}
              label="New Collect Campaign"
            />
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
        </CardContent>
      </Card>

      {/* 3. Needs Attention | 5. Live Campaigns ----------------------- */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1fr]">
        <Card
          id="needs-attention"
          className="border-border/60 scroll-mt-20 rounded-sm shadow-none"
        >
          <CardHeader className="pb-3">
            <CardDescription className="text-muted-foreground/70 font-mono text-[10px] tracking-widest uppercase">
              Needs Attention
            </CardDescription>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold tracking-tight">
                Operational follow-ups
              </CardTitle>
              {attentionTotal > 0 && (
                <Badge
                  variant="outline"
                  className="rounded-sm border-orange-500/30 bg-orange-500/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-orange-600 uppercase"
                >
                  {attentionTotal} {attentionTotal === 1 ? "signal" : "signals"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <AttentionColumnSkeleton />
                <AttentionColumnSkeleton />
              </div>
            ) : attentionTotal === 0 ? (
              <div className="border-border/60 flex flex-col items-center gap-3 rounded-sm border border-dashed py-10 text-center">
                <div className="bg-primary/10 border-primary/20 flex h-10 w-10 items-center justify-center rounded-sm border">
                  <IconCircleCheck className="text-primary h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold tracking-tight">
                    All clear
                  </p>
                  <p className="text-muted-foreground text-sm">
                    No urgent admin actions right now.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <AttentionColumn title="Candidate Actions">
                  <AttentionRow
                    icon={<IconUserExclamation className="h-3.5 w-3.5" />}
                    label="Candidates without Collect"
                    count={candidatesWithoutCollect.length}
                    href="/admin/candidates"
                    tone="warning"
                  />
                  <AttentionRow
                    icon={<IconAlertCircle className="h-3.5 w-3.5" />}
                    label="Pending credentials"
                    count={pendingCredentials.length}
                    href="/admin/candidates"
                    tone="warning"
                  />
                  <AttentionRow
                    icon={<IconUserOff className="h-3.5 w-3.5" />}
                    label="Suspended accounts"
                    count={suspendedCandidates.length}
                    href="/admin/candidates"
                    tone="danger"
                  />
                  <AttentionRow
                    icon={<IconMapOff className="h-3.5 w-3.5" />}
                    label="Missing constituency LGAs"
                    count={missingConstituencyLgas.length}
                    href="/admin/candidates"
                    tone="warning"
                  />
                </AttentionColumn>
                <AttentionColumn title="Campaign Actions">
                  <AttentionRow
                    icon={<IconFileText className="h-3.5 w-3.5" />}
                    label="Draft campaigns"
                    count={draftCampaigns.length}
                    href="/admin/collect"
                    tone="muted"
                  />
                  <AttentionRow
                    icon={<IconAlertCircle className="h-3.5 w-3.5" />}
                    label="Active with no submissions"
                    count={activeCampaignsNoSubmissions.length}
                    href="/admin/collect"
                    tone="warning"
                  />
                  <AttentionRow
                    icon={<IconClockExclamation className="h-3.5 w-3.5" />}
                    label="Stale active campaigns"
                    count={staleActiveCampaigns.length}
                    href="/admin/collect"
                    tone="danger"
                  />
                  <AttentionRow
                    icon={<IconReportOff className="h-3.5 w-3.5" />}
                    label="Campaign Insights off"
                    count={insightsOff.length}
                    href="/admin/collect"
                    tone="muted"
                  />
                </AttentionColumn>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 rounded-sm shadow-none">
          <CardHeader className="pb-3">
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
                {Array.from({ length: 4 }).map((_, i) => (
                  <RowSkeleton key={i} />
                ))}
              </div>
            ) : liveCampaigns.length === 0 ? (
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
                {liveCampaigns.map((c) => (
                  <CampaignRow key={c.id} campaign={c} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. Core Metrics --------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              href="/admin/candidates"
              label="Candidates"
              value={candidates.length}
              subtitle={
                candidates.length === 1
                  ? "1 account"
                  : `${candidates.length} accounts`
              }
              icon={<IconUsers className="text-primary h-5 w-5" />}
            />
            <MetricCard
              href="/admin/collect"
              label="Live Campaigns"
              value={activeCampaigns.length}
              subtitle={`of ${campaigns.length} total`}
              icon={<IconActivity className="text-primary h-5 w-5" />}
              showLiveDot={activeCampaigns.length > 0}
            />
            <MetricCard
              href="/admin/collect"
              label="Registrations"
              value={totalSubmissions.toLocaleString()}
              subtitle="via Collect"
              icon={<IconChartBar className="text-primary h-5 w-5" />}
            />
            <MetricCard
              href="#needs-attention"
              label="Needs Attention"
              value={attentionTotal}
              subtitle={
                attentionTotal === 1
                  ? "1 signal to review"
                  : `${attentionTotal} signals to review`
              }
              icon={
                <IconAlertTriangle
                  className={cn(
                    "h-5 w-5",
                    attentionTotal === 0 ? "text-primary" : "text-orange-600",
                  )}
                />
              }
              tone={attentionTotal === 0 ? "primary" : "warning"}
            />
          </>
        )}
      </div>

      {/* 6. Recent Candidates | 7. Coverage Snapshot ------------------ */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/60 rounded-sm shadow-none">
          <CardHeader className="pb-3">
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
                {Array.from({ length: 4 }).map((_, i) => (
                  <RowSkeleton key={i} />
                ))}
              </div>
            ) : recentCandidates.length === 0 ? (
              <EmptyRow
                icon={<IconUsers className="text-muted-foreground h-8 w-8" />}
                title="No candidates yet"
                description="Add your first candidate account to get started."
                ctaHref="/admin/candidates/new"
                ctaLabel="Create First Candidate"
              />
            ) : (
              <div className="space-y-2">
                {recentCandidates.map((c) => (
                  <CandidateRow key={c.id} candidate={c} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/60 rounded-sm shadow-none">
          <CardHeader className="pb-3">
            <CardDescription className="text-muted-foreground/70 font-mono text-[10px] tracking-widest uppercase">
              Coverage Snapshot
            </CardDescription>
            <CardTitle className="text-sm font-semibold tracking-tight">
              Candidate distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full rounded-sm" />
                <Skeleton className="h-4 w-full rounded-sm" />
                <Skeleton className="h-4 w-full rounded-sm" />
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-3 w-24 rounded-sm" />
                  <Skeleton className="h-2 w-full rounded-sm" />
                  <Skeleton className="h-2 w-full rounded-sm" />
                  <Skeleton className="h-2 w-full rounded-sm" />
                </div>
              </div>
            ) : candidates.length === 0 ? (
              <div className="border-border/60 rounded-sm border border-dashed py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  Distribution data appears once candidate accounts exist.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <CoverageStat
                    label="Constituency-linked"
                    value={candidates.length - nationalCandidates}
                  />
                  <CoverageStat label="National" value={nationalCandidates} />
                  <CoverageStat
                    label="Distinct parties"
                    value={uniqueParties.length}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                      Top Positions
                    </h3>
                    {topPositions.length > 0 && (
                      <Badge
                        variant="outline"
                        className="rounded-sm px-1.5 py-0 font-mono text-[10px] font-bold tracking-widest uppercase"
                      >
                        {topPositions.length} tracked
                      </Badge>
                    )}
                  </div>
                  {topPositions.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Position data will appear here once candidates exist.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {topPositions.map(([position, count]) => (
                        <div key={position} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground truncate pr-2">
                              {position}
                            </span>
                            <span className="font-mono font-medium tabular-nums">
                              {count}
                            </span>
                          </div>
                          <div className="bg-muted h-1.5 rounded-sm">
                            <div
                              className="bg-primary h-1.5 rounded-sm"
                              style={{
                                width: `${(count / Math.max(candidates.length, 1)) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CoverageStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium tabular-nums">{value}</span>
    </div>
  );
}

// ---------- Quick Actions ----------

function QuickActionButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Button
      asChild
      variant="outline"
      className="h-auto justify-start gap-2 rounded-sm py-2.5 font-mono text-[11px] tracking-widest uppercase"
    >
      <Link href={href}>
        {icon}
        <span className="truncate">{label}</span>
      </Link>
    </Button>
  );
}

// ---------- Core Metric Card ----------

function MetricCard({
  href,
  label,
  value,
  subtitle,
  icon,
  showLiveDot,
  tone = "primary",
}: {
  href: string;
  label: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  showLiveDot?: boolean;
  tone?: "primary" | "warning";
}) {
  const iconWrap =
    tone === "warning"
      ? "bg-orange-500/10 border-orange-500/20"
      : "bg-primary/10 border-primary/20";
  return (
    <Link
      href={href}
      className="focus-visible:ring-primary/40 group rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <Card className="border-border/60 group-hover:border-border group-hover:bg-muted/20 rounded-sm shadow-none transition-colors">
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
          <CardTitle className="text-muted-foreground min-w-0 pr-2 font-mono text-[10px] leading-relaxed font-bold tracking-widest uppercase">
            {label}
          </CardTitle>
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border",
              iconWrap,
            )}
          >
            {icon}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="font-mono text-[2rem] leading-none font-semibold tracking-tight tabular-nums">
            {value}
          </div>
          <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
            {showLiveDot && (
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                <span className="bg-primary relative inline-flex h-1.5 w-1.5 rounded-full" />
              </span>
            )}
            <span>{subtitle}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ---------- Needs Attention ----------

function AttentionColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

const ATTENTION_TONE_STYLES: Record<"warning" | "danger" | "muted", string> = {
  warning: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
  muted: "bg-muted text-muted-foreground border-border/60",
};

function AttentionRow({
  icon,
  label,
  count,
  href,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  href: string;
  tone: "warning" | "danger" | "muted";
}) {
  if (count === 0) return null;
  return (
    <Link
      href={href}
      className="border-border/60 hover:border-border hover:bg-muted/30 group flex items-center justify-between gap-3 rounded-sm border p-2.5 transition-colors"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border",
            ATTENTION_TONE_STYLES[tone],
          )}
        >
          {icon}
        </span>
        <span className="truncate text-sm">{label}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Badge
          variant="outline"
          className="rounded-sm px-1.5 py-0 font-mono text-[10px] font-bold tracking-widest tabular-nums"
        >
          {count}
        </Badge>
        <IconChevronRight className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-colors" />
      </div>
    </Link>
  );
}

function AttentionColumnSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-24 rounded-sm" />
      <div className="space-y-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-sm" />
        ))}
      </div>
    </div>
  );
}

// ---------- Live Campaigns ----------

function CampaignRow({ campaign }: { campaign: CampaignSummary }) {
  const stale = isStaleCampaign(campaign);
  const statusStyle =
    CAMPAIGN_STATUS_STYLES[campaign.status] ??
    "bg-muted text-muted-foreground border-border/60";
  const submissions = campaign._count?.submissions ?? 0;
  const detailHref = `/admin/collect/campaigns/${campaign.id}`;
  return (
    <div className="border-border/60 hover:border-border hover:bg-muted/20 group flex items-start gap-3 rounded-sm border p-3 transition-colors">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={detailHref}
            className="hover:text-primary truncate text-sm font-semibold tracking-tight transition-colors"
          >
            {campaign.displayName?.trim() ||
              formatPersonName(campaign.candidateName)}
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
              ? relativeTime(campaign.lastSubmissionAt)
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
          ariaLabel={`Actions for ${campaign.displayName?.trim() || formatPersonName(campaign.candidateName)}`}
        />
      </div>
    </div>
  );
}

// ---------- Recent Candidate Setup ----------

function CandidateRow({ candidate }: { candidate: CandidateWithUser }) {
  const status = candidate.onboardingStatus;
  const statusStyle =
    ONBOARDING_STATUS_STYLES[status] ??
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
    <div className="border-border/60 hover:border-border hover:bg-muted/20 group flex flex-col gap-3 rounded-sm border p-3 transition-colors sm:flex-row sm:items-start">
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
            {formatStatusLabel(status)}
          </Badge>
        </div>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span>{candidate.position}</span>
          {locationLabel && <span>{locationLabel}</span>}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 sm:shrink-0">
        <RowAction href={detailHref} label="View" />
        <RowAction href={collectAction.href} label={collectAction.label} />
        <RowAction href={accountHref} label="Account" />
      </div>
    </div>
  );
}

function RowAction({ href, label }: { href: string; label: string }) {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="h-7 rounded-sm px-2 font-mono text-[10px] tracking-widest uppercase"
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
}

// ---------- Shared row primitives ----------

function RowSkeleton() {
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

function EmptyRow({
  icon,
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  icon: React.ReactNode;
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
