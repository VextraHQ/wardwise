/**
 * One-off script to normalize all existing phone numbers in CollectSubmission
 * to +234XXXXXXXXXX format and remove newly-revealed duplicates.
 *
 * Run: npx tsx prisma/normalize-phones.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (!digits) return input;

  if (digits.startsWith("234")) {
    const localPart = digits.slice(3, 13);
    return localPart ? `+234${localPart}` : input;
  }
  if (digits.startsWith("0")) {
    const localPart = digits.slice(1, 11);
    return localPart ? `+234${localPart}` : input;
  }
  const localPart = digits.slice(0, 10);
  return localPart ? `+234${localPart}` : input;
}

async function main() {
  const submissions = await prisma.collectSubmission.findMany({
    select: { id: true, phone: true, campaignId: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${submissions.length} submissions to process.`);

  // Step 1: Find duplicates that would arise after normalization, delete newer ones first
  const seen = new Map<string, string>(); // "campaignId:normalizedPhone" -> first id
  const duplicateIds: string[] = [];

  for (const sub of submissions) {
    const normalized = normalizePhone(sub.phone);
    const key = `${sub.campaignId}:${normalized}`;
    if (seen.has(key)) {
      duplicateIds.push(sub.id);
    } else {
      seen.set(key, sub.id);
    }
  }

  if (duplicateIds.length > 0) {
    console.log(
      `Found ${duplicateIds.length} duplicate(s) after normalization. Removing newer entries...`,
    );
    await prisma.collectSubmission.deleteMany({
      where: { id: { in: duplicateIds } },
    });
    console.log("Duplicates removed.");
  } else {
    console.log("No duplicates found after normalization.");
  }

  // Step 2: Now normalize remaining phones
  const remaining = await prisma.collectSubmission.findMany({
    select: { id: true, phone: true },
  });

  let updated = 0;
  for (const sub of remaining) {
    const normalized = normalizePhone(sub.phone);
    if (normalized !== sub.phone) {
      await prisma.collectSubmission.update({
        where: { id: sub.id },
        data: { phone: normalized },
      });
      updated++;
    }
  }

  console.log(`Normalized ${updated} phone numbers. Done.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
