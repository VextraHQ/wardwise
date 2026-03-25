import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const candidateId = request.nextUrl.searchParams.get("candidateId");

    const campaigns = await prisma.campaign.findMany({
      where: candidateId ? { candidateId } : undefined,
      include: { _count: { select: { submissions: true } } },
      orderBy: { createdAt: "desc" },
    });

    const serialized = campaigns.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json({ campaigns: serialized });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      candidateId,
      slug,
      candidateName,
      candidateTitle,
      party,
      constituency,
      constituencyType,
      enabledLgaIds,
      requireApcReg,
      requireVoterId,
      customQuestion1,
      customQuestion2,
    } = body;

    if (
      !candidateId ||
      !slug ||
      !candidateName ||
      !party ||
      !constituency ||
      !constituencyType
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        {
          error:
            "Slug must contain only lowercase letters, numbers, and hyphens",
        },
        { status: 400 },
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        candidateId,
        slug,
        candidateName,
        candidateTitle: candidateTitle || null,
        party,
        constituency,
        constituencyType,
        enabledLgaIds: enabledLgaIds || [],
        requireApcReg: requireApcReg || "optional",
        requireVoterId: requireVoterId || "optional",
        customQuestion1: customQuestion1 || null,
        customQuestion2: customQuestion2 || null,
      },
    });

    return NextResponse.json(
      {
        campaign: {
          ...campaign,
          createdAt: campaign.createdAt.toISOString(),
          updatedAt: campaign.updatedAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A campaign with this slug already exists" },
        { status: 409 },
      );
    }
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
