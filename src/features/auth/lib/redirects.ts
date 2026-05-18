type AuthRedirectRole = "admin" | "candidate";

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return (
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "http://localhost:3000"
  );
}

function toUrl(value: string) {
  try {
    return new URL(value, getBaseUrl());
  } catch {
    return null;
  }
}

function isAuthRoute(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/forgot-password/") ||
    pathname.startsWith("/reset-password/")
  );
}

export function getDefaultHomePath(role?: string | null) {
  if (role === "admin") return "/admin";
  if (role === "candidate") return "/dashboard";
  return "/login";
}

export function sanitizeAuthCallbackUrl(
  callbackUrl?: string | string[] | null,
) {
  const value = Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl;

  if (!value) return null;

  const url = toUrl(value);
  const baseUrl = toUrl(getBaseUrl());

  if (!url || !baseUrl || url.origin !== baseUrl.origin) {
    return null;
  }

  if (isAuthRoute(url.pathname)) {
    return null;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export function resolvePostLoginRedirect(
  role?: string | null,
  callbackUrl?: string | null,
) {
  const fallback = getDefaultHomePath(role);

  if (!callbackUrl) {
    return fallback;
  }

  const url = toUrl(callbackUrl);
  if (!url) {
    return fallback;
  }

  const isAdminReturn =
    role === "admin" &&
    (url.pathname === "/admin" || url.pathname.startsWith("/admin/"));
  const isCandidateReturn =
    role === "candidate" &&
    (url.pathname === "/dashboard" || url.pathname.startsWith("/dashboard/"));

  return isAdminReturn || isCandidateReturn
    ? `${url.pathname}${url.search}${url.hash}`
    : fallback;
}

export type { AuthRedirectRole };
