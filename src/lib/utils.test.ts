import { describe, expect, it } from "vitest";
import { formatPersonName } from "./utils";

describe("formatPersonName", () => {
  it("title-cases all-caps names", () => {
    expect(formatPersonName("MADINA GIREI Umaru")).toBe("Madina Girei Umaru");
  });

  it("title-cases all-lowercase names", () => {
    expect(formatPersonName("abdulhamid dahiru babangida")).toBe(
      "Abdulhamid Dahiru Babangida",
    );
  });

  it("is idempotent on already-formatted names", () => {
    expect(formatPersonName("Maryam Saidu")).toBe("Maryam Saidu");
  });

  it("preserves hyphens", () => {
    expect(formatPersonName("ABDUL-RAHMAN")).toBe("Abdul-Rahman");
  });

  it("preserves apostrophes", () => {
    expect(formatPersonName("O'CONNOR")).toBe("O'Connor");
  });

  it("formats Mc/Mac prefixes", () => {
    expect(formatPersonName("MCDONALD")).toBe("McDonald");
    expect(formatPersonName("MACDONALD")).toBe("MacDonald");
  });

  it("uppercases honorifics and suffixes", () => {
    expect(formatPersonName("chief olusegun obasanjo gcfr")).toBe(
      "Chief Olusegun Obasanjo GCFR",
    );
    expect(formatPersonName("HRH emir sanusi II")).toBe("HRH Emir Sanusi II");
  });

  it("lowercases particles when not the first word", () => {
    expect(formatPersonName("LUDWIG VAN BEETHOVEN")).toBe(
      "Ludwig van Beethoven",
    );
    expect(formatPersonName("van der berg")).toBe("Van der Berg");
  });

  it("handles empty, null, and undefined", () => {
    expect(formatPersonName("")).toBe("");
    expect(formatPersonName(null)).toBe("");
    expect(formatPersonName(undefined)).toBe("");
  });
});
