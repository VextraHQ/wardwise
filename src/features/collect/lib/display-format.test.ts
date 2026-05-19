import { describe, expect, it } from "vitest";

import {
  formatMaritalStatusDisplay,
  formatOccupationDisplay,
  formatRole,
  formatSexDisplay,
  titleCase,
} from "./display-format";

describe("display-format", () => {
  it("formats known occupation slugs using their canonical labels", () => {
    expect(formatOccupationDisplay("civil-servant")).toBe("Civil Servant");
    expect(formatOccupationDisplay("trader")).toBe("Trader / Business Owner");
  });

  it("falls back to title case for custom occupation text", () => {
    expect(formatOccupationDisplay("civil servant")).toBe("Civil Servant");
  });

  it("formats enum-like display values cleanly", () => {
    expect(formatSexDisplay("male")).toBe("Male");
    expect(formatMaritalStatusDisplay("widowed")).toBe("Widowed");
    expect(formatRole("canvasser")).toBe("Canvasser");
  });

  it("title-cases underscore and hyphen separated values", () => {
    expect(titleCase("private-sector_employee")).toBe(
      "Private Sector Employee",
    );
  });
});
