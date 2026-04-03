import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a short human-readable reference code from a submission UUID */
export function generateRefCode(submissionId: string): string {
  return `WW-${submissionId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
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
