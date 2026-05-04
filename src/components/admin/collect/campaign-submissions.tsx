"use client";

import type { ComponentType } from "react";
import { useEffect, useState } from "react";

import {
  IconFlag,
  IconFlagOff,
  IconShieldCheck,
  IconShieldX,
} from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminMobileRecordSkeleton } from "@/components/admin/shared/admin-mobile-record-card";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBulkSubmissionAction,
  useCampaignSubmissions,
  useDeleteSubmission,
  useSubmissionAudit,
  useUpdateSubmission,
} from "@/hooks/use-collect";
import { track } from "@/lib/analytics/client";
import { adminCollectApi } from "@/lib/api/collect";
import { roleLabels } from "@/lib/collect/analytics";
import {
  readPreferredExportFormat,
  writePreferredExportFormat,
} from "@/lib/exports/client-preferences";
import { useIsPortraitMobile } from "@/hooks/use-mobile";
import {
  buildExportToastMessage,
  deriveSubmissionSelectionState,
  getReviewStatusFilters,
  getReviewStatusLabel,
} from "@/lib/collect/campaign-submissions";
import { formatPersonName } from "@/lib/utils";
import type {
  ReviewStatus,
  SubmissionActiveFilters,
  SubmissionBulkActionKey,
  SubmissionBulkActionViewModel,
  SubmissionConfirmDialog,
  SubmissionWithPU,
} from "@/types/campaign-submissions";

import { CampaignSubmissionDetailSheet } from "@/components/admin/collect/campaign-submission-detail-sheet";
import {
  CampaignSubmissionsBulkToolbar,
  CampaignSubmissionsSelectionTray,
} from "@/components/admin/collect/campaign-submissions-bulk-toolbar";
import { CampaignSubmissionsTable } from "@/components/admin/collect/campaign-submissions-table";
import { CampaignSubmissionsToolbar } from "@/components/admin/collect/campaign-submissions-toolbar";

const bulkActionIcons = {
  verify: IconShieldCheck,
  unverify: IconShieldX,
  flag: IconFlag,
  unflag: IconFlagOff,
} as const satisfies Record<
  SubmissionBulkActionKey,
  ComponentType<{ className?: string }>
>;

