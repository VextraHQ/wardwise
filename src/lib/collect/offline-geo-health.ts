/**
 * Returns the health state of an offline geo pack. Use this to check
 * if the pack is still valid or if it needs to be refreshed.
 *
 * Possible return values:
 * - `no_pack`: There is no pack (null).
 * - `scope_invalid`: The list of allowed LGAs is known, but at least one LGA in the pack is not allowed anymore.
 * - `content_outdated`: The campaign data changed since this pack was created, but LGAs are still allowed.
 * - `aged`: The pack was created more than 14 days ago.
 * - `clean`: None of the above; the pack is ready and up to date.
 *
 * Note: If allowed LGAs couldn't be fetched (freshAllowedSet is null), ignore scope_invalid.
 */

import type { OfflineGeoPack } from "@/lib/collect/offline-geo-pack";

export type OfflineGeoHealth =
  | "no_pack"
  | "scope_invalid"
  | "content_outdated"
  | "aged"
  | "clean";

// Time after which a pack is considered too old (14 days)
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export function computeOfflineGeoHealth({
  pack,
  campaignUpdatedAt,
  freshAllowedSet,
  now = Date.now(),
}: {
  pack: OfflineGeoPack | null;
  campaignUpdatedAt: string;
  freshAllowedSet: Set<number> | null;
  now?: number;
}): OfflineGeoHealth {
  // No stored pack at all
  if (!pack) return "no_pack";

  // If we know which LGAs are allowed, check if any in the pack are now missing
  if (freshAllowedSet) {
    const hasInvalid = pack.preparedLgaIds.some(
      (id) => !freshAllowedSet.has(id),
    );
    if (hasInvalid) return "scope_invalid";
  }

  // Check if the campaign was updated after the pack was prepared
  if (campaignUpdatedAt > pack.campaignUpdatedAt) return "content_outdated";

  // Check if the pack is older than 14 days
  const ageMs = now - new Date(pack.preparedAt).getTime();
  if (ageMs > FOURTEEN_DAYS_MS) return "aged";

  // If none of the above, the pack is up to date and valid
  return "clean";
}
