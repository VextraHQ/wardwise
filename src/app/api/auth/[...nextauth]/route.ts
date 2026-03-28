import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { authRateLimit, getClientIp } from "@/lib/rate-limit";

const handler = NextAuth(authOptions);

export { handler as GET };

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> },
) {
  // Rate limit login attempts (skipped if Upstash not configured)
  if (authRateLimit) {
    const ip = getClientIp(request);
    const { success } = await authRateLimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again shortly." },
        { status: 429 },
      );
    }
  }

  return handler(request, context);
}
