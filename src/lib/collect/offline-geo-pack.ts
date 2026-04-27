/**
 * Functions for storing and managing offline geo location data for the Collect form.
 *
 * Each "geo pack" contains a local copy of the locations (LGAs, wards, polling units)
 * for one campaign. We download this data ahead of time so users can select locations
 * later without needing internet.
 *
 * Each campaign has its own pack saved separately in the browser's IndexedDB (see `offline-storage.ts`).
 * Saving always fully replaces the existing pack, so an incomplete download will not overwrite a good pack.
 */

import type { GeoLga, GeoPollingUnit, GeoWard } from "@/types/collect";
import { GEO_PACKS_STORE, openOfflineDb } from "@/lib/collect/offline-storage";

export type OfflineGeoPack = {
  campaignSlug: string;
  campaignUpdatedAt: string;
  preparedAt: string;
  preparedLgaIds: number[];
  lgas: GeoLga[];
  wardsByLgaId: Record<number, GeoWard[]>;
  pollingUnitsByWardId: Record<number, GeoPollingUnit[]>;
};

// Get the geo pack for a campaign from the offline storage.
// Returns: the pack object, or null if not found.
export async function getOfflineGeoPack(
  campaignSlug: string,
): Promise<OfflineGeoPack | null> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(GEO_PACKS_STORE, "readonly");
    const request = tx.objectStore(GEO_PACKS_STORE).get(campaignSlug);
    request.onsuccess = () => {
      const result = request.result as OfflineGeoPack | undefined;
      resolve(result ?? null);
    };
    request.onerror = () => reject(request.error);
  });
}

// Save (replace) the geo pack for a campaign in offline storage.
// If a pack already exists, it will be fully replaced.
export async function saveOfflineGeoPack(pack: OfflineGeoPack): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(GEO_PACKS_STORE, "readwrite");
    tx.objectStore(GEO_PACKS_STORE).put(pack);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Remove the geo pack for a campaign from offline storage.
export async function clearOfflineGeoPack(campaignSlug: string): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(GEO_PACKS_STORE, "readwrite");
    tx.objectStore(GEO_PACKS_STORE).delete(campaignSlug);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
