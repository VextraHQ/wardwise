#!/usr/bin/env node

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

function parseArgs(argv) {
  const args = { apply: false, file: "" };

  for (const arg of argv) {
    if (arg === "--apply") args.apply = true;
    else if (arg.startsWith("--file=")) args.file = arg.slice("--file=".length);
  }

  if (!args.file) {
    throw new Error("Missing --file=/path/to/state-wards-pus.json");
  }

  return args;
}

function normalizeName(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['".,;:%#()]/g, " ")
    .replace(/[-/]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\bnassarawa\b/g, "nasarawa")
    .replace(/\bfurore\b/g, "fufore")
    .replace(/\bgerfi\b/g, "girei")
    .replace(/\s+/g, " ")
    .trim();
}

function makeWardKey(lgaId, wardCode, wardName) {
  if (wardCode) return `${lgaId}|code:${wardCode}`;
  return `${lgaId}|name:${normalizeName(wardName)}`;
}

function loadDataset(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const dataset = JSON.parse(raw);

  if (
    !dataset?.stateCode ||
    !dataset?.stateName ||
    !Array.isArray(dataset?.lgas)
  ) {
    throw new Error(`Invalid dataset shape in ${filePath}`);
  }

  return dataset;
}

function flattenOfficialDataset(dataset, dbLgas) {
  const lgaMap = new Map(
    dbLgas.map((lga) => [
      normalizeName(lga.name),
      { id: lga.id, name: lga.name },
    ]),
  );

  const missingLgas = [];
  const wardRows = [];
  const puRows = [];
  const perLga = [];

  for (const lga of dataset.lgas) {
    const dbLga = lgaMap.get(normalizeName(lga.name));

    if (!dbLga) {
      missingLgas.push(lga.name);
      continue;
    }

    let lgaWardCount = 0;
    let lgaPuCount = 0;

    for (const ward of lga.wards) {
      wardRows.push({
        lgaId: dbLga.id,
        lgaName: dbLga.name,
        name: ward.name,
        code: ward.sourceCode.split("-").pop(),
        sourceCode: ward.sourceCode,
      });
      lgaWardCount += 1;

      for (const pu of ward.pollingUnits) {
        puRows.push({
          lgaId: dbLga.id,
          lgaName: dbLga.name,
          wardName: ward.name,
          wardSourceCode: ward.sourceCode,
          code: pu.code,
          fullCode: pu.fullCode,
          name: pu.name,
        });
        lgaPuCount += 1;
      }
    }

    perLga.push({
      datasetLgaName: lga.name,
      dbLgaName: dbLga.name,
      lgaId: dbLga.id,
      wards: lgaWardCount,
      pollingUnits: lgaPuCount,
    });
  }

  return { missingLgas, wardRows, puRows, perLga };
}

function groupCountsByLga(rows, lgaIdKey = "lgaId") {
  const counts = new Map();

  for (const row of rows) {
    const key = row[lgaIdKey];
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
}

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

async function main() {
  const prisma = new PrismaClient();

  try {
    const args = parseArgs(process.argv.slice(2));
    const filePath = path.resolve(args.file);
    const dataset = loadDataset(filePath);

    const dbLgas = await prisma.lga.findMany({
      where: { stateCode: dataset.stateCode },
      select: { id: true, name: true, stateCode: true },
      orderBy: { name: "asc" },
    });

    const { missingLgas, wardRows, puRows, perLga } = flattenOfficialDataset(
      dataset,
      dbLgas,
    );

    if (missingLgas.length > 0) {
      throw new Error(
        `Dataset LGAs not found in DB for ${dataset.stateCode}: ${missingLgas.join(", ")}`,
      );
    }

    const currentWards = await prisma.ward.findMany({
      where: { lga: { stateCode: dataset.stateCode } },
      select: { id: true, code: true, name: true, lgaId: true },
    });

    const currentWardIds = currentWards.map((ward) => ward.id);

    const currentPus = await prisma.pollingUnit.findMany({
      where: { ward: { lga: { stateCode: dataset.stateCode } } },
      select: { id: true, name: true, code: true, wardId: true },
    });

    const currentPusByWardId = groupCountsByLga(currentPus, "wardId");
    const currentWardCountsByLgaId = groupCountsByLga(currentWards, "lgaId");

    const currentPuCountsByLgaId = new Map();
    for (const ward of currentWards) {
      const existing = currentPuCountsByLgaId.get(ward.lgaId) ?? 0;
      currentPuCountsByLgaId.set(
        ward.lgaId,
        existing + (currentPusByWardId.get(ward.id) ?? 0),
      );
    }

    const officialWardNameSets = new Map();
    for (const row of wardRows) {
      const key = row.lgaId;
      if (!officialWardNameSets.has(key))
        officialWardNameSets.set(key, new Set());
      officialWardNameSets
        .get(key)
        .add(`${row.code ?? ""}|${normalizeName(row.name)}`);
    }

    const currentWardNameSets = new Map();
    for (const ward of currentWards) {
      if (!currentWardNameSets.has(ward.lgaId))
        currentWardNameSets.set(ward.lgaId, new Set());
      currentWardNameSets
        .get(ward.lgaId)
        .add(`${ward.code ?? ""}|${normalizeName(ward.name)}`);
    }

    const submissionImpact = {
      wardRefs: currentWardIds.length
        ? await prisma.collectSubmission.count({
            where: { wardId: { in: currentWardIds } },
          })
        : 0,
      pollingUnitRefs: currentPus.length
        ? await prisma.collectSubmission.count({
            where: { pollingUnitId: { in: currentPus.map((pu) => pu.id) } },
          })
        : 0,
    };

    printSection("State Summary");
    console.log(`State: ${dataset.stateName} (${dataset.stateCode})`);
    console.log(`Source file: ${filePath}`);
    console.log(
      `Official target: ${dataset.summary.lgas} LGAs, ${dataset.summary.wards} wards, ${dataset.summary.pollingUnits} polling units`,
    );
    console.log(
      `Current DB: ${dbLgas.length} LGAs, ${currentWards.length} wards, ${currentPus.length} polling units`,
    );
    console.log(
      `Submission impact if replaced: ${submissionImpact.wardRefs} ward refs, ${submissionImpact.pollingUnitRefs} polling-unit refs`,
    );

    printSection("Per-LGA Coverage");
    for (const item of perLga) {
      const currentWardCount = currentWardCountsByLgaId.get(item.lgaId) ?? 0;
      const currentPuCount = currentPuCountsByLgaId.get(item.lgaId) ?? 0;
      console.log(
        `${item.dbLgaName}: wards ${currentWardCount} -> ${item.wards}, polling units ${currentPuCount} -> ${item.pollingUnits}`,
      );
    }

    printSection("Ward Name Drift");
    for (const item of perLga) {
      const currentSet = currentWardNameSets.get(item.lgaId) ?? new Set();
      const officialSet = officialWardNameSets.get(item.lgaId) ?? new Set();

      const missing = [...officialSet].filter((name) => !currentSet.has(name));
      const extra = [...currentSet].filter((name) => !officialSet.has(name));

      if (missing.length === 0 && extra.length === 0) continue;

      console.log(
        `${item.dbLgaName}: missing ${missing.length}, extra ${extra.length}`,
      );
    }

    if (!args.apply) {
      printSection("Dry Run Only");
      console.log(
        "No database rows were changed. Re-run with --apply to replace this state's wards and polling units with the official dataset.",
      );
      return;
    }

    printSection("Applying Replacement");

    await prisma.$transaction(
      async (tx) => {
        const existingWardIds = currentWards.map((ward) => ward.id);
        const existingPuIds = currentPus.map((pu) => pu.id);

        if (existingPuIds.length > 0) {
          await tx.collectSubmission.updateMany({
            where: { pollingUnitId: { in: existingPuIds } },
            data: { pollingUnitId: null },
          });
        }

        if (existingWardIds.length > 0) {
          await tx.collectSubmission.updateMany({
            where: { wardId: { in: existingWardIds } },
            data: { wardId: null },
          });
        }

        if (existingPuIds.length > 0) {
          await tx.pollingUnit.deleteMany({
            where: { id: { in: existingPuIds } },
          });
        }

        if (existingWardIds.length > 0) {
          await tx.ward.deleteMany({ where: { id: { in: existingWardIds } } });
        }

        await tx.ward.createMany({
          data: wardRows.map((ward) => ({
            code: ward.code,
            name: ward.name,
            lgaId: ward.lgaId,
          })),
        });

        const insertedWards = await tx.ward.findMany({
          where: { lga: { stateCode: dataset.stateCode } },
          select: { id: true, code: true, name: true, lgaId: true },
        });

        const wardIdByKey = new Map(
          insertedWards.map((ward) => [
            makeWardKey(ward.lgaId, ward.code, ward.name),
            ward.id,
          ]),
        );

        await tx.pollingUnit.createMany({
          data: puRows.map((pu) => {
            const wardId = wardIdByKey.get(
              makeWardKey(
                pu.lgaId,
                pu.wardSourceCode.split("-").pop(),
                pu.wardName,
              ),
            );
            if (!wardId) {
              throw new Error(
                `Failed to resolve inserted ward for ${pu.lgaName} / ${pu.wardName}`,
              );
            }

            return {
              code: pu.code,
              name: pu.name,
              wardId,
            };
          }),
        });
      },
      {
        maxWait: 15_000,
        timeout: 60_000,
      },
    );

    const finalWardCount = await prisma.ward.count({
      where: { lga: { stateCode: dataset.stateCode } },
    });
    const finalPuCount = await prisma.pollingUnit.count({
      where: { ward: { lga: { stateCode: dataset.stateCode } } },
    });

    console.log(
      `Applied successfully: ${finalWardCount} wards, ${finalPuCount} polling units now stored for ${dataset.stateCode}.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
