import { describe, expect, it } from "vitest";
import {
  buildSubmissionWhere,
  parseSubmissionFilters,
} from "./submission-query";

describe("parseSubmissionFilters", () => {
  it("returns all undefined for an empty URLSearchParams", () => {
    const filters = parseSubmissionFilters(new URLSearchParams());
    expect(filters).toEqual({
      search: undefined,
      lgaId: undefined,
      wardId: undefined,
      role: undefined,
      isFlagged: undefined,
      isVerified: undefined,
      canvasserName: undefined,
      canvasserPhone: undefined,
    });
  });

  it("parses every supported filter", () => {
    const filters = parseSubmissionFilters(
      new URLSearchParams({
        search: "Fatima",
        lgaId: "12",
        wardId: "34",
        role: "member",
        isFlagged: "true",
        isVerified: "false",
        canvasserName: "Madina",
        canvasserPhone: "+2348133160902",
      }),
    );
    expect(filters).toEqual({
      search: "Fatima",
      lgaId: 12,
      wardId: 34,
      role: "member",
      isFlagged: true,
      isVerified: false,
      canvasserName: "Madina",
      canvasserPhone: "+2348133160902",
    });
  });

  it("drops malformed lgaId/wardId to undefined without crashing", () => {
    const filters = parseSubmissionFilters(
      new URLSearchParams({ lgaId: "12abc", wardId: "" }),
    );
    expect(filters.lgaId).toBe(undefined);
    expect(filters.wardId).toBe(undefined);
  });

  it("trims string filters and treats whitespace-only as undefined", () => {
    const filters = parseSubmissionFilters(
      new URLSearchParams({
        search: "  Fatima  ",
        role: "   ",
        canvasserName: "",
      }),
    );
    expect(filters.search).toBe("Fatima");
    expect(filters.role).toBe(undefined);
    expect(filters.canvasserName).toBe(undefined);
  });

  it("ignores non-canonical boolean strings", () => {
    const filters = parseSubmissionFilters(
      new URLSearchParams({ isFlagged: "yes", isVerified: "TRUE" }),
    );
    expect(filters.isFlagged).toBe(undefined);
    expect(filters.isVerified).toBe(undefined);
  });
});

describe("buildSubmissionWhere", () => {
  it("returns a bare campaignId where when no filters are set", () => {
    expect(buildSubmissionWhere("camp-1", {})).toEqual({
      campaignId: "camp-1",
    });
  });

  it("builds a search OR clause over name/contact columns", () => {
    const where = buildSubmissionWhere("camp-1", { search: "Fatima" });
    expect(where.campaignId).toBe("camp-1");
    expect(Array.isArray(where.OR)).toBe(true);
    const clauses = where.OR as Array<Record<string, unknown>>;
    const keys = clauses.map((clause) => Object.keys(clause)[0]);
    expect(keys).toEqual(
      expect.arrayContaining([
        "fullName",
        "firstName",
        "middleName",
        "lastName",
        "phone",
        "email",
      ]),
    );
  });

  it("passes simple equality filters through", () => {
    const where = buildSubmissionWhere("camp-1", {
      lgaId: 12,
      wardId: 34,
      role: "member",
      canvasserPhone: "+2348133160902",
    });
    expect(where.lgaId).toBe(12);
    expect(where.wardId).toBe(34);
    expect(where.role).toBe("member");
    expect(where.canvasserPhone).toBe("+2348133160902");
  });

  it("includes boolean flags only when explicitly set", () => {
    const a = buildSubmissionWhere("camp-1", { isFlagged: true });
    expect(a.isFlagged).toBe(true);

    const b = buildSubmissionWhere("camp-1", { isVerified: false });
    expect(b.isVerified).toBe(false);

    const c = buildSubmissionWhere("camp-1", {});
    expect("isFlagged" in c).toBe(false);
    expect("isVerified" in c).toBe(false);
  });

  it("uses case-insensitive equality for canvasser name", () => {
    const where = buildSubmissionWhere("camp-1", { canvasserName: "Madina" });
    expect(where.canvasserName).toEqual({
      equals: "Madina",
      mode: "insensitive",
    });
  });
});
