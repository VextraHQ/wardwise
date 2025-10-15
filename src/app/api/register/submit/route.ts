import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const payload = await req.json();
  // In real impl: validate, persist, and fanout to candidate dashboard
  // For demo: accept any payload structure
  return NextResponse.json({
    success: true,
    registrationId: "reg_" + Date.now(),
  });
}
