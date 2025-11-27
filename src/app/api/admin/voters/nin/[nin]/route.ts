import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/admin/voters/nin/[nin] - Get voter by NIN
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nin: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { nin } = await params;
    const voter = await prisma.voter.findUnique({
      where: { nin },
    });

    if (!voter) {
      return NextResponse.json({ voter: null });
    }

    return NextResponse.json({
      voter: {
        ...voter,
        dateOfBirth: voter.dateOfBirth.toISOString(),
        verifiedAt: voter.verifiedAt?.toISOString() || null,
        registrationDate: voter.registrationDate.toISOString(),
        createdAt: voter.createdAt.toISOString(),
        updatedAt: voter.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching voter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
