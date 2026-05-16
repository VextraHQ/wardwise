import { describe, expect, it } from "vitest";
import {
  createCanvasserSchema,
  updateCanvasserSchema,
} from "./canvasser-schemas";

const baseCanvasser = {
  code: "CAN-001",
  name: "Fatima Abubakar",
  phone: "08031234567",
  candidateId: "c1",
};

describe("createCanvasserSchema", () => {
  it("canonicalizes phone on happy path", () => {
    const result = createCanvasserSchema.parse(baseCanvasser);
    expect(result.phone).toBe("+2348031234567");
  });

  it("rejects invalid phone with field error", () => {
    const result = createCanvasserSchema.safeParse({
      ...baseCanvasser,
      phone: "081331609021",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.phone).toBeTruthy();
    }
  });

  it("rejects missing required fields", () => {
    const result = createCanvasserSchema.safeParse({
      code: "",
      name: "",
      phone: "",
      candidateId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects bad canvasser code pattern", () => {
    const result = createCanvasserSchema.safeParse({
      ...baseCanvasser,
      code: "lowercase-bad",
    });
    expect(result.success).toBe(false);
  });

  it("rejects whitespace-only name", () => {
    const result = createCanvasserSchema.safeParse({
      ...baseCanvasser,
      name: "   ",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateCanvasserSchema", () => {
  it("accepts a partial update with id only", () => {
    const result = updateCanvasserSchema.parse({ id: "abc" });
    expect(result.id).toBe("abc");
  });

  it("canonicalizes phone when provided", () => {
    const result = updateCanvasserSchema.parse({
      id: "abc",
      phone: "08031234567",
    });
    expect(result.phone).toBe("+2348031234567");
  });

  it("rejects blank phone so a PATCH cannot wipe a required DB value", () => {
    const result = updateCanvasserSchema.safeParse({ id: "abc", phone: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid phone", () => {
    const result = updateCanvasserSchema.safeParse({
      id: "abc",
      phone: "081331609021",
    });
    expect(result.success).toBe(false);
  });
});
