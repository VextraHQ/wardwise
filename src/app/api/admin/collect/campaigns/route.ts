import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createCampaignSchema } from "@/lib/schemas/collect-schemas";
import { logAudit } from "@/lib/audit";
import {
  positionToConstituencyType,
  positionRequiresLgas,
} from "@/lib/utils/constituency";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const candidateId = request.nextUrl.searchParams.get("candidateId");

    const campaigns = await prisma.campaign.findMany({
      where: candidateId ? { candidateId } : undefined,
      include: {
        _count: { select: { submissions: true } },
        submissions: {
          select: { createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const serialized = campaigns.map((c) => {
      const { submissions, ...rest } = c;
      return {
        ...rest,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        lastSubmissionAt: submissions[0]?.createdAt.toISOString() || null,
      };
    });

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
    const { error, session } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const parsed = createCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Fetch candidate to derive campaign fields
    const candidate = await prisma.candidate.findUnique({
      where: { id: data.candidateId },
    });
    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    // Guard: constituency positions need constituencyLgaIds on candidate
    if (
      positionRequiresLgas(candidate.position) &&
      candidate.constituencyLgaIds.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Please add constituency LGAs to this candidate before creating a campaign.",
        },
        { status: 400 },
      );
    }

    // Guard: one active campaign per candidate
    const existingActive = await prisma.campaign.findFirst({
      where: { candidateId: data.candidateId, status: "active" },
      select: { id: true, slug: true },
    });
    if (existingActive) {
      return NextResponse.json(
        {
          error: `This candidate already has an active campaign (${existingActive.slug}). Close or pause it first.`,
        },
        { status: 409 },
      );
    }

    // Derive fields from candidate
    const constituencyType =
      positionToConstituencyType(candidate.position) ?? "federal";

    // enabledLgaIds: if client sent non-empty array, use it (must be subset); otherwise inherit from candidate
    let enabledLgaIds = candidate.constituencyLgaIds;
    if (data.enabledLgaIds.length > 0) {
      // Validate it's a subset of candidate's constituency LGAs
      const isSubset = data.enabledLgaIds.every((id) =>
        candidate.constituencyLgaIds.includes(id),
      );
      if (!isSubset && candidate.constituencyLgaIds.length > 0) {
        return NextResponse.json(
          {
            error:
              "Enabled LGAs must be a subset of the candidate's constituency LGAs",
          },
          { status: 400 },
        );
      }
      enabledLgaIds = data.enabledLgaIds;
    }

    const campaign = await prisma.campaign.create({
      data: {
        candidateId: data.candidateId,
        slug: data.slug,
        candidateName: candidate.name,
        candidateTitle: candidate.title || null,
        party: candidate.party,
        constituency: candidate.constituency || "",
        constituencyType,
        enabledLgaIds,
        customQuestion1: data.customQuestion1 || null,
        customQuestion2: data.customQuestion2 || null,
      },
    });

    void logAudit(
      "campaign.create",
      "campaign",
      campaign.id,
      session!.user.id,
      {
        slug: data.slug,
        candidateName: candidate.name,
      },
    );

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
