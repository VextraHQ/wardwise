// Constituency helpers — shared between candidate and campaign modules
import type { ConstituencyPreset } from "@/lib/data/nigerian-constituencies";

export type ConstituencyBoundaryWarning = {
  severity: "info" | "warning";
  title: string;
  description: string;
};

// Map candidate position to constituency type stored on campaign
export function positionToConstituencyType(
  position: string,
): "federal" | "state" | undefined {
  switch (position) {
    case "House of Representatives":
    case "Senator":
    case "President":
      return "federal";
    case "Governor":
    case "State Assembly":
      return "state";
    default:
      return undefined;
  }
}

// Whether this position requires the candidate to define constituency LGAs
export function positionRequiresLgas(position: string): boolean {
  return ["Senator", "House of Representatives", "State Assembly"].includes(
    position,
  );
}

// FCT-specific office combinations that should be blocked
export function getPositionStateValidationMessage(
  position: string,
  stateCode: string | null | undefined,
): string | undefined {
  if (stateCode !== "FC") return undefined;

  switch (position) {
    case "Governor":
      return "Federal Capital Territory does not have a governor position in this flow.";
    case "State Assembly":
      return "Federal Capital Territory does not have a State Assembly in this flow.";
    default:
      return undefined;
  }
}

// Auto-suggest a constituency display name from selected LGA names
export function autoConstituencyName(lgaNames: string[]): string {
  if (lgaNames.length === 0) return "";
  return lgaNames.sort().join("/");
}

function normalizeBoundaryLabel(label: string): string[] {
  return label
    .replace(
      /\b(federal constituency|senatorial district|state constituency|constituency|district)\b/gi,
      "",
    )
    .split("/")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .sort();
}

export function labelsRepresentSameBoundary(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  const normalizedLeft = normalizeBoundaryLabel(left ?? "");
  const normalizedRight = normalizeBoundaryLabel(right ?? "");

  if (normalizedLeft.length === 0 || normalizedRight.length === 0) {
    return false;
  }

  return JSON.stringify(normalizedLeft) === JSON.stringify(normalizedRight);
}

/**
 * Match a preset's canonical LGA names against the live DB records for a state.
 * Returns the matched IDs (to write to the form) and any names not yet seeded.
 */
export function matchPresetToSeededIds(
  preset: ConstituencyPreset,
  lgas: { id: number; name: string }[],
): { ids: number[]; unmatchedNames: string[] } {
  const ids: number[] = [];
  const unmatchedNames: string[] = [];
  for (const name of preset.lgaNames) {
    const lga = lgas.find((l) => l.name === name);
    if (lga) ids.push(lga.id);
    else unmatchedNames.push(name);
  }
  return { ids, unmatchedNames };
}

/**
 * Check whether the current manual LGA selection exactly matches any known preset.
 * Returns the matched preset, or null if no exact match.
 */
export function findMatchingPreset(
  selectedLgaIds: number[],
  lgas: { id: number; name: string }[],
  presets: ConstituencyPreset[],
): ConstituencyPreset | null {
  if (selectedLgaIds.length === 0 || presets.length === 0) return null;
  const selectedNames = new Set(
    selectedLgaIds
      .map((id) => lgas.find((l) => l.id === id)?.name)
      .filter(Boolean),
  );
  return (
    presets.find((p) => {
      if (p.lgaNames.length !== selectedNames.size) return false;
      return p.lgaNames.every((name) => selectedNames.has(name));
    }) ?? null
  );
}

// Deduplicate and stabilize LGA arrays before persisting or comparing them
export function normalizeConstituencyLgaIds(
  lgaIds: number[] | undefined,
): number[] {
  return [...new Set(lgaIds ?? [])].sort((a, b) => a - b);
}

