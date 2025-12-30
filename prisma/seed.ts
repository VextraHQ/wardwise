import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { Candidate } from "@/types/candidate";
// TODO: Refactor to use mock data imports for consistency
// import { candidates as mockCandidates } from "@/lib/mock/data/candidates";
// import { voters as mockVoters } from "@/lib/mock/data/voters";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with multi-candidate support...");

  // ========================================
  // 1. PRESIDENTIAL CANDIDATES (National - not in mock data)
  // ========================================
  const presidentialCandidates: Candidate[] = [
    {
      id: "cand-president-apc",
      name: "Bola Ahmed Tinubu",
      party: "APC",
      position: "President",
      isNational: true,
      state: null,
      lga: null,
      constituency: "Federal Republic of Nigeria",
      description: "Presidential candidate for the All Progressives Congress",
      supporters: 5420,
      email: "bola.tinubu@wardwise.ng",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "cand-president-pdp",
      name: "Atiku Abubakar",
      party: "PDP",
      position: "President",
      isNational: true,
      state: null,
      lga: null,
      constituency: "Federal Republic of Nigeria",
      description: "Presidential candidate for the People's Democratic Party",
      supporters: 4980,
      email: "atiku.abubakar@wardwise.ng",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      supporters: 6150,
      email: "peter.obi@wardwise.ng",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      supporters: 3200,
      email: "rabiu.kwankwaso@wardwise.ng",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const candData of presidentialCandidates) {
    try {
      // Check if candidate already exists
      const existingCandidate = await prisma.candidate.findUnique({
        where: { id: candData.id },
      });

      const candidate = existingCandidate
        ? await prisma.candidate.update({
            where: { id: candData.id },
            data: {},
          })
        : await prisma.candidate.create({
            data: {
              id: candData.id,
              name: candData.name,
              party: candData.party,
              position: candData.position,
              isNational: candData.isNational,
              state: candData.state,
              lga: candData.lga,
              constituency: candData.constituency,
              description: candData.description,
              supporters: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });

      // Track if we should log this candidate
      let shouldLog = !existingCandidate;
      let logMessage = "";

      // Create or update user account for presidential candidate
      const hashedPassword = await bcrypt.hash("demo123", 12);

      // Find existing user by candidateId first (since candidateId is unique)
      const existingUser = await prisma.user.findUnique({
        where: { candidateId: candidate.id },
      });

      if (existingUser) {
        // Check if email changed
        const emailChanged = existingUser.email !== candData.email;
        const oldEmail = existingUser.email;

        // Update existing user with new email
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            email: candData.email,
            name: candData.name,
            password: hashedPassword,
          },
        });

        if (emailChanged) {
          shouldLog = true;
          logMessage = `  📧 Updated user email: ${oldEmail} → ${candData.email}\n`;
        }
        // Silently skip if no changes
      } else {
        // Check if user exists with this email but different candidateId
        const userByEmail = await prisma.user.findUnique({
          where: { email: candData.email },
        });

        if (userByEmail) {
          // Check if linking is needed
          if (userByEmail.candidateId !== candidate.id) {
            await prisma.user.update({
              where: { id: userByEmail.id },
              data: {
                candidateId: candidate.id,
                name: candData.name,
                password: hashedPassword,
              },
            });
            shouldLog = true;
            logMessage = `  🔗 Linked existing user to candidate: ${candData.email}\n`;
          }
          // Silently skip if already linked
        } else {
          // Create new user
          await prisma.user.create({
            data: {
              email: candData.email,
              name: candData.name,
              password: hashedPassword,
              role: "candidate",
              candidateId: candidate.id,
            },
          });
          shouldLog = true;
          logMessage = `  ✨ Created new user account: ${candData.email}\n`;
        }
      }

      // Only log if something was created or changed
      if (shouldLog) {
        if (logMessage) {
          console.log(logMessage.trimEnd());
        }
        console.log(
          `✅ Presidential candidate: ${candidate.name} (${candidate.party})`,
        );
      }
    } catch (error) {
      console.error(
        `❌ Error processing candidate ${candData.name}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  // ========================================
  // 2. STATE/LGA CANDIDATES (Adamawa State)
  // ========================================
  const adamawaCandidates: Candidate[] = [
    // Governors
    {
      id: "cand-gov-pdp-adamawa",
      name: "Dr. Ahmadu Umaru Fintiri",
      party: "PDP",
      position: "Governor",
      isNational: false,
      state: "Adamawa State",
      lga: "Adamawa Central",
      constituency: "Adamawa State",
      description: "Experienced leader focused on development and security.",
      supporters: 980,
      email: "ahmadu.fintiri@wardwise.ng",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "cand-gov-apc-adamawa",
      name: "Senator Aishatu Dahiru Ahmed (Binani)",
      party: "APC",
      position: "Governor",
      isNational: false,
      state: "Adamawa State",
      lga: "Adamawa Central",
      constituency: "Adamawa State",
      description: "Progressive leader committed to education and healthcare.",
      supporters: 1250,
      email: "aishatu.dahiru.ahmed@wardwise.ng",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Senators
    {
      id: "cand-sen-pdp-adamawa-central",
      name: "Dr. Maryam Inna Ciroma",
      party: "PDP",
      position: "Senator",
      isNational: false,
      state: "Adamawa State",
      lga: "Adamawa Central",
      constituency: "Adamawa Central",
      description:
        "Healthcare professional dedicated to women's empowerment and community welfare.",
      supporters: 650,
      email: "dr.maryam.inna.ciroma@wardwise.ng",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // House of Representatives
    {
      id: "cand-hr-apc-jada-ganye-mayo-belwa-toungo",
      name: "Hon. Abdulrazak Namdas",
      party: "APC",
      position: "House of Representatives",
      isNational: false,
      state: "Adamawa State",
      lga: "Jada/Ganye/Mayo-Belwa/Toungo",
      constituency: "Jada/Ganye/Mayo-Belwa/Toungo",
      description: "Youth advocate and infrastructure development champion.",
      supporters: 750,
      email: "hon.abdulrazak.namdas@wardwise.ng",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "cand-hr-apc-fufore-song",
      name: "Hon. Aliyu Wakili Boya",
      party: "APC",
      position: "House of Representatives",
      isNational: false,
      state: "Adamawa State",
      lga: "Fufore/Song",
      constituency: "Fufore/Song Federal Constituency",
      description:
        "Former ALGON Chairman and Executive Chairman of Fufore LGA. Currently serving first term in 10th National Assembly.",
      supporters: 850,
      email: "aliyu.wakili.boya@wardwise.ng",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // State Assembly
    {
      id: "cand-sa-apc-song-adamawa",
      name: "Hon. Ibrahim Usman",
      party: "APC",
      position: "State Assembly",
      isNational: false,
      state: "Adamawa State",
      lga: "Song State Constituency",
      constituency: "Song State Constituency",
      description:
        "Grassroots leader focused on local development and community empowerment.",
      email: "ibrahim.usman@wardwise.ng",
      supporters: 420,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "cand-sa-pdp-fufore-adamawa",
      name: "Hon. Fatima Bello",
      party: "PDP",
      position: "State Assembly",
      isNational: false,
      state: "Adamawa State",
      lga: "Fufore State Constituency",
      constituency: "Fufore State Constituency",
      description:
        "Education advocate and women's rights champion at the state level.",
      email: "fatima.bello@wardwise.ng",
      supporters: 380,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const candData of adamawaCandidates) {
    try {
      // Check if candidate already exists
      const existingCandidate = await prisma.candidate.findUnique({
        where: { id: candData.id },
      });

      const candidate = existingCandidate
        ? await prisma.candidate.update({
            where: { id: candData.id },
            data: {},
          })
        : await prisma.candidate.create({
            data: {
              id: candData.id,
              name: candData.name,
              party: candData.party,
              position: candData.position,
              isNational: false,
              state: candData.state,
              lga: candData.lga,
              constituency: candData.constituency,
              description: candData.description,
              supporters: candData.supporters,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });

      // Track if we should log this candidate
      let shouldLog = !existingCandidate;
      let logMessage = "";

      // Create or update user account
      const hashedPassword = await bcrypt.hash("demo123", 12);

      // Find existing user by candidateId first (since candidateId is unique)
      const existingUser = await prisma.user.findUnique({
        where: { candidateId: candidate.id },
      });

      if (existingUser) {
        // Check if email changed
        const emailChanged = existingUser.email !== candData.email;
        const oldEmail = existingUser.email;

        // Update existing user with new email
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            email: candData.email,
            name: candData.name,
            password: hashedPassword,
          },
        });

        if (emailChanged) {
          shouldLog = true;
          logMessage = `  📧 Updated user email: ${oldEmail} → ${candData.email}\n`;
        }
        // Silently skip if no changes
      } else {
        // Check if user exists with this email but different candidateId
        const userByEmail = await prisma.user.findUnique({
          where: { email: candData.email },
        });

        if (userByEmail) {
          // Check if linking is needed
          if (userByEmail.candidateId !== candidate.id) {
            await prisma.user.update({
              where: { id: userByEmail.id },
              data: {
                candidateId: candidate.id,
                name: candData.name,
                password: hashedPassword,
              },
            });
            shouldLog = true;
            logMessage = `  🔗 Linked existing user to candidate: ${candData.email}\n`;
          }
          // Silently skip if already linked
        } else {
          // Create new user
          await prisma.user.create({
            data: {
              email: candData.email,
              name: candData.name,
              password: hashedPassword,
              role: "candidate",
              candidateId: candidate.id,
            },
          });
          shouldLog = true;
          logMessage = `  ✨ Created new user account: ${candData.email}\n`;
        }
      }

      // Only log if something was created or changed
      if (shouldLog) {
        if (logMessage) {
          console.log(logMessage.trimEnd());
        }
        console.log(
          `✅ ${candData.position}: ${candidate.name} (${candidate.party})`,
        );
      }
    } catch (error) {
      console.error(
        `❌ Error processing candidate ${candData.name}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  // ========================================
  // 3. CREATE CANVASSERS
  // ========================================
  console.log("🌱 Creating canvassers...");

  const canvassers = [
    // Canvassers for PDP Governor candidate (cand-gov-pdp-adamawa)
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
    try {
      // Validate candidate exists
      const candidate = await prisma.candidate.findUnique({
        where: { id: canvData.candidateId },
      });
      if (!candidate) {
        console.error(
          `  ⚠️  Skipping canvasser ${canvData.name}: Candidate ${canvData.candidateId} not found`,
        );
        continue;
      }

      // Simple upsert - only log on creation
      const existing = await prisma.canvasser.findUnique({
        where: { code: canvData.code },
      });

      if (!existing) {
        await prisma.canvasser.create({ data: canvData });
        console.log(
          `  ✨ Created canvasser: ${canvData.name} (${canvData.code})`,
        );
      } else {
        // Silently update if exists (no logging)
        await prisma.canvasser.update({
          where: { code: canvData.code },
          data: canvData,
        });
      }
    } catch (error) {
      console.error(
        `  ❌ Error processing canvasser ${canvData.name}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
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
        { position: "Governor", candidateId: "cand-gov-pdp-adamawa" },
        { position: "Senator", candidateId: "cand-sen-apc-adamawa" },
        {
          position: "House of Representatives",
          candidateId: "cand-hr-apc-jada-ganye-mayo-belwa-toungo",
        },
        { position: "State Assembly", candidateId: "cand-sa-apc-song-adamawa" },
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
        { position: "Senator", candidateId: "cand-sen-pdp-adamawa-central" },
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
        { position: "Governor", candidateId: "cand-gov-pdp-adamawa" },
        { position: "Senator", candidateId: "cand-sen-apc-adamawa" },
        {
          position: "House of Representatives",
          candidateId: "cand-hr-apc-jada-ganye-mayo-belwa-toungo",
        },
        { position: "State Assembly", candidateId: "cand-sa-apc-song-adamawa" },
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
        { position: "Senator", candidateId: "cand-sen-pdp-adamawa-central" },
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
        { position: "Governor", candidateId: "cand-gov-pdp-adamawa" },
        { position: "Senator", candidateId: "cand-sen-apc-adamawa" },
        {
          position: "House of Representatives",
          candidateId: "cand-hr-apc-jada-ganye-mayo-belwa-toungo",
        },
        { position: "State Assembly", candidateId: "cand-sa-apc-song-adamawa" },
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
        { position: "Senator", candidateId: "cand-sen-pdp-adamawa-central" },
        {
          position: "House of Representatives",
          candidateId: "cand-hr-pdp-adamawa",
        },
        { position: "State Assembly", candidateId: "cand-sa-pdp-adamawa" },
      ],
    },
  ];

  for (const voterData of demoVoters) {
    try {
      const { candidateSelections, ...voterFields } = voterData;

      // Validate canvasser code if provided
      if (voterFields.canvasserCode) {
        const canvasser = await prisma.canvasser.findUnique({
          where: { code: voterFields.canvasserCode },
        });
        if (!canvasser) {
          console.warn(
            `  ⚠️  Voter ${voterData.firstName} ${voterData.lastName}: Canvasser code ${voterFields.canvasserCode} not found`,
          );
          // Remove invalid canvasser code
          (voterFields as { canvasserCode?: string }).canvasserCode = undefined;
        }
      }

      const existing = await prisma.voter.findUnique({
        where: { nin: voterData.nin },
      });

      const voter = existing
        ? await prisma.voter.update({
            where: { nin: voterData.nin },
            data: voterFields as Prisma.VoterUncheckedUpdateInput,
          })
        : await prisma.voter.create({
            data: voterFields as Prisma.VoterUncheckedCreateInput,
          });

      // Update candidate selections (validate candidate exists)
      for (const selection of candidateSelections) {
        const candidate = await prisma.candidate.findUnique({
          where: { id: selection.candidateId },
        });
        if (!candidate) {
          console.warn(
            `  ⚠️  Skipping selection: Candidate ${selection.candidateId} for position ${selection.position} not found`,
          );
          continue;
        }

        await prisma.voterCandidateSelection.upsert({
          where: {
            voterId_position: {
              voterId: voter.id,
              position: selection.position,
            },
          },
          update: {
            candidateId: selection.candidateId,
          },
          create: {
            voterId: voter.id,
            candidateId: selection.candidateId,
            position: selection.position,
          },
        });
      }

      // Only log on creation
      if (!existing) {
        console.log(
          `  ✨ Created ${voterData.role}: ${voterData.firstName} ${voterData.lastName} (${candidateSelections.length} selections)`,
        );
      }
      // Silently update if exists
    } catch (error) {
      console.error(
        `  ❌ Error processing voter ${voterData.firstName} ${voterData.lastName}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
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
    try {
      const supporterCount = await prisma.voterCandidateSelection.count({
        where: { candidateId },
      });

      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
      });

      if (candidate) {
        // Only log if supporter count changed
        if (candidate.supporters !== supporterCount) {
          await prisma.candidate.update({
            where: { id: candidateId },
            data: { supporters: supporterCount },
          });
          console.log(
            `  ✅ ${candidate.name}: ${supporterCount} supporters (was ${candidate.supporters})`,
          );
        }
        // Silently skip if count unchanged
      }
    } catch (error) {
      console.error(
        `  ❌ Error updating supporter count for ${candidateId}:`,
        error instanceof Error ? error.message : String(error),
      );
      // Don't throw - continue with other candidates
    }
  }

  // ========================================
  // 6. CREATE ADMIN ACCOUNT
  // ========================================
  console.log("🌱 Creating admin account...");
  try {
    const adminPassword = await bcrypt.hash("admin123", 12);
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@wardwise.ng" },
    });

    // Only log on creation
    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          email: "admin@wardwise.ng",
          name: "WardWise Admin",
          password: adminPassword,
          role: "admin",
        },
      });
      console.log("  ✨ Created admin account: admin@wardwise.ng");
    } else {
      // Silently update if exists
      await prisma.user.update({
        where: { email: "admin@wardwise.ng" },
        data: {
          name: "WardWise Admin",
          password: adminPassword,
          role: "admin",
        },
      });
    }
  } catch (error) {
    console.error(
      "  ❌ Error creating admin account:",
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }

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
    console.error("\n❌ Error seeding database:");
    if (e instanceof Error) {
      console.error(`   Message: ${e.message}`);
      if (e.stack) {
        console.error(
          `   Stack: ${e.stack.split("\n").slice(0, 3).join("\n")}`,
        );
      }
    } else {
      console.error(`   ${String(e)}`);
    }
    console.error(
      "\n💡 Tip: Try running 'pnpm db:reset' to reset the database first.\n",
    );
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
