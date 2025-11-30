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
import { HiOutlineUserCircle, HiViewGrid, HiViewList } from "react-icons/hi";
import { VoterCardSkeleton } from "@/components/admin/admin-skeletons";
import { AdminListItemVoter } from "@/components/admin/admin-list-item-voter";
import { AdminGridItemVoter } from "@/components/admin/admin-grid-item-voter";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { cn } from "@/lib/utils";
import type { Voter } from "@/types/voter";

interface VotersTabProps {
  voters: Voter[];
  filteredVoters: Voter[];
  paginatedVoters: Voter[];
  totalVoters: number;
  isLoading: boolean;
  searchQuery: string;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onDelete: (voterId: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoadingActions: boolean;
}

export function VotersTab({
  voters,
  filteredVoters,
  paginatedVoters,
  totalVoters,
  isLoading,
  searchQuery,
  currentPage,
  pageSize,
  totalPages,
  onDelete,
  onPageChange,
  onPageSizeChange,
  isLoadingActions,
}: VotersTabProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  return (
    <TabsContent value="voters" className="flex-1 space-y-4 px-4 lg:px-6">
      <Card className="border-border/50 flex-1">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Registered Voters</CardTitle>
              <CardDescription>
                {filteredVoters.length === voters.length
                  ? `View and manage ${totalVoters} registered voter${totalVoters !== 1 ? "s" : ""}`
                  : `Showing ${filteredVoters.length} of ${voters.length} voters`}
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
              <VoterCardSkeleton />
              <VoterCardSkeleton />
              <VoterCardSkeleton />
            </div>
          ) : filteredVoters.length === 0 ? (
            <div className="py-12 text-center">
              <HiOutlineUserCircle className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
              <p className="text-muted-foreground mb-1 font-medium">
                {searchQuery
                  ? "No voters match your search"
                  : "No voters found"}
              </p>
              <p className="text-muted-foreground text-sm">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Voters will appear here once they register"}
              </p>
            </div>
          ) : (
            <>
              {viewMode === "list" ? (
                <div className="space-y-3">
                  {paginatedVoters.map((voter) => (
                    <AdminListItemVoter
                      key={voter.id}
                      voter={voter}
                      onDelete={onDelete}
                      isLoading={isLoadingActions}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {paginatedVoters.map((voter) => (
                    <AdminGridItemVoter
                      key={voter.id}
                      voter={voter}
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
                totalItems={filteredVoters.length}
                itemLabel="voters"
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
