import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/core/prisma";
import { getClientIp, offlinePackRateLimit } from "@/lib/core/rate-limit";
import { offlinePackRequestSchema } from "@/lib/schemas/collect-schemas";

export async function POST(request: NextRequest) {
  try {
    // Check if rate limit is enabled and if client has exceeded it
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

    // Get and validate the JSON payload from the request
    const body = await request.json();
    const parsed = offlinePackRequestSchema.safeParse(body);

    // If validation fails, return error with details
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { campaignSlug, lgaIds } = parsed.data;

    // Look up the campaign using the provided slug
    const campaign = await prisma.campaign.findUnique({
      where: { slug: campaignSlug },
      select: {
        id: true,
        candidateId: true,
        status: true,
        constituencyType: true,
        enabledLgaIds: true,
        updatedAt: true,
      },
    });

    // If campaign does not exist or is still a draft, return not found
    if (!campaign || campaign.status === "draft") {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    // If campaign has been closed, return gone
    if (campaign.status === "closed") {
      return NextResponse.json(
        { error: "Campaign is closed" },
        { status: 410 },
      );
    }

    // Figure out which LGAs are valid for this campaign.
    // Logic is the same as the LGAs endpoint to match client expectations.
    let allowedLgaIds: number[];

    // If campaign has specific enabledLgaIds, use them
    if (campaign.enabledLgaIds.length > 0) {
      allowedLgaIds = campaign.enabledLgaIds;
    }
    // If the campaign is for a federal constituency, allow all LGAs
    else if (campaign.constituencyType === "federal") {
      const all = await prisma.lga.findMany({ select: { id: true } });
      allowedLgaIds = all.map((l) => l.id);
    }
    // Otherwise (e.g. for state), allow LGAs that match the candidate's state
    else {
      const candidate = await prisma.candidate.findUnique({
        where: { id: campaign.candidateId },
        select: { stateCode: true },
      });
      const code = candidate?.stateCode ?? null;
      if (!code) {
        return NextResponse.json(
          { error: "Could not resolve candidate state" },
          { status: 500 },
        );
      }
      const stateLgas = await prisma.lga.findMany({
        where: { stateCode: code },
        select: { id: true },
      });
      allowedLgaIds = stateLgas.map((l) => l.id);
    }

    // Check if any requested LGA IDs are not allowed by this campaign
    const allowedSet = new Set(allowedLgaIds);
    const outOfScope = lgaIds.filter((id) => !allowedSet.has(id));
    if (outOfScope.length > 0) {
      return NextResponse.json(
        {
          error: "One or more requested LGAs are outside the campaign scope",
          details: { outOfScope },
        },
        { status: 400 },
      );
    }

    // Fetch the requested LGAs and their basic info
    const lgas = await prisma.lga.findMany({
      where: { id: { in: lgaIds } },
      select: { id: true, name: true, stateCode: true },
      orderBy: { name: "asc" },
    });

    // Fetch all wards in those LGAs
    const wards = await prisma.ward.findMany({
      where: { lgaId: { in: lgaIds } },
      select: { id: true, code: true, name: true, lgaId: true },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });

    // Fetch polling units for all those wards
    const wardIds = wards.map((w) => w.id);
    const pollingUnitsRaw = wardIds.length
      ? await prisma.pollingUnit.findMany({
          where: { wardId: { in: wardIds } },
          select: { id: true, code: true, name: true, wardId: true },
          orderBy: { code: "asc" },
        })
      : [];

    // Ensure every polling unit has a code string (avoid nulls)
    const pollingUnits = pollingUnitsRaw.map((pu) => ({
      ...pu,
      code: pu.code ?? "",
    }));

    // Send everything back to the client
    return NextResponse.json({
      campaignUpdatedAt: campaign.updatedAt.toISOString(),
      lgas,
      wards,
      pollingUnits,
    });
  } catch (error) {
    // Unexpected errors get handled here
    console.error("Error building offline pack:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
