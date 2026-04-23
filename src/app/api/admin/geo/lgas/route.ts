import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";
import { Prisma } from "@prisma/client";
import { createLgaSchema } from "@/lib/schemas/geo-schemas";
import {
  parseOptionalStringParam,
  parsePaginationParams,
} from "@/lib/server/query-params";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const stateCode = searchParams.get("stateCode");
    if (!stateCode) {
      return NextResponse.json(
        { error: "stateCode is required" },
        { status: 400 },
      );
    }

    const { page, pageSize } = parsePaginationParams(searchParams);
    const search = parseOptionalStringParam(searchParams, "search") ?? null;
    const offset = (page - 1) * pageSize;

    const rows = await prisma.$queryRaw<
      {
        id: number;
        name: string;
        stateCode: string;
        wardCount: number;
        puCount: number;
      }[]
    >`
      SELECT l.id, l.name, l."stateCode",
        COUNT(DISTINCT w.id)::int as "wardCount",
        COUNT(DISTINCT pu.id)::int as "puCount"
      FROM "Lga" l
      LEFT JOIN "Ward" w ON w."lgaId" = l.id
      LEFT JOIN "PollingUnit" pu ON pu."wardId" = w.id
      WHERE l."stateCode" = ${stateCode}
        AND (${search}::text IS NULL OR l.name ILIKE '%' || ${search} || '%')
      GROUP BY l.id
      ORDER BY l.name
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    const countResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count
      FROM "Lga" l
      WHERE l."stateCode" = ${stateCode}
        AND (${search}::text IS NULL OR l.name ILIKE '%' || ${search} || '%')
    `;
    const total = Number(countResult[0].count);

    const data = rows.map((row) => ({
      id: row.id,
      name: row.name,
      stateCode: row.stateCode,
      _count: { wards: row.wardCount },
      puCount: row.puCount,
    }));

    return NextResponse.json({ data, total, page, pageSize });
  } catch (error) {
    console.error("Error fetching LGAs:", error);
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
    const parsed = createLgaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const lga = await prisma.lga.create({ data: parsed.data });

    return NextResponse.json({ lga }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An LGA with this name already exists in this state" },
        { status: 409 },
      );
    }
    console.error("Error creating LGA:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
