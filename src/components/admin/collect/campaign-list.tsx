"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconPlus,
  IconEye,
  IconClipboardList,
  IconPlayerPlay,
  IconUsers,
  IconClipboard,
  IconDotsVertical,
  IconCopy,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { AdminPagination } from "@/components/admin/admin-pagination";
import {
  getCampaignBrandingLabel,
  getEffectiveCampaignName,
} from "@/lib/collect/branding";

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "No activity";
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
              Candidate
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
              Created
            </TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-4 w-4" />
              </TableCell>
              {Array.from({ length: 6 }).map((_, j) => (
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
    <div className="border-border flex flex-col items-center gap-3 rounded-sm border border-dashed py-12 text-center">
      <IconClipboard className="text-muted-foreground h-10 w-10" />
      <p className="text-muted-foreground text-sm">
        No campaigns yet. Create your first campaign to start collecting
        registrations.
      </p>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="mt-2 rounded-sm font-mono text-[11px] tracking-widest uppercase"
      >
        <Link href="/admin/collect/campaigns/new">
          <IconPlus className="mr-1.5 h-3.5 w-3.5" />
          Create Campaign
        </Link>
      </Button>
    </div>
  );
}

export function CampaignList() {
  const router = useRouter();
  const { data: campaigns, isLoading, error } = useCampaigns();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalItems = campaigns?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const paginatedCampaigns = useMemo(() => {
    if (!campaigns) return [];
    const start = (page - 1) * pageSize;
    return campaigns.slice(start, start + pageSize);
  }, [campaigns, page, pageSize]);

  const snOffset = (page - 1) * pageSize;

  const handleCopyLink = (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/c/${slug}`;
    void navigator.clipboard.writeText(url);
    toast.success("Campaign link copied to clipboard");
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Stats */}
      {isLoading ? (
        <StatsBarSkeleton />
      ) : campaigns ? (
        <StatsBar campaigns={campaigns} />
      ) : null}

      {/* Header + action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Campaigns</h2>
          {!isLoading && campaigns && campaigns.length > 0 && (
            <p className="text-foreground/60 text-sm">
              {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}{" "}
              total
            </p>
          )}
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

      {/* Table */}
      {isLoading ? (
        <div className="overflow-x-auto">
          <TableSkeleton />
        </div>
      ) : error ? (
        <div className="rounded-sm border p-6">
          <p className="text-destructive text-sm">Failed to load campaigns.</p>
        </div>
      ) : campaigns && campaigns.length === 0 ? (
        <div className="rounded-sm border">
          <EmptyState />
        </div>
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
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase lg:table-cell">
                    Last Activity
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase md:table-cell">
                    Created
                  </TableHead>
                  <TableHead className="h-10 w-12" />
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
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium tabular-nums">
                          {campaign._count.submissions.toLocaleString()}
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
                        <TableCell className="text-muted-foreground hidden md:table-cell">
                          {new Date(campaign.createdAt).toLocaleDateString(
                            "en-NG",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <IconDotsVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(
                                    `/admin/collect/campaigns/${campaign.id}`,
                                  );
                                }}
                              >
                                <IconEye className="mr-2 h-4 w-4 hover:text-gray-500" />
                                View Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) =>
                                  handleCopyLink(e, campaign.slug)
                                }
                              >
                                <IconCopy className="mr-2 h-4 w-4 hover:text-gray-500" />
                                Copy Link
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
