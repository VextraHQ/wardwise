import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";
import { Prisma } from "@prisma/client";
import { createCanvasserSchema } from "@/lib/schemas/admin-schemas";

// GET /api/admin/canvassers - Get all canvassers with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidateId");
    const state = searchParams.get("state");
    const lga = searchParams.get("lga");
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);

    // Build where clause for filters
    const where: Prisma.CanvasserWhereInput = {};

    if (candidateId) {
      where.candidateId = candidateId;
    }
    if (state) {
      where.state = state;
    }
    if (lga) {
      where.lga = lga;
    }

    // Fetch canvassers with candidate relation
    const [canvassers, total] = await Promise.all([
      prisma.canvasser.findMany({
        where,
        take: limit,
        skip: offset,
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
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.canvasser.count({ where }),
    ]);

    const canvassersWithCounts = await Promise.all(
      canvassers.map(async (c) => {
        const votersCount = await prisma.voter.count({
          where: { canvasserCode: c.code },
        });
        return {
          ...c,
          candidateName: c.candidate.name,
          votersCount,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        };
      }),
    );

    return NextResponse.json({
      canvassers: canvassersWithCounts,
      total,
    });
  } catch (error) {
    console.error("Error fetching canvassers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/admin/canvassers - Create new canvasser
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const parsed = createCanvasserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { code, name, phone, candidateId, ward, lga, state } = parsed.data;

    const existingCanvasser = await prisma.canvasser.findUnique({
      where: { code },
    });
    if (existingCanvasser) {
      return NextResponse.json(
        { error: "Canvasser code already exists" },
        { status: 400 },
      );
    }

    const canvasser = await prisma.canvasser.create({
      data: {
        code,
        name,
        phone,
        candidateId,
        ward: ward || null,
        lga: lga || null,
        state: state || null,
      },
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
    console.error("Error creating canvasser:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Canvasser code already exists" },
          { status: 400 },
        );
      }
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Invalid candidate" },
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
