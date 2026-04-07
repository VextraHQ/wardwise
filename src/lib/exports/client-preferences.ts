import type { ExportFormat } from "./shared";

const EXPORT_FORMAT_STORAGE_KEY = "wardwise-admin-export-format";

export function readPreferredExportFormat(): ExportFormat {
  if (typeof window === "undefined") return "csv";

  const saved = window.localStorage.getItem(EXPORT_FORMAT_STORAGE_KEY);
  return saved === "xlsx" ? "xlsx" : "csv";
}

export function writePreferredExportFormat(format: ExportFormat): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EXPORT_FORMAT_STORAGE_KEY, format);
}

export function getOrderedExportFormats(
  preferredFormat: ExportFormat,
): ExportFormat[] {
  return preferredFormat === "xlsx" ? ["xlsx", "csv"] : ["csv", "xlsx"];
}
