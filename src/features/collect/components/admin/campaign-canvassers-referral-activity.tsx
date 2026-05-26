"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminPagination } from "@/components/shared/admin/admin-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime } from "@/lib/date-format";
import { cn, formatPersonName } from "@/lib/utils";
import type { ExportFormat } from "@/lib/exports/shared";
import {
  getOrderedExportFormats,
  writePreferredExportFormat,
} from "@/lib/exports/client-preferences";
import type { ReferralActivityItem } from "@/features/collect/types/collect.types";
import {
  exportFormatMeta,
  sourceFilterLabel,
  sourceTypeLabel,
  type SourceFilter,
} from "@/features/collect/lib/campaign-canvassers";
import {
  IconChevronDown,
  IconFileExport,
  IconSearch,
  IconTrophy,
  IconUsers,
} from "@tabler/icons-react";

export function CampaignCanvassersReferralActivity({
  referralActivity,
  sourceFilter,
  onNavigate,
  onExport,
  preferredFormat,
  setPreferredFormat,
}: {
  referralActivity: ReferralActivityItem[];
  sourceFilter: SourceFilter;
  onNavigate: (params: Record<string, string>) => void;
  onExport: (
    format: "csv" | "xlsx",
    search?: string,
    type?: "known" | "manual",
  ) => void;
  preferredFormat: ExportFormat;
  setPreferredFormat: (format: ExportFormat) => void;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const scopedActivity = useMemo(() => {
    if (sourceFilter === "all") return referralActivity;
    return referralActivity.filter((item) => item.type === sourceFilter);
  }, [referralActivity, sourceFilter]);

  const filtered = useMemo(() => {
    if (!search.trim()) return scopedActivity;
    const q = search.toLowerCase();
    return scopedActivity.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.phone ?? "").toLowerCase().includes(q),
    );
  }, [scopedActivity, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(pageStart, pageStart + pageSize);

  const entries = useMemo(
    () =>
      paginated.map((item, index) => {
        const overallIndex = pageStart + index;
        const verifiedPct =
          item.count > 0 ? Math.round((item.verified / item.count) * 100) : 0;
        const flaggedPct =
          item.count > 0 ? Math.round((item.flagged / item.count) * 100) : 0;

        return {
          item,
          index: overallIndex,
          verifiedPct,
          flaggedPct,
          rankEmoji:
            overallIndex === 0
              ? "🥇"
              : overallIndex === 1
                ? "🥈"
                : overallIndex === 2
                  ? "🥉"
                  : null,
          rowClass:
            overallIndex === 0
              ? "bg-amber-500/10 hover:bg-amber-500/15"
              : overallIndex === 1
                ? "bg-zinc-400/10 hover:bg-zinc-400/15"
                : overallIndex === 2
                  ? "bg-orange-600/10 hover:bg-orange-600/15"
                  : "hover:bg-muted/30",
        };
      }),
    [paginated, pageStart],
  );

  const orderedFormats = getOrderedExportFormats(preferredFormat);

  const handleRowClick = (item: ReferralActivityItem) => {
    if (item.type === "known" && item.canvasserId) {
      onNavigate({
        campaignCanvasserId: item.canvasserId,
        canvasserLabel: item.name,
      });
      return;
    }

    onNavigate({
      canvasserLabel: item.name,
      canvasserName: item.name,
      ...(item.phone ? { canvasserPhone: item.phone } : {}),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 px-1">
        <IconTrophy className="text-primary h-4 w-4 shrink-0" />
        <h3 className="text-sm font-semibold tracking-tight">
          Canvasser Activity
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 sm:flex-1">
          <IconSearch className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or phone..."
            className="h-8 rounded-sm pl-8 text-sm"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full justify-center rounded-sm font-mono text-[10px] tracking-widest uppercase sm:w-auto"
              disabled={referralActivity.length === 0}
            >
              <IconFileExport className="mr-1 h-3.5 w-3.5" />
              Export
              <IconChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
              Last Used: {exportFormatMeta[preferredFormat].label}
            </DropdownMenuLabel>
            {orderedFormats.map((format) => {
              const Icon = exportFormatMeta[format].icon;
              return (
                <DropdownMenuItem
                  key={format}
                  onClick={() => {
                    onExport(
                      format,
                      search.trim() || undefined,
                      sourceFilter === "all" ? undefined : sourceFilter,
                    );
                    writePreferredExportFormat(format);
                    setPreferredFormat(format);
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  Export {exportFormatMeta[format].label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {referralActivity.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Badge
              variant="secondary"
              className="rounded-sm px-1.5 py-0 font-mono text-[10px] font-bold tabular-nums"
            >
              {search.trim()
                ? `${filtered.length} / ${scopedActivity.length}`
                : scopedActivity.length}
            </Badge>
            <p className="text-muted-foreground text-xs">
              {sourceFilter === "all"
                ? "Showing all canvasser entries"
                : `Showing ${sourceFilterLabel(sourceFilter).toLowerCase()} only`}
            </p>
          </div>

          <div className="overflow-x-auto rounded-sm border">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 z-10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-muted-foreground h-10 w-14 text-center font-mono text-[10px] font-bold tracking-widest uppercase">
                    S/N
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                    Name
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase sm:table-cell">
                    Phone
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase">
                    Total
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase md:table-cell">
                    Verified %
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase md:table-cell">
                    Flagged %
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase lg:table-cell">
                    Last Active
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="max-md:[&_td]:py-3">
                {entries.map(
                  ({
                    item,
                    index,
                    verifiedPct,
                    flaggedPct,
                    rankEmoji,
                    rowClass,
                  }) => (
                    <TableRow
                      key={
                        item.type === "known"
                          ? `known-${item.canvasserId}`
                          : `manual-${item.name}-${item.phone}`
                      }
                      className={cn(
                        "cursor-pointer transition-colors",
                        rowClass,
                      )}
                      tabIndex={0}
                      role="button"
                      onClick={() => handleRowClick(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleRowClick(item);
                        }
                      }}
                    >
                      <TableCell className="text-muted-foreground w-12 text-center font-mono text-xs font-semibold tabular-nums">
                        <span>{index + 1}</span>
                        {rankEmoji ? (
                          <span
                            aria-hidden
                            className="pl-0.5 align-middle sm:pl-1"
                          >
                            {rankEmoji}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="truncate">
                            {formatPersonName(item.name)}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "shrink-0 rounded-sm px-1.5 py-0 font-mono text-[9px] font-bold tracking-widest uppercase",
                              item.type === "known"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
                            )}
                          >
                            {sourceTypeLabel(item.type)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {item.phone ?? "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold tabular-nums">
                        {item.count}
                      </TableCell>
                      <TableCell className="hidden text-right md:table-cell">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-sm px-1.5 py-0 font-mono text-[10px]",
                            verifiedPct > 80
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                              : verifiedPct > 50
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                                : "border-border text-muted-foreground",
                          )}
                        >
                          {verifiedPct}%
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-right md:table-cell">
                        {flaggedPct > 0 ? (
                          <Badge
                            variant="outline"
                            className="border-destructive/30 bg-destructive/10 text-destructive rounded-sm px-1.5 py-0 font-mono text-[10px]"
                          >
                            {flaggedPct}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            0%
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden text-xs lg:table-cell">
                        {item.lastActive
                          ? formatRelativeTime(item.lastActive, {
                              olderDateStyle: "months",
                            })
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ),
                )}

                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-muted-foreground py-8 text-center text-sm"
                    >
                      {search.trim()
                        ? `No results match "${search}"`
                        : sourceFilter === "all"
                          ? "No canvasser activity yet."
                          : `No ${sourceFilterLabel(sourceFilter).toLowerCase()} rows yet.`}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          {filtered.length > pageSize ? (
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filtered.length}
              itemLabel="canvasser entries"
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              pageSizeOptions={[10, 20, 50]}
            />
          ) : null}
        </div>
      ) : (
        <div className="border-border flex flex-col items-center gap-3 rounded-sm border border-dashed py-12 text-center">
          <IconUsers className="text-muted-foreground h-10 w-10" />
          <p className="text-muted-foreground text-sm">
            No canvasser activity yet.
          </p>
        </div>
      )}
    </div>
  );
}
