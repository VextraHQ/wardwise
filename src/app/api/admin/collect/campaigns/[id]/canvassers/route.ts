import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const results = await prisma.collectSubmission.groupBy({
      by: ["canvasserName", "canvasserPhone"],
      where: {
        campaignId: id,
        canvasserName: { not: null },
        NOT: { canvasserName: "" },
      },
      _count: true,
      orderBy: { _count: { canvasserName: "desc" } },
    });

    const canvassers = results.map((r) => ({
      canvasserName: r.canvasserName || "",
      canvasserPhone: r.canvasserPhone || "",
      _count: r._count,
    }));

    return NextResponse.json({ canvassers });
  } catch (error) {
    console.error("Error fetching canvassers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
