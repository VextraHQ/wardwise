import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET /api/admin/voters/[id] - Get voter by ID
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
    const voter = await prisma.voter.findUnique({
      where: { id },
    });

    if (!voter) {
      return NextResponse.json({ error: "Voter not found" }, { status: 404 });
    }

    return NextResponse.json({
      voter: {
        ...voter,
        dateOfBirth: voter.dateOfBirth?.toISOString() || null,
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

// DELETE /api/admin/voters/[id] - Delete voter
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

    // Check if voter exists
    const voter = await prisma.voter.findUnique({
      where: { id },
    });

    if (!voter) {
      return NextResponse.json({ error: "Voter not found" }, { status: 404 });
    }

    await prisma.voter.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting voter:", error);

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Voter not found" }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
