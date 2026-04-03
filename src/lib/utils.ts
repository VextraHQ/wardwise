import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a short human-readable reference code from a submission UUID */
export function generateRefCode(submissionId: string): string {
  return `WW-${submissionId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}
