import { type NextRequest, NextResponse } from "next/server";
import { submitRateLimit, getClientIp } from "@/lib/core/rate-limit";
import { serverSubmitSchema } from "@/features/collect/schemas/collect-schemas";
import {
  submitRegistration,
  type SubmitRegistrationResult,
} from "@/features/collect/server/submit-registration";

function mapFailureToResponse(
  reason: Extract<SubmitRegistrationResult, { ok: false }>["reason"],
): NextResponse {
  switch (reason) {
    case "campaign_not_found":
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    case "campaign_paused":
      return NextResponse.json(
        { error: "Campaign is currently paused" },
        { status: 403 },
      );
    case "campaign_closed":
      return NextResponse.json(
        { error: "Campaign is closed" },
        { status: 410 },
      );
    case "lga_out_of_scope":
      return NextResponse.json(
        { error: "Selected LGA is outside the scope of this campaign" },
        { status: 400 },
      );
    case "invalid_geo_hierarchy":
      return NextResponse.json(
        { error: "Invalid geographic hierarchy" },
        { status: 400 },
      );
    case "duplicate_phone":
      return NextResponse.json(
        { error: "This phone number is already registered for this campaign" },
        { status: 409 },
      );
    case "duplicate_vin":
      return NextResponse.json(
        {
          error: "This Voter ID (VIN) is already registered for this campaign",
        },
        { status: 409 },
      );
    case "race_condition":
      return NextResponse.json(
        { error: "This record is already registered for this campaign" },
        { status: 409 },
      );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (submitRateLimit) {
      const ip = getClientIp(request);
      const { success } = await submitRateLimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Please try again shortly." },
          { status: 429 },
        );
      }
    }

    const body = await request.json();
    const parsed = serverSubmitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const result = await submitRegistration(parsed.data);

    if (!result.ok) {
      return mapFailureToResponse(result.reason);
    }

    return NextResponse.json(
      { submission: result.submission, count: result.count },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error submitting registration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
