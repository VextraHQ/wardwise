"use client";

import {
  IconChevronDown,
  IconFileExport,
  IconFileTypeCsv,
  IconFileTypeXls,
  IconSearch,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EXPORT_FORMAT_LABELS,
  REVIEW_STATUSES,
} from "@/lib/collect/campaign-submissions";
import { getOrderedExportFormats } from "@/lib/exports/client-preferences";
import type { ExportFormat } from "@/lib/exports/shared";
import { cn } from "@/lib/utils";
import type { ReviewStatus } from "@/types/campaign-submissions";

const exportFormatIcons = {
  csv: IconFileTypeCsv,
  xlsx: IconFileTypeXls,
} as const;

type CampaignSubmissionsToolbarProps = {
  reviewStatus: ReviewStatus;
  reviewCounts: Record<ReviewStatus, number>;
  onReviewStatusChange: (status: ReviewStatus) => void;
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  canvasserFilter: string | null;
  onClearCanvasserFilter: () => void;
  total: number;
  preferredFormat: ExportFormat;
  onExport: (args: { format: ExportFormat; redacted?: boolean }) => void;
};

export function CampaignSubmissionsToolbar({
  reviewStatus,
  reviewCounts,
  onReviewStatusChange,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  canvasserFilter,
  onClearCanvasserFilter,
  total,
  preferredFormat,
  onExport,
}: CampaignSubmissionsToolbarProps) {
  const orderedFormats = getOrderedExportFormats(preferredFormat);

  return (
    <>
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[auto_minmax(18rem,1fr)_auto] lg:items-center lg:gap-3">
        <div
          role="group"
          aria-label="Filter by review status"
          className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {REVIEW_STATUSES.map((status) => {
            const isActive = reviewStatus === status.value;
            return (
              <button
                key={status.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => onReviewStatusChange(status.value)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-sm px-2.5 py-1.5 font-mono text-[10px] font-bold tracking-widest whitespace-nowrap uppercase transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span>{status.label}</span>
                <span
                  className={cn(
                    "tabular-nums",
                    isActive ? "text-primary/70" : "text-muted-foreground/60",
                  )}
                >
                  {reviewCounts[status.value].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative min-w-0 lg:min-w-72 xl:min-w-88">
          <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name, phone, email, or reference..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="rounded-sm pl-9 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(10rem,12rem)_minmax(9rem,1fr)] lg:flex lg:w-auto lg:items-center">
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="w-full rounded-sm lg:w-40">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="volunteer">Volunteer</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="canvasser">Canvasser</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={total === 0}
                title={total === 0 ? "No submissions to export" : undefined}
                className="h-9 w-full justify-center rounded-sm px-4 font-mono text-[10px] font-bold tracking-widest uppercase shadow-sm lg:w-auto"
              >
                <IconFileExport className="mr-2 h-4 w-4" />
                Export
                <IconChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
                Last Used: {EXPORT_FORMAT_LABELS[preferredFormat]}
              </DropdownMenuLabel>
              {orderedFormats.map((format) => {
                const Icon = exportFormatIcons[format];
                return (
                  <DropdownMenuItem
                    key={format}
                    onClick={() => onExport({ format })}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    Export {EXPORT_FORMAT_LABELS[format]}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              {orderedFormats.map((format) => {
                const Icon = exportFormatIcons[format];
                return (
                  <DropdownMenuItem
                    key={`redacted-${format}`}
                    onClick={() => onExport({ format, redacted: true })}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    Export Redacted {EXPORT_FORMAT_LABELS[format]}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {canvasserFilter && (
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-sm px-2 py-1 text-xs wrap-break-word"
          >
            Referred by: {canvasserFilter}
            <button
              type="button"
              className="hover:text-foreground ml-1.5"
              onClick={onClearCanvasserFilter}
            >
              &times;
            </button>
          </Badge>
        </div>
      )}
    </>
  );
}
