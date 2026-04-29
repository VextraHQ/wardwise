"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { CampaignActionsMenu } from "@/components/admin/collect/campaign-actions-menu";
import { IconClipboardList, IconPlus } from "@tabler/icons-react";
import {
  AdminResourceState,
  adminResourceStateIcons,
} from "@/components/admin/shared/admin-resource-state";
import { formatStatusLabel } from "@/lib/admin/dashboard";
import { getEffectiveCampaignName } from "@/lib/collect/branding";
import { formatRelativeTime } from "@/lib/date-format";
import { formatPersonName } from "@/lib/utils";
import type { CampaignSummary } from "@/types/collect";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border/60",
  active: "bg-primary/10 text-primary border-primary/30",
  paused: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  closed: "bg-destructive/10 text-destructive border-destructive/30",
};

const REPORT_STATUS_STYLES: Record<string, string> = {
  enabled: "bg-primary/10 text-primary border-primary/30",
  disabled: "bg-muted text-muted-foreground border-border/60",
};

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
          Viewed{" "}
          {formatRelativeTime(campaign.clientReportLastViewedAt, {
            absoluteDateOptions: {
              day: "numeric",
              month: "short",
              year: "numeric",
            },
          })}
        </p>
      )}
    </div>
  );
}

interface CandidateCampaignsProps {
  candidateId: string;
}

export function CandidateCampaigns({ candidateId }: CandidateCampaignsProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: campaigns,
    isLoading,
    error,
  } = useQuery<CampaignSummary[]>({
    queryKey: ["admin", "candidates", candidateId, "campaigns"],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/collect/campaigns?candidateId=${candidateId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      const json = await res.json();
      return json.campaigns;
    },
    staleTime: 1000 * 60,
  });

  const createCampaignHref = `/admin/collect/campaigns/new?candidateId=${candidateId}`;

  const totalPages = Math.max(
    1,
    Math.ceil((campaigns?.length ?? 0) / pageSize),
  );
  const safePage = Math.min(page, totalPages);
  const snOffset = (safePage - 1) * pageSize;

  const paginatedCampaigns = useMemo(() => {
    if (!campaigns) return [];
    const start = (safePage - 1) * pageSize;
    return campaigns.slice(start, start + pageSize);
  }, [campaigns, safePage, pageSize]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-48 rounded-sm" />
          <Skeleton className="h-9 w-36 rounded-sm" />
        </div>
        <div className="rounded-sm border border-dashed">
          <Skeleton className="h-10 w-full rounded-none" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="mx-4 my-4 h-8 rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <AdminResourceState
        tone="error"
        title="Failed to load campaigns"
        description="We couldn’t load this candidate’s campaigns. Please refresh the page or try again."
        action={{
          label: "Refresh",
          onClick: () => window.location.reload(),
          icon: adminResourceStateIcons.alert,
          variant: "outline",
        }}
      />
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <AdminResourceState
        icon={IconClipboardList}
        title="No campaigns yet"
        description="Create a Collect campaign for this candidate to start collecting supporter registrations."
        action={{
          label: "Create Campaign",
          onClick: () => router.push(createCampaignHref),
          icon: adminResourceStateIcons.plus,
          variant: "outline",
        }}
      />
    );
  }

  const totalSubmissions = campaigns.reduce(
    (sum, c) => sum + c._count.submissions,
    0,
  );

  return (
    <div className="space-y-4 pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="bg-background rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
          >
            {campaigns.length.toLocaleString()} total
          </Badge>
          <Badge
            variant="outline"
            className="border-primary/30 bg-primary/10 text-primary rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
          >
            {totalSubmissions.toLocaleString()} submissions
          </Badge>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 w-full rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase sm:w-auto"
          onClick={() => router.push(createCampaignHref)}
        >
          <IconPlus className="mr-1.5 h-3.5 w-3.5" />
          Create Campaign
        </Button>
      </div>

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
              <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase md:table-cell">
                Submissions
              </TableHead>
              <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase xl:table-cell">
                Report
              </TableHead>
              <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase sm:table-cell">
                Last Activity
              </TableHead>
              <TableHead className="text-muted-foreground hidden h-10 w-12 text-right font-mono text-[10px] font-bold tracking-widest uppercase sm:table-cell">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCampaigns.map((campaign, idx) => (
              <TableRow
                key={campaign.id}
                className="hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() =>
                  router.push(`/admin/collect/campaigns/${campaign.id}`)
                }
              >
                <TableCell className="text-muted-foreground text-center font-mono text-xs tabular-nums">
                  {snOffset + idx + 1}
                </TableCell>
                <TableCell>
                  <div>
                    <span className="text-sm font-medium">
                      {getEffectiveCampaignName(campaign)}
                    </span>
                    <span className="text-muted-foreground block font-mono text-xs">
                      /c/{campaign.slug}
                    </span>
                    {campaign.displayName && (
                      <span className="text-muted-foreground block text-xs">
                        Anchor: {formatPersonName(campaign.candidateName)}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase ${STATUS_STYLES[campaign.status] ?? ""}`}
                  >
                    {formatStatusLabel(campaign.status)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden font-mono text-sm tabular-nums md:table-cell">
                  {campaign._count.submissions.toLocaleString()}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <CampaignReportBadge campaign={campaign} />
                </TableCell>
                <TableCell className="text-muted-foreground hidden text-xs sm:table-cell">
                  {formatRelativeTime(campaign.lastSubmissionAt, {
                    absoluteDateOptions: {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  })}
                </TableCell>
                <TableCell
                  className="w-12 text-right"
                  onClick={(event) => event.stopPropagation()}
                >
                  <CampaignActionsMenu
                    campaign={campaign}
                    ariaLabel={`Open actions for ${getEffectiveCampaignName(campaign)}`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AdminPagination
        currentPage={safePage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={campaigns.length}
        itemLabel="campaigns"
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}
