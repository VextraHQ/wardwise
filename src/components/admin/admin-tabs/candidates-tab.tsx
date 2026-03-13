"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  HiOutlineUserGroup,
  HiOutlineXCircle,
  HiViewGrid,
  HiViewList,
} from "react-icons/hi";
import { CandidateCardSkeleton } from "@/components/admin/admin-skeletons";
import { AdminListItemCandidate } from "@/components/admin/admin-list-item-candidate";
import { AdminGridItemCandidate } from "@/components/admin/admin-grid-item-candidate";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { cn } from "@/lib/utils";
import type { CandidateWithUser } from "@/lib/api/admin";

interface CandidatesTabProps {
  candidates: CandidateWithUser[];
  filteredCandidates: CandidateWithUser[];
  paginatedCandidates: CandidateWithUser[];
  isLoading: boolean;
  error: Error | null;
  searchQuery: string;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onEdit: (candidate: CandidateWithUser) => void;
  onDelete: (candidateId: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoadingActions: boolean;
}

export function CandidatesTab({
  candidates,
  filteredCandidates,
  paginatedCandidates,
  isLoading,
  error,
  searchQuery,
  currentPage,
  pageSize,
  totalPages,
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange,
  isLoadingActions,
}: CandidatesTabProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  return (
    <TabsContent value="candidates" className="flex-1 space-y-4">
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
            {/* View Toggle - Hidden on mobile */}
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
              <HiOutlineXCircle className="text-destructive mx-auto mb-3 h-12 w-12" />
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
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isLoading={isLoadingActions}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {paginatedCandidates.map((candidate) => (
                    <AdminGridItemCandidate
                      key={candidate.id}
                      candidate={candidate}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isLoading={isLoadingActions}
                    />
                  ))}
                </div>
              )}

              <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredCandidates.length}
                itemLabel="candidates"
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
