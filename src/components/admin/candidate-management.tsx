"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  HiExclamationCircle,
  HiOutlineUserAdd,
  HiOutlineUserGroup,
  HiViewGrid,
  HiViewList,
} from "react-icons/hi";
import { adminApi, type CandidateWithUser } from "@/lib/api/admin";
import type { Candidate } from "@/types/candidate";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { CandidateFilters } from "@/components/admin/admin-filters/candidate-filters";
import { AdminListItemCandidate } from "@/components/admin/admin-list-item-candidate";
import { AdminGridItemCandidate } from "@/components/admin/admin-grid-item-candidate";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { CandidateCardSkeleton } from "@/components/admin/admin-skeletons";
import { CreateCandidateDialog } from "@/components/admin/admin-dialogs/create-candidate-dialog";
import { EditCandidateDialog } from "@/components/admin/admin-dialogs/edit-candidate-dialog";
import { DeleteCandidateDialog } from "@/components/admin/admin-dialogs/delete-candidate-dialog";

export function CandidateManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [partyFilter, setPartyFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [candidateSort, setCandidateSort] = useState<
    "name" | "supporters" | "date"
  >("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
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
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full gap-2 lg:w-auto"
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
            setCandidateSort("name");
            setCandidatePage(1);
          }}
          hasFilters={activeFilters}
        />
      </div>

      <Card className="border-border/50 flex-1">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Candidate Accounts</CardTitle>
              <CardDescription>
                {filteredCandidates.length === candidates.length
                  ? `Manage ${candidates.length} candidate account${candidates.length !== 1 ? "s" : ""}`
                  : `Showing ${filteredCandidates.length} of ${candidates.length} candidates`}
              </CardDescription>
            </div>
            <div className="border-border/60 bg-muted/30 hidden items-center rounded-lg border p-0.5 sm:flex">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="List view"
              >
                <HiViewList className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="Grid view"
              >
                <HiViewGrid className="h-4 w-4" />
              </button>
            </div>
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
            <div className="py-12 text-center">
              <HiOutlineUserGroup className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
              <p className="text-muted-foreground mb-1 font-medium">
                {searchQuery
                  ? "No candidates match your search"
                  : "No candidates found"}
              </p>
              <p className="text-muted-foreground text-sm">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Create your first candidate using the button above"}
              </p>
            </div>
          ) : (
            <>
              {viewMode === "list" ? (
                <div className="space-y-3">
                  {paginatedCandidates.map((candidate) => (
                    <AdminListItemCandidate
                      key={candidate.id}
                      candidate={candidate}
                      onEdit={setEditingCandidate}
                      onDelete={setDeletingCandidateId}
                      isLoading={loadingActions}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {paginatedCandidates.map((candidate) => (
                    <AdminGridItemCandidate
                      key={candidate.id}
                      candidate={candidate}
                      onEdit={setEditingCandidate}
                      onDelete={setDeletingCandidateId}
                      isLoading={loadingActions}
                    />
                  ))}
                </div>
              )}

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
        </CardContent>
      </Card>

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
