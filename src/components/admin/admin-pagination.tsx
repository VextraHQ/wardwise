"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between">
      {/* Item count */}
      <div className="text-foreground/60 hidden flex-1 font-mono text-[11px] tracking-wider lg:flex">
        Showing {startItem}-{endItem} of {totalItems.toLocaleString()}{" "}
        {itemLabel}
      </div>

      {/* Controls */}
      <div className="flex w-full items-center gap-8 lg:w-fit">
        {/* Rows per page */}
        <div className="hidden items-center gap-2 lg:flex">
          <Label className="text-foreground/60 font-mono text-[10px] font-bold tracking-widest uppercase">
            Rows per page
          </Label>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger size="sm" className="w-20 rounded-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page indicator */}
        <div className="text-foreground/60 flex w-fit items-center justify-center font-mono text-[11px] font-bold tracking-wider">
          Page {currentPage} of {totalPages}
        </div>

        {/* Navigation buttons */}
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button
            variant="outline"
            className="hidden size-8 rounded-sm lg:flex"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={!canGoPrev}
          >
            <IconChevronsLeft />
            <span className="sr-only">First page</span>
          </Button>
          <Button
            variant="outline"
            className="size-8 rounded-sm"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrev}
          >
            <IconChevronLeft />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            variant="outline"
            className="size-8 rounded-sm"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
          >
            <IconChevronRight />
            <span className="sr-only">Next page</span>
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 rounded-sm lg:flex"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={!canGoNext}
          >
            <IconChevronsRight />
            <span className="sr-only">Last page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
