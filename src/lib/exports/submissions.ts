import { prisma } from "@/lib/core/prisma";
import { composeFullName } from "@/lib/utils";
import {
  buildSubmissionWhere,
  type SubmissionFilters,
} from "@/lib/collect/submission-query";
import {
  buildExportFilename,
  formatExportDateTime,
  redactId,
  sanitizeSpreadsheetText,
  type ExportTable,
} from "./shared";

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
      sanitizeSpreadsheetText(name.firstName),
      sanitizeSpreadsheetText(name.middleName),
      sanitizeSpreadsheetText(name.lastName),
      sanitizeSpreadsheetText(name.fullName),
      sanitizeSpreadsheetText(submission.phone),
      sanitizeSpreadsheetText(submission.email),
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
      sanitizeSpreadsheetText(submission.canvasserName),
      sanitizeSpreadsheetText(submission.canvasserPhone),
      submission.isVerified ? "Yes" : "No",
      submission.isFlagged ? "Yes" : "No",
      ...(includeAdminNotes
        ? [sanitizeSpreadsheetText(submission.adminNotes)]
        : []),
      formatExportDateTime(submission.createdAt),
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
