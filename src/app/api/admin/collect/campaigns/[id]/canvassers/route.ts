import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import {
  phoneSchema,
  normalizeNigerianPhoneInput,
} from "@/lib/schemas/common-schemas";

const addCanvasserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: phoneSchema.transform(normalizeNigerianPhoneInput),
  zone: z.string().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    // Fetch both pre-loaded canvassers and submission-aggregated stats
    const [preloaded, canvasserStats, selfIdentifiedCount] = await Promise.all([
      prisma.campaignCanvasser.findMany({
        where: { campaignId: id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.$queryRaw<
        {
          canvasserName: string;
          canvasserPhone: string | null;
          total: bigint;
          verified: bigint;
          flagged: bigint;
          lastActive: Date | null;
        }[]
      >`
        SELECT
          "canvasserName",
          "canvasserPhone",
          COUNT(*)::bigint as total,
          COUNT(*) FILTER (WHERE "isVerified" = true)::bigint as verified,
          COUNT(*) FILTER (WHERE "isFlagged" = true)::bigint as flagged,
          MAX("createdAt") as "lastActive"
        FROM "CollectSubmission"
        WHERE "campaignId" = ${id}
          AND "canvasserName" IS NOT NULL
          AND "canvasserName" != ''
        GROUP BY "canvasserName", "canvasserPhone"
        ORDER BY total DESC
      `,
      prisma.collectSubmission.count({
        where: { campaignId: id, role: "canvasser" },
      }),
    ]);

    const canvassers = canvasserStats.map((r) => ({
      canvasserName: r.canvasserName,
      canvasserPhone: r.canvasserPhone || "",
      _count: Number(r.total),
      verified: Number(r.verified),
      flagged: Number(r.flagged),
      lastActive: r.lastActive?.toISOString() || null,
    }));

    return NextResponse.json({
      preloaded: preloaded.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      })),
      canvassers,
      selfIdentifiedCount,
    });
  } catch (error) {
    console.error("Error fetching canvassers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { error, session } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const parsed = addCanvasserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const canvasser = await prisma.campaignCanvasser.create({
      data: {
        campaignId: id,
        name: parsed.data.name.trim(),
        phone: parsed.data.phone.trim(),
        zone: parsed.data.zone?.trim() || null,
      },
    });

    void logAudit(
      "canvasser.add",
      "campaignCanvasser",
      canvasser.id,
      session!.user.id,
      { campaignId: id, name: canvasser.name },
    );

    return NextResponse.json(
      {
        canvasser: {
          ...canvasser,
          createdAt: canvasser.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "A canvasser with this phone number already exists for this campaign",
        },
        { status: 409 },
      );
    }
    console.error("Error adding canvasser:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
