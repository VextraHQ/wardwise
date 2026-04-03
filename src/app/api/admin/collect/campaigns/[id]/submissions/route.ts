import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

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
    const search = sp.get("search") || undefined;
    const lgaId = sp.get("lgaId") ? parseInt(sp.get("lgaId")!, 10) : undefined;
    const wardId = sp.get("wardId")
      ? parseInt(sp.get("wardId")!, 10)
      : undefined;
    const role = sp.get("role") || undefined;
    const isFlagged =
      sp.get("isFlagged") === "true"
        ? true
        : sp.get("isFlagged") === "false"
          ? false
          : undefined;

    const where: Record<string, unknown> = { campaignId: id };
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { middleName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (lgaId) where.lgaId = lgaId;
    if (wardId) where.wardId = wardId;
    if (role) where.role = role;
    if (isFlagged !== undefined) where.isFlagged = isFlagged;

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
