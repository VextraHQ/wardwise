"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  HiExclamationCircle,
  HiOutlineUserAdd,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { adminApi } from "@/lib/api/admin";
import type { Candidate } from "@/types/candidate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { CandidateCardSkeleton } from "@/components/admin/admin-skeletons";

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

function OnboardingBadge({ status }: { status: string }) {
  const label = status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <Badge
      variant="outline"
      className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase ${ONBOARDING_STATUS_STYLES[status] ?? ""}`}
    >
      {label}
    </Badge>
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

  const {
    data: candidates = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin", "candidates"],
    queryFn: () => adminApi.candidates.getAll(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

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

      <Card className="border-border/60 flex-1 rounded-sm shadow-none">
        <CardHeader>
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight">
              Candidate Accounts
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1 text-sm">
              {filteredCandidates.length === candidates.length
                ? `Manage ${candidates.length} candidate account${candidates.length !== 1 ? "s" : ""}`
                : `Showing ${filteredCandidates.length} of ${candidates.length} candidates`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-0">
          {isLoading ? (
            <div className="space-y-4">
              <CandidateCardSkeleton />
              <CandidateCardSkeleton />
              <CandidateCardSkeleton />
            </div>
          ) : error ? (
            <div className="py-12 text-center">
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
                        Status
                      </TableHead>
                      <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase xl:table-cell">
                        Added
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
                                {candidate.name}
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
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="pt-4">
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
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
