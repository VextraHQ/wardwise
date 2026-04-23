import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";
import { Prisma } from "@prisma/client";
import { createPollingUnitSchema } from "@/lib/schemas/geo-schemas";
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
    const wardIdResult = parseRequiredIntegerParam(
      searchParams,
      "wardId",
      "wardId",
    );
    if ("error" in wardIdResult) {
      return NextResponse.json({ error: wardIdResult.error }, { status: 400 });
    }
    const wardId = wardIdResult.value;
    const { page, pageSize } = parsePaginationParams(searchParams);
    const search = parseOptionalStringParam(searchParams, "search");

    const where: Prisma.PollingUnitWhereInput = {
      wardId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { code: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [pollingUnits, total] = await Promise.all([
      prisma.pollingUnit.findMany({
        where,
        include: {
          _count: { select: { submissions: true } },
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.pollingUnit.count({ where }),
    ]);

    const data = pollingUnits.map((pu) => ({
      id: pu.id,
      code: pu.code ?? "",
      name: pu.name,
      wardId: pu.wardId,
      submissionCount: pu._count.submissions,
    }));

    return NextResponse.json({ data, total, page, pageSize });
  } catch (error) {
    console.error("Error fetching polling units:", error);
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
    const parsed = createPollingUnitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const pollingUnit = await prisma.pollingUnit.create({ data: parsed.data });

    return NextResponse.json({ pollingUnit }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A polling unit with this code already exists in this ward" },
        { status: 409 },
      );
    }
    console.error("Error creating polling unit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
