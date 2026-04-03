import {
  nigeriaLGAs,
  nigeriaStates,
  type LGAData,
  type StateData,
} from "../src/lib/data/state-lga-locations";

export type CanonicalState = StateData;
export type CanonicalLga = LGAData;

export function makeLgaKey(name: string, stateCode: string): string {
  return `${stateCode}|${name}`;
}

export function normalizeGeoName(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['".,;:%#()]/g, " ")
    .replace(/[-/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized
    .replace(/\bnassarawa\b/g, "nasarawa")
    .replace(/\beggon\b/g, "eggon")
    .replace(/\bfurore\b/g, "fufore")
    .replace(/\bgerfi\b/g, "girei")
    .replace(/\bbekwara\b/g, "bekwarra")
    .replace(/\bigbo ekiti\b/g, "igbo etiti")
    .replace(/\bkolokuna\b/g, "kolokuma")
    .replace(/\banyamelum\b/g, "ayamelum")
    .replace(/\bdunkofia\b/g, "dunukofia")
    .replace(/\bekusigo\b/g, "ekwusigo")
    .replace(/\bnember\b/g, "nembe")
    .replace(/\bshomgom\b/g, "shongom")
    .replace(/\bisiukwuato\b/g, "isuikwuato")
    .replace(/\bisukwuato\b/g, "isuikwuato")
    .replace(/\bumunneochi\b/g, "umu nneochi")
    .replace(/\bnsit atai\b/g, "nsit atai")
    .replace(/\bnsit ibom\b/g, "nsit ibom")
    .replace(/\bnsit ubium\b/g, "nsit ubium")
    .replace(/\bori ire\b/g, "oriire")
    .replace(/\boruk anam\b/g, "oruk anam")
    .replace(/\bobot akara\b/g, "obot akara")
    .replace(/\burue offong oruko\b/g, "urue offong oruko")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseSelectedStateCodes(argv: string[]): string[] | undefined {
  const rawValues = argv
    .filter((arg) => arg.startsWith("--state=") || arg.startsWith("--states="))
    .flatMap((arg) => arg.split("=", 2)[1]?.split(",") ?? [])
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);

  if (rawValues.length === 0) return undefined;

  const validCodes = new Set(nigeriaStates.map((state) => state.code));
  const invalidCodes = rawValues.filter((code) => !validCodes.has(code));

  if (invalidCodes.length > 0) {
    throw new Error(
      `Invalid state code(s): ${invalidCodes.join(", ")}. Expected one of ${nigeriaStates.map((state) => state.code).join(", ")}`,
    );
  }

  return [...new Set(rawValues)];
}

export function getCanonicalStates(
  selectedStateCodes?: string[],
): CanonicalState[] {
  if (!selectedStateCodes || selectedStateCodes.length === 0) {
    return nigeriaStates;
  }

  const selected = new Set(selectedStateCodes);
  return nigeriaStates.filter((state) => selected.has(state.code));
}

export function getCanonicalLgas(
  selectedStateCodes?: string[],
): CanonicalLga[] {
  if (!selectedStateCodes || selectedStateCodes.length === 0) {
    return nigeriaLGAs;
  }

  const selected = new Set(selectedStateCodes);
  return nigeriaLGAs.filter((lga) => selected.has(lga.stateCode));
}

export type CanonicalStateCoverage = {
  stateCode: string;
  stateName: string;
  canonicalCount: number;
  dbCount: number;
  missingCount: number;
};

export function buildCoverageByState(
  states: CanonicalState[],
  canonicalLgas: CanonicalLga[],
  dbLgas: Array<{ stateCode: string }>,
): CanonicalStateCoverage[] {
  return states.map((state) => {
    const canonicalCount = canonicalLgas.filter(
      (lga) => lga.stateCode === state.code,
    ).length;
    const dbCount = dbLgas.filter((lga) => lga.stateCode === state.code).length;

    return {
      stateCode: state.code,
      stateName: state.name,
      canonicalCount,
      dbCount,
      missingCount: canonicalCount - dbCount,
    };
  });
}
