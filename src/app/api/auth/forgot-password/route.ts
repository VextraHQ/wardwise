import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/schemas/auth-schemas";
import { prisma } from "@/lib/core/prisma";
import { getClientIp, recoveryRateLimit } from "@/lib/core/rate-limit";
import {
  canSendAuthLinkEmail,
  createPasswordResetForUser,
  revokeOutstandingAuthLinks,
} from "@/lib/auth/links";

export async function POST(request: Request) {
  if (recoveryRateLimit) {
    const ip = getClientIp(request);
    const { success } = await recoveryRateLimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many recovery attempts. Please try again shortly." },
        { status: 429 },
      );
    }
  }

  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  // Keep the public recovery route non-enumerable and avoid creating
  // undisclosed manual reset links when email delivery is unavailable.
  if (!canSendAuthLinkEmail()) {
    return NextResponse.json({ success: true });
  }

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: parsed.data.email,
        mode: "insensitive",
      },
    },
    include: {
      candidate: {
        select: {
          onboardingStatus: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ success: true });
  }

  if (
    user.role === "candidate" &&
    user.candidate?.onboardingStatus === "suspended"
  ) {
    return NextResponse.json({ success: true });
  }

  const link = await createPasswordResetForUser({ userId: user.id });

  if (link.deliveryMethod !== "email") {
    // Defensive cleanup for unexpected provider failures: don't leave behind
    // a hidden manual reset link from the public recovery route.
    await revokeOutstandingAuthLinks(user.id, "password_reset");
  }

  return NextResponse.json({ success: true });
}
