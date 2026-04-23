import { describe, expect, it } from "vitest";
import {
  parseBooleanParam,
  parseIntegerParam,
  parseLimitOffsetParams,
  parseOptionalStringParam,
  parsePaginationParams,
  parseRequiredIntegerParam,
} from "./query-params";

function qs(entries: Record<string, string>): URLSearchParams {
  return new URLSearchParams(entries);
}

describe("parseOptionalStringParam", () => {
  it("returns undefined when the key is missing", () => {
    expect(parseOptionalStringParam(qs({}), "q")).toBe(undefined);
  });

  it("trims whitespace and returns the cleaned value", () => {
    expect(parseOptionalStringParam(qs({ q: "  hello  " }), "q")).toBe("hello");
  });

  it("returns undefined for whitespace-only values", () => {
    expect(parseOptionalStringParam(qs({ q: "   " }), "q")).toBe(undefined);
  });

  it("returns undefined for empty strings", () => {
    expect(parseOptionalStringParam(qs({ q: "" }), "q")).toBe(undefined);
  });
});

describe("parseBooleanParam", () => {
  it("parses canonical truthy and falsy strings", () => {
    expect(parseBooleanParam("true")).toBe(true);
    expect(parseBooleanParam("false")).toBe(false);
  });

  it("returns undefined for any other value", () => {
    expect(parseBooleanParam(null)).toBe(undefined);
    expect(parseBooleanParam("")).toBe(undefined);
    expect(parseBooleanParam("TRUE")).toBe(undefined);
    expect(parseBooleanParam("1")).toBe(undefined);
    expect(parseBooleanParam("yes")).toBe(undefined);
  });
});

describe("parseIntegerParam", () => {
  it("accepts well-formed integer strings", () => {
    expect(parseIntegerParam("12")).toBe(12);
    expect(parseIntegerParam("0")).toBe(0);
    expect(parseIntegerParam("-3")).toBe(-3);
  });

  it("rejects mixed alphanumeric input", () => {
    expect(parseIntegerParam("12abc")).toBe(undefined);
    expect(parseIntegerParam("abc12")).toBe(undefined);
  });

  it("rejects blank, null, and whitespace-only input", () => {
    expect(parseIntegerParam(null)).toBe(undefined);
    expect(parseIntegerParam("")).toBe(undefined);
    expect(parseIntegerParam("   ")).toBe(undefined);
  });

  it("rejects floating point and scientific notation", () => {
    expect(parseIntegerParam("1.5")).toBe(undefined);
    expect(parseIntegerParam("1e3")).toBe(undefined);
  });
});

describe("parseRequiredIntegerParam", () => {
  it("returns { value } for valid integers", () => {
    expect(parseRequiredIntegerParam(qs({ id: "12" }), "id", "id")).toEqual({
      value: 12,
    });
  });

  it("returns { error } for malformed, null, or missing values", () => {
    const malformed = parseRequiredIntegerParam(
      qs({ id: "12abc" }),
      "id",
      "lgaId",
    );
    expect("error" in malformed).toBe(true);
    if ("error" in malformed) {
      expect(malformed.error).toBe("lgaId must be a valid integer");
    }

    expect("error" in parseRequiredIntegerParam(qs({}), "id", "id")).toBe(true);
    expect(
      "error" in parseRequiredIntegerParam(qs({ id: "" }), "id", "id"),
    ).toBe(true);
  });

  it("accepts -3 and 0 to preserve current route behavior", () => {
    // Deliberate scope boundary: today's routes use parseInt(...) || 0 and
    // let Prisma return empty results for non-positive IDs. The helper
    // mirrors that — positivity checks are the route's job, not ours.
    expect(parseRequiredIntegerParam(qs({ id: "-3" }), "id", "id")).toEqual({
      value: -3,
    });
    expect(parseRequiredIntegerParam(qs({ id: "0" }), "id", "id")).toEqual({
      value: 0,
    });
  });
});

describe("parsePaginationParams", () => {
  it("uses defaults when params are missing", () => {
    expect(parsePaginationParams(qs({}))).toEqual({ page: 1, pageSize: 20 });
  });

  it("returns valid page and pageSize", () => {
    expect(parsePaginationParams(qs({ page: "2", pageSize: "50" }))).toEqual({
      page: 2,
      pageSize: 50,
    });
  });

  it("normalizes malformed page to 1", () => {
    expect(parsePaginationParams(qs({ page: "abc" })).page).toBe(1);
  });

  it("normalizes zero and negative page to 1", () => {
    expect(parsePaginationParams(qs({ page: "0" })).page).toBe(1);
    expect(parsePaginationParams(qs({ page: "-1" })).page).toBe(1);
  });

  it("normalizes malformed pageSize to default", () => {
    expect(parsePaginationParams(qs({ pageSize: "abc" })).pageSize).toBe(20);
  });

  it("normalizes zero and negative pageSize to default", () => {
    expect(parsePaginationParams(qs({ pageSize: "0" })).pageSize).toBe(20);
    expect(parsePaginationParams(qs({ pageSize: "-5" })).pageSize).toBe(20);
  });

  it("caps pageSize at maxPageSize", () => {
    expect(parsePaginationParams(qs({ pageSize: "999999" })).pageSize).toBe(
      100,
    );
  });

  it("honors custom default and max pageSize", () => {
    expect(
      parsePaginationParams(qs({}), { defaultPageSize: 50, maxPageSize: 200 })
        .pageSize,
    ).toBe(50);
    expect(
      parsePaginationParams(qs({ pageSize: "999999" }), {
        defaultPageSize: 50,
        maxPageSize: 200,
      }).pageSize,
    ).toBe(200);
  });
});

describe("parseLimitOffsetParams", () => {
  it("uses defaults when params are missing", () => {
    expect(parseLimitOffsetParams(qs({}))).toEqual({ limit: 50, offset: 0 });
  });

  it("returns valid limit and offset", () => {
    expect(parseLimitOffsetParams(qs({ limit: "25", offset: "10" }))).toEqual({
      limit: 25,
      offset: 10,
    });
  });

  it("caps limit at maxLimit", () => {
    expect(parseLimitOffsetParams(qs({ limit: "999999" })).limit).toBe(100);
  });

  it("normalizes zero and negative limit to default", () => {
    expect(parseLimitOffsetParams(qs({ limit: "0" })).limit).toBe(50);
    expect(parseLimitOffsetParams(qs({ limit: "-1" })).limit).toBe(50);
  });

  it("normalizes malformed limit to default", () => {
    expect(parseLimitOffsetParams(qs({ limit: "abc" })).limit).toBe(50);
  });

  it("normalizes malformed offset to 0", () => {
    expect(parseLimitOffsetParams(qs({ offset: "abc" })).offset).toBe(0);
  });

  it("normalizes negative offset to 0", () => {
    expect(parseLimitOffsetParams(qs({ offset: "-1" })).offset).toBe(0);
  });

  it("honors custom default and max limit", () => {
    expect(
      parseLimitOffsetParams(qs({}), { defaultLimit: 100, maxLimit: 100 })
        .limit,
    ).toBe(100);
    expect(
      parseLimitOffsetParams(qs({ limit: "999999" }), {
        defaultLimit: 100,
        maxLimit: 100,
      }).limit,
    ).toBe(100);
  });
});
