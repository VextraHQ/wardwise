const DB_NAME = "wardwise-offline";
const STORE_NAME = "pending-submissions";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface PendingSubmission {
  id?: number;
  data: Record<string, unknown>;
  createdAt: string;
}

export async function queueSubmission(
  data: Record<string, unknown>,
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add({
      data,
      createdAt: new Date().toISOString(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingSubmissions(): Promise<PendingSubmission[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function removePendingSubmission(id: number): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingCount(): Promise<number> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// HTTP status codes that are permanent failures (no point retrying)
const PERMANENT_FAILURE_CODES = new Set([400, 403, 404, 409, 410, 422]);

export type SyncResult = {
  synced: number;
  failed: { id: number; error: string }[];
};

/** Flush all pending submissions to the server. Returns synced count and permanent failures. */
export async function syncPendingSubmissions(): Promise<SyncResult> {
  const pending = await getPendingSubmissions();
  let synced = 0;
  const failed: { id: number; error: string }[] = [];

  for (const entry of pending) {
    try {
      const response = await fetch("/api/collect/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry.data),
      });
      if (response.ok) {
        await removePendingSubmission(entry.id!);
        synced++;
      } else if (PERMANENT_FAILURE_CODES.has(response.status)) {
        // Permanent failure — remove from queue, report to user
        const body = await response.json().catch(() => ({}));
        const error =
          body.error || `Server rejected submission (${response.status})`;
        await removePendingSubmission(entry.id!);
        failed.push({ id: entry.id!, error });
      }
      // 5xx / other transient errors: leave in queue for next sync
    } catch {
      // Network error — stop trying remaining entries
      break;
    }
  }

  return { synced, failed };
}
