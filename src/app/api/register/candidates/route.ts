import { NextResponse } from "next/server";
import { candidateApi } from "@/lib/api/candidate";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state") || undefined;
  const lga = searchParams.get("lga") || undefined;

  // Use candidateApi (switches between mock and real based on env)
  const result = await candidateApi.getCandidates(state, lga);
  return NextResponse.json(result);
}
