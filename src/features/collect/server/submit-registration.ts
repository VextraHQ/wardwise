import { type z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/core/prisma";
import { type serverSubmitSchema } from "@/features/collect/schemas/collect-schemas";
import { composeFullName } from "@/lib/utils";

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
 * validation, duplicate detection, and the insert. Behavior is preserved
 * byte-for-byte versus the prior inline route code.
 */
export async function submitRegistration(
  input: SubmitRegistrationInput,
): Promise<SubmitRegistrationResult> {
  const { campaignSlug, ...data } = input;
  const fullName = composeFullName(data);

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    select: { id: true, status: true, enabledLgaIds: true },
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

  const existingByPhone = await prisma.collectSubmission.findUnique({
    where: {
      campaignId_phone: { campaignId: campaign.id, phone: data.phone },
    },
  });

  if (existingByPhone) {
    return { ok: false, reason: "duplicate_phone" };
  }

  const existingByVin = await prisma.collectSubmission.findFirst({
    where: {
      campaignId: campaign.id,
      voterIdNumber: data.voterIdNumber,
    },
  });

  if (existingByVin) {
    return { ok: false, reason: "duplicate_vin" };
  }

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
        apcRegNumber: data.identityValue,
        voterIdNumber: data.voterIdNumber,
        role: data.role,
        customAnswer1: data.customAnswer1 || null,
        customAnswer2: data.customAnswer2 || null,
        canvasserName: data.canvasserName || null,
        canvasserPhone: data.canvasserPhone || null,
      },
    });

    const count = await prisma.collectSubmission.count({
      where: { campaignId: campaign.id },
    });

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
