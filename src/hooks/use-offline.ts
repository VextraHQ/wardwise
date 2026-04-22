"use client";

import { useState, useEffect, useCallback } from "react";
import {
  syncPendingSubmissions,
  getPendingCount,
  getFailedCount,
  getFailedSubmissions,
  removeFailedSubmissions,
  removePendingSubmission,
  type SyncResult,
} from "@/lib/offline-queue";

// Tracks the device's network status, manages an offline submission queue,
// and auto-syncs any pending records the moment connectivity is restored.
export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  // Reads both pending and failed queue counts from IndexedDB in lockstep so
  // the UI never shows a stale count for either side.
  const refreshQueueCounts = useCallback(async () => {
    try {
      const [pending, failed] = await Promise.all([
        getPendingCount(),
        getFailedCount(),
      ]);
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

  // Listens to browser online/offline events and triggers a sync on reconnect.
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOffline(!navigator.onLine);

    const goOffline = () => setIsOffline(true);
    const goOnline = () => {
      setIsOffline(false);
      void trySync();
    };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, [trySync]);

  useEffect(() => {
    void refreshQueueCounts();
  }, [refreshQueueCounts]);

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
