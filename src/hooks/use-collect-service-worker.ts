/**
 * Service-worker lifecycle hook for the Collect flow.
 *
 * • Dev  → unregisters any existing SW and clears all wardwise-collect-* caches
 *          so hot-reload never serves stale assets.
 * • Prod → cleans up any legacy root-scoped SW, then registers /sw.js scoped
 *          to /c/ with updateViaCache:"none" and forces an immediate update check.
 */

import { useEffect } from "react";

export function useCollectServiceWorker(): void {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const clearCollectCaches = async () => {
      if (!("caches" in window)) return;
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("wardwise-collect-"))
          .map((key) => caches.delete(key)),
      );
    };

    const getCollectRegistrations = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      return registrations.filter((registration) =>
        [
          registration.active?.scriptURL,
          registration.waiting?.scriptURL,
          registration.installing?.scriptURL,
        ].some((url) => url?.includes("/sw.js")),
      );
    };

    // Dev: tear down SW entirely so hot-reload works
    if (process.env.NODE_ENV !== "production") {
      getCollectRegistrations()
        .then((registrations) =>
          Promise.all(
            registrations.map((registration) => registration.unregister()),
          ),
        )
        .then(() => clearCollectCaches())
        .catch(() => {
          // Cleanup failed — non-critical in dev
        });
      return;
    }

    // Prod: migrate away from legacy root-scope SW, then register scoped
    getCollectRegistrations()
      .then((registrations) => {
        const legacyRootRegistrations = registrations.filter((registration) => {
          try {
            return new URL(registration.scope).pathname === "/";
          } catch {
            return false;
          }
        });

        if (legacyRootRegistrations.length === 0) {
          return null;
        }

        return Promise.all(
          legacyRootRegistrations.map((registration) =>
            registration.unregister(),
          ),
        ).then(() => clearCollectCaches());
      })
      .then(() =>
        navigator.serviceWorker.register("/sw.js", {
          scope: "/c/",
          updateViaCache: "none",
        }),
      )
      .then((registration) => registration.update())
      .catch(() => {
        // SW registration failed — non-critical
      });
  }, []);
}
