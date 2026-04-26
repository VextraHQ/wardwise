import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/core/prisma";
import { parseRequiredIntegerParam } from "@/lib/server/query-params";

export async function GET(request: NextRequest) {
  try {
    const lgaIdResult = parseRequiredIntegerParam(
      request.nextUrl.searchParams,
      "lgaId",
      "lgaId",
    );
    if ("error" in lgaIdResult) {
      return NextResponse.json({ error: lgaIdResult.error }, { status: 400 });
    }
    const lgaId = lgaIdResult.value;

    const wards = await prisma.ward.findMany({
      where: { lgaId },
      select: { id: true, code: true, name: true, lgaId: true },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });

    return NextResponse.json({ wards });
  } catch (error) {
    console.error("Error fetching wards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
