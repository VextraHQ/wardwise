import { type NextRequest, NextResponse } from "next/server";
import { validateReportRequest } from "@/lib/server/report-access";
import { logAudit } from "@/lib/core/audit";
import { getClientIp } from "@/lib/core/rate-limit";
import { buildSubmissionsExportTable } from "@/lib/exports/submissions";
import {
  parseExportFormat,
  getExportContentType,
  buildAttachmentFilename,
  parseBooleanParam,
} from "@/lib/exports/shared";
import { renderCsv } from "@/lib/exports/csv";
import { renderXlsx } from "@/lib/exports/xlsx";

type RouteParams = { params: Promise<unknown> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = (await params) as { token: string };
    const { campaign, error } = await validateReportRequest(token, request);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    const format = parseExportFormat(
      request.nextUrl.searchParams.get("format"),
    );
    const redacted =
      parseBooleanParam(request.nextUrl.searchParams.get("redacted")) ?? false;
    const search = request.nextUrl.searchParams.get("search") || undefined;
    const status = request.nextUrl.searchParams.get("status") || "all";
    const role = request.nextUrl.searchParams.get("role") || undefined;

    const filters =
      status === "verified"
        ? { search, role, isVerified: true }
        : status === "flagged"
          ? { search, role, isFlagged: true }
          : status === "pending"
            ? { search, role, isVerified: false, isFlagged: false }
            : { search, role };

    const table = await buildSubmissionsExportTable(campaign.id, {
      filters,
      redacted,
      excludeAdminNotes: true,
    });

    if (!table) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    void logAudit("report.export", "campaign", campaign.id, null, {
      format,
      redacted,
      searchApplied: Boolean(search),
      status,
      ip: getClientIp(request),
    });

    const buffer = format === "xlsx" ? renderXlsx(table) : renderCsv(table);
    const filename = buildAttachmentFilename(table.filenameBase, format);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": getExportContentType(format),
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
