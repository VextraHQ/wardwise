export type ExportFormat = "csv" | "xlsx";

export type ExportValue = string | number | boolean | null | undefined;

export type ExportTable = {
  filenameBase: string;
  worksheetName: string;
  headers: string[];
  rows: ExportValue[][];
};

function slugifyFilenamePart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildExportFilename(
  ...parts: Array<string | false | null | undefined>
): string {
  const normalized = parts
    .filter((part): part is string => Boolean(part))
    .map(slugifyFilenamePart)
    .filter(Boolean);

  return normalized.join("-") || "export";
}

export function parseExportFormat(value: string | null): ExportFormat {
  return value === "xlsx" ? "xlsx" : "csv";
}

export function getExportContentType(format: ExportFormat): string {
  return format === "xlsx"
    ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    : "text/csv; charset=utf-8";
}

export function buildAttachmentFilename(
  filenameBase: string,
  format: ExportFormat,
): string {
  return `${filenameBase}.${format}`;
}

export function sanitizeSpreadsheetText(
  value: string | null | undefined,
): string {
  if (!value) return "";
  const stringValue = String(value);
  return /^[=+\-@]/.test(stringValue) ? `'${stringValue}` : stringValue;
}

export function formatExportDateTime(date: Date | null | undefined): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function redactName(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((part) =>
      part.length > 1 ? part[0] + "*".repeat(part.length - 1) : part,
    )
    .join(" ");
}

export function redactPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  if (phone.length > 7) {
    return phone.slice(0, 4) + "***" + phone.slice(-4);
  }
  return "***" + phone.slice(-4);
}

export function redactEmail(email: string | null | undefined): string {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local?.[0] || ""}***@${domain}`;
}

export function redactId(value: string | null | undefined): string {
  return value ? "***" : "";
}
