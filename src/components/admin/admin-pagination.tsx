"use client";

import { useMemo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

export function AdminPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  itemLabel,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: AdminPaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to display - fewer on mobile
  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    // Show fewer pages on mobile to prevent overflow
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 2) {
        // Near the start - show 2-3, ellipsis, last
        for (let i = 2; i <= Math.min(3, totalPages - 1); i++) {
          pages.push(i);
        }
        if (totalPages > 4) {
          pages.push("ellipsis");
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 1) {
        // Near the end - show first, ellipsis, last 2-3
        if (totalPages > 4) {
          pages.push("ellipsis");
        }
        for (let i = Math.max(2, totalPages - 2); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle - show first, ellipsis, current-1, current, current+1, ellipsis, last
        pages.push("ellipsis");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  // Don't render if only one page
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="bg-muted/30 -mx-4 mt-6 -mb-4 flex flex-col gap-4 border-t px-4 py-4 sm:-mx-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      {/* Item count and page size selector - Left side */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">
            Showing <span className="text-foreground">{startItem}</span> -{" "}
            <span className="text-foreground">{endItem}</span> of{" "}
            <span className="text-foreground">
              {totalItems.toLocaleString()}
            </span>{" "}
            {itemLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="border-border/50 h-9 w-[75px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pagination controls - Right side */}
      <div className="flex w-full items-center justify-center overflow-x-auto pb-1 lg:w-auto lg:justify-end lg:overflow-visible lg:pb-0">
        <Pagination className="w-full sm:w-auto">
          <PaginationContent className="flex-nowrap justify-center gap-0.5 sm:gap-1">
            <PaginationItem className="shrink-0">
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-border/50 text-xs sm:text-sm"
              />
            </PaginationItem>

            {pageNumbers.map((page, index) => {
              if (page === "ellipsis") {
                return (
                  <PaginationItem
                    key={`ellipsis-${index}`}
                    className="shrink-0"
                  >
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={page} className="shrink-0">
                  <PaginationLink
                    onClick={() => onPageChange(page)}
                    isActive={currentPage === page}
                    className="border-border/50 min-w-8 text-xs sm:min-w-9 sm:text-sm"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem className="shrink-0">
              <PaginationNext
                onClick={() =>
                  onPageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="border-border/50 text-xs sm:text-sm"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
