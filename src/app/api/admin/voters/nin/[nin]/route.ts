import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    if (!nin || nin.trim() === "") {
      return NextResponse.json({ error: "NIN is required" }, { status: 400 });
    }

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
    console.error("Error fetching voter by NIN:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
