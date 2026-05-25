import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/lib/guards";
import { prisma } from "@/lib/core/prisma";
import { Prisma } from "@prisma/client";
import { logAudit } from "@/lib/core/audit";
import { z } from "zod";

type RouteParams = { params: Promise<{ id: string }> };

const linkSchema = z.object({
  manualName: z.string().min(1),
  manualPhone: z.string().nullable(),
  canvasserId: z.string().min(1),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { error, user } = await requireAdmin();
    if (error) return error;

    const { id: campaignId } = await params;
    const body = await request.json();
    const parsed = linkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { manualName, manualPhone, canvasserId } = parsed.data;

    // Validate the target canvasser belongs to this campaign
    const canvasser = await prisma.campaignCanvasser.findFirst({
      where: { id: canvasserId, campaignId },
      select: { id: true, name: true },
    });
    if (!canvasser) {
      return NextResponse.json({ error: "Canvasser not found" }, { status: 404 });
    }

    // Link all matching manual submissions to the stable canvasser record.
    // Match on exact (canvasserName, canvasserPhone) — phone can be null.
    // Keep canvasserName/canvasserPhone snapshots unchanged.
    const result = await prisma.collectSubmission.updateMany({
      where: {
        campaignId,
        campaignCanvasserId: null,
        canvasserName: manualName,
        canvasserPhone: manualPhone,
      },
      data: { campaignCanvasserId: canvasserId },
    });

    void logAudit("canvasser.link", "campaignCanvasser", canvasserId, user!.id, {
      campaignId,
      manualName,
      linkedCount: result.count,
    });

    return NextResponse.json({ linkedCount: result.count });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Canvasser not found" }, { status: 404 });
    }
    console.error("Error linking submissions to canvasser:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
