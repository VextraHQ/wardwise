import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/canvassers/code/[code] - Get canvasser by code
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await params;

    if (!code || code.trim() === "") {
      return NextResponse.json(
        { error: "Canvasser code is required" },
        { status: 400 },
      );
    }

    const canvasser = await prisma.canvasser.findUnique({
      where: { code },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            party: true,
            position: true,
          },
        },
      },
    });

    if (!canvasser) {
      return NextResponse.json({ canvasser: null });
    }

    const votersCount = await prisma.voter.count({
      where: { canvasserCode: canvasser.code },
    });

    return NextResponse.json({
      canvasser: {
        ...canvasser,
        candidateName: canvasser.candidate.name,
        votersCount,
        createdAt: canvasser.createdAt.toISOString(),
        updatedAt: canvasser.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching canvasser by code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
