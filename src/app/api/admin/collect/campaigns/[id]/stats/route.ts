import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    // Optional date range filtering
    const sp = request.nextUrl.searchParams;
    const from = sp.get("from");
    const to = sp.get("to");

    // Parse `to` as end-of-day so the selected date is fully included
    const toEndOfDay = to ? new Date(to + "T23:59:59.999Z") : undefined;
    const dateFilter = {
      ...(from && { gte: new Date(from) }),
      ...(toEndOfDay && { lte: toEndOfDay }),
    };
    const hasDateFilter = from || to;

    const baseWhere = {
      campaignId: id,
      ...(hasDateFilter && { createdAt: dateFilter }),
    };

    // Run all aggregations in parallel
    const [totals, dailyRaw, byLga, byWard, byRole, bySex] = await Promise.all([
      // Total, verified, flagged counts
      prisma.collectSubmission
        .aggregate({
          where: baseWhere,
          _count: true,
        })
        .then(async (agg) => {
          const [verified, flagged] = await Promise.all([
            prisma.collectSubmission.count({
              where: { ...baseWhere, isVerified: true },
            }),
            prisma.collectSubmission.count({
              where: { ...baseWhere, isFlagged: true },
            }),
          ]);
          return { total: agg._count, verified, flagged };
        }),

      // Daily submissions (group by date)
      from && toEndOfDay
        ? prisma.$queryRaw<{ date: string; count: bigint }[]>`
            SELECT DATE("createdAt")::text as date, COUNT(*)::bigint as count
            FROM "CollectSubmission"
            WHERE "campaignId" = ${id}
              AND "createdAt" >= ${new Date(from)} AND "createdAt" <= ${toEndOfDay}
            GROUP BY DATE("createdAt") ORDER BY date ASC
          `
        : from
          ? prisma.$queryRaw<{ date: string; count: bigint }[]>`
              SELECT DATE("createdAt")::text as date, COUNT(*)::bigint as count
              FROM "CollectSubmission"
              WHERE "campaignId" = ${id} AND "createdAt" >= ${new Date(from)}
              GROUP BY DATE("createdAt") ORDER BY date ASC
            `
          : toEndOfDay
            ? prisma.$queryRaw<{ date: string; count: bigint }[]>`
                SELECT DATE("createdAt")::text as date, COUNT(*)::bigint as count
                FROM "CollectSubmission"
                WHERE "campaignId" = ${id} AND "createdAt" <= ${toEndOfDay}
                GROUP BY DATE("createdAt") ORDER BY date ASC
              `
            : prisma.$queryRaw<{ date: string; count: bigint }[]>`
                SELECT DATE("createdAt")::text as date, COUNT(*)::bigint as count
                FROM "CollectSubmission"
                WHERE "campaignId" = ${id}
                GROUP BY DATE("createdAt") ORDER BY date ASC
              `,

      // By LGA
      prisma.collectSubmission.groupBy({
        by: ["lgaName"],
        where: baseWhere,
        _count: true,
        orderBy: { _count: { lgaName: "desc" } },
      }),

      // By Ward (top 10)
      prisma.collectSubmission.groupBy({
        by: ["wardName"],
        where: baseWhere,
        _count: true,
        orderBy: { _count: { wardName: "desc" } },
        take: 10,
      }),

      // By Role
      prisma.collectSubmission.groupBy({
        by: ["role"],
        where: baseWhere,
        _count: true,
      }),

      // By Sex
      prisma.collectSubmission.groupBy({
        by: ["sex"],
        where: baseWhere,
        _count: true,
      }),
    ]);

    // Build cumulative from daily
    let cumulative = 0;
    const daily = dailyRaw.map((d) => {
      const count = Number(d.count);
      cumulative += count;
      return { date: d.date, count, cumulative };
    });

    return NextResponse.json({
      total: totals.total,
      verified: totals.verified,
      flagged: totals.flagged,
      daily,
      byLga: byLga.map((g) => ({ lga: g.lgaName, count: g._count })),
      byWard: byWard.map((g) => ({ ward: g.wardName, count: g._count })),
      byRole: byRole.map((g) => ({ role: g.role, count: g._count })),
      bySex: bySex.map((g) => ({ sex: g.sex, count: g._count })),
    });
  } catch (error) {
    console.error("Error fetching campaign stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
