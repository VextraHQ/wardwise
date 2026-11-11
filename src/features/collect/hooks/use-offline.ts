"use client";

import { useState, useEffect, useCallback } from "react";
import { useOnlineStatus } from "@/hooks/shared/use-online-status";
import {
  syncPendingSubmissions,
  getPendingCount,
  getFailedCount,
  getFailedSubmissions,
  removeFailedSubmissions,
  removePendingSubmission,
  type SyncResult,
} from "@/features/collect/lib/offline/offline-queue";

// Tracks the device's network status, manages an offline submission queue,
// and auto-syncs any pending records the moment connectivity is restored.
// Pending and failed queue counts, read together so they never disagree.
function readQueueCounts() {
  return Promise.all([getPendingCount(), getFailedCount()]);
}

export function useOffline() {
  const isOffline = !useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  // Reads both pending and failed queue counts from IndexedDB in lockstep so
  // the UI never shows a stale count for either side.
  const refreshQueueCounts = useCallback(async () => {
    try {
      const [pending, failed] = await readQueueCounts();
      setPendingCount(pending);
      setFailedCount(failed);
    } catch {
      // IndexedDB not available
    }
  }, []);

  // Flushes all queued offline submissions to the server.
  const trySync = useCallback(async (): Promise<SyncResult | undefined> => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await syncPendingSubmissions();
      await refreshQueueCounts();
      setLastSyncResult(result);
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshQueueCounts]);

  // Drops every failed record from IndexedDB and refreshes both counts so the
  // "Needs Attention" banner disappears immediately after the user confirms.
  const clearFailedSubmissions = useCallback(async (): Promise<number> => {
    const cleared = await removeFailedSubmissions();
    await refreshQueueCounts();
    return cleared;
  }, [refreshQueueCounts]);

  const listFailedSubmissions = useCallback(() => getFailedSubmissions(), []);

  const dismissFailedSubmission = useCallback(
    async (id: number): Promise<void> => {
      await removePendingSubmission(id);
      await refreshQueueCounts();
    },
    [refreshQueueCounts],
  );

  // Triggers a sync when the connection comes back.
  useEffect(() => {
    const goOnline = () => void trySync();

    window.addEventListener("online", goOnline);
    return () => window.removeEventListener("online", goOnline);
  }, [trySync]);

  // Initial queue counts.
  useEffect(() => {
    let cancelled = false;
    readQueueCounts()
      .then(([pending, failed]) => {
        if (cancelled) return;
        setPendingCount(pending);
        setFailedCount(failed);
      })
      .catch(() => {
        // IndexedDB not available
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Clears the last sync result from state (used to dismiss sync banners).
  const clearLastSyncResult = useCallback(() => setLastSyncResult(null), []);

  return {
    isOffline,
    pendingCount,
    failedCount,
    isSyncing,
    trySync,
    refreshQueueCounts,
    clearFailedSubmissions,
    listFailedSubmissions,
    dismissFailedSubmission,
    lastSyncResult,
    clearLastSyncResult,
  };
}
