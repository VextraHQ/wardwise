import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with multiple candidates...");

  const candidates = [
    {
      id: "demo-candidate-1",
      name: "Hon. Ahmed Suleiman",
      party: "APC",
      position: "House of Representatives",
      constituency: "Song & Fufore Federal Constituency",
      description: "Experienced leader committed to community development",
      supporters: 2847,
      email: "ahmed.suleiman@wardwise.ng",
    },
    {
      id: "demo-candidate-2",
      name: "Alhaji Bello Ibrahim",
      party: "PDP",
      position: "House of Representatives",
      constituency: "Song & Fufore Federal Constituency",
      description: "Community advocate with grassroots experience",
      supporters: 2156,
      email: "bello.ibrahim@wardwise.ng",
    },
    {
      id: "demo-candidate-3",
      name: "Dr. Fatima Yusuf",
      party: "LP",
      position: "House of Representatives",
      constituency: "Song & Fufore Federal Constituency",
      description: "Healthcare professional focused on development",
      supporters: 1923,
      email: "fatima.yusuf@wardwise.ng",
    },
  ];

  for (const candidateData of candidates) {
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
        description: candidateData.description,
        supporters: candidateData.supporters,
      },
    });

    // Create user account for candidate
    const hashedPassword = await bcrypt.hash("demo123", 12);

    await prisma.user.upsert({
      where: { email: candidateData.email },
      update: {},
      create: {
        email: candidateData.email,
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
