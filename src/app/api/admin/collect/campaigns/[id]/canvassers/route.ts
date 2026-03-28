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
