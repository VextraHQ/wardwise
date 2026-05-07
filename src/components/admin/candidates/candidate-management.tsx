"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminCandidates } from "@/hooks/use-admin";
import { HiOutlineUserAdd, HiOutlineUserGroup, HiX } from "react-icons/hi";
import {
  IconClipboardList,
  IconDotsVertical,
  IconExternalLink,
} from "@tabler/icons-react";

import type { Candidate } from "@/types/candidate";
import type { CandidateWithUser } from "@/lib/api/admin";
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

import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import {
  CandidateFilters,
  type CandidateCollectFilter,
  type CandidateInsightsFilter,
  type CandidateSort,
} from "@/components/admin/admin-filters/candidate-filters";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { CampaignActionMenuItems } from "@/components/admin/collect/campaign-actions-menu";
import {
  AdminResourceState,
  adminResourceStateIcons,
} from "@/components/admin/shared/admin-resource-state";

import { formatStatusLabel } from "@/lib/admin/dashboard";
import { formatDisplayDate } from "@/lib/date-format";
import { nigeriaStates } from "@/lib/data/state-lga-locations";
import { cn, formatPersonName } from "@/lib/utils";
import {
  AdminMobileRecordCard,
  AdminMobileRecordField,
  AdminMobileRecordFields,
  AdminMobileRecordHeader,
  AdminMobileRecordMeta,
  AdminMobileRecordSkeleton,
  AdminMobileRecordTitle,
} from "@/components/admin/shared/admin-mobile-record-card";

