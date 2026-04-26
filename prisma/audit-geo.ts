import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import {
  buildCoverageByState,
  getCanonicalLgas,
  getCanonicalStates,
  makeLgaKey,
  normalizeGeoName,
  parseSelectedStateCodes,
} from "./geo-canonical";

config();

const prisma = new PrismaClient();

type DbLga = {
  id: number;
  name: string;
  stateCode: string;
};

type SpreadsheetEscapeArtifact = {
  model: "Lga" | "Ward" | "PollingUnit";
  field: "name" | "code";
  id: number;
  value: string;
  stateCode: string;
  lgaName?: string;
  wardName?: string;
};

const SPREADSHEET_ESCAPE_PREFIXES = ["'=", "'+", "'-", "'@"] as const;

function hasSpreadsheetEscapeArtifact(
  value: string | null | undefined,
): value is string {
  return Boolean(
    value &&
    SPREADSHEET_ESCAPE_PREFIXES.some((prefix) => value.startsWith(prefix)),
  );
}

function countSpreadsheetEscapeArtifacts(
  artifacts: SpreadsheetEscapeArtifact[],
): {
  lgaName: number;
  wardName: number;
  wardCode: number;
  pollingUnitName: number;
  pollingUnitCode: number;
} {
  return artifacts.reduce(
    (counts, artifact) => {
      if (artifact.model === "Lga" && artifact.field === "name") {
        counts.lgaName += 1;
      } else if (artifact.model === "Ward" && artifact.field === "name") {
        counts.wardName += 1;
      } else if (artifact.model === "Ward" && artifact.field === "code") {
        counts.wardCode += 1;
      } else if (
        artifact.model === "PollingUnit" &&
        artifact.field === "name"
      ) {
        counts.pollingUnitName += 1;
      } else if (
        artifact.model === "PollingUnit" &&
        artifact.field === "code"
      ) {
        counts.pollingUnitCode += 1;
      }

      return counts;
    },
    {
      lgaName: 0,
      wardName: 0,
      wardCode: 0,
      pollingUnitName: 0,
      pollingUnitCode: 0,
    },
  );
}

function printSection(title: string) {
  console.log(`\n=== ${title} ===`);
}

