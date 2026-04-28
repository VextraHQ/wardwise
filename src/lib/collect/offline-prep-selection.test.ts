import { describe, expect, it } from "vitest";
import {
  getEffectiveSelection,
  getPrepIntent,
  getStalePreparedIds,
  getVisibleIds,
} from "./offline-prep-selection";

describe("getVisibleIds", () => {
  it("returns the set of ids from an LGA list", () => {
    const ids = getVisibleIds([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(ids).toEqual(new Set([1, 2, 3]));
  });

  it("returns an empty set for an empty list", () => {
    expect(getVisibleIds([])).toEqual(new Set());
  });
});

describe("getEffectiveSelection", () => {
  it("returns the intersection of selected and visible ids", () => {
    const result = getEffectiveSelection(
      new Set([1, 2, 99]),
      new Set([1, 2, 3]),
    );
    expect(result).toEqual(new Set([1, 2]));
  });

  it("preserves visible ids that are still selected (no false pruning)", () => {
    const result = getEffectiveSelection(
      new Set([1, 2, 3]),
      new Set([1, 2, 3, 4]),
    );
    expect(result).toEqual(new Set([1, 2, 3]));
  });

  it("returns an empty set when nothing is selected", () => {
    expect(getEffectiveSelection(new Set(), new Set([1, 2, 3]))).toEqual(
      new Set(),
    );
  });

  it("returns an empty set when nothing is visible", () => {
    expect(getEffectiveSelection(new Set([1, 2, 3]), new Set())).toEqual(
      new Set(),
    );
  });
});

describe("getStalePreparedIds", () => {
  it("returns prepared ids that are no longer visible", () => {
    const stale = getStalePreparedIds([1, 2, 99], new Set([1, 2, 3]));
    expect(stale).toEqual([99]);
  });

  it("returns an empty list when every prepared id is still visible", () => {
    expect(getStalePreparedIds([1, 2, 3], new Set([1, 2, 3, 4]))).toEqual([]);
  });

  it("returns the full list when nothing is visible", () => {
    expect(getStalePreparedIds([1, 2, 3], new Set())).toEqual([1, 2, 3]);
  });
});

describe("getPrepIntent", () => {
  it("returns disabled when nothing is selected and no pack exists", () => {
    expect(getPrepIntent({ effectiveCount: 0, hasExistingPack: false })).toBe(
      "disabled",
    );
  });

  it("returns clear when nothing is selected but a pack exists (remove intent)", () => {
    expect(getPrepIntent({ effectiveCount: 0, hasExistingPack: true })).toBe(
      "clear",
    );
  });

  it("returns save when at least one LGA is selected, regardless of pack state", () => {
    expect(getPrepIntent({ effectiveCount: 3, hasExistingPack: false })).toBe(
      "save",
    );
    expect(getPrepIntent({ effectiveCount: 3, hasExistingPack: true })).toBe(
      "save",
    );
  });
});
