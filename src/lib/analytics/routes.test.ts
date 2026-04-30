import { describe, expect, it } from "vitest";
import { getAnalyticsRoute } from "./routes";

describe("getAnalyticsRoute", () => {
  it("classifies /contact as a support route", () => {
    expect(getAnalyticsRoute("/contact")).toEqual({
      group: "support",
      name: "support_contact",
    });
  });

  it("classifies /support as a support route", () => {
    expect(getAnalyticsRoute("/support")).toEqual({
      group: "support",
      name: "support_center",
    });
  });

  it("keeps legal documents under the legal group", () => {
    expect(getAnalyticsRoute("/privacy")).toEqual({
      group: "legal",
      name: "legal_privacy",
    });
  });
});
