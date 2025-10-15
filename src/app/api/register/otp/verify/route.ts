import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { phone, otp } = body ?? {};
  if (!phone || typeof phone !== "string") {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }
  if (otp !== "123456") {
    return NextResponse.json({ verified: false }, { status: 200 });
  }
  return NextResponse.json({ verified: true });
}
