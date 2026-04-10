import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";
import { Prisma } from "@prisma/client";

// GET /api/admin/canvassers/[id] - Get canvasser by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const canvasser = await prisma.canvasser.findUnique({
      where: { id },
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
      return NextResponse.json(
        { error: "Canvasser not found" },
        { status: 404 },
      );
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
    console.error("Error fetching canvasser:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/canvassers/[id] - Update canvasser
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const { code, name, phone, candidateId, ward, lga, state } = body;

    // Check if canvasser exists
    const existingCanvasser = await prisma.canvasser.findUnique({
      where: { id },
    });

    if (!existingCanvasser) {
      return NextResponse.json(
        { error: "Canvasser not found" },
        { status: 404 },
      );
    }

    if (code && code !== existingCanvasser.code) {
      const codeExists = await prisma.canvasser.findUnique({ where: { code } });
      if (codeExists) {
        return NextResponse.json(
          { error: "Canvasser code already exists" },
          { status: 400 },
        );
      }
    }

    // Validate candidate exists if candidateId is provided
    if (candidateId) {
      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
      });
      if (!candidate) {
        return NextResponse.json(
          { error: "Invalid candidate" },
          { status: 400 },
        );
      }
    }

    // Update canvasser
    const updatedCanvasser = await prisma.canvasser.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(phone && { phone }),
        ...(candidateId && { candidateId }),
        ...(ward !== undefined && { ward: ward || null }),
        ...(lga !== undefined && { lga: lga || null }),
        ...(state !== undefined && { state: state || null }),
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
      where: { canvasserCode: updatedCanvasser.code },
    });

    return NextResponse.json({
      canvasser: {
        ...updatedCanvasser,
        candidateName: updatedCanvasser.candidate.name,
        votersCount,
        createdAt: updatedCanvasser.createdAt.toISOString(),
        updatedAt: updatedCanvasser.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating canvasser:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Canvasser not found" },
          { status: 404 },
        );
      }
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

// DELETE /api/admin/canvassers/[id] - Delete canvasser
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    // Check if canvasser exists
    const canvasser = await prisma.canvasser.findUnique({
      where: { id },
    });

    if (!canvasser) {
      return NextResponse.json(
        { error: "Canvasser not found" },
        { status: 404 },
      );
    }

    // Delete canvasser (voters relation will be handled by schema - canvasserCode becomes null)
    await prisma.canvasser.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting canvasser:", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Canvasser not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
