import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createWardSchema } from "@/lib/schemas/geo-schemas";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const lgaIdParam = searchParams.get("lgaId");
    if (!lgaIdParam) {
      return NextResponse.json({ error: "lgaId is required" }, { status: 400 });
    }

    const lgaId = parseInt(lgaIdParam, 10);
    if (isNaN(lgaId)) {
      return NextResponse.json({ error: "Invalid lgaId" }, { status: 400 });
    }
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)),
    );
    const search = searchParams.get("search") || undefined;

    const where: Prisma.WardWhereInput = {
      lgaId,
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    };

    const [wards, total] = await Promise.all([
      prisma.ward.findMany({
        where,
        include: {
          _count: { select: { pollingUnits: true, submissions: true } },
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.ward.count({ where }),
    ]);

    const data = wards.map((w) => ({
      id: w.id,
      name: w.name,
      lgaId: w.lgaId,
      _count: { pollingUnits: w._count.pollingUnits },
      submissionCount: w._count.submissions,
    }));

    return NextResponse.json({ data, total, page, pageSize });
  } catch (error) {
    console.error("Error fetching wards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const parsed = createWardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const ward = await prisma.ward.create({ data: parsed.data });

    return NextResponse.json({ ward }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A ward with this name already exists in this LGA" },
        { status: 409 },
      );
    }
    console.error("Error creating ward:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
