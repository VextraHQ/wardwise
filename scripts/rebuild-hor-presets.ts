import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";
import { nigeriaStates } from "../src/lib/data/state-lga-locations";
import { formatGeoDisplayName } from "../src/lib/utils/geo-display";
import {
  findCanonicalLgasInComposition,
  getStateLgaNames,
  OFFICIAL_INEC_XLS_URL,
  resolveWorkbookStateCode,
} from "./constituency-workbook-helpers";

type HorPreset = {
  name: string;
  shortName: string;
  position: "House of Representatives";
  stateCode: string;
  lgaNames: string[];
};

type UnsupportedHorPreset = {
  name: string;
  shortName: string;
  position: "House of Representatives";
  stateCode: string;
  lgaNames: string[];
  sourceCode: string;
  reason: "partial-lga";
  composition: string;
};

type RawSheetRow = [unknown, unknown, unknown, unknown, unknown];

const manualFederalConstituencyOverrides: Record<string, string[]> = {
  // The official workbook omits Auyo from the composition text for FC/145/JG.
  "FC/145/JG": ["Hadejia", "Auyo", "Kafin Hausa"],
  // The official workbook uses "Esan South" here, but the constituency is
  // Esan Central / Esan West / Igueben.
  "FC/101/ED": ["Esan Central", "Esan West", "Igueben"],
};

function parseArgs() {
  const args = process.argv.slice(2);
  const argValue = (name: string) => {
    const inline = args.find((arg) => arg.startsWith(`${name}=`));
    if (inline) {
      return inline.split("=", 2)[1];
    }

    const index = args.findIndex((arg) => arg === name);
    if (index === -1) {
      return undefined;
    }

    return args[index + 1];
  };

  return {
    inputPath: argValue("--input"),
    outputPath:
      argValue("--output") ??
      path.join(
        process.cwd(),
        "src/lib/data/nigerian-federal-constituencies.ts",
      ),
    write: args.includes("--write"),
  };
}

function buildPresetsFromWorkbook(inputPath: string): {
  presets: HorPreset[];
  unsupported: UnsupportedHorPreset[];
} {
  const workbook = XLSX.readFile(inputPath);
  const worksheet = workbook.Sheets["FED. CONST."];

  if (!worksheet) {
    throw new Error('Missing "FED. CONST." sheet in the INEC workbook.');
  }

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  }) as RawSheetRow[];

  const parsedRows = rows
    .map((row) => ({
      serial: Number(row[0]),
      constituencyRaw: String(row[1] ?? "").trim(),
      code: String(row[2] ?? "").trim(),
      composition: String(row[3] ?? "").trim(),
    }))
    .filter((row) => /^FC\/\d{3}\//.test(row.code))
    .map((row) => {
      const officialStateCode = row.code.split("/")[2];
      const stateCode = resolveWorkbookStateCode(officialStateCode);
      const lgaNames =
        manualFederalConstituencyOverrides[row.code] ??
        findCanonicalLgasInComposition(row.composition, stateCode, row.code);

      if (lgaNames.length === 0) {
        throw new Error(
          `Could not resolve any LGAs for ${row.code} (${row.constituencyRaw})`,
        );
      }

      const isUnsupported = /^part of /i.test(row.composition);
      const shortName = isUnsupported
        ? formatGeoDisplayName(row.constituencyRaw.replace(/\s*\/\s*/g, "/"))
        : lgaNames.join("/");

      return {
        serial: row.serial,
        stateCode,
        code: row.code,
        composition: row.composition,
        isUnsupported,
        shortName,
        name: `${shortName} Federal Constituency`,
        lgaNames,
      };
    });

  const presets = parsedRows
    .filter((row) => !row.isUnsupported)
    .sort((a, b) => a.serial - b.serial)
    .map(
      (row) =>
        ({
          name: row.name,
          shortName: row.shortName,
          position: "House of Representatives",
          stateCode: row.stateCode,
          lgaNames: row.lgaNames,
        }) satisfies HorPreset,
    );

  const unsupported = parsedRows
    .filter((row) => row.isUnsupported)
    .sort((a, b) => a.serial - b.serial)
    .map(
      (row) =>
        ({
          name: row.name,
          shortName: row.shortName,
          position: "House of Representatives",
          stateCode: row.stateCode,
          lgaNames: row.lgaNames,
          sourceCode: row.code,
          reason: "partial-lga",
          composition: row.composition,
        }) satisfies UnsupportedHorPreset,
    );

  validatePresets(presets, unsupported);
  return { presets, unsupported };
}

