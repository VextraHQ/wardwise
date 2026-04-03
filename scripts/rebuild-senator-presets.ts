import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";
import { nigeriaStates } from "../src/lib/data/state-lga-locations";
import {
  buildStateLgaLookup,
  getStateLgaNames,
  OFFICIAL_INEC_XLS_URL,
  resolveWorkbookStateCode,
  resolveWorkbookToken,
} from "./constituency-workbook-helpers";

type SenatorPreset = {
  name: string;
  shortName: string;
  position: "Senator";
  stateCode: string;
  lgaNames: string[];
};

type RawSheetRow = [unknown, unknown, unknown, unknown, unknown];

const manualDistrictOverrides = {
  "SD/004/AD": [
    "Madagali",
    "Maiha",
    "Michika",
    "Mubi North",
    "Mubi South",
    "Gombi",
  ],
  "SD/054/KD": [
    "Jema'a",
    "Jaba",
    "Kaura",
    "Zango Kataf",
    "Kauru",
    "Kachia",
    "Kagarko",
    "Sanga",
  ],
  "SD/077/NG": [
    "Agwara",
    "Borgu",
    "Kontagora",
    "Mariga",
    "Rijau",
    "Wushishi",
    "Mashegu",
    "Magama",
  ],
} as Record<string, string[]>;

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
      path.join(process.cwd(), "src/lib/data/nigerian-senatorial-districts.ts"),
    write: args.includes("--write"),
  };
}

function tokenizeComposition(composition: string): string[] {
  return composition
    .replace(/&/g, ",")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function formatDistrictLabel(rawValue: string) {
  const cleaned = rawValue
    .replace(/[–—]/g, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned === "FEDERAL CAPITAL TERRITORY") {
    return {
      shortName: "FCT",
      name: "Federal Capital Territory Senatorial District",
    };
  }

  const titleCased = cleaned
    .toLowerCase()
    .split(/([ -])/)
    .map((part) =>
      /^[a-z]/.test(part) ? part.charAt(0).toUpperCase() + part.slice(1) : part,
    )
    .join("");

  return {
    shortName: titleCased,
    name: `${titleCased} Senatorial District`,
  };
}

function buildPresetsFromWorkbook(inputPath: string): SenatorPreset[] {
  const workbook = XLSX.readFile(inputPath);
  const worksheet = workbook.Sheets["SEN. DIST."];

  if (!worksheet) {
    throw new Error('Missing "SEN. DIST." sheet in the INEC workbook.');
  }

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  }) as RawSheetRow[];

  const presetsWithCodes = rows
    .map((row) => ({
      serial: Number(row[0]),
      districtRaw: String(row[1] ?? "").trim(),
      code: String(row[2] ?? "").trim(),
      composition: String(row[3] ?? "").trim(),
    }))
    .filter((row) => /^SD\/\d{3}\//.test(row.code))
    .map((row) => {
      const officialStateCode = row.code.split("/")[2];
      const stateCode = resolveWorkbookStateCode(officialStateCode);

      const { shortName, name } = formatDistrictLabel(row.districtRaw);
      const stateLgasByNormalizedName = buildStateLgaLookup(stateCode);

      const lgaNames =
        manualDistrictOverrides[row.code] ??
        tokenizeComposition(row.composition).map((rawToken) => {
          const resolved = resolveWorkbookToken(
            rawToken,
            row.code,
            stateLgasByNormalizedName,
          );

          if (resolved?.length === 1) {
            return resolved[0];
          }

          throw new Error(
            `Unmatched token "${rawToken}" in ${row.code} (${row.districtRaw}) for state ${stateCode}`,
          );
        });

      return {
        code: row.code,
        serial: row.serial,
        preset: {
          name,
          shortName,
          position: "Senator" as const,
          stateCode,
          lgaNames,
        },
      };
    });

  const presets = presetsWithCodes
    .sort((a, b) => a.serial - b.serial)
    .map((entry) => entry.preset);

  validatePresets(presets);
  return presets;
}

