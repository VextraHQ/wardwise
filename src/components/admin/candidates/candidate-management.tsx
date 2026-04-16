"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminCandidates } from "@/hooks/use-admin";
import {
  HiExclamationCircle,
  HiOutlineUserAdd,
  HiOutlineUserGroup,
} from "react-icons/hi";
import {
  IconClipboardList,
  IconDotsVertical,
  IconExternalLink,
} from "@tabler/icons-react";

import type { Candidate } from "@/types/candidate";
import type { CandidateWithUser } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { CandidateFilters } from "@/components/admin/admin-filters/candidate-filters";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { CampaignActionMenuItems } from "@/components/admin/collect/campaign-actions-menu";

import { nigeriaStates } from "@/lib/data/state-lga-locations";

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

function formatStatusLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
          {new Date(campaign.clientReportLastViewedAt).toLocaleDateString(
            "en-NG",
            { day: "numeric", month: "short" },
          )}
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
            aria-label={`Open actions for ${candidate.name}`}
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
    <div className="border-border/60 overflow-x-auto rounded-sm border border-dashed">
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

export function CandidateManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [partyFilter, setPartyFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [candidateSort, setCandidateSort] = useState<"name" | "date">("date");
  const [candidatePage, setCandidatePage] = useState(1);
  const [candidatePageSize, setCandidatePageSize] = useState(10);

  const { data: candidates = [], isLoading, error } = useAdminCandidates();

  const activeCandidateCount = useMemo(
    () =>
      candidates.filter((candidate) => candidate.onboardingStatus === "active")
        .length,
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
      if (candidateSort === "name") return left.name.localeCompare(right.name);
      return (
        new Date(right.user.createdAt).getTime() -
        new Date(left.user.createdAt).getTime()
      );
    });

    return filtered;
  }, [candidates, searchQuery, partyFilter, positionFilter, candidateSort]);

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
    searchQuery.length > 0 ||
    partyFilter !== "all" ||
    positionFilter !== "all" ||
    candidateSort !== "date";

  // S/N offset for current page
  const snOffset = (safeCandidatePage - 1) * candidatePageSize;
  const candidateCountLabel =
    filteredCandidates.length === candidates.length
      ? `${candidates.length.toLocaleString()} total`
      : `${filteredCandidates.length.toLocaleString()} shown`;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {error && (
        <Alert
          variant="destructive"
          className="border-destructive/30 bg-destructive/10 rounded-sm shadow-none"
        >
          <HiExclamationCircle className="h-4 w-4" />
          <AlertTitle className="font-mono text-[11px] font-bold tracking-widest uppercase">
            Failed to load candidate accounts
          </AlertTitle>
          <AlertDescription className="text-destructive/80 text-xs">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred while loading candidates."}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <AdminSearchBar
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
                setCandidatePage(1);
              }}
              onClear={() => setCandidatePage(1)}
              placeholder="Search candidates by name, email, party, position, or constituency"
            />
          </div>

          <Button
            onClick={() => router.push("/admin/candidates/new")}
            className="w-full gap-2 rounded-sm font-mono text-[11px] tracking-widest uppercase lg:w-auto"
          >
            <HiOutlineUserAdd className="h-4 w-4" />
            <span>Create Candidate</span>
          </Button>
        </div>

        <CandidateFilters
          partyFilter={partyFilter}
          positionFilter={positionFilter}
          sort={candidateSort}
          uniqueParties={uniqueParties}
          uniquePositions={uniquePositions}
          onFilterChange={({ party, position, sort }) => {
            if (party !== undefined) setPartyFilter(party);
            if (position !== undefined) setPositionFilter(position);
            if (sort !== undefined) setCandidateSort(sort);
            setCandidatePage(1);
          }}
          onReset={() => {
            setSearchQuery("");
            setPartyFilter("all");
            setPositionFilter("all");
            setCandidateSort("date");
            setCandidatePage(1);
          }}
          hasFilters={activeFilters}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="border-border/60 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-primary mb-1 font-mono text-[10px] font-bold tracking-widest uppercase">
              Directory
            </p>
            <h2 className="text-foreground text-lg font-semibold tracking-tight">
              Candidate Accounts
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Profiles, constituency scope, account status, and Collect
              shortcuts.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Badge
              variant="outline"
              className="bg-background rounded-sm px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest uppercase"
            >
              {candidateCountLabel}
            </Badge>
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary rounded-sm px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest uppercase"
            >
              {activeCandidateCount.toLocaleString()} active
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <CandidateTableSkeleton />
        ) : error ? (
          <div className="rounded-sm border p-6 text-center">
            <HiExclamationCircle className="text-destructive mx-auto mb-3 h-12 w-12" />
            <p className="text-muted-foreground mb-1 font-medium">
              Failed to load candidates
            </p>
            <p className="text-muted-foreground text-sm">
              Please try refreshing the page
            </p>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="border-border flex flex-col items-center gap-3 rounded-sm border border-dashed py-12 text-center">
            <HiOutlineUserGroup className="text-muted-foreground h-10 w-10" />
            <div>
              <p className="text-foreground mb-1 font-medium">
                {searchQuery
                  ? "No candidates match your search"
                  : "No candidates found"}
              </p>
              <p className="text-muted-foreground text-sm">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Create your first candidate to get started"}
              </p>
            </div>
            {!searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/candidates/new")}
                className="mt-2 rounded-sm font-mono text-[11px] tracking-widest uppercase"
              >
                <HiOutlineUserAdd className="mr-1.5 h-3.5 w-3.5" />
                Create Candidate
              </Button>
            )}
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
                              {candidate.title
                                ? `${candidate.title} ${candidate.name}`
                                : candidate.name}
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
                          {new Date(candidate.createdAt).toLocaleDateString(
                            "en-NG",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
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
