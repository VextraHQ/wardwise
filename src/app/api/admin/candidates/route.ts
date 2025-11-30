import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
// Import custom type for API responses (has dates as ISO strings, matches frontend)
import type { Candidate } from "@/types/candidate";

/**
 * GET /api/admin/candidates - Fetch all candidates
 *
 * Type Strategy:
 * - Prisma types: Used for database queries (prisma.candidate.findMany returns Prisma types)
 * - Custom types: Used for API responses (transformed to match @/types/candidate)
 *
 * Why transform?
 * - Prisma returns DateTime objects (not JSON serializable)
 * - Frontend expects ISO string dates
 * - Custom types match what frontend components expect
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prisma query returns Prisma.Candidate type (includes DateTime objects)
    const candidates = await prisma.candidate.findMany({
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
      orderBy: { supporters: "desc" },
    });

    // Transform Prisma types to custom types for API response
    // Key transformations:
    // 1. DateTime objects → ISO strings (JSON serializable)
    // 2. Add computed fields (email from user relation)
    // 3. Type assertion for position (Prisma string → Candidate["position"] union)
    const candidatesWithUser = candidates.map((c) => ({
      ...c,
      position: c.position as Candidate["position"], // Type assertion to match custom type
      email: c.user?.email || "", // Extract email from user relation
      createdAt: c.createdAt.toISOString(), // DateTime → ISO string
      updatedAt: c.updatedAt.toISOString(), // DateTime → ISO string
      user: c.user
        ? {
            ...c.user,
            createdAt: c.user.createdAt.toISOString(), // DateTime → ISO string
          }
        : null,
    }));

    return NextResponse.json({ candidates: candidatesWithUser });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/candidates - Create new candidate
 *
 * Type Strategy:
 * - Input: Request body (any) - validate manually
 * - Database operations: Use Prisma types (implicit via prisma.candidate.create)
 * - Output: Transform to custom type (Candidate) for API response
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body (no type safety here - validate manually)
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

    // Validate required fields
    if (!name || !email || !party || !position) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check for duplicate email before creating
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    // Create candidate in database (Prisma handles type safety)
    // Returns Prisma.Candidate type
    const candidate = await prisma.candidate.create({
      data: {
        name,
        party,
        position,
        isNational: isNational ?? position === "President", // Auto-set for President
        state: state || null,
        lga: lga || null,
        constituency: constituency || null,
        description: description || null,
        supporters: 0,
      },
    });

    // Create associated user account
    const hashedPassword = await bcrypt.hash("demo123", 12);
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "candidate",
        candidateId: candidate.id,
      },
    });

    // Fetch complete candidate with user relation
    const candidateWithUser = await prisma.candidate.findUnique({
      where: { id: candidate.id },
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
        { error: "Failed to fetch created candidate" },
        { status: 500 },
      );
    }

    // Transform Prisma type to custom type for API response
    return NextResponse.json({
      candidate: {
        ...candidateWithUser,
        position: candidateWithUser.position as Candidate["position"],
        email: candidateWithUser.user?.email || "",
        createdAt: candidateWithUser.createdAt.toISOString(), // DateTime → ISO string
        updatedAt: candidateWithUser.updatedAt.toISOString(), // DateTime → ISO string
        user: candidateWithUser.user
          ? {
              ...candidateWithUser.user,
              createdAt: candidateWithUser.user.createdAt.toISOString(),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error creating candidate:", error);
    // Handle Prisma-specific errors
    // P2002 = Unique constraint violation (duplicate email/code)
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
