import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import type { Candidate } from "@/types/candidate";
import { createCandidateSchema } from "@/lib/schemas/admin-schemas";
import { logAudit } from "@/lib/audit";
import { sanitizeCandidateConstituencyLgaIds } from "@/lib/utils/constituency-server";

// Generate a readable password like WARD-7842-BETA
function generateReadablePassword(): string {
  const words = [
    "WARD",
    "VOTE",
    "POLL",
    "TEAM",
    "SAFE",
    "CORE",
    "LINK",
    "PEAK",
    "DATA",
    "PLAN",
  ];
  const w1 = words[crypto.randomInt(words.length)];
  const w2 = words[crypto.randomInt(words.length)];
  const digits = String(crypto.randomInt(1000, 9999));
  return `${w1}-${digits}-${w2}`;
}

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
    const { error, session } = await requireAdmin();
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

    const existingUser = await prisma.user.findUnique({ where: { email } });
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

    // Generate readable password
    const generatedPassword = generateReadablePassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 12);

    const candidate = await prisma.candidate.create({
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
      },
    });

    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "candidate",
        candidateId: candidate.id,
      },
    });

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

    void logAudit(
      "candidate.create",
      "candidate",
      candidate.id,
      session!.user.id,
      {
        candidateName: name,
        email,
        position,
      },
    );

    return NextResponse.json({
      candidate: transformCandidate(candidateWithUser),
      generatedPassword, // One-time only — never stored in plaintext
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
