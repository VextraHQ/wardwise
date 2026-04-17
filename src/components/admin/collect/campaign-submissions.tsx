"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useCampaignSubmissions,
  useUpdateSubmission,
  useDeleteSubmission,
  useBulkSubmissionAction,
  useSubmissionAudit,
} from "@/hooks/use-collect";
import { adminCollectApi } from "@/lib/api/collect";
import { roleLabels } from "@/lib/collect/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { toast } from "sonner";
import { track } from "@/lib/analytics/client";
import {
  IconChevronDown,
  IconCopy,
  IconFileExport,
  IconFlag,
  IconFlagOff,
  IconFileTypeCsv,
  IconFileTypeXls,
  IconSearch,
  IconShieldCheck,
  IconShieldX,
  IconTrash,
} from "@tabler/icons-react";
import type { CollectSubmission } from "@/types/collect";
import { formatGeoDisplayName } from "@/lib/geo/display";
import { generateRefCode } from "@/lib/utils";
import type { ExportFormat } from "@/lib/exports/shared";
import {
  getOrderedExportFormats,
  readPreferredExportFormat,
  writePreferredExportFormat,
} from "@/lib/exports/client-preferences";

// Extended type to include nested polling unit from API
type SubmissionWithPU = CollectSubmission & {
  pollingUnit?: { id: number; code: string; name: string } | null;
};

const exportFormatMeta = {
  csv: { label: "CSV", icon: IconFileTypeCsv },
  xlsx: { label: "Excel", icon: IconFileTypeXls },
} satisfies Record<
  ExportFormat,
  { label: string; icon: React.ComponentType<{ className?: string }> }
>;

type ReviewStatus = "pending" | "verified" | "flagged" | "all";

const REVIEW_STATUSES = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "flagged", label: "Flagged" },
] as const satisfies ReadonlyArray<{
  value: ReviewStatus;
  label: string;
}>;

function getReviewStatusFilters(status: ReviewStatus) {
  switch (status) {
    case "pending":
      return { isVerified: false, isFlagged: false };
    case "verified":
      return { isVerified: true, isFlagged: false };
    case "flagged":
      return { isFlagged: true };
    default:
      return {};
  }
}

function getReviewStatusLabel(status: ReviewStatus) {
  return REVIEW_STATUSES.find((item) => item.value === status)?.label ?? "All";
}

function formatPU(sub: SubmissionWithPU) {
  const code = sub.pollingUnit?.code;
  const displayName = formatGeoDisplayName(sub.pollingUnitName);
  if (code) return `${code.padStart(3, "0")} - ${displayName}`;
  return displayName;
}

function getSubmissionRefCode(submission: SubmissionWithPU) {
  return submission.refCode || generateRefCode(submission.id);
}

function buildExportToastMessage(args: {
  format: ExportFormat;
  redacted?: boolean;
  hasSearch: boolean;
  hasRoleFilter: boolean;
  hasCanvasserFilter: boolean;
  hasStatusFilter: boolean;
}) {
  const label = `${args.redacted ? "Redacted " : ""}${exportFormatMeta[args.format].label}`;
  const activeFilters = [
    args.hasSearch ? "search" : null,
    args.hasStatusFilter ? "review status" : null,
    args.hasRoleFilter ? "role" : null,
    args.hasCanvasserFilter ? "canvasser" : null,
  ].filter(Boolean);

  if (activeFilters.length === 0) return `${label} exported`;
  if (activeFilters.length === 1) {
    return `${label} exported with ${activeFilters[0]} filter`;
  }

  return `${label} exported with active filters`;
}

