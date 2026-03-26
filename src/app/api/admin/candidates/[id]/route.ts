import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
// Custom type for API responses (dates as ISO strings)
import type { Candidate } from "@/types/candidate";

const CANDIDATE_INCLUDE = {
  user: {
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  },
  _count: {
    select: { campaigns: true, canvassers: true },
  },
  campaigns: {
    select: { _count: { select: { submissions: true } } },
  },
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformCandidate(c: any) {
  const supporterCount = c.campaigns
    ? c.campaigns.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sum: number, cam: any) => sum + (cam._count?.submissions ?? 0),
        0,
      )
    : 0;
  return {
    ...c,
    campaigns: undefined,
    position: c.position as Candidate["position"],
    email: c.user?.email || "",
    supporterCount,
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
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      email,
      party,
      position,
      constituency,
      description,
      isNational,
      stateCode,
      lga,
      phone,
      title,
      onboardingStatus,
    } = body;

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
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists && emailExists.candidateId !== id) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 },
        );
      }
    }

    const updateData: Prisma.CandidateUpdateInput = {};
    if (name) updateData.name = name;
    if (party) updateData.party = party;
    if (position) updateData.position = position;
    if (isNational !== undefined) updateData.isNational = isNational;
    if (stateCode !== undefined) updateData.stateCode = stateCode || null;
    if (lga !== undefined) updateData.lga = lga || null;
    if (constituency !== undefined)
      updateData.constituency = constituency || null;
    if (description !== undefined) updateData.description = description || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (title !== undefined) updateData.title = title || null;
    if (onboardingStatus !== undefined)
      updateData.onboardingStatus = onboardingStatus;

    await prisma.candidate.update({ where: { id }, data: updateData });

    if (email) {
      await prisma.user.updateMany({
        where: { candidateId: id },
        data: { email },
      });
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
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const candidate = await prisma.candidate.findUnique({ where: { id } });
    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    await prisma.candidate.delete({ where: { id } });
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
