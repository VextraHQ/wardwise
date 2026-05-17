"use client";

import { useId } from "react";
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
import { cn } from "@/lib/utils";

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

interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

function PaginationNav({
  currentPage,
  totalPages,
  canGoPrev,
  canGoNext,
  onPageChange,
  className,
}: PaginationNavProps) {
  return (
    <div
      className={cn("flex items-center gap-2", className)}
      role="navigation"
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        className="hidden size-8 rounded-sm lg:flex"
        size="icon"
        type="button"
        onClick={() => onPageChange(1)}
        disabled={!canGoPrev}
      >
        <IconChevronsLeft />
        <span className="sr-only">First page</span>
      </Button>
      <Button
        variant="outline"
        className="size-8 min-h-9 min-w-9 touch-manipulation rounded-sm sm:size-8"
        size="icon"
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
      >
        <IconChevronLeft />
        <span className="sr-only">Previous page</span>
      </Button>
      <Button
        variant="outline"
        className="size-8 min-h-9 min-w-9 touch-manipulation rounded-sm sm:size-8"
        size="icon"
        type="button"
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
        type="button"
        onClick={() => onPageChange(totalPages)}
        disabled={!canGoNext}
      >
        <IconChevronsRight />
        <span className="sr-only">Last page</span>
      </Button>
    </div>
  );
}

interface PageSizeSelectProps {
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
  id?: string;
}

function PageSizeSelect({
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  id,
}: PageSizeSelectProps) {
  return (
    <Select
      value={pageSize.toString()}
      onValueChange={(value) => onPageSizeChange(Number(value))}
    >
      <SelectTrigger
        id={id}
        size="sm"
        className="w-[min(5rem,28vw)] shrink-0 rounded-sm sm:w-20"
      >
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
  );
}

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
  const pageSizeId = useId();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <p className="text-foreground/60 text-left font-mono text-[10px] tracking-wider sm:min-w-0 sm:flex-1 lg:text-[11px]">
        Showing {startItem}-{endItem} of {totalItems.toLocaleString()}{" "}
        {itemLabel}
      </p>

      {/* Mobile: stacked — avoids wrap/overlap with surrounding chrome (floating UI, narrow viewports). */}
      <div className="flex w-full min-w-0 flex-col gap-3 sm:hidden">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Label
              htmlFor={`${pageSizeId}-mobile`}
              className="text-foreground/60 shrink-0 font-mono text-[10px] font-bold tracking-widest uppercase"
            >
              Per page
            </Label>
            <PageSizeSelect
              id={`${pageSizeId}-mobile`}
              pageSize={pageSize}
              pageSizeOptions={pageSizeOptions}
              onPageSizeChange={onPageSizeChange}
            />
          </div>
          <p className="text-foreground/60 shrink-0 text-right font-mono text-[10px] font-bold tracking-wider tabular-nums">
            Page {currentPage} / {totalPages}
          </p>
        </div>
        <div className="border-border/50 flex justify-center border-t pt-3">
          <PaginationNav
            currentPage={currentPage}
            totalPages={totalPages}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            onPageChange={onPageChange}
          />
        </div>
      </div>

      {/* Tablet/desktop: single compact row */}
      <div className="hidden min-w-0 flex-1 items-center justify-end gap-6 sm:flex sm:flex-nowrap lg:gap-8">
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          <Label
            htmlFor={`${pageSizeId}-desktop`}
            className="text-foreground/60 font-mono text-[10px] font-bold tracking-widest uppercase"
          >
            Per page
          </Label>
          <PageSizeSelect
            id={`${pageSizeId}-desktop`}
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
        <p className="text-foreground/60 hidden min-w-0 font-mono text-[10px] font-bold tracking-wider whitespace-nowrap sm:block md:text-[11px]">
          Page {currentPage} of {totalPages}
        </p>
        <PaginationNav
          className="shrink-0 sm:ml-auto lg:ml-0"
          currentPage={currentPage}
          totalPages={totalPages}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
