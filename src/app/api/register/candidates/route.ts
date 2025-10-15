import { NextResponse } from "next/server";
import { getCandidatesFor } from "@/lib/candidateData";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state") ?? "AD";
  const lga = searchParams.get("lga") ?? "SONG";
  const list = getCandidatesFor(state, lga);
  return NextResponse.json({ candidates: list });
}
