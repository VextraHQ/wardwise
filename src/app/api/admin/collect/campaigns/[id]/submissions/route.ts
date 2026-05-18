import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/lib/guards";
import { prisma } from "@/lib/core/prisma";
import {
  buildSubmissionWhere,
  parseSubmissionFilters,
} from "@/features/collect/lib/submission-query";
import { parsePaginationParams } from "@/lib/server/query-params";
import { generateRefCode } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const sp = request.nextUrl.searchParams;
    const { page, pageSize } = parsePaginationParams(sp);
    const where = buildSubmissionWhere(id, parseSubmissionFilters(sp));

    const [submissions, total] = await Promise.all([
      prisma.collectSubmission.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          lga: { select: { id: true, name: true } },
          ward: { select: { id: true, name: true } },
          pollingUnit: { select: { id: true, code: true, name: true } },
        },
      }),
      prisma.collectSubmission.count({ where }),
    ]);

    const serialized = submissions.map(({ apcRegNumber, ...submission }) => ({
      ...submission,
      identityValue: apcRegNumber,
      refCode: generateRefCode(submission.id),
      createdAt: submission.createdAt.toISOString(),
    }));

    return NextResponse.json({
      submissions: serialized,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
