import {
  MARITAL_STATUS_OPTIONS,
  OCCUPATION_OPTIONS,
} from "@/lib/constants/voter-options";

/** Capitalizes the first letter of a string */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Converts a string to title case */
export function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

const OCCUPATION_LABELS = new Map(
  OCCUPATION_OPTIONS.flatMap((option) => [
    [option.value.toLowerCase(), option.label],
    [option.label.toLowerCase(), option.label],
  ]),
);

const MARITAL_STATUS_LABELS = new Map(
  MARITAL_STATUS_OPTIONS.map((option) => [
    option.value.toLowerCase(),
    option.label,
  ]),
);

const SEX_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
};

/** Formats a sex value for display */
export function formatSexDisplay(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
  return SEX_LABELS[value.trim().toLowerCase()] ?? titleCase(value.trim());
}

/** Formats a marital status value for display */
export function formatMaritalStatusDisplay(
  value: string | null | undefined,
): string {
  if (!value?.trim()) return "—";
  const trimmed = value.trim();
  return (
    MARITAL_STATUS_LABELS.get(trimmed.toLowerCase()) ?? titleCase(trimmed)
  );
}

/** Formats an occupation value for display */
export function formatOccupationDisplay(
  value: string | null | undefined,
): string {
  if (!value?.trim()) return "—";
  const trimmed = value.trim();
  return OCCUPATION_LABELS.get(trimmed.toLowerCase()) ?? titleCase(trimmed);
}

/** Formats a role name to title case */
export function formatRole(role: string): string {
  return capitalize(role);
}
