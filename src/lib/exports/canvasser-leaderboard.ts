import { prisma } from "@/lib/prisma";
import {
  buildExportFilename,
  sanitizeSpreadsheetText,
  type ExportTable,
} from "./shared";

export type CanvasserLeaderboardFilters = {
  search?: string;
};

export async function buildCanvasserLeaderboardExportTable(
  campaignId: string,
  filters: CanvasserLeaderboardFilters = {},
): Promise<ExportTable | null> {
  const [campaign, canvasserStats] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { slug: true },
    }),
    prisma.$queryRaw<
      {
        canvasserName: string;
        canvasserPhone: string | null;
        total: bigint;
        verified: bigint;
        flagged: bigint;
        lastActive: Date | null;
      }[]
    >`
      SELECT
        "canvasserName",
        "canvasserPhone",
        COUNT(*)::bigint as total,
        COUNT(*) FILTER (WHERE "isVerified" = true)::bigint as verified,
        COUNT(*) FILTER (WHERE "isFlagged" = true)::bigint as flagged,
        MAX("createdAt") as "lastActive"
      FROM "CollectSubmission"
      WHERE "campaignId" = ${campaignId}
        AND "canvasserName" IS NOT NULL
        AND "canvasserName" != ''
      GROUP BY "canvasserName", "canvasserPhone"
      ORDER BY total DESC
    `,
  ]);

  if (!campaign) {
    return null;
  }

  const searchQuery = filters.search?.trim().toLowerCase();
  const summaries = canvasserStats
    .map((row) => ({
      canvasserName: row.canvasserName,
      canvasserPhone: row.canvasserPhone || "",
      total: Number(row.total),
      verified: Number(row.verified),
      flagged: Number(row.flagged),
      lastActive: row.lastActive?.toISOString() || "",
    }))
    .filter((summary) => {
      if (!searchQuery) return true;
      return (
        summary.canvasserName.toLowerCase().includes(searchQuery) ||
        summary.canvasserPhone.toLowerCase().includes(searchQuery)
      );
    });

  const rows = summaries.map((summary, index) => [
    index + 1,
    sanitizeSpreadsheetText(summary.canvasserName),
    sanitizeSpreadsheetText(summary.canvasserPhone),
    summary.total,
    summary.total > 0 ? Math.round((summary.verified / summary.total) * 100) : 0,
    summary.total > 0 ? Math.round((summary.flagged / summary.total) * 100) : 0,
    sanitizeSpreadsheetText(summary.lastActive),
  ]);

  return {
    filenameBase: buildExportFilename("canvasser-leaderboard", campaign.slug),
    worksheetName: "Canvassers",
    headers: [
      "Rank",
      "Name",
      "Phone",
      "Total",
      "Verified %",
      "Flagged %",
      "Last Active",
    ],
    rows,
  };
}
