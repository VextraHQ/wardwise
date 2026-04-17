"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  IconPlus,
  IconClipboardList,
  IconPlayerPlay,
  IconUsers,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useCampaigns } from "@/hooks/use-collect";
import type { CampaignSummary } from "@/types/collect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { CampaignActionsMenu } from "@/components/admin/collect/campaign-actions-menu";
import {
  getCampaignBrandingLabel,
  getEffectiveCampaignName,
} from "@/lib/collect/branding";
import {
  AdminResourceState,
  adminResourceStateIcons,
} from "@/components/admin/shared/admin-resource-state";

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "No activity yet";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function isStale(campaign: CampaignSummary): boolean {
  if (campaign.status !== "active") return false;
  if (!campaign.lastSubmissionAt) return campaign._count.submissions === 0;
  const diff = Date.now() - new Date(campaign.lastSubmissionAt).getTime();
  return diff > 48 * 60 * 60 * 1000; // 48 hours
}

const CAMPAIGN_STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border/60",
  active: "bg-primary/10 text-primary border-primary/30",
  paused: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  closed: "bg-destructive/10 text-destructive border-destructive/30",
};

const REPORT_STATUS_STYLES: Record<string, string> = {
  enabled: "bg-primary/10 text-primary border-primary/30",
  disabled: "bg-muted text-muted-foreground border-border/60",
};

function formatStatusLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function CampaignReportBadge({ campaign }: { campaign: CampaignSummary }) {
  const enabled = Boolean(
    campaign.clientReportEnabled && campaign.clientReportToken,
  );

  return (
    <div className="space-y-1">
      <Badge
        variant="outline"
        className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase ${
          enabled ? REPORT_STATUS_STYLES.enabled : REPORT_STATUS_STYLES.disabled
        }`}
      >
        {enabled ? "Insights On" : "Off"}
      </Badge>
      {campaign.clientReportLastViewedAt && (
        <p className="text-muted-foreground text-[10px]">
          Viewed {relativeTime(campaign.clientReportLastViewedAt)}
        </p>
      )}
    </div>
  );
}

function StatsBar({ campaigns }: { campaigns: CampaignSummary[] }) {
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const totalSubmissions = campaigns.reduce(
    (sum, c) => sum + c._count.submissions,
    0,
  );

  const stats = [
    {
      label: "Total Campaigns",
      value: totalCampaigns,
      subtitle: "Registration campaigns",
      icon: IconClipboardList,
    },
    {
      label: "Active",
      value: activeCampaigns,
      subtitle: `of ${totalCampaigns} campaigns`,
      icon: IconPlayerPlay,
    },
    {
      label: "Total Submissions",
      value: totalSubmissions.toLocaleString(),
      subtitle: "Supporter registrations",
      icon: IconUsers,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border-border/60 hover:border-border group relative overflow-hidden rounded-sm shadow-none transition-colors"
        >
          <div className="bg-primary/20 absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
            <CardTitle className="text-foreground/60 font-mono text-[10px] font-bold tracking-widest uppercase">
              {stat.label}
            </CardTitle>
            <div className="bg-primary/10 group-hover:bg-primary/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm transition-colors sm:h-9 sm:w-9">
              <stat.icon className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-mono text-xl font-semibold tabular-nums sm:text-2xl">
              {stat.value}
            </div>
            <p className="text-foreground/50 mt-1 text-xs font-medium">
              {stat.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatsBarSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card
          key={i}
          className="border-border/60 bg-card animate-pulse rounded-sm border-dashed shadow-none"
        >
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-8 rounded-sm sm:h-9 sm:w-9" />
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="h-7 w-14 sm:h-8 sm:w-16" />
            <Skeleton className="mt-2 h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="border-border/60 bg-card animate-pulse rounded-sm border border-dashed">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-muted-foreground h-10 w-14 text-center font-mono text-[10px] font-bold tracking-widest uppercase">
              S/N
            </TableHead>
            <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
              Campaign
            </TableHead>
            <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
              Constituency
            </TableHead>
            <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
              Status
            </TableHead>
            <TableHead className="text-muted-foreground h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase">
              Submissions
            </TableHead>
            <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
              Report
            </TableHead>
            <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
              Last Activity
            </TableHead>
            <TableHead className="text-muted-foreground h-10 w-12 text-right font-mono text-[10px] font-bold tracking-widest uppercase">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-4 w-4" />
              </TableCell>
              {Array.from({ length: 7 }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EmptyState() {
  return (
    <AdminResourceState
      icon={IconClipboardList}
      title="No campaigns yet"
      description="Create your first Collect campaign to start collecting supporter registrations."
      action={{
        label: "Create Campaign",
        href: "/admin/collect/campaigns/new",
        icon: adminResourceStateIcons.plus,
        variant: "outline",
      }}
    />
  );
}

export function CampaignList() {
  const router = useRouter();
  const { data: campaigns, isLoading, error } = useCampaigns();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalItems = campaigns?.length ?? 0;
  const activeCampaignCount = useMemo(
    () =>
      campaigns?.filter((campaign) => campaign.status === "active").length ?? 0,
    [campaigns],
  );
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const paginatedCampaigns = useMemo(() => {
    if (!campaigns) return [];
    const start = (page - 1) * pageSize;
    return campaigns.slice(start, start + pageSize);
  }, [campaigns, page, pageSize]);

  const snOffset = (page - 1) * pageSize;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Stats */}
      {isLoading ? (
        <StatsBarSkeleton />
      ) : campaigns ? (
        <StatsBar campaigns={campaigns} />
      ) : null}

      {/* Header + action */}
      <div className="border-border/60 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-primary mb-1 font-mono text-[10px] font-bold tracking-widest uppercase">
            Registration Directory
          </p>
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            Campaigns
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Registration links, campaign status, and submission activity.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Badge
              variant="outline"
              className="bg-background rounded-sm px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest uppercase"
            >
              {isLoading ? "--" : totalItems.toLocaleString()} total
            </Badge>
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary rounded-sm px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest uppercase"
            >
              {isLoading ? "--" : activeCampaignCount.toLocaleString()} active
            </Badge>
          </div>

          {(!campaigns || campaigns.length > 0) && (
            <Button
              asChild
              size="sm"
              className="h-9 w-full rounded-sm font-mono text-[11px] tracking-widest uppercase sm:w-auto"
            >
              <Link href="/admin/collect/campaigns/new">
                <IconPlus className="mr-1.5 h-4 w-4" />
                New Campaign
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="overflow-x-auto">
          <TableSkeleton />
        </div>
      ) : error ? (
        <AdminResourceState
          tone="error"
          title="Failed to load campaigns"
          description="We couldn’t load the campaign list. Please refresh the page or try again."
          action={{
            label: "Refresh",
            onClick: () => window.location.reload(),
            icon: adminResourceStateIcons.alert,
            variant: "outline",
          }}
        />
      ) : campaigns && campaigns.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="overflow-x-auto rounded-sm border">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 z-10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-muted-foreground h-10 w-14 text-center font-mono text-[10px] font-bold tracking-widest uppercase">
                    S/N
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                    Campaign
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase sm:table-cell">
                    Constituency
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase">
                    Submissions
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase xl:table-cell">
                    Report
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase lg:table-cell">
                    Last Activity
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 w-12 text-right font-mono text-[10px] font-bold tracking-widest uppercase">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCampaigns.map(
                  (campaign: CampaignSummary, idx: number) => {
                    const campaignName = getEffectiveCampaignName(campaign);
                    const brandingLabel = getCampaignBrandingLabel(
                      campaign.brandingType,
                    );

                    return (
                      <TableRow
                        key={campaign.id}
                        className="hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() =>
                          router.push(`/admin/collect/campaigns/${campaign.id}`)
                        }
                      >
                        <TableCell className="text-foreground/50 text-center font-mono text-xs font-bold tabular-nums">
                          {snOffset + idx + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{campaignName}</p>
                              {campaign.brandingType !== "candidate" && (
                                <Badge
                                  variant="outline"
                                  className="rounded-sm px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase"
                                >
                                  {brandingLabel}
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {campaign.party} &middot;{" "}
                              <code className="text-[11px]">
                                /c/{campaign.slug}
                              </code>
                            </p>
                            {campaign.displayName && (
                              <p className="text-muted-foreground text-xs">
                                Anchor: {campaign.candidateName}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {campaign.constituency}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase ${CAMPAIGN_STATUS_STYLES[campaign.status] ?? ""}`}
                          >
                            {formatStatusLabel(campaign.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium tabular-nums">
                          {campaign._count.submissions.toLocaleString()}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <CampaignReportBadge campaign={campaign} />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground text-xs">
                              {relativeTime(campaign.lastSubmissionAt)}
                            </span>
                            {isStale(campaign) && (
                              <IconAlertTriangle
                                className="h-3.5 w-3.5 text-amber-500"
                                title="No submissions in 48h"
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell
                          className="w-12 text-right"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <CampaignActionsMenu
                            campaign={campaign}
                            ariaLabel={`Open actions for ${campaignName}`}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  },
                )}
              </TableBody>
            </Table>
          </div>
          <AdminPagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            itemLabel="campaigns"
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </>
      )}
    </div>
  );
}
