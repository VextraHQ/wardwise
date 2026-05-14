import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/core/prisma";
import {
  ADMIN_EMAIL_CHANGE_TOKEN_TYPE,
  ADMIN_EMAIL_CHANGE_TTL_MS,
} from "@/lib/auth/links";

// TODO(activity-log): Keep /admin/account as a compact preview. When the
// dedicated admin activity log page ships, move full history and pagination
// there instead of growing this feed.
const ACTIVITY_LIMIT = 10;

export async function GET() {
  const { error, user } = await requireAdmin();
  if (error) return error;

  const adminId = user!.id;

  const [account, pendingToken, activity] = await Promise.all([
    prisma.user.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        passwordChangedAt: true,
      },
    }),
    prisma.authToken.findFirst({
      where: {
        userId: adminId,
        type: ADMIN_EMAIL_CHANGE_TOKEN_TYPE,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      select: {
        targetEmail: true,
        createdAt: true,
        expiresAt: true,
      },
    }),
    prisma.auditLog.findMany({
      where: {
        userId: adminId,
        action: { startsWith: "admin.account." },
      },
      orderBy: { createdAt: "desc" },
      take: ACTIVITY_LIMIT,
      select: {
        id: true,
        action: true,
        createdAt: true,
        details: true,
      },
    }),
  ]);

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  return NextResponse.json({
    account: {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      createdAt: account.createdAt.toISOString(),
      lastLoginAt: account.lastLoginAt?.toISOString() ?? null,
      passwordChangedAt: account.passwordChangedAt?.toISOString() ?? null,
    },
    pendingEmailChange:
      pendingToken && pendingToken.targetEmail
        ? {
            targetEmail: pendingToken.targetEmail,
            requestedAt: pendingToken.createdAt.toISOString(),
            expiresAt: pendingToken.expiresAt.toISOString(),
            ttlMs: ADMIN_EMAIL_CHANGE_TTL_MS,
          }
        : null,
    activity: activity.map((row) => ({
      id: row.id,
      action: row.action,
      createdAt: row.createdAt.toISOString(),
      details: row.details ?? null,
    })),
  });
}
