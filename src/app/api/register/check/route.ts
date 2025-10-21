import { NextResponse } from "next/server";

// Mock duplicate check store (in-memory per serverless instance)
const registrations = new Map<string, { candidateId: string }>();

export async function POST(req: Request) {
  const { nin, constituency, electionYear } = await req.json();
  if (!nin || !constituency || !electionYear) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const key = `${nin}:${constituency}:${electionYear}`;
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
  const { nin, constituency, electionYear, candidateId } = await req.json();
  const key = `${nin}:${constituency}:${electionYear}`;
  registrations.set(key, { candidateId });
  return NextResponse.json({ ok: true });
}
