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
import { AdminListItemCanvasser } from "@/components/admin/admin-list-item-canvasser";
import { AdminGridItemCanvasser } from "@/components/admin/admin-grid-item-canvasser";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { cn } from "@/lib/utils";
import type { CanvasserWithCandidate } from "@/lib/api/admin";

interface CanvassersTabProps {
  canvassers: CanvasserWithCandidate[];
  filteredCanvassers: CanvasserWithCandidate[];
  paginatedCanvassers: CanvasserWithCandidate[];
  isLoading: boolean;
  error: Error | null;
  searchQuery: string;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onEdit: (canvasser: CanvasserWithCandidate) => void;
  onDelete: (canvasserId: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoadingActions: boolean;
}

export function CanvassersTab({
  canvassers,
  filteredCanvassers,
  paginatedCanvassers,
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
}: CanvassersTabProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  return (
    <TabsContent value="canvassers" className="flex-1 space-y-4 px-4 lg:px-6">
      <Card className="border-border/50 flex-1">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Canvassers</CardTitle>
              <CardDescription>
                {filteredCanvassers.length === canvassers.length
                  ? `Manage ${canvassers.length} canvasser${canvassers.length !== 1 ? "s" : ""}`
                  : `Showing ${filteredCanvassers.length} of ${canvassers.length} canvassers`}
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
                Failed to load canvassers
              </p>
              <p className="text-muted-foreground text-sm">
                Please try refreshing the page
              </p>
            </div>
          ) : filteredCanvassers.length === 0 ? (
            <div className="py-12 text-center">
              <HiOutlineUserGroup className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
              <p className="text-muted-foreground mb-1 font-medium">
                {searchQuery
                  ? "No canvassers match your search"
                  : "No canvassers found"}
              </p>
              <p className="text-muted-foreground text-sm">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Canvassers will appear here once they are registered"}
              </p>
            </div>
          ) : (
            <>
              {viewMode === "list" ? (
                <div className="space-y-3">
                  {paginatedCanvassers.map((canvasser) => (
                    <AdminListItemCanvasser
                      key={canvasser.id}
                      canvasser={canvasser}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isLoading={isLoadingActions}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {paginatedCanvassers.map((canvasser) => (
                    <AdminGridItemCanvasser
                      key={canvasser.id}
                      canvasser={canvasser}
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
                totalItems={filteredCanvassers.length}
                itemLabel="canvassers"
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
