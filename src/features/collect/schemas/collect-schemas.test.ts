import { describe, expect, it } from "vitest";
import {
  addCampaignCanvasserSchema,
  serverSubmitSchema,
  updateSubmissionSchema,
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
  identityType: "nin",
  identityValue: "12345678904",
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

  it("passes VIN through as-is (normalisation happens in submitRegistration, not schema)", () => {
    // serverSubmitSchema makes VIN optional so the route can parse before
    // reading campaign config. VIN uppercasing is applied inside submitRegistration.
    const result = serverSubmitSchema.parse({
      ...baseServerSubmission,
      voterIdNumber: "abc1234567890123456",
    });
    expect(result.voterIdNumber).toBe("abc1234567890123456");
  });

  it("accepts VIN of wrong length at schema level (format enforcement is in submitRegistration)", () => {
    // VIN format is validated in submitRegistration after campaign config lookup.
    const result = serverSubmitSchema.safeParse({
      ...baseServerSubmission,
      voterIdNumber: "ABC123456789012345",
    });
    expect(result.success).toBe(true);
  });

  it("accepts non-numeric identity values at schema level (identity format is validated in submitRegistration)", () => {
    // Identity value validation (NIN digits, membership format) is done in
    // submitRegistration after the campaign config is known.
    const result = serverSubmitSchema.safeParse({
      ...baseServerSubmission,
      identityType: "nin",
      identityValue: "apc234728347292",
    });
    expect(result.success).toBe(true);
  });

  it("accepts explicit membership numbers with letters and separators", () => {
    const result = serverSubmitSchema.safeParse({
      ...baseServerSubmission,
      identityType: "membership",
      identityValue: "PDP-AD/2042",
    });
    expect(result.success).toBe(true);
  });

  it("accepts payloads without identityValue (identity is optional at schema level)", () => {
    // Identity fields are optional in serverSubmitSchema — campaign-specific
    // requirements are enforced inside submitRegistration.
    const { identityValue: _identityValue, ...payload } = baseServerSubmission;
    const result = serverSubmitSchema.safeParse({
      ...payload,
      membershipNumber: "234728347292",
    });
    expect(result.success).toBe(true);
  });

  it("accepts payloads with unknown keys (old apcRegNumber ignored, identityValue is optional)", () => {
    const { identityValue: _identityValue, ...payload } = baseServerSubmission;
    const result = serverSubmitSchema.safeParse({
      ...payload,
      apcRegNumber: "234728347292",
    });
    expect(result.success).toBe(true);
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

describe("updateSubmissionSchema", () => {
  it("preserves undefined adminNotes when the field is not sent", () => {
    const result = updateSubmissionSchema.parse({ isVerified: true });
    expect(result.adminNotes).toBe(undefined);
    expect(result.isVerified).toBe(true);
  });

  it("normalizes blank and whitespace adminNotes to null", () => {
    expect(updateSubmissionSchema.parse({ adminNotes: "" }).adminNotes).toBe(
      null,
    );
    expect(updateSubmissionSchema.parse({ adminNotes: "   " }).adminNotes).toBe(
      null,
    );
    expect(updateSubmissionSchema.parse({ adminNotes: null }).adminNotes).toBe(
      null,
    );
  });

  it("trims non-blank adminNotes", () => {
    const result = updateSubmissionSchema.parse({ adminNotes: "  hello  " });
    expect(result.adminNotes).toBe("hello");
  });

  it("enforces max length on adminNotes", () => {
    const long = "a".repeat(2001);
    const result = updateSubmissionSchema.safeParse({ adminNotes: long });
    expect(result.success).toBe(false);
  });

  it("accepts boolean flags", () => {
    const result = updateSubmissionSchema.parse({
      isFlagged: true,
      isVerified: false,
    });
    expect(result.isFlagged).toBe(true);
    expect(result.isVerified).toBe(false);
  });
});
