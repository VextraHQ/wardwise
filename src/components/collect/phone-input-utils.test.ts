import { describe, expect, it } from "vitest";
import { sanitizePhoneInputChars } from "./phone-input-utils";

describe("sanitizePhoneInputChars", () => {
  it("keeps valid phone formatting characters", () => {
    expect(sanitizePhoneInputChars("+234 803-123-4567")).toBe(
      "+234 803-123-4567",
    );
    expect(sanitizePhoneInputChars("(080) 312 34567")).toBe("(080) 312 34567");
  });

  it("removes letters and other unsupported characters", () => {
    expect(sanitizePhoneInputChars("0803abc123!@#4567")).toBe("08031234567");
  });

  it("preserves a single leading plus only", () => {
    expect(sanitizePhoneInputChars("++234+8031234567")).toBe("+2348031234567");
    expect(sanitizePhoneInputChars("080+31234567")).toBe("08031234567");
  });

  it("allows blank input", () => {
    expect(sanitizePhoneInputChars("")).toBe("");
  });
});
