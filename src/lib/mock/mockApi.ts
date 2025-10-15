// Mock data for voter registration flow - DEMO ONLY
// This simulates API responses for UI testing

export type MockUser = {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
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

// Mock users database
export const mockUsers: MockUser[] = [
  {
    id: "user-1",
    phone: "+2348012345678",
    firstName: "Aliyu",
    lastName: "Mohammed",
    age: 28,
    gender: "male",
    state: "Adamawa State",
    lga: "Song",
    ward: "Song Ward 1",
    pollingUnit: "Unit 001 - Community Centre",
    candidateId: "cand-apc-1",
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
  },
  {
    id: "user-2",
    phone: "+2348098765432",
    firstName: "Fatima",
    lastName: "Ibrahim",
    age: 32,
    gender: "female",
    state: "Adamawa State",
    lga: "Fufore",
    ward: "Fufore Ward 1",
    pollingUnit: "Unit 002 - Primary School",
    candidateId: "cand-pdp-1",
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
  },
];

// Mock candidates
export const mockCandidates: MockCandidate[] = [
  {
    id: "cand-apc-1",
    name: "Hon. Ahmed Suleiman",
    party: "APC",
    position: "House of Representatives",
    constituency: "Song & Fufore Federal Constituency",
    description: "Security and job creation focused",
    supporters: 2847,
  },
  {
    id: "cand-pdp-1",
    name: "Alhaji Bello Ibrahim",
    party: "PDP",
    position: "House of Representatives",
    constituency: "Song & Fufore Federal Constituency",
    description: "Education and infrastructure advocate",
    supporters: 1923,
  },
  {
    id: "cand-lp-1",
    name: "Dr. Fatima Yusuf",
    party: "LP",
    position: "House of Representatives",
    constituency: "Song & Fufore Federal Constituency",
    description: "Healthcare and youth empowerment",
    supporters: 1156,
  },
  {
    id: "cand-undecided",
    name: "I'm Undecided",
    party: "",
    position: "",
    constituency: "",
    description: "Select this option if you haven't decided yet",
    supporters: 0,
  },
];

// Mock API functions
export const mockApi = {
  // Simulate OTP sending
  sendOtp: async (
    phone: string,
  ): Promise<{ success: boolean; message: string }> => {
    console.log(`📱 Mock: Sending OTP to ${phone}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Always succeed for demo
    return {
      success: true,
      message: "OTP sent successfully (DEMO MODE)",
    };
  },

  // Simulate OTP verification
  verifyOtp: async (
    phone: string,
    otp: string,
  ): Promise<{ verified: boolean; message: string }> => {
    console.log(`🔐 Mock: Verifying OTP ${otp} for ${phone}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Accept any 6-digit OTP for demo
    if (otp.length === 6 && /^\d{6}$/.test(otp)) {
      return {
        verified: true,
        message: "OTP verified successfully (DEMO MODE)",
      };
    }

    return {
      verified: false,
      message: "Invalid OTP (DEMO MODE)",
    };
  },

  // Check if user already exists
  checkRegistration: async (
    phone: string,
    year: number,
  ): Promise<{ exists: boolean; user?: MockUser }> => {
    console.log(`🔍 Mock: Checking registration for ${phone} in ${year}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Check if user exists in mock data
    const existingUser = mockUsers.find((user) => user.phone === phone);

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

  // Get candidates for location
  getCandidates: async (
    state: string,
    lga: string,
  ): Promise<{ candidates: MockCandidate[] }> => {
    console.log(`👥 Mock: Getting candidates for ${state}, ${lga}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Return all candidates for demo
    return {
      candidates: mockCandidates,
    };
  },

  // Submit registration
  submitRegistration: async (
    registrationData: any,
  ): Promise<{ success: boolean; userId: string }> => {
    console.log(`📝 Mock: Submitting registration`, registrationData);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate mock user ID
    const userId = `user-${Date.now()}`;

    return {
      success: true,
      userId,
    };
  },

  // Get user profile
  getUserProfile: async (phone: string): Promise<{ user: MockUser | null }> => {
    console.log(`👤 Mock: Getting profile for ${phone}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find((u) => u.phone === phone);

    return {
      user: user || null,
    };
  },
};

// Demo phone numbers for testing
export const demoPhones = [
  "+2348012345678", // Aliyu Mohammed (existing user)
  "+2348098765432", // Fatima Ibrahim (existing user)
  "+2348055555555", // New user
  "+2348077777777", // New user
];

// Demo OTP codes (any 6 digits work in demo mode)
export const demoOtps = ["123456", "000000", "111111", "999999"];

// Helper function to get demo user
export const getDemoUser = (phone: string): MockUser | null => {
  return mockUsers.find((user) => user.phone === phone) || null;
};

// Helper function to check if phone is demo
export const isDemoPhone = (phone: string): boolean => {
  return demoPhones.includes(phone);
};

// Helper function to get demo message
export const getDemoMessage = (action: string): string => {
  return `🎭 DEMO MODE: ${action} - This is mock data for UI testing`;
};

export default mockApi;