// Build soft warnings for suspicious but still-saveable constituency setups
export function getConstituencyBoundaryWarnings({
  position,
  stateName,
  selectedLgaCount,
  expectedLgaCount,
  constituencyName,
  autoSuggestedName,
  hasPartialGeo = false,
  hasExistingCampaigns = false,
  allowIncompleteSave = true,
  presetMismatchInfo,
}: {
  position: string;
  stateName?: string | null;
  selectedLgaCount: number;
  expectedLgaCount?: number;
  constituencyName?: string | null;
  autoSuggestedName?: string | null;
  hasPartialGeo?: boolean;
  hasExistingCampaigns?: boolean;
  allowIncompleteSave?: boolean;
  presetMismatchInfo?: {
    hasPresets: boolean;
    activePresetName?: string; // set when a preset was applied
    officialPresetName?: string; // full official label for the matching preset
    isDeviated: boolean; // current LGAs no longer match the applied preset
    manuallyMatchesPreset?: boolean; // manual selection matches an official preset
  };
}): ConstituencyBoundaryWarning[] {
  if (!positionRequiresLgas(position)) return [];

  const warnings: ConstituencyBoundaryWarning[] = [];
  const trimmedConstituency = constituencyName?.trim() ?? "";
  const trimmedSuggested = autoSuggestedName?.trim() ?? "";
  const trimmedOfficialPresetName =
    presetMismatchInfo?.officialPresetName?.trim() ?? "";
  const stateLabel = stateName || "this state";
  const hasOfficialMatch = Boolean(
    presetMismatchInfo &&
      ((presetMismatchInfo.activePresetName && !presetMismatchInfo.isDeviated) ||
        presetMismatchInfo.manuallyMatchesPreset),
  );

  if (selectedLgaCount === 0) {
    warnings.push({
      severity: "info",
      title: "Boundary incomplete",
      description: allowIncompleteSave
        ? "This candidate can still be saved during the rollout, but Collect remains blocked until constituency LGAs are added."
        : "Add at least one constituency LGA before continuing.",
    });
  }

  if (
    expectedLgaCount &&
    expectedLgaCount > 0 &&
    selectedLgaCount > 0 &&
    !hasPartialGeo &&
    !hasOfficialMatch
  ) {
    if (selectedLgaCount === expectedLgaCount) {
      warnings.push({
        severity: "warning",
        title: "Full-state coverage selected",
        description: `All ${expectedLgaCount} LGAs in ${stateLabel} are selected. That is unusual for ${position} and should be double-checked before saving.`,
      });
    } else if (
      selectedLgaCount >= 5 &&
      selectedLgaCount / expectedLgaCount >= 0.8
    ) {
      warnings.push({
        severity: "warning",
        title: "Very broad constituency boundary",
        description: `${selectedLgaCount} of ${expectedLgaCount} LGAs are selected in ${stateLabel}. Review the boundary carefully to confirm this is the intended constituency.`,
      });
    }
  }

  if (
    hasOfficialMatch &&
    trimmedConstituency.length > 0 &&
    trimmedOfficialPresetName.length > 0 &&
    trimmedConstituency !== trimmedOfficialPresetName &&
    !labelsRepresentSameBoundary(
      trimmedConstituency,
      trimmedOfficialPresetName,
    )
  ) {
    warnings.push({
      severity: "info",
      title: "Official constituency label changed",
      description: `The selected LGAs match "${trimmedOfficialPresetName}", but the display name was changed. That can be intentional, but it is worth reviewing before launch.`,
    });
  }

  if (
    trimmedConstituency.length > 0 &&
    trimmedSuggested.length > 0 &&
    trimmedConstituency !== trimmedSuggested &&
    !labelsRepresentSameBoundary(trimmedConstituency, trimmedSuggested) &&
    !hasOfficialMatch
  ) {
    warnings.push({
      severity: "info",
      title: "Custom constituency label",
      description: `The display name differs from the selected LGA combination (${trimmedSuggested}). That can be correct for official names, but it is worth reviewing before launch.`,
    });
  }

  if (hasExistingCampaigns) {
    warnings.push({
      severity: "warning",
      title: "Existing campaigns will not auto-sync",
      description:
        "Saving a new candidate boundary does not rewrite existing campaign coverage. Review each active campaign after this update.",
    });
  }

  if (presetMismatchInfo?.hasPresets && selectedLgaCount > 0) {
    if (presetMismatchInfo.isDeviated && presetMismatchInfo.activePresetName) {
      warnings.push({
        severity: "info",
        title: "LGAs deviate from preset",
        description: `The current selection differs from "${presetMismatchInfo.activePresetName}". Verify this is the correct official boundary before saving.`,
      });
    } else if (
      !presetMismatchInfo.activePresetName &&
      !presetMismatchInfo.manuallyMatchesPreset
    ) {
      warnings.push({
        severity: "info",
        title: "No matching official constituency",
        description: `The selected LGAs don't match any known official ${position} constituency. Double-check against INEC records.`,
      });
    }
  }

  return warnings;
}