async function main() {
  const args = process.argv.slice(2);
  const selectedStateCodes = parseSelectedStateCodes(args);
  const jsonOutput = args.includes("--json");

  const canonicalStates = getCanonicalStates(selectedStateCodes);
  const canonicalLgas = getCanonicalLgas(selectedStateCodes);
  const dbLgas = await prisma.lga.findMany({
    where:
      selectedStateCodes && selectedStateCodes.length > 0
        ? { stateCode: { in: selectedStateCodes } }
        : undefined,
    orderBy: [{ stateCode: "asc" }, { name: "asc" }],
    select: { id: true, name: true, stateCode: true },
  });
  const suspiciousWards = await prisma.ward.findMany({
    where: {
      ...(selectedStateCodes && selectedStateCodes.length > 0
        ? { lga: { stateCode: { in: selectedStateCodes } } }
        : {}),
      OR: [
        ...SPREADSHEET_ESCAPE_PREFIXES.map((prefix) => ({
          name: { startsWith: prefix },
        })),
        ...SPREADSHEET_ESCAPE_PREFIXES.map((prefix) => ({
          code: { startsWith: prefix },
        })),
      ],
    },
    orderBy: [
      { lga: { stateCode: "asc" } },
      { lga: { name: "asc" } },
      { name: "asc" },
    ],
    select: {
      id: true,
      name: true,
      code: true,
      lga: {
        select: {
          name: true,
          stateCode: true,
        },
      },
    },
  });
  const suspiciousPollingUnits = await prisma.pollingUnit.findMany({
    where: {
      ...(selectedStateCodes && selectedStateCodes.length > 0
        ? { ward: { lga: { stateCode: { in: selectedStateCodes } } } }
        : {}),
      OR: [
        ...SPREADSHEET_ESCAPE_PREFIXES.map((prefix) => ({
          name: { startsWith: prefix },
        })),
        ...SPREADSHEET_ESCAPE_PREFIXES.map((prefix) => ({
          code: { startsWith: prefix },
        })),
      ],
    },
    orderBy: [
      { ward: { lga: { stateCode: "asc" } } },
      { ward: { lga: { name: "asc" } } },
      { ward: { name: "asc" } },
      { name: "asc" },
    ],
    select: {
      id: true,
      name: true,
      code: true,
      ward: {
        select: {
          name: true,
          lga: {
            select: {
              name: true,
              stateCode: true,
            },
          },
        },
      },
    },
  });

  const canonicalKeys = new Set(
    canonicalLgas.map((lga) => makeLgaKey(lga.name, lga.stateCode)),
  );
  const dbKeys = new Set(
    dbLgas.map((lga) => makeLgaKey(lga.name, lga.stateCode)),
  );

  const missingCanonical = canonicalLgas.filter(
    (lga) => !dbKeys.has(makeLgaKey(lga.name, lga.stateCode)),
  );
  const unexpectedDb = dbLgas.filter(
    (lga) => !canonicalKeys.has(makeLgaKey(lga.name, lga.stateCode)),
  );

  const duplicateMap = new Map<string, DbLga[]>();
  for (const lga of dbLgas) {
    const key = makeLgaKey(lga.name, lga.stateCode);
    const rows = duplicateMap.get(key) ?? [];
    rows.push(lga);
    duplicateMap.set(key, rows);
  }
  const duplicateRows = Array.from(duplicateMap.entries())
    .filter(([, rows]) => rows.length > 1)
    .map(([key, rows]) => ({ key, ids: rows.map((row) => row.id) }));

  const driftCandidates = unexpectedDb
    .map((row) => {
      const normalized = normalizeGeoName(row.name);
      const canonicalMatch = canonicalLgas.find(
        (canonical) =>
          canonical.stateCode === row.stateCode &&
          normalizeGeoName(canonical.name) === normalized,
      );

      return canonicalMatch
        ? {
            stateCode: row.stateCode,
            dbName: row.name,
            canonicalName: canonicalMatch.name,
          }
        : null;
    })
    .filter((candidate): candidate is NonNullable<typeof candidate> =>
      Boolean(candidate),
    );

  const spreadsheetEscapeArtifacts: SpreadsheetEscapeArtifact[] = [
    ...dbLgas
      .filter((lga) => hasSpreadsheetEscapeArtifact(lga.name))
      .map((lga) => ({
        model: "Lga" as const,
        field: "name" as const,
        id: lga.id,
        value: lga.name,
        stateCode: lga.stateCode,
      })),
    ...suspiciousWards.flatMap((ward) => [
      ...(hasSpreadsheetEscapeArtifact(ward.name)
        ? [
            {
              model: "Ward" as const,
              field: "name" as const,
              id: ward.id,
              value: ward.name,
              stateCode: ward.lga.stateCode,
              lgaName: ward.lga.name,
            },
          ]
        : []),
      ...(hasSpreadsheetEscapeArtifact(ward.code)
        ? [
            {
              model: "Ward" as const,
              field: "code" as const,
              id: ward.id,
              value: ward.code,
              stateCode: ward.lga.stateCode,
              lgaName: ward.lga.name,
            },
          ]
        : []),
    ]),
    ...suspiciousPollingUnits.flatMap((pollingUnit) => [
      ...(hasSpreadsheetEscapeArtifact(pollingUnit.name)
        ? [
            {
              model: "PollingUnit" as const,
              field: "name" as const,
              id: pollingUnit.id,
              value: pollingUnit.name,
              stateCode: pollingUnit.ward.lga.stateCode,
              lgaName: pollingUnit.ward.lga.name,
              wardName: pollingUnit.ward.name,
            },
          ]
        : []),
      ...(hasSpreadsheetEscapeArtifact(pollingUnit.code)
        ? [
            {
              model: "PollingUnit" as const,
              field: "code" as const,
              id: pollingUnit.id,
              value: pollingUnit.code,
              stateCode: pollingUnit.ward.lga.stateCode,
              lgaName: pollingUnit.ward.lga.name,
              wardName: pollingUnit.ward.name,
            },
          ]
        : []),
    ]),
  ];
  const spreadsheetEscapeArtifactCounts = countSpreadsheetEscapeArtifacts(
    spreadsheetEscapeArtifacts,
  );

  const coverage = buildCoverageByState(canonicalStates, canonicalLgas, dbLgas);
  const seededStates = coverage.filter((state) => state.dbCount > 0).length;
  const fullySeededStates = coverage.filter(
    (state) => state.dbCount === state.canonicalCount,
  ).length;

  const payload = {
    scope: selectedStateCodes ?? "ALL",
    canonical: {
      states: canonicalStates.length,
      lgas: canonicalLgas.length,
    },
    database: {
      lgas: dbLgas.length,
      seededStates,
      fullySeededStates,
    },
    duplicates: duplicateRows,
    missingCanonical,
    unexpectedDb,
    driftCandidates,
    spreadsheetEscapeArtifacts: {
      total: spreadsheetEscapeArtifacts.length,
      counts: spreadsheetEscapeArtifactCounts,
      rows: spreadsheetEscapeArtifacts,
    },
    coverage,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log("Geo audit summary");
  console.log(
    `Scope: ${Array.isArray(payload.scope) ? payload.scope.join(", ") : payload.scope}`,
  );
  console.log(
    `Canonical source: ${payload.canonical.states} states, ${payload.canonical.lgas} LGAs`,
  );
  console.log(
    `Database: ${payload.database.lgas} LGAs across ${payload.database.seededStates}/${payload.canonical.states} states (${payload.database.fullySeededStates} fully seeded)`,
  );

  printSection("Coverage By State");
  for (const state of coverage) {
    const label =
      state.dbCount === 0
        ? "NOT SEEDED"
        : state.dbCount === state.canonicalCount
          ? "COMPLETE"
          : "PARTIAL";

    console.log(
      `${state.stateCode} ${state.stateName}: ${state.dbCount}/${state.canonicalCount} (${label})`,
    );
  }

  printSection("Duplicates");
  if (duplicateRows.length === 0) {
    console.log("No duplicate (stateCode, name) rows found.");
  } else {
    for (const row of duplicateRows) {
      console.log(`${row.key} -> ids: ${row.ids.join(", ")}`);
    }
  }

  printSection("Missing Canonical LGAs");
  if (missingCanonical.length === 0) {
    console.log("No canonical LGAs missing from the database.");
  } else {
    console.log(`Missing ${missingCanonical.length} LGAs.`);
    for (const lga of missingCanonical.slice(0, 40)) {
      console.log(`${lga.stateCode} | ${lga.name}`);
    }
    if (missingCanonical.length > 40) {
      console.log(`...and ${missingCanonical.length - 40} more`);
    }
  }

  printSection("Unexpected DB LGAs");
  if (unexpectedDb.length === 0) {
    console.log("No non-canonical LGAs found in the database.");
  } else {
    console.log(
      `Found ${unexpectedDb.length} DB rows not present in canonical source.`,
    );
    for (const lga of unexpectedDb.slice(0, 20)) {
      console.log(`${lga.stateCode} | ${lga.name} (id=${lga.id})`);
    }
    if (unexpectedDb.length > 20) {
      console.log(`...and ${unexpectedDb.length - 20} more`);
    }
  }

  printSection("Likely Drift Candidates");
  if (driftCandidates.length === 0) {
    console.log("No likely spelling-drift candidates found.");
  } else {
    for (const drift of driftCandidates) {
      console.log(
        `${drift.stateCode} | DB "${drift.dbName}" ≈ canonical "${drift.canonicalName}"`,
      );
    }
  }

  printSection("Spreadsheet Escape Artifacts");
  if (spreadsheetEscapeArtifacts.length === 0) {
    console.log(
      "No suspicious leading apostrophe spreadsheet-escape artifacts found.",
    );
  } else {
    console.log(
      `Found ${spreadsheetEscapeArtifacts.length} suspicious value(s) that look like spreadsheet-escape remnants.`,
    );
    console.log(`Lga.name: ${spreadsheetEscapeArtifactCounts.lgaName}`);
    console.log(`Ward.name: ${spreadsheetEscapeArtifactCounts.wardName}`);
    console.log(`Ward.code: ${spreadsheetEscapeArtifactCounts.wardCode}`);
    console.log(
      `PollingUnit.name: ${spreadsheetEscapeArtifactCounts.pollingUnitName}`,
    );
    console.log(
      `PollingUnit.code: ${spreadsheetEscapeArtifactCounts.pollingUnitCode}`,
    );

    for (const artifact of spreadsheetEscapeArtifacts.slice(0, 40)) {
      const scope =
        artifact.model === "Lga"
          ? `${artifact.stateCode}`
          : artifact.model === "Ward"
            ? `${artifact.stateCode} | ${artifact.lgaName}`
            : `${artifact.stateCode} | ${artifact.lgaName} | ${artifact.wardName}`;

      console.log(
        `${artifact.model}.${artifact.field} | ${scope} | id=${artifact.id} | ${artifact.value}`,
      );
    }

    if (spreadsheetEscapeArtifacts.length > 40) {
      console.log(
        `...and ${spreadsheetEscapeArtifacts.length - 40} more suspicious value(s)`,
      );
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
