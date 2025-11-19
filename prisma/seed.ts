import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { candidates } from "@/lib/mock/data/candidates";
import { voters } from "@/lib/mock/data/voters";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with multiple candidates...");

  // Use actual candidate data from mock data for proper sync
  // Map candidate IDs to email addresses for user account creation
  const candidateEmails: Record<string, string> = {
    // Governor Candidates
    "cand-apc-1": "ahmadu.fintiri@wardwise.ng",
    "cand-pdp-1": "aishatu.ahmed@wardwise.ng",
    // Senator Candidates
    "cand-pdp-2": "maryam.ciroma@wardwise.ng",
    // House of Representatives Candidates
    "cand-apc-2": "abdulrazak.namdas@wardwise.ng",
    "cand-apc-4": "aliyu.boya@wardwise.ng",
    // State Assembly Candidates
    "cand-apc-adamawa-sa-1": "ibrahim.usman@wardwise.ng",
    "cand-pdp-adamawa-sa-1": "fatima.bello@wardwise.ng",
  };

  // Filter to only seed the candidates we want (the ones with emails)
  const candidatesToSeed = candidates.filter((c) =>
    Object.keys(candidateEmails).includes(c.id),
  );

  for (const candidateData of candidatesToSeed) {
    // Create candidate first
    const candidate = await prisma.candidate.upsert({
      where: { id: candidateData.id },
      update: {},
      create: {
        id: candidateData.id,
        name: candidateData.name,
        party: candidateData.party,
        position: candidateData.position,
        constituency: candidateData.constituency,
        description: candidateData.description || "",
        supporters: candidateData.supporters,
      },
    });

    // Create user account for candidate
    const hashedPassword = await bcrypt.hash("demo123", 12);
    const email = candidateEmails[candidateData.id];

    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: candidateData.name,
        password: hashedPassword,
        role: "candidate",
        candidateId: candidate.id,
      },
    });

    console.log(`✅ Created candidate: ${candidate.name} (${candidate.party})`);
  }

  // Create admin account
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@wardwise.ng" },
    update: {},
    create: {
      email: "admin@wardwise.ng",
      name: "WardWise Admin",
      password: adminPassword,
      role: "admin",
    },
  });

  console.log("✅ Created admin account: admin@wardwise.ng");

  // Seed demo voters for dashboard sync
  // These match the documented NINs in mock data for consistent demo experience
  console.log("🌱 Seeding demo voters...");

  // Filter to only seed the documented demo voters (6 voters for better demo experience)
  const demoNINs = [
    "12345678901", // Aliyu Mohammed - has survey answers
    "98765432109", // Hauwa Bello - has survey answers
    "11223344556", // Musa Ahmad Tukur - partial survey answers
    "22334455667", // Aisha Mohammed - new registration
    "33445566778", // Ibrahim Aliyu - new registration
    "44556677889", // Fatima Usman - has survey answers
  ];
  const votersToSeed = voters.filter((v) => demoNINs.includes(v.nin));

  // Convert mock voter data to Prisma format (dates need to be Date objects)
  const votersForDb = votersToSeed.map((voter) => ({
    nin: voter.nin,
    firstName: voter.firstName,
    middleName: voter.middleName,
    lastName: voter.lastName,
    dateOfBirth: new Date(voter.dateOfBirth),
    email: voter.email,
    phoneNumber: voter.phoneNumber,
    gender: voter.gender,
    occupation: voter.occupation,
    religion: voter.religion,
    age: voter.age,
    state: voter.state,
    lga: voter.lga,
    ward: voter.ward,
    pollingUnit: voter.pollingUnit,
    // Handle empty string candidateId (incomplete registrations) - convert to undefined
    candidateId: voter.candidateId?.trim() || undefined,
    surveyAnswers: voter.surveyAnswers || null,
    verifiedAt: voter.verifiedAt ? new Date(voter.verifiedAt) : null,
    registrationDate: new Date(voter.registrationDate),
    lastCompletedStep: voter.lastCompletedStep || null,
    surveyCompleted: voter.surveyCompleted ?? false,
  }));

  for (const voterData of votersForDb) {
    await prisma.voter.upsert({
      where: { nin: voterData.nin },
      update: voterData as Prisma.VoterUncheckedUpdateInput,
      create: voterData as Prisma.VoterUncheckedCreateInput,
    });
    console.log(
      `✅ Created voter: ${voterData.firstName} ${voterData.lastName} (NIN: ${voterData.nin})`,
    );
  }

  // Update candidate supporter counts based on actual voters
  for (const candidateId of Object.keys(candidateEmails)) {
    const voterCount = await prisma.voter.count({
      where: { candidateId },
    });
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { supporters: voterCount },
    });
    console.log(
      `✅ Updated candidate supporter count for ${candidateId}: ${voterCount}`,
    );
  }

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
