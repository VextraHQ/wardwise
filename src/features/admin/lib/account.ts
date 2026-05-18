import { useEffect } from "react";
import { toast } from "sonner";
import type { UseFormReturn } from "react-hook-form";

import type { AdminAccountActivityItem } from "@/features/admin/api/admin-api";
import { formatRequestIpLabel } from "@/lib/core/ip";

export const PASSWORD_STALE_DAYS = 90;
export const ACCOUNT_DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Africa/Lagos",
};

const ACTIVITY_LABELS: Record<string, string> = {
  "admin.account.login": "Signed in successfully",
  "admin.account.login_failed": "Failed sign-in attempt",
  "admin.account.profile_updated": "Profile updated",
  "admin.account.email_change_requested": "Email change requested",
  "admin.account.email_change_cancelled": "Email change cancelled",
  "admin.account.email_changed": "Email address changed",
  "admin.account.password_changed": "Password changed",
};

export function describeActivity(action: string): string {
  return ACTIVITY_LABELS[action] ?? action;
}

export function passwordAgeDays(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / (24 * 60 * 60 * 1000));
}

export function getActivityContext(
  entry: AdminAccountActivityItem,
): string | null {
  const details =
    entry.details && typeof entry.details === "object" ? entry.details : null;
  if (!details) return null;

  const targetEmail =
    typeof details.targetEmail === "string" ? details.targetEmail : null;
  const newEmail =
    typeof details.newEmail === "string" ? details.newEmail : null;
  const requestIp = formatRequestIpLabel(
    typeof details.requestIp === "string" ? details.requestIp : null,
  );

  if (entry.action === "admin.account.email_change_requested" && targetEmail) {
    return `Confirmation sent to ${targetEmail}`;
  }
  if (entry.action === "admin.account.email_change_cancelled" && targetEmail) {
    return `Pending switch to ${targetEmail} cleared`;
  }
  if (entry.action === "admin.account.email_changed" && newEmail) {
    return `Sign-in email moved to ${newEmail}`;
  }
  if (
    (entry.action === "admin.account.login" ||
      entry.action === "admin.account.login_failed") &&
    requestIp
  ) {
    return `Source: ${requestIp}`;
  }
  return null;
}

export function copyToClipboard(value: string, successMessage: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    toast.error("Clipboard is unavailable in this browser.");
    return;
  }
  navigator.clipboard
    .writeText(value)
    .then(() => toast.success(successMessage))
    .catch(() => toast.error("Could not copy to clipboard."));
}

export function useEditModeForm<T extends Record<string, unknown>>(
  isEditing: boolean,
  form: UseFormReturn<T>,
  firstFieldName: keyof T,
  defaults: T,
) {
  useEffect(() => {
    if (isEditing) {
      form.setFocus(firstFieldName as never);
    } else {
      form.reset(defaults);
    }
    // We intentionally only react to isEditing toggles. `defaults` and `form`
    // are stable for the lifetime of this card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);
}
