import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/lib/guards";
import { prisma } from "@/lib/core/prisma";
import { Prisma } from "@prisma/client";
import { logAudit } from "@/lib/core/audit";
import { addCampaignCanvasserSchema } from "@/features/collect/schemas/collect-schemas";

type RouteParams = { params: Promise<{ id: string; cid: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { error, user } = await requireAdmin();
    if (error) return error;

    const { id, cid } = await params;
    const body = await request.json();
    const parsed = addCampaignCanvasserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const canvasser = await prisma.campaignCanvasser.update({
      where: { id: cid, campaignId: id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        zone: parsed.data.zone || null,
      },
    });

    void logAudit(
      "canvasser.update",
      "campaignCanvasser",
      canvasser.id,
      user!.id,
      {
        campaignId: id,
        name: canvasser.name,
      },
    );

    return NextResponse.json({
      canvasser: {
        ...canvasser,
        createdAt: canvasser.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "A canvasser with this phone number already exists for this campaign",
        },
        { status: 409 },
      );
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Canvasser not found" },
        { status: 404 },
      );
    }
    console.error("Error updating canvasser:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

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
