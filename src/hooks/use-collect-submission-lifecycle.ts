"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { getCollectErrorCategory, track } from "@/lib/analytics/client";
import { getFailedSubmissionById, type SyncResult } from "@/lib/offline-queue";
import type { RegistrationFormData } from "@/lib/schemas/collect-schemas";
import { composeFullName, generateRefCode } from "@/lib/utils";

type UseCollectSubmissionLifecycleArgs = {
  campaignSlug: string;
  form: UseFormReturn<RegistrationFormData>;
  screen: number;
  confirmationScreen: number;
  lastSyncResult: SyncResult | null;
  clearLastSyncResult: () => void;
  onShowConfirmationScreen: () => void;
};

function persistSubmittedRegistration(
  campaignSlug: string,
  form: UseFormReturn<RegistrationFormData>,
  submissionId: string,
  count: number,
) {
  const refCode = generateRefCode(submissionId);
  localStorage.setItem(
    `collect-submitted-${campaignSlug}`,
    JSON.stringify({
      name: composeFullName(form.getValues()),
      count,
      submittedAt: new Date().toISOString(),
      refCode,
    }),
  );
}

export function useCollectSubmissionLifecycle({
  campaignSlug,
  form,
  screen,
  confirmationScreen,
  lastSyncResult,
  clearLastSyncResult,
  onShowConfirmationScreen,
}: UseCollectSubmissionLifecycleArgs) {
  const [submittedCount, setSubmittedCount] = useState<number | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [queuedAnalyticsId, setQueuedAnalyticsId] = useState<string | null>(
    null,
  );
  const [queuedSyncError, setQueuedSyncError] = useState<string | null>(null);
  const [syncSource, setSyncSource] = useState<"automatic" | "manual">(
    "automatic",
  );
  const failedRehydrateAppliedRef = useRef(false);

  const clearActiveFailedPointer = useCallback(() => {
    try {
      localStorage.removeItem(`collect-active-failed-${campaignSlug}`);
    } catch {
      /* ignore */
    }
  }, [campaignSlug]);

  const clearQueuedFailureState = useCallback(() => {
    setQueuedSyncError(null);
    clearActiveFailedPointer();
  }, [clearActiveFailedPointer]);

  const markManualSyncRequested = useCallback(() => {
    setSyncSource("manual");
  }, []);

  const showQueuedSubmission = useCallback((analyticsId: string) => {
    setQueuedAnalyticsId(analyticsId);
    setSubmittedCount(null);
    setSubmissionId(null);
    setQueuedSyncError(null);
  }, []);

  const showConfirmedSubmission = useCallback(
    (nextSubmissionId: string, count: number) => {
      setSubmittedCount(count);
      setSubmissionId(nextSubmissionId);
      setQueuedAnalyticsId(null);
      setQueuedSyncError(null);
      clearActiveFailedPointer();
      persistSubmittedRegistration(campaignSlug, form, nextSubmissionId, count);
    },
    [campaignSlug, clearActiveFailedPointer, form],
  );

  const resetSubmissionState = useCallback(() => {
    setSubmittedCount(null);
    setSubmissionId(null);
    setQueuedAnalyticsId(null);
    setQueuedSyncError(null);
    clearActiveFailedPointer();
  }, [clearActiveFailedPointer]);

  useEffect(() => {
    failedRehydrateAppliedRef.current = false;
    if (typeof window === "undefined") return;

    const key = `collect-active-failed-${campaignSlug}`;
    let cancelled = false;

    void (async () => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;

        const parsed = JSON.parse(raw) as { id?: unknown };
        if (typeof parsed.id !== "number") return;

        const row = await getFailedSubmissionById(parsed.id);
        if (cancelled) return;

        if (!row) {
          try {
            localStorage.removeItem(key);
          } catch {
            /* ignore */
          }
          return;
        }

        const error =
          row.lastError ?? "This registration was not added to the campaign.";
        queueMicrotask(() => {
          if (failedRehydrateAppliedRef.current) return;
          failedRehydrateAppliedRef.current = true;
          setQueuedSyncError(error);
          setQueuedAnalyticsId(null);
          setSubmittedCount(null);
          setSubmissionId(null);
          onShowConfirmationScreen();
          track("collect_failed_active_rehydrated", {
            has_last_error: Boolean(row.lastError),
            error_category: getCollectErrorCategory(row.lastError ?? error),
          });
        });
      } catch {
        /* ignore corrupt pointer */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [campaignSlug, onShowConfirmationScreen]);

  // Surface auto-sync results (from reconnect) as toasts; flip queued
  // confirmation when the currently displayed registration syncs or fails.
  useEffect(() => {
    if (!lastSyncResult) return;

    let flippedToConfirmed = false;
    if (
      screen === confirmationScreen &&
      submittedCount === null &&
      queuedAnalyticsId &&
      lastSyncResult.syncedEntries.length > 0
    ) {
      const match = lastSyncResult.syncedEntries.find(
        (entry) => entry.analyticsId === queuedAnalyticsId,
      );
      if (match) {
        flippedToConfirmed = true;
        queueMicrotask(() => {
          showConfirmedSubmission(match.submissionId, match.count);
        });
      }
    }

    const activeFailedMatch =
      screen === confirmationScreen &&
      submittedCount === null &&
      queuedAnalyticsId &&
      !flippedToConfirmed
        ? lastSyncResult.failed.find(
            (entry) => entry.analyticsId === queuedAnalyticsId,
          )
        : undefined;

    if (activeFailedMatch) {
      queueMicrotask(() => {
        setQueuedSyncError(activeFailedMatch.error);
        setQueuedAnalyticsId(null);
        try {
          localStorage.setItem(
            `collect-active-failed-${campaignSlug}`,
            JSON.stringify({ id: activeFailedMatch.id }),
          );
        } catch {
          /* ignore */
        }
      });
    }

    track("collect_sync_completed", {
      source: syncSource,
      synced_count: lastSyncResult.synced,
      failed_count: lastSyncResult.failed.length,
    });

    for (const entry of lastSyncResult.syncedEntries) {
      track("collect_submission_succeeded", {
        analytics_id: entry.analyticsId,
        submission_source: "offline_queue",
      });
    }

    for (const entry of lastSyncResult.failed) {
      track("collect_submission_failed", {
        analytics_id: entry.analyticsId,
        error_category: getCollectErrorCategory(entry.error),
        submission_source: "offline_queue",
      });
    }

    if (lastSyncResult.synced > 0) {
      toast.success(`${lastSyncResult.synced} submission(s) synced`);
    }

    for (const entry of lastSyncResult.failed) {
      if (activeFailedMatch && entry.id === activeFailedMatch.id) continue;
      toast.error("Queued submission rejected", {
        description: entry.error,
        duration: 8000,
      });
    }

    window.setTimeout(() => {
      setSyncSource("automatic");
    }, 0);
    clearLastSyncResult();
  }, [
    campaignSlug,
    clearLastSyncResult,
    confirmationScreen,
    lastSyncResult,
    queuedAnalyticsId,
    screen,
    showConfirmedSubmission,
    submittedCount,
    syncSource,
  ]);

  return {
    submittedCount,
    submissionId,
    queuedSyncError,
    clearQueuedFailureState,
    markManualSyncRequested,
    resetSubmissionState,
    showConfirmedSubmission,
    showQueuedSubmission,
  };
}
