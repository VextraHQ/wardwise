import { describe, expect, it } from "vitest";
import { computeOfflineGeoHealth } from "./offline-geo-health";
import type { OfflineGeoPack } from "./offline-geo-pack";

const NOW = new Date("2026-04-27T12:00:00Z").getTime();
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function makePack(overrides: Partial<OfflineGeoPack> = {}): OfflineGeoPack {
  return {
    campaignSlug: "alpha",
    campaignUpdatedAt: "2026-04-20T00:00:00Z",
    preparedAt: new Date(NOW - 2 * ONE_DAY_MS).toISOString(),
    preparedLgaIds: [1, 2, 3],
    lgas: [],
    wardsByLgaId: {},
    pollingUnitsByWardId: {},
    ...overrides,
  };
}

describe("computeOfflineGeoHealth", () => {
  it("returns no_pack when no pack is stored", () => {
    const result = computeOfflineGeoHealth({
      pack: null,
      campaignUpdatedAt: "2026-04-26T00:00:00Z",
      freshAllowedSet: new Set([1, 2, 3]),
      now: NOW,
    });
    expect(result).toBe("no_pack");
  });

  it("returns clean when fresh fetch confirms scope and content is fresh", () => {
    const result = computeOfflineGeoHealth({
      pack: makePack(),
      campaignUpdatedAt: "2026-04-20T00:00:00Z",
      freshAllowedSet: new Set([1, 2, 3]),
      now: NOW,
    });
    expect(result).toBe("clean");
  });

  it("returns scope_invalid when fresh fetch reveals a missing prepared LGA", () => {
    const result = computeOfflineGeoHealth({
      pack: makePack({ preparedLgaIds: [1, 2, 99] }),
      campaignUpdatedAt: "2026-04-20T00:00:00Z",
      freshAllowedSet: new Set([1, 2, 3]),
      now: NOW,
    });
    expect(result).toBe("scope_invalid");
  });

  it("never returns scope_invalid when the fresh fetch failed (null set)", () => {
    // Even if the prepared IDs would be invalid against a hypothetical set,
    // we have no confirmed signal — must not infer invalidity from a network
    // blip. This is the most-argued contract from planning.
    const result = computeOfflineGeoHealth({
      pack: makePack({ preparedLgaIds: [1, 2, 99] }),
      campaignUpdatedAt: "2026-04-20T00:00:00Z",
      freshAllowedSet: null,
      now: NOW,
    });
    expect(result).not.toBe("scope_invalid");
    expect(result).toBe("clean");
  });

  it("returns content_outdated when campaign.updatedAt is newer than pack and scope is fine", () => {
    const result = computeOfflineGeoHealth({
      pack: makePack({ campaignUpdatedAt: "2026-04-20T00:00:00Z" }),
      campaignUpdatedAt: "2026-04-26T00:00:00Z",
      freshAllowedSet: new Set([1, 2, 3]),
      now: NOW,
    });
    expect(result).toBe("content_outdated");
  });

  it("returns aged when preparedAt is older than 14 days and harder signals don't fire", () => {
    const result = computeOfflineGeoHealth({
      pack: makePack({
        preparedAt: new Date(NOW - 15 * ONE_DAY_MS).toISOString(),
      }),
      campaignUpdatedAt: "2026-04-20T00:00:00Z",
      freshAllowedSet: new Set([1, 2, 3]),
      now: NOW,
    });
    expect(result).toBe("aged");
  });

  it("does not return aged when preparedAt is exactly 14 days minus epsilon", () => {
    const result = computeOfflineGeoHealth({
      pack: makePack({
        preparedAt: new Date(NOW - 14 * ONE_DAY_MS + 1000).toISOString(),
      }),
      campaignUpdatedAt: "2026-04-20T00:00:00Z",
      freshAllowedSet: new Set([1, 2, 3]),
      now: NOW,
    });
    expect(result).toBe("clean");
  });

  it("scope_invalid wins over content_outdated", () => {
    const result = computeOfflineGeoHealth({
      pack: makePack({
        preparedLgaIds: [1, 2, 99],
        campaignUpdatedAt: "2026-04-10T00:00:00Z",
      }),
      campaignUpdatedAt: "2026-04-26T00:00:00Z", // newer, would be outdated
      freshAllowedSet: new Set([1, 2, 3]), // but scope is invalid
      now: NOW,
    });
    expect(result).toBe("scope_invalid");
  });

  it("scope_invalid wins over aged", () => {
    const result = computeOfflineGeoHealth({
      pack: makePack({
        preparedLgaIds: [1, 2, 99],
        preparedAt: new Date(NOW - 30 * ONE_DAY_MS).toISOString(), // very old
      }),
      campaignUpdatedAt: "2026-04-20T00:00:00Z",
      freshAllowedSet: new Set([1, 2, 3]),
      now: NOW,
    });
    expect(result).toBe("scope_invalid");
  });

  it("content_outdated wins over aged", () => {
    const result = computeOfflineGeoHealth({
      pack: makePack({
        campaignUpdatedAt: "2026-04-10T00:00:00Z",
        preparedAt: new Date(NOW - 30 * ONE_DAY_MS).toISOString(),
      }),
      campaignUpdatedAt: "2026-04-26T00:00:00Z",
      freshAllowedSet: new Set([1, 2, 3]),
      now: NOW,
    });
    expect(result).toBe("content_outdated");
  });
});
