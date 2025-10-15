import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { phone, constituency, electionYear, newCandidateId } =
    await req.json();
  if (!phone || !constituency || !electionYear || !newCandidateId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  // Mock accept once
  return NextResponse.json({ success: true });
}
