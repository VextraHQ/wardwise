// Mock data for voter registration flow - DEMO ONLY
// This simulates API responses for UI testing
import {
  nigeriaStates,
  nigeriaLGAs,
  getStateByCode,
  getLGAsByState,
} from "@/lib/data/state-lga-locations";

export type User = {
  id: string;
  nin: string; // National Identification Number
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber?: string; // Optional phone number
  age: number;
  gender: "male" | "female" | "other";
  state: string;
  lga: string;
  ward: string;
  pollingUnit: string;
  candidateId: Candidate["id"];
  surveyAnswers: Record<string, string | string[]>;
  registrationDate: string;
  isVerified: boolean;
  verifiedAt?: string; // When NIN was verified
};

export type SurveyOption = {
  id: string;
  label: string;
  icon?: string;
};

export type SurveyQuestion = {
  id: string;
  type: "single" | "multiple" | "ranking" | "scale" | "text";
  question: string;
  description?: string;
  icon?: string;
  options?: SurveyOption[];
  minLabel?: string; // For scale questions
  maxLabel?: string;
};

export type CandidateSurvey = {
  id: string;
  candidateId: string;
  candidateName: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  createdAt: string;
};

export type Candidate = {
  id: string;
  name: string;
  party: string;
  position: "Governor" | "Senator" | "House of Representatives";
  state: string;
  constituency: string;
  description: string;
  supporters: number;
  photo?: string;
  surveyId: string; // Link to their survey
  tagline: string; // e.g., "Fixing Roads, Creating Jobs"
  vision: string; // Short candidate vision
};

export type RegistrationData = {
  nin: string;
  phone?: string;
  basic: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    age: number;
    gender: "male" | "female" | "other";
  };
  location: {
    state: string;
    lga: string;
    ward: string;
    pollingUnit: string;
  };
  candidate: {
    candidateId: string;
    candidateName?: string;
  };
  survey: {
    surveyId: string;
    answers: Record<string, string | string[]>;
  };
  electionYear: number;
};

// Mock users database - Adamawa focused
export const users: User[] = [
  {
    id: "user-1",
    nin: "12345678901",
    firstName: "Aliyu",
    lastName: "Mohammed",
    dateOfBirth: "1996-03-15",
    phoneNumber: "+2348012345678",
    age: 28,
    gender: "male",
    state: "Adamawa State",
    lga: "Song",
    ward: "Song Ward 1",
    pollingUnit: "Unit 001 - Community Centre",
    candidateId: "cand-apc-4", // Supporting Hon. Aliyu Wakili Boya
    surveyAnswers: {
      q1: "security",
      q2: "good",
      q3: ["roads", "electricity"],
      q4: "critical",
      q5: "business-loans",
      q6: ["sms", "whatsapp"],
      q7: "farming",
      q8: "very-likely",
    },
    registrationDate: "2024-10-15",
    isVerified: true,
    verifiedAt: "2024-10-15T10:30:00Z",
  },
  {
    id: "user-2",
    nin: "98765432109",
    firstName: "Hauwa",
    lastName: "Bello",
    dateOfBirth: "1992-07-22",
    phoneNumber: "+2348098765432",
    age: 32,
    gender: "female",
    state: "Adamawa State",
    lga: "Fufore",
    ward: "Malabu Ward",
    pollingUnit: "Unit 002 - Malabu Primary School",
    candidateId: "cand-apc-4", // Supporting Hon. Aliyu Wakili Boya
    surveyAnswers: {
      q1: "education",
      q2: "fair",
      q3: ["schools", "hospitals"],
      q4: "very-important",
      q5: "education-aid",
      q6: ["town-hall", "radio"],
      q7: "teaching",
      q8: "likely",
    },
    registrationDate: "2024-10-14",
    isVerified: true,
    verifiedAt: "2024-10-14T14:20:00Z",
  },
];

