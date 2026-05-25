"use client";

import {
  IconClipboardList,
  IconDotsVertical,
  IconExternalLink,
} from "@tabler/icons-react";
import type { CandidateWithUser } from "@/features/admin/api/admin-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CampaignActionMenuItems } from "@/features/collect/components/admin/campaign-actions-menu";
import { formatStatusLabel } from "@/features/admin/server/admin-dashboard";
import { formatDisplayDate } from "@/lib/date-format";
import { nigeriaStates } from "@/features/geo/data/state-lga-locations";
import { formatPersonName } from "@/lib/utils";

export function resolveStateName(stateCode: string | null): string {
  if (!stateCode) return "Nigeria";
  return nigeriaStates.find((s) => s.code === stateCode)?.name ?? stateCode;
}

const ONBOARDING_STATUS_STYLES: Record<string, string> = {
  pending: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  credentials_sent: "bg-muted text-muted-foreground border-border/60",
  active: "bg-primary/10 text-primary border-primary/30",
  suspended: "bg-destructive/10 text-destructive border-destructive/30",
};

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

export function getCandidateDisplayName(candidate: CandidateWithUser) {
  return candidate.title
    ? `${candidate.title} ${formatPersonName(candidate.name)}`
    : formatPersonName(candidate.name);
}

function getPrimaryAction(candidate: CandidateWithUser) {
  if (candidate.draftCampaign) {
    return {
      label: "Continue Draft",
      href: `/admin/collect/campaigns/${candidate.draftCampaign.id}`,
    };
  }
  if (!candidate.collectCampaign) {
    return {
      label: "Create Campaign",
      href: `/admin/collect/campaigns/new?candidateId=${candidate.id}`,
    };
  }

  return {
    label: "View Collect",
    href: `/admin/collect/campaigns/${candidate.collectCampaign.id}`,
  };
}

export function OnboardingBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase ${ONBOARDING_STATUS_STYLES[status] ?? ""}`}
    >
      {formatStatusLabel(status)}
    </Badge>
  );
}

export function CollectBadge({ candidate }: { candidate: CandidateWithUser }) {
  const campaign = candidate.collectCampaign;

  if (!campaign) {
    return (
      <Badge
        variant="outline"
        className="border-border/60 bg-muted text-muted-foreground rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
      >
        None
      </Badge>
    );
  }

  return (
    <div className="space-y-1">
      <Badge
        variant="outline"
        className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase ${CAMPAIGN_STATUS_STYLES[campaign.status] ?? ""}`}
      >
        {formatStatusLabel(campaign.status)}
      </Badge>
      <p className="text-muted-foreground font-mono text-[10px] tabular-nums">
        {campaign.submissionsCount.toLocaleString()} submissions
      </p>
    </div>
  );
}

export function ReportBadge({ candidate }: { candidate: CandidateWithUser }) {
  const campaign = candidate.collectCampaign;
  const enabled = Boolean(
    campaign?.clientReportEnabled && campaign.clientReportToken,
  );

  if (!campaign) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  return (
    <div className="space-y-1">
      <Badge
        variant="outline"
        className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase ${
          enabled ? REPORT_STATUS_STYLES.enabled : REPORT_STATUS_STYLES.disabled
        }`}
      >
        {enabled ? "Insights On" : "Insights Off"}
      </Badge>
      {campaign.clientReportLastViewedAt && (
        <p className="text-muted-foreground text-[10px]">
          Viewed{" "}
          {formatDisplayDate(campaign.clientReportLastViewedAt, {
            day: "numeric",
            month: "short",
          })}
        </p>
      )}
    </div>
  );
}

export function CandidateActions({
  candidate,
  onNavigate,
}: {
  candidate: CandidateWithUser;
  onNavigate: (href: string) => void;
}) {
  const campaign = candidate.collectCampaign;
  const primaryAction = getPrimaryAction(candidate);

  return (
    <div className="flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm shadow-none"
            aria-label={`Open actions for ${formatPersonName(candidate.name)}`}
          >
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
            Shortcuts
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onNavigate(primaryAction.href);
            }}
          >
            <IconClipboardList className="mr-2 h-4 w-4" />
            {primaryAction.label}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onNavigate(`/admin/candidates/${candidate.id}`);
            }}
          >
            <IconExternalLink className="mr-2 h-4 w-4" />
            View Candidate
          </DropdownMenuItem>

          {campaign ? (
            <>
              <DropdownMenuSeparator />
              <CampaignActionMenuItems
                campaign={campaign}
                includeViewCollect={false}
              />
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function CandidateTableSkeleton() {
  return (
    <div className="border-border/60 hidden overflow-x-auto rounded-sm border border-dashed md:block">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-muted-foreground h-10 w-14 text-center font-mono text-[10px] font-bold tracking-widest uppercase">
              S/N
            </TableHead>
            <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
              Name
            </TableHead>
            <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
              Party
            </TableHead>
            <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
              Position
            </TableHead>
            <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase md:table-cell">
              Location
            </TableHead>
            <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase lg:table-cell">
              Collect
            </TableHead>
            <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase xl:table-cell">
              Insights
            </TableHead>
            <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase xl:table-cell">
              Account
            </TableHead>
            <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase xl:table-cell">
              Added
            </TableHead>
            <TableHead className="text-muted-foreground h-10 w-12 text-right font-mono text-[10px] font-bold tracking-widest uppercase">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-4 w-4 rounded-sm" />
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36 rounded-sm" />
                  <Skeleton className="h-3 w-44 rounded-sm" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-sm" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24 rounded-sm" />
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded-sm" />
                  <Skeleton className="h-3 w-32 rounded-sm" />
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Skeleton className="h-5 w-28 rounded-sm" />
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <Skeleton className="h-5 w-20 rounded-sm" />
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <Skeleton className="h-5 w-28 rounded-sm" />
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <Skeleton className="h-4 w-20 rounded-sm" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto h-8 w-8 rounded-sm" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
