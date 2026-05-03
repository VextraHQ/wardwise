import type { ComponentType } from "react";

import type { SubmissionListFilters } from "@/lib/api/collect";
import type { CollectSubmission } from "@/types/collect";

export type SubmissionWithPU = CollectSubmission & {
  pollingUnit?: { id: number; code: string; name: string } | null;
};

export type ReviewStatus = "pending" | "verified" | "flagged" | "all";

export type SubmissionActiveFilters = Omit<
  SubmissionListFilters,
  "page" | "pageSize"
>;

export type SubmissionConfirmDialog = {
  title: string;
  description: string;
  onConfirm: () => void;
  confirmLabel?: string;
  destructive?: boolean;
} | null;

export type SubmissionBulkActionKey = "verify" | "unverify" | "flag" | "unflag";

export type SubmissionBulkActionConfig = {
  key: SubmissionBulkActionKey;
  label: string;
  mobileLabel: string;
};

export type SubmissionBulkActionViewModel = SubmissionBulkActionConfig & {
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
};

export type SubmissionSelectionState = {
  allOnPageSelected: boolean;
  selectedCount: number;
  canSelectAllMatching: boolean;
  availableActions: SubmissionBulkActionConfig[];
};

export type SubmissionAuditEntry = {
  id: string;
  action: string;
  userId: string;
  userName: string;
  details: string | null;
  createdAt: string;
};