function validatePresets(
  presets: HorPreset[],
  unsupported: UnsupportedHorPreset[],
) {
  if (presets.length !== 350) {
    throw new Error(
      `Expected 350 safe HoR presets, received ${presets.length}.`,
    );
  }

  if (unsupported.length !== 10) {
    throw new Error(
      `Expected 10 unsupported split-LGA HoR rows, received ${unsupported.length}.`,
    );
  }

  const duplicateNames = presets.filter(
    (preset, index) =>
      presets.findIndex((candidate) => candidate.name === preset.name) !==
      index,
  );

  if (duplicateNames.length > 0) {
    throw new Error(
      `Duplicate HoR preset names found: ${duplicateNames.map((preset) => preset.name).join(", ")}`,
    );
  }

  for (const state of nigeriaStates) {
    const canonicalStateLgas = getStateLgaNames(state.code);
    const safeStateLgas = presets
      .filter((preset) => preset.stateCode === state.code)
      .flatMap((preset) => preset.lgaNames);
    const unsupportedStateLgas = unsupported
      .filter((preset) => preset.stateCode === state.code)
      .flatMap((preset) => preset.lgaNames);

    const duplicateSafe = safeStateLgas.filter(
      (name, index) => safeStateLgas.indexOf(name) !== index,
    );
    const safeUnexpected = safeStateLgas.filter(
      (name) => !canonicalStateLgas.includes(name),
    );
    const unsupportedUnexpected = unsupportedStateLgas.filter(
      (name) => !canonicalStateLgas.includes(name),
    );
    const missing = canonicalStateLgas.filter(
      (name) =>
        !safeStateLgas.includes(name) && !unsupportedStateLgas.includes(name),
    );
    const overlap = safeStateLgas.filter((name) =>
      unsupportedStateLgas.includes(name),
    );

    if (
      duplicateSafe.length > 0 ||
      safeUnexpected.length > 0 ||
      unsupportedUnexpected.length > 0 ||
      missing.length > 0 ||
      overlap.length > 0
    ) {
      throw new Error(
        `${state.code} HoR coverage mismatch. Duplicate safe LGAs: ${[...new Set(duplicateSafe)].join(", ") || "none"} | Missing: ${missing.join(", ") || "none"} | Safe unexpected: ${safeUnexpected.join(", ") || "none"} | Unsupported unexpected: ${unsupportedUnexpected.join(", ") || "none"} | Safe/unsupported overlap: ${[...new Set(overlap)].join(", ") || "none"}`,
      );
    }
  }
}

function renderFile(
  presets: HorPreset[],
  unsupported: UnsupportedHorPreset[],
): string {
  const presetEntries = presets
    .map((preset) => {
      const lgaNames = preset.lgaNames
        .map((lgaName) => `      ${JSON.stringify(lgaName)},`)
        .join("\n");

      return `  {\n    name: ${JSON.stringify(preset.name)},\n    shortName: ${JSON.stringify(preset.shortName)},\n    position: "House of Representatives",\n    stateCode: ${JSON.stringify(preset.stateCode)},\n    lgaNames: [\n${lgaNames}\n    ],\n  },`;
    })
    .join("\n");

  const unsupportedEntries = unsupported
    .map((preset) => {
      const lgaNames = preset.lgaNames
        .map((lgaName) => `      ${JSON.stringify(lgaName)},`)
        .join("\n");

      return `  {\n    name: ${JSON.stringify(preset.name)},\n    shortName: ${JSON.stringify(preset.shortName)},\n    position: "House of Representatives",\n    stateCode: ${JSON.stringify(preset.stateCode)},\n    lgaNames: [\n${lgaNames}\n    ],\n    sourceCode: ${JSON.stringify(preset.sourceCode)},\n    reason: "partial-lga",\n    composition: ${JSON.stringify(preset.composition)},\n  },`;
    })
    .join("\n");

  return `/**\n * Generated from the official INEC spreadsheet:\n * ${OFFICIAL_INEC_XLS_URL}\n * Rebuild with \`tsx scripts/rebuild-hor-presets.ts --input /absolute/path/to/inec-constituencies.xls --write\`.\n *\n * Notes:\n * - This file only includes safe whole-LGA House of Representatives presets.\n * - 10 official constituencies are intentionally excluded from the preset dropdown because they are split inside a single LGA and need finer-grained boundary support.\n * - Validation fails if the output is not exactly 350 safe presets + 10 unsupported split-LGA rows.\n */\n\nimport type {\n  ConstituencyPreset,\n  UnsupportedConstituencyPreset,\n} from "./nigerian-constituencies";\n\nexport const horPresets = [\n${presetEntries}\n] satisfies ConstituencyPreset[];\n\nexport const unsupportedHorPresets = [\n${unsupportedEntries}\n] satisfies UnsupportedConstituencyPreset[];\n`;
}

async function main() {
  const { inputPath, outputPath, write } = parseArgs();

  if (!inputPath) {
    throw new Error(
      "Missing --input=/absolute/path/to/inec-constituencies.xls",
    );
  }

  const { presets, unsupported } = buildPresetsFromWorkbook(inputPath);
  const output = renderFile(presets, unsupported);

  console.log(
    `Parsed ${presets.length} safe HoR presets and ${unsupported.length} unsupported split-LGA rows from ${path.basename(inputPath)}`,
  );
  console.log(`Output target: ${outputPath}`);

  if (!write) {
    console.log(
      "\nDry run only. Re-run with --write to update the generated file.",
    );
    return;
  }

  fs.writeFileSync(outputPath, output);
  console.log(`\nWrote ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
