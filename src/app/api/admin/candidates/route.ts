import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";
import { Prisma } from "@prisma/client";
import type { Candidate } from "@/types/candidate";
import { createCandidateSchema } from "@/lib/schemas/admin-schemas";
import { logAudit } from "@/lib/core/audit";
import { sanitizeCandidateConstituencyLgaIds } from "@/lib/geo/constituency-server";
import { issueAuthLink, sendAuthLinkEmail } from "@/lib/auth/links";

// Transform Prisma candidate to API response shape
function transformCandidate(c: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  createdAt: Date;
  updatedAt: Date;
  user?: { createdAt: Date; [key: string]: unknown } | null;
  campaigns?: { _count: { submissions: number } }[];
}) {
  const supporterCount = c.campaigns
    ? c.campaigns.reduce(
        (sum: number, cam: { _count: { submissions: number } }) =>
          sum + cam._count.submissions,
        0,
      )
    : 0;
  return {
    ...c,
    campaigns: undefined, // Don't leak nested campaign data
    position: c.position as Candidate["position"],
    email: (c.user?.email as string) || "",
    supporterCount,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    user: c.user
      ? { ...c.user, createdAt: (c.user.createdAt as Date).toISOString() }
      : null,
  };
}

const CANDIDATE_INCLUDE = {
  user: {
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  },
  campaigns: {
    select: { _count: { select: { submissions: true } } },
  },
} as const;

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const candidates = await prisma.candidate.findMany({
      include: CANDIDATE_INCLUDE,
      orderBy: { createdAt: "desc" },
    });

    const candidatesWithUser = candidates.map(transformCandidate);
    return NextResponse.json({ candidates: candidatesWithUser });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const parsed = createCandidateSchema.safeParse(body);
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
    } = parsed.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    const { ids: sanitizedConstituencyLgaIds, error: constituencyError } =
      await sanitizeCandidateConstituencyLgaIds({
        position,
        stateCode,
        constituencyLgaIds,
      });
    if (constituencyError) {
      return NextResponse.json({ error: constituencyError }, { status: 400 });
    }

    const { candidate, invite } = await prisma.$transaction(async (tx) => {
      const candidate = await tx.candidate.create({
        data: {
          name,
          party,
          position,
          isNational: position === "President",
          stateCode: stateCode || null,
          lga: lga || null,
          constituency: constituency || null,
          constituencyLgaIds: sanitizedConstituencyLgaIds,
          description: description || null,
          phone: phone || null,
          title: title || null,
          onboardingStatus: "credentials_sent",
        },
      });

      const newUser = await tx.user.create({
        data: {
          email,
          name,
          role: "candidate",
          candidateId: candidate.id,
        },
      });

      const invite = await issueAuthLink({
        userId: newUser.id,
        type: "invite",
        createdById: user!.id,
        db: tx,
      });

      return { candidate, newUser, invite };
    });

    let deliveryMethod: "email" | "manual" = "manual";

    try {
      const emailResult = await sendAuthLinkEmail({
        to: email,
        name,
        url: invite.url,
        type: "invite",
        expiresAt: invite.expiresAt,
      });

      deliveryMethod = emailResult.sent ? "email" : "manual";
    } catch {
      deliveryMethod = "manual";
    }

    const candidateWithUser = await prisma.candidate.findUnique({
      where: { id: candidate.id },
      include: CANDIDATE_INCLUDE,
    });

    if (!candidateWithUser) {
      return NextResponse.json(
        { error: "Failed to fetch created candidate" },
        { status: 500 },
      );
    }

    void logAudit("candidate.create", "candidate", candidate.id, user!.id, {
      candidateName: name,
      email,
      position,
      deliveryMethod,
    });

    return NextResponse.json({
      candidate: transformCandidate(candidateWithUser),
      setupUrl: invite.url,
      setupExpiresAt: invite.expiresAt.toISOString(),
      deliveryMethod,
    });
  } catch (error) {
    console.error("Error creating candidate:", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
