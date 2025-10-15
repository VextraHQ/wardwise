export type SurveyQuestion = {
  id: string;
  question: string;
  description?: string;
  type: "single" | "multiple";
  options: {
    id: string;
    label: string;
    icon?: string;
  }[];
};

// Mock survey questions - in production, these would come from the candidate's admin panel
export const surveyQuestions: SurveyQuestion[] = [
  {
    id: "q1",
    question: "What is your biggest concern in our community?",
    description: "Select the issue that matters most to you",
    type: "single",
    options: [
      { id: "security", label: "Security and Safety" },
      { id: "education", label: "Education Quality" },
      { id: "healthcare", label: "Healthcare Access" },
      { id: "jobs", label: "Job Creation" },
      { id: "infrastructure", label: "Infrastructure Development" },
      { id: "agriculture", label: "Agriculture Support" },
    ],
  },
  {
    id: "q2",
    question: "How would you rate the current state of education in your area?",
    description: "Your honest feedback helps us understand local needs",
    type: "single",
    options: [
      { id: "excellent", label: "Excellent" },
      { id: "good", label: "Good" },
      { id: "fair", label: "Fair" },
      { id: "poor", label: "Poor" },
      { id: "very-poor", label: "Very Poor" },
    ],
  },
  {
    id: "q3",
    question: "What infrastructure improvements are most needed?",
    description: "You can select multiple options",
    type: "multiple",
    options: [
      { id: "roads", label: "Roads and Highways" },
      { id: "electricity", label: "Electricity Supply" },
      { id: "water", label: "Clean Water Access" },
      { id: "schools", label: "School Buildings" },
      { id: "hospitals", label: "Healthcare Facilities" },
      { id: "markets", label: "Markets and Trade Centers" },
    ],
  },
  {
    id: "q4",
    question: "How important is youth employment to you?",
    type: "single",
    options: [
      { id: "critical", label: "Critical - Top Priority" },
      { id: "very-important", label: "Very Important" },
      { id: "important", label: "Important" },
      { id: "somewhat", label: "Somewhat Important" },
      { id: "not-priority", label: "Not a Priority" },
    ],
  },
  {
    id: "q5",
    question: "What type of support would benefit your household most?",
    type: "single",
    options: [
      { id: "business-loans", label: "Business Loans and Grants" },
      { id: "skills-training", label: "Skills Training Programs" },
      { id: "farm-support", label: "Agricultural Support" },
      { id: "education-aid", label: "Education Assistance" },
      { id: "healthcare-subsidy", label: "Healthcare Subsidies" },
      { id: "housing", label: "Housing Support" },
    ],
  },
  {
    id: "q6",
    question: "How do you prefer to receive updates from your representative?",
    description: "This helps us communicate effectively with you",
    type: "multiple",
    options: [
      { id: "sms", label: "SMS Messages" },
      { id: "whatsapp", label: "WhatsApp" },
      { id: "town-hall", label: "Town Hall Meetings" },
      { id: "radio", label: "Radio Broadcasts" },
      { id: "social-media", label: "Social Media" },
      { id: "community-leaders", label: "Through Community Leaders" },
    ],
  },
  {
    id: "q7",
    question: "What is your primary occupation?",
    type: "single",
    options: [
      { id: "farming", label: "Farming/Agriculture" },
      { id: "trading", label: "Trading/Business" },
      { id: "civil-service", label: "Civil Service" },
      { id: "teaching", label: "Teaching" },
      { id: "healthcare", label: "Healthcare Worker" },
      { id: "student", label: "Student" },
      { id: "unemployed", label: "Currently Unemployed" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "q8",
    question:
      "How likely are you to participate in community development projects?",
    type: "single",
    options: [
      { id: "very-likely", label: "Very Likely" },
      { id: "likely", label: "Likely" },
      { id: "neutral", label: "Neutral" },
      { id: "unlikely", label: "Unlikely" },
      { id: "very-unlikely", label: "Very Unlikely" },
    ],
  },
];

export function getSurveyQuestions(): SurveyQuestion[] {
  return surveyQuestions;
}