// Mock candidates database
export const candidates: Candidate[] = [
  {
    id: "cand-apc-1",
    name: "Dr. Ahmadu Umaru Fintiri",
    party: "APC",
    position: "Governor",
    state: "Adamawa State",
    constituency: "Adamawa State",
    description: "Experienced leader focused on development and security",
    supporters: 1250,
    photo: "/api/placeholder/150/150",
    surveyId: "survey-apc-1",
    tagline: "Security, Development, Progress",
    vision: "Building a safer and more prosperous Adamawa State",
  },
  {
    id: "cand-pdp-1",
    name: "Senator Aishatu Dahiru Ahmed",
    party: "PDP",
    position: "Governor",
    state: "Adamawa State",
    constituency: "Adamawa State",
    description: "Progressive leader committed to education and healthcare",
    supporters: 980,
    photo: "/api/placeholder/150/150",
    surveyId: "survey-pdp-1",
    tagline: "Education, Healthcare, Women Empowerment",
    vision:
      "Creating an Adamawa State where everyone has access to quality education and healthcare",
  },
  {
    id: "cand-apc-2",
    name: "Hon. Abdulrazak Namdas",
    party: "APC",
    position: "House of Representatives",
    state: "Adamawa State",
    constituency: "Ganye/Toungo/Mayo Belwa",
    description: "Youth advocate and infrastructure development champion",
    supporters: 750,
    photo: "/api/placeholder/150/150",
    surveyId: "survey-apc-2",
    tagline: "Youth Empowerment, Infrastructure",
    vision:
      "Transforming Ganye/Toungo/Mayo Belwa through youth-driven development",
  },
  {
    id: "cand-pdp-2",
    name: "Dr. Maryam Inna Ciroma",
    party: "PDP",
    position: "Senator",
    state: "Adamawa State",
    constituency: "Adamawa Central",
    description: "Healthcare professional dedicated to women's empowerment",
    supporters: 650,
    photo: "/api/placeholder/150/150",
    surveyId: "survey-pdp-2",
    tagline: "Healthcare, Women's Rights, Community Welfare",
    vision:
      "Ensuring every community in Adamawa Central has access to quality healthcare",
  },
  {
    id: "cand-apc-4",
    name: "Hon. Aliyu Wakili Boya",
    party: "APC",
    position: "House of Representatives",
    state: "Adamawa State",
    constituency: "Fufore/Song Federal Constituency",
    description:
      "Former ALGON Chairman and Executive Chairman of Fufore LGA. Currently serving first term in 10th National Assembly",
    supporters: 850,
    photo: "/api/placeholder/150/150",
    surveyId: "survey-apc-4",
    tagline: "Fixing Roads, Creating Jobs, Building Communities",
    vision:
      "Transforming Fufore/Song through infrastructure and economic development",
  },
];

