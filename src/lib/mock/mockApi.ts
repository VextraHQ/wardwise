// Mock data for voter registration flow - DEMO ONLY
// This simulates API responses for UI testing

export type MockUser = {
  id: string;
  nin: string; // National Identification Number
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber?: string; // Optional phone number
  age: number;
  gender: "male" | "female" | "other";
  state: string;
  lga: string;
  ward: string;
  pollingUnit: string;
  candidateId: string;
  surveyAnswers: Record<string, string | string[]>;
  registrationDate: string;
  isVerified: boolean;
  verifiedAt?: string; // When NIN was verified
};

export type MockCandidate = {
  id: string;
  name: string;
  party: string;
  position: string;
  constituency: string;
  description: string;
  supporters: number;
  photo?: string;
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
  };
  survey: {
    priorities: string[];
    comments?: string;
  };
  electionYear: number;
};

// Mock users database - Adamawa focused
export const mockUsers: MockUser[] = [
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
export const mockCandidates: MockCandidate[] = [
  {
    id: "cand-apc-1",
    name: "Dr. Ahmadu Umaru Fintiri",
    party: "APC",
    position: "Governor",
    constituency: "Adamawa State",
    description: "Experienced leader focused on development and security",
    supporters: 1250,
    photo: "/api/placeholder/150/150",
  },
  {
    id: "cand-pdp-1",
    name: "Senator Aishatu Dahiru Ahmed",
    party: "PDP",
    position: "Governor",
    constituency: "Adamawa State",
    description: "Progressive leader committed to education and healthcare",
    supporters: 980,
    photo: "/api/placeholder/150/150",
  },
  {
    id: "cand-apc-2",
    name: "Hon. Abdulrazak Namdas",
    party: "APC",
    position: "House of Representatives",
    constituency: "Ganye/Toungo/Mayo Belwa",
    description: "Youth advocate and infrastructure development champion",
    supporters: 750,
    photo: "/api/placeholder/150/150",
  },
  {
    id: "cand-pdp-2",
    name: "Dr. Maryam Inna Ciroma",
    party: "PDP",
    position: "Senator",
    constituency: "Adamawa Central",
    description: "Healthcare professional dedicated to women's empowerment",
    supporters: 650,
    photo: "/api/placeholder/150/150",
  },
  {
    id: "cand-lp-1",
    name: "Engr. Peter Obi",
    party: "LP",
    position: "President",
    constituency: "Nigeria",
    description: "Business leader focused on economic transformation",
    supporters: 2500,
    photo: "/api/placeholder/150/150",
  },
  {
    id: "cand-apc-3",
    name: "Sen. Bola Ahmed Tinubu",
    party: "APC",
    position: "President",
    constituency: "Nigeria",
    description: "Experienced administrator and economic reformer",
    supporters: 2200,
    photo: "/api/placeholder/150/150",
  },
  {
    id: "cand-pdp-3",
    name: "Alhaji Atiku Abubakar",
    party: "PDP",
    position: "President",
    constituency: "Nigeria",
    description: "Former Vice President with extensive governance experience",
    supporters: 1800,
    photo: "/api/placeholder/150/150",
  },
  {
    id: "cand-apc-4",
    name: "Hon. Aliyu Wakili Boya",
    party: "APC",
    position: "House of Representatives",
    constituency: "Fufore/Song Federal Constituency",
    description:
      "Former ALGON Chairman and Executive Chairman of Fufore LGA. Currently serving first term in 10th National Assembly",
    supporters: 850,
    photo: "/api/placeholder/150/150",
  },
];

// Mock API functions
export const mockApi = {
  // Enhanced NIN verification with more realistic data
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

    // Mock NIN verification - accept any 11-digit NIN for demo
    if (nin.length === 11 && /^\d{11}$/.test(nin)) {
      // Return mock verification data with Adamawa-focused names
      const mockNames = [
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

      const mockStates = [
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

      const randomName =
        mockNames[Math.floor(Math.random() * mockNames.length)];
      const randomState =
        mockStates[Math.floor(Math.random() * mockStates.length)];
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

  // Check if user already exists by NIN
  checkRegistration: async (
    nin: string,
    year: number,
  ): Promise<{ exists: boolean; user?: MockUser }> => {
    console.log(`🔍 Mock: Checking registration for NIN ${nin} in ${year}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Check if user exists in mock data
    const existingUser = mockUsers.find((user) => user.nin === nin);

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
  getUserProfile: async (nin: string): Promise<{ user: MockUser | null }> => {
    console.log(`👤 Mock: Getting profile for NIN ${nin}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find((u) => u.nin === nin);

    return {
      user: user || null,
    };
  },

  // Get all candidates
  getCandidates: async (): Promise<{ candidates: MockCandidate[] }> => {
    console.log(`🗳️ Mock: Getting candidates`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      candidates: mockCandidates,
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
    const userIndex = mockUsers.findIndex((u) => u.nin === nin);
    if (userIndex !== -1) {
      mockUsers[userIndex].candidateId = newCandidateId;
    }

    return {
      success: true,
    };
  },
};

// Demo NINs for testing - Adamawa focused
export const demoNINs = [
  "12345678901", // Aliyu Mohammed (existing user)
  "98765432109", // Hauwa Bello (existing user)
  "11111111111", // New user
  "22222222222", // New user
  "33333333333", // New user
];
