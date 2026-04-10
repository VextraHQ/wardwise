import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const idParam = searchParams.get("id");

    if (!type || !idParam) {
      return NextResponse.json(
        { error: "type and id are required" },
        { status: 400 },
      );
    }

    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    let children = 0;
    let submissions = 0;

    if (type === "lga") {
      // Get ward IDs + count in one query
      const wards = await prisma.ward.findMany({
        where: { lgaId: id },
        select: { id: true },
      });
      const wardIds = wards.map((w) => w.id);

      // Get PU IDs + count
      const pus =
        wardIds.length > 0
          ? await prisma.pollingUnit.findMany({
              where: { wardId: { in: wardIds } },
              select: { id: true },
            })
          : [];
      const puIds = pus.map((pu) => pu.id);

      children = wardIds.length + puIds.length;

      submissions = await prisma.collectSubmission.count({
        where: {
          OR: [
            { lgaId: id },
            ...(wardIds.length > 0 ? [{ wardId: { in: wardIds } }] : []),
            ...(puIds.length > 0 ? [{ pollingUnitId: { in: puIds } }] : []),
          ],
        },
      });
    } else if (type === "ward") {
      // Get PU IDs + count in one query
      const pus = await prisma.pollingUnit.findMany({
        where: { wardId: id },
        select: { id: true },
      });
      const puIds = pus.map((pu) => pu.id);

      children = puIds.length;

      submissions = await prisma.collectSubmission.count({
        where: {
          OR: [
            { wardId: id },
            ...(puIds.length > 0 ? [{ pollingUnitId: { in: puIds } }] : []),
          ],
        },
      });
    } else if (type === "polling-unit") {
      submissions = await prisma.collectSubmission.count({
        where: { pollingUnitId: id },
      });
    } else {
      return NextResponse.json(
        { error: "type must be lga, ward, or polling-unit" },
        { status: 400 },
      );
    }

    return NextResponse.json({ impact: { children, submissions } });
  } catch (error) {
    console.error("Error checking impact:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