// Mock candidate surveys database
export const candidateSurveys: CandidateSurvey[] = [
  {
    id: "survey-apc-4",
    candidateId: "cand-apc-4",
    candidateName: "Hon. Aliyu Wakili Boya",
    title: "Public Opinion on Infrastructure Development",
    description:
      "Share your views on infrastructure projects and community development in Song & Fufore LGA. Your input helps shape policy priorities.",
    questions: [
      {
        id: "q1",
        type: "single",
        question: "How would you rate the current state of roads in your area?",
        description:
          "Your assessment helps prioritize infrastructure investments",
        icon: "🛣️",
        options: [
          {
            id: "opt-excellent",
            label: "Excellent - Well maintained",
            icon: "✅",
          },
          { id: "opt-good", label: "Good - Minor issues", icon: "👍" },
          { id: "opt-fair", label: "Fair - Needs improvement", icon: "⚠️" },
          { id: "opt-poor", label: "Poor - Major problems", icon: "❌" },
          { id: "opt-very-poor", label: "Very Poor - Unusable", icon: "🚫" },
        ],
      },
      {
        id: "q2",
        type: "multiple",
        question:
          "Which infrastructure project is most needed in your community?",
        description: "Select all that apply to your community's needs",
        options: [
          {
            id: "opt-roads",
            label: "Road Construction & Maintenance",
            icon: "🛣️",
          },
          { id: "opt-water", label: "Water Supply & Distribution", icon: "💧" },
          {
            id: "opt-electricity",
            label: "Electricity & Power Grid",
            icon: "⚡",
          },
          { id: "opt-healthcare", label: "Healthcare Facilities", icon: "🏥" },
          { id: "opt-schools", label: "Schools & Education", icon: "📚" },
          { id: "opt-bridges", label: "Bridges & Culverts", icon: "🌉" },
          { id: "opt-drainage", label: "Drainage Systems", icon: "🌊" },
        ],
      },
      {
        id: "q3",
        type: "scale",
        question: "How satisfied are you with current government services?",
        description: "Rate your overall satisfaction with public services",
        minLabel: "Very Dissatisfied",
        maxLabel: "Very Satisfied",
      },
      {
        id: "q4",
        type: "single",
        question: "What is your primary source of income?",
        description:
          "Understanding economic activities helps in policy planning",
        options: [
          { id: "opt-farming", label: "Farming & Agriculture", icon: "🌾" },
          { id: "opt-business", label: "Small Business & Trade", icon: "🏪" },
          { id: "opt-government", label: "Government Employment", icon: "🏛️" },
          { id: "opt-private", label: "Private Sector Job", icon: "💼" },
          { id: "opt-artisan", label: "Artisan & Crafts", icon: "🔨" },
          { id: "opt-unemployed", label: "Currently Unemployed", icon: "😔" },
        ],
      },
      {
        id: "q5",
        type: "text",
        question:
          "What specific improvements would you like to see in Song/Fufore?",
        description:
          "Share your detailed thoughts on community development (10-500 characters)",
      },
    ],
    createdAt: "2024-10-15T10:00:00Z",
  },
  {
    id: "survey-pdp-2",
    candidateId: "cand-pdp-2",
    candidateName: "Dr. Maryam Inna Ciroma",
    title: "Dr. Maryam's Vision for Adamawa Central",
    description:
      "Healthcare & Women's Empowerment - Your priorities shape her agenda",
    questions: [
      {
        id: "q1",
        type: "single",
        question: "What's your primary health concern?",
        icon: "🏥",
        options: [
          { id: "opt-access", label: "Hospitals too far away" },
          { id: "opt-cost", label: "Healthcare too expensive" },
          { id: "opt-quality", label: "Poor quality care" },
          { id: "opt-maternal", label: "Maternal health services" },
        ],
      },
      {
        id: "q2",
        type: "single",
        question: "What support do women need most in your area?",
        options: [
          { id: "opt-jobs-women", label: "Job opportunities for women" },
          { id: "opt-training-women", label: "Skills training" },
          { id: "opt-childcare", label: "Childcare support" },
          { id: "opt-loans", label: "Microfinance/loans" },
        ],
      },
      {
        id: "q3",
        type: "multiple",
        question: "What should Dr. Maryam prioritize?",
        options: [
          { id: "opt-clinics", label: "Build more health clinics" },
          { id: "opt-training-health", label: "Train more healthcare workers" },
          { id: "opt-equipment", label: "Better medical equipment" },
          { id: "opt-awareness", label: "Health awareness programs" },
        ],
      },
    ],
    createdAt: "2024-10-15T10:00:00Z",
  },
  {
    id: "survey-apc-1",
    candidateId: "cand-apc-1",
    candidateName: "Dr. Ahmadu Umaru Fintiri",
    title: "Building a Safer Adamawa",
    description:
      "Help Dr. Fintiri understand what security and development mean to you",
    questions: [
      {
        id: "q1",
        type: "single",
        question: "What's your biggest security concern?",
        options: [
          { id: "opt-insecurity", label: "General insecurity in the state" },
          { id: "opt-community", label: "Community safety" },
          { id: "opt-roads", label: "Safe travel on roads" },
        ],
      },
      {
        id: "q2",
        type: "multiple",
        question: "Which developments matter most?",
        options: [
          { id: "opt-security-ops", label: "Enhanced security operations" },
          { id: "opt-infrastructure", label: "Infrastructure development" },
          { id: "opt-economy", label: "Economic growth" },
        ],
      },
    ],
    createdAt: "2024-10-15T10:00:00Z",
  },
  {
    id: "survey-pdp-1",
    candidateId: "cand-pdp-1",
    candidateName: "Senator Aishatu Dahiru Ahmed",
    title: "Investing in Our Future",
    description: "Education and healthcare are the foundation for progress",
    questions: [
      {
        id: "q1",
        type: "single",
        question: "What's your priority for Adamawa?",
        options: [
          { id: "opt-education", label: "Quality Education" },
          { id: "opt-health", label: "Healthcare Services" },
          { id: "opt-women", label: "Women's Empowerment" },
        ],
      },
    ],
    createdAt: "2024-10-15T10:00:00Z",
  },
  {
    id: "survey-apc-2",
    candidateId: "cand-apc-2",
    candidateName: "Hon. Abdulrazak Namdas",
    title: "Youth-Led Development",
    description: "Your voice matters in shaping Ganye/Toungo/Mayo Belwa",
    questions: [
      {
        id: "q1",
        type: "single",
        question: "What opportunity do you need most?",
        options: [
          { id: "opt-jobs", label: "Job opportunities" },
          { id: "opt-training", label: "Skills training" },
          { id: "opt-startup", label: "Business startup support" },
        ],
      },
    ],
    createdAt: "2024-10-15T10:00:00Z",
  },
];

