import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/core/prisma";

export async function GET(request: NextRequest) {
  try {
    const lgaIdParam = request.nextUrl.searchParams.get("lgaId");
    if (!lgaIdParam) {
      return NextResponse.json({ error: "lgaId is required" }, { status: 400 });
    }

    const lgaId = parseInt(lgaIdParam, 10);
    if (isNaN(lgaId)) {
      return NextResponse.json({ error: "Invalid lgaId" }, { status: 400 });
    }

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
