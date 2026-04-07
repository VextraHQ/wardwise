import type { ExportTable, ExportValue } from "./shared";

function escapeCsvCell(value: ExportValue): string {
  const stringValue = value == null ? "" : String(value);
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function renderCsv(table: ExportTable): string {
  return [table.headers, ...table.rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n");
}
