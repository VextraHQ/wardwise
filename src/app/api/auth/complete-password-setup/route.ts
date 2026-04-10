import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp, passwordSetupRateLimit } from "@/lib/core/rate-limit";
import { consumeAuthLink } from "@/lib/auth/links";
import { passwordSetupSchema } from "@/lib/schemas/auth-schemas";

const requestSchema = z.object({
  token: z.string().min(1, "Missing secure token"),
  password: passwordSetupSchema.shape.password,
});

export async function POST(request: Request) {
  if (passwordSetupRateLimit) {
    const ip = getClientIp(request);
    const { success } = await passwordSetupRateLimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait and try again." },
        { status: 429 },
      );
    }
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a stronger password." },
      { status: 400 },
    );
  }

  const result = await consumeAuthLink(parsed.data);

  if (!result.success) {
    return NextResponse.json(
      { error: "This secure link is invalid or has expired." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    type: result.type,
  });
}
