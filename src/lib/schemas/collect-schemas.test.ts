import { describe, expect, it } from "vitest";
import { serverSubmitSchema } from "./collect-schemas";

const baseServerSubmission = {
  campaignSlug: "demo-campaign",
  firstName: "Fatima",
  middleName: "",
  lastName: "Abubakar",
  phone: "08031234567",
  email: "",
  sex: "female",
  age: 32,
  occupation: "Trader",
  maritalStatus: "married",
  lgaId: 1,
  wardId: 1,
  pollingUnitId: 1,
  apcRegNumber: "12345678904",
  voterIdNumber: "ABC1234567890123456",
  role: "member",
  canvasserName: "Madina",
  canvasserPhone: "08133160902",
  customAnswer1: "",
  customAnswer2: "",
};

describe("serverSubmitSchema phone normalization", () => {
  it("canonicalizes supporter and canvasser phones", () => {
    const parsed = serverSubmitSchema.parse(baseServerSubmission);

    expect(parsed.phone).toBe("+2348031234567");
    expect(parsed.canvasserPhone).toBe("+2348133160902");
  });

  it("allows absent optional canvasser attribution phone", () => {
    const parsed = serverSubmitSchema.parse({
      ...baseServerSubmission,
      canvasserName: "",
      canvasserPhone: "",
    });

    expect(parsed.canvasserPhone).toBe("");
  });

  it("rejects invalid canvasser phones instead of truncating them", () => {
    const result = serverSubmitSchema.safeParse({
      ...baseServerSubmission,
      canvasserPhone: "081331609021",
    });

    expect(result.success).toBe(false);
  });
});
