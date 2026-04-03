import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config();

const prisma = new PrismaClient();

const lgaNameCorrections = [
  { stateCode: "CR", from: "Bekwara", to: "Bekwarra" },
  { stateCode: "EN", from: "Igbo-Ekiti", to: "Igbo-Etiti" },
  { stateCode: "GO", from: "Shomgom", to: "Shongom" },
  { stateCode: "NS", from: "Nasarawa Egon", to: "Nasarawa Eggon" },
  { stateCode: "OY", from: "Ori Ire", to: "Oriire" },
] as const;

async function main() {
  const apply = process.argv.slice(2).includes("--apply");

  console.log("Canonical LGA name sync");
  console.log(`Mode: ${apply ? "APPLY" : "DRY RUN"}`);

  const actions: Array<{
    stateCode: string;
    from: string;
    to: string;
    status: "rename" | "skip-missing" | "skip-conflict";
  }> = [];

  for (const correction of lgaNameCorrections) {
    const existing = await prisma.lga.findFirst({
      where: {
        name: correction.from,
        stateCode: correction.stateCode,
      },
      select: { id: true, name: true },
    });

    if (!existing) {
      actions.push({ ...correction, status: "skip-missing" });
      continue;
    }

    const conflict = await prisma.lga.findFirst({
      where: {
        name: correction.to,
        stateCode: correction.stateCode,
      },
      select: { id: true },
    });

    if (conflict) {
      actions.push({ ...correction, status: "skip-conflict" });
      continue;
    }

    actions.push({ ...correction, status: "rename" });

    if (apply) {
      await prisma.lga.update({
        where: { id: existing.id },
        data: { name: correction.to },
      });
    }
  }

  for (const action of actions) {
    if (action.status === "rename") {
      console.log(
        `${apply ? "RENAMED" : "WOULD RENAME"} ${action.stateCode} | ${action.from} -> ${action.to}`,
      );
      continue;
    }

    if (action.status === "skip-missing") {
      console.log(
        `SKIP (missing) ${action.stateCode} | ${action.from} -> ${action.to}`,
      );
      continue;
    }

    console.log(
      `SKIP (conflict) ${action.stateCode} | ${action.from} -> ${action.to}`,
    );
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
