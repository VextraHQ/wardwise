import { describe, expect, it } from "vitest";
import { getEffectiveCampaignName } from "./branding";

describe("getEffectiveCampaignName", () => {
  it("formats candidateName fallback when displayName is absent", () => {
    expect(
      getEffectiveCampaignName({ candidateName: "MADINA GIREI Umaru" }),
    ).toBe("Madina Girei Umaru");
  });

  it("leaves curated displayName literal (no formatting applied)", () => {
    expect(
      getEffectiveCampaignName({
        candidateName: "MADINA GIREI Umaru",
        displayName: "APC YOUTH 2027",
      }),
    ).toBe("APC YOUTH 2027");
  });

  it("treats whitespace-only displayName as absent and formats candidateName", () => {
    expect(
      getEffectiveCampaignName({
        candidateName: "abdulhamid dahiru babangida",
        displayName: "   ",
      }),
    ).toBe("Abdulhamid Dahiru Babangida");
  });

  it("trims a valid displayName but does not format it", () => {
    expect(
      getEffectiveCampaignName({
        candidateName: "Jane Doe",
        displayName: "  City Boy Movement  ",
      }),
    ).toBe("City Boy Movement");
  });
});
