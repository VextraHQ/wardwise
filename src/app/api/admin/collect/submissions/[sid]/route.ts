import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";
import { Prisma } from "@prisma/client";
import { logAudit } from "@/lib/core/audit";
import { updateSubmissionSchema } from "@/lib/schemas/admin-schemas";

// Shared guard: fetch submission + campaign status, block if closed
async function getSubmissionWithGuard(sid: string) {
  const submission = await prisma.collectSubmission.findUnique({
    where: { id: sid },
    select: {
      id: true,
      campaignId: true,
      campaign: { select: { status: true } },
    },
  });
  if (!submission) return { error: "not_found" as const, submission: null };
  if (submission.campaign.status === "closed")
    return { error: "closed" as const, submission: null };
  return { error: null, submission };
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sid: string }> },
) {
  try {
    const { error, user } = await requireAdmin();
    if (error) return error;

    const { sid } = await params;

    const guard = await getSubmissionWithGuard(sid);
    if (guard.error === "not_found") {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 },
      );
    }
    if (guard.error === "closed") {
      return NextResponse.json(
        { error: "Cannot modify submissions on a closed campaign" },
        { status: 403 },
      );
    }

    // Optionally verify submission belongs to expected campaign
    const campaignId = request.nextUrl.searchParams.get("campaignId");
    if (campaignId && guard.submission!.campaignId !== campaignId) {
      return NextResponse.json(
        { error: "Submission does not belong to this campaign" },
        { status: 403 },
      );
    }

    // Create audit entry before deletion (cascade will remove it, but it's logged in AuditLog too)
    await prisma.submissionAuditEntry.create({
      data: {
        submissionId: sid,
        action: "deleted",
        userId: user!.id,
      },
    });

    await prisma.collectSubmission.delete({
      where: { id: sid },
    });

    void logAudit("submission.delete", "submission", sid, user!.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 },
      );
    }
    console.error("Error deleting submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sid: string }> },
) {
  try {
    const { error, user } = await requireAdmin();
    if (error) return error;

    const { sid } = await params;

    const guard = await getSubmissionWithGuard(sid);
    if (guard.error === "not_found") {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 },
      );
    }
    if (guard.error === "closed") {
      return NextResponse.json(
        { error: "Cannot modify submissions on a closed campaign" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = updateSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const d = parsed.data;

    // Fetch current state for audit trail
    const current = await prisma.collectSubmission.findUnique({
      where: { id: sid },
      select: { isFlagged: true, isVerified: true, adminNotes: true },
    });

    const submission = await prisma.collectSubmission.update({
      where: { id: sid },
      data: {
        ...(d.isFlagged !== undefined && { isFlagged: d.isFlagged }),
        ...(d.adminNotes !== undefined && { adminNotes: d.adminNotes }),
        ...(d.isVerified !== undefined && { isVerified: d.isVerified }),
      },
    });

    // Create audit entries for each change
    const auditEntries: {
      submissionId: string;
      action: string;
      userId: string;
      details: string;
    }[] = [];
    if (
      d.isVerified !== undefined &&
      current &&
      d.isVerified !== current.isVerified
    ) {
      auditEntries.push({
        submissionId: sid,
        action: d.isVerified ? "verified" : "unverified",
        userId: user!.id,
        details: JSON.stringify({
          field: "isVerified",
          from: current.isVerified,
          to: d.isVerified,
        }),
      });
    }
    if (
      d.isFlagged !== undefined &&
      current &&
      d.isFlagged !== current.isFlagged
    ) {
      auditEntries.push({
        submissionId: sid,
        action: d.isFlagged ? "flagged" : "unflagged",
        userId: user!.id,
        details: JSON.stringify({
          field: "isFlagged",
          from: current.isFlagged,
          to: d.isFlagged,
        }),
      });
    }
    if (
      d.adminNotes !== undefined &&
      current &&
      d.adminNotes !== current.adminNotes
    ) {
      auditEntries.push({
        submissionId: sid,
        action: "note_added",
        userId: user!.id,
        details: JSON.stringify({ note: d.adminNotes }),
      });
    }

    if (auditEntries.length > 0) {
      await prisma.submissionAuditEntry.createMany({ data: auditEntries });
    }

    return NextResponse.json({
      submission: {
        ...submission,
        createdAt: submission.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 },
      );
    }
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
