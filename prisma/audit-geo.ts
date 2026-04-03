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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
