import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  phoneSchema,
  normalizeNigerianPhoneInput,
} from "@/lib/schemas/common-schemas";

// Stricter APC/NIN validation (mirrors client-side logic)
function validateApcOrNin(val: string): boolean {
  if (/^\d{11}$/.test(val)) {
    if (/^(\d)\1{10}$/.test(val)) return false;
    if (val === "12345678901" || val === "01234567890") return false;
    return true;
  }
  return val.length >= 5 && /^[A-Za-z0-9/\-]+$/.test(val);
}

const submitSchema = z.object({
  campaignSlug: z.string().min(1),
  fullName: z
    .string()
    .min(2)
    .transform((v) => v.trim()),
  phone: phoneSchema
    .transform((val) => val.replace(/[^+\d]/g, ""))
    .transform(normalizeNigerianPhoneInput),
  email: z.string().email().optional().or(z.literal("")),
  sex: z.enum(["male", "female"]),
  age: z.coerce.number().min(18).max(120),
  occupation: z
    .string()
    .min(1)
    .transform((v) => v.trim()),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"]),
  lgaId: z.coerce.number().min(1),
  lgaName: z.string().min(1),
  wardId: z.coerce.number().min(1),
  wardName: z.string().min(1),
  pollingUnitId: z.coerce.number().min(1),
  pollingUnitName: z.string().min(1),
  apcRegNumber: z
    .string()
    .min(1, "APC/NIN is required")
    .refine(
      validateApcOrNin,
      "Enter a valid NIN (11 digits) or APC number (min 5 chars, alphanumeric)",
    ),
  voterIdNumber: z
    .string()
    .min(1, "VIN is required")
    .refine(
      (val) => /^[A-Za-z0-9]{19}$/.test(val),
      "VIN must be exactly 19 alphanumeric characters",
    ),
  role: z.enum(["volunteer", "member", "canvasser"]),
  customAnswer1: z.string().optional().or(z.literal("")),
  customAnswer2: z.string().optional().or(z.literal("")),
  canvasserName: z
    .string()
    .transform((v) => v?.trim() || "")
    .optional()
    .or(z.literal("")),
  canvasserPhone: z
    .string()
    .transform((v) => v?.trim() || "")
    .optional()
    .or(z.literal("")),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = submitSchema.safeParse(body);

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

    // Validate geographic hierarchy
    const pu = await prisma.pollingUnit.findUnique({
      where: { id: data.pollingUnitId },
      include: { ward: true },
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

    // Check for duplicate VIN
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

    // Create submission
    const submission = await prisma.collectSubmission.create({
      data: {
        campaignId: campaign.id,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || null,
        sex: data.sex,
        age: data.age,
        occupation: data.occupation,
        maritalStatus: data.maritalStatus,
        lgaId: data.lgaId,
        lgaName: data.lgaName,
        wardId: data.wardId,
        wardName: data.wardName,
        pollingUnitId: data.pollingUnitId,
        pollingUnitName: data.pollingUnitName,
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
    console.error("Error submitting registration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
