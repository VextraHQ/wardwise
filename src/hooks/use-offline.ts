"use client";

import { useState, useEffect, useCallback } from "react";
import {
  syncPendingSubmissions,
  getPendingCount,
  type SyncResult,
} from "@/lib/offline-queue";

// Tracks the device's network status, manages an offline submission queue,
// and auto-syncs any pending records the moment connectivity is restored.
export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  // Flushes all queued offline submissions to the server.
  const trySync = useCallback(async (): Promise<SyncResult | undefined> => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await syncPendingSubmissions();
      await refreshPendingCount();
      setLastSyncResult(result);
      return result;
    } finally {
      setIsSyncing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSyncing]);

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

  // Reads the current number of queued submissions from IndexedDB.
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
    } catch {
      // IndexedDB not available
    }
  }, []);

  useEffect(() => {
    void refreshPendingCount();
  }, [refreshPendingCount]);

  // Clears the last sync result from state (used to dismiss sync banners).
  const clearLastSyncResult = useCallback(() => setLastSyncResult(null), []);

  return {
    isOffline,
    pendingCount,
    isSyncing,
    trySync,
    refreshPendingCount,
    lastSyncResult,
    clearLastSyncResult,
  };
}
