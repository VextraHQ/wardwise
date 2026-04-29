import { describe, expect, it } from "vitest";

import {
  deriveSubmissionSelectionState,
  getReviewStatusFilters,
} from "./campaign-submissions";

describe("getReviewStatusFilters", () => {
  it("maps each review status to the correct query filters", () => {
    expect(getReviewStatusFilters("all")).toEqual({});
    expect(getReviewStatusFilters("pending")).toEqual({
      isVerified: false,
      isFlagged: false,
    });
    expect(getReviewStatusFilters("verified")).toEqual({
      isVerified: true,
      isFlagged: false,
    });
    expect(getReviewStatusFilters("flagged")).toEqual({
      isFlagged: true,
    });
  });
});

describe("deriveSubmissionSelectionState", () => {
  it("computes selection summary state for a filtered page", () => {
    const state = deriveSubmissionSelectionState({
      submissions: [
        { id: "one", isVerified: false, isFlagged: false },
        { id: "two", isVerified: true, isFlagged: false },
      ],
      selectedIds: new Set(["one", "two"]),
      total: 12,
      reviewStatus: "pending",
      allMatchingSelected: false,
    });

    expect(state.allOnPageSelected).toBe(true);
    expect(state.selectedCount).toBe(2);
    expect(state.canSelectAllMatching).toBe(true);
  });

  it("derives mixed-state bulk actions for selected rows", () => {
    const state = deriveSubmissionSelectionState({
      submissions: [
        { id: "one", isVerified: false, isFlagged: false },
        { id: "two", isVerified: true, isFlagged: true },
      ],
      selectedIds: new Set(["one", "two"]),
      total: 2,
      reviewStatus: "all",
      allMatchingSelected: false,
    });

    expect(state.availableActions).toEqual([
      { key: "verify", label: "Verify Selected", mobileLabel: "Verify" },
      {
        key: "unverify",
        label: "Unverify Selected",
        mobileLabel: "Unverify",
      },
      { key: "flag", label: "Flag Selected", mobileLabel: "Flag" },
      { key: "unflag", label: "Unflag Selected", mobileLabel: "Unflag" },
    ]);
  });

  it("switches bulk action labels to matching-record scope", () => {
    const state = deriveSubmissionSelectionState({
      submissions: [
        { id: "one", isVerified: true, isFlagged: false },
        { id: "two", isVerified: true, isFlagged: false },
      ],
      selectedIds: new Set(["one", "two"]),
      total: 45,
      reviewStatus: "verified",
      allMatchingSelected: true,
    });

    expect(state.selectedCount).toBe(45);
    expect(state.canSelectAllMatching).toBe(false);
    expect(state.availableActions).toEqual([
      {
        key: "unverify",
        label: "Unverify Matching",
        mobileLabel: "Unverify",
      },
      { key: "flag", label: "Flag Matching", mobileLabel: "Flag" },
    ]);
  });
});
