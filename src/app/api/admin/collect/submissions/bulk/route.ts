import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";
import { z } from "zod";
import { logAudit } from "@/lib/core/audit";
import {
  buildSubmissionWhere,
  type SubmissionFilters,
} from "@/lib/exports/submissions";

const bulkActionSchema = z
  .object({
    ids: z.array(z.string()).max(500).optional(),
    campaignId: z.string().optional(),
    action: z.enum(["verify", "unverify", "flag", "unflag", "delete"]),
    scope: z.enum(["selected", "filtered"]).default("selected"),
    filters: z
      .object({
        search: z.string().optional(),
        lgaId: z.number().int().optional(),
        wardId: z.number().int().optional(),
        role: z.string().optional(),
        isFlagged: z.boolean().optional(),
        isVerified: z.boolean().optional(),
        canvasserName: z.string().optional(),
        canvasserPhone: z.string().optional(),
      })
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.scope === "selected" && (!value.ids || value.ids.length === 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["ids"],
        message: "Select at least one submission.",
      });
    }
    if (value.scope === "filtered" && !value.campaignId) {
      ctx.addIssue({
        code: "custom",
        path: ["campaignId"],
        message: "Campaign is required for filtered bulk actions.",
      });
    }
    if (value.scope === "filtered" && value.action === "delete") {
      ctx.addIssue({
        code: "custom",
        path: ["action"],
        message: "Filtered delete is not supported.",
      });
    }
    if (value.scope === "filtered") {
      const hasActiveFilter = Object.values(value.filters ?? {}).some(
        (filterValue) => filterValue !== undefined && filterValue !== "",
      );
      if (!hasActiveFilter) {
        ctx.addIssue({
          code: "custom",
          path: ["filters"],
          message: "Filtered bulk actions require at least one active filter.",
        });
      }
    }
  });

function getAuditAction(action: string) {
  return action === "verify"
    ? "verified"
    : action === "unverify"
      ? "unverified"
      : action === "flag"
        ? "flagged"
        : "unflagged";
}

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireAdmin();
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

    const { action, scope } = parsed.data;
    let targetIds = parsed.data.ids ?? [];
    let where =
      scope === "filtered"
        ? buildSubmissionWhere(
            parsed.data.campaignId!,
            (parsed.data.filters ?? {}) as SubmissionFilters,
          )
        : { id: { in: targetIds } };

    if (scope === "filtered") {
      const campaign = await prisma.campaign.findUnique({
        where: { id: parsed.data.campaignId! },
        select: { status: true },
      });

      if (!campaign) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 },
        );
      }
      if (campaign.status === "closed") {
        return NextResponse.json(
          { error: "Closed campaigns cannot be modified" },
          { status: 403 },
        );
      }

      const matching = await prisma.collectSubmission.findMany({
        where,
        select: { id: true },
      });
      targetIds = matching.map((submission) => submission.id);
      where = { id: { in: targetIds } };
    } else {
      // Guard: check none belong to closed campaigns
      const closedCount = await prisma.collectSubmission.count({
        where: {
          id: { in: targetIds },
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
    }

    if (targetIds.length === 0) {
      return NextResponse.json({ affected: 0 });
    }

    let affected = 0;

    switch (action) {
      case "verify":
        affected = (
          await prisma.collectSubmission.updateMany({
            where,
            data: { isVerified: true },
          })
        ).count;
        break;
      case "unverify":
        affected = (
          await prisma.collectSubmission.updateMany({
            where,
            data: { isVerified: false },
          })
        ).count;
        break;
      case "flag":
        affected = (
          await prisma.collectSubmission.updateMany({
            where,
            data: { isFlagged: true },
          })
        ).count;
        break;
      case "unflag":
        affected = (
          await prisma.collectSubmission.updateMany({
            where,
            data: { isFlagged: false },
          })
        ).count;
        break;
      case "delete":
        affected = (
          await prisma.collectSubmission.deleteMany({
            where,
          })
        ).count;
        break;
    }

    // Create per-submission audit entries for the edit trail
    if (action !== "delete") {
      const auditAction = getAuditAction(action);
      await prisma.submissionAuditEntry.createMany({
        data: targetIds.map((sid) => ({
          submissionId: sid,
          action: auditAction,
          userId: user!.id,
          details: JSON.stringify({
            source: scope === "filtered" ? "filtered_bulk" : "bulk",
            count: affected,
            ...(scope === "filtered" && { filters: parsed.data.filters ?? {} }),
          }),
        })),
      });
    }

    void logAudit(
      `submission.bulk_${action}`,
      scope === "filtered" ? "campaign" : "submission",
      scope === "filtered" ? parsed.data.campaignId! : targetIds[0],
      user!.id,
      {
        count: affected,
        action,
        scope,
        ...(scope === "filtered" && { filters: parsed.data.filters ?? {} }),
      },
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
