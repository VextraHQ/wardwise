import { NextResponse } from "next/server";
import { voterApi } from "@/lib/api/voter";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { nin } = body ?? {};

  if (!nin || typeof nin !== "string") {
    return NextResponse.json({ error: "Invalid NIN" }, { status: 400 });
  }

  // Validate NIN format
  if (!/^\d{11}$/.test(nin)) {
    return NextResponse.json(
      {
        error: "NIN must be exactly 11 digits",
      },
      { status: 400 },
    );
  }

  try {
    // Use mock API for demo
    const result = await voterApi.verifyNIN(nin);

    if (result.verified) {
      return NextResponse.json({
        verified: true,
        message: result.message,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        {
          verified: false,
          message: result.message,
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("NIN verification error:", error);
    return NextResponse.json(
      {
        verified: false,
        message: "Verification failed. Please try again.",
      },
      { status: 500 },
    );
  }
}
