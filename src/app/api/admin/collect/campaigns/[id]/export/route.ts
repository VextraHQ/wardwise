import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { renderCsv } from "@/lib/exports/csv";
import {
  buildAttachmentFilename,
  getExportContentType,
  parseExportFormat,
} from "@/lib/exports/shared";
import { buildSubmissionsExportTable } from "@/lib/exports/submissions";
import { parseSubmissionFilters } from "@/lib/collect/submission-query";
import { renderXlsx } from "@/lib/exports/xlsx";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const format = parseExportFormat(
      request.nextUrl.searchParams.get("format"),
    );
    const redacted = request.nextUrl.searchParams.get("redacted") === "true";
    const filters = parseSubmissionFilters(request.nextUrl.searchParams);

    const table = await buildSubmissionsExportTable(id, { filters, redacted });
    if (!table) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    const headers = {
      "Content-Type": getExportContentType(format),
      "Content-Disposition": `attachment; filename="${buildAttachmentFilename(table.filenameBase, format)}"`,
    };

    if (format === "xlsx") {
      return new Response(new Blob([renderXlsx(table)]), { headers });
    }

    return new Response(renderCsv(table), { headers });
  } catch (error) {
    console.error("Error exporting submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
