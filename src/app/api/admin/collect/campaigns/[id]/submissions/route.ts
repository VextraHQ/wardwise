import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import {
  buildSubmissionWhere,
  parseSubmissionFilters,
} from "@/lib/exports/submissions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const sp = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(sp.get("pageSize") || "20", 10)),
    );
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

    const serialized = submissions.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
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
