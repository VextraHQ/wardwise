"use client";

import { IconDotsVertical, IconTrash } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileBulkActionTray } from "@/components/ui/mobile-selection-actions";
import type { SubmissionBulkActionViewModel } from "@/types/campaign-submissions";

type CampaignSubmissionsBulkToolbarProps = {
  summary: string;
  canSelectAllMatching: boolean;
  total: number;
  onSelectAllMatching: () => void;
  actions: SubmissionBulkActionViewModel[];
  showDeleteAction: boolean;
  onDeleteSelected: () => void;
  isPending: boolean;
  onClear: () => void;
};

export function CampaignSubmissionsBulkToolbar({
  summary,
  canSelectAllMatching,
  total,
  onSelectAllMatching,
  actions,
  showDeleteAction,
  onDeleteSelected,
  isPending,
  onClear,
}: CampaignSubmissionsBulkToolbarProps) {
  return (
    <div className="bg-primary/5 border-primary/20 hidden flex-wrap items-center gap-2 rounded-sm border px-3 py-2 md:flex">
      <span className="text-primary w-full text-xs font-bold sm:w-auto">
        {summary}
      </span>
      {canSelectAllMatching && (
        <button
          type="button"
          className="text-primary hover:text-primary/80 text-xs font-semibold underline"
          onClick={onSelectAllMatching}
        >
          Select all {total.toLocaleString()} matching records
        </button>
      )}
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.key}
            size="sm"
            variant="outline"
            className="h-8 flex-1 rounded-sm px-2 text-[10px] font-bold tracking-wider uppercase sm:h-7 sm:flex-none"
            onClick={action.onClick}
            disabled={isPending}
          >
            <Icon className="mr-1 h-3 w-3" />
            {action.label}
          </Button>
        );
      })}
      {showDeleteAction && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 flex-1 rounded-sm border-red-500/20 px-2 text-[10px] font-bold tracking-wider text-red-600 uppercase hover:bg-red-600 hover:text-white sm:h-7 sm:flex-none"
          onClick={onDeleteSelected}
          disabled={isPending}
        >
          <IconTrash className="mr-1 h-3 w-3" />
          Delete Selected
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-full px-2 text-[10px] font-bold tracking-wider uppercase sm:ml-auto sm:h-7 sm:w-auto"
        onClick={onClear}
      >
        Clear
      </Button>
    </div>
  );
}

type CampaignSubmissionsSelectionTrayProps = {
  summary: string;
  canSelectAllMatching: boolean;
  total: number;
  onSelectAllMatching: () => void;
  actions: SubmissionBulkActionViewModel[];
  allMatchingSelected: boolean;
  allOnPageSelected: boolean;
  onToggleSelectAll: () => void;
  onDeleteSelected: () => void;
  isPending: boolean;
  onClear: () => void;
};

export function CampaignSubmissionsSelectionTray({
  summary,
  canSelectAllMatching,
  total,
  onSelectAllMatching,
  actions,
  allMatchingSelected,
  allOnPageSelected,
  onToggleSelectAll,
  onDeleteSelected,
  isPending,
  onClear,
}: CampaignSubmissionsSelectionTrayProps) {
  return (
    <MobileBulkActionTray
      summary={summary}
      supportingText={
        canSelectAllMatching ? (
          <button
            type="button"
            className="hover:text-primary/80 underline"
            onClick={onSelectAllMatching}
          >
            Select all {total.toLocaleString()} matching records
          </button>
        ) : undefined
      }
      summaryAction={
        <Button
          size="sm"
          variant="ghost"
          className="h-8 rounded-sm px-2 font-mono text-[10px] font-bold tracking-widest uppercase"
          onClick={onClear}
        >
          Clear
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.key}
              size="sm"
              variant="outline"
              className="h-9 rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase"
              onClick={action.onClick}
              disabled={isPending}
            >
              <Icon className="mr-1.5 h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{action.mobileLabel}</span>
            </Button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {!allMatchingSelected ? (
          <Button
            size="sm"
            variant="outline"
            className="h-9 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
            onClick={onToggleSelectAll}
            disabled={isPending}
          >
            {allOnPageSelected ? "Clear Page" : "Select Page"}
          </Button>
        ) : (
          <div />
        )}
        {!allMatchingSelected ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
                disabled={isPending}
              >
                <IconDotsVertical className="h-3.5 w-3.5" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={onDeleteSelected}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
                disabled={isPending}
              >
                <IconDotsVertical className="h-3.5 w-3.5" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onToggleSelectAll}>
                Clear Page Selection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </MobileBulkActionTray>
  );
}
