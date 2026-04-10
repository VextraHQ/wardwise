import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";
import { logAudit } from "@/lib/core/audit";
import { createPasswordResetForUser } from "@/lib/auth/links";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error, user } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    const targetUser = await prisma.user.findFirst({
      where: { candidateId: id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Candidate account not found" },
        { status: 404 },
      );
    }

    const resetLink = await createPasswordResetForUser({
      userId: targetUser.id,
      createdById: user!.id,
    });

    void logAudit("candidate.password_reset", "candidate", id, user!.id);

    return NextResponse.json({
      resetUrl: resetLink.url,
      expiresAt: resetLink.expiresAt.toISOString(),
      deliveryMethod: resetLink.deliveryMethod,
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
