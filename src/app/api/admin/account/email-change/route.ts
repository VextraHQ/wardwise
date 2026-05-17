import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/features/auth/lib/guards";
import { prisma } from "@/lib/core/prisma";
import { logAudit } from "@/lib/core/audit";
import {
  adminEmailChangeRequestRateLimit,
  getClientIp,
} from "@/lib/core/rate-limit";
import {
  ADMIN_EMAIL_CHANGE_TOKEN_TYPE,
  ADMIN_EMAIL_CHANGE_TTL_MS,
  createAdminEmailChangeToken,
  revokeAdminEmailChangeTokensForUser,
} from "@/features/auth/lib/links";
import {
  sendAdminEmailChangeEmail,
  sendAdminEmailChangeNoticeEmail,
} from "@/lib/email/auth";
import { requestAdminEmailChangeSchema } from "@/features/admin-shell/schemas/admin-schemas";

export async function POST(request: NextRequest) {
  const { error, user } = await requireAdmin();
  if (error) return error;

  const adminId = user!.id;
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent");

  if (adminEmailChangeRequestRateLimit) {
    const { success } = await adminEmailChangeRequestRateLimit.limit(
      `${adminId}:${ip}`,
    );
    if (!success) {
      return NextResponse.json(
        {
          error:
            "Too many email-change requests. Please wait a few minutes before trying again.",
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

  const parsed = requestAdminEmailChangeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { newEmail, currentPassword } = parsed.data;

  const account = await prisma.user.findUnique({
    where: { id: adminId },
    select: { id: true, name: true, email: true, password: true },
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

  if (account.email.toLowerCase() === newEmail.toLowerCase()) {
    return NextResponse.json(
      { error: "The new email is the same as your current email." },
      { status: 400 },
    );
  }

  const conflict = await prisma.user.findFirst({
    where: {
      email: { equals: newEmail, mode: "insensitive" },
      id: { not: adminId },
    },
    select: { id: true },
  });

  if (conflict) {
    return NextResponse.json(
      { error: "That email is already in use by another account." },
      { status: 400 },
    );
  }

  const issued = await createAdminEmailChangeToken({
    userId: adminId,
    targetEmail: newEmail,
  });

  let sentResult: Awaited<ReturnType<typeof sendAdminEmailChangeEmail>>;
  try {
    sentResult = await sendAdminEmailChangeEmail({
      to: newEmail,
      name: account.name ?? "Admin",
      url: issued.url,
      targetEmail: newEmail,
      expiresAt: issued.expiresAt,
      requestedAt: issued.requestedAt,
      requestIp: ip,
      userAgent,
    });
  } catch (deliveryError) {
    console.error("Admin email-change delivery threw:", deliveryError);
    await revokeAdminEmailChangeTokensForUser(adminId);
    return NextResponse.json(
      {
        error:
          "We couldn't send the confirmation email. Please try again shortly.",
      },
      { status: 502 },
    );
  }

  if (!sentResult.sent) {
    await revokeAdminEmailChangeTokensForUser(adminId);
    return NextResponse.json(
      {
        error:
          "Email delivery is not configured on this environment. Email changes require working outbound email.",
      },
      { status: 503 },
    );
  }

  void sendAdminEmailChangeNoticeEmail({
    to: account.email,
    name: account.name ?? "Admin",
    currentEmail: account.email,
    targetEmail: newEmail,
    requestedAt: issued.requestedAt,
    requestIp: ip,
    userAgent,
  }).catch((noticeError) => {
    console.warn("Admin old-email change notice failed:", noticeError);
  });

  void logAudit(
    "admin.account.email_change_requested",
    "user",
    adminId,
    adminId,
    {
      targetEmail: newEmail,
      requestIp: ip,
      userAgent: userAgent ?? null,
    },
  );

  return NextResponse.json({
    success: true,
    pendingEmailChange: {
      targetEmail: newEmail,
      requestedAt: issued.requestedAt.toISOString(),
      expiresAt: issued.expiresAt.toISOString(),
      ttlMs: ADMIN_EMAIL_CHANGE_TTL_MS,
    },
  });
}

export async function DELETE(request: NextRequest) {
  const { error, user } = await requireAdmin();
  if (error) return error;

  const adminId = user!.id;
  const ip = getClientIp(request);

  const pending = await prisma.authToken.findFirst({
    where: {
      userId: adminId,
      type: ADMIN_EMAIL_CHANGE_TOKEN_TYPE,
      usedAt: null,
    },
    select: { id: true, targetEmail: true },
  });

  await revokeAdminEmailChangeTokensForUser(adminId);

  if (pending) {
    void logAudit(
      "admin.account.email_change_cancelled",
      "user",
      adminId,
      adminId,
      {
        targetEmail: pending.targetEmail,
        requestIp: ip,
      },
    );
  }

  return NextResponse.json({ success: true });
}
