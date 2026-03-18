import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.candidateName !== undefined && {
          candidateName: body.candidateName,
        }),
        ...(body.candidateTitle !== undefined && {
          candidateTitle: body.candidateTitle || null,
        }),
        ...(body.party !== undefined && { party: body.party }),
        ...(body.constituency !== undefined && {
          constituency: body.constituency,
        }),
        ...(body.constituencyType !== undefined && {
          constituencyType: body.constituencyType,
        }),
        ...(body.enabledLgaIds !== undefined && {
          enabledLgaIds: body.enabledLgaIds,
        }),
        ...(body.requireApcReg !== undefined && {
          requireApcReg: body.requireApcReg,
        }),
        ...(body.requireVoterId !== undefined && {
          requireVoterId: body.requireVoterId,
        }),
        ...(body.customQuestion1 !== undefined && {
          customQuestion1: body.customQuestion1 || null,
        }),
        ...(body.customQuestion2 !== undefined && {
          customQuestion2: body.customQuestion2 || null,
        }),
        ...(body.status !== undefined && { status: body.status }),
      },
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
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Delete submissions first, then campaign
    await prisma.collectSubmission.deleteMany({ where: { campaignId: id } });
    await prisma.campaign.delete({ where: { id } });

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
