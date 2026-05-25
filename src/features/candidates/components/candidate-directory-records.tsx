"use client";

import { useRouter } from "next/navigation";
import { HiOutlineUserAdd, HiOutlineUserGroup } from "react-icons/hi";
import type { CandidateWithUser } from "@/features/admin/api/admin-api";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminPagination } from "@/components/shared/admin/admin-pagination";
import {
  AdminResourceState,
  adminResourceStateIcons,
} from "@/components/shared/admin/admin-resource-state";
import { formatDisplayDate } from "@/lib/date-format";
import { cn } from "@/lib/utils";
import {
  AdminMobileRecordCard,
  AdminMobileRecordField,
  AdminMobileRecordFields,
  AdminMobileRecordHeader,
  AdminMobileRecordMeta,
  AdminMobileRecordSkeleton,
  AdminMobileRecordTitle,
} from "@/components/shared/admin/admin-mobile-record-card";
import {
  CandidateActions,
  CandidateTableSkeleton,
  CollectBadge,
  getCandidateDisplayName,
  OnboardingBadge,
  ReportBadge,
  resolveStateName,
} from "@/features/candidates/components/candidate-directory-badges";

type CandidateDirectoryRecordsProps = {
  isLoading: boolean;
  error: Error | null;
  hasSearchQuery: boolean;
  hasActiveCandidateFilters: boolean;
  filteredCandidates: CandidateWithUser[];
  paginatedCandidates: CandidateWithUser[];
  filteredCount: number;
  snOffset: number;
  safeCandidatePage: number;
  candidateTotalPages: number;
  candidatePageSize: number;
  onResetFilters: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export function CandidateDirectoryRecords({
  isLoading,
  error,
  hasSearchQuery,
  hasActiveCandidateFilters,
  filteredCandidates,
  paginatedCandidates,
  filteredCount,
  snOffset,
  safeCandidatePage,
  candidateTotalPages,
  candidatePageSize,
  onResetFilters,
  onPageChange,
  onPageSizeChange,
}: CandidateDirectoryRecordsProps) {
  const router = useRouter();

  return (
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
                  onClick: onResetFilters,
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
                    "cursor-pointer",
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
                    <AdminMobileRecordField label="Insights">
                      <div className="text-foreground ml-auto inline-flex flex-col items-end gap-1 text-sm font-medium">
                        <ReportBadge candidate={candidate} />
                      </div>
                    </AdminMobileRecordField>
                    <AdminMobileRecordField label="Account">
                      <div className="flex justify-end">
                        <OnboardingBadge status={candidate.onboardingStatus} />
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
                        <OnboardingBadge status={candidate.onboardingStatus} />
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
            totalItems={filteredCount}
            itemLabel="candidates"
            onPageChange={onPageChange}
            onPageSizeChange={(size) => {
              onPageSizeChange(size);
              onPageChange(1);
            }}
          />
        </>
      )}
    </div>
  );
}
