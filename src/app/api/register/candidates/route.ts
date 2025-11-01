import { NextResponse } from "next/server";
import { mockApi } from "@/lib/mock/mockApi";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state") || undefined;
  const lga = searchParams.get("lga") || undefined;

  // Use mockApi for single source of truth
  const result = await mockApi.getCandidates(state, lga);
  return NextResponse.json(result);
}
