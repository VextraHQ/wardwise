import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
// TODO: Refactor to use mock data imports for consistency
// import { candidates as mockCandidates } from "@/lib/mock/data/candidates";
// import { voters as mockVoters } from "@/lib/mock/data/voters";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with multi-candidate support...");

  // ========================================
  // 1. PRESIDENTIAL CANDIDATES (National - not in mock data)
  // ========================================
  const presidentialCandidates = [
    {
      id: "cand-president-apc",
      name: "Bola Ahmed Tinubu",
      party: "APC",
      position: "President",
      isNational: true,
      state: null,
      lga: null,
      constituency: null,
      description: "Presidential candidate for the All Progressives Congress",
      supporters: 0,
      email: "tinubu@wardwise.ng",
    },
    {
      id: "cand-president-pdp",
      name: "Atiku Abubakar",
      party: "PDP",
      position: "President",
      isNational: true,
      state: null,
      lga: null,
      constituency: null,
      description: "Presidential candidate for the People's Democratic Party",
      supporters: 0,
      email: "atiku@wardwise.ng",
    },
    {
      id: "cand-president-labour",
      name: "Peter Obi",
      party: "Labour Party",
      position: "President",
      isNational: true,
      state: null,
      lga: null,
      constituency: null,
      description: "Presidential candidate for the Labour Party",
      supporters: 0,
      email: "peterobi@wardwise.ng",
    },
    {
      id: "cand-president-nnpp",
      name: "Rabiu Kwankwaso",
      party: "NNPP",
      position: "President",
      isNational: true,
      state: null,
      lga: null,
      constituency: null,
      description: "Presidential candidate for the New Nigeria People's Party",
      supporters: 0,
      email: "kwankwaso@wardwise.ng",
    },
  ];

  for (const candData of presidentialCandidates) {
    const candidate = await prisma.candidate.upsert({
      where: { id: candData.id },
      update: {},
      create: {
        id: candData.id,
        name: candData.name,
        party: candData.party,
        position: candData.position,
        isNational: candData.isNational,
        state: null,
        lga: null,
        constituency: null,
        description: candData.description,
        supporters: 0,
      },
    });

    // Create user account for presidential candidate
    const hashedPassword = await bcrypt.hash("demo123", 12);
    await prisma.user.upsert({
      where: { email: candData.email },
      update: {},
      create: {
        email: candData.email,
        name: candData.name,
        password: hashedPassword,
        role: "candidate",
        candidateId: candidate.id,
      },
    });

    console.log(
      `✅ Created Presidential candidate: ${candidate.name} (${candidate.party})`,
    );
  }

  // ========================================
  // 2. STATE/LGA CANDIDATES (Adamawa State)
  // ========================================
  const adamawaCandidates = [
    // Governors
    {
      id: "cand-gov-apc-adamawa",
      name: "Ahmadu Umaru Fintiri",
      party: "APC",
      position: "Governor",
      state: "Adamawa",
      lga: null,
      constituency: "Adamawa State",
      description: "Gubernatorial candidate for Adamawa State",
      email: "fintiri@wardwise.ng",
    },
    {
      id: "cand-gov-pdp-adamawa",
      name: "Aishatu Dahiru Ahmed",
      party: "PDP",
      position: "Governor",
      state: "Adamawa",
      lga: null,
      constituency: "Adamawa State",
      description: "Gubernatorial candidate for Adamawa State",
      email: "aishatu.ahmed@wardwise.ng",
    },
    // Senators
    {
      id: "cand-sen-pdp-adamawa",
      name: "Maryam Ciroma",
      party: "PDP",
      position: "Senator",
      state: "Adamawa",
      lga: null,
      constituency: "Adamawa North Senatorial District",
      description: "Senatorial candidate for Adamawa North",
      email: "maryam.ciroma@wardwise.ng",
    },
    {
      id: "cand-sen-apc-adamawa",
      name: "Mohammed Jibrilla Bindow",
      party: "APC",
      position: "Senator",
      state: "Adamawa",
      lga: null,
      constituency: "Adamawa North Senatorial District",
      description: "Senatorial candidate for Adamawa North",
      email: "bindow@wardwise.ng",
    },
    // House of Representatives
    {
      id: "cand-hr-apc-adamawa",
      name: "Abdulrazak Namdas",
      party: "APC",
      position: "House of Representatives",
      state: "Adamawa",
      lga: "Yola North",
      constituency: "Yola North/Yola South/Girei Federal Constituency",
      description: "House of Representatives candidate",
      email: "namdas@wardwise.ng",
    },
    {
      id: "cand-hr-pdp-adamawa",
      name: "Aliyu Boya",
      party: "PDP",
      position: "House of Representatives",
      state: "Adamawa",
      lga: "Yola North",
      constituency: "Yola North/Yola South/Girei Federal Constituency",
      description: "House of Representatives candidate",
      email: "boya@wardwise.ng",
    },
    // State Assembly
    {
      id: "cand-sa-apc-adamawa",
      name: "Ibrahim Usman",
      party: "APC",
      position: "State Assembly",
      state: "Adamawa",
      lga: "Yola North",
      constituency: "Yola North Constituency",
      description: "State Assembly candidate for Yola North",
      email: "ibrahim.usman@wardwise.ng",
    },
    {
      id: "cand-sa-pdp-adamawa",
      name: "Fatima Bello",
      party: "PDP",
      position: "State Assembly",
      state: "Adamawa",
      lga: "Yola North",
      constituency: "Yola North Constituency",
      description: "State Assembly candidate for Yola North",
      email: "fatima.bello@wardwise.ng",
    },
  ];

  for (const candData of adamawaCandidates) {
    const candidate = await prisma.candidate.upsert({
      where: { id: candData.id },
      update: {},
      create: {
        id: candData.id,
        name: candData.name,
        party: candData.party,
        position: candData.position,
        isNational: false,
        state: candData.state,
        lga: candData.lga,
        constituency: candData.constituency,
        description: candData.description,
        supporters: 0,
      },
    });

    // Create user account
    const hashedPassword = await bcrypt.hash("demo123", 12);
    await prisma.user.upsert({
      where: { email: candData.email },
      update: {},
      create: {
        email: candData.email,
        name: candData.name,
        password: hashedPassword,
        role: "candidate",
        candidateId: candidate.id,
      },
    });

    console.log(
      `✅ Created ${candData.position}: ${candidate.name} (${candidate.party})`,
    );
  }

  // ========================================
  // 3. CREATE CANVASSERS
  // ========================================
  console.log("🌱 Creating canvassers...");

  const canvassers = [
    // Canvassers for APC Governor candidate
    {
      code: "FINT-A001",
      name: "Chioma Okonkwo",
      phone: "08012345671",
      candidateId: "cand-gov-apc-adamawa",
      ward: "Karewa Ward",
      lga: "Yola North",
      state: "Adamawa",
    },
    {
      code: "FINT-A002",
      name: "Ibrahim Yusuf",
      phone: "08012345672",
      candidateId: "cand-gov-apc-adamawa",
      ward: "Limawa Ward",
      lga: "Yola North",
      state: "Adamawa",
    },
    {
      code: "FINT-A003",
      name: "Fatima Bello",
      phone: "08012345673",
      candidateId: "cand-gov-apc-adamawa",
      ward: "Doubeli Ward",
      lga: "Yola North",
      state: "Adamawa",
    },
    // Canvassers for PDP Governor candidate
    {
      code: "AHMED-B001",
      name: "Mohammed Salisu",
      phone: "08012345674",
      candidateId: "cand-gov-pdp-adamawa",
      ward: "Karewa Ward",
      lga: "Yola North",
      state: "Adamawa",
    },
    {
      code: "AHMED-B002",
      name: "Hauwa Ibrahim",
      phone: "08012345675",
      candidateId: "cand-gov-pdp-adamawa",
      ward: "Nassarawo",
      lga: "Yola North",
      state: "Adamawa",
    },
    // Canvassers for Presidential candidates
    {
      code: "TINUBU-001",
      name: "Adamu Garba",
      phone: "08012345676",
      candidateId: "cand-president-apc",
      state: "Adamawa",
    },
    {
      code: "ATIKU-001",
      name: "Zainab Musa",
      phone: "08012345677",
      candidateId: "cand-president-pdp",
      state: "Adamawa",
    },
  ];

  for (const canvData of canvassers) {
    await prisma.canvasser.upsert({
      where: { code: canvData.code },
      update: {},
      create: canvData,
    });
    console.log(`✅ Created canvasser: ${canvData.name} (${canvData.code})`);
  }

  // ========================================
  // 4. CREATE DEMO VOTERS WITH MULTI-CANDIDATE SELECTIONS
  // ========================================
  console.log("🌱 Creating demo voters...");

  const demoVoters = [
    {
      nin: "12345678901",
      firstName: "Aliyu",
      middleName: "Mohammed",
      lastName: "Ibrahim",
      dateOfBirth: new Date("1990-05-15"),
      email: "aliyu.ibrahim@example.com",
      phoneNumber: "08012345678",
      gender: "Male",
      occupation: "Teacher",
      religion: "Islam",
      age: 34,
      state: "Adamawa",
      lga: "Yola North",
      ward: "Karewa Ward",
      pollingUnit: "Karewa Primary School - 001",
      role: "voter",
      vin: "90123456789012345678",
      canvasserCode: "FINT-A001",
      lastCompletedStep: "confirm",
      candidateSelections: [
        { position: "President", candidateId: "cand-president-apc" },
        { position: "Governor", candidateId: "cand-gov-apc-adamawa" },
        { position: "Senator", candidateId: "cand-sen-apc-adamawa" },
        {
          position: "House of Representatives",
          candidateId: "cand-hr-apc-adamawa",
        },
        { position: "State Assembly", candidateId: "cand-sa-apc-adamawa" },
      ],
    },
    {
      nin: "98765432109",
      firstName: "Hauwa",
      middleName: "Abubakar",
      lastName: "Bello",
      dateOfBirth: new Date("1995-08-20"),
      email: "hauwa.bello@example.com",
      phoneNumber: "08087654321",
      gender: "Female",
      occupation: "Nurse",
      religion: "Islam",
      age: 29,
      state: "Adamawa",
      lga: "Yola North",
      ward: "Limawa Ward",
      pollingUnit: "Limawa Primary School - 002",
      role: "voter",
      vin: "80987654321098765432",
      canvasserCode: "AHMED-B002",
      lastCompletedStep: "confirm",
      candidateSelections: [
        { position: "President", candidateId: "cand-president-pdp" },
        { position: "Governor", candidateId: "cand-gov-pdp-adamawa" },
        { position: "Senator", candidateId: "cand-sen-pdp-adamawa" },
        {
          position: "House of Representatives",
          candidateId: "cand-hr-pdp-adamawa",
        },
        { position: "State Assembly", candidateId: "cand-sa-pdp-adamawa" },
      ],
    },
    {
      nin: "11223344556",
      firstName: "Musa",
      middleName: "Ahmad",
      lastName: "Tukur",
      dateOfBirth: new Date("1988-12-10"),
      email: "musa.tukur@example.com",
      phoneNumber: "08011223344",
      gender: "Male",
      occupation: "Businessman",
      religion: "Islam",
      age: 36,
      state: "Adamawa",
      lga: "Yola North",
      ward: "Doubeli Ward",
      pollingUnit: "Doubeli Primary School - 003",
      role: "voter",
      vin: "70112233445566778899",
      canvasserCode: "FINT-A003",
      lastCompletedStep: "confirm",
      candidateSelections: [
        { position: "President", candidateId: "cand-president-labour" },
        { position: "Governor", candidateId: "cand-gov-apc-adamawa" },
        { position: "Senator", candidateId: "cand-sen-apc-adamawa" },
        {
          position: "House of Representatives",
          candidateId: "cand-hr-apc-adamawa",
        },
        { position: "State Assembly", candidateId: "cand-sa-apc-adamawa" },
      ],
    },
    {
      nin: "22334455667",
      firstName: "Aisha",
      middleName: "Suleiman",
      lastName: "Mohammed",
      dateOfBirth: new Date("1992-03-25"),
      email: "aisha.mohammed@example.com",
      phoneNumber: "08022334455",
      gender: "Female",
      occupation: "Civil Servant",
      religion: "Islam",
      age: 32,
      state: "Adamawa",
      lga: "Yola North",
      ward: "Nassarawo",
      pollingUnit: "Nassarawo Primary School - 004",
      role: "voter",
      vin: null, // Voter without VIN (not verified)
      canvasserCode: null,
      lastCompletedStep: "confirm",
      candidateSelections: [
        { position: "President", candidateId: "cand-president-pdp" },
        { position: "Governor", candidateId: "cand-gov-pdp-adamawa" },
        { position: "Senator", candidateId: "cand-sen-pdp-adamawa" },
        {
          position: "House of Representatives",
          candidateId: "cand-hr-pdp-adamawa",
        },
        { position: "State Assembly", candidateId: "cand-sa-pdp-adamawa" },
      ],
    },
    {
      nin: "33445566778",
      firstName: "Ibrahim",
      middleName: "Musa",
      lastName: "Aliyu",
      dateOfBirth: new Date("2007-06-15"),
      email: "ibrahim.aliyu@example.com",
      phoneNumber: "08033445566",
      gender: "Male",
      age: 17,
      state: "Adamawa",
      lga: "Yola North",
      ward: "Karewa Ward",
      pollingUnit: "Karewa Primary School - 001",
      role: "supporter", // Under 18 - registered as supporter
      vin: null,
      canvasserCode: "FINT-A001",
      lastCompletedStep: "confirm",
      candidateSelections: [
        { position: "President", candidateId: "cand-president-apc" },
        { position: "Governor", candidateId: "cand-gov-apc-adamawa" },
        { position: "Senator", candidateId: "cand-sen-apc-adamawa" },
        {
          position: "House of Representatives",
          candidateId: "cand-hr-apc-adamawa",
        },
        { position: "State Assembly", candidateId: "cand-sa-apc-adamawa" },
      ],
    },
    {
      nin: "44556677889",
      firstName: "Fatima",
      middleName: "Yusuf",
      lastName: "Usman",
      dateOfBirth: new Date("1997-11-30"),
      email: "fatima.usman@example.com",
      phoneNumber: "08044556677",
      gender: "Female",
      occupation: "Pharmacist",
      religion: "Islam",
      age: 27,
      state: "Adamawa",
      lga: "Yola North",
      ward: "Limawa Ward",
      pollingUnit: "Limawa Primary School - 002",
      role: "voter",
      vin: "60445566778899001122",
      canvasserCode: "AHMED-B001",
      lastCompletedStep: "confirm",
      candidateSelections: [
        { position: "President", candidateId: "cand-president-nnpp" },
        { position: "Governor", candidateId: "cand-gov-pdp-adamawa" },
        { position: "Senator", candidateId: "cand-sen-pdp-adamawa" },
        {
          position: "House of Representatives",
          candidateId: "cand-hr-pdp-adamawa",
        },
        { position: "State Assembly", candidateId: "cand-sa-pdp-adamawa" },
      ],
    },
  ];

  for (const voterData of demoVoters) {
    const { candidateSelections, ...voterFields } = voterData;

    const voter = await prisma.voter.upsert({
      where: { nin: voterData.nin },
      update: voterFields as Prisma.VoterUncheckedUpdateInput,
      create: voterFields as Prisma.VoterUncheckedCreateInput,
    });

    // Create candidate selections
    for (const selection of candidateSelections) {
      await prisma.voterCandidateSelection.upsert({
        where: {
          voterId_position: {
            voterId: voter.id,
            position: selection.position,
          },
        },
        update: {},
        create: {
          voterId: voter.id,
          candidateId: selection.candidateId,
          position: selection.position,
        },
      });
    }

    console.log(
      `✅ Created ${voterData.role}: ${voterData.firstName} ${voterData.lastName} with ${candidateSelections.length} candidate selections`,
    );
  }

  // ========================================
  // 5. UPDATE CANDIDATE SUPPORTER COUNTS
  // ========================================
  console.log("🌱 Updating candidate supporter counts...");

  const allCandidateIds = [
    ...presidentialCandidates.map((c) => c.id),
    ...adamawaCandidates.map((c) => c.id),
  ];

  for (const candidateId of allCandidateIds) {
    const supporterCount = await prisma.voterCandidateSelection.count({
      where: { candidateId },
    });

    await prisma.candidate.update({
      where: { id: candidateId },
      data: { supporters: supporterCount },
    });

    console.log(
      `✅ Updated supporter count for ${candidateId}: ${supporterCount}`,
    );
  }

  // ========================================
  // 6. CREATE ADMIN ACCOUNT
  // ========================================
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

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - ${presidentialCandidates.length} Presidential candidates`);
  console.log(`   - ${adamawaCandidates.length} State/LGA candidates`);
  console.log(`   - ${canvassers.length} Canvassers`);
  console.log(`   - ${demoVoters.length} Demo voters/supporters`);
  console.log(`   - All with multi-candidate selections\n`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
