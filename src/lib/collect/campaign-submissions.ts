import type { ExportFormat } from "@/lib/exports/shared";
import { formatGeoDisplayName } from "@/lib/geo/display";
import { generateRefCode } from "@/lib/utils";

import type {
  ReviewStatus,
  SubmissionBulkActionConfig,
  SubmissionSelectionState,
  SubmissionWithPU,
} from "@/types/campaign-submissions";

export const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: "CSV",
  xlsx: "Excel",
};

export const REVIEW_STATUSES = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "flagged", label: "Flagged" },
] as const satisfies ReadonlyArray<{
  value: ReviewStatus;
  label: string;
}>;

export function getReviewStatusFilters(status: ReviewStatus) {
  switch (status) {
    case "pending":
      return { isVerified: false, isFlagged: false };
    case "verified":
      return { isVerified: true, isFlagged: false };
    case "flagged":
      return { isFlagged: true };
    default:
      return {};
  }
}

export function getReviewStatusLabel(status: ReviewStatus) {
  return REVIEW_STATUSES.find((item) => item.value === status)?.label ?? "All";
}

export function formatPU(submission: SubmissionWithPU) {
  const code = submission.pollingUnit?.code;
  const displayName = formatGeoDisplayName(submission.pollingUnitName);
  if (code) return `${code.padStart(3, "0")} - ${displayName}`;
  return displayName;
}

export function getSubmissionRefCode(submission: SubmissionWithPU) {
  return submission.refCode || generateRefCode(submission.id);
}

export function buildExportToastMessage(args: {
  format: ExportFormat;
  redacted?: boolean;
  hasSearch: boolean;
  hasRoleFilter: boolean;
  hasCanvasserFilter: boolean;
  hasStatusFilter: boolean;
}) {
  const label = `${args.redacted ? "Redacted " : ""}${EXPORT_FORMAT_LABELS[args.format]}`;
  const activeFilters = [
    args.hasSearch ? "search" : null,
    args.hasStatusFilter ? "review status" : null,
    args.hasRoleFilter ? "role" : null,
    args.hasCanvasserFilter ? "canvasser" : null,
  ].filter(Boolean);

  if (activeFilters.length === 0) return `${label} exported`;
  if (activeFilters.length === 1) {
    return `${label} exported with ${activeFilters[0]} filter`;
  }

  return `${label} exported with active filters`;
}

type SelectableSubmission = Pick<
  SubmissionWithPU,
  "id" | "isVerified" | "isFlagged"
>;

export function deriveSubmissionSelectionState(args: {
  submissions: SelectableSubmission[];
  selectedIds: Set<string>;
  total: number;
  reviewStatus: ReviewStatus;
  allMatchingSelected: boolean;
}): SubmissionSelectionState {
  const { submissions, selectedIds, total, reviewStatus, allMatchingSelected } =
    args;

  const allOnPageSelected =
    submissions.length > 0 &&
    submissions.every((submission) => selectedIds.has(submission.id));
  const selectedSubmissions = submissions.filter((submission) =>
    selectedIds.has(submission.id),
  );
  const selectedCount = allMatchingSelected ? total : selectedIds.size;
  const hasUnverified = allMatchingSelected
    ? reviewStatus !== "verified"
    : selectedSubmissions.some((submission) => !submission.isVerified);
  const hasVerified = allMatchingSelected
    ? reviewStatus === "verified"
    : selectedSubmissions.some((submission) => submission.isVerified);
  const hasUnflagged = allMatchingSelected
    ? reviewStatus !== "flagged"
    : selectedSubmissions.some((submission) => !submission.isFlagged);
  const hasFlagged = allMatchingSelected
    ? reviewStatus === "flagged"
    : selectedSubmissions.some((submission) => submission.isFlagged);
  const canSelectAllMatching =
    !allMatchingSelected &&
    allOnPageSelected &&
    total > selectedIds.size &&
    reviewStatus !== "all";

  const availableActions = [
    hasUnverified
      ? {
          key: "verify",
          label: allMatchingSelected ? "Verify Matching" : "Verify Selected",
          mobileLabel: "Verify",
        }
      : null,
    hasVerified
      ? {
          key: "unverify",
          label: allMatchingSelected
            ? "Unverify Matching"
            : "Unverify Selected",
          mobileLabel: "Unverify",
        }
      : null,
    hasUnflagged
      ? {
          key: "flag",
          label: allMatchingSelected ? "Flag Matching" : "Flag Selected",
          mobileLabel: "Flag",
        }
      : null,
    hasFlagged
      ? {
          key: "unflag",
          label: allMatchingSelected ? "Unflag Matching" : "Unflag Selected",
          mobileLabel: "Unflag",
        }
      : null,
  ].filter(Boolean) as SubmissionBulkActionConfig[];

  return {
    allOnPageSelected,
    selectedCount,
    canSelectAllMatching,
    availableActions,
  };
}
