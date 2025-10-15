import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { phone } = body ?? {};
  if (!phone || typeof phone !== "string") {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }
  // Mock send OTP: always 123456
  return NextResponse.json({ success: true, otpLast4: "3456" });
}

