import { describe, expect, it } from "vitest";
import {
  createCandidateSchema,
  deleteCandidateSchema,
} from "./candidate-schemas";

describe("createCandidateSchema", () => {
  const baseCandidate = {
    name: "Amina Bello",
    email: "amina@example.com",
    party: "APC",
    position: "Governor",
    constituency: "Adamawa State",
    stateCode: "AD",
    lga: "",
    constituencyLgaIds: [],
    description: "",
    phone: "",
    title: "",
  };

  it("accepts a valid candidate", () => {
    const result = createCandidateSchema.safeParse(baseCandidate);
    expect(result.success).toBe(true);
  });

  it("rejects whitespace-only name, party, and constituency", () => {
    for (const field of ["name", "party", "constituency"] as const) {
      const result = createCandidateSchema.safeParse({
        ...baseCandidate,
        [field]: "   ",
      });
      expect(result.success).toBe(false);
    }
  });
});

describe("deleteCandidateSchema", () => {
  it("requires a valid confirmation email", () => {
    const result = deleteCandidateSchema.safeParse({
      confirmationEmail: "amina@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("normalizes confirmation email before comparison", () => {
    const result = deleteCandidateSchema.parse({
      confirmationEmail: "  AMINA@EXAMPLE.COM  ",
    });
    expect(result.confirmationEmail).toBe("amina@example.com");
  });

  it("rejects missing confirmation email", () => {
    const result = deleteCandidateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
