import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logAudit } from "@/lib/core/audit";
import {
  adminEmailChangeConsumeIpRateLimit,
  adminEmailChangeConsumeTokenRateLimit,
  getClientIp,
} from "@/lib/core/rate-limit";
import {
  consumeAdminEmailChangeToken,
  hashAdminEmailChangeToken,
} from "@/lib/auth/links";

const bodySchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent");

  if (adminEmailChangeConsumeIpRateLimit) {
    const { success } = await adminEmailChangeConsumeIpRateLimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        {
          error:
            "Too many confirmation attempts from this network. Please wait and try again.",
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

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const tokenHash = hashAdminEmailChangeToken(parsed.data.token);

  if (adminEmailChangeConsumeTokenRateLimit) {
    const { success } = await adminEmailChangeConsumeTokenRateLimit.limit(
      `${tokenHash}:${ip}`,
    );
    if (!success) {
      return NextResponse.json(
        {
          error:
            "Too many attempts on this confirmation link. Please request a new one.",
        },
        { status: 429 },
      );
    }
  }

  const result = await consumeAdminEmailChangeToken({
    token: parsed.data.token,
  });

  if (!result.success) {
    return NextResponse.json(
      {
        error:
          result.reason === "expired"
            ? "This confirmation link has expired. Request a new email change from your admin account page."
            : result.reason === "used"
              ? "This confirmation link has already been used."
              : result.reason === "conflict"
                ? "That email is now in use by another account. Request a new email change with a different address."
                : "This confirmation link is no longer valid.",
        reason: result.reason,
      },
      { status: 400 },
    );
  }

  void logAudit(
    "admin.account.email_changed",
    "user",
    result.userId,
    result.userId,
    {
      newEmail: result.newEmail,
      requestIp: ip,
      userAgent: userAgent ?? null,
    },
  );

  return NextResponse.json({ success: true, reauthRequired: true });
}
