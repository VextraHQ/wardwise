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

export type PendingSubmissionStatus = "pending" | "failed";

export interface PendingSubmission {
  id?: number;
  data: Record<string, unknown>;
  analyticsId?: string;
  createdAt: string;
  // Optional for back-compat with pre-Phase-2 rows; read-side treats missing as "pending".
  status?: PendingSubmissionStatus;
  lastError?: string;
  failedAt?: string;
}

function isFailed(row: PendingSubmission): boolean {
  return row.status === "failed";
}

export async function queueSubmission(
  data: Record<string, unknown>,
  options?: { analyticsId?: string },
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const row: Omit<PendingSubmission, "id"> = {
      data,
      analyticsId: options?.analyticsId,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    tx.objectStore(STORE_NAME).add(row);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getAllRows(): Promise<PendingSubmission[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as PendingSubmission[]);
    request.onerror = () => reject(request.error);
  });
}

/** Rows eligible for sync (pending + legacy rows without a `status` field). */
export async function getPendingSubmissions(): Promise<PendingSubmission[]> {
  const all = await getAllRows();
  return all.filter((row) => !isFailed(row));
}

/** Rows that were permanently rejected by the server and still sit locally for user awareness. */
export async function getFailedSubmissions(): Promise<PendingSubmission[]> {
  const all = await getAllRows();
  return all.filter(isFailed);
}

/** Loads a single failed row by id, or `undefined` if missing or not failed. */
export async function getFailedSubmissionById(
  id: number,
): Promise<PendingSubmission | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(id);
    request.onsuccess = () => {
      const row = request.result as PendingSubmission | undefined;
      if (!row || !isFailed(row)) {
        resolve(undefined);
        return;
      }
      resolve(row);
    };
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

/** Removes every row with status: "failed". Leaves pending rows untouched. */
export async function removeFailedSubmissions(): Promise<number> {
  const failed = await getFailedSubmissions();
  if (failed.length === 0) return 0;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    for (const row of failed) {
      if (typeof row.id === "number") store.delete(row.id);
    }
    tx.oncomplete = () => resolve(failed.length);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingCount(): Promise<number> {
  const rows = await getPendingSubmissions();
  return rows.length;
}

export async function getFailedCount(): Promise<number> {
  const rows = await getFailedSubmissions();
  return rows.length;
}

/**
 * Merge-updates a row in place. Reads the existing record and spreads the patch
 * over it so `data`, `analyticsId`, `createdAt` are never accidentally replaced.
 */
async function updatePendingSubmission(
  id: number,
  patch: Partial<PendingSubmission>,
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const existing = getReq.result as PendingSubmission | undefined;
      if (!existing) return;
      store.put({ ...existing, ...patch, id });
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// HTTP status codes that are permanent failures (no point retrying)
const PERMANENT_FAILURE_CODES = new Set([400, 403, 404, 409, 410, 422]);

/** `synced` = server accepted count; `syncedEntries` = subset with parseable receipt (may be shorter). */
export type SyncResult = {
  synced: number;
  syncedEntries: {
    id: number;
    analyticsId?: string;
    submissionId: string;
    count: number;
  }[];
  failed: { id: number; analyticsId?: string; error: string }[];
};

/** Flush all pending submissions to the server. Returns synced count and permanent failures. */
export async function syncPendingSubmissions(): Promise<SyncResult> {
  // getPendingSubmissions() filters out status === "failed" so failed rows are
  // never retried — they stay visible in IndexedDB for the banner to read.
  const pending = await getPendingSubmissions();
  let synced = 0;
  const syncedEntries: SyncResult["syncedEntries"] = [];
  const failed: { id: number; analyticsId?: string; error: string }[] = [];

  for (const entry of pending) {
    try {
      const response = await fetch("/api/collect/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry.data),
      });
      if (response.ok) {
        const body = (await response.json().catch(() => null)) as {
          submission?: { id?: string };
          count?: number;
        } | null;
        await removePendingSubmission(entry.id!);
        synced++;
        const submissionId = body?.submission?.id;
        if (submissionId && typeof body?.count === "number") {
          syncedEntries.push({
            id: entry.id!,
            analyticsId: entry.analyticsId,
            submissionId: String(submissionId),
            count: body.count,
          });
        }
        // If body parse failed: record is still on server (synced++) but no receipt
        // for UI flip — invariant: syncedEntries.length <= synced.
      } else if (PERMANENT_FAILURE_CODES.has(response.status)) {
        // Permanent failure — keep the row locally with status: "failed" so the
        // canvasser can still see it in the "Needs Attention" banner even after
        // missing the toast or refreshing the page.
        const body = await response.json().catch(() => ({}));
        const error =
          body.error || `Server rejected submission (${response.status})`;
        await updatePendingSubmission(entry.id!, {
          status: "failed",
          lastError: error,
          failedAt: new Date().toISOString(),
        });
        failed.push({ id: entry.id!, analyticsId: entry.analyticsId, error });
      }
      // 5xx / other transient errors: leave in queue for next sync
    } catch {
      // Network error — stop trying remaining entries
      break;
    }
  }

  return { synced, syncedEntries, failed };
}
