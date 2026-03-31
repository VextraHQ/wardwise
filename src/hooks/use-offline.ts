"use client";

import { useState, useEffect, useCallback } from "react";
import { syncPendingSubmissions, getPendingCount } from "@/lib/offline-queue";

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Track online/offline status
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOffline(!navigator.onLine);

    const goOffline = () => setIsOffline(true);
    const goOnline = () => {
      setIsOffline(false);
      // Auto-sync when back online
      void trySync();
    };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh pending count
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

  const trySync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const synced = await syncPendingSubmissions();
      if (synced > 0) {
        await refreshPendingCount();
      }
      return synced;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshPendingCount]);

  return { isOffline, pendingCount, isSyncing, trySync, refreshPendingCount };
}
