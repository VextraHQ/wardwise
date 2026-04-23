import { describe, expect, it } from "vitest";
import {
  addCampaignCanvasserSchema,
  serverSubmitSchema,
} from "./collect-schemas";

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

describe("serverSubmitSchema field normalization", () => {
  it("trims and lowercases a supplied email", () => {
    const result = serverSubmitSchema.parse({
      ...baseServerSubmission,
      email: "  Fatima@Mail.COM ",
    });
    expect(result.email).toBe("fatima@mail.com");
  });

  it("keeps blank email as empty string", () => {
    const result = serverSubmitSchema.parse(baseServerSubmission);
    expect(result.email).toBe("");
  });

  it("rejects invalid email format", () => {
    const result = serverSubmitSchema.safeParse({
      ...baseServerSubmission,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("uppercases VIN", () => {
    const result = serverSubmitSchema.parse({
      ...baseServerSubmission,
      voterIdNumber: "abc1234567890123456",
    });
    expect(result.voterIdNumber).toBe("ABC1234567890123456");
  });

  it("rejects VIN of wrong length", () => {
    const result = serverSubmitSchema.safeParse({
      ...baseServerSubmission,
      voterIdNumber: "ABC123456789012345",
    });
    expect(result.success).toBe(false);
  });

  it("trims custom answers and keeps blank as empty string", () => {
    const result = serverSubmitSchema.parse({
      ...baseServerSubmission,
      customAnswer1: "  loves grassroots work  ",
      customAnswer2: "",
    });
    expect(result.customAnswer1).toBe("loves grassroots work");
    expect(result.customAnswer2).toBe("");
  });

  it("enforces 500-char max on custom answers", () => {
    const long = "a".repeat(501);
    const result = serverSubmitSchema.safeParse({
      ...baseServerSubmission,
      customAnswer1: long,
    });
    expect(result.success).toBe(false);
  });

  it("rejects whitespace-only required text fields", () => {
    for (const field of ["firstName", "lastName", "occupation"] as const) {
      const result = serverSubmitSchema.safeParse({
        ...baseServerSubmission,
        [field]: "   ",
      });
      expect(result.success).toBe(false);
    }
  });
});

describe("addCampaignCanvasserSchema", () => {
  it("trims a valid name and canonicalizes phone", () => {
    const result = addCampaignCanvasserSchema.parse({
      name: "  Madina  ",
      phone: "08031234567",
      zone: "  North  ",
    });
    expect(result.name).toBe("Madina");
    expect(result.phone).toBe("+2348031234567");
    expect(result.zone).toBe("North");
  });

  it("rejects whitespace-only name", () => {
    const result = addCampaignCanvasserSchema.safeParse({
      name: "   ",
      phone: "08031234567",
    });
    expect(result.success).toBe(false);
  });
});
