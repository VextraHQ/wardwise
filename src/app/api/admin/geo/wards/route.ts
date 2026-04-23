import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";
import { Prisma } from "@prisma/client";
import { createWardSchema } from "@/lib/schemas/geo-schemas";
import {
  parseOptionalStringParam,
  parsePaginationParams,
  parseRequiredIntegerParam,
} from "@/lib/server/query-params";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const lgaIdResult = parseRequiredIntegerParam(
      searchParams,
      "lgaId",
      "lgaId",
    );
    if ("error" in lgaIdResult) {
      return NextResponse.json({ error: lgaIdResult.error }, { status: 400 });
    }
    const lgaId = lgaIdResult.value;
    const { page, pageSize } = parsePaginationParams(searchParams);
    const search = parseOptionalStringParam(searchParams, "search");

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
      code: w.code,
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

    if (!parsed.data.code) {
      const conflictingWard = await prisma.ward.findFirst({
        where: {
          lgaId: parsed.data.lgaId,
          name: { equals: parsed.data.name, mode: "insensitive" },
        },
        select: { id: true },
      });

      if (conflictingWard) {
        return NextResponse.json(
          {
            error:
              "A ward with this name already exists in this LGA. Add the official ward code if this is a distinct official ward.",
          },
          { status: 409 },
        );
      }
    }

    const ward = await prisma.ward.create({ data: parsed.data });

    return NextResponse.json({ ward }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A ward with this official code already exists in this LGA" },
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
