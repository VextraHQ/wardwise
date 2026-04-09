import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a short human-readable reference code from a submission UUID */
export function generateRefCode(submissionId: string): string {
  return `WW-${submissionId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function parseRefCodePrefix(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = trimmed.toUpperCase().replace(/\s+/g, "");
  const withoutPrefix = normalized.startsWith("WW-")
    ? normalized.slice(3)
    : normalized.startsWith("WW")
      ? normalized.slice(2)
      : normalized;
  const prefix = withoutPrefix.replace(/[^A-F0-9]/g, "");

  return prefix.length === 8 ? prefix.toLowerCase() : null;
}

export function composeFullName(parts: {
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
}) {
  return [parts.firstName, parts.middleName, parts.lastName]
    .map((part) => part?.trim() || "")
    .filter(Boolean)
    .join(" ");
}
