import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/lib/guards";
import { prisma } from "@/lib/core/prisma";
import { logAudit } from "@/lib/core/audit";
import { updateAdminProfileSchema } from "@/features/admin/schemas/admin-schemas";

export async function PATCH(request: NextRequest) {
  const { error, user } = await requireAdmin();
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateAdminProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const adminId = user!.id;
  const previousName = await prisma.user.findUnique({
    where: { id: adminId },
    select: { name: true },
  });

  const updated = await prisma.user.update({
    where: { id: adminId },
    data: { name: parsed.data.name },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      lastLoginAt: true,
      passwordChangedAt: true,
    },
  });

  if (previousName?.name !== updated.name) {
    void logAudit("admin.account.profile_updated", "user", adminId, adminId, {
      changedFields: ["name"],
    });
  }

  return NextResponse.json({
    success: true,
    account: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      createdAt: updated.createdAt.toISOString(),
      lastLoginAt: updated.lastLoginAt?.toISOString() ?? null,
      passwordChangedAt: updated.passwordChangedAt?.toISOString() ?? null,
    },
  });
}
