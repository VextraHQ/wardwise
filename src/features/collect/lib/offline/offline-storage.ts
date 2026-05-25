/**
 * Opens and upgrades the IndexedDB database used for offline storage.
 *
 * This database has two stores:
 * - "pending-submissions": Stores form/post submissions when offline.
 * - "geo-packs": Stores geographic data packs, organized by campaign.
 *
 * If the database needs to be upgraded (i.e., new version), this function
 * also handles creating the necessary object stores.
 */

const DB_NAME = "wardwise-offline";
const DB_VERSION = 2;

export const PENDING_SUBMISSIONS_STORE = "pending-submissions";
export const GEO_PACKS_STORE = "geo-packs";

/**
 * Opens (and creates if needed) the offline database.
 * Ensures both stores exist, with the right structure, even after upgrades.
 *
 * Returns a Promise that resolves to the IDBDatabase instance.
 */
export function openOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Runs if the database is being created for the first time or needs an upgrade
    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion; // The DB version before upgrade

      // Create the store for pending submissions if it doesn't exist
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains(PENDING_SUBMISSIONS_STORE)) {
          db.createObjectStore(PENDING_SUBMISSIONS_STORE, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      }

      // Create the store for geo packs if it doesn't exist
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains(GEO_PACKS_STORE)) {
          db.createObjectStore(GEO_PACKS_STORE, {
            keyPath: "campaignSlug",
          });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
