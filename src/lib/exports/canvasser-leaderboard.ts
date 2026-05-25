import { prisma } from "@/lib/core/prisma";
import {
  buildExportFilename,
  formatExportDateTime,
  sanitizeSpreadsheetText,
  type ExportTable,
} from "@/lib/exports/shared";

export type CanvasserLeaderboardFilters = {
  search?: string;
  type?: "known" | "manual";
};

export async function buildCanvasserLeaderboardExportTable(
  campaignId: string,
  filters: CanvasserLeaderboardFilters = {},
): Promise<ExportTable | null> {
  const [campaign, knownStats, manualStats] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { slug: true },
    }),
    // Known: group by stable campaignCanvasserId
    prisma.$queryRaw<
      {
        campaignCanvasserId: string;
        total: bigint;
        verified: bigint;
        flagged: bigint;
        lastActive: Date | null;
      }[]
    >`
      SELECT
        "campaignCanvasserId",
        COUNT(*)::bigint as total,
        COUNT(*) FILTER (WHERE "isVerified" = true)::bigint as verified,
        COUNT(*) FILTER (WHERE "isFlagged" = true)::bigint as flagged,
        MAX("createdAt") as "lastActive"
      FROM "CollectSubmission"
      WHERE "campaignId" = ${campaignId}
        AND "campaignCanvasserId" IS NOT NULL
      GROUP BY "campaignCanvasserId"
      ORDER BY total DESC
    `,
    // Manual: no stable link
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
        AND "campaignCanvasserId" IS NULL
        AND "canvasserName" IS NOT NULL
        AND "canvasserName" != ''
      GROUP BY "canvasserName", "canvasserPhone"
      ORDER BY total DESC
    `,
  ]);

  if (!campaign) {
    return null;
  }

  // Resolve names for known entries
  const knownIds = knownStats.map((r) => r.campaignCanvasserId);
  const canvasserRecords =
    knownIds.length > 0
      ? await prisma.campaignCanvasser.findMany({
          where: { id: { in: knownIds } },
          select: { id: true, name: true, phone: true },
        })
      : [];
  const canvasserMap = new Map(canvasserRecords.map((c) => [c.id, c]));

  type Row = {
    type: string;
    name: string;
    phone: string;
    total: number;
    verified: number;
    flagged: number;
    lastActive: string;
  };

  const allRows: Row[] = [
    ...knownStats.map((r) => ({
      type: "Known",
      name: canvasserMap.get(r.campaignCanvasserId)?.name ?? "Unknown",
      phone: canvasserMap.get(r.campaignCanvasserId)?.phone ?? "",
      total: Number(r.total),
      verified: Number(r.verified),
      flagged: Number(r.flagged),
      lastActive: formatExportDateTime(r.lastActive),
    })),
    ...manualStats.map((r) => ({
      type: "Manual",
      name: r.canvasserName,
      phone: r.canvasserPhone ?? "",
      total: Number(r.total),
      verified: Number(r.verified),
      flagged: Number(r.flagged),
      lastActive: formatExportDateTime(r.lastActive),
    })),
  ].sort((a, b) => b.total - a.total);

  const searchQuery = filters.search?.trim().toLowerCase();
  const typeFiltered = filters.type
    ? allRows.filter((row) =>
        filters.type === "known" ? row.type === "Known" : row.type === "Manual",
      )
    : allRows;
  const filtered = searchQuery
    ? typeFiltered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery) ||
          r.phone.toLowerCase().includes(searchQuery),
      )
    : typeFiltered;

  const rows = filtered.map((r, index) => [
    index + 1,
    sanitizeSpreadsheetText(r.name),
    sanitizeSpreadsheetText(r.phone),
    r.total,
    r.total > 0 ? Math.round((r.verified / r.total) * 100) : 0,
    r.total > 0 ? Math.round((r.flagged / r.total) * 100) : 0,
    sanitizeSpreadsheetText(r.lastActive),
    r.type,
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
      "Type",
    ],
    rows,
  };
}
