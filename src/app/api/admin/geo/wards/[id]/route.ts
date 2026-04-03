import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { updateWardSchema } from "@/lib/schemas/geo-schemas";

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
    const parsed = updateWardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const existingWard = await prisma.ward.findUnique({
      where: { id: numId },
      select: { id: true, lgaId: true, name: true, code: true },
    });

    if (!existingWard) {
      return NextResponse.json({ error: "Ward not found" }, { status: 404 });
    }

    const nextName = parsed.data.name ?? existingWard.name;
    const nextCode =
      parsed.data.code !== undefined ? parsed.data.code : existingWard.code;

    if (!nextCode) {
      const conflictingWard = await prisma.ward.findFirst({
        where: {
          lgaId: existingWard.lgaId,
          name: { equals: nextName, mode: "insensitive" },
          id: { not: numId },
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

    const ward = await prisma.ward.update({
      where: { id: numId },
      data: parsed.data,
    });

    return NextResponse.json({ ward });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Ward not found" }, { status: 404 });
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A ward with this official code already exists in this LGA" },
        { status: 409 },
      );
    }
    console.error("Error updating ward:", error);
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
      // Nullify wardId on submissions referencing this ward
      await tx.collectSubmission.updateMany({
        where: { wardId: numId },
        data: { wardId: null },
      });

      // Get all PU IDs under this ward
      const pus = await tx.pollingUnit.findMany({
        where: { wardId: numId },
        select: { id: true },
      });
      const puIds = pus.map((pu) => pu.id);

      if (puIds.length > 0) {
        // Nullify pollingUnitId on submissions for those PUs
        await tx.collectSubmission.updateMany({
          where: { pollingUnitId: { in: puIds } },
          data: { pollingUnitId: null },
        });
      }

      // Delete all PUs under this ward
      await tx.pollingUnit.deleteMany({
        where: { wardId: numId },
      });

      // Delete the ward
      await tx.ward.delete({ where: { id: numId } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Ward not found" }, { status: 404 });
    }
    console.error("Error deleting ward:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
