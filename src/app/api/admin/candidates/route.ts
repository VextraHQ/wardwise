import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// GET /api/admin/candidates - Fetch all candidates
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch candidates with their user accounts
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
      orderBy: {
        supporters: "desc",
      },
    });

    return NextResponse.json({ candidates });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/admin/candidates - Create new candidate
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, party, position, constituency, description } = body;

    // Validate required fields
    if (!name || !email || !party || !position || !constituency) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    // Create candidate
    const candidate = await prisma.candidate.create({
      data: {
        name,
        party,
        position,
        constituency,
        description: description || "",
        supporters: 0,
      },
    });

    // Create user account
    const hashedPassword = await bcrypt.hash("demo123", 12); // Default password
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "candidate",
        candidateId: candidate.id,
      },
    });

    // Fetch candidate with user
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

    return NextResponse.json({
      candidate: candidateWithUser,
    });
  } catch (error) {
    console.error("Error creating candidate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/candidates/[id] - Update candidate
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { candidateId, status } = body;

    if (!candidateId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Update candidate status (you'd add a status field to your schema)
    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        /* status field would go here */
      },
    });

    return NextResponse.json({ success: true, candidate: updatedCandidate });
  } catch (error) {
    console.error("Error updating candidate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