function resolveStateName(stateCode: string | null): string {
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

function getCandidateDisplayName(candidate: CandidateWithUser) {
  return candidate.title
    ? `${candidate.title} ${formatPersonName(candidate.name)}`
    : formatPersonName(candidate.name);
}

function getPrimaryAction(candidate: CandidateWithUser) {
  const campaign = candidate.collectCampaign;
  if (!campaign) {
    return {
      label: "Create Campaign",
      href: `/admin/collect/campaigns/new?candidateId=${candidate.id}`,
    };
  }

  return {
    label: campaign.status === "draft" ? "Continue Setup" : "View Collect",
    href: `/admin/collect/campaigns/${campaign.id}`,
  };
}

function OnboardingBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase ${ONBOARDING_STATUS_STYLES[status] ?? ""}`}
    >
      {formatStatusLabel(status)}
    </Badge>
  );
}

function CollectBadge({ candidate }: { candidate: CandidateWithUser }) {
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

function ReportBadge({ candidate }: { candidate: CandidateWithUser }) {
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
        {enabled ? "Enabled" : "Off"}
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

function CandidateActions({
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

function CandidateTableSkeleton() {
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
              Report
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

type CandidateStatusFilter =
  | "all"
  | "pending"
  | "credentials_sent"
  | "active"
  | "suspended";

const CANDIDATE_STATUS_TABS: { value: CandidateStatusFilter; label: string }[] =
  [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "credentials_sent", label: "Credentials Sent" },
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
  ];

export function CandidateManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<CandidateStatusFilter>("all");
  const [collectFilter, setCollectFilter] =
    useState<CandidateCollectFilter>("all");
  const [insightsFilter, setInsightsFilter] =
    useState<CandidateInsightsFilter>("all");
  const [partyFilter, setPartyFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [candidateSort, setCandidateSort] = useState<CandidateSort>("date");
  const [candidatePage, setCandidatePage] = useState(1);
  const [candidatePageSize, setCandidatePageSize] = useState(10);

  const { data: candidates = [], isLoading, error } = useAdminCandidates();
  const hasSearchQuery = searchQuery.trim().length > 0;

  const statusCounts: Record<CandidateStatusFilter, number> = useMemo(
    () => ({
      all: candidates.length,
      pending: candidates.filter((c) => c.onboardingStatus === "pending")
        .length,
      credentials_sent: candidates.filter(
        (c) => c.onboardingStatus === "credentials_sent",
      ).length,
      active: candidates.filter((c) => c.onboardingStatus === "active").length,
      suspended: candidates.filter((c) => c.onboardingStatus === "suspended")
        .length,
    }),
    [candidates],
  );

  const uniqueParties = useMemo(
    () =>
      Array.from(
        new Set(candidates.map((candidate) => candidate.party).filter(Boolean)),
      ).sort(),
    [candidates],
  );

  const uniquePositions = useMemo(
    () =>
      Array.from(
        new Set(
          candidates.map((candidate) => candidate.position).filter(Boolean),
        ),
      ).sort() as Candidate["position"][],
    [candidates],
  );

  const filteredCandidates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = candidates.filter((candidate) => {
      if (statusFilter !== "all" && candidate.onboardingStatus !== statusFilter)
        return false;

      if (collectFilter !== "all") {
        const hasCampaign =
          candidate.hasAnyCampaign ??
          ((candidate.campaignCount ?? 0) > 0 ||
            Boolean(candidate.collectCampaign));
        const hasActiveCampaign =
          candidate.hasActiveCampaign ??
          candidate.collectCampaign?.status === "active";
        if (collectFilter === "has-active" && !hasActiveCampaign) return false;
        if (
          collectFilter === "has-inactive" &&
          (!hasCampaign || hasActiveCampaign)
        )
          return false;
        if (collectFilter === "no-campaign" && hasCampaign) return false;
      }

      if (insightsFilter !== "all") {
        const hasCampaign =
          candidate.hasAnyCampaign ??
          ((candidate.campaignCount ?? 0) > 0 ||
            Boolean(candidate.collectCampaign));
        const insightsOn =
          candidate.hasInsightsEnabledCampaign ??
          Boolean(
            candidate.collectCampaign?.clientReportEnabled &&
            candidate.collectCampaign.clientReportToken,
          );
        if (!hasCampaign) return false;
        if (insightsFilter === "insights-on" && !insightsOn) return false;
        if (insightsFilter === "insights-off" && insightsOn) return false;
      }

      if (partyFilter !== "all" && candidate.party !== partyFilter)
        return false;
      if (positionFilter !== "all" && candidate.position !== positionFilter)
        return false;
      if (!query) return true;

      const searchableFields = [
        candidate.name,
        candidate.party,
        candidate.position,
        candidate.constituency,
        candidate.user?.email,
      ];
      return searchableFields.some((value) =>
        value?.toLowerCase().includes(query),
      );
    });

    filtered.sort((left, right) => {
      switch (candidateSort) {
        case "name":
          return left.name.localeCompare(right.name);
        case "campaigns":
          return (right.campaignCount ?? 0) - (left.campaignCount ?? 0);
        case "supporters":
          return (right.supporterCount ?? 0) - (left.supporterCount ?? 0);
        case "date":
        default:
          return (
            new Date(right.user.createdAt).getTime() -
            new Date(left.user.createdAt).getTime()
          );
      }
    });

    return filtered;
  }, [
    candidates,
    searchQuery,
    statusFilter,
    collectFilter,
    insightsFilter,
    partyFilter,
    positionFilter,
    candidateSort,
  ]);

  const candidateTotalPages = Math.max(
    1,
    Math.ceil(filteredCandidates.length / candidatePageSize),
  );

  const safeCandidatePage = Math.min(candidatePage, candidateTotalPages);

  const paginatedCandidates = useMemo(() => {
    const startIndex = (safeCandidatePage - 1) * candidatePageSize;
    return filteredCandidates.slice(startIndex, startIndex + candidatePageSize);
  }, [filteredCandidates, safeCandidatePage, candidatePageSize]);

  const activeFilters =
    hasSearchQuery ||
    statusFilter !== "all" ||
    collectFilter !== "all" ||
    insightsFilter !== "all" ||
    partyFilter !== "all" ||
    positionFilter !== "all" ||
    candidateSort !== "date";
  const hasActiveCandidateFilters =
    hasSearchQuery ||
    statusFilter !== "all" ||
    collectFilter !== "all" ||
    insightsFilter !== "all" ||
    partyFilter !== "all" ||
    positionFilter !== "all";

  // S/N offset for current page
  const snOffset = (safeCandidatePage - 1) * candidatePageSize;
  const candidateCountLabel =
    filteredCandidates.length === candidates.length
      ? `${candidates.length.toLocaleString()} total`
      : `${filteredCandidates.length.toLocaleString()} shown`;

  function resetDirectoryFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setCollectFilter("all");
    setInsightsFilter("all");
    setPartyFilter("all");
    setPositionFilter("all");
    setCandidateSort("date");
    setCandidatePage(1);
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      {/* Page header — same rhythm as Collect campaigns */}
      <div className="border-border/60 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-primary mb-1 font-mono text-[10px] font-bold tracking-widest uppercase">
            Directory
          </p>
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            Candidate Accounts
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Profiles, constituency scope, account status, and Collect shortcuts.
          </p>
        </div>

        <Button
          onClick={() => router.push("/admin/candidates/new")}
          className="h-9 w-full gap-2 rounded-sm font-mono text-[11px] tracking-widest uppercase sm:w-auto"
        >
          <HiOutlineUserAdd className="h-4 w-4" />
          Create Candidate
        </Button>
      </div>

      {/* Status pill bar */}
      {!error ? (
        isLoading ? (
          <div className="border-border/60 flex flex-col gap-2 border-b py-2 md:flex-row md:items-center md:justify-between md:gap-3 md:py-1">
            <div className="flex w-full min-w-0 items-center gap-1.5 overflow-hidden md:flex-1">
              {["w-12", "w-20", "w-32", "w-16", "w-24"].map((widthClass, i) => (
                <Skeleton
                  key={i}
                  className={cn("h-7 shrink-0 rounded-sm", widthClass)}
                />
              ))}
            </div>
            <Skeleton className="h-4 w-20 shrink-0 rounded-sm md:ml-auto" />
          </div>
        ) : (
          <div className="border-border/60 flex flex-col gap-2 border-b py-2 md:flex-row md:items-center md:justify-between md:gap-3 md:py-1">
            <div
              role="group"
              aria-label="Filter candidates by account status"
              className="flex w-full min-w-0 items-center gap-0.5 overflow-x-auto pb-0.5 [scrollbar-width:none] md:flex-1 md:pb-0 [&::-webkit-scrollbar]:hidden"
            >
              {CANDIDATE_STATUS_TABS.map(({ value, label }) => {
                const isActive = statusFilter === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => {
                      setStatusFilter(value);
                      setCandidatePage(1);
                    }}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-sm px-2.5 py-1.5 font-mono text-[10px] font-bold tracking-widest whitespace-nowrap uppercase transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {label}
                    <span
                      className={cn(
                        "tabular-nums",
                        isActive
                          ? "text-primary/70"
                          : "text-muted-foreground/60",
                      )}
                    >
                      {statusCounts[value].toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="border-border/40 text-muted-foreground flex w-full items-center justify-end gap-3 border-t pt-2 md:w-auto md:shrink-0 md:justify-end md:border-t-0 md:pt-0 md:pl-2">
              <span className="font-mono text-[10px] font-bold tracking-widest whitespace-nowrap uppercase tabular-nums">
                {candidateCountLabel}
              </span>
              {activeFilters ? (
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={resetDirectoryFilters}
                  aria-label="Reset search and filters"
                  className="border-border/60 hover:bg-muted h-7 shrink-0 gap-1.5 rounded-sm px-2.5 font-mono text-[10px] font-bold tracking-widest uppercase shadow-none"
                >
                  <HiX className="h-3 w-3" />
                  Reset
                </Button>
              ) : null}
            </div>
          </div>
        )
      ) : null}

      {/* Toolbar — search row */}
      <div className="border-border/60 flex flex-col gap-3 border-b py-4">
        <AdminSearchBar
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value);
            setCandidatePage(1);
          }}
          onClear={() => setCandidatePage(1)}
          placeholder="Search candidates by name, email, party, position, or constituency"
          mobilePlaceholder="Search name, email, party…"
        />

        <CandidateFilters
          collectFilter={collectFilter}
          insightsFilter={insightsFilter}
          partyFilter={partyFilter}
          positionFilter={positionFilter}
          sort={candidateSort}
          uniqueParties={uniqueParties}
          uniquePositions={uniquePositions}
          onFilterChange={({ collect, insights, party, position, sort }) => {
            if (collect !== undefined) setCollectFilter(collect);
            if (insights !== undefined) setInsightsFilter(insights);
            if (party !== undefined) setPartyFilter(party);
            if (position !== undefined) setPositionFilter(position);
            if (sort !== undefined) setCandidateSort(sort);
            setCandidatePage(1);
          }}
          onReset={resetDirectoryFilters}
          hasFilters={activeFilters}
        />
      </div>

      {/* Records */}
      <div className="mt-5 flex flex-1 flex-col gap-4">
        {isLoading ? (
          <>
            <AdminMobileRecordSkeleton rows={5} />
            <CandidateTableSkeleton />
          </>
        ) : error ? (
          <AdminResourceState
            tone="error"
            title="Failed to load candidates"
            description="We couldn’t load the candidate list. Please refresh the page or try again."
            action={{
              label: "Refresh",
              onClick: () => window.location.reload(),
              icon: adminResourceStateIcons.alert,
              variant: "outline",
            }}
          />
        ) : filteredCandidates.length === 0 ? (
          <AdminResourceState
            icon={HiOutlineUserGroup}
            title={
              hasSearchQuery
                ? "No candidates match your search"
                : hasActiveCandidateFilters
                  ? "No candidates match your filters"
                  : "No candidates found"
            }
            description={
              hasSearchQuery
                ? "Try adjusting your search terms or clearing filters."
                : hasActiveCandidateFilters
                  ? "No candidates match the current combination of status and filter selections. Try clearing one or more filters."
                  : "Create your first candidate to start managing campaigns, account access, and Collect setup."
            }
            action={
              hasSearchQuery || hasActiveCandidateFilters
                ? {
                    label:
                      hasSearchQuery && !hasActiveCandidateFilters
                        ? "Clear Search"
                        : "Clear Filters",
                    onClick: resetDirectoryFilters,
                    variant: "outline",
                  }
                : !hasSearchQuery
                  ? {
                      label: "Create Candidate",
                      onClick: () => router.push("/admin/candidates/new"),
                      icon: <HiOutlineUserAdd className="mr-1.5 h-3.5 w-3.5" />,
                      variant: "outline",
                    }
                  : undefined
            }
          />
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {paginatedCandidates.map((candidate) => {
                const isSuspended = candidate.onboardingStatus === "suspended";
                return (
                  <AdminMobileRecordCard
                    key={candidate.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isSuspended
                        ? "border-destructive/30 bg-destructive/5 hover:bg-destructive/10"
                        : "hover:bg-muted/30",
                    )}
                    onClick={() =>
                      router.push(`/admin/candidates/${candidate.id}`)
                    }
                  >
                    <AdminMobileRecordHeader>
                      <div className="min-w-0 flex-1">
                        <AdminMobileRecordTitle>
                          {getCandidateDisplayName(candidate)}
                        </AdminMobileRecordTitle>
                        <AdminMobileRecordMeta mono>
                          {candidate.user?.email ?? "—"}
                        </AdminMobileRecordMeta>
                      </div>
                      <div
                        className="flex shrink-0 flex-col items-end gap-2"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Badge
                          variant="outline"
                          className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                        >
                          {candidate.party}
                        </Badge>
                        <CandidateActions
                          candidate={candidate}
                          onNavigate={(href) => router.push(href)}
                        />
                      </div>
                    </AdminMobileRecordHeader>
                    <AdminMobileRecordFields>
                      <AdminMobileRecordField
                        label="Position"
                        value={candidate.position}
                      />
                      <AdminMobileRecordField label="Location">
                        <span className="block text-right">
                          {resolveStateName(candidate.stateCode)}
                          {candidate.constituency ? (
                            <span className="text-muted-foreground block text-xs font-normal">
                              {candidate.constituency}
                            </span>
                          ) : null}
                        </span>
                      </AdminMobileRecordField>
                      <AdminMobileRecordField label="Collect">
                        <div className="text-foreground ml-auto inline-flex flex-col items-end gap-1 text-sm font-medium">
                          <CollectBadge candidate={candidate} />
                        </div>
                      </AdminMobileRecordField>
                      <AdminMobileRecordField label="Report">
                        <div className="text-foreground ml-auto inline-flex flex-col items-end gap-1 text-sm font-medium">
                          <ReportBadge candidate={candidate} />
                        </div>
                      </AdminMobileRecordField>
                      <AdminMobileRecordField label="Account">
                        <div className="flex justify-end">
                          <OnboardingBadge
                            status={candidate.onboardingStatus}
                          />
                        </div>
                      </AdminMobileRecordField>
                      <AdminMobileRecordField
                        label="Added"
                        value={formatDisplayDate(candidate.createdAt)}
                        mono
                      />
                    </AdminMobileRecordFields>
                  </AdminMobileRecordCard>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto rounded-sm border md:block">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0 z-10">
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
                      Report
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
                  {paginatedCandidates.map((candidate, idx) => {
                    const isSuspended =
                      candidate.onboardingStatus === "suspended";
                    return (
                      <TableRow
                        key={candidate.id}
                        className={`cursor-pointer transition-colors ${
                          isSuspended
                            ? "bg-destructive/5 hover:bg-destructive/10"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() =>
                          router.push(`/admin/candidates/${candidate.id}`)
                        }
                      >
                        <TableCell className="text-muted-foreground text-center font-mono text-xs tabular-nums">
                          {snOffset + idx + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="text-sm font-medium">
                              {getCandidateDisplayName(candidate)}
                            </span>
                            <span className="text-muted-foreground block text-xs">
                              {candidate.user?.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                          >
                            {candidate.party}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {candidate.position}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <span className="text-xs font-medium">
                              {resolveStateName(candidate.stateCode)}
                            </span>
                            {candidate.constituency && (
                              <span className="text-muted-foreground block text-[11px]">
                                {candidate.constituency}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <CollectBadge candidate={candidate} />
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <ReportBadge candidate={candidate} />
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <OnboardingBadge
                            status={candidate.onboardingStatus}
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden text-xs xl:table-cell">
                          {formatDisplayDate(candidate.createdAt)}
                        </TableCell>
                        <TableCell
                          className="w-12 text-right"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <CandidateActions
                            candidate={candidate}
                            onNavigate={(href) => router.push(href)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <AdminPagination
              currentPage={safeCandidatePage}
              totalPages={candidateTotalPages}
              pageSize={candidatePageSize}
              totalItems={filteredCandidates.length}
              itemLabel="candidates"
              onPageChange={setCandidatePage}
              onPageSizeChange={(size) => {
                setCandidatePageSize(size);
                setCandidatePage(1);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
