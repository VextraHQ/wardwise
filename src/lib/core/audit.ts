import { prisma } from "@/lib/core/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Log an audit event. Fire-and-forget — never breaks the request.
 */
export async function logAudit(
  action: string,
  entityType: string,
  entityId: string,
  userId: string | null,
  details?: Prisma.InputJsonValue,
) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        userId,
        details: details ?? undefined,
      },
    });
  } catch (e) {
    console.error("Audit log failed:", e);
  }
}