// Location data types for API responses
export type LocationState = {
  code: string;
  name: string;
};

export type LocationLGA = {
  code: string;
  name: string;
  stateCode: string;
};

export type LocationWard = {
  code: string;
  name: string;
  lgaCode: string;
};

export type LocationPollingUnit = {
  code: string;
  name: string;
  wardCode: string;
};

// Mock ward data - only what we need for demo
// States and LGAs are now sourced from nigeria-locations.ts
const mockWards: LocationWard[] = [
  // Adamawa wards (demo data)
  { code: "JAMBUTU", name: "Jambutu", lgaCode: "YOLN" },
  { code: "AJIYA", name: "Ajiya", lgaCode: "YOLN" },
  { code: "KAREWA", name: "Karewa", lgaCode: "YOLN" },
  { code: "ALKALAWA", name: "Alkalawa", lgaCode: "YOLN" },
  { code: "DOUBELI", name: "Doubeli", lgaCode: "YOLN" },

  { code: "BAMOI", name: "Bamoi", lgaCode: "YOLS" },
  { code: "NGURORE", name: "Ngurore", lgaCode: "YOLS" },
  { code: "ADARAWO", name: "Adarawo", lgaCode: "YOLS" },

  { code: "SONG-W1", name: "Song Ward 1", lgaCode: "SONG" },
  { code: "SONG-W2", name: "Song Ward 2", lgaCode: "SONG" },
  { code: "SONG-W3", name: "Song Central", lgaCode: "SONG" },

  { code: "FUF-W1", name: "Fufore Ward 1", lgaCode: "FUF" },
  { code: "FUF-W2", name: "Fufore Ward 2", lgaCode: "FUF" },
  { code: "MALABU", name: "Malabu Ward", lgaCode: "FUF" },
  { code: "RIBADU", name: "Ribadu Ward", lgaCode: "FUF" },
];

