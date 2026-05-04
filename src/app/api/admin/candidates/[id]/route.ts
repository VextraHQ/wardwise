import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";
import { Prisma } from "@prisma/client";
import type { Candidate } from "@/types/candidate";
import {
  deleteCandidateSchema,
  updateCandidateSchema,
} from "@/lib/schemas/admin-schemas";
import { logAudit } from "@/lib/core/audit";
import { bumpCandidateSessionVersions } from "@/lib/auth/storage";
import { sanitizeCandidateConstituencyLgaIds } from "@/lib/geo/constituency-server";
import { getPositionStateValidationMessage } from "@/lib/geo/constituency";

const CANDIDATE_INCLUDE = {
  user: {
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  },
  _count: {
    select: { campaigns: true, canvassers: true },
  },
  campaigns: {
    select: {
      slug: true,
      _count: { select: { submissions: true, campaignCanvassers: true } },
    },
  },
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformCandidate(c: any) {
  const campaigns = c.campaigns ?? [];
  const supporterCount = campaigns.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sum: number, cam: any) => sum + (cam._count?.submissions ?? 0),
    0,
  );
  const campaignCanvasserCount = campaigns.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sum: number, cam: any) => sum + (cam._count?.campaignCanvassers ?? 0),
    0,
  );
  const candidateCanvasserCount = c._count?.canvassers ?? 0;
  const campaignCount = c._count?.campaigns ?? campaigns.length;

  return {
    ...c,
    campaigns: undefined,
    position: c.position as Candidate["position"],
    email: c.user?.email || "",
    supporterCount,
    campaignCount,
    deletionImpact: {
      accountEmail: c.user?.email || "",
      campaignCount,
      submissionCount: supporterCount,
      candidateCanvasserCount,
      campaignCanvasserCount,
      canvasserRecordCount: candidateCanvasserCount + campaignCanvasserCount,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      campaignSlugs: campaigns.map((cam: any) => cam.slug).filter(Boolean),
    },
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    user: c.user
      ? { ...c.user, createdAt: c.user.createdAt.toISOString() }
      : null,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: CANDIDATE_INCLUDE,
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      candidate: transformCandidate(candidate),
    });
  } catch (error) {
    console.error("Error fetching candidate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error, user } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCandidateSchema.safeParse({ ...body, id });
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      name,
      email,
      party,
      position,
      constituency,
      constituencyLgaIds,
      description,
      stateCode,
      lga,
      phone,
      title,
      onboardingStatus,
    } = parsed.data;

    const existingCandidate = await prisma.candidate.findUnique({
      where: { id },
    });
    if (!existingCandidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    if (email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          candidateId: true,
        },
      });
      if (emailExists && emailExists.candidateId !== id) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 },
        );
      }
    }

    const nextPosition = position ?? existingCandidate.position;
    const nextStateCode =
      stateCode !== undefined ? stateCode || null : existingCandidate.stateCode;

    // Validate FCT rules against effective position+state (not just payload)
    const fctMessage = getPositionStateValidationMessage(
      nextPosition,
      nextStateCode,
    );
    if (fctMessage) {
      return NextResponse.json({ error: fctMessage }, { status: 400 });
    }

    const nextConstituencyLgaIds =
      constituencyLgaIds !== undefined
        ? constituencyLgaIds
        : existingCandidate.constituencyLgaIds;

    const { ids: sanitizedConstituencyLgaIds, error: constituencyError } =
      await sanitizeCandidateConstituencyLgaIds({
        position: nextPosition,
        stateCode: nextStateCode,
        constituencyLgaIds: nextConstituencyLgaIds,
      });
    if (constituencyError) {
      return NextResponse.json({ error: constituencyError }, { status: 400 });
    }

    const updateData: Prisma.CandidateUpdateInput = {};
    if (name) updateData.name = name;
    if (party) updateData.party = party;
    if (position) {
      updateData.position = position;
      updateData.isNational = position === "President";
    }
    if (stateCode !== undefined) updateData.stateCode = stateCode || null;
    if (lga !== undefined) updateData.lga = lga || null;
    if (constituency !== undefined)
      updateData.constituency = constituency || null;
    if (
      constituencyLgaIds !== undefined ||
      position !== undefined ||
      stateCode !== undefined
    ) {
      updateData.constituencyLgaIds = sanitizedConstituencyLgaIds;
    }
    if (description !== undefined) updateData.description = description || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (title !== undefined) updateData.title = title || null;
    if (onboardingStatus !== undefined)
      updateData.onboardingStatus = onboardingStatus;

    const campaignIdentityData: Prisma.CampaignUpdateManyMutationInput = {};
    if (name !== undefined) campaignIdentityData.candidateName = name;
    if (title !== undefined)
      campaignIdentityData.candidateTitle = title || null;
    if (party !== undefined) campaignIdentityData.party = party;
    if (constituency !== undefined)
      campaignIdentityData.constituency = constituency || "";

    await prisma.$transaction(async (tx) => {
      await tx.candidate.update({ where: { id }, data: updateData });

      if (Object.keys(campaignIdentityData).length > 0) {
        await tx.campaign.updateMany({
          where: { candidateId: id },
          data: campaignIdentityData,
        });
      }
    });

    if (
      onboardingStatus !== undefined &&
      onboardingStatus !== existingCandidate.onboardingStatus
    ) {
      await bumpCandidateSessionVersions(id);
    }

    if (email) {
      const currentUser = await prisma.user.findFirst({
        where: { candidateId: id },
        select: { email: true },
      });
      if (currentUser?.email.toLowerCase() !== email.toLowerCase()) {
        await prisma.user.updateMany({
          where: { candidateId: id },
          data: { email },
        });
        await bumpCandidateSessionVersions(id);
      }
    }

    const candidateWithUser = await prisma.candidate.findUnique({
      where: { id },
      include: CANDIDATE_INCLUDE,
    });

    if (!candidateWithUser) {
      return NextResponse.json(
        { error: "Failed to fetch updated candidate" },
        { status: 500 },
      );
    }

    void logAudit("candidate.update", "candidate", id, user!.id, {
      changedFields: Object.keys(updateData),
    });

    return NextResponse.json({
      candidate: transformCandidate(candidateWithUser),
    });
  } catch (error) {
    console.error("Error updating candidate:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Candidate not found" },
          { status: 404 },
        );
      }
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 },
        );
      }
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error, user } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } },
        _count: { select: { campaigns: true, canvassers: true } },
        campaigns: {
          select: {
            slug: true,
            _count: {
              select: { submissions: true, campaignCanvassers: true },
            },
          },
        },
      },
    });
    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const parsed = deleteCandidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Confirmation email is required",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const expectedEmail = candidate.user?.email?.trim().toLowerCase();
    if (!expectedEmail) {
      return NextResponse.json(
        { error: "Candidate account email is unavailable" },
        { status: 409 },
      );
    }

    if (parsed.data.confirmationEmail !== expectedEmail) {
      return NextResponse.json(
        { error: "Confirmation email does not match this candidate account" },
        { status: 400 },
      );
    }

    const submissionCount = candidate.campaigns.reduce(
      (sum, campaign) => sum + campaign._count.submissions,
      0,
    );
    const campaignCanvasserCount = candidate.campaigns.reduce(
      (sum, campaign) => sum + campaign._count.campaignCanvassers,
      0,
    );

    await prisma.candidate.delete({ where: { id } });

    void logAudit("candidate.delete", "candidate", id, user!.id, {
      candidateName: candidate.name,
      email: expectedEmail,
      campaignCount: candidate._count.campaigns,
      submissionCount,
      candidateCanvasserCount: candidate._count.canvassers,
      campaignCanvasserCount,
      canvasserRecordCount:
        candidate._count.canvassers + campaignCanvasserCount,
      campaignSlugs: candidate.campaigns.map((campaign) => campaign.slug),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
