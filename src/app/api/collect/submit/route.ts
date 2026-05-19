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
        { error: "Campaign not found", reason },
        { status: 404 },
      );
    case "campaign_paused":
      return NextResponse.json(
        { error: "Campaign is currently paused", reason },
        { status: 403 },
      );
    case "campaign_closed":
      return NextResponse.json(
        { error: "Campaign is closed", reason },
        { status: 410 },
      );
    case "lga_out_of_scope":
      return NextResponse.json(
        { error: "Selected LGA is outside the scope of this campaign", reason },
        { status: 400 },
      );
    case "invalid_geo_hierarchy":
      return NextResponse.json(
        { error: "Invalid geographic hierarchy", reason },
        { status: 400 },
      );
    case "identity_required":
      return NextResponse.json(
        {
          error: "Identity verification is required for this campaign",
          reason,
        },
        { status: 400 },
      );
    case "identity_incomplete":
      return NextResponse.json(
        {
          error:
            "You selected a verification method but did not finish it. Complete both fields or leave this optional section blank.",
          reason,
        },
        { status: 400 },
      );
    case "vin_required":
      return NextResponse.json(
        { error: "Voter ID (VIN) is required for this campaign", reason },
        { status: 400 },
      );
    case "invalid_vin_format":
      return NextResponse.json(
        {
          error:
            "Invalid Voter ID format. VIN must be exactly 19 alphanumeric characters.",
          reason,
        },
        { status: 400 },
      );
    case "duplicate_phone":
      return NextResponse.json(
        {
          error: "This phone number is already registered for this campaign",
          reason,
        },
        { status: 409 },
      );
    case "duplicate_vin":
      return NextResponse.json(
        {
          error: "This Voter ID (VIN) is already registered for this campaign",
          reason,
        },
        { status: 409 },
      );
    case "race_condition":
      return NextResponse.json(
        {
          error: "This record is already registered for this campaign",
          reason,
        },
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
