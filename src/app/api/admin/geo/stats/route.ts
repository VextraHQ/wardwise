import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";
import { nigeriaStates, getLGAsByState } from "@/lib/data/state-lga-locations";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    // Efficient single query to get counts grouped by stateCode
    const stateCounts = await prisma.$queryRaw<
      {
        stateCode: string;
        lgaCount: bigint;
        wardCount: bigint;
        puCount: bigint;
      }[]
    >`
      SELECT l."stateCode",
        COUNT(DISTINCT l.id) as "lgaCount",
        COUNT(DISTINCT w.id) as "wardCount",
        COUNT(DISTINCT pu.id) as "puCount"
      FROM "Lga" l
      LEFT JOIN "Ward" w ON w."lgaId" = l.id
      LEFT JOIN "PollingUnit" pu ON pu."wardId" = w.id
      GROUP BY l."stateCode"
    `;

    const countsByState = new Map(
      stateCounts.map((row) => [
        row.stateCode,
        {
          lgaCount: Number(row.lgaCount),
          wardCount: Number(row.wardCount),
          puCount: Number(row.puCount),
        },
      ]),
    );

    let totalLgas = 0;
    let totalWards = 0;
    let totalPollingUnits = 0;
    let statesSeeded = 0;

    const byState = nigeriaStates.map((state) => {
      const counts = countsByState.get(state.code);
      const lgaCount = counts?.lgaCount ?? 0;
      const wardCount = counts?.wardCount ?? 0;
      const puCount = counts?.puCount ?? 0;
      const expectedLgas = getLGAsByState(state.code).length;

      if (lgaCount > 0) statesSeeded++;
      totalLgas += lgaCount;
      totalWards += wardCount;
      totalPollingUnits += puCount;

      return {
        stateCode: state.code,
        lgasSeeded: lgaCount,
        lgasExpected: expectedLgas,
        totalWards: wardCount,
        totalPUs: puCount,
      };
    });

    return NextResponse.json({
      stats: {
        statesSeeded,
        totalLgas,
        totalWards,
        totalPollingUnits,
        byState,
      },
    });
  } catch (error) {
    console.error("Error fetching geo stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
