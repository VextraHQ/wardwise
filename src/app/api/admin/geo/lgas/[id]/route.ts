import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { updateLgaSchema } from "@/lib/schemas/geo-schemas";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateLgaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const lga = await prisma.lga.update({
      where: { id: numId },
      data: parsed.data,
    });

    return NextResponse.json({ lga });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "LGA not found" }, { status: 404 });
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An LGA with this name already exists in this state" },
        { status: 409 },
      );
    }
    console.error("Error updating LGA:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Nullify lgaId on submissions referencing this LGA
      await tx.collectSubmission.updateMany({
        where: { lgaId: numId },
        data: { lgaId: null },
      });

      // 2. Get all ward IDs under this LGA
      const wards = await tx.ward.findMany({
        where: { lgaId: numId },
        select: { id: true },
      });
      const wardIds = wards.map((w) => w.id);

      if (wardIds.length > 0) {
        // 3. Nullify wardId on submissions for those wards
        await tx.collectSubmission.updateMany({
          where: { wardId: { in: wardIds } },
          data: { wardId: null },
        });

        // 4. Get all PU IDs under those wards
        const pus = await tx.pollingUnit.findMany({
          where: { wardId: { in: wardIds } },
          select: { id: true },
        });
        const puIds = pus.map((pu) => pu.id);

        if (puIds.length > 0) {
          // 5. Nullify pollingUnitId on submissions for those PUs
          await tx.collectSubmission.updateMany({
            where: { pollingUnitId: { in: puIds } },
            data: { pollingUnitId: null },
          });
        }

        // 6. Delete all PUs under those wards
        await tx.pollingUnit.deleteMany({
          where: { wardId: { in: wardIds } },
        });

        // 7. Delete all wards under this LGA
        await tx.ward.deleteMany({
          where: { lgaId: numId },
        });
      }

      // 8. Delete the LGA
      await tx.lga.delete({ where: { id: numId } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "LGA not found" }, { status: 404 });
    }
    console.error("Error deleting LGA:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