// Function to generate polling units dynamically
function generatePollingUnits(
  wardCode: string,
  count = 15,
): LocationPollingUnit[] {
  const locations = [
    "Community Centre",
    "Primary School",
    "Secondary School",
    "Town Hall",
    "Health Centre",
    "Civic Centre",
    "Church Hall",
    "Mosque",
    "Market Square",
    "Police Station",
    "Fire Station",
    "Youth Centre",
    "Women Centre",
    "Sports Complex",
    "Public Library",
    "Council Ward Office",
  ];

  return Array.from({ length: count }).map((_, i) => {
    const num = String(i + 1).padStart(3, "0");
    const location = locations[i % locations.length];
    const prefix = wardCode.slice(0, 3).toUpperCase();

    return {
      code: `${prefix}-${num}`,
      name: `Unit ${num} - ${location}`,
      wardCode,
    };
  });
}

// Mock API functions
export const mockApi = {
  // Verify NIN with mock API
  verifyNIN: async (
    nin: string,
  ): Promise<{
    verified: boolean;
    message: string;
    data?: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      state: string;
      lga: string;
    };
  }> => {
    console.log(`🆔 Mock: Verifying NIN ${nin}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Verify NIN - accept any 11-digit NIN for demo
    if (nin.length === 11 && /^\d{11}$/.test(nin)) {
      // Return verification data with Adamawa-focused names
      const names = [
        { firstName: "Aisha", lastName: "Mohammed" },
        { firstName: "Ibrahim", lastName: "Aliyu" },
        { firstName: "Fatima", lastName: "Usman" },
        { firstName: "Musa", lastName: "Ahmad" },
        { firstName: "Zainab", lastName: "Hassan" },
        { firstName: "Yusuf", lastName: "Ibrahim" },
        { firstName: "Amina", lastName: "Suleiman" },
        { firstName: "Mohammed", lastName: "Yakubu" },
        { firstName: "Hauwa", lastName: "Bello" },
        { firstName: "Aliyu", lastName: "Wakili" },
        { firstName: "Maryam", lastName: "Tukur" },
        { firstName: "Ahmadu", lastName: "Fintiri" },
        { firstName: "Halima", lastName: "Jibrilla" },
        { firstName: "Umar", lastName: "Bindow" },
      ];

      const states = [
        {
          state: "Adamawa State",
          lgas: [
            "Song",
            "Fufore",
            "Yola North",
            "Yola South",
            "Mubi North",
            "Mubi South",
            "Ganye",
            "Toungo",
            "Mayo Belwa",
            "Jimeta",
            "Numan",
            "Demsa",
            "Girei",
            "Hong",
            "Michika",
            "Maiha",
            "Shelleng",
            "Lamurde",
            "Guyuk",
            "Madagali",
          ],
        },
        {
          state: "Lagos State",
          lgas: [
            "Ikeja",
            "Eti-Osa",
            "Surulere",
            "Mushin",
            "Oshodi-Isolo",
            "Kosofe",
          ],
        },
        {
          state: "Kano State",
          lgas: [
            "Kano Municipal",
            "Nassarawa",
            "Gwale",
            "Tarauni",
            "Dala",
            "Fagge",
          ],
        },
      ];

      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomState = states[Math.floor(Math.random() * states.length)];
      const randomYear = 1985 + Math.floor(Math.random() * 20); // Ages 18-38
      const randomMonth = Math.floor(Math.random() * 12) + 1;
      const randomDay = Math.floor(Math.random() * 28) + 1;

      return {
        verified: true,
        message: "NIN verified successfully",
        data: {
          firstName: randomName.firstName,
          lastName: randomName.lastName,
          dateOfBirth: `${randomYear}-${randomMonth.toString().padStart(2, "0")}-${randomDay.toString().padStart(2, "0")}`,
          state: randomState.state,
          lga: randomState.lgas[
            Math.floor(Math.random() * randomState.lgas.length)
          ],
        },
      };
    }

    return {
      verified: false,
      message: "Invalid NIN format",
    };
  },

  // Check if user already exists by NIN in mock data
  checkRegistration: async (
    nin: string,
    year: number,
  ): Promise<{ exists: boolean; user?: User }> => {
    console.log(`🔍 Mock: Checking registration for NIN ${nin} in ${year}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Check if user exists in data
    const existingUser = users.find((user) => user.nin === nin);

    if (existingUser) {
      return {
        exists: true,
        user: existingUser,
      };
    }

    return {
      exists: false,
    };
  },

  // Get user profile by NIN
  getUserProfile: async (nin: string): Promise<{ user: User | null }> => {
    console.log(`👤 Mock: Getting profile for NIN ${nin}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = users.find((u) => u.nin === nin);

    return {
      user: user || null,
    };
  },

  // Get candidates filtered by location (state, LGA)
  getCandidates: async (
    state?: string,
    lga?: string,
  ): Promise<{ candidates: Candidate[] }> => {
    console.log(`🗳️ Mock: Getting candidates for ${state || "all states"}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    let filtered = candidates;

    // Filter by state if provided
    if (state) {
      filtered = filtered.filter((candidate) => candidate.state === state);
    }

    // For House of Representatives, filter by LGA/constituency if provided
    if (lga && state) {
      filtered = filtered.filter((candidate) => {
        // Governors and Senators match the state
        if (
          candidate.position === "Governor" ||
          candidate.position === "Senator"
        ) {
          return candidate.state === state;
        }

        // House of Representatives: match if constituency contains the LGA
        if (candidate.position === "House of Representatives") {
          const constituencyLower = candidate.constituency.toLowerCase();
          const lgaLower = lga.toLowerCase();

          // Check if constituency contains the LGA name
          // Example: "Fufore/Song Federal Constituency" matches "Fufore" or "Song"
          return (
            constituencyLower.includes(lgaLower) ||
            lgaLower.includes(
              constituencyLower.split("/")[0]?.toLowerCase() || "",
            )
          );
        }

        return true;
      });
    }

    return {
      candidates: filtered,
    };
  },

  // Get candidate survey by candidate ID
  getCandidateSurvey: async (
    candidateId: string,
  ): Promise<{ survey: CandidateSurvey | null }> => {
    console.log(`📋 Mock: Getting survey for candidate ${candidateId}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const survey = candidateSurveys.find((s) => s.candidateId === candidateId);

    return {
      survey: survey || null,
    };
  },

  // Submit registration
  submitRegistration: async (
    data: RegistrationData,
  ): Promise<{ success: boolean; registrationId: string }> => {
    console.log(`📝 Mock: Submitting registration`, data);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate a mock registration ID
    const registrationId = `REG-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    return {
      success: true,
      registrationId,
    };
  },

  // Switch candidate support
  switchCandidate: async (
    nin: string,
    newCandidateId: string,
  ): Promise<{ success: boolean }> => {
    console.log(
      `🔄 Mock: Switching candidate for NIN ${nin} to ${newCandidateId}`,
    );

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find and update user in mock data
    const userIndex = users.findIndex((u) => u.nin === nin);
    if (userIndex !== -1) {
      users[userIndex].candidateId = newCandidateId;
    }

    return {
      success: true,
    };
  },

  // Location API endpoints for optimized data fetching
  getStates: async (): Promise<{ states: LocationState[] }> => {
    console.log("🌍 Mock: Getting all states");

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Use data from nigeria-locations.ts (no redundancy)
    const states = nigeriaStates.map((state) => ({
      code: state.code,
      name: state.name,
    })) as LocationState[];

    return { states };
  },

  getLGAsByState: async (
    stateCode: string,
  ): Promise<{ lgas: LocationLGA[] }> => {
    console.log(`🏛️ Mock: Getting LGAs for state ${stateCode}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Use data from nigeria-locations.ts (no redundancy)
    const lgas = nigeriaLGAs.filter(
      (lga) => lga.stateCode === stateCode,
    ) as LocationLGA[];

    return { lgas };
  },

  getWardsByLGA: async (
    lgaCode: string,
  ): Promise<{ wards: LocationWard[] }> => {
    console.log(`🏘️ Mock: Getting wards for LGA ${lgaCode}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Use mock ward data (limited to demo areas)
    const wards = mockWards.filter((ward) => ward.lgaCode === lgaCode);

    return { wards };
  },

  getPollingUnitsByWard: async (
    wardCode: string,
  ): Promise<{ pollingUnits: LocationPollingUnit[] }> => {
    console.log(`🗳️ Mock: Getting polling units for ward ${wardCode}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate polling units dynamically
    const pollingUnits = generatePollingUnits(wardCode);

    return { pollingUnits };
  },

  // Enhanced NIN verification that includes state/LGA codes for pre-population
  verifyNINWithLocation: async (
    nin: string,
  ): Promise<{
    verified: boolean;
    message: string;
    data?: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      stateCode: string;
      stateName: string;
      lgaCode: string;
      lgaName: string;
    };
  }> => {
    console.log(`🆔 Mock: Verifying NIN ${nin} with location data`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Verify NIN - accept any 11-digit NIN for demo
    if (nin.length === 11 && /^\d{11}$/.test(nin)) {
      const names = [
        { firstName: "Aisha", lastName: "Mohammed" },
        { firstName: "Ibrahim", lastName: "Aliyu" },
        { firstName: "Fatima", lastName: "Usman" },
        { firstName: "Musa", lastName: "Ahmad" },
        { firstName: "Zainab", lastName: "Hassan" },
        { firstName: "Yusuf", lastName: "Ibrahim" },
        { firstName: "Amina", lastName: "Suleiman" },
        { firstName: "Mohammed", lastName: "Yakubu" },
        { firstName: "Hauwa", lastName: "Bello" },
        { firstName: "Aliyu", lastName: "Wakili" },
      ];

      // Weighted towards Adamawa for demo, but includes other major states
      const stateOptions = [
        { weight: 40, stateCode: "AD" }, // Adamawa - demo focus
        { weight: 20, stateCode: "LA" }, // Lagos - most populous
        { weight: 15, stateCode: "KN" }, // Kano - northern major state
        { weight: 10, stateCode: "RI" }, // Rivers - south south
        { weight: 5, stateCode: "AB" }, // Abia - south east
        { weight: 5, stateCode: "FC" }, // FCT - capital
        { weight: 5, stateCode: "KD" }, // Kaduna - north central
      ];

      // Select state based on weight
      const random = Math.random() * 100;
      let cumulative = 0;
      const selectedStateCode =
        stateOptions.find((state) => {
          cumulative += state.weight;
          return random <= cumulative;
        })?.stateCode || "AD";

      // Get state and LGA data
      const selectedState = getStateByCode(selectedStateCode);
      const availableLGAs = getLGAsByState(selectedStateCode);

      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomLGA =
        availableLGAs[Math.floor(Math.random() * availableLGAs.length)];
      const randomYear = 1985 + Math.floor(Math.random() * 20); // Ages 18-38
      const randomMonth = Math.floor(Math.random() * 12) + 1;
      const randomDay = Math.floor(Math.random() * 28) + 1;

      return {
        verified: true,
        message: "NIN verified successfully",
        data: {
          firstName: randomName.firstName,
          lastName: randomName.lastName,
          dateOfBirth: `${randomYear}-${randomMonth.toString().padStart(2, "0")}-${randomDay.toString().padStart(2, "0")}`,
          stateCode: selectedState?.code || "AD",
          stateName: selectedState?.name || "Adamawa State",
          lgaCode: randomLGA.code,
          lgaName: randomLGA.name,
        },
      };
    }

    return {
      verified: false,
      message: "Invalid NIN format",
    };
  },
};
