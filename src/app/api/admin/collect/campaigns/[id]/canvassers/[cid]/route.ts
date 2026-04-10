import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";
import { Prisma } from "@prisma/client";
import { logAudit } from "@/lib/core/audit";

type RouteParams = { params: Promise<{ id: string; cid: string }> };

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { error, user } = await requireAdmin();
    if (error) return error;

    const { id, cid } = await params;

    await prisma.campaignCanvasser.delete({
      where: { id: cid, campaignId: id },
    });

    void logAudit("canvasser.remove", "campaignCanvasser", cid, user!.id, {
      campaignId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Canvasser not found" },
        { status: 404 },
      );
    }
    console.error("Error removing canvasser:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
