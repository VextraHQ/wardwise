"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  IconPlus,
  IconClipboardList,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useCampaigns } from "@/hooks/use-collect";
import type { CampaignSummary } from "@/types/collect";
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
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import {
  CampaignFilters,
  type CampaignSort,
  type CampaignStatusFilter,
  type CampaignReportFilter,
} from "@/components/admin/admin-filters/campaign-filters";
import { CampaignActionsMenu } from "@/components/admin/collect/campaign-actions-menu";
import {
  getCampaignBrandingLabel,
  getEffectiveCampaignName,
} from "@/lib/collect/branding";
import { formatStatusLabel } from "@/lib/admin/dashboard";
import { isStaleCampaign } from "@/lib/collect/campaign-health";
import { formatRelativeTime } from "@/lib/date-format";
import {
  AdminResourceState,
  adminResourceStateIcons,
} from "@/components/admin/shared/admin-resource-state";
import {
  AdminMobileRecordCard,
  AdminMobileRecordField,
  AdminMobileRecordFields,
  AdminMobileRecordHeader,
  AdminMobileRecordMeta,
  AdminMobileRecordSkeleton,
  AdminMobileRecordTitle,
} from "@/components/admin/shared/admin-mobile-record-card";
import { cn, formatPersonName } from "@/lib/utils";

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

