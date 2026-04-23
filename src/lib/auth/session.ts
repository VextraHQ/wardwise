const HOUR_MS = 60 * 60 * 1000; // 1 hour
const DAY_MS = 24 * HOUR_MS; // 1 day

export const STANDARD_SESSION_MAX_AGE_MS = 12 * HOUR_MS; // 12 hours
export const REMEMBERED_SESSION_MAX_AGE_MS = 30 * DAY_MS; // 30 days
export const SESSION_REVALIDATION_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

type SessionLike = {
  loginAt?: number | string | null;
  rememberMe?: boolean | string | null;
};

function parseBoolean(value: SessionLike["rememberMe"]): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true";
  return false;
}

function parseNumber(value: SessionLike["loginAt"]): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** Gets the session lifetime in milliseconds */
export function getSessionLifetimeMs(rememberMe?: boolean | string | null) {
  return parseBoolean(rememberMe)
    ? REMEMBERED_SESSION_MAX_AGE_MS
    : STANDARD_SESSION_MAX_AGE_MS;
}

/** Checks if a session is within its lifetime (based on login time) */
export function isSessionWithinLifetime(session: SessionLike): boolean {
  const loginAt = parseNumber(session.loginAt);

  if (!loginAt) {
    return false;
  }

  return Date.now() - loginAt <= getSessionLifetimeMs(session.rememberMe);
}

/** Checks if a session is due for refresh after a certain time */
export function isSessionDueForRefresh(
  lastValidatedAt?: number | string | null,
) {
  const parsed = parseNumber(lastValidatedAt);

  if (!parsed) {
    return true;
  }

  return Date.now() - parsed >= SESSION_REVALIDATION_WINDOW_MS;
}
