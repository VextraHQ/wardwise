import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const bulkActionSchema = z.object({
  ids: z.array(z.string()).min(1).max(500),
  action: z.enum(["verify", "unverify", "flag", "unflag", "delete"]),
});

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const parsed = bulkActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { ids, action } = parsed.data;

    // Guard: check none belong to closed campaigns
    const closedCount = await prisma.collectSubmission.count({
      where: {
        id: { in: ids },
        campaign: { status: "closed" },
      },
    });
    if (closedCount > 0) {
      return NextResponse.json(
        {
          error: `${closedCount} submission(s) belong to closed campaigns and cannot be modified`,
        },
        { status: 403 },
      );
    }

    let affected = 0;

    switch (action) {
      case "verify":
        affected = (
          await prisma.collectSubmission.updateMany({
            where: { id: { in: ids } },
            data: { isVerified: true },
          })
        ).count;
        break;
      case "unverify":
        affected = (
          await prisma.collectSubmission.updateMany({
            where: { id: { in: ids } },
            data: { isVerified: false },
          })
        ).count;
        break;
      case "flag":
        affected = (
          await prisma.collectSubmission.updateMany({
            where: { id: { in: ids } },
            data: { isFlagged: true },
          })
        ).count;
        break;
      case "unflag":
        affected = (
          await prisma.collectSubmission.updateMany({
            where: { id: { in: ids } },
            data: { isFlagged: false },
          })
        ).count;
        break;
      case "delete":
        affected = (
          await prisma.collectSubmission.deleteMany({
            where: { id: { in: ids } },
          })
        ).count;
        break;
    }

    // Create per-submission audit entries for the edit trail
    if (action !== "delete") {
      const auditAction =
        action === "verify"
          ? "verified"
          : action === "unverify"
            ? "unverified"
            : action === "flag"
              ? "flagged"
              : "unflagged";
      await prisma.submissionAuditEntry.createMany({
        data: ids.map((sid) => ({
          submissionId: sid,
          action: auditAction,
          userId: session!.user.id,
          details: JSON.stringify({ source: "bulk", count: affected }),
        })),
      });
    }

    void logAudit(
      `submission.bulk_${action}`,
      "submission",
      ids[0],
      session!.user.id,
      { count: affected, action },
    );

    return NextResponse.json({ affected });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
