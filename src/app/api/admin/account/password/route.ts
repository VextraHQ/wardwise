import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";
import { logAudit } from "@/lib/core/audit";
import {
  adminPasswordChangeRateLimit,
  getClientIp,
} from "@/lib/core/rate-limit";
import { ADMIN_EMAIL_CHANGE_TOKEN_TYPE } from "@/lib/auth/links";
import { changeAdminPasswordSchema } from "@/lib/schemas/admin-schemas";

export async function POST(request: NextRequest) {
  const { error, user } = await requireAdmin();
  if (error) return error;

  const adminId = user!.id;
  const ip = getClientIp(request);

  if (adminPasswordChangeRateLimit) {
    const { success } = await adminPasswordChangeRateLimit.limit(
      `${adminId}:${ip}`,
    );
    if (!success) {
      return NextResponse.json(
        {
          error:
            "Too many password-change attempts. Please wait a few minutes before trying again.",
        },
        { status: 429 },
      );
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = changeAdminPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  const account = await prisma.user.findUnique({
    where: { id: adminId },
    select: { id: true, password: true },
  });

  if (!account || !account.password) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const passwordValid = await bcrypt.compare(currentPassword, account.password);
  if (!passwordValid) {
    return NextResponse.json(
      { error: "The current password is incorrect." },
      { status: 401 },
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: adminId },
      data: {
        password: passwordHash,
        passwordChangedAt: new Date(),
        sessionVersion: { increment: 1 },
      },
    });

    await tx.authToken.updateMany({
      where: {
        userId: adminId,
        type: ADMIN_EMAIL_CHANGE_TOKEN_TYPE,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });
  });

  void logAudit("admin.account.password_changed", "user", adminId, adminId, {
    requestIp: ip,
  });

  return NextResponse.json({ success: true, reauthRequired: true });
}
