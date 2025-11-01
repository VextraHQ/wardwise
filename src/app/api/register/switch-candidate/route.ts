import { NextResponse } from "next/server";
import { mockApi } from "@/lib/mock/mockApi";

export async function POST(req: Request) {
  const { nin, newCandidateId } = await req.json();

  if (!nin || !newCandidateId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    const result = await mockApi.switchCandidate(nin, newCandidateId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error switching candidate:", error);
    return NextResponse.json(
      { error: "Failed to switch candidate" },
      { status: 500 },
    );
  }
}
