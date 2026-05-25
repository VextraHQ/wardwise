import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/lib/guards";
import { prisma } from "@/lib/core/prisma";
import { Prisma } from "@prisma/client";
import { logAudit } from "@/lib/core/audit";
import { addCampaignCanvasserSchema } from "@/features/collect/schemas/collect-schemas";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    // Fetch pre-loaded roster, referral activity (known + manual), and self-identified count
    const [preloaded, knownStats, manualStats, selfIdentifiedCount] =
      await Promise.all([
        prisma.campaignCanvasser.findMany({
          where: { campaignId: id },
          orderBy: { createdAt: "desc" },
        }),
        // Known: group by stable campaignCanvasserId (linked submissions)
        prisma.$queryRaw<
          {
            campaignCanvasserId: string;
            total: bigint;
            verified: bigint;
            flagged: bigint;
            lastActive: Date | null;
          }[]
        >`
          SELECT
            "campaignCanvasserId",
            COUNT(*)::bigint as total,
            COUNT(*) FILTER (WHERE "isVerified" = true)::bigint as verified,
            COUNT(*) FILTER (WHERE "isFlagged" = true)::bigint as flagged,
            MAX("createdAt") as "lastActive"
          FROM "CollectSubmission"
          WHERE "campaignId" = ${id}
            AND "campaignCanvasserId" IS NOT NULL
          GROUP BY "campaignCanvasserId"
          ORDER BY total DESC
        `,
        // Manual: group by (canvasserName, canvasserPhone) where no stable link
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
            AND "campaignCanvasserId" IS NULL
            AND "canvasserName" IS NOT NULL
            AND "canvasserName" != ''
          GROUP BY "canvasserName", "canvasserPhone"
          ORDER BY total DESC
        `,
        prisma.collectSubmission.count({
          where: { campaignId: id, role: "canvasser" },
        }),
      ]);

    // Resolve canvasser names for known entries
    const knownIds = knownStats.map((r) => r.campaignCanvasserId);
    const rosterMap = new Map(
      preloaded.map((c) => [c.id, { name: c.name, phone: c.phone }]),
    );
    // Also fetch any canvassers that may have been deleted (not in preloaded)
    const missingIds = knownIds.filter((id) => !rosterMap.has(id));
    if (missingIds.length > 0) {
      const extra = await prisma.campaignCanvasser.findMany({
        where: { id: { in: missingIds } },
        select: { id: true, name: true, phone: true },
      });
      extra.forEach((c) =>
        rosterMap.set(c.id, { name: c.name, phone: c.phone }),
      );
    }

    const referralActivity = [
      ...knownStats.map((r) => ({
        type: "known" as const,
        canvasserId: r.campaignCanvasserId,
        name: rosterMap.get(r.campaignCanvasserId)?.name ?? "Unknown",
        phone: rosterMap.get(r.campaignCanvasserId)?.phone ?? null,
        count: Number(r.total),
        verified: Number(r.verified),
        flagged: Number(r.flagged),
        lastActive: r.lastActive?.toISOString() ?? null,
      })),
      ...manualStats.map((r) => ({
        type: "manual" as const,
        name: r.canvasserName,
        phone: r.canvasserPhone ?? null,
        count: Number(r.total),
        verified: Number(r.verified),
        flagged: Number(r.flagged),
        lastActive: r.lastActive?.toISOString() ?? null,
      })),
    ].sort((a, b) => b.count - a.count);

    return NextResponse.json({
      preloaded: preloaded.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      })),
      referralActivity,
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
    const { error, user } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const parsed = addCampaignCanvasserSchema.safeParse(body);
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
        name: parsed.data.name,
        phone: parsed.data.phone,
        zone: parsed.data.zone || null,
      },
    });

    void logAudit(
      "canvasser.add",
      "campaignCanvasser",
      canvasser.id,
      user!.id,
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
