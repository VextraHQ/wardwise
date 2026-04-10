import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sid: string }> },
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { sid } = await params;

    const entries = await prisma.submissionAuditEntry.findMany({
      where: { submissionId: sid },
      orderBy: { createdAt: "desc" },
    });

    // Get user names for display
    const userIds = [...new Set(entries.map((e) => e.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

    return NextResponse.json({
      entries: entries.map((e) => ({
        id: e.id,
        action: e.action,
        userId: e.userId,
        userName: userMap[e.userId] || "Unknown",
        details: e.details,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching audit entries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
