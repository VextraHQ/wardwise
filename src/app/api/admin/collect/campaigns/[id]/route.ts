import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { updateCampaignSchema } from "@/lib/schemas/collect-schemas";
import { logAudit } from "@/lib/audit";
import { positionRequiresLgas } from "@/lib/utils/constituency";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { _count: { select: { submissions: true } } },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      campaign: {
        ...campaign,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { error, session } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const d = parsed.data;

    const currentCampaign = await prisma.campaign.findUnique({
      where: { id },
      select: { candidateId: true },
    });
    if (!currentCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: currentCampaign.candidateId },
      select: { position: true, constituencyLgaIds: true },
    });
    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    // Guard: one active campaign per candidate when activating
    if (d.status === "active") {
      const existingActive = await prisma.campaign.findFirst({
        where: {
          candidateId: currentCampaign.candidateId,
          status: "active",
          id: { not: id },
        },
        select: { slug: true },
      });
      if (existingActive) {
        return NextResponse.json(
          {
            error: `This candidate already has an active campaign (${existingActive.slug}). Close or pause it first.`,
          },
          { status: 409 },
        );
      }
    }

    if (
      d.enabledLgaIds !== undefined &&
      positionRequiresLgas(candidate.position)
    ) {
      if (d.enabledLgaIds.length === 0) {
        return NextResponse.json(
          {
            error:
              "Constituency campaigns must keep at least one enabled LGA. Turn off restriction to inherit the full constituency.",
          },
          { status: 400 },
        );
      }

      const isSubset = d.enabledLgaIds.every((lgaId) =>
        candidate.constituencyLgaIds.includes(lgaId),
      );
      if (!isSubset) {
        return NextResponse.json(
          {
            error:
              "Enabled LGAs must be a subset of the candidate's constituency LGAs",
          },
          { status: 400 },
        );
      }
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...(d.slug !== undefined && { slug: d.slug }),
        ...(d.enabledLgaIds !== undefined && {
          enabledLgaIds: d.enabledLgaIds,
        }),
        ...(d.customQuestion1 !== undefined && {
          customQuestion1: d.customQuestion1 || null,
        }),
        ...(d.customQuestion2 !== undefined && {
          customQuestion2: d.customQuestion2 || null,
        }),
        ...(d.status !== undefined && { status: d.status }),
      },
    });

    void logAudit("campaign.update", "campaign", id, session!.user.id, {
      changedFields: Object.keys(d).filter(
        (k) => d[k as keyof typeof d] !== undefined,
      ),
    });

    return NextResponse.json({
      campaign: {
        ...campaign,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A campaign with this slug already exists" },
          { status: 409 },
        );
      }
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 },
        );
      }
    }
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { error, session } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    await prisma.campaign.delete({ where: { id } });

    void logAudit("campaign.delete", "campaign", id, session!.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
