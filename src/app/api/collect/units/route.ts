import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/core/prisma";
import { parseRequiredIntegerParam } from "@/lib/server/query-params";

export async function GET(request: NextRequest) {
  try {
    const wardIdResult = parseRequiredIntegerParam(
      request.nextUrl.searchParams,
      "wardId",
      "wardId",
    );
    if ("error" in wardIdResult) {
      return NextResponse.json({ error: wardIdResult.error }, { status: 400 });
    }
    const wardId = wardIdResult.value;

    const pollingUnits = await prisma.pollingUnit.findMany({
      where: { wardId },
      select: { id: true, code: true, name: true, wardId: true },
      orderBy: { code: "asc" },
    });

    return NextResponse.json({
      pollingUnits: pollingUnits.map((pollingUnit) => ({
        ...pollingUnit,
        code: pollingUnit.code ?? "",
      })),
    });
  } catch (error) {
    console.error("Error fetching polling units:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
