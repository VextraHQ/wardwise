import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/admin/voters - Get all voters with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidateId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where = candidateId ? { candidateId } : {};

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
      dateOfBirth: voter.dateOfBirth.toISOString(),
      verifiedAt: voter.verifiedAt?.toISOString() || null,
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
