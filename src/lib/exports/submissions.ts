import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/core/prisma";
import { composeFullName, parseRefCodePrefix } from "@/lib/utils";
import {
  buildExportFilename,
  parseBooleanParam,
  parseIntegerParam,
  redactEmail,
  redactId,
  redactName,
  redactPhone,
  sanitizeSpreadsheetText,
  type ExportTable,
} from "./shared";

export type SubmissionFilters = {
  search?: string;
  lgaId?: number;
  wardId?: number;
  role?: string;
  isFlagged?: boolean;
  isVerified?: boolean;
  canvasserName?: string;
  canvasserPhone?: string;
};

function getSubmissionNameParts(submission: {
  fullName: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
}) {
  return {
    firstName: submission.firstName || "",
    middleName: submission.middleName || "",
    lastName: submission.lastName || "",
    fullName:
      submission.fullName ||
      composeFullName({
        firstName: submission.firstName,
        middleName: submission.middleName,
        lastName: submission.lastName,
      }),
  };
}

export function parseSubmissionFilters(
  searchParams: URLSearchParams,
): SubmissionFilters {
  return {
    search: searchParams.get("search") || undefined,
    lgaId: parseIntegerParam(searchParams.get("lgaId")),
    wardId: parseIntegerParam(searchParams.get("wardId")),
    role: searchParams.get("role") || undefined,
    isFlagged: parseBooleanParam(searchParams.get("isFlagged")),
    isVerified: parseBooleanParam(searchParams.get("isVerified")),
    canvasserName: searchParams.get("canvasserName") || undefined,
    canvasserPhone: searchParams.get("canvasserPhone") || undefined,
  };
}

export function buildSubmissionWhere(
  campaignId: string,
  filters: SubmissionFilters,
): Prisma.CollectSubmissionWhereInput {
  const where: Prisma.CollectSubmissionWhereInput = { campaignId };

  if (filters.search) {
    const refCodePrefix = parseRefCodePrefix(filters.search);

    where.OR = [
      { fullName: { contains: filters.search, mode: "insensitive" } },
      { firstName: { contains: filters.search, mode: "insensitive" } },
      { middleName: { contains: filters.search, mode: "insensitive" } },
      { lastName: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search } },
      { email: { contains: filters.search, mode: "insensitive" } },
      ...(refCodePrefix ? [{ id: { startsWith: refCodePrefix } }] : []),
    ];
  }

  if (filters.lgaId) where.lgaId = filters.lgaId;
  if (filters.wardId) where.wardId = filters.wardId;
  if (filters.role) where.role = filters.role;
  if (filters.isFlagged !== undefined) where.isFlagged = filters.isFlagged;
  if (filters.isVerified !== undefined) where.isVerified = filters.isVerified;
  if (filters.canvasserName) {
    where.canvasserName = {
      equals: filters.canvasserName,
      mode: "insensitive",
    };
  }
  if (filters.canvasserPhone) where.canvasserPhone = filters.canvasserPhone;

  return where;
}

export async function buildSubmissionsExportTable(
  campaignId: string,
  options: {
    filters: SubmissionFilters;
    redacted?: boolean;
    excludeAdminNotes?: boolean;
  },
): Promise<ExportTable | null> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { slug: true, customQuestion1: true, customQuestion2: true },
  });

  if (!campaign) {
    return null;
  }

  const submissions = await prisma.collectSubmission.findMany({
    where: buildSubmissionWhere(campaignId, options.filters),
    orderBy: { createdAt: "desc" },
    include: {
      pollingUnit: { select: { code: true } },
    },
  });

  const includeAdminNotes = !options.excludeAdminNotes;

  const headers = [
    "First Name",
    "Middle Name",
    "Last Name",
    "Full Name",
    "Phone",
    "Email",
    "Sex",
    "Age",
    "Occupation",
    "Marital Status",
    "LGA",
    "Ward",
    "PU Code",
    "Polling Unit",
    "APC/NIN",
    "VIN",
    "Role",
    ...(campaign.customQuestion1 ? [campaign.customQuestion1] : []),
    ...(campaign.customQuestion2 ? [campaign.customQuestion2] : []),
    "Canvasser Name",
    "Canvasser Phone",
    "Verified",
    "Flagged",
    ...(includeAdminNotes ? ["Admin Notes"] : []),
    "Date",
  ];

  const rows = submissions.map((submission) => {
    const name = getSubmissionNameParts(submission);
    const redacted = Boolean(options.redacted);

    return [
      sanitizeSpreadsheetText(
        redacted ? redactName(name.firstName) : name.firstName,
      ),
      sanitizeSpreadsheetText(
        redacted ? redactName(name.middleName) : name.middleName,
      ),
      sanitizeSpreadsheetText(
        redacted ? redactName(name.lastName) : name.lastName,
      ),
      sanitizeSpreadsheetText(
        redacted ? redactName(name.fullName) : name.fullName,
      ),
      sanitizeSpreadsheetText(
        redacted ? redactPhone(submission.phone) : submission.phone,
      ),
      sanitizeSpreadsheetText(
        redacted ? redactEmail(submission.email) : submission.email,
      ),
      sanitizeSpreadsheetText(submission.sex),
      submission.age,
      sanitizeSpreadsheetText(submission.occupation),
      sanitizeSpreadsheetText(submission.maritalStatus),
      sanitizeSpreadsheetText(submission.lgaName),
      sanitizeSpreadsheetText(submission.wardName),
      sanitizeSpreadsheetText(submission.pollingUnit?.code || ""),
      sanitizeSpreadsheetText(submission.pollingUnitName),
      sanitizeSpreadsheetText(
        redacted ? redactId(submission.apcRegNumber) : submission.apcRegNumber,
      ),
      sanitizeSpreadsheetText(
        redacted
          ? redactId(submission.voterIdNumber)
          : submission.voterIdNumber,
      ),
      sanitizeSpreadsheetText(submission.role),
      ...(campaign.customQuestion1
        ? [sanitizeSpreadsheetText(submission.customAnswer1)]
        : []),
      ...(campaign.customQuestion2
        ? [sanitizeSpreadsheetText(submission.customAnswer2)]
        : []),
      sanitizeSpreadsheetText(
        redacted
          ? redactName(submission.canvasserName)
          : submission.canvasserName,
      ),
      sanitizeSpreadsheetText(
        redacted
          ? redactPhone(submission.canvasserPhone)
          : submission.canvasserPhone,
      ),
      submission.isVerified ? "Yes" : "No",
      submission.isFlagged ? "Yes" : "No",
      ...(includeAdminNotes
        ? [sanitizeSpreadsheetText(submission.adminNotes)]
        : []),
      submission.createdAt.toISOString(),
    ];
  });

  return {
    filenameBase: buildExportFilename(
      "submissions",
      campaign.slug,
      options.redacted ? "redacted" : undefined,
    ),
    worksheetName: "Submissions",
    headers,
    rows,
  };
}
