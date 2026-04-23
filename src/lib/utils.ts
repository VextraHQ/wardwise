import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a short human-readable reference code from a submission UUID */
export function generateRefCode(submissionId: string): string {
  return `WW-${submissionId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

/** Parse a reference code prefix from a string */
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

/** Compose a full name from parts */
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

/** Set of uppercase tokens that should be kept as is */
const PERSON_NAME_UPPERCASE_TOKENS = new Set([
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "HRH",
  "HRM",
  "SAN",
  "JP",
  "MFR",
  "OON",
  "OFR",
  "CON",
  "GCFR",
  "GCON",
  "MON",
  "CFR",
]);

/** Set of lowercase particles that should be kept as is */
const PERSON_NAME_LOWERCASE_PARTICLES = new Set([
  "bin",
  "bint",
  "ibn",
  "al",
  "el",
  "de",
  "la",
  "le",
  "da",
  "di",
  "du",
  "van",
  "von",
  "der",
  "den",
]);

/** Regular expression to match Mc/Mac prefixes */
const MC_MAC_PREFIX_RE = /^(mc|mac)([a-z])(.*)$/i;

/** Format a person name chunk */
function formatPersonNameChunk(chunk: string): string {
  if (!chunk) return chunk;

  if (PERSON_NAME_UPPERCASE_TOKENS.has(chunk.toUpperCase())) {
    return chunk.toUpperCase();
  }

  const mcMatch = chunk.match(MC_MAC_PREFIX_RE);
  if (mcMatch) {
    const [, prefix, firstLetter, rest] = mcMatch;
    const capitalizedPrefix =
      prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase();
    return `${capitalizedPrefix}${firstLetter.toUpperCase()}${rest.toLowerCase()}`;
  }

  const lower = chunk.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** Format a person name word */
function formatPersonNameWord(word: string, isFirstWord: boolean): string {
  if (!word) return word;

  if (!isFirstWord && PERSON_NAME_LOWERCASE_PARTICLES.has(word.toLowerCase())) {
    return word.toLowerCase();
  }

  return word
    .split(/([-'])/)
    .map((part) => {
      if (part === "-" || part === "'") return part;
      return formatPersonNameChunk(part);
    })
    .join("");
}

/**
 * Formats a person's name for display while leaving stored values untouched.
 * Handles ALL CAPS, lower case, mixed entries, hyphens, apostrophes,
 * Mc/Mac prefixes, lowercase particles (bin, de, van), and uppercase
 * suffix/honorific tokens (II, HRH, SAN).
 */
export function formatPersonName(name: string | null | undefined): string {
  if (!name) return "";

  return name
    .trim()
    .split(/\s+/)
    .map((word, index) => formatPersonNameWord(word, index === 0))
    .join(" ");
}
