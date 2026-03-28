import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const lgas = await prisma.lga.findMany({
      select: { id: true, name: true, stateCode: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ lgas });
  } catch (error) {
    console.error("Error fetching LGAs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
