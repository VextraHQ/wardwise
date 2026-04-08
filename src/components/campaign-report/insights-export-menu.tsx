"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  IconChevronDown,
  IconFileExport,
  IconFileTypeCsv,
  IconFileTypeXls,
  IconLoader2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ExportFormat } from "@/lib/exports/shared";
import { campaignReportApi } from "@/lib/api/campaign-report";
import {
  getOrderedExportFormats,
  readPreferredExportFormat,
  writePreferredExportFormat,
} from "@/lib/exports/client-preferences";

const exportFormatMeta = {
  csv: { label: "CSV", icon: IconFileTypeCsv },
  xlsx: { label: "Excel", icon: IconFileTypeXls },
} satisfies Record<
  ExportFormat,
  { label: string; icon: React.ComponentType<{ className?: string }> }
>;

function parseFilenameFromDisposition(
  disposition: string | null,
): string | undefined {
  if (!disposition) return undefined;
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
  const basicMatch = disposition.match(/filename="?([^"]+)"?/i);
  return basicMatch?.[1];
}

export function InsightsExportMenu({
  token,
  disabled,
  className,
  query,
}: {
  token: string;
  disabled?: boolean;
  className?: string;
  query?: {
    search?: string;
    status?: string;
  };
}) {
  const [downloading, setDownloading] = useState(false);
  const [preferredFormat, setPreferredFormat] = useState<ExportFormat>(() =>
    readPreferredExportFormat(),
  );

  const orderedFormats = useMemo(
    () => getOrderedExportFormats(preferredFormat),
    [preferredFormat],
  );

  const handleExport = async ({
    format,
    redacted = false,
  }: {
    format: ExportFormat;
    redacted?: boolean;
  }) => {
    setDownloading(true);
    try {
      const response = await fetch(
        campaignReportApi.exportUrl(token, {
          format,
          redacted,
          search: query?.search?.trim() || undefined,
          status: query?.status !== "all" ? query?.status : undefined,
        }),
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        parseFilenameFromDisposition(
          response.headers.get("Content-Disposition"),
        ) || `campaign-insights.${format}`;
      anchor.click();
      URL.revokeObjectURL(url);

      writePreferredExportFormat(format);
      setPreferredFormat(format);
      toast.success(
        `${redacted ? "Redacted " : ""}${exportFormatMeta[format].label} export downloaded`,
      );
    } catch {
      toast.error("Export failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || downloading}
          className={className}
        >
          {downloading ? (
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <IconFileExport className="mr-2 h-4 w-4" />
          )}
          {downloading ? "Exporting..." : "Export"}
          {!downloading && <IconChevronDown className="ml-1 h-3 w-3" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
          Last Used: {exportFormatMeta[preferredFormat].label}
        </DropdownMenuLabel>
        {orderedFormats.map((format) => {
          const Icon = exportFormatMeta[format].icon;
          return (
            <DropdownMenuItem
              key={format}
              onClick={() => handleExport({ format })}
            >
              <Icon className="mr-2 h-4 w-4" />
              Export {exportFormatMeta[format].label}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        {orderedFormats.map((format) => {
          const Icon = exportFormatMeta[format].icon;
          return (
            <DropdownMenuItem
              key={`redacted-${format}`}
              onClick={() => handleExport({ format, redacted: true })}
            >
              <Icon className="mr-2 h-4 w-4" />
              Export Redacted {exportFormatMeta[format].label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
