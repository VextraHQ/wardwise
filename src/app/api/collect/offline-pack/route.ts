import { type NextRequest, NextResponse } from "next/server";
import { getClientIp, offlinePackRateLimit } from "@/lib/core/rate-limit";
import { offlinePackRequestSchema } from "@/features/collect/schemas/collect-schemas";
import { buildOfflinePack } from "@/features/collect/server/build-offline-pack";

export async function POST(request: NextRequest) {
  try {
    if (offlinePackRateLimit) {
      const ip = getClientIp(request);
      const { success } = await offlinePackRateLimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Please try again shortly." },
          { status: 429 },
        );
      }
    }

    const body = await request.json();
    const parsed = offlinePackRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const result = await buildOfflinePack(parsed.data);

    if (!result.ok) {
      switch (result.reason) {
        case "campaign_not_found":
          return NextResponse.json(
            { error: "Campaign not found" },
            { status: 404 },
          );
        case "campaign_closed":
          return NextResponse.json(
            { error: "Campaign is closed" },
            { status: 410 },
          );
        case "candidate_state_missing":
          return NextResponse.json(
            { error: "Could not resolve candidate state" },
            { status: 500 },
          );
        case "lgas_out_of_scope":
          return NextResponse.json(
            {
              error:
                "One or more requested LGAs are outside the campaign scope",
              details: { outOfScope: result.outOfScope },
            },
            { status: 400 },
          );
      }
    }

    return NextResponse.json({
      campaignUpdatedAt: result.campaignUpdatedAt,
      lgas: result.lgas,
      wards: result.wards,
      pollingUnits: result.pollingUnits,
    });
  } catch (error) {
    console.error("Error building offline pack:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