function SummaryStripSkeleton() {
  return (
    <div className="border-border/60 flex flex-wrap items-center gap-x-5 gap-y-2 border-b py-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-20 rounded-sm" />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="border-border/60 hidden animate-pulse rounded-sm border border-dashed md:block">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent">
            {[
              "S/N",
              "Campaign",
              "Constituency",
              "Status",
              "Submissions",
              "Report",
              "Last Activity",
              "Actions",
            ].map((h) => (
              <TableHead
                key={h}
                className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 8 }).map((_, j) => (
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

function applySort(
  campaigns: CampaignSummary[],
  sort: CampaignSort,
): CampaignSummary[] {
  return [...campaigns].sort((a, b) => {
    switch (sort) {
      case "newest-first":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "most-submissions":
        return b._count.submissions - a._count.submissions;
      case "name-a-z":
        return getEffectiveCampaignName(a).localeCompare(
          getEffectiveCampaignName(b),
        );
      case "recent-activity":
      default: {
        const lastA = a.lastSubmissionAt ?? a.updatedAt ?? a.createdAt;
        const lastB = b.lastSubmissionAt ?? b.updatedAt ?? b.createdAt;
        return new Date(lastB).getTime() - new Date(lastA).getTime();
      }
    }
  });
}

export function CampaignList() {
  const router = useRouter();
  const { data: campaigns, isLoading, error } = useCampaigns();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatusFilter>("all");
  const [reportFilter, setReportFilter] = useState<CampaignReportFilter>("all");
  const [sort, setSort] = useState<CampaignSort>("recent-activity");

  const hasFilters =
    search !== "" ||
    statusFilter !== "all" ||
    reportFilter !== "all" ||
    sort !== "recent-activity";

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setReportFilter("all");
    setSort("recent-activity");
    setPage(1);
  }

  function handleFilterChange(filter: {
    report?: CampaignReportFilter;
    sort?: CampaignSort;
  }) {
    if (filter.report !== undefined) setReportFilter(filter.report);
    if (filter.sort !== undefined) setSort(filter.sort);
    setPage(1);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  const filtered = useMemo(() => {
    if (!campaigns) return [];

    let result = campaigns;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (c) =>
          getEffectiveCampaignName(c).toLowerCase().includes(q) ||
          c.candidateName.toLowerCase().includes(q) ||
          c.party.toLowerCase().includes(q) ||
          c.constituency.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (reportFilter !== "all") {
      result = result.filter((c) => {
        const on = Boolean(c.clientReportEnabled && c.clientReportToken);
        return reportFilter === "insights-on" ? on : !on;
      });
    }

    return applySort(result, sort);
  }, [campaigns, search, statusFilter, reportFilter, sort]);

  // Tab counts always reflect the full unfiltered dataset so they don't
  // disappear when another filter is active.
  const statusCounts = useMemo(
    () => ({
      all: campaigns?.length ?? 0,
      active: campaigns?.filter((c) => c.status === "active").length ?? 0,
      draft: campaigns?.filter((c) => c.status === "draft").length ?? 0,
      paused: campaigns?.filter((c) => c.status === "paused").length ?? 0,
      closed: campaigns?.filter((c) => c.status === "closed").length ?? 0,
    }),
    [campaigns],
  );

  // Stale + submissions reflect the filtered result so they stay in sync with
  // whatever search/report/status combination is currently active.
  const filteredStale = useMemo(
    () => filtered.filter(isStaleCampaign).length,
    [filtered],
  );
  const filteredSubmissions = useMemo(
    () => filtered.reduce((sum, c) => sum + c._count.submissions, 0),
    [filtered],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const snOffset = (safePage - 1) * pageSize;

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      {/* Page header */}
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
      </div>

      {/* Toolbar — single row on xl+, stacked below */}
      <div className="border-border/60 flex flex-col gap-2 border-b py-4 xl:flex-row xl:items-center xl:gap-3">
        <div className="min-w-0 xl:flex-1">
          <AdminSearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search by name, party, constituency, or slug…"
          />
        </div>
        <CampaignFilters
          reportFilter={reportFilter}
          sort={sort}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          hasFilters={hasFilters}
        />
      </div>

      {/* Status tabs + stale indicator + submissions count */}
      {isLoading ? (
        <SummaryStripSkeleton />
      ) : campaigns ? (
        <div className="border-border/60 flex items-center justify-between gap-3 border-b py-1">
          <div
            role="group"
            aria-label="Filter campaigns by status"
            className="flex items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {(
              [
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "draft", label: "Draft" },
                { value: "paused", label: "Paused" },
                { value: "closed", label: "Closed" },
              ] as const
            ).map(({ value, label }) => {
              const isActive = statusFilter === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setStatusFilter(value);
                    setPage(1);
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
                      isActive ? "text-primary/70" : "text-muted-foreground/60",
                    )}
                  >
                    {statusCounts[value].toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-3 pl-2">
            {filteredStale > 0 && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500">
                <IconAlertTriangle className="h-3 w-3 shrink-0" />
                <span className="font-mono text-[10px] font-bold tabular-nums">
                  {filteredStale} stale
                </span>
              </span>
            )}
            <span className="text-muted-foreground text-xs whitespace-nowrap">
              <span className="text-foreground font-mono text-sm font-semibold tabular-nums">
                {filteredSubmissions.toLocaleString()}
              </span>{" "}
              submissions
            </span>
          </div>
        </div>
      ) : null}

      {/* Records */}
      <div className="mt-5 flex flex-1 flex-col gap-4">
        {isLoading ? (
          <>
            <AdminMobileRecordSkeleton rows={4} />
            <TableSkeleton />
          </>
        ) : error ? (
          <AdminResourceState
            tone="error"
            title="Failed to load campaigns"
            description="We couldn't load the campaign list. Please refresh the page or try again."
            action={{
              label: "Refresh",
              onClick: () => window.location.reload(),
              icon: adminResourceStateIcons.alert,
              variant: "outline",
            }}
          />
        ) : campaigns && campaigns.length === 0 ? (
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
        ) : filtered.length === 0 ? (
          <AdminResourceState
            icon={IconClipboardList}
            title="No matching campaigns"
            description="No campaigns match your current search or filters. Try adjusting your criteria."
            action={{
              label: "Clear filters",
              onClick: resetFilters,
              icon: adminResourceStateIcons.alert,
              variant: "outline",
            }}
          />
        ) : (
          <>
            {/* Mobile cards — hidden on md+ */}
            <div className="space-y-3 md:hidden">
              {paginated.map((campaign) => {
                const campaignName = getEffectiveCampaignName(campaign);
                const stale = isStaleCampaign(campaign);
                const reportEnabled = Boolean(
                  campaign.clientReportEnabled && campaign.clientReportToken,
                );

                return (
                  <AdminMobileRecordCard
                    key={campaign.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`/admin/collect/campaigns/${campaign.id}`)
                    }
                  >
                    <AdminMobileRecordHeader>
                      <div className="min-w-0 flex-1">
                        <AdminMobileRecordTitle>
                          {campaignName}
                        </AdminMobileRecordTitle>
                        <AdminMobileRecordMeta mono>
                          {campaign.party} · /c/{campaign.slug}
                        </AdminMobileRecordMeta>
                        {campaign.displayName && (
                          <AdminMobileRecordMeta>
                            Anchor: {formatPersonName(campaign.candidateName)}
                          </AdminMobileRecordMeta>
                        )}
                      </div>
                      <div
                        className="shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <CampaignActionsMenu
                          campaign={campaign}
                          ariaLabel={`Open actions for ${campaignName}`}
                        />
                      </div>
                    </AdminMobileRecordHeader>

                    <AdminMobileRecordFields>
                      <AdminMobileRecordField label="Status">
                        <Badge
                          variant="outline"
                          className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase ${CAMPAIGN_STATUS_STYLES[campaign.status] ?? ""}`}
                        >
                          {formatStatusLabel(campaign.status)}
                        </Badge>
                      </AdminMobileRecordField>
                      <AdminMobileRecordField
                        label="Submissions"
                        value={campaign._count.submissions.toLocaleString()}
                        mono
                      />
                      <AdminMobileRecordField label="Insights">
                        <Badge
                          variant="outline"
                          className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase ${
                            reportEnabled
                              ? REPORT_STATUS_STYLES.enabled
                              : REPORT_STATUS_STYLES.disabled
                          }`}
                        >
                          {reportEnabled ? "On" : "Off"}
                        </Badge>
                      </AdminMobileRecordField>
                      <AdminMobileRecordField label="Last Activity">
                        <span className="flex items-center justify-end gap-1 text-xs">
                          {formatRelativeTime(campaign.lastSubmissionAt, {
                            absoluteDateOptions: {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          })}
                          {stale && (
                            <IconAlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                          )}
                        </span>
                      </AdminMobileRecordField>
                    </AdminMobileRecordFields>
                  </AdminMobileRecordCard>
                );
              })}
            </div>

            {/* Desktop table — hidden below md */}
            <div className="hidden overflow-x-auto rounded-sm border md:block">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-muted-foreground h-10 w-14 text-center font-mono text-[10px] font-bold tracking-widest uppercase">
                      S/N
                    </TableHead>
                    <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                      Campaign
                    </TableHead>
                    <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase lg:table-cell">
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
                  {paginated.map((campaign, idx) => {
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
                                  className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
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
                                Anchor:{" "}
                                {formatPersonName(campaign.candidateName)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
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
                              {formatRelativeTime(campaign.lastSubmissionAt, {
                                absoluteDateOptions: {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              })}
                            </span>
                            {isStaleCampaign(campaign) && (
                              <IconAlertTriangle
                                className="h-3.5 w-3.5 text-amber-500"
                                title="No submissions in 48h"
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell
                          className="w-12 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CampaignActionsMenu
                            campaign={campaign}
                            ariaLabel={`Open actions for ${campaignName}`}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <AdminPagination
              currentPage={safePage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filtered.length}
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
    </div>
  );
}