function validatePresets(presets: SenatorPreset[]) {
  if (presets.length !== 109) {
    throw new Error(
      `Expected 109 Senator presets, received ${presets.length}.`,
    );
  }

  const duplicatePresetNames = presets.filter(
    (preset, index) =>
      presets.findIndex((candidate) => candidate.name === preset.name) !==
      index,
  );

  if (duplicatePresetNames.length > 0) {
    throw new Error(
      `Duplicate preset names found: ${duplicatePresetNames.map((preset) => preset.name).join(", ")}`,
    );
  }

  for (const state of nigeriaStates) {
    const statePresets = presets.filter(
      (preset) => preset.stateCode === state.code,
    );
    const expectedDistrictCount = state.code === "FC" ? 1 : 3;

    if (statePresets.length !== expectedDistrictCount) {
      throw new Error(
        `${state.code} should have ${expectedDistrictCount} Senator presets but has ${statePresets.length}.`,
      );
    }

    const canonicalStateLgas = getStateLgaNames(state.code);

    const usedStateLgas = statePresets.flatMap((preset) => preset.lgaNames);
    const duplicateLgas = usedStateLgas.filter(
      (name, index) => usedStateLgas.indexOf(name) !== index,
    );
    const missingLgas = canonicalStateLgas.filter(
      (name) => !usedStateLgas.includes(name),
    );
    const unexpectedLgas = usedStateLgas.filter(
      (name) => !canonicalStateLgas.includes(name),
    );

    if (
      duplicateLgas.length > 0 ||
      missingLgas.length > 0 ||
      unexpectedLgas.length > 0
    ) {
      throw new Error(
        `${state.code} Senator coverage mismatch. Duplicate: ${[...new Set(duplicateLgas)].join(", ") || "none"} | Missing: ${missingLgas.join(", ") || "none"} | Unexpected: ${unexpectedLgas.join(", ") || "none"}`,
      );
    }
  }
}

function renderFile(presets: SenatorPreset[]) {
  const entries = presets
    .map((preset) => {
      const lgaNames = preset.lgaNames
        .map((lgaName) => `      ${JSON.stringify(lgaName)},`)
        .join("\n");

      return `  {\n    name: ${JSON.stringify(preset.name)},\n    shortName: ${JSON.stringify(preset.shortName)},\n    position: "Senator",\n    stateCode: ${JSON.stringify(preset.stateCode)},\n    lgaNames: [\n${lgaNames}\n    ],\n  },`;
    })
    .join("\n");

  return `/**\n * Generated from the official INEC spreadsheet:\n * ${OFFICIAL_INEC_XLS_URL}\n * Rebuild with \`tsx scripts/rebuild-senator-presets.ts --input /absolute/path/to/inec-constituencies.xls --write\`.\n *\n * Notes:\n * - The script normalizes legacy spellings in the 2011 INEC sheet to the current canonical LGA names used by WardWise.\n * - A small number of rows require explicit source repair to satisfy exact per-state LGA coverage (for example Adamawa North and Kaduna South).\n * - Validation fails if the output is not exactly 109 districts or if any state's LGAs are not covered exactly once.\n */\n\nimport type { ConstituencyPreset } from "./nigerian-constituencies";\n\nexport const senatorPresets = [\n${entries}\n] satisfies ConstituencyPreset[];\n`;
}

async function main() {
  const { inputPath, outputPath, write } = parseArgs();

  if (!inputPath) {
    throw new Error(
      "Missing --input=/absolute/path/to/inec-constituencies.xls",
    );
  }

  const presets = buildPresetsFromWorkbook(inputPath);
  const output = renderFile(presets);

  console.log(
    `Parsed ${presets.length} official Senator presets from ${path.basename(inputPath)}`,
  );
  console.log(
    `Validated exact LGA coverage across ${nigeriaStates.length} states/FCT`,
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
