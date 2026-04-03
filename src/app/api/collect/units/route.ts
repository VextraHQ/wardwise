import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const wardIdParam = request.nextUrl.searchParams.get("wardId");
    if (!wardIdParam) {
      return NextResponse.json(
        { error: "wardId is required" },
        { status: 400 },
      );
    }

    const wardId = parseInt(wardIdParam, 10);
    if (isNaN(wardId)) {
      return NextResponse.json({ error: "Invalid wardId" }, { status: 400 });
    }

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
