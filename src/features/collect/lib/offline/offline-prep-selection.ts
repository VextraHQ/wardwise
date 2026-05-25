/**
 * Helpers for handling selection logic in the offline-prep sheet.
 *
 * Why do we need these helpers?
 * - The user’s selection (`selected`) is kept as raw intent—it may include LGAs that aren’t currently visible.
 * - The visible LGA list (from `useCampaignLgas`) can get smaller if, for example, a campaign's allowed LGAs change mid-session.
 * - If we blindly send all of `selected` to the server, we risk including IDs that are no longer valid and will trigger a 400 ("out of scope") error.
 *
 * By calculating the "effective" selection when rendering—rather than updating state inside useEffect—we avoid React lint warnings and extra renders.
 */

export function getVisibleIds(lgas: { id: number }[]): Set<number> {
  // Returns a set of currently visible LGA IDs for easy lookup.
  return new Set(lgas.map((l) => l.id));
}

/**
 * Returns the set of selected IDs that are still actually visible/allowed.
 * This way, hidden or now-disallowed LGAs won’t get processed further.
 */
export function getEffectiveSelection(
  selected: Set<number>,
  visibleIds: Set<number>,
): Set<number> {
  const out = new Set<number>();
  for (const id of selected) {
    if (visibleIds.has(id)) out.add(id);
  }
  return out;
}

/**
 * Figures out which prepared LGA IDs are now "stale"—that is, they were previously prepared
 * but are no longer visible/allowed in the current view.
 */
export function getStalePreparedIds(
  preparedLgaIds: number[],
  visibleIds: Set<number>,
): number[] {
  return preparedLgaIds.filter((id) => !visibleIds.has(id));
}

export type PrepIntent = "save" | "clear" | "disabled";

/**
 * Decides what the main button (CTA) in the sheet should do, based on current state:
 * - If there are any effective selections: show "save" (this saves or updates the pack)
 * - If there are NO effective selections, but a pack exists: show "clear" (removes the pack)
 * - If no selections and no pack: disable the CTA
 */
export function getPrepIntent({
  effectiveCount,
  hasExistingPack,
}: {
  effectiveCount: number;
  hasExistingPack: boolean;
}): PrepIntent {
  if (effectiveCount > 0) return "save";
  if (hasExistingPack) return "clear";
  return "disabled";
}
