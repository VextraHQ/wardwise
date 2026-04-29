type DateInput = Date | string | number | null | undefined;

const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

const DEFAULT_DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
};

function toValidDate(value: DateInput): Date | null {
  if (value == null) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDisplayDate(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_OPTIONS,
  fallback = "",
): string {
  const date = toValidDate(value);
  if (!date) return fallback;
  return date.toLocaleDateString("en-NG", options);
}

export function formatDisplayDateTime(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATETIME_OPTIONS,
  fallback = "",
): string {
  const date = toValidDate(value);
  if (!date) return fallback;
  return date.toLocaleString("en-NG", options);
}

export function formatRelativeTime(
  value: DateInput,
  options: {
    emptyLabel?: string;
    invalidLabel?: string;
    includeYesterday?: boolean;
    olderDateStyle?: "date" | "months";
    absoluteDateOptions?: Intl.DateTimeFormatOptions;
  } = {},
): string {
  const {
    emptyLabel = "No activity yet",
    invalidLabel = emptyLabel,
    includeYesterday = false,
    olderDateStyle = "date",
    absoluteDateOptions = DEFAULT_DATE_OPTIONS,
  } = options;

  if (value == null) return emptyLabel;

  const date = toValidDate(value);
  if (!date) return invalidLabel;

  const diffMs = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (includeYesterday && days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;

  if (olderDateStyle === "months") {
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  }

  return formatDisplayDate(date, absoluteDateOptions, invalidLabel);
}
