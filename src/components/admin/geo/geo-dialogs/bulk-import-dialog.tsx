"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { HiOutlineUpload, HiOutlineDownload } from "react-icons/hi";
import { useGeoImportPreview, useGeoImportCommit } from "@/hooks/use-geo";
import type { ImportRowResult } from "@/types/geo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ImportLevel = "lga" | "ward" | "polling-unit";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: ImportLevel;
}

const LEVEL_LABELS: Record<ImportLevel, string> = {
  lga: "LGAs",
  ward: "Wards",
  "polling-unit": "Polling Units",
};

const CSV_HEADERS: Record<ImportLevel, string[]> = {
  lga: ["name", "stateCode"],
  ward: ["code", "name", "lgaName", "stateCode"],
  "polling-unit": [
    "code",
    "name",
    "wardCode",
    "wardName",
    "lgaName",
    "stateCode",
  ],
};

const IMPORT_NOTES: Partial<Record<ImportLevel, string>> = {
  ward: "Include official ward codes when a ward name is reused inside the same LGA.",
  "polling-unit":
    "Include wardCode whenever the ward name is duplicated inside the same LGA.",
};

function splitCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  values.push(current.trim());
  return values;
}

function parseCSV(text: string): Record<string, string>[] {
  // Strip BOM
  const clean = text.replace(/^\uFEFF/, "");
  const lines = clean.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return [];
  const headers = splitCSVLine(lines[0]).map((h) => h.toLowerCase());
  return lines.slice(1).map((line) => {
    const values = splitCSVLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] || ""]));
  });
}

type DialogState =
  | "idle"
  | "parsing"
  | "previewing"
  | "preview"
  | "importing"
  | "done";

const STATUS_BADGE: Record<
  ImportRowResult["status"],
  { variant: "default" | "secondary" | "destructive"; label: string }
> = {
  valid: { variant: "default", label: "Valid" },
  duplicate: { variant: "secondary", label: "Duplicate" },
  error: { variant: "destructive", label: "Error" },
};

export function BulkImportDialog({
  open,
  onOpenChange,
  level,
}: BulkImportDialogProps) {
  const [state, setState] = useState<DialogState>("idle");
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [previewResults, setPreviewResults] = useState<ImportRowResult[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    valid: 0,
    duplicates: 0,
    errors: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewMutation = useGeoImportPreview();
  const commitMutation = useGeoImportCommit();

  const reset = useCallback(() => {
    setState("idle");
    setRows([]);
    setPreviewResults([]);
    setSummary({ total: 0, valid: 0, duplicates: 0, errors: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) reset();
    onOpenChange(newOpen);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setState("parsing");
    try {
      const text = await file.text();
      const parsed = parseCSV(text);

      if (parsed.length === 0) {
        toast.error("CSV file has no data rows");
        setState("idle");
        return;
      }
      if (parsed.length > 5000) {
        toast.error("Maximum 5,000 rows per import");
        setState("idle");
        return;
      }

      setRows(parsed);
      setState("previewing");

      const result = await previewMutation.mutateAsync({ level, rows: parsed });
      setPreviewResults(result.rows);
      setSummary(result.summary);
      setState("preview");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to parse CSV");
      setState("idle");
    }
  };

  const handleImport = async () => {
    setState("importing");
    try {
      const result = await commitMutation.mutateAsync({ level, rows });
      toast.success(
        `Imported ${result.created} ${LEVEL_LABELS[level].toLowerCase()}, ${result.skipped} skipped`,
      );
      setState("done");
      setTimeout(() => handleOpenChange(false), 1500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
      setState("preview");
    }
  };

  const downloadTemplate = () => {
    const headers = CSV_HEADERS[level];
    const blob = new Blob([headers.join(",") + "\n"], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${level}-import-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = CSV_HEADERS[level].map((h) => h.toLowerCase());

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl rounded-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Import {LEVEL_LABELS[level]}
            <Badge
              variant="outline"
              className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
            >
              CSV
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import {LEVEL_LABELS[level].toLowerCase()}
            .
          </DialogDescription>
        </DialogHeader>

        {IMPORT_NOTES[level] && (
          <p className="text-muted-foreground -mt-2 text-xs">
            {IMPORT_NOTES[level]}
          </p>
        )}

        {(state === "idle" || state === "parsing") && (
          <div className="space-y-4 py-4">
            <div
              className="border-muted-foreground/25 hover:border-muted-foreground/50 flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed p-8 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <HiOutlineUpload className="text-muted-foreground mb-2 h-8 w-8" />
              <p className="text-sm font-medium">
                {state === "parsing" ? "Parsing..." : "Click to upload CSV"}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                .csv files up to 5,000 rows
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
            <button
              type="button"
              onClick={downloadTemplate}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
            >
              <HiOutlineDownload className="h-3.5 w-3.5" />
              Download template
            </button>
          </div>
        )}

        {state === "previewing" && (
          <div className="flex items-center justify-center py-12">
            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="text-muted-foreground text-sm">
              Validating rows...
            </span>
          </div>
        )}

        {(state === "preview" || state === "importing" || state === "done") && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge
                variant="default"
                className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
              >
                {summary.valid} valid
              </Badge>
              {summary.duplicates > 0 && (
                <Badge
                  variant="secondary"
                  className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                >
                  {summary.duplicates} duplicates
                </Badge>
              )}
              {summary.errors > 0 && (
                <Badge
                  variant="destructive"
                  className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                >
                  {summary.errors} errors
                </Badge>
              )}
              <span className="text-muted-foreground ml-auto font-mono text-xs leading-6 tabular-nums">
                {summary.total} total rows
              </span>
            </div>

            <div className="max-h-64 overflow-auto rounded-sm border">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="text-muted-foreground h-10 w-20 font-mono text-[10px] font-bold tracking-widest uppercase">
                      Status
                    </TableHead>
                    {columns.map((col) => (
                      <TableHead
                        key={col}
                        className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase"
                      >
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewResults.map((row, i) => {
                    const badge = STATUS_BADGE[row.status];
                    return (
                      <TableRow key={i}>
                        <TableCell>
                          <Badge
                            variant={badge.variant}
                            className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                          >
                            {badge.label}
                          </Badge>
                        </TableCell>
                        {columns.map((col) => (
                          <TableCell key={col} className="text-xs">
                            {row.data[col] || ""}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {previewResults.some((r) => r.status === "error" && r.message) && (
              <div className="border-destructive/30 bg-destructive/10 text-destructive max-h-24 overflow-auto rounded-sm border p-2 text-xs">
                {previewResults
                  .filter((r) => r.status === "error" && r.message)
                  .slice(0, 10)
                  .map((r, i) => (
                    <p key={i}>
                      Row {previewResults.indexOf(r) + 1}: {r.message}
                    </p>
                  ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {state === "preview" && (
            <>
              <Button
                variant="outline"
                onClick={reset}
                className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
              >
                Upload Different File
              </Button>
              <Button
                onClick={handleImport}
                disabled={summary.valid === 0}
                className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
              >
                Import {summary.valid} Rows
              </Button>
            </>
          )}
          {state === "importing" && (
            <Button
              disabled
              className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
            >
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Importing...
            </Button>
          )}
          {state === "done" && (
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
