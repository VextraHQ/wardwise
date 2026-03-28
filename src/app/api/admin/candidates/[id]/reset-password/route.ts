import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { logAudit } from "@/lib/audit";

function generateReadablePassword(): string {
  const words = [
    "WARD",
    "VOTE",
    "POLL",
    "TEAM",
    "SAFE",
    "CORE",
    "LINK",
    "PEAK",
    "DATA",
    "PLAN",
  ];
  const w1 = words[crypto.randomInt(words.length)];
  const w2 = words[crypto.randomInt(words.length)];
  const digits = String(crypto.randomInt(1000, 9999));
  return `${w1}-${digits}-${w2}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error, session } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    const user = await prisma.user.findFirst({
      where: { candidateId: id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Candidate account not found" },
        { status: 404 },
      );
    }

    const generatedPassword = generateReadablePassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    void logAudit(
      "candidate.password_reset",
      "candidate",
      id,
      session!.user.id,
    );

    return NextResponse.json({ generatedPassword });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
