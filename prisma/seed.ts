import { config } from "dotenv";
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ========================================
  // 1. PRESIDENTIAL CANDIDATES
  // ========================================
  const presidentialCandidates = [
    {
      id: "cand-president-apc",
      name: "Bola Ahmed Tinubu",
      party: "APC",
      position: "President",
      isNational: true,
      stateCode: null,
      lga: null,
      constituency: "Federal Republic of Nigeria",
      description: "Presidential candidate for the All Progressives Congress",
      title: null,
      phone: null,
      onboardingStatus: "active",
      email: "bola.tinubu@wardwise.ng",
    },
    {
      id: "cand-president-pdp",
      name: "Atiku Abubakar",
      party: "PDP",
      position: "President",
      isNational: true,
      stateCode: null,
      lga: null,
      constituency: "Federal Republic of Nigeria",
      description: "Presidential candidate for the People's Democratic Party",
      title: null,
      phone: null,
      onboardingStatus: "active",
      email: "atiku.abubakar@wardwise.ng",
    },
    {
      id: "cand-president-labour",
      name: "Peter Obi",
      party: "LP",
      position: "President",
      isNational: true,
      stateCode: null,
      lga: null,
      constituency: "Federal Republic of Nigeria",
      description: "Presidential candidate for the Labour Party",
      title: null,
      phone: null,
      onboardingStatus: "active",
      email: "peter.obi@wardwise.ng",
    },
    {
      id: "cand-president-nnpp",
      name: "Rabiu Kwankwaso",
      party: "NNPP",
      position: "President",
      isNational: true,
      stateCode: null,
      lga: null,
      constituency: "Federal Republic of Nigeria",
      description: "Presidential candidate for the New Nigeria People's Party",
      title: null,
      phone: null,
      onboardingStatus: "active",
      email: "rabiu.kwankwaso@wardwise.ng",
    },
  ];

  // ========================================
  // 2. STATE/LGA CANDIDATES (Adamawa)
  // ========================================
  const adamawaCandidates = [
    {
      id: "cand-gov-pdp-adamawa",
      name: "Dr. Ahmadu Umaru Fintiri",
      party: "PDP",
      position: "Governor",
      isNational: false,
      stateCode: "AD",
      lga: null,
      constituency: "Adamawa State",
      description: "Experienced leader focused on development and security.",
      title: "Dr.",
      phone: null,
      onboardingStatus: "active",
      email: "ahmadu.fintiri@wardwise.ng",
    },
    {
      id: "cand-gov-apc-adamawa",
      name: "Senator Aishatu Dahiru Ahmed (Binani)",
      party: "APC",
      position: "Governor",
      isNational: false,
      stateCode: "AD",
      lga: null,
      constituency: "Adamawa State",
      description: "Progressive leader committed to education and healthcare.",
      title: "Sen.",
      phone: null,
      onboardingStatus: "active",
      email: "aishatu.binani@wardwise.ng",
    },
    {
      id: "cand-sen-pdp-adamawa-central",
      name: "Dr. Maryam Inna Ciroma",
      party: "PDP",
      position: "Senator",
      isNational: false,
      stateCode: "AD",
      lga: "Yola North",
      constituency: "Adamawa Central",
      description:
        "Healthcare professional dedicated to women's empowerment and community welfare.",
      title: "Dr.",
      phone: null,
      onboardingStatus: "active",
      email: "maryam.ciroma@wardwise.ng",
    },
    {
      id: "cand-hr-apc-jada-ganye-mayo-belwa-toungo",
      name: "Hon. Abdulrazak Namdas",
      party: "APC",
      position: "House of Representatives",
      isNational: false,
      stateCode: "AD",
      lga: "Jada",
      constituency: "Jada/Ganye/Mayo-Belwa/Toungo",
      description: "Youth advocate and infrastructure development champion.",
      title: "Hon.",
      phone: null,
      onboardingStatus: "active",
      email: "abdulrazak.namdas@wardwise.ng",
    },
    {
      id: "cand-hr-apc-fufore-song",
      name: "Hon. Aliyu Wakili Boya",
      party: "APC",
      position: "House of Representatives",
      isNational: false,
      stateCode: "AD",
      lga: "Fufore",
      constituency: "Fufore/Song Federal Constituency",
      description:
        "Former ALGON Chairman and Executive Chairman of Fufore LGA.",
      title: "Hon.",
      phone: null,
      onboardingStatus: "active",
      email: "aliyu.boya@wardwise.ng",
    },
    {
      id: "cand-sa-apc-song-adamawa",
      name: "Hon. Ibrahim Usman",
      party: "APC",
      position: "State Assembly",
      isNational: false,
      stateCode: "AD",
      lga: "Song",
      constituency: "Song State Constituency",
      description:
        "Grassroots leader focused on local development and community empowerment.",
      title: "Hon.",
      phone: null,
      onboardingStatus: "active",
      email: "ibrahim.usman@wardwise.ng",
    },
    {
      id: "cand-sa-pdp-fufore-adamawa",
      name: "Hon. Fatima Bello",
      party: "PDP",
      position: "State Assembly",
      isNational: false,
      stateCode: "AD",
      lga: "Fufore",
      constituency: "Fufore State Constituency",
      description:
        "Education advocate and women's rights champion at the state level.",
      title: "Hon.",
      phone: null,
      onboardingStatus: "active",
      email: "fatima.bello@wardwise.ng",
    },
  ];

  const allCandidates = [...presidentialCandidates, ...adamawaCandidates];
  const hashedPassword = await bcrypt.hash("demo123", 12);

  for (const candData of allCandidates) {
    const { email, ...candidateFields } = candData;
    try {
      const candidate = await prisma.candidate.upsert({
        where: { id: candData.id },
        update: {},
        create: candidateFields,
      });

      // Upsert user account
      const existingUser = await prisma.user.findUnique({
        where: { candidateId: candidate.id },
      });

      if (!existingUser) {
        const userByEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (userByEmail) {
          if (userByEmail.candidateId !== candidate.id) {
            await prisma.user.update({
              where: { id: userByEmail.id },
              data: {
                candidateId: candidate.id,
                name: candData.name,
                password: hashedPassword,
              },
            });
          }
        } else {
          await prisma.user.create({
            data: {
              email,
              name: candData.name,
              password: hashedPassword,
              role: "candidate",
              candidateId: candidate.id,
            },
          });
        }
      }

      console.log(
        `✅ ${candData.position}: ${candidate.name} (${candidate.party})`,
      );
    } catch (error) {
      console.error(
        `❌ Error: ${candData.name}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  // ========================================
  // 3. CANVASSERS
  // ========================================
  console.log("🌱 Creating canvassers...");

  const canvassers = [
    {
      code: "FINT-A001",
      name: "Chioma Okonkwo",
      phone: "08012345671",
      candidateId: "cand-gov-pdp-adamawa",
      ward: "Karewa Ward",
      lga: "Yola North",
      state: "Adamawa",
    },
    {
      code: "FINT-A002",
      name: "Ibrahim Yusuf",
      phone: "08012345672",
      candidateId: "cand-gov-pdp-adamawa",
      ward: "Limawa Ward",
      lga: "Yola North",
      state: "Adamawa",
    },
    {
      code: "FINT-A003",
      name: "Fatima Bello",
      phone: "08012345673",
      candidateId: "cand-gov-pdp-adamawa",
      ward: "Doubeli Ward",
      lga: "Yola North",
      state: "Adamawa",
    },
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
    const candidate = await prisma.candidate.findUnique({
      where: { id: canvData.candidateId },
    });
    if (!candidate) {
      console.error(
        `  ⚠️  Skipping canvasser ${canvData.name}: Candidate not found`,
      );
      continue;
    }

    await prisma.canvasser.upsert({
      where: { code: canvData.code },
      update: canvData,
      create: canvData,
    });
    console.log(`  ✅ Canvasser: ${canvData.name} (${canvData.code})`);
  }

  // ========================================
  // 4. DEMO VOTERS
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
      consentGiven: true,
      supportLevel: "strong",
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
      consentGiven: true,
      supportLevel: "leaning",
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
      consentGiven: true,
      supportLevel: "strong",
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
      vin: null,
      canvasserCode: null,
      consentGiven: true,
      supportLevel: "undecided",
    },
    {
      nin: "33445566778",
      firstName: "Ibrahim",
      middleName: "Musa",
      lastName: "Aliyu",
      dateOfBirth: new Date("2007-06-15"),
      phoneNumber: "08033445566",
      gender: "Male",
      age: 17,
      state: "Adamawa",
      lga: "Yola North",
      ward: "Karewa Ward",
      pollingUnit: "Karewa Primary School - 001",
      role: "voter",
      vin: null,
      canvasserCode: "FINT-A001",
      consentGiven: true,
      supportLevel: "leaning",
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
      consentGiven: true,
      supportLevel: "strong",
    },
  ];

  for (const voterData of demoVoters) {
    if (voterData.canvasserCode) {
      const canvasser = await prisma.canvasser.findUnique({
        where: { code: voterData.canvasserCode },
      });
      if (!canvasser) {
        console.warn(
          `  ⚠️  Voter ${voterData.firstName}: Canvasser ${voterData.canvasserCode} not found`,
        );
        (voterData as { canvasserCode?: string | null }).canvasserCode = null;
      }
    }

    const existing = await prisma.voter.findUnique({
      where: { nin: voterData.nin },
    });
    if (!existing) {
      await prisma.voter.create({
        data: voterData as Prisma.VoterUncheckedCreateInput,
      });
      console.log(`  ✅ Voter: ${voterData.firstName} ${voterData.lastName}`);
    } else {
      await prisma.voter.update({
        where: { nin: voterData.nin },
        data: voterData as Prisma.VoterUncheckedUpdateInput,
      });
    }
  }

  // ========================================
  // 5. ADMIN ACCOUNT
  // ========================================
  console.log("🌱 Creating admin account...");
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@wardwise.ng" },
    update: { name: "WardWise Admin", password: adminPassword, role: "admin" },
    create: {
      email: "admin@wardwise.ng",
      name: "WardWise Admin",
      password: adminPassword,
      role: "admin",
    },
  });
  console.log("  ✅ Admin: admin@wardwise.ng");

  console.log("\n🎉 Database seeded successfully!");
  console.log(`   - ${allCandidates.length} Candidates`);
  console.log(`   - ${canvassers.length} Canvassers`);
  console.log(`   - ${demoVoters.length} Voters`);
  console.log(`   - 1 Admin account\n`);
}

main()
  .catch((e) => {
    console.error(
      "\n❌ Error seeding database:",
      e instanceof Error ? e.message : String(e),
    );
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
