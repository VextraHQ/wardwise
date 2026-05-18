/**
 * Official INEC constituency definitions for Nigeria.
 *
 * Senatorial districts are generated from the official INEC spreadsheet via
 * `scripts/rebuild-senator-presets.ts`.
 *
 * House of Representatives presets are generated from the same official INEC
 * workbook via `scripts/rebuild-hor-presets.ts`.
 *
 * The HoR rollout only ships whole-LGA constituencies. A small number of
 * official seats are intentionally excluded from the preset dropdown because
 * they split inside a single LGA and need finer-grained boundary support than
 * the current `constituencyLgaIds` model can represent.
 *
 * State Assembly presets are still pending for the same finer-grained boundary
 * reason, but at a larger scale.
 */

import { senatorPresets } from "./nigerian-senatorial-districts";
import {
  horPresets,
  unsupportedHorPresets,
} from "./nigerian-federal-constituencies";

export type ConstituencyPreset = {
  name: string;
  shortName: string;
  position: "Senator" | "House of Representatives" | "State Assembly";
  stateCode: string;
  lgaNames: string[];
};

export type UnsupportedConstituencyPreset = {
  name: string;
  shortName: string;
  position: "House of Representatives" | "State Assembly";
  stateCode: string;
  lgaNames: string[];
  sourceCode: string;
  reason: "partial-lga";
  composition: string;
};

export const constituencyPresets: ConstituencyPreset[] = [
  ...senatorPresets,
  ...horPresets,
];

export const unsupportedConstituencyPresets: UnsupportedConstituencyPreset[] = [
  ...unsupportedHorPresets,
];

/**
 * Returns all constituency presets for a given position + state combination.
 * Returns empty array if no presets are defined yet.
 */
export function getPresetsForState(
  position: "Senator" | "House of Representatives" | "State Assembly",
  stateCode: string,
): ConstituencyPreset[] {
  return constituencyPresets.filter(
    (preset) => preset.position === position && preset.stateCode === stateCode,
  );
}

export function getUnsupportedPresetsForState(
  position: "House of Representatives" | "State Assembly",
  stateCode: string,
): UnsupportedConstituencyPreset[] {
  return unsupportedConstituencyPresets.filter(
    (preset) => preset.position === position && preset.stateCode === stateCode,
  );
}