export function CampaignSubmissions({ campaignId }: { campaignId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>("all");
  const [roleFilter, setRoleFilter] = useState<string>(
    () => searchParams.get("role") || "all",
  );
  const [canvasserFilter, setCanvasserFilter] = useState<string | null>(() =>
    searchParams.get("canvasserName"),
  );
  const [canvasserPhoneFilter, setCanvasserPhoneFilter] = useState<
    string | null
  >(() => searchParams.get("canvasserPhone"));
  const [selected, setSelected] = useState<SubmissionWithPU | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
    confirmLabel?: string;
    destructive?: boolean;
  } | null>(null);
  const [preferredFormat, setPreferredFormat] = useState<ExportFormat>(() =>
    readPreferredExportFormat(),
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [allMatchingSelected, setAllMatchingSelected] = useState(false);

  // Clear one-shot URL params after consuming them
  useEffect(() => {
    const hasCanvasserParam = searchParams.has("canvasserName");
    const hasRoleParam = searchParams.has("role");
    if (hasCanvasserParam || hasRoleParam) {
      const sp = new URLSearchParams(searchParams.toString());
      sp.delete("canvasserName");
      sp.delete("canvasserPhone");
      sp.delete("role");
      router.replace(`?${sp.toString()}`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearSelection = () => {
    setSelectedIds(new Set());
    setAllMatchingSelected(false);
  };

  const baseFilters = {
    search: search || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    canvasserName: canvasserFilter || undefined,
    canvasserPhone: canvasserPhoneFilter || undefined,
  };
  const statusFilters = getReviewStatusFilters(reviewStatus);
  const activeFilters = {
    ...baseFilters,
    ...statusFilters,
  };

  const { data, isLoading } = useCampaignSubmissions(campaignId, {
    page,
    pageSize,
    ...activeFilters,
  });
  const { data: pendingCountData } = useCampaignSubmissions(campaignId, {
    page: 1,
    pageSize: 1,
    ...baseFilters,
    isVerified: false,
    isFlagged: false,
  });
  const { data: verifiedCountData } = useCampaignSubmissions(campaignId, {
    page: 1,
    pageSize: 1,
    ...baseFilters,
    isVerified: true,
    isFlagged: false,
  });
  const { data: flaggedCountData } = useCampaignSubmissions(campaignId, {
    page: 1,
    pageSize: 1,
    ...baseFilters,
    isFlagged: true,
  });
  const { data: allCountData } = useCampaignSubmissions(campaignId, {
    page: 1,
    pageSize: 1,
    ...baseFilters,
  });

  const updateMutation = useUpdateSubmission();
  const deleteMutation = useDeleteSubmission();
  const bulkMutation = useBulkSubmissionAction();
  const { data: auditData } = useSubmissionAudit(selected?.id || null);
  const submissions = (data?.submissions || []) as SubmissionWithPU[];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const reviewCounts = {
    pending: pendingCountData?.total ?? 0,
    verified: verifiedCountData?.total ?? 0,
    flagged: flaggedCountData?.total ?? 0,
    all: allCountData?.total ?? 0,
  } satisfies Record<ReviewStatus, number>;

  const allOnPageSelected =
    submissions.length > 0 && submissions.every((s) => selectedIds.has(s.id));

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      clearSelection();
    } else {
      setSelectedIds(new Set(submissions.map((s) => s.id)));
      setAllMatchingSelected(false);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
    setAllMatchingSelected(false);
  };

  const executeBulkAction = (
    action: string,
    scope: "selected" | "filtered" = "selected",
  ) => {
    bulkMutation.mutate(
      scope === "filtered"
        ? {
            action,
            scope: "filtered",
            campaignId,
            filters: activeFilters,
          }
        : { ids: Array.from(selectedIds), action, scope: "selected" },
      {
        onSuccess: (result) => {
          track("admin_submission_bulk_action", {
            action,
            affected_count: result.affected,
            campaign_id: campaignId,
          });
          const actionLabels: Record<string, string> = {
            delete: "deleted",
            verify: "verified",
            unverify: "unverified",
            flag: "flagged",
            unflag: "unflagged",
          };
          toast.success(
            `${result.affected} submission(s) ${actionLabels[action] ?? action}`,
          );
          clearSelection();
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const handleBulkAction = (action: string) => {
    if (action === "delete") {
      setConfirmDialog({
        title: "Delete submissions?",
        description: `This will permanently delete ${selectedIds.size} submission(s). This action cannot be undone.`,
        confirmLabel: "Delete",
        destructive: true,
        onConfirm: () => executeBulkAction("delete"),
      });
      return;
    }
    executeBulkAction(action);
  };

  const handleFilteredBulkAction = (action: string) => {
    const actionLabels: Record<string, string> = {
      verify: "Verify",
      unverify: "Unverify",
      flag: "Flag",
      unflag: "Unflag",
    };
    const filters = [
      `Status: ${getReviewStatusLabel(reviewStatus)}`,
      search.trim() ? `Search: "${search.trim()}"` : null,
      roleFilter !== "all" ? `Role: ${roleLabels[roleFilter] || roleFilter}` : null,
      canvasserFilter ? `Canvasser: ${canvasserFilter}` : null,
    ].filter(Boolean);

    setConfirmDialog({
      title: `${actionLabels[action] ?? "Update"} ${total.toLocaleString()} matching records?`,
      description: `This will apply to every record matching the current review filters. ${filters.length > 0 ? `Filters: ${filters.join("; ")}.` : ""} The action will be logged.`,
      confirmLabel: `${actionLabels[action] ?? "Update"} ${total.toLocaleString()} records`,
      destructive: action === "flag",
      onConfirm: () => executeBulkAction(action, "filtered"),
    });
  };

  // Compute which bulk actions to show based on selected rows' states
  const selectedSubs = submissions.filter((s) => selectedIds.has(s.id));
  const selectedCount = allMatchingSelected ? total : selectedIds.size;
  const hasUnverified = allMatchingSelected
    ? reviewStatus !== "verified"
    : selectedSubs.some((s) => !s.isVerified);
  const hasVerified = allMatchingSelected
    ? reviewStatus === "verified"
    : selectedSubs.some((s) => s.isVerified);
  const hasUnflagged = allMatchingSelected
    ? reviewStatus !== "flagged"
    : selectedSubs.some((s) => !s.isFlagged);
  const hasFlagged = allMatchingSelected
    ? reviewStatus === "flagged"
    : selectedSubs.some((s) => s.isFlagged);

  const handleExport = async ({
    format,
    redacted = false,
  }: {
    format: "csv" | "xlsx";
    redacted?: boolean;
  }) => {
    try {
      await adminCollectApi.exportSubmissions(campaignId, {
        ...activeFilters,
        format,
        redacted,
      });
      writePreferredExportFormat(format);
      setPreferredFormat(format);
      toast.success(
        buildExportToastMessage({
          format,
          redacted,
          hasSearch: search.trim().length > 0,
          hasStatusFilter: reviewStatus !== "all",
          hasRoleFilter: roleFilter !== "all",
          hasCanvasserFilter: Boolean(canvasserFilter || canvasserPhoneFilter),
        }),
      );
    } catch {
      toast.error("Export failed");
    }
  };

  const orderedFormats = getOrderedExportFormats(preferredFormat);

  const handleCopyReference = async (refCode: string) => {
    try {
      await navigator.clipboard.writeText(refCode);
      toast.success("Reference copied");
    } catch {
      toast.error("Could not copy reference");
    }
  };

  const handleToggleFlag = (sub: SubmissionWithPU) => {
    const newFlagged = !sub.isFlagged;
    updateMutation.mutate(
      { sid: sub.id, data: { isFlagged: newFlagged } },
      {
        onSuccess: () => {
          track("admin_submission_updated", {
            action: newFlagged ? "flagged" : "unflagged",
            submission_id: sub.id,
          });
          toast.success(newFlagged ? "Flagged" : "Unflagged");
          if (selected?.id === sub.id) {
            setSelected({ ...selected, isFlagged: newFlagged });
          }
        },
      },
    );
  };

  const handleDelete = (sub: SubmissionWithPU) => {
    setConfirmDialog({
      title: "Delete submission?",
      description: `This will permanently delete the submission from ${sub.fullName}. This action cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
      onConfirm: () => {
        deleteMutation.mutate(sub.id, {
          onSuccess: () => {
            track("admin_submission_deleted", {
              submission_id: sub.id,
            });
            toast.success("Submission deleted");
            setSelected(null);
          },
          onError: (e) => toast.error(e.message),
        });
      },
    });
  };

  const handleVerify = (sub: SubmissionWithPU) => {
    const newVerified = !sub.isVerified;
    updateMutation.mutate(
      { sid: sub.id, data: { isVerified: newVerified } },
      {
        onSuccess: () => {
          track("admin_submission_updated", {
            action: newVerified ? "verified" : "unverified",
            submission_id: sub.id,
          });
          toast.success(newVerified ? "Verified" : "Unverified");
          if (selected?.id === sub.id) {
            setSelected({ ...selected, isVerified: newVerified });
          }
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
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
                onClick={() => {
                  setReviewStatus(status.value);
                  setPage(1);
                  clearSelection();
                }}
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
                    isActive
                      ? "text-primary/70"
                      : "text-muted-foreground/60",
                  )}
                >
                  {reviewCounts[status.value].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative min-w-0 sm:flex-1">
          <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name, phone, email, or reference..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
              clearSelection();
            }}
            className="rounded-sm pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Select
            value={roleFilter}
            onValueChange={(v) => {
              setRoleFilter(v);
              setPage(1);
              clearSelection();
            }}
          >
            <SelectTrigger className="w-full rounded-sm sm:w-40">
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
                className="h-9 w-full justify-center rounded-sm px-4 font-mono text-[10px] font-bold tracking-widest uppercase shadow-sm sm:w-auto"
              >
                <IconFileExport className="mr-2 h-4 w-4" />
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
                    onClick={() => handleExport({ format })}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    Export {exportFormatMeta[format].label}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              {orderedFormats.map((format) => {
                const Icon = exportFormatMeta[format].icon;
                return (
                  <DropdownMenuItem
                    key={`redacted-${format}`}
                    onClick={() => handleExport({ format, redacted: true })}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    Export Redacted {exportFormatMeta[format].label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Canvasser Filter Chip */}
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
              onClick={() => {
                setCanvasserFilter(null);
                setCanvasserPhoneFilter(null);
                setPage(1);
                clearSelection();
              }}
            >
              &times;
            </button>
          </Badge>
        </div>
      )}

      {/* Bulk Actions Toolbar */}
      {selectedCount > 0 && (
        <div className="bg-primary/5 border-primary/20 flex flex-wrap items-center gap-2 rounded-sm border px-3 py-2">
          <span className="text-primary w-full text-xs font-bold sm:w-auto">
            {allMatchingSelected
              ? `${selectedCount.toLocaleString()} matching records selected`
              : `${selectedCount} selected`}
          </span>
          {!allMatchingSelected &&
            allOnPageSelected &&
            total > selectedIds.size &&
            reviewStatus !== "all" && (
              <button
                type="button"
                className="text-primary hover:text-primary/80 text-xs font-semibold underline"
                onClick={() => setAllMatchingSelected(true)}
              >
                Select all {total.toLocaleString()} matching records
              </button>
            )}
          {hasUnverified && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 flex-1 rounded-sm px-2 text-[10px] font-bold tracking-wider uppercase sm:h-7 sm:flex-none"
              onClick={() =>
                allMatchingSelected
                  ? handleFilteredBulkAction("verify")
                  : handleBulkAction("verify")
              }
              disabled={bulkMutation.isPending}
            >
              <IconShieldCheck className="mr-1 h-3 w-3" />
              {allMatchingSelected ? "Verify Matching" : "Verify Selected"}
            </Button>
          )}
          {hasVerified && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 flex-1 rounded-sm px-2 text-[10px] font-bold tracking-wider uppercase sm:h-7 sm:flex-none"
              onClick={() =>
                allMatchingSelected
                  ? handleFilteredBulkAction("unverify")
                  : handleBulkAction("unverify")
              }
              disabled={bulkMutation.isPending}
            >
              <IconShieldX className="mr-1 h-3 w-3" />
              {allMatchingSelected ? "Unverify Matching" : "Unverify Selected"}
            </Button>
          )}
          {hasUnflagged && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 flex-1 rounded-sm px-2 text-[10px] font-bold tracking-wider uppercase sm:h-7 sm:flex-none"
              onClick={() =>
                allMatchingSelected
                  ? handleFilteredBulkAction("flag")
                  : handleBulkAction("flag")
              }
              disabled={bulkMutation.isPending}
            >
              <IconFlag className="mr-1 h-3 w-3" />
              {allMatchingSelected ? "Flag Matching" : "Flag Selected"}
            </Button>
          )}
          {hasFlagged && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 flex-1 rounded-sm px-2 text-[10px] font-bold tracking-wider uppercase sm:h-7 sm:flex-none"
              onClick={() =>
                allMatchingSelected
                  ? handleFilteredBulkAction("unflag")
                  : handleBulkAction("unflag")
              }
              disabled={bulkMutation.isPending}
            >
              <IconFlagOff className="mr-1 h-3 w-3" />
              {allMatchingSelected ? "Unflag Matching" : "Unflag Selected"}
            </Button>
          )}
          {!allMatchingSelected && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 flex-1 rounded-sm border-red-500/20 px-2 text-[10px] font-bold tracking-wider text-red-600 uppercase hover:bg-red-600 hover:text-white sm:h-7 sm:flex-none"
              onClick={() => handleBulkAction("delete")}
              disabled={bulkMutation.isPending}
            >
              <IconTrash className="mr-1 h-3 w-3" />
              Delete Selected
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-full px-2 text-[10px] font-bold tracking-wider uppercase sm:ml-auto sm:h-7 sm:w-auto"
            onClick={clearSelection}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="border-border rounded-sm border border-dashed py-12 text-center">
          <p className="text-muted-foreground">
            No {getReviewStatusLabel(reviewStatus).toLowerCase()} records found.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-sm border">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 z-10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-10 w-10 text-center">
                    <Checkbox
                      checked={allOnPageSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 w-14 text-center font-mono text-[10px] font-bold tracking-widest uppercase">
                    S/N
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                    Name
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                    Phone
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase md:table-cell">
                    LGA
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase md:table-cell">
                    Ward
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase xl:table-cell">
                    Polling Unit
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                    Role
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden h-10 font-mono text-[10px] font-bold tracking-widest uppercase lg:table-cell">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((s, idx) => (
                  <TableRow
                    key={s.id}
                    className={`cursor-pointer transition-colors ${
                      s.isFlagged
                        ? "bg-destructive/5 hover:bg-destructive/10"
                        : s.isVerified
                          ? "bg-brand-emerald/5 hover:bg-brand-emerald/10"
                          : "hover:bg-muted/30"
                    }`}
                    onClick={() => {
                      setSelected(s);
                      setAdminNotes(s.adminNotes || "");
                    }}
                  >
                    <TableCell
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedIds.has(s.id)}
                        onCheckedChange={() => toggleSelect(s.id)}
                        aria-label={`Select ${s.fullName}`}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-center text-xs font-medium">
                      {(page - 1) * pageSize + idx + 1}
                    </TableCell>
                    <TableCell className="font-medium">{s.fullName}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {s.phone}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatGeoDisplayName(s.lgaName)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatGeoDisplayName(s.wardName)}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <code className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-xs">
                        {formatPU(s)}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                      >
                        {roleLabels[s.role] || s.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {s.isVerified && (
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary border-primary/30 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                          >
                            Verified
                          </Badge>
                        )}
                        {s.isFlagged && (
                          <Badge
                            variant="outline"
                            className="bg-destructive/10 text-destructive border-destructive/30 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                          >
                            Flagged
                          </Badge>
                        )}
                        {!s.isVerified && !s.isFlagged && (
                          <Badge
                            variant="outline"
                            className="rounded-sm border-orange-500/20 bg-orange-500/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-orange-600 uppercase"
                          >
                            Pending Review
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden text-xs lg:table-cell">
                      {new Date(s.createdAt).toLocaleString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <AdminPagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={total}
            itemLabel="submissions"
            onPageChange={(nextPage) => {
              setPage(nextPage);
              clearSelection();
            }}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
              clearSelection();
            }}
          />
        </>
      )}

      {/* Detail Sheet */}
      <Sheet
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md">
          <div className="bg-muted/10 border-b">
            <SheetHeader className="space-y-1">
              <SheetTitle className="text-lg font-extrabold tracking-tight sm:text-xl">
                {selected?.fullName}
              </SheetTitle>
              <div className="flex items-center gap-2">
                <code className="text-muted-foreground/80 bg-muted/60 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold">
                  {selected?.phone}
                </code>
                {selected?.role && (
                  <Badge
                    variant="outline"
                    className="bg-primary/5 border-primary/20 text-primary rounded-sm px-1.5 py-0 font-mono text-[9px] font-bold tracking-widest uppercase"
                  >
                    {roleLabels[selected.role] || selected.role}
                  </Badge>
                )}
              </div>
              {selected && (
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-muted-foreground font-medium">Ref</span>
                  <code className="text-muted-foreground font-mono tracking-[0.18em] uppercase">
                    {getSubmissionRefCode(selected)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground h-6 rounded-sm px-1.5"
                    onClick={() =>
                      handleCopyReference(getSubmissionRefCode(selected))
                    }
                    aria-label="Copy registration reference"
                  >
                    <IconCopy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto">
            {selected && (
              <div className="space-y-6 p-5 pb-24">
                <Section label="Personal Identity">
                  <Field label="Email" value={selected.email || "—"} />
                  <Field label="Sex" value={selected.sex} />
                  <Field label="Age" value={String(selected.age)} />
                  <Field label="Occupation" value={selected.occupation} />
                  <Field
                    label="Marital Status"
                    value={selected.maritalStatus}
                  />
                </Section>

                <Section label="Location Data">
                  <Field
                    label="LGA"
                    value={formatGeoDisplayName(selected.lgaName)}
                  />
                  <Field
                    label="Ward"
                    value={formatGeoDisplayName(selected.wardName)}
                  />
                  <Field label="Polling Unit" value={formatPU(selected)} mono />
                </Section>

                <Section label="Verification Info">
                  <Field
                    label="APC/NIN Num."
                    value={selected.apcRegNumber || "—"}
                    mono
                  />
                  <Field
                    label="Voter's ID"
                    value={selected.voterIdNumber || "—"}
                    mono
                  />
                </Section>

                <Section label="Source & Context">
                  <Field
                    label="Assigned Role"
                    value={roleLabels[selected.role] || selected.role}
                  />
                  {selected.role !== "canvasser" && (
                    <>
                      <Field
                        label="Agent/Canv."
                        value={selected.canvasserName || "—"}
                      />
                      <Field
                        label="Agent Contact"
                        value={selected.canvasserPhone || "—"}
                        mono
                      />
                    </>
                  )}
                </Section>

                {(selected.customAnswer1 || selected.customAnswer2) && (
                  <Section label="Submission Specifics">
                    {selected.customAnswer1 && (
                      <Field label="Q1" value={selected.customAnswer1} />
                    )}
                    {selected.customAnswer2 && (
                      <Field label="Q2" value={selected.customAnswer2} />
                    )}
                  </Section>
                )}

                <Section label="Admin Notes">
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add administrative notes..."
                    className="border-border/60 min-h-[80px] rounded-sm text-sm"
                  />
                  {adminNotes !== (selected.adminNotes || "") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 rounded-sm px-3 font-mono text-[9px] font-bold tracking-widest uppercase"
                      disabled={updateMutation.isPending}
                      onClick={() => {
                        updateMutation.mutate(
                          {
                            sid: selected.id,
                            data: { adminNotes },
                          },
                          {
                            onSuccess: () => {
                              track("admin_submission_updated", {
                                action: "notes_saved",
                                submission_id: selected.id,
                              });
                              toast.success("Notes saved");
                              setSelected({
                                ...selected,
                                adminNotes,
                              });
                            },
                          },
                        );
                      }}
                    >
                      Save Notes
                    </Button>
                  )}
                </Section>

                {auditData && auditData.entries.length > 0 && (
                  <Section label="History">
                    <div className="max-h-40 space-y-2 overflow-y-auto">
                      {auditData.entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="border-border/60 flex items-start gap-2 border-l-2 pl-3 text-xs"
                        >
                          <div className="flex-1">
                            <span className="font-medium">
                              {entry.userName}
                            </span>{" "}
                            <span className="text-muted-foreground">
                              {entry.action}
                            </span>
                          </div>
                          <span className="text-muted-foreground shrink-0 text-[10px]">
                            {new Date(entry.createdAt).toLocaleString("en-NG", {
                              day: "numeric",
                              month: "short",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
              </div>
            )}
          </div>

          <div className="bg-background absolute right-0 bottom-0 left-0 border-t p-5 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-2">
              <Button
                variant={selected?.isFlagged ? "outline" : "destructive"}
                size="sm"
                className="h-8 rounded-sm px-3 font-mono text-[9px] font-bold tracking-widest uppercase transition-all"
                onClick={() => selected && handleToggleFlag(selected)}
              >
                {selected?.isFlagged ? (
                  <IconFlagOff className="mr-2 h-3.5 w-3.5" />
                ) : (
                  <IconFlag className="mr-2 h-3.5 w-3.5" />
                )}
                {selected?.isFlagged ? "Unflag" : "Flag"}
              </Button>
              <Button
                variant={selected?.isVerified ? "outline" : "default"}
                size="sm"
                className="h-8 rounded-sm px-3 font-mono text-[9px] font-bold tracking-widest uppercase transition-all"
                onClick={() => selected && handleVerify(selected)}
              >
                <IconShieldCheck className="mr-2 h-3.5 w-3.5" />
                {selected?.isVerified ? "Unverify" : "Verify"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto h-8 rounded-sm border-red-500/20 px-3 font-mono text-[9px] font-bold tracking-widest text-red-600 uppercase transition-all hover:bg-red-600 hover:text-white"
                onClick={() => selected && handleDelete(selected)}
                disabled={deleteMutation.isPending}
              >
                <IconTrash className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirm Dialog */}
      <AlertDialog
        open={!!confirmDialog}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <AlertDialogContent className="rounded-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-sm font-mono text-[11px] tracking-widest uppercase">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={`rounded-sm font-mono text-[11px] tracking-widest uppercase ${
                confirmDialog?.destructive
                  ? "bg-destructive hover:bg-destructive/90"
                  : ""
              }`}
              onClick={() => {
                confirmDialog?.onConfirm();
                setConfirmDialog(null);
              }}
            >
              {confirmDialog?.confirmLabel ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="text-foreground font-mono text-[10px] font-bold tracking-widest whitespace-nowrap uppercase">
          {label}
        </h4>
        <div className="bg-border/70 h-px flex-1" />
      </div>
      <div className="grid gap-2.5">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
        {label}
      </span>
      <span
        className={`text-foreground text-right text-sm font-bold ${mono ? "font-mono text-xs tabular-nums" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
