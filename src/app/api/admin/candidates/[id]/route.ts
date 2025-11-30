import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
// Custom type for API responses (dates as ISO strings)
import type { Candidate } from "@/types/candidate";

/**
 * GET /api/admin/candidates/[id] - Get candidate by ID
 *
 * Type Flow:
 * 1. Prisma query returns Prisma.Candidate (with DateTime objects)
 * 2. Transform to custom Candidate type (with ISO string dates)
 * 3. Return JSON response (custom type is JSON serializable)
 */
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
    // Prisma query - returns Prisma type with Date objects
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    // Transform Prisma type → Custom type for API response
    return NextResponse.json({
      candidate: {
        ...candidate,
        position: candidate.position as Candidate["position"], // Type assertion
        email: candidate.user?.email || "", // Extract from relation
        createdAt: candidate.createdAt.toISOString(), // Date → ISO string
        updatedAt: candidate.updatedAt.toISOString(), // Date → ISO string
        user: candidate.user
          ? {
              ...candidate.user,
              createdAt: candidate.user.createdAt.toISOString(), // Date → ISO string
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching candidate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/admin/candidates/[id] - Update candidate
 *
 * Type Flow:
 * 1. Request body (any) - validate manually
 * 2. Prisma update uses Prisma types (type-safe)
 * 3. Transform response to custom type
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      email,
      party,
      position,
      constituency,
      description,
      isNational,
      state,
      lga,
    } = body;

    // Check if candidate exists before updating
    const existingCandidate = await prisma.candidate.findUnique({
      where: { id },
    });

    if (!existingCandidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    // Validate email uniqueness if being changed
    if (email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists && emailExists.candidateId !== id) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 },
        );
      }
    }

    // Build update data object (Prisma.CandidateUpdateInput type)
    // Only include fields that are provided (partial update)
    const updateData: Prisma.CandidateUpdateInput = {};
    if (name) updateData.name = name;
    if (party) updateData.party = party;
    if (position) updateData.position = position;
    if (isNational !== undefined) updateData.isNational = isNational;
    if (state !== undefined) updateData.state = state || null;
    if (lga !== undefined) updateData.lga = lga || null;
    if (constituency !== undefined)
      updateData.constituency = constituency || null;
    if (description !== undefined) updateData.description = description || null;

    // Update candidate (Prisma handles type safety)
    await prisma.candidate.update({ where: { id }, data: updateData });

    // Update user email separately if provided
    if (email) {
      await prisma.user.updateMany({
        where: { candidateId: id },
        data: { email },
      });
    }

    // Fetch updated candidate with user relation
    const candidateWithUser = await prisma.candidate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!candidateWithUser) {
      return NextResponse.json(
        { error: "Failed to fetch updated candidate" },
        { status: 500 },
      );
    }

    // Transform Prisma type → Custom type for API response
    return NextResponse.json({
      candidate: {
        ...candidateWithUser,
        position: candidateWithUser.position as Candidate["position"],
        email: candidateWithUser.user?.email || "",
        createdAt: candidateWithUser.createdAt.toISOString(), // Date → ISO string
        updatedAt: candidateWithUser.updatedAt.toISOString(), // Date → ISO string
        user: candidateWithUser.user
          ? {
              ...candidateWithUser.user,
              createdAt: candidateWithUser.user.createdAt.toISOString(),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error updating candidate:", error);
    // Handle Prisma-specific errors
    // P2025 = Record not found
    // P2002 = Unique constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Candidate not found" },
          { status: 404 },
        );
      }
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Email already exists" },
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

/**
 * DELETE /api/admin/candidates/[id] - Delete candidate
 *
 * Note: User account is deleted via Prisma cascade (onDelete: Cascade in schema)
 */
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

    // Check if candidate exists before deleting
    const candidate = await prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    // Delete candidate (user account deleted via cascade in Prisma schema)
    await prisma.candidate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    // P2025 = Record not found (if deleted between check and delete)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
