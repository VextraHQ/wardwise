"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  HiExclamationCircle,
  HiOutlineBriefcase,
  HiOutlineUserAdd,
  HiOutlineUserGroup,
  HiOutlineUsers,
} from "react-icons/hi";
import { adminApi, type CandidateWithUser } from "@/lib/api/admin";
import type { Candidate } from "@/types/candidate";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { CandidateFilters } from "@/components/admin/admin-filters/candidate-filters";
import { CandidatesTab } from "@/components/admin/admin-tabs/candidates-tab";
import { CreateCandidateDialog } from "@/components/admin/admin-dialogs/create-candidate-dialog";
import { EditCandidateDialog } from "@/components/admin/admin-dialogs/edit-candidate-dialog";
import { DeleteCandidateDialog } from "@/components/admin/admin-dialogs/delete-candidate-dialog";
import { StatCardSkeleton } from "@/components/admin/admin-skeletons";

export function AdminDashboard() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [partyFilter, setPartyFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [candidateSort, setCandidateSort] = useState<
    "name" | "supporters" | "date"
  >("name");
  const [candidatePage, setCandidatePage] = useState(1);
  const [candidatePageSize, setCandidatePageSize] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] =
    useState<CandidateWithUser | null>(null);
  const [deletingCandidateId, setDeletingCandidateId] = useState<string | null>(
    null,
  );

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

  const createCandidateMutation = useMutation({
    mutationFn: adminApi.candidates.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
      setIsCreateDialogOpen(false);
      toast.success("Candidate account created");
    },
    onError: (mutationError) => {
      toast.error(
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to create candidate",
      );
    },
  });

  const updateCandidateMutation = useMutation({
    mutationFn: adminApi.candidates.update,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
      setEditingCandidate(null);
      toast.success("Candidate account updated");
    },
    onError: (mutationError) => {
      toast.error(
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to update candidate",
      );
    },
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: adminApi.candidates.delete,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
      setDeletingCandidateId(null);
      toast.success("Candidate account deleted");
    },
    onError: (mutationError) => {
      toast.error(
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to delete candidate",
      );
    },
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
          candidates
            .map((candidate) => candidate.position)
            .filter(Boolean),
        ),
      ).sort() as Candidate["position"][],
    [candidates],
  );

  const filteredCandidates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = candidates.filter((candidate) => {
      if (partyFilter !== "all" && candidate.party !== partyFilter) {
        return false;
      }

      if (positionFilter !== "all" && candidate.position !== positionFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

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
      if (candidateSort === "name") {
        return left.name.localeCompare(right.name);
      }

      if (candidateSort === "supporters") {
        return right.supporters - left.supporters;
      }

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

  const totalSupporters = useMemo(
    () =>
      candidates.reduce(
        (runningTotal, candidate) => runningTotal + candidate.supporters,
        0,
      ),
    [candidates],
  );

  const nationalCandidates = useMemo(
    () => candidates.filter((candidate) => candidate.isNational).length,
    [candidates],
  );

  const activeFilters =
    searchQuery.length > 0 ||
    partyFilter !== "all" ||
    positionFilter !== "all" ||
    candidateSort !== "name";

  const deletingCandidateName =
    candidates.find((candidate) => candidate.id === deletingCandidateId)?.name ||
    undefined;

  const loadingActions =
    updateCandidateMutation.isPending || deleteCandidateMutation.isPending;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase">
            Super Admin Workspace
          </p>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Candidate Management
            </h2>
            <p className="text-muted-foreground max-w-2xl text-sm">
              Manage candidate accounts, review platform readiness, and prepare
              the admin base for the upcoming Collect rollout.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full gap-2 lg:w-auto"
        >
          <HiOutlineUserAdd className="h-4 w-4" />
          <span>Create Candidate</span>
        </Button>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="border-destructive/50 bg-destructive/10"
        >
          <HiExclamationCircle className="h-4 w-4" />
          <AlertTitle>Failed to load candidate accounts</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred while loading candidates."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Total Candidates
                </CardTitle>
                <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
                  <HiOutlineUserGroup className="text-primary h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-semibold">{candidates.length}</div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Candidate accounts available in the platform
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Total Supporters
                </CardTitle>
                <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
                  <HiOutlineUsers className="text-primary h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-semibold">
                  {totalSupporters.toLocaleString()}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Supporters currently attributed across candidates
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Coverage Snapshot
                </CardTitle>
                <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
                  <HiOutlineBriefcase className="text-primary h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-semibold">
                  {uniqueParties.length} parties
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {nationalCandidates} national candidate
                  {nationalCandidates === 1 ? "" : "s"} and{" "}
                  {candidates.length - nationalCandidates} constituency-linked
                  accounts
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <AdminSearchBar
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value);
            setCandidatePage(1);
          }}
          onClear={() => setCandidatePage(1)}
          placeholder="Search candidates by name, email, party, position, or constituency"
        />

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
            setCandidateSort("name");
            setCandidatePage(1);
          }}
          hasFilters={activeFilters}
        />
      </div>

      <Tabs value="candidates" className="flex flex-1 flex-col">
        <CandidatesTab
          candidates={candidates}
          filteredCandidates={filteredCandidates}
          paginatedCandidates={paginatedCandidates}
          isLoading={isLoading}
          error={error instanceof Error ? error : null}
          searchQuery={searchQuery}
          currentPage={safeCandidatePage}
          pageSize={candidatePageSize}
          totalPages={candidateTotalPages}
          onEdit={setEditingCandidate}
          onDelete={setDeletingCandidateId}
          onPageChange={setCandidatePage}
          onPageSizeChange={(size) => {
            setCandidatePageSize(size);
            setCandidatePage(1);
          }}
          isLoadingActions={loadingActions}
        />
      </Tabs>

      <CreateCandidateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(data) => createCandidateMutation.mutate(data)}
        isLoading={createCandidateMutation.isPending}
      />

      <EditCandidateDialog
        candidate={editingCandidate}
        open={editingCandidate !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCandidate(null);
          }
        }}
        onSubmit={(data) => updateCandidateMutation.mutate(data)}
        isLoading={updateCandidateMutation.isPending}
      />

      <DeleteCandidateDialog
        candidateId={deletingCandidateId}
        candidateName={deletingCandidateName}
        open={deletingCandidateId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingCandidateId(null);
          }
        }}
        onConfirm={(candidateId) => deleteCandidateMutation.mutate(candidateId)}
        isLoading={deleteCandidateMutation.isPending}
      />
    </div>
  );
}
