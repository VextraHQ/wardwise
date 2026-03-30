import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
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

    // Run all aggregations in parallel
    const [
      totals,
      dailyRaw,
      byLga,
      byWard,
      byRole,
      bySex,
    ] = await Promise.all([
      // Total, verified, flagged counts
      prisma.collectSubmission.aggregate({
        where: { campaignId: id },
        _count: true,
      }).then(async (agg) => {
        const [verified, flagged] = await Promise.all([
          prisma.collectSubmission.count({
            where: { campaignId: id, isVerified: true },
          }),
          prisma.collectSubmission.count({
            where: { campaignId: id, isFlagged: true },
          }),
        ]);
        return { total: agg._count, verified, flagged };
      }),

      // Daily submissions (group by date)
      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE("createdAt")::text as date, COUNT(*)::bigint as count
        FROM "CollectSubmission"
        WHERE "campaignId" = ${id}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,

      // By LGA
      prisma.collectSubmission.groupBy({
        by: ["lgaName"],
        where: { campaignId: id },
        _count: true,
        orderBy: { _count: { lgaName: "desc" } },
      }),

      // By Ward (top 10)
      prisma.collectSubmission.groupBy({
        by: ["wardName"],
        where: { campaignId: id },
        _count: true,
        orderBy: { _count: { wardName: "desc" } },
        take: 10,
      }),

      // By Role
      prisma.collectSubmission.groupBy({
        by: ["role"],
        where: { campaignId: id },
        _count: true,
      }),

      // By Sex
      prisma.collectSubmission.groupBy({
        by: ["sex"],
        where: { campaignId: id },
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
