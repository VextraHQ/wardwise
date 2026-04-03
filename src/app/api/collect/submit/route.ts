import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { submitRateLimit, getClientIp } from "@/lib/rate-limit";
import { serverSubmitSchema } from "@/lib/schemas/collect-schemas";
import { composeFullName } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (skipped if Upstash not configured)
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

    const { campaignSlug, ...data } = parsed.data;
    const fullName = composeFullName(data);

    // Find campaign
    const campaign = await prisma.campaign.findUnique({
      where: { slug: campaignSlug },
      select: { id: true, status: true, enabledLgaIds: true },
    });

    if (!campaign || campaign.status === "draft") {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    if (campaign.status === "paused") {
      return NextResponse.json(
        { error: "Campaign is currently paused" },
        { status: 403 },
      );
    }

    if (campaign.status === "closed") {
      return NextResponse.json(
        { error: "Campaign is closed" },
        { status: 410 },
      );
    }

    // Validate geographic scope
    if (
      campaign.enabledLgaIds.length > 0 &&
      !campaign.enabledLgaIds.includes(data.lgaId)
    ) {
      return NextResponse.json(
        { error: "Selected LGA is outside the scope of this campaign" },
        { status: 400 },
      );
    }

    // Validate geographic hierarchy and fetch authoritative names
    const pu = await prisma.pollingUnit.findUnique({
      where: { id: data.pollingUnitId },
      include: { ward: { include: { lga: true } } },
    });

    if (!pu || pu.wardId !== data.wardId || pu.ward.lgaId !== data.lgaId) {
      return NextResponse.json(
        { error: "Invalid geographic hierarchy" },
        { status: 400 },
      );
    }

    // Check for duplicate phone
    const existingByPhone = await prisma.collectSubmission.findUnique({
      where: {
        campaignId_phone: { campaignId: campaign.id, phone: data.phone },
      },
    });

    if (existingByPhone) {
      return NextResponse.json(
        { error: "This phone number is already registered for this campaign" },
        { status: 409 },
      );
    }

    // Check for duplicate VIN (already uppercased by Zod transform)
    const existingByVin = await prisma.collectSubmission.findFirst({
      where: {
        campaignId: campaign.id,
        voterIdNumber: data.voterIdNumber,
      },
    });

    if (existingByVin) {
      return NextResponse.json(
        {
          error: "This Voter ID (VIN) is already registered for this campaign",
        },
        { status: 409 },
      );
    }

    // Create submission — geo names derived from DB, not client
    const submission = await prisma.collectSubmission.create({
      data: {
        campaignId: campaign.id,
        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
        fullName,
        phone: data.phone,
        email: data.email || null,
        sex: data.sex,
        age: data.age,
        occupation: data.occupation,
        maritalStatus: data.maritalStatus,
        lgaId: data.lgaId,
        lgaName: pu.ward.lga.name,
        wardId: data.wardId,
        wardName: pu.ward.name,
        pollingUnitId: data.pollingUnitId,
        pollingUnitName: pu.name,
        apcRegNumber: data.apcRegNumber,
        voterIdNumber: data.voterIdNumber,
        role: data.role,
        customAnswer1: data.customAnswer1 || null,
        customAnswer2: data.customAnswer2 || null,
        canvasserName: data.canvasserName || null,
        canvasserPhone: data.canvasserPhone || null,
      },
    });

    // Get total count for this campaign
    const count = await prisma.collectSubmission.count({
      where: { campaignId: campaign.id },
    });

    return NextResponse.json(
      { submission: { id: submission.id }, count },
      { status: 201 },
    );
  } catch (error) {
    // Handle race condition: concurrent duplicate hits the unique constraint
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This record is already registered for this campaign" },
        { status: 409 },
      );
    }
    console.error("Error submitting registration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
