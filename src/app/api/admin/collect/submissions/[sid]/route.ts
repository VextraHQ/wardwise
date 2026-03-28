import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const updateSubmissionSchema = z.object({
  isFlagged: z.boolean().optional(),
  adminNotes: z.string().optional(),
  isVerified: z.boolean().optional(),
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sid: string }> },
) {
  try {
    const { error, session } = await requireAdmin();
    if (error) return error;

    const { sid } = await params;

    // Optionally verify submission belongs to expected campaign
    const campaignId = request.nextUrl.searchParams.get("campaignId");
    if (campaignId) {
      const sub = await prisma.collectSubmission.findUnique({
        where: { id: sid },
        select: { campaignId: true },
      });
      if (sub && sub.campaignId !== campaignId) {
        return NextResponse.json(
          { error: "Submission does not belong to this campaign" },
          { status: 403 },
        );
      }
    }

    await prisma.collectSubmission.delete({
      where: { id: sid },
    });

    void logAudit("submission.delete", "submission", sid, session!.user.id);

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
    const { error } = await requireAdmin();
    if (error) return error;

    const { sid } = await params;
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
    const submission = await prisma.collectSubmission.update({
      where: { id: sid },
      data: {
        ...(d.isFlagged !== undefined && { isFlagged: d.isFlagged }),
        ...(d.adminNotes !== undefined && {
          adminNotes: d.adminNotes || null,
        }),
        ...(d.isVerified !== undefined && { isVerified: d.isVerified }),
      },
    });

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
