import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { type Prisma } from "@prisma/client";

// GET /api/admin/voters - Get all voters with pagination
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidateId");
    const state = searchParams.get("state");
    const lga = searchParams.get("lga");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);

    // Build where clause
    const where: Prisma.VoterWhereInput = {};

    if (candidateId) {
      where.canvasser = {
        candidateId,
      };
    }

    if (state) {
      where.state = state;
    }

    if (lga) {
      where.lga = lga;
    }

    const [voters, total] = await Promise.all([
      prisma.voter.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      prisma.voter.count({ where }),
    ]);

    // Convert dates to ISO strings for JSON serialization
    const votersWithDates = voters.map((voter) => ({
      ...voter,
      dateOfBirth: voter.dateOfBirth?.toISOString() || null,
      registrationDate: voter.registrationDate.toISOString(),
      createdAt: voter.createdAt.toISOString(),
      updatedAt: voter.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      voters: votersWithDates,
      total,
    });
  } catch (error) {
    console.error("Error fetching voters:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
