import * as XLSX from "xlsx";
import type { ExportTable } from "@/lib/exports/shared";

export function renderXlsx(table: ExportTable): ArrayBuffer {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([table.headers, ...table.rows]);
  XLSX.utils.book_append_sheet(workbook, worksheet, table.worksheetName);
  return XLSX.write(workbook, { bookType: "xlsx", type: "array" });
}
