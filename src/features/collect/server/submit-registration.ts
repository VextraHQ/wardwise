import { type z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/core/prisma";
import { type serverSubmitSchema } from "@/features/collect/schemas/collect-schemas";
import {
  normalizeSupportGroupKey,
  normalizeIdentityValue,
  validateIdentityValue,
  type CollectIdentityType,
} from "@/features/collect/schemas/collect-schemas";
import { voterIdVinSchema } from "@/lib/schemas/field-schemas";
import { sendRegistrationReceipt } from "@/lib/email/registration-receipt";
import { generateRefCode, composeFullName } from "@/lib/utils";

export type SubmitRegistrationInput = z.infer<typeof serverSubmitSchema>;

export type SubmitRegistrationResult =
  | { ok: true; submission: { id: string }; count: number }
  | {
      ok: false;
      reason:
        | "campaign_not_found"
        | "campaign_paused"
        | "campaign_closed"
        | "lga_out_of_scope"
        | "invalid_geo_hierarchy"
        | "identity_required"
        | "identity_incomplete"
        | "vin_required"
        | "invalid_vin_format"
        | "duplicate_phone"
        | "duplicate_vin"
        | "race_condition";
    };

/**
 * Persist a public Collect registration submission.
 *
 * The route handler is responsible for rate-limiting, schema parsing, and
 * mapping the discriminated return to HTTP status codes. This function owns
 * the orchestration: campaign lookup, status gating, geo scope and hierarchy
 * validation, per-campaign verification requirements, duplicate detection,
 * and the insert.
 */
export async function submitRegistration(
  input: SubmitRegistrationInput,
): Promise<SubmitRegistrationResult> {
  const { campaignSlug, ...data } = input;
  const fullName = composeFullName(data);

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    select: {
      id: true,
      status: true,
      enabledLgaIds: true,
      identityRequirement: true,
      voterIdRequirement: true,
      receiptEmailMode: true,
      candidateName: true,
      candidateTitle: true,
      displayName: true,
    },
  });

  if (!campaign || campaign.status === "draft") {
    return { ok: false, reason: "campaign_not_found" };
  }

  if (campaign.status === "paused") {
    return { ok: false, reason: "campaign_paused" };
  }

  if (campaign.status === "closed") {
    return { ok: false, reason: "campaign_closed" };
  }

  if (
    campaign.enabledLgaIds.length > 0 &&
    !campaign.enabledLgaIds.includes(data.lgaId)
  ) {
    return { ok: false, reason: "lga_out_of_scope" };
  }

  const pu = await prisma.pollingUnit.findUnique({
    where: { id: data.pollingUnitId },
    include: { ward: { include: { lga: true } } },
  });

  if (!pu || pu.wardId !== data.wardId || pu.ward.lgaId !== data.lgaId) {
    return { ok: false, reason: "invalid_geo_hierarchy" };
  }

  // Apply per-campaign identity verification requirements
  const identityRequired = campaign.identityRequirement === "required";
  const hasIdentityType = Boolean(data.identityType);
  const hasIdentityValue = Boolean(data.identityValue?.trim());

  if (identityRequired) {
    if (!hasIdentityType || !hasIdentityValue) {
      return { ok: false, reason: "identity_required" };
    }
  } else {
    // Optional: partial fill (one without the other) is an error
    if (hasIdentityType !== hasIdentityValue) {
      return { ok: false, reason: "identity_incomplete" };
    }
  }

  // Apply per-campaign VIN requirement
  const vinRequired = campaign.voterIdRequirement === "required";
  if (vinRequired && !data.voterIdNumber?.trim()) {
    return { ok: false, reason: "vin_required" };
  }

  // Normalize identity value for storage when present
  let normalizedIdentityValue: string | null = null;
  if (
    hasIdentityType &&
    hasIdentityValue &&
    data.identityType &&
    data.identityValue
  ) {
    const identityType = data.identityType as CollectIdentityType;
    // Validate again server-side (schema made fields optional, so re-check format)
    const result = validateIdentityValue(data.identityValue, identityType);
    if (!result.success) {
      return { ok: false, reason: "identity_incomplete" };
    }
    normalizedIdentityValue = normalizeIdentityValue(
      data.identityValue,
      identityType,
    );
  }

  const existingByPhone = await prisma.collectSubmission.findUnique({
    where: {
      campaignId_phone: { campaignId: campaign.id, phone: data.phone },
    },
  });

  if (existingByPhone) {
    return { ok: false, reason: "duplicate_phone" };
  }

  // VIN: format-validate and dedupe only when present
  let normalizedVin: string | null = null;
  if (data.voterIdNumber?.trim()) {
    const rawVin = data.voterIdNumber.trim().toUpperCase();
    const vinResult = voterIdVinSchema.safeParse(rawVin);
    if (!vinResult.success) {
      return { ok: false, reason: "invalid_vin_format" };
    }
    normalizedVin = vinResult.data;

    const existingByVin = await prisma.collectSubmission.findFirst({
      where: { campaignId: campaign.id, voterIdNumber: normalizedVin },
    });
    if (existingByVin) {
      return { ok: false, reason: "duplicate_vin" };
    }
  }

  // Normalize support group
  const rawSupportGroup = data.supportGroupName?.trim() || null;
  const supportGroupKey = rawSupportGroup
    ? normalizeSupportGroupKey(rawSupportGroup)
    : null;

  const wantsReceipt =
    Boolean(data.wantsEmailReceipt) &&
    Boolean(data.email) &&
    campaign.receiptEmailMode === "opt_in";

  try {
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
        identityValue: normalizedIdentityValue,
        identityType:
          hasIdentityType && data.identityType ? data.identityType : null,
        voterIdNumber: normalizedVin,
        supportGroupName: rawSupportGroup,
        supportGroupKey,
        role: data.role,
        customAnswer1: data.customAnswer1 || null,
        customAnswer2: data.customAnswer2 || null,
        canvasserName: data.canvasserName || null,
        canvasserPhone: data.canvasserPhone || null,
        wantsEmailReceipt: wantsReceipt,
      },
    });

    const count = await prisma.collectSubmission.count({
      where: { campaignId: campaign.id },
    });

    // Fire receipt email after successful insert — never block the response
    if (wantsReceipt && data.email) {
      void sendRegistrationReceipt(data.email, {
        candidateName: campaign.candidateName,
        campaignTitle: campaign.displayName,
        refCode: generateRefCode(submission.id),
        submittedAt: submission.createdAt,
        lgaName: pu.ward.lga.name,
        wardName: pu.ward.name,
        pollingUnitName: pu.name,
        role: data.role,
        supportGroupName: rawSupportGroup,
      })
        .then((result) => {
          if (result.sent) {
            return prisma.collectSubmission
              .update({
                where: { id: submission.id },
                data: { receiptEmailSentAt: new Date() },
              })
              .catch((err: unknown) => {
                console.error(
                  "Failed to stamp receiptEmailSentAt for submission",
                  submission.id,
                  err,
                );
              });
          }
        })
        .catch((err: unknown) => {
          console.error(
            "Receipt email failed for submission",
            submission.id,
            err,
          );
        });
    }

    return { ok: true, submission: { id: submission.id }, count };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, reason: "race_condition" };
    }
    throw error;
  }
}
