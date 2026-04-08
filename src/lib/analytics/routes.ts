export type RouteGroup =
  | "marketing"
  | "auth"
  | "legal"
  | "public_collect"
  | "candidate"
  | "admin"
  | "other";

export type RouteName =
  | "home"
  | "login"
  | "forgot_password"
  | "legal_cookies"
  | "legal_privacy"
  | "legal_terms"
  | "legal_contact"
  | "legal_support"
  | "public_collect"
  | "candidate_dashboard"
  | "candidate_supporters"
  | "candidate_analytics"
  | "candidate_wards"
  | "candidate_notifications"
  | "candidate_settings"
  | "candidate_help"
  | "candidate_export"
  | "candidate_messages"
  | "candidate_reports"
  | "candidate_charts"
  | "candidate_pricing"
  | "candidate_other"
  | "admin_dashboard"
  | "admin_candidates"
  | "admin_candidate_detail"
  | "admin_collect"
  | "admin_collect_campaign_detail"
  | "admin_collect_campaign_new"
  | "admin_geo"
  | "admin_other"
  | "other";

export type RouteDescriptor = {
  group: RouteGroup;
  name: RouteName;
};

function normalizePathname(pathname: string | null): string {
  if (!pathname) return "/";
  if (pathname === "/") return pathname;

  return pathname.replace(/\/+$/, "") || "/";
}

export function getAnalyticsRoute(pathname: string | null): RouteDescriptor {
  const normalized = normalizePathname(pathname);

  if (normalized === "/") {
    return { group: "marketing", name: "home" };
  }

  if (normalized === "/login") {
    return { group: "auth", name: "login" };
  }

  if (normalized === "/forgot-password") {
    return { group: "auth", name: "forgot_password" };
  }

  if (normalized === "/cookies") {
    return { group: "legal", name: "legal_cookies" };
  }

  if (normalized === "/privacy") {
    return { group: "legal", name: "legal_privacy" };
  }

  if (normalized === "/terms") {
    return { group: "legal", name: "legal_terms" };
  }

  if (normalized === "/contact") {
    return { group: "legal", name: "legal_contact" };
  }

  if (normalized === "/support") {
    return { group: "legal", name: "legal_support" };
  }

  if (normalized.startsWith("/c/")) {
    return { group: "public_collect", name: "public_collect" };
  }

  if (normalized === "/dashboard") {
    return { group: "candidate", name: "candidate_dashboard" };
  }

  if (normalized === "/dashboard/supporters") {
    return { group: "candidate", name: "candidate_supporters" };
  }

  if (normalized === "/dashboard/analytics") {
    return { group: "candidate", name: "candidate_analytics" };
  }

  if (normalized === "/dashboard/wards") {
    return { group: "candidate", name: "candidate_wards" };
  }

  if (normalized === "/dashboard/notifications") {
    return { group: "candidate", name: "candidate_notifications" };
  }

  if (normalized === "/dashboard/settings") {
    return { group: "candidate", name: "candidate_settings" };
  }

  if (normalized === "/dashboard/help") {
    return { group: "candidate", name: "candidate_help" };
  }

  if (normalized === "/dashboard/export") {
    return { group: "candidate", name: "candidate_export" };
  }

  if (normalized === "/dashboard/messages") {
    return { group: "candidate", name: "candidate_messages" };
  }

  if (normalized === "/dashboard/reports") {
    return { group: "candidate", name: "candidate_reports" };
  }

  if (normalized === "/dashboard/charts") {
    return { group: "candidate", name: "candidate_charts" };
  }

  if (normalized === "/dashboard/pricing") {
    return { group: "candidate", name: "candidate_pricing" };
  }

  if (normalized.startsWith("/dashboard")) {
    return { group: "candidate", name: "candidate_other" };
  }

  if (normalized === "/admin") {
    return { group: "admin", name: "admin_dashboard" };
  }

  if (
    normalized === "/admin/candidates" ||
    normalized === "/admin/candidates/new"
  ) {
    return { group: "admin", name: "admin_candidates" };
  }

  if (/^\/admin\/candidates\/[^/]+$/.test(normalized)) {
    return { group: "admin", name: "admin_candidate_detail" };
  }

  if (normalized === "/admin/collect") {
    return { group: "admin", name: "admin_collect" };
  }

  if (normalized === "/admin/collect/campaigns/new") {
    return { group: "admin", name: "admin_collect_campaign_new" };
  }

  if (/^\/admin\/collect\/campaigns\/[^/]+$/.test(normalized)) {
    return { group: "admin", name: "admin_collect_campaign_detail" };
  }

  if (normalized === "/admin/geo") {
    return { group: "admin", name: "admin_geo" };
  }

  if (normalized.startsWith("/admin")) {
    return { group: "admin", name: "admin_other" };
  }

  return { group: "other", name: "other" };
}
