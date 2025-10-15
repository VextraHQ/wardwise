import { NextResponse } from "next/server";

// Mock duplicate check store (in-memory per serverless instance)
const registrations = new Map<string, { candidateId: string }>();

export async function POST(req: Request) {
  const { phone, constituency, electionYear } = await req.json();
  if (!phone || !constituency || !electionYear) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const key = `${phone}:${constituency}:${electionYear}`;
  const existing = registrations.get(key);
  if (existing) {
    return NextResponse.json({
      exists: true,
      candidateId: existing.candidateId,
    });
  }
  return NextResponse.json({ exists: false });
}

// Helper for tests/dev to seed a registration
export async function PUT(req: Request) {
  const { phone, constituency, electionYear, candidateId } = await req.json();
  const key = `${phone}:${constituency}:${electionYear}`;
  registrations.set(key, { candidateId });
  return NextResponse.json({ ok: true });
}

