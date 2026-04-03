import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import {
  buildCoverageByState,
  getCanonicalLgas,
  getCanonicalStates,
  makeLgaKey,
  parseSelectedStateCodes,
} from "./geo-canonical";

config();

const prisma = new PrismaClient();

function printSection(title: string) {
  console.log(`\n=== ${title} ===`);
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const selectedStateCodes = parseSelectedStateCodes(args);

  const canonicalStates = getCanonicalStates(selectedStateCodes);
  const canonicalLgas = getCanonicalLgas(selectedStateCodes);
  const dbLgas = await prisma.lga.findMany({
    where:
      selectedStateCodes && selectedStateCodes.length > 0
        ? { stateCode: { in: selectedStateCodes } }
        : undefined,
    select: { name: true, stateCode: true },
  });

  const dbKeys = new Set(
    dbLgas.map((lga) => makeLgaKey(lga.name, lga.stateCode)),
  );
  const missing = canonicalLgas.filter(
    (lga) => !dbKeys.has(makeLgaKey(lga.name, lga.stateCode)),
  );
  const coverageBefore = buildCoverageByState(
    canonicalStates,
    canonicalLgas,
    dbLgas,
  );

  console.log("Canonical state/LGA seed");
  console.log(
    `Mode: ${apply ? "APPLY" : "DRY RUN"} | Scope: ${selectedStateCodes?.join(", ") ?? "ALL STATES"}`,
  );
  console.log(
    `Canonical LGAs: ${canonicalLgas.length} | Existing DB LGAs in scope: ${dbLgas.length} | Missing: ${missing.length}`,
  );

  printSection("Coverage Before");
  for (const state of coverageBefore) {
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

  if (missing.length > 0) {
    printSection("Missing LGAs To Create");
    for (const lga of missing.slice(0, 50)) {
      console.log(`${lga.stateCode} | ${lga.name}`);
    }
    if (missing.length > 50) {
      console.log(`...and ${missing.length - 50} more`);
    }
  }

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to write missing LGAs.");
    return;
  }

  if (missing.length === 0) {
    console.log(
      "\nNothing to create. Canonical LGAs already exist for this scope.",
    );
    return;
  }

  await prisma.lga.createMany({
    data: missing.map((lga) => ({
      name: lga.name,
      stateCode: lga.stateCode,
    })),
    skipDuplicates: true,
  });

  const finalDbLgas = await prisma.lga.findMany({
    where:
      selectedStateCodes && selectedStateCodes.length > 0
        ? { stateCode: { in: selectedStateCodes } }
        : undefined,
    select: { stateCode: true },
  });
  const coverageAfter = buildCoverageByState(
    canonicalStates,
    canonicalLgas,
    finalDbLgas,
  );

  printSection("Coverage After");
  for (const state of coverageAfter) {
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

  console.log(
    `\nCreated up to ${missing.length} missing LGAs (duplicates skipped safely).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
