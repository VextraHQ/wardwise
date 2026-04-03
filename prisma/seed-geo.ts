import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { nigeriaLGAs } from "../src/lib/data/state-lga-locations";
import { wards } from "../src/lib/data/wards";
import { getPollingUnitsByWard } from "../src/lib/data/polling-units";

config();

const prisma = new PrismaClient();
const OFFICIAL_STATE_SYNC_EXCLUSIONS = new Set(["AD"]);

/**
 * Partial geo seed for the current static ward + polling unit files.
 * This is NOT the canonical national state/LGA seed.
 *
 * Use `seed-states-lgas.ts` for the canonical all-states/all-LGAs rollout.
 * Keep this script for demo data and partial ward/PU seeding while runtime geo
 * is still transitioning fully into the database.
 *
 * Seeds all LGAs that have ward + polling unit data in /lib/data/.
 * Idempotent: uses unique lookups + upsert logic, safe to re-run.
 * Skips LGAs with no ward data gracefully.
 */
async function main() {
  console.log("Seeding geo data (all LGAs with ward data)...\n");

  // Discover which LGA codes actually have ward data
  const lgaCodesWithWards = new Set(wards.map((w) => w.lgaCode));

  // Filter to LGAs that have ward data and are still managed by this legacy seed.
  // States migrated to official state-level ward/PU syncs should be excluded here
  // so this partial seed cannot re-introduce stale demo rows.
  const seedableLgas = nigeriaLGAs.filter(
    (lga) =>
      lgaCodesWithWards.has(lga.code) &&
      !OFFICIAL_STATE_SYNC_EXCLUSIONS.has(lga.stateCode),
  );

  console.log(
    `Found ${seedableLgas.length} LGAs with ward data: ${seedableLgas.map((l) => l.code).join(", ")}\n`,
  );

  let totalWardsCreated = 0;
  let totalPusCreated = 0;
  let totalPusUpdated = 0;

  for (const lgaData of seedableLgas) {
    // Upsert LGA by unique (name + stateCode)
    let lga = await prisma.lga.findFirst({
      where: { name: lgaData.name, stateCode: lgaData.stateCode },
    });

    if (!lga) {
      lga = await prisma.lga.create({
        data: { name: lgaData.name, stateCode: lgaData.stateCode },
      });
      console.log(
        `+ LGA created: ${lgaData.name} (${lgaData.code}) -> id=${lga.id}`,
      );
    } else {
      console.log(
        `  LGA exists: ${lgaData.name} (${lgaData.code}) -> id=${lga.id}`,
      );
    }

    // Get wards for this LGA from file data
    const lgaWards = wards.filter((w) => w.lgaCode === lgaData.code);

    for (const wardData of lgaWards) {
      // Upsert ward by unique (name + lgaId)
      let ward = await prisma.ward.findFirst({
        where: { name: wardData.name, lgaId: lga.id },
      });

      if (!ward) {
        ward = await prisma.ward.create({
          data: { name: wardData.name, lgaId: lga.id },
        });
        totalWardsCreated++;
      }

      // Get polling units for this ward (real INEC data or generated fallback)
      const pus = getPollingUnitsByWard(wardData.code);

      let created = 0;
      let updated = 0;

      for (const pu of pus) {
        // Check by (name + wardId) — the natural unique key
        const existing = await prisma.pollingUnit.findFirst({
          where: { name: pu.name, wardId: ward.id },
        });

        if (!existing) {
          await prisma.pollingUnit.create({
            data: {
              code: pu.code || "",
              name: pu.name,
              wardId: ward.id,
            },
          });
          created++;
        } else if (pu.code && existing.code !== pu.code) {
          // Backfill or fix code on existing record
          await prisma.pollingUnit.update({
            where: { id: existing.id },
            data: { code: pu.code },
          });
          updated++;
        }
      }

      totalPusCreated += created;
      totalPusUpdated += updated;

      if (created > 0 || updated > 0) {
        console.log(
          `    Ward: ${wardData.name} -> ${created} PUs created, ${updated} codes updated`,
        );
      }
    }
  }

  // Print summary
  const lgaCount = await prisma.lga.count();
  const wardCount = await prisma.ward.count();
  const puCount = await prisma.pollingUnit.count();

  console.log("\n=== Summary ===");
  console.log(`New wards created: ${totalWardsCreated}`);
  console.log(`New PUs created: ${totalPusCreated}`);
  console.log(`PU codes updated: ${totalPusUpdated}`);
  console.log(
    `Totals in DB: ${lgaCount} LGAs, ${wardCount} wards, ${puCount} polling units`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
