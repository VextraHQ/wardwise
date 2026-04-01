// Constituency helpers — shared between candidate and campaign modules
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
}): ConstituencyBoundaryWarning[] {
  if (!positionRequiresLgas(position)) return [];

  const warnings: ConstituencyBoundaryWarning[] = [];
  const trimmedConstituency = constituencyName?.trim() ?? "";
  const trimmedSuggested = autoSuggestedName?.trim() ?? "";
  const stateLabel = stateName || "this state";

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
    !hasPartialGeo
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
    trimmedConstituency.length > 0 &&
    trimmedSuggested.length > 0 &&
    trimmedConstituency !== trimmedSuggested
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

  return warnings;
}
