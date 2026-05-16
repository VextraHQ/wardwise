"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { getCollectErrorCategory, track } from "@/lib/analytics/client";
import type { PendingSubmission } from "@/lib/offline-queue";
import { composeFullName, formatPersonName } from "@/lib/utils";

// Sorts failed submissions with the most recently failed at the top.
function sortFailedNewestFirst(rows: PendingSubmission[]): PendingSubmission[] {
  return [...rows].sort((a, b) => {
    const fa = a.failedAt ?? "";
    const fb = b.failedAt ?? "";
    if (fb !== fa) return fb.localeCompare(fa);
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  });
}

// Formats a pending row to a readable name. Falls back to a label if data is missing.
function formatRowDisplayName(data: Record<string, unknown>): string {
  const name = composeFullName({
    firstName: typeof data.firstName === "string" ? data.firstName : undefined,
    middleName:
      typeof data.middleName === "string" ? data.middleName : undefined,
    lastName: typeof data.lastName === "string" ? data.lastName : undefined,
  });
  return formatPersonName(name) || "Unnamed registration";
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  failedCount: number;
  listFailedSubmissions: () => Promise<PendingSubmission[]>;
  onDismissRow: (id: number) => Promise<void>;
  onBulkClear: () => Promise<void>;
};

export function FailedReviewSheet({
  open,
  onOpenChange,
  failedCount,
  listFailedSubmissions,
  onDismissRow,
  onBulkClear,
}: Props) {
  const isMobile = useIsMobile();
  const [rows, setRows] = useState<PendingSubmission[]>([]);

  // Fetch new list of failed submissions each time the sheet opens or failedCount changes
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void listFailedSubmissions().then((r) => {
      if (!cancelled) setRows(sortFailedNewestFirst(r));
    });
    return () => {
      cancelled = true;
    };
  }, [open, failedCount, listFailedSubmissions]);

  // Remove a single failed submission and refresh the list
  const handleDismissRow = async (row: PendingSubmission) => {
    if (typeof row.id !== "number") return;
    track("collect_failed_record_dismissed", {
      error_category: getCollectErrorCategory(row.lastError ?? ""),
    });
    await onDismissRow(row.id);
    const next = await listFailedSubmissions();
    setRows(sortFailedNewestFirst(next));
  };

  // True if there are no failed submissions to review
  const empty = rows.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? "max-h-[min(90dvh,90svh)] min-h-0 gap-0 overflow-hidden p-0"
            : "gap-0 overflow-hidden p-0"
        }
      >
        <SheetHeader className="border-border shrink-0 border-b p-4 text-left">
          <SheetTitle>Failed uploads</SheetTitle>
          <SheetDescription>
            Registrations the server rejected on sync. They stay on this device
            until you clear them. Nothing here was added to the campaign.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {empty ? (
            <p className="text-muted-foreground text-sm">
              No failed records on this device.
            </p>
          ) : (
            <ul className="space-y-3">
              {rows.map((row) => {
                const id = row.id;
                const canDismiss = typeof id === "number";
                return (
                  <li
                    key={canDismiss ? id : row.createdAt}
                    className="border-border rounded-sm border p-3"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <p className="text-foreground truncate text-sm font-medium">
                          {formatRowDisplayName(row.data)}
                        </p>
                        {row.failedAt ? (
                          <p className="text-muted-foreground text-xs">
                            {new Date(row.failedAt).toLocaleString()}
                          </p>
                        ) : null}
                        <p className="text-destructive text-xs wrap-break-word">
                          {row.lastError ?? "Upload was not completed."}
                        </p>
                      </div>
                      {canDismiss ? (
                        <button
                          type="button"
                          onClick={() => void handleDismissRow(row)}
                          className="text-muted-foreground hover:text-foreground shrink-0 self-start rounded-sm border px-2 py-1 text-xs font-medium transition-colors"
                        >
                          Dismiss
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <SheetFooter className="border-border shrink-0 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                disabled={empty}
                className="bg-destructive hover:bg-destructive/90 inline-flex h-9 w-full items-center justify-center rounded-sm px-4 text-xs font-semibold tracking-widest text-gray-100 uppercase transition-colors disabled:pointer-events-none disabled:opacity-50"
              >
                Clear all failed notices
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Clear failed upload notices?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This clears failed local upload records from this device. It
                  does not delete any submitted campaign record.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep notices</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    void (async () => {
                      await onBulkClear();
                      setRows([]);
                    })();
                  }}
                >
                  Clear notices
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