export function CampaignSubmissions({ campaignId }: { campaignId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isPortraitMobile = useIsPortraitMobile();

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
  const [confirmDialog, setConfirmDialog] =
    useState<SubmissionConfirmDialog>(null);
  const [preferredFormat, setPreferredFormat] = useState(() =>
    readPreferredExportFormat(),
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [allMatchingSelected, setAllMatchingSelected] = useState(false);

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

  const baseFilters: SubmissionActiveFilters = {
    search: search || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    canvasserName: canvasserFilter || undefined,
    canvasserPhone: canvasserPhoneFilter || undefined,
  };
  const statusFilters = getReviewStatusFilters(reviewStatus);
  const activeFilters: SubmissionActiveFilters = {
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
  const reviewCounts: Record<ReviewStatus, number> = {
    pending: pendingCountData?.total ?? 0,
    verified: verifiedCountData?.total ?? 0,
    flagged: flaggedCountData?.total ?? 0,
    all: allCountData?.total ?? 0,
  };

  const selectionState = deriveSubmissionSelectionState({
    submissions,
    selectedIds,
    total,
    reviewStatus,
    allMatchingSelected,
  });

  const toggleSelectAll = () => {
    if (selectionState.allOnPageSelected) {
      clearSelection();
      return;
    }

    setSelectedIds(new Set(submissions.map((submission) => submission.id)));
    setAllMatchingSelected(false);
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
        onError: (error) => toast.error(error.message),
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
      roleFilter !== "all"
        ? `Role: ${roleLabels[roleFilter] || roleFilter}`
        : null,
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

  const bulkActions: SubmissionBulkActionViewModel[] =
    selectionState.availableActions.map((action) => ({
      ...action,
      icon: bulkActionIcons[action.key],
      onClick: () =>
        allMatchingSelected
          ? handleFilteredBulkAction(action.key)
          : handleBulkAction(action.key),
    }));

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

  const handleCopyReference = async (refCode: string) => {
    try {
      await navigator.clipboard.writeText(refCode);
      toast.success("Reference copied");
    } catch {
      toast.error("Could not copy reference");
    }
  };

  const handleToggleFlag = (submission: SubmissionWithPU) => {
    const newFlagged = !submission.isFlagged;
    updateMutation.mutate(
      { sid: submission.id, data: { isFlagged: newFlagged } },
      {
        onSuccess: () => {
          track("admin_submission_updated", {
            action: newFlagged ? "flagged" : "unflagged",
            submission_id: submission.id,
          });
          toast.success(newFlagged ? "Flagged" : "Unflagged");
          if (selected?.id === submission.id) {
            setSelected({ ...selected, isFlagged: newFlagged });
          }
        },
      },
    );
  };

  const handleDelete = (submission: SubmissionWithPU) => {
    setConfirmDialog({
      title: "Delete submission?",
      description: `This will permanently delete the submission from ${formatPersonName(submission.fullName)}. This action cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
      onConfirm: () => {
        deleteMutation.mutate(submission.id, {
          onSuccess: () => {
            track("admin_submission_deleted", {
              submission_id: submission.id,
            });
            toast.success("Submission deleted");
            setSelected(null);
          },
          onError: (error) => toast.error(error.message),
        });
      },
    });
  };

  const handleVerify = (submission: SubmissionWithPU) => {
    const newVerified = !submission.isVerified;
    updateMutation.mutate(
      { sid: submission.id, data: { isVerified: newVerified } },
      {
        onSuccess: () => {
          track("admin_submission_updated", {
            action: newVerified ? "verified" : "unverified",
            submission_id: submission.id,
          });
          toast.success(newVerified ? "Verified" : "Unverified");
          if (selected?.id === submission.id) {
            setSelected({ ...selected, isVerified: newVerified });
          }
        },
      },
    );
  };

  const openSubmission = (submission: SubmissionWithPU) => {
    setSelected(submission);
    setAdminNotes(submission.adminNotes || "");
  };

  const selectionSummary = allMatchingSelected
    ? `${selectionState.selectedCount.toLocaleString()} matching records selected`
    : `${selectionState.selectedCount} selected`;

  return (
    <div className="space-y-4">
      <CampaignSubmissionsToolbar
        reviewStatus={reviewStatus}
        reviewCounts={reviewCounts}
        onReviewStatusChange={(status) => {
          setReviewStatus(status);
          setPage(1);
          clearSelection();
        }}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
          clearSelection();
        }}
        roleFilter={roleFilter}
        onRoleFilterChange={(value) => {
          setRoleFilter(value);
          setPage(1);
          clearSelection();
        }}
        canvasserFilter={canvasserFilter}
        onClearCanvasserFilter={() => {
          setCanvasserFilter(null);
          setCanvasserPhoneFilter(null);
          setPage(1);
          clearSelection();
        }}
        total={total}
        preferredFormat={preferredFormat}
        onExport={handleExport}
      />

      {selectionState.selectedCount > 0 && (
        <CampaignSubmissionsBulkToolbar
          summary={selectionSummary}
          canSelectAllMatching={selectionState.canSelectAllMatching}
          total={total}
          onSelectAllMatching={() => setAllMatchingSelected(true)}
          actions={bulkActions}
          showDeleteAction={!allMatchingSelected}
          onDeleteSelected={() => handleBulkAction("delete")}
          isPending={bulkMutation.isPending}
          onClear={clearSelection}
        />
      )}

      {isLoading ? (
        <>
          <AdminMobileRecordSkeleton rows={5} />
          <div className="hidden space-y-2 md:block">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        </>
      ) : submissions.length === 0 ? (
        <div className="border-border rounded-sm border border-dashed py-12 text-center">
          <p className="text-muted-foreground">
            No {getReviewStatusLabel(reviewStatus).toLowerCase()} records found.
          </p>
        </div>
      ) : (
        <>
          <CampaignSubmissionsTable
            submissions={submissions}
            page={page}
            pageSize={pageSize}
            selectedIds={selectedIds}
            allOnPageSelected={selectionState.allOnPageSelected}
            onToggleSelectAll={toggleSelectAll}
            onToggleSelect={toggleSelect}
            onOpenSubmission={openSubmission}
          />

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

      {selectionState.selectedCount > 0 && (
        <CampaignSubmissionsSelectionTray
          summary={selectionSummary}
          canSelectAllMatching={selectionState.canSelectAllMatching}
          total={total}
          onSelectAllMatching={() => setAllMatchingSelected(true)}
          actions={bulkActions}
          allMatchingSelected={allMatchingSelected}
          allOnPageSelected={selectionState.allOnPageSelected}
          onToggleSelectAll={toggleSelectAll}
          onDeleteSelected={() => handleBulkAction("delete")}
          isPending={bulkMutation.isPending}
          onClear={clearSelection}
        />
      )}

      <CampaignSubmissionDetailSheet
        selected={selected}
        isPortraitMobile={isPortraitMobile}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        onCopyReference={handleCopyReference}
        onSaveNotes={() => {
          if (!selected) return;
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
        onToggleFlag={() => selected && handleToggleFlag(selected)}
        onVerify={() => selected && handleVerify(selected)}
        onDelete={() => selected && handleDelete(selected)}
        updatePending={updateMutation.isPending}
        deletePending={deleteMutation.isPending}
        auditEntries={auditData?.entries ?? []}
      />

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
