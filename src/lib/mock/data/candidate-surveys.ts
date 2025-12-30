/**
 * Candidate Survey Data
 *
 * Single source of truth for all candidate survey data.
 * These surveys are linked to candidates via candidateId.
 *
 * These surveys follow professional polling standards:
 * - Clear, neutral language without leading questions
 * - Comprehensive policy coverage
 * - Realistic election survey structure
 * - No emojis or casual language for professional maturity
 *
 * This data is used by:
 * - Voter registration flow (candidate-survey-step.tsx)
 * - Candidate dashboards (future - analytics on responses)
 * - Survey analytics (future - identify voter priorities)
 *
 * Each survey must have a matching candidateId in candidates.ts
 */

import type { CandidateSurvey, SurveyStatus } from "@/types/survey";

export const candidateSurveys: CandidateSurvey[] = [
  // ============================================================================
  // ADAMAWA STATE CANDIDATE SURVEYS
  // ============================================================================
  {
    id: "survey-apc-4",
    candidateId: "cand-hr-apc-fufore-song",
    candidateName: "Hon. Aliyu Wakili Boya",
    title:
      "Community Development Priorities for Fufore/Song Federal Constituency",
    description:
      "Your responses will help shape policy priorities and infrastructure investments in our constituency. This survey covers infrastructure, economic development, education, healthcare, and security.",
    estimatedMinutes: 5,
    totalResponses: 1247,
    questions: [
      {
        id: "q1",
        type: "single",
        question:
          "How would you rate the overall condition of road infrastructure in your area?",
        description:
          "Please assess the current state of roads including federal, state, and local roads",
        responseStats: {
          totalResponses: 1247,
          topAnswer: {
            label: "Fair - Needs significant improvement",
            percentage: 42,
          },
        },
        options: [
          {
            id: "opt-excellent",
            label: "Excellent - Well maintained and accessible",
          },
          {
            id: "opt-good",
            label: "Good - Generally adequate with minor issues",
          },
          {
            id: "opt-fair",
            label: "Fair - Needs significant improvement",
          },
          {
            id: "opt-poor",
            label: "Poor - Major problems affecting daily activities",
          },
          {
            id: "opt-very-poor",
            label: "Very Poor - Roads are largely unusable",
          },
          {
            id: "opt-other",
            label: "Other (please specify)",
            allowOther: true,
          },
        ],
      },
      {
        id: "q2",
        type: "multiple",
        question:
          "Which infrastructure projects should be prioritized in the next legislative term?",
        description:
          "Select all that are critical to your community's development",
        responseStats: {
          totalResponses: 1247,
          topAnswer: {
            label: "Road construction & rehabilitation",
            percentage: 78,
          },
        },
        options: [
          {
            id: "opt-roads",
            label: "Road construction, rehabilitation, and maintenance",
          },
          {
            id: "opt-bridges",
            label: "Bridge construction and repair",
          },
          {
            id: "opt-drainage",
            label: "Drainage systems and flood control",
          },
          {
            id: "opt-electricity",
            label: "Electricity generation and distribution",
          },
          {
            id: "opt-water",
            label: "Potable water supply and distribution",
          },
          {
            id: "opt-telecom",
            label: "Telecommunications and internet connectivity",
          },
          {
            id: "opt-waste",
            label: "Waste management and sanitation facilities",
          },
          {
            id: "opt-other",
            label: "Other (please specify)",
            allowOther: true,
          },
        ],
      },
      {
        id: "q3",
        type: "scale",
        question:
          "How satisfied are you with the quality of public services in your area?",
        description:
          "Consider healthcare, education, security, utilities, and government services",
        minLabel: "Very Dissatisfied",
        maxLabel: "Very Satisfied",
      },
      {
        id: "q4",
        type: "single",
        question: "What is the primary economic activity in your household?",
        description:
          "This helps in understanding the economic base of the constituency",
        responseStats: {
          totalResponses: 1247,
          topAnswer: {
            label: "Agriculture and farming",
            percentage: 56,
          },
        },
        options: [
          {
            id: "opt-farming",
            label: "Agriculture and farming",
          },
          {
            id: "opt-livestock",
            label: "Livestock and animal husbandry",
          },
          {
            id: "opt-business",
            label: "Small and medium scale business",
          },
          {
            id: "opt-government",
            label: "Government employment (civil service)",
          },
          {
            id: "opt-private",
            label: "Private sector employment",
          },
          {
            id: "opt-artisan",
            label: "Artisan and skilled trades",
          },
          {
            id: "opt-professional",
            label: "Professional services",
          },
          {
            id: "opt-unemployed",
            label: "Currently unemployed",
          },
          {
            id: "opt-retired",
            label: "Retired",
          },
        ],
      },
      {
        id: "q5",
        type: "multiple",
        question:
          "Which economic development initiatives would most benefit your community?",
        description: "Select all relevant opportunities for economic growth",
        responseStats: {
          totalResponses: 1247,
          topAnswer: {
            label: "Agricultural value chain development",
            percentage: 68,
          },
        },
        options: [
          {
            id: "opt-agriculture",
            label: "Agricultural value chain development",
          },
          {
            id: "opt-processing",
            label: "Agro-processing industries",
          },
          {
            id: "opt-markets",
            label: "Market development and access",
          },
          {
            id: "opt-finance",
            label: "Access to finance and microcredit",
          },
          {
            id: "opt-skills",
            label: "Skills development and training programs",
          },
          {
            id: "opt-enterprise",
            label: "Enterprise support and incubation",
          },
          {
            id: "opt-tourism",
            label: "Tourism and cultural heritage promotion",
          },
        ],
      },
      {
        id: "q6",
        type: "single",
        question:
          "How would you rate access to quality healthcare services in your area?",
        description:
          "Consider availability, quality, and affordability of healthcare",
        responseStats: {
          totalResponses: 1247,
          topAnswer: {
            label: "Fair - Limited access or quality concerns",
            percentage: 38,
          },
        },
        options: [
          {
            id: "opt-health-excellent",
            label: "Excellent - Easily accessible quality healthcare",
          },
          {
            id: "opt-health-good",
            label: "Good - Adequate with some challenges",
          },
          {
            id: "opt-health-fair",
            label: "Fair - Limited access or quality concerns",
          },
          {
            id: "opt-health-poor",
            label: "Poor - Significant access and quality issues",
          },
          {
            id: "opt-health-very-poor",
            label: "Very Poor - Healthcare largely unavailable",
          },
        ],
      },
      {
        id: "q7",
        type: "single",
        question:
          "How would you assess the security situation in your community?",
        description:
          "Consider personal safety, property security, and general peace",
        responseStats: {
          totalResponses: 1247,
          topAnswer: {
            label: "Good - Generally safe with minor concerns",
            percentage: 45,
          },
        },
        options: [
          {
            id: "opt-security-excellent",
            label: "Excellent - Very safe and secure",
          },
          {
            id: "opt-security-good",
            label: "Good - Generally safe with minor concerns",
          },
          {
            id: "opt-security-fair",
            label: "Fair - Some security challenges",
          },
          {
            id: "opt-security-poor",
            label: "Poor - Frequent security incidents",
          },
          {
            id: "opt-security-very-poor",
            label: "Very Poor - Significant security threats",
          },
        ],
      },
      {
        id: "q8",
        type: "text",
        question:
          "What specific infrastructure or development projects would have the greatest impact on your community?",
        description:
          "Please provide detailed suggestions (minimum 20 words, maximum 500 words)",
      },
    ],
    createdAt: "2025-10-15T10:00:00Z",
  },
  {
    id: "survey-pdp-2",
    candidateId: "cand-sen-pdp-adamawa-central",
    candidateName: "Dr. Maryam Inna Ciroma",
    title: "Healthcare and Social Welfare Priorities for Adamawa Central",
    description:
      "As a healthcare professional, Dr. Ciroma seeks to understand your priorities for healthcare, education, women's empowerment, and social welfare programs. Your input directly informs policy development.",
    estimatedMinutes: 4,
    totalResponses: 892,
    questions: [
      {
        id: "q1",
        type: "single",
        question:
          "What is your primary concern regarding healthcare access in your area?",
        description:
          "Identify the most critical barrier to healthcare in your community",
        responseStats: {
          totalResponses: 892,
          topAnswer: {
            label: "Cost and affordability of healthcare services",
            percentage: 41,
          },
        },
        options: [
          {
            id: "opt-access",
            label: "Distance to healthcare facilities",
          },
          {
            id: "opt-cost",
            label: "Cost and affordability of healthcare services",
          },
          {
            id: "opt-quality",
            label: "Quality of care and medical personnel",
          },
          {
            id: "opt-equipment",
            label: "Lack of medical equipment and facilities",
          },
          {
            id: "opt-medication",
            label: "Availability and cost of medications",
          },
          {
            id: "opt-maternal",
            label: "Maternal and child health services",
          },
          {
            id: "opt-emergency",
            label: "Emergency and ambulance services",
          },
        ],
      },
      {
        id: "q2",
        type: "multiple",
        question:
          "Which healthcare improvements are most needed in your constituency?",
        description:
          "Select all healthcare initiatives that should be prioritized",
        responseStats: {
          totalResponses: 892,
          topAnswer: {
            label: "Construction of primary healthcare centers",
            percentage: 72,
          },
        },
        options: [
          {
            id: "opt-clinics",
            label: "Construction of primary healthcare centers",
          },
          {
            id: "opt-hospitals",
            label: "Upgrading existing hospitals",
          },
          {
            id: "opt-training",
            label: "Training and retention of healthcare workers",
          },
          {
            id: "opt-equipment-medical",
            label: "Medical equipment and diagnostic facilities",
          },
          {
            id: "opt-awareness",
            label: "Health awareness and preventive care programs",
          },
          {
            id: "opt-maternal-care",
            label: "Maternal and child health programs",
          },
          {
            id: "opt-immunization",
            label: "Immunization and vaccination campaigns",
          },
          {
            id: "opt-mental",
            label: "Mental health services",
          },
        ],
      },
      {
        id: "q3",
        type: "single",
        question:
          "What is the most critical support needed for women in your community?",
        description:
          "Identify the primary area where women need empowerment support",
        responseStats: {
          totalResponses: 892,
          topAnswer: {
            label: "Economic opportunities and job creation",
            percentage: 48,
          },
        },
        options: [
          {
            id: "opt-jobs-women",
            label: "Economic opportunities and job creation",
          },
          {
            id: "opt-education-women",
            label: "Education and skills development",
          },
          {
            id: "opt-healthcare-women",
            label: "Women's healthcare and reproductive services",
          },
          {
            id: "opt-finance-women",
            label: "Access to finance and microcredit",
          },
          {
            id: "opt-childcare",
            label: "Childcare support and family services",
          },
          {
            id: "opt-protection",
            label: "Protection from gender-based violence",
          },
          {
            id: "opt-leadership",
            label: "Leadership and political participation",
          },
        ],
      },
      {
        id: "q4",
        type: "multiple",
        question:
          "Which education initiatives would most benefit your constituency?",
        description: "Select all education priorities that need attention",
        responseStats: {
          totalResponses: 892,
          topAnswer: {
            label: "School infrastructure and facilities",
            percentage: 65,
          },
        },
        options: [
          {
            id: "opt-school-infrastructure",
            label: "School infrastructure and facilities",
          },
          {
            id: "opt-teacher-quality",
            label: "Teacher recruitment and quality",
          },
          {
            id: "opt-learning-materials",
            label: "Learning materials and resources",
          },
          {
            id: "opt-scholarships",
            label: "Scholarships and education support",
          },
          {
            id: "opt-vocational",
            label: "Vocational and technical training",
          },
          {
            id: "opt-adult-education",
            label: "Adult and continuing education",
          },
          {
            id: "opt-early-childhood",
            label: "Early childhood education programs",
          },
        ],
      },
      {
        id: "q5",
        type: "single",
        question: "How would you rate the quality of education in your area?",
        description:
          "Consider access, quality of teaching, facilities, and learning outcomes",
        responseStats: {
          totalResponses: 892,
          topAnswer: {
            label: "Fair - Significant improvements required",
            percentage: 44,
          },
        },
        options: [
          {
            id: "opt-edu-excellent",
            label: "Excellent - High quality education available",
          },
          {
            id: "opt-edu-good",
            label: "Good - Adequate quality with some improvements needed",
          },
          {
            id: "opt-edu-fair",
            label: "Fair - Significant improvements required",
          },
          {
            id: "opt-edu-poor",
            label: "Poor - Quality and access are major concerns",
          },
          {
            id: "opt-edu-very-poor",
            label: "Very Poor - Education system is largely inadequate",
          },
        ],
      },
      {
        id: "q6",
        type: "scale",
        question:
          "How satisfied are you with government social welfare programs?",
        description:
          "Consider programs such as social security, poverty alleviation, disability support, and elderly care",
        minLabel: "Very Dissatisfied",
        maxLabel: "Very Satisfied",
      },
      {
        id: "q7",
        type: "text",
        question:
          "What specific healthcare or social welfare programs would make the greatest difference in your community?",
        description:
          "Please provide detailed recommendations (minimum 20 words, maximum 500 words)",
      },
    ],
    createdAt: "2025-10-15T10:00:00Z",
  },
  {
    id: "survey-apc-1",
    candidateId: "cand-gov-apc-adamawa",
    candidateName: "Dr. Ahmadu Umaru Fintiri",
    title: "Security and Development Priorities for Adamawa State",
    description:
      "As Governor, Dr. Fintiri seeks your input on security, economic development, infrastructure, and governance priorities. Your responses help shape the state's development agenda and policy direction.",
    estimatedMinutes: 6,
    totalResponses: 2134,
    questions: [
      {
        id: "q1",
        type: "single",
        question:
          "What is your most pressing security concern in Adamawa State?",
        description:
          "Identify the security issue that affects you most significantly",
        responseStats: {
          totalResponses: 2134,
          topAnswer: {
            label: "Herder-farmer conflicts",
            percentage: 34,
          },
        },
        options: [
          {
            id: "opt-insecurity",
            label: "General insecurity and violence",
          },
          {
            id: "opt-insurgency",
            label: "Insurgency and terrorist activities",
          },
          {
            id: "opt-community",
            label: "Community and inter-communal conflicts",
          },
          {
            id: "opt-crime",
            label: "Crime and lawlessness",
          },
          {
            id: "opt-herder-farmer",
            label: "Herder-farmer conflicts",
          },
          {
            id: "opt-kidnapping",
            label: "Kidnapping and abduction",
          },
          {
            id: "opt-cattle-rustling",
            label: "Cattle rustling and livestock theft",
          },
        ],
      },
      {
        id: "q2",
        type: "multiple",
        question:
          "Which security measures should be prioritized to improve safety in the state?",
        description:
          "Select all security initiatives that should be implemented",
        responseStats: {
          totalResponses: 2134,
          topAnswer: {
            label: "Enhanced security operations and patrols",
            percentage: 81,
          },
        },
        options: [
          {
            id: "opt-security-ops",
            label: "Enhanced security operations and patrols",
          },
          {
            id: "opt-intelligence",
            label: "Intelligence gathering and information systems",
          },
          {
            id: "opt-border",
            label: "Border security and control",
          },
          {
            id: "opt-community-policing",
            label: "Community policing and neighborhood watch",
          },
          {
            id: "opt-rehabilitation",
            label: "Rehabilitation and reintegration programs",
          },
          {
            id: "opt-technology",
            label: "Security technology and surveillance",
          },
          {
            id: "opt-cooperation",
            label: "Inter-agency and inter-state cooperation",
          },
        ],
      },
      {
        id: "q3",
        type: "single",
        question:
          "How would you rate the current state of infrastructure in Adamawa?",
        description:
          "Consider roads, bridges, electricity, water supply, and telecommunications",
        responseStats: {
          totalResponses: 2134,
          topAnswer: {
            label: "Fair - Significant infrastructure gaps",
            percentage: 39,
          },
        },
        options: [
          {
            id: "opt-infra-excellent",
            label: "Excellent - Well developed infrastructure",
          },
          {
            id: "opt-infra-good",
            label: "Good - Adequate with room for improvement",
          },
          {
            id: "opt-infra-fair",
            label: "Fair - Significant infrastructure gaps",
          },
          {
            id: "opt-infra-poor",
            label: "Poor - Major infrastructure deficiencies",
          },
          {
            id: "opt-infra-very-poor",
            label: "Very Poor - Critical infrastructure crisis",
          },
        ],
      },
      {
        id: "q4",
        type: "multiple",
        question:
          "Which economic development initiatives should be prioritized for Adamawa State?",
        description: "Select all economic priorities that would drive growth",
        responseStats: {
          totalResponses: 2134,
          topAnswer: {
            label: "Infrastructure development and modernization",
            percentage: 76,
          },
        },
        options: [
          {
            id: "opt-infrastructure",
            label: "Infrastructure development and modernization",
          },
          {
            id: "opt-economy",
            label: "Economic diversification and industrial growth",
          },
          {
            id: "opt-agriculture-state",
            label: "Agricultural transformation and value addition",
          },
          {
            id: "opt-investment",
            label: "Investment promotion and business environment",
          },
          {
            id: "opt-employment",
            label: "Job creation and employment opportunities",
          },
          {
            id: "opt-tourism-state",
            label: "Tourism development and promotion",
          },
          {
            id: "opt-mining",
            label: "Solid minerals development",
          },
          {
            id: "opt-power",
            label: "Power generation and distribution",
          },
        ],
      },
      {
        id: "q5",
        type: "single",
        question:
          "How would you assess the performance of public institutions in Adamawa?",
        description: "Consider transparency, efficiency, and service delivery",
        responseStats: {
          totalResponses: 2134,
          topAnswer: {
            label: "Fair - Significant governance challenges",
            percentage: 42,
          },
        },
        options: [
          {
            id: "opt-governance-excellent",
            label: "Excellent - Highly efficient and transparent",
          },
          {
            id: "opt-governance-good",
            label: "Good - Generally effective with improvements needed",
          },
          {
            id: "opt-governance-fair",
            label: "Fair - Significant governance challenges",
          },
          {
            id: "opt-governance-poor",
            label: "Poor - Major inefficiencies and transparency issues",
          },
          {
            id: "opt-governance-very-poor",
            label: "Very Poor - Critical governance problems",
          },
        ],
      },
      {
        id: "q6",
        type: "multiple",
        question:
          "Which areas require immediate government intervention and attention?",
        description: "Select all critical areas needing urgent action",
        responseStats: {
          totalResponses: 2134,
          topAnswer: {
            label: "Security and peace restoration",
            percentage: 85,
          },
        },
        options: [
          {
            id: "opt-security-priority",
            label: "Security and peace restoration",
          },
          {
            id: "opt-infrastructure-priority",
            label: "Infrastructure development",
          },
          {
            id: "opt-healthcare-priority",
            label: "Healthcare service delivery",
          },
          {
            id: "opt-education-priority",
            label: "Education quality and access",
          },
          {
            id: "opt-poverty",
            label: "Poverty alleviation and social welfare",
          },
          {
            id: "opt-youth",
            label: "Youth unemployment and empowerment",
          },
          {
            id: "opt-environment",
            label: "Environmental protection and climate change",
          },
        ],
      },
      {
        id: "q7",
        type: "scale",
        question:
          "How confident are you in the state government's ability to address key challenges?",
        description:
          "Rate your confidence in government effectiveness and responsiveness",
        minLabel: "Not Confident",
        maxLabel: "Very Confident",
      },
      {
        id: "q8",
        type: "text",
        question:
          "What specific policy or program would have the greatest positive impact on Adamawa State?",
        description:
          "Please provide detailed recommendations (minimum 20 words, maximum 500 words)",
      },
    ],
    createdAt: "2025-10-15T10:00:00Z",
  },
  {
    id: "survey-pdp-1",
    candidateId: "cand-gov-pdp-adamawa",
    candidateName: "Senator Aishatu Dahiru Ahmed",
    title: "Education and Human Development Priorities for Adamawa State",
    description:
      "Senator Ahmed focuses on education, healthcare, women's empowerment, and human capital development. Your responses help shape legislative priorities and advocacy efforts for Adamawa State.",
    estimatedMinutes: 6,
    totalResponses: 1568,
    questions: [
      {
        id: "q1",
        type: "single",
        question:
          "What is the most critical challenge facing the education sector in Adamawa?",
        description: "Identify the primary barrier to quality education",
        responseStats: {
          totalResponses: 1568,
          topAnswer: {
            label: "Teacher shortage and quality",
            percentage: 37,
          },
        },
        options: [
          {
            id: "opt-education",
            label: "Insufficient funding and resources",
          },
          {
            id: "opt-teachers",
            label: "Teacher shortage and quality",
          },
          {
            id: "opt-facilities",
            label: "Poor infrastructure and facilities",
          },
          {
            id: "opt-access",
            label: "Limited access to schools in rural areas",
          },
          {
            id: "opt-dropout",
            label: "High dropout rates, especially among girls",
          },
          {
            id: "opt-quality",
            label: "Poor quality and learning outcomes",
          },
          {
            id: "opt-cost",
            label: "Cost of education and affordability",
          },
        ],
      },
      {
        id: "q2",
        type: "multiple",
        question:
          "Which education interventions should be prioritized for maximum impact?",
        description:
          "Select all education initiatives that require urgent attention",
        responseStats: {
          totalResponses: 1568,
          topAnswer: {
            label: "Teacher training, recruitment, and retention",
            percentage: 74,
          },
        },
        options: [
          {
            id: "opt-school-infrastructure-senate",
            label: "School infrastructure development and rehabilitation",
          },
          {
            id: "opt-teacher-development",
            label: "Teacher training, recruitment, and retention",
          },
          {
            id: "opt-girls-education",
            label: "Girls' education and gender equity programs",
          },
          {
            id: "opt-learning-resources",
            label: "Learning materials and educational resources",
          },
          {
            id: "opt-scholarship-programs",
            label: "Scholarship and financial aid programs",
          },
          {
            id: "opt-vocational-training",
            label: "Technical and vocational education",
          },
          {
            id: "opt-early-education",
            label: "Early childhood education and development",
          },
          {
            id: "opt-adult-literacy",
            label: "Adult literacy and continuing education",
          },
        ],
      },
      {
        id: "q3",
        type: "single",
        question:
          "What is the primary barrier to women's participation in economic and political activities?",
        description: "Identify the main constraint to women's empowerment",
        responseStats: {
          totalResponses: 1568,
          topAnswer: {
            label: "Cultural and traditional barriers",
            percentage: 43,
          },
        },
        options: [
          {
            id: "opt-women",
            label: "Limited access to education and skills",
          },
          {
            id: "opt-economic-barrier",
            label: "Lack of economic opportunities",
          },
          {
            id: "opt-cultural",
            label: "Cultural and traditional barriers",
          },
          {
            id: "opt-finance-barrier",
            label: "Limited access to finance and credit",
          },
          {
            id: "opt-discrimination",
            label: "Gender discrimination and bias",
          },
          {
            id: "opt-family",
            label: "Family and domestic responsibilities",
          },
          {
            id: "opt-violence",
            label: "Gender-based violence and insecurity",
          },
        ],
      },
      {
        id: "q4",
        type: "multiple",
        question:
          "Which women's empowerment programs would be most effective in your community?",
        description:
          "Select all programs that would advance women's empowerment",
        responseStats: {
          totalResponses: 1568,
          topAnswer: {
            label: "Skills training and capacity building",
            percentage: 69,
          },
        },
        options: [
          {
            id: "opt-skills-women",
            label: "Skills training and capacity building",
          },
          {
            id: "opt-entrepreneurship",
            label: "Entrepreneurship and business development",
          },
          {
            id: "opt-finance-women",
            label: "Access to finance and microcredit",
          },
          {
            id: "opt-leadership-women",
            label: "Leadership and mentorship programs",
          },
          {
            id: "opt-education-women",
            label: "Education and literacy programs",
          },
          {
            id: "opt-health-women",
            label: "Women's health and reproductive rights",
          },
          {
            id: "opt-political",
            label: "Political participation and representation",
          },
        ],
      },
      {
        id: "q5",
        type: "single",
        question:
          "How would you rate healthcare service delivery in your area?",
        description:
          "Consider availability, quality, accessibility, and affordability",
        responseStats: {
          totalResponses: 1568,
          topAnswer: {
            label: "Fair - Significant improvements required",
            percentage: 41,
          },
        },
        options: [
          {
            id: "opt-health-senate-excellent",
            label: "Excellent - High quality healthcare accessible",
          },
          {
            id: "opt-health-senate-good",
            label: "Good - Adequate with some improvements needed",
          },
          {
            id: "opt-health-senate-fair",
            label: "Fair - Significant improvements required",
          },
          {
            id: "opt-health-senate-poor",
            label: "Poor - Major gaps in healthcare delivery",
          },
          {
            id: "opt-health-senate-very-poor",
            label: "Very Poor - Healthcare crisis situation",
          },
        ],
      },
      {
        id: "q6",
        type: "multiple",
        question:
          "Which healthcare improvements are most critical for your constituency?",
        description:
          "Select all healthcare priorities that need legislative attention",
        responseStats: {
          totalResponses: 1568,
          topAnswer: {
            label: "Improved access to healthcare facilities",
            percentage: 77,
          },
        },
        options: [
          {
            id: "opt-healthcare-access",
            label: "Improved access to healthcare facilities",
          },
          {
            id: "opt-healthcare-quality",
            label: "Quality of care and medical personnel",
          },
          {
            id: "opt-healthcare-equipment",
            label: "Medical equipment and technology",
          },
          {
            id: "opt-primary-care",
            label: "Primary healthcare and preventive services",
          },
          {
            id: "opt-maternal-health",
            label: "Maternal and child health services",
          },
          {
            id: "opt-health-financing",
            label: "Health insurance and financing",
          },
          {
            id: "opt-health-awareness",
            label: "Health education and awareness",
          },
        ],
      },
      {
        id: "q7",
        type: "scale",
        question:
          "How important is education quality improvement as a state priority?",
        description:
          "Rate the importance of education reform for Adamawa's development",
        minLabel: "Not Important",
        maxLabel: "Very Important",
      },
      {
        id: "q8",
        type: "text",
        question:
          "What specific legislation or policy would most advance education and human development in Adamawa State?",
        description:
          "Please provide detailed recommendations for legislative action (minimum 20 words, maximum 500 words)",
      },
    ],
    createdAt: "2025-10-15T10:00:00Z",
  },
  {
    id: "survey-apc-2",
    candidateId: "cand-hr-apc-jada-ganye-mayo-belwa-toungo",
    candidateName: "Hon. Abdulrazak Namdas",
    title:
      "Youth Development and Economic Opportunities for Jada/Ganye/Mayo-Belwa/Toungo",
    description:
      "As a youth advocate, Hon. Namdas seeks your input on youth empowerment, job creation, skills development, infrastructure, and economic opportunities. Your responses inform policy priorities for the constituency.",
    estimatedMinutes: 5,
    totalResponses: 1053,
    questions: [
      {
        id: "q1",
        type: "single",
        question:
          "What is the biggest challenge facing youth in your constituency?",
        description: "Identify the primary barrier to youth development",
        responseStats: {
          totalResponses: 1053,
          topAnswer: {
            label: "Unemployment and lack of job opportunities",
            percentage: 52,
          },
        },
        options: [
          {
            id: "opt-jobs",
            label: "Unemployment and lack of job opportunities",
          },
          {
            id: "opt-training",
            label: "Lack of skills training and capacity building",
          },
          {
            id: "opt-education-youth",
            label: "Limited access to quality education",
          },
          {
            id: "opt-finance-youth",
            label: "Limited access to finance and startup capital",
          },
          {
            id: "opt-infrastructure-youth",
            label: "Poor infrastructure affecting economic activities",
          },
          {
            id: "opt-drug-abuse",
            label: "Drug abuse and social vices",
          },
          {
            id: "opt-migration",
            label: "Rural-urban migration and brain drain",
          },
        ],
      },
      {
        id: "q2",
        type: "multiple",
        question:
          "Which youth empowerment programs would be most effective in your area?",
        description:
          "Select all programs that would meaningfully empower young people",
        responseStats: {
          totalResponses: 1053,
          topAnswer: {
            label: "Skills development and vocational training",
            percentage: 71,
          },
        },
        options: [
          {
            id: "opt-startup",
            label: "Entrepreneurship training and startup support",
          },
          {
            id: "opt-skills-development",
            label: "Skills development and vocational training",
          },
          {
            id: "opt-job-creation",
            label: "Job creation and employment programs",
          },
          {
            id: "opt-youth-finance",
            label: "Youth access to finance and credit",
          },
          {
            id: "opt-mentorship",
            label: "Mentorship and career guidance programs",
          },
          {
            id: "opt-digital",
            label: "Digital skills and technology training",
          },
          {
            id: "opt-agriculture-youth",
            label: "Youth in agriculture and agribusiness",
          },
          {
            id: "opt-leadership-youth",
            label: "Leadership and civic engagement programs",
          },
        ],
      },
      {
        id: "q3",
        type: "single",
        question:
          "How would you rate economic opportunities available to youth in your area?",
        description:
          "Consider job availability, business opportunities, and income potential",
        responseStats: {
          totalResponses: 1053,
          topAnswer: {
            label: "Poor - Very few economic opportunities",
            percentage: 46,
          },
        },
        options: [
          {
            id: "opt-econ-youth-excellent",
            label: "Excellent - Abundant opportunities available",
          },
          {
            id: "opt-econ-youth-good",
            label: "Good - Adequate opportunities with some limitations",
          },
          {
            id: "opt-econ-youth-fair",
            label: "Fair - Limited opportunities available",
          },
          {
            id: "opt-econ-youth-poor",
            label: "Poor - Very few economic opportunities",
          },
          {
            id: "opt-econ-youth-very-poor",
            label: "Very Poor - Critical lack of opportunities",
          },
        ],
      },
      {
        id: "q4",
        type: "multiple",
        question:
          "Which infrastructure developments would most benefit youth and economic activities?",
        description:
          "Select all infrastructure projects that would create opportunities",
        responseStats: {
          totalResponses: 1053,
          topAnswer: {
            label: "Road networks and transportation",
            percentage: 68,
          },
        },
        options: [
          {
            id: "opt-youth-roads",
            label: "Road networks and transportation",
          },
          {
            id: "opt-youth-power",
            label: "Power supply and electricity",
          },
          {
            id: "opt-youth-internet",
            label: "Internet connectivity and telecommunications",
          },
          {
            id: "opt-youth-markets",
            label: "Markets and trading facilities",
          },
          {
            id: "opt-youth-workshops",
            label: "Workshops and industrial facilities",
          },
          {
            id: "opt-youth-water",
            label: "Water supply and sanitation",
          },
          {
            id: "opt-youth-education",
            label: "Educational and training facilities",
          },
        ],
      },
      {
        id: "q5",
        type: "single",
        question:
          "What type of business or economic activity would you like to engage in if you had support?",
        description: "Identify your preferred economic activity",
        responseStats: {
          totalResponses: 1053,
          topAnswer: {
            label: "Agribusiness and agricultural processing",
            percentage: 38,
          },
        },
        options: [
          {
            id: "opt-agribusiness",
            label: "Agribusiness and agricultural processing",
          },
          {
            id: "opt-retail",
            label: "Retail and trading",
          },
          {
            id: "opt-manufacturing",
            label: "Small-scale manufacturing",
          },
          {
            id: "opt-services",
            label: "Service provision",
          },
          {
            id: "opt-tech",
            label: "Technology and digital services",
          },
          {
            id: "opt-skilled-trade",
            label: "Skilled trades and craftsmanship",
          },
          {
            id: "opt-tourism-business",
            label: "Tourism and hospitality",
          },
          {
            id: "opt-transport",
            label: "Transport and logistics",
          },
        ],
      },
      {
        id: "q6",
        type: "scale",
        question:
          "How satisfied are you with current government programs for youth development?",
        description:
          "Rate your satisfaction with existing youth empowerment initiatives",
        minLabel: "Very Dissatisfied",
        maxLabel: "Very Satisfied",
      },
      {
        id: "q7",
        type: "multiple",
        question: "What support do you need most to start or grow a business?",
        description:
          "Select all forms of support critical to your business success",
        responseStats: {
          totalResponses: 1053,
          topAnswer: {
            label: "Startup capital and financing",
            percentage: 83,
          },
        },
        options: [
          {
            id: "opt-capital",
            label: "Startup capital and financing",
          },
          {
            id: "opt-skills-business",
            label: "Business skills and training",
          },
          {
            id: "opt-market-access",
            label: "Market access and linkages",
          },
          {
            id: "opt-technology-business",
            label: "Technology and digital tools",
          },
          {
            id: "opt-regulatory",
            label: "Regulatory support and ease of doing business",
          },
          {
            id: "opt-networking",
            label: "Networking and mentorship",
          },
          {
            id: "opt-infrastructure-business",
            label: "Infrastructure and facilities",
          },
        ],
      },
      {
        id: "q8",
        type: "text",
        question:
          "What specific programs or policies would create the most economic opportunities for youth in Jada/Ganye/Mayo-Belwa/Toungo?",
        description:
          "Please provide detailed recommendations (minimum 20 words, maximum 500 words)",
      },
    ],
    createdAt: "2025-10-15T10:00:00Z",
  },
  // ============================================================================
  // BAUCHI STATE CANDIDATE SURVEYS
  // ============================================================================

  {
    id: "survey-apc-bauchi-1",
    candidateId: "cand-gov-apc-bauchi",
    candidateName: "Senator Bala Abdulkadir Mohammed",
    title:
      "Infrastructure and Economic Development Priorities for Bauchi State",
    description:
      "Senator Mohammed seeks your input on infrastructure modernization, urban development, economic diversification, and unity initiatives for Bauchi State. Your responses help shape strategic development plans and policy priorities.",
    estimatedMinutes: 6,
    totalResponses: 1876,
    questions: [
      {
        id: "q1",
        type: "single",
        question: "What is the most critical infrastructure need in your area?",
        description:
          "Identify the primary infrastructure gap affecting your community",
        responseStats: {
          totalResponses: 1876,
          topAnswer: {
            label: "Road construction and maintenance",
            percentage: 43,
          },
        },
        options: [
          {
            id: "opt-roads-bauchi",
            label: "Road construction and maintenance",
          },
          {
            id: "opt-power-bauchi",
            label: "Electricity supply and distribution",
          },
          {
            id: "opt-water-bauchi",
            label: "Potable water and sanitation",
          },
          {
            id: "opt-drainage-bauchi",
            label: "Drainage and flood control systems",
          },
          {
            id: "opt-housing-bauchi",
            label: "Affordable housing and urban planning",
          },
          {
            id: "opt-markets-bauchi",
            label: "Markets and commercial infrastructure",
          },
          {
            id: "opt-telecom-bauchi",
            label: "Telecommunications and internet connectivity",
          },
        ],
      },
      {
        id: "q2",
        type: "multiple",
        question:
          "Which economic sectors should be prioritized for Bauchi State's development?",
        description: "Select all sectors that would drive economic growth",
        responseStats: {
          totalResponses: 1876,
          topAnswer: {
            label: "Agriculture and agro-processing",
            percentage: 72,
          },
        },
        options: [
          {
            id: "opt-agriculture-bauchi",
            label: "Agriculture and agro-processing",
          },
          {
            id: "opt-mining-bauchi",
            label: "Solid minerals and mining development",
          },
          {
            id: "opt-commerce-bauchi",
            label: "Commerce and trade facilitation",
          },
          {
            id: "opt-manufacturing-bauchi",
            label: "Manufacturing and industrialization",
          },
          {
            id: "opt-tourism-bauchi",
            label: "Tourism and cultural heritage",
          },
          {
            id: "opt-technology-bauchi",
            label: "Technology and innovation",
          },
          {
            id: "opt-services-bauchi",
            label: "Services and professional sectors",
          },
        ],
      },
      {
        id: "q3",
        type: "single",
        question:
          "How would you rate the business environment in Bauchi State?",
        description:
          "Consider ease of doing business, access to finance, and regulatory framework",
        responseStats: {
          totalResponses: 1876,
          topAnswer: {
            label: "Fair - Moderate challenges to business operations",
            percentage: 38,
          },
        },
        options: [
          {
            id: "opt-business-excellent",
            label: "Excellent - Very conducive for business growth",
          },
          {
            id: "opt-business-good",
            label: "Good - Generally favorable with some improvements needed",
          },
          {
            id: "opt-business-fair",
            label: "Fair - Moderate challenges to business operations",
          },
          {
            id: "opt-business-poor",
            label: "Poor - Significant barriers to business",
          },
          {
            id: "opt-business-very-poor",
            label: "Very Poor - Major obstacles to economic activity",
          },
        ],
      },
      {
        id: "q4",
        type: "multiple",
        question:
          "Which urban development initiatives are most needed in your area?",
        description: "Select all urban improvements that are critical",
        responseStats: {
          totalResponses: 1876,
          topAnswer: {
            label: "Waste management and sanitation",
            percentage: 64,
          },
        },
        options: [
          {
            id: "opt-urban-planning",
            label: "Comprehensive urban planning and zoning",
          },
          {
            id: "opt-street-lights",
            label: "Street lighting and public safety infrastructure",
          },
          {
            id: "opt-public-transport",
            label: "Public transportation systems",
          },
          {
            id: "opt-parks",
            label: "Parks, recreation, and green spaces",
          },
          {
            id: "opt-waste-management",
            label: "Waste management and sanitation",
          },
          {
            id: "opt-traffic",
            label: "Traffic management and road safety",
          },
          {
            id: "opt-housing-urban",
            label: "Affordable housing schemes",
          },
        ],
      },
      {
        id: "q5",
        type: "single",
        question:
          "What is the primary challenge to unity and social cohesion in Bauchi?",
        description:
          "Identify barriers to harmonious coexistence across communities",
        responseStats: {
          totalResponses: 1876,
          topAnswer: {
            label: "Competition for resources",
            percentage: 35,
          },
        },
        options: [
          {
            id: "opt-ethnic",
            label: "Ethnic and cultural differences",
          },
          {
            id: "opt-religious",
            label: "Religious tensions",
          },
          {
            id: "opt-political",
            label: "Political polarization",
          },
          {
            id: "opt-resource",
            label: "Competition for resources",
          },
          {
            id: "opt-inequality",
            label: "Economic inequality and marginalization",
          },
          {
            id: "opt-youth-conflict",
            label: "Youth restiveness and conflicts",
          },
          {
            id: "opt-communication",
            label: "Lack of dialogue and communication",
          },
        ],
      },
      {
        id: "q6",
        type: "scale",
        question:
          "How confident are you in Bauchi State's potential for economic growth?",
        description: "Rate your optimism about economic development prospects",
        minLabel: "Not Confident",
        maxLabel: "Very Confident",
      },
      {
        id: "q7",
        type: "text",
        question:
          "What specific infrastructure project would have the greatest impact on Bauchi State's development?",
        description:
          "Please provide detailed suggestions (minimum 20 words, maximum 500 words)",
      },
    ],
    createdAt: "2025-01-20T09:00:00Z",
  },
  {
    id: "survey-pdp-bauchi-1",
    candidateId: "cand-pdp-bauchi-1",
    candidateName: "Hajiya Samira Ado Sanusi",
    title: "Education and Social Welfare Transformation for Bauchi State",
    description:
      "Hajiya Sanusi focuses on quality education, social welfare programs, and inclusive development. Your responses inform policies on education reform, poverty alleviation, and empowerment initiatives for all Bauchi citizens.",
    estimatedMinutes: 5,
    totalResponses: 1542,
    questions: [
      {
        id: "q1",
        type: "single",
        question:
          "What is the biggest barrier to quality education in your area?",
        description:
          "Identify the primary challenge affecting educational outcomes",
        responseStats: {
          totalResponses: 1542,
          topAnswer: {
            label: "Teacher quality and training",
            percentage: 39,
          },
        },
        options: [
          {
            id: "opt-edu-access",
            label: "Distance and access to schools",
          },
          {
            id: "opt-edu-cost",
            label: "Cost of education and learning materials",
          },
          {
            id: "opt-edu-quality",
            label: "Teacher quality and training",
          },
          {
            id: "opt-edu-facilities",
            label: "School infrastructure and facilities",
          },
          {
            id: "opt-edu-girls",
            label: "Cultural barriers to girls' education",
          },
          {
            id: "opt-edu-poverty",
            label: "Poverty and child labor",
          },
          {
            id: "opt-edu-resources",
            label: "Lack of learning resources and technology",
          },
        ],
      },
      {
        id: "q2",
        type: "multiple",
        question: "Which education reforms would most benefit Bauchi State?",
        description: "Select all education improvements that are critical",
        responseStats: {
          totalResponses: 1542,
          topAnswer: {
            label: "Teacher recruitment, training, and motivation",
            percentage: 78,
          },
        },
        options: [
          {
            id: "opt-teacher-reform",
            label: "Teacher recruitment, training, and motivation",
          },
          {
            id: "opt-school-facilities",
            label: "School construction and renovation",
          },
          {
            id: "opt-curriculum",
            label: "Curriculum modernization and relevance",
          },
          {
            id: "opt-girls-education",
            label: "Girls' education and gender equity",
          },
          {
            id: "opt-scholarship",
            label: "Scholarship and bursary programs",
          },
          {
            id: "opt-vocational-ed",
            label: "Vocational and technical education",
          },
          {
            id: "opt-adult-literacy",
            label: "Adult literacy and continuing education",
          },
          {
            id: "opt-special-needs",
            label: "Special needs and inclusive education",
          },
        ],
      },
      {
        id: "q3",
        type: "single",
        question:
          "What type of social welfare program is most needed in your community?",
        description:
          "Identify the most critical support program for vulnerable populations",
        responseStats: {
          totalResponses: 1542,
          topAnswer: {
            label: "Cash transfers and poverty relief",
            percentage: 44,
          },
        },
        options: [
          {
            id: "opt-poverty-relief",
            label: "Cash transfers and poverty relief",
          },
          {
            id: "opt-food-security",
            label: "Food security and nutrition programs",
          },
          {
            id: "opt-healthcare-social",
            label: "Healthcare subsidies and insurance",
          },
          {
            id: "opt-elderly-care",
            label: "Elderly care and pension support",
          },
          {
            id: "opt-disability",
            label: "Disability support and accessibility",
          },
          {
            id: "opt-orphan-care",
            label: "Orphan and vulnerable children programs",
          },
          {
            id: "opt-widow-support",
            label: "Widow and single parent support",
          },
        ],
      },
      {
        id: "q4",
        type: "multiple",
        question:
          "Which inclusivity initiatives would promote equal opportunities in Bauchi?",
        description: "Select all programs that would advance social inclusion",
        responseStats: {
          totalResponses: 1542,
          topAnswer: {
            label: "Women's economic empowerment programs",
            percentage: 67,
          },
        },
        options: [
          {
            id: "opt-women-empower",
            label: "Women's economic empowerment programs",
          },
          {
            id: "opt-youth-inclusion",
            label: "Youth engagement and participation",
          },
          {
            id: "opt-minority-rights",
            label: "Minority rights and representation",
          },
          {
            id: "opt-disability-inclusion",
            label: "Disability inclusion and accessibility",
          },
          {
            id: "opt-rural-inclusion",
            label: "Rural-urban equity and development",
          },
          {
            id: "opt-education-access",
            label: "Universal education access",
          },
          {
            id: "opt-healthcare-access",
            label: "Universal healthcare coverage",
          },
        ],
      },
      {
        id: "q5",
        type: "scale",
        question:
          "How would you rate the effectiveness of current social welfare programs?",
        description:
          "Consider reach, impact, and accessibility of existing programs",
        minLabel: "Very Ineffective",
        maxLabel: "Very Effective",
      },
      {
        id: "q6",
        type: "text",
        question:
          "What education or social welfare program would make the biggest difference in your community?",
        description:
          "Please provide detailed recommendations (minimum 20 words, maximum 500 words)",
      },
    ],
    createdAt: "2025-01-20T09:00:00Z",
  },
  {
    id: "survey-apc-bauchi-2",
    candidateId: "cand-sen-apc-bauchi-central",
    candidateName: "Senator Halliru Dauda Jika",
    title: "Economic Empowerment and Job Creation for Bauchi Central",
    description:
      "Senator Jika focuses on business development, job creation, and economic prosperity for Bauchi Central. Your input helps shape policies on entrepreneurship, employment, and economic growth initiatives.",
    estimatedMinutes: 4,
    totalResponses: 1123,
    questions: [
      {
        id: "q1",
        type: "single",
        question:
          "What is the primary economic challenge in your constituency?",
        description: "Identify the main barrier to economic prosperity",
        responseStats: {
          totalResponses: 1123,
          topAnswer: {
            label: "Unemployment and job scarcity",
            percentage: 48,
          },
        },
        options: [
          {
            id: "opt-jobs-shortage",
            label: "Unemployment and job scarcity",
          },
          {
            id: "opt-capital",
            label: "Lack of startup capital and financing",
          },
          {
            id: "opt-skills-gap",
            label: "Skills gap and inadequate training",
          },
          {
            id: "opt-market-access",
            label: "Limited market access for products",
          },
          {
            id: "opt-infrastructure-econ",
            label: "Poor infrastructure affecting business",
          },
          {
            id: "opt-regulation",
            label: "Regulatory challenges and bureaucracy",
          },
          {
            id: "opt-technology-access",
            label: "Lack of technology and innovation",
          },
        ],
      },
      {
        id: "q2",
        type: "multiple",
        question:
          "Which job creation initiatives would be most effective in Bauchi Central?",
        description: "Select all programs that would generate employment",
        responseStats: {
          totalResponses: 1123,
          topAnswer: {
            label: "SME development and support programs",
            percentage: 73,
          },
        },
        options: [
          {
            id: "opt-sme-support",
            label: "SME development and support programs",
          },
          {
            id: "opt-industrial-zones",
            label: "Industrial parks and manufacturing zones",
          },
          {
            id: "opt-agro-processing",
            label: "Agro-processing and value addition",
          },
          {
            id: "opt-skills-training",
            label: "Skills training and apprenticeship programs",
          },
          {
            id: "opt-entrepreneurship",
            label: "Entrepreneurship development and incubation",
          },
          {
            id: "opt-youth-employment",
            label: "Youth employment and internship schemes",
          },
          {
            id: "opt-public-works",
            label: "Public works and labor-intensive projects",
          },
        ],
      },
      {
        id: "q3",
        type: "single",
        question:
          "If you had access to finance, what business would you start or expand?",
        description: "Identify your preferred business or economic activity",
        responseStats: {
          totalResponses: 1123,
          topAnswer: {
            label: "Agriculture and farming",
            percentage: 34,
          },
        },
        options: [
          {
            id: "opt-agriculture-business",
            label: "Agriculture and farming",
          },
          {
            id: "opt-processing-business",
            label: "Food processing and manufacturing",
          },
          {
            id: "opt-retail-business",
            label: "Retail and trading",
          },
          {
            id: "opt-services-business",
            label: "Professional services",
          },
          {
            id: "opt-transport-business",
            label: "Transport and logistics",
          },
          {
            id: "opt-hospitality",
            label: "Hospitality and catering",
          },
          {
            id: "opt-construction",
            label: "Construction and real estate",
          },
          {
            id: "opt-tech-business",
            label: "Technology and digital services",
          },
        ],
      },
      {
        id: "q4",
        type: "multiple",
        question:
          "What support do you need most to grow your business or livelihood?",
        description: "Select all resources that would help you succeed",
        responseStats: {
          totalResponses: 1123,
          topAnswer: {
            label: "Access to finance and loans",
            percentage: 81,
          },
        },
        options: [
          {
            id: "opt-finance-support",
            label: "Access to finance and loans",
          },
          {
            id: "opt-training-support",
            label: "Business and technical training",
          },
          {
            id: "opt-market-linkages",
            label: "Market linkages and connections",
          },
          {
            id: "opt-infrastructure-support",
            label: "Infrastructure and facilities",
          },
          {
            id: "opt-mentorship-support",
            label: "Mentorship and advisory services",
          },
          {
            id: "opt-technology-support",
            label: "Technology and digital tools",
          },
          {
            id: "opt-regulatory-support",
            label: "Regulatory support and business registration",
          },
        ],
      },
      {
        id: "q5",
        type: "scale",
        question:
          "How optimistic are you about business opportunities in Bauchi Central?",
        description: "Rate your confidence in economic prospects",
        minLabel: "Not Optimistic",
        maxLabel: "Very Optimistic",
      },
      {
        id: "q6",
        type: "text",
        question:
          "What specific economic policy or program would create the most jobs in Bauchi Central?",
        description:
          "Please provide detailed recommendations (minimum 20 words, maximum 500 words)",
      },
    ],
    createdAt: "2025-01-20T09:00:00Z",
  },
  {
    id: "survey-pdp-bauchi-2",
    candidateId: "cand-sen-pdp-bauchi-south",
    candidateName: "Dr. Fatima Binta Bello",
    title: "Healthcare Access and Rural Development for Bauchi South",
    description:
      "Dr. Bello is committed to ensuring universal healthcare access and rural development. Your responses help prioritize healthcare improvements, maternal health programs, and rural community development initiatives.",
    estimatedMinutes: 5,
    totalResponses: 956,
    questions: [
      {
        id: "q1",
        type: "single",
        question: "What is the biggest healthcare challenge in your community?",
        description:
          "Identify the most critical barrier to accessing healthcare",
        responseStats: {
          totalResponses: 956,
          topAnswer: {
            label: "Distance to healthcare facilities",
            percentage: 42,
          },
        },
        options: [
          {
            id: "opt-distance-health",
            label: "Distance to healthcare facilities",
          },
          {
            id: "opt-cost-health",
            label: "Cost and affordability of treatment",
          },
          {
            id: "opt-quality-health",
            label: "Quality of care and trained personnel",
          },
          {
            id: "opt-drugs",
            label: "Availability and cost of medications",
          },
          {
            id: "opt-equipment-health",
            label: "Medical equipment and diagnostic services",
          },
          {
            id: "opt-maternal-health",
            label: "Maternal and child health services",
          },
          {
            id: "opt-emergency-health",
            label: "Emergency care and ambulance services",
          },
        ],
      },
      {
        id: "q2",
        type: "multiple",
        question:
          "Which healthcare improvements are most urgently needed in Bauchi South?",
        description: "Select all healthcare priorities for your constituency",
        responseStats: {
          totalResponses: 956,
          topAnswer: {
            label: "Primary healthcare center construction",
            percentage: 76,
          },
        },
        options: [
          {
            id: "opt-primary-healthcare",
            label: "Primary healthcare center construction",
          },
          {
            id: "opt-hospital-upgrade",
            label: "Hospital upgrades and equipment",
          },
          {
            id: "opt-health-workers",
            label: "Recruitment and training of health workers",
          },
          {
            id: "opt-maternal-care",
            label: "Maternal and child health programs",
          },
          {
            id: "opt-preventive-care",
            label: "Preventive care and health education",
          },
          {
            id: "opt-disease-control",
            label: "Disease prevention and control programs",
          },
          {
            id: "opt-health-insurance",
            label: "Health insurance and financing schemes",
          },
          {
            id: "opt-mental-health",
            label: "Mental health services",
          },
        ],
      },
      {
        id: "q3",
        type: "single",
        question:
          "How would you rate maternal healthcare services in your area?",
        description:
          "Consider availability of skilled birth attendants, facilities, and care quality",
        responseStats: {
          totalResponses: 956,
          topAnswer: {
            label: "Poor - Significant service gaps",
            percentage: 38,
          },
        },
        options: [
          {
            id: "opt-maternal-excellent",
            label: "Excellent - Comprehensive maternal care available",
          },
          {
            id: "opt-maternal-good",
            label: "Good - Adequate services with some gaps",
          },
          {
            id: "opt-maternal-fair",
            label: "Fair - Limited services available",
          },
          {
            id: "opt-maternal-poor",
            label: "Poor - Significant service gaps",
          },
          {
            id: "opt-maternal-very-poor",
            label: "Very Poor - Maternal care largely unavailable",
          },
        ],
      },
      {
        id: "q4",
        type: "multiple",
        question:
          "Which rural development initiatives would most benefit your community?",
        description: "Select all rural improvements that are priorities",
        responseStats: {
          totalResponses: 956,
          topAnswer: {
            label: "Rural road construction and maintenance",
            percentage: 69,
          },
        },
        options: [
          {
            id: "opt-rural-roads",
            label: "Rural road construction and maintenance",
          },
          {
            id: "opt-rural-electricity",
            label: "Rural electrification",
          },
          {
            id: "opt-rural-water",
            label: "Potable water supply",
          },
          {
            id: "opt-rural-healthcare",
            label: "Healthcare facilities and services",
          },
          {
            id: "opt-rural-education",
            label: "Schools and educational facilities",
          },
          {
            id: "opt-rural-markets",
            label: "Market access and storage facilities",
          },
          {
            id: "opt-rural-agriculture",
            label: "Agricultural extension and support",
          },
          {
            id: "opt-rural-connectivity",
            label: "Telecommunications and internet access",
          },
        ],
      },
      {
        id: "q5",
        type: "scale",
        question:
          "How satisfied are you with the availability of healthcare services in rural areas?",
        description: "Rate the accessibility and quality of rural healthcare",
        minLabel: "Very Dissatisfied",
        maxLabel: "Very Satisfied",
      },
      {
        id: "q6",
        type: "text",
        question:
          "What healthcare or rural development initiative would have the greatest impact in Bauchi South?",
        description:
          "Please provide detailed recommendations (minimum 20 words, maximum 500 words)",
      },
    ],
    createdAt: "2025-01-20T09:00:00Z",
  },
  {
    id: "survey-apc-bauchi-3",
    candidateId: "cand-hr-apc-bauchi-federal",
    candidateName: "Hon. Yakubu Shehu Abdullahi",
    title:
      "Rural Electrification and Community Development for Bauchi Federal Constituency",
    description:
      "Hon. Abdullahi is committed to bringing electricity and modern amenities to every community. Your responses help prioritize power projects, infrastructure development, and community improvement initiatives.",
    estimatedMinutes: 4,
    totalResponses: 832,
    questions: [
      {
        id: "q1",
        type: "single",
        question:
          "What is the current state of electricity supply in your community?",
        description: "Assess the availability and reliability of power",
        responseStats: {
          totalResponses: 832,
          topAnswer: {
            label: "Poor - Minimal electricity available",
            percentage: 41,
          },
        },
        options: [
          {
            id: "opt-power-excellent",
            label: "Excellent - 24/7 reliable power supply",
          },
          {
            id: "opt-power-good",
            label: "Good - Regular supply with occasional interruptions",
          },
          {
            id: "opt-power-fair",
            label: "Fair - Irregular and unreliable supply",
          },
          {
            id: "opt-power-poor",
            label: "Poor - Minimal electricity available",
          },
          {
            id: "opt-power-none",
            label: "None - No electricity supply at all",
          },
        ],
      },
      {
        id: "q2",
        type: "multiple",
        question:
          "Which electrification projects should be prioritized in your area?",
        description: "Select all power infrastructure needs",
        responseStats: {
          totalResponses: 832,
          topAnswer: {
            label: "National grid extension to unconnected areas",
            percentage: 74,
          },
        },
        options: [
          {
            id: "opt-grid-extension",
            label: "National grid extension to unconnected areas",
          },
          {
            id: "opt-transformer",
            label: "Transformer installation and upgrades",
          },
          {
            id: "opt-distribution",
            label: "Distribution network expansion and repair",
          },
          {
            id: "opt-solar",
            label: "Solar power and renewable energy",
          },
          {
            id: "opt-mini-grid",
            label: "Mini-grid and off-grid solutions",
          },
          {
            id: "opt-street-lighting",
            label: "Street lighting and public illumination",
          },
          {
            id: "opt-metering",
            label: "Metering and billing system improvement",
          },
        ],
      },
      {
        id: "q3",
        type: "single",
        question:
          "How has lack of electricity affected economic activities in your community?",
        description: "Identify the primary economic impact of power shortage",
        responseStats: {
          totalResponses: 832,
          topAnswer: {
            label: "Limits business operations and productivity",
            percentage: 46,
          },
        },
        options: [
          {
            id: "opt-business-impact",
            label: "Limits business operations and productivity",
          },
          {
            id: "opt-agriculture-impact",
            label: "Prevents agricultural processing and storage",
          },
          {
            id: "opt-education-impact",
            label: "Affects quality of education and study",
          },
          {
            id: "opt-healthcare-impact",
            label: "Compromises healthcare delivery",
          },
          {
            id: "opt-cost-impact",
            label: "Increases cost of living (generators, fuel)",
          },
          {
            id: "opt-water-impact",
            label: "Affects water supply and sanitation",
          },
          {
            id: "opt-security-impact",
            label: "Contributes to insecurity and safety concerns",
          },
        ],
      },
      {
        id: "q4",
        type: "multiple",
        question:
          "Which community development projects are most needed in your area?",
        description: "Select all infrastructure and amenity priorities",
        responseStats: {
          totalResponses: 832,
          topAnswer: {
            label: "Electricity and power supply",
            percentage: 89,
          },
        },
        options: [
          {
            id: "opt-electricity-dev",
            label: "Electricity and power supply",
          },
          {
            id: "opt-water-dev",
            label: "Potable water and boreholes",
          },
          {
            id: "opt-roads-dev",
            label: "Road construction and maintenance",
          },
          {
            id: "opt-health-dev",
            label: "Healthcare facilities",
          },
          {
            id: "opt-education-dev",
            label: "School buildings and facilities",
          },
          {
            id: "opt-market-dev",
            label: "Market stalls and trading infrastructure",
          },
          {
            id: "opt-recreation-dev",
            label: "Recreation and community centers",
          },
          {
            id: "opt-communication-dev",
            label: "Telecommunications and connectivity",
          },
        ],
      },
      {
        id: "q5",
        type: "scale",
        question:
          "How important is rural electrification for your community's development?",
        description: "Rate the priority of bringing electricity to your area",
        minLabel: "Not Important",
        maxLabel: "Extremely Important",
      },
      {
        id: "q6",
        type: "text",
        question:
          "What specific power or infrastructure project would transform your community?",
        description:
          "Please provide detailed recommendations (minimum 20 words, maximum 500 words)",
      },
    ],
    createdAt: "2025-01-20T09:00:00Z",
  },
  {
    id: "survey-pdp-bauchi-3",
    candidateId: "cand-hr-pdp-ningi-warji",
    candidateName: "Hon. Abubakar Sadiq Ningi",
    title: "Agricultural Development and Food Security for Ningi/Warji",
    description:
      "Hon. Ningi is dedicated to empowering farmers and ensuring food security. Your responses help shape agricultural policies, farming support programs, and rural economic development initiatives for Ningi/Warji constituency.",
    estimatedMinutes: 5,
    totalResponses: 743,
    questions: [
      {
        id: "q1",
        type: "single",
        question:
          "What is the biggest challenge facing farmers in your community?",
        description:
          "Identify the primary barrier to agricultural productivity",
        responseStats: {
          totalResponses: 743,
          topAnswer: {
            label: "High cost and scarcity of farm inputs",
            percentage: 44,
          },
        },
        options: [
          {
            id: "opt-inputs",
            label: "High cost and scarcity of farm inputs",
          },
          {
            id: "opt-finance-farm",
            label: "Lack of financing and credit facilities",
          },
          {
            id: "opt-irrigation",
            label: "Limited irrigation and water for farming",
          },
          {
            id: "opt-storage",
            label: "Lack of storage and processing facilities",
          },
          {
            id: "opt-market-farm",
            label: "Poor market access and low prices",
          },
          {
            id: "opt-extension",
            label: "Inadequate extension services and training",
          },
          {
            id: "opt-land",
            label: "Land access and tenure issues",
          },
          {
            id: "opt-climate",
            label: "Climate change and environmental challenges",
          },
        ],
      },
      {
        id: "q2",
        type: "multiple",
        question:
          "Which agricultural support programs would most benefit farmers in Ningi/Warji?",
        description: "Select all farm support initiatives that are critical",
        responseStats: {
          totalResponses: 743,
          topAnswer: {
            label: "Fertilizer and seed subsidies",
            percentage: 79,
          },
        },
        options: [
          {
            id: "opt-input-subsidy",
            label: "Fertilizer and seed subsidies",
          },
          {
            id: "opt-farm-credit",
            label: "Agricultural loans and credit schemes",
          },
          {
            id: "opt-irrigation-dev",
            label: "Irrigation infrastructure development",
          },
          {
            id: "opt-mechanization",
            label: "Farm mechanization and equipment",
          },
          {
            id: "opt-extension-services",
            label: "Extension services and farmer training",
          },
          {
            id: "opt-storage-facilities",
            label: "Storage and warehousing facilities",
          },
          {
            id: "opt-processing-support",
            label: "Processing and value addition support",
          },
          {
            id: "opt-market-linkages",
            label: "Market linkages and price support",
          },
        ],
      },
      {
        id: "q3",
        type: "single",
        question: "What is your primary farming or economic activity?",
        description: "Identify your main source of livelihood",
        responseStats: {
          totalResponses: 743,
          topAnswer: {
            label: "Crop farming (grains, vegetables, etc.)",
            percentage: 52,
          },
        },
        options: [
          {
            id: "opt-crop-farming",
            label: "Crop farming (grains, vegetables, etc.)",
          },
          {
            id: "opt-livestock-farming",
            label: "Livestock rearing (cattle, goats, poultry)",
          },
          {
            id: "opt-mixed-farming",
            label: "Mixed farming (crops and livestock)",
          },
          {
            id: "opt-fish-farming",
            label: "Fish farming and aquaculture",
          },
          {
            id: "opt-trading-farm",
            label: "Agricultural trading and marketing",
          },
          {
            id: "opt-processing-farm",
            label: "Agricultural processing",
          },
          {
            id: "opt-non-farm",
            label: "Non-farm economic activity",
          },
        ],
      },
      {
        id: "q4",
        type: "multiple",
        question:
          "Which food security initiatives would address hunger and nutrition in your area?",
        description: "Select all food security programs that are needed",
        responseStats: {
          totalResponses: 743,
          topAnswer: {
            label: "Increased food production and productivity",
            percentage: 71,
          },
        },
        options: [
          {
            id: "opt-production",
            label: "Increased food production and productivity",
          },
          {
            id: "opt-nutrition",
            label: "Nutrition education and awareness",
          },
          {
            id: "opt-school-feeding",
            label: "School feeding programs",
          },
          {
            id: "opt-food-subsidy",
            label: "Food subsidies for vulnerable populations",
          },
          {
            id: "opt-food-reserves",
            label: "Strategic food reserves and emergency stocks",
          },
          {
            id: "opt-home-gardens",
            label: "Home and community gardens",
          },
          {
            id: "opt-livestock-support",
            label: "Livestock development for protein security",
          },
        ],
      },
      {
        id: "q5",
        type: "scale",
        question:
          "How confident are you about achieving food security in Ningi/Warji?",
        description: "Rate your optimism about ensuring adequate food for all",
        minLabel: "Not Confident",
        maxLabel: "Very Confident",
      },
      {
        id: "q6",
        type: "text",
        question:
          "What specific agricultural program or policy would most empower farmers and ensure food security in Ningi/Warji?",
        description:
          "Please provide detailed recommendations (minimum 20 words, maximum 500 words)",
      },
    ],
    createdAt: "2025-01-20T09:00:00Z",
  },

  // ============================================================================
  // EDGE CASE TEST SURVEY
  // ============================================================================

  // EDGE CASE TEST SURVEY - Tests all question types and features
  // NOTE: This replaces the original survey-pdp-2 with comprehensive test coverage
  {
    id: "survey-pdp-2",
    candidateId: "cand-sen-pdp-adamawa-central", // Dr. Maryam Inna Ciroma (Senator)
    candidateName: "Dr. Maryam Inna Ciroma",
    title: "Comprehensive Survey Test - All Question Types",
    description:
      "This survey tests all question types including single choice, multiple choice, ranking, scale, and text responses. It also demonstrates the 'Other' option functionality.",
    estimatedMinutes: 8,
    totalResponses: 350,
    questions: [
      {
        id: "test-q1-single-with-other",
        type: "single",
        question: "What is your primary mode of transportation?",
        description:
          "Select one option. Choose 'Other' to specify alternatives",
        responseStats: {
          totalResponses: 350,
          topAnswer: {
            label: "Motorcycle",
            percentage: 45,
          },
        },
        options: [
          {
            id: "opt-car",
            label: "Private car",
          },
          {
            id: "opt-motorcycle",
            label: "Motorcycle (Okada)",
          },
          {
            id: "opt-bus",
            label: "Public bus/transport",
          },
          {
            id: "opt-tricycle",
            label: "Tricycle (Keke NAPEP)",
          },
          {
            id: "opt-bicycle",
            label: "Bicycle",
          },
          {
            id: "opt-walk",
            label: "Walking",
          },
          {
            id: "opt-other-transport",
            label: "Other (please specify)",
            allowOther: true,
          },
        ],
      },
      {
        id: "test-q2-multiple-with-other",
        type: "multiple",
        question:
          "Which social services are most needed in your community? (Select all that apply)",
        description:
          "Choose all that are priorities. Use 'Other' to add services not listed",
        responseStats: {
          totalResponses: 350,
          topAnswer: {
            label: "Healthcare facilities and clinics",
            percentage: 78,
          },
        },
        options: [
          {
            id: "opt-healthcare",
            label: "Healthcare facilities and clinics",
          },
          {
            id: "opt-schools",
            label: "Schools and educational facilities",
          },
          {
            id: "opt-recreation",
            label: "Recreation centers and sports facilities",
          },
          {
            id: "opt-markets",
            label: "Markets and commercial centers",
          },
          {
            id: "opt-religious",
            label: "Religious worship centers",
          },
          {
            id: "opt-other-services",
            label: "Other services (please specify)",
            allowOther: true,
          },
        ],
      },
      {
        id: "test-q3-ranking",
        type: "ranking",
        question: "Rank these policy priorities in order of importance to you",
        description: "Drag to reorder: 1 = Most Important, 5 = Least Important",
        options: [
          {
            id: "opt-security",
            label: "Security and law enforcement",
          },
          {
            id: "opt-economy",
            label: "Economic development and job creation",
          },
          {
            id: "opt-education",
            label: "Education reform and school infrastructure",
          },
          {
            id: "opt-health",
            label: "Healthcare access and medical facilities",
          },
          {
            id: "opt-infrastructure",
            label: "Roads, electricity, and water supply",
          },
        ],
      },
      {
        id: "test-q4-scale-satisfaction",
        type: "scale",
        question:
          "How would you rate the current state of security in your area?",
        description: "Rate from 1 (Very Poor) to 5 (Excellent)",
        minLabel: "Very Poor",
        maxLabel: "Excellent",
      },
      {
        id: "test-q5-text-short",
        type: "text",
        question:
          "What is the single most important issue facing your community?",
        description:
          "Please be specific and concise (10-100 words recommended)",
      },
      {
        id: "test-q6-single-no-other",
        type: "single",
        question: "Have you voted in previous elections?",
        description: "Standard single choice without 'Other' option",
        responseStats: {
          totalResponses: 350,
          topAnswer: {
            label: "Yes, in some elections",
            percentage: 42,
          },
        },
        options: [
          {
            id: "opt-yes-all",
            label: "Yes, in all elections",
          },
          {
            id: "opt-yes-some",
            label: "Yes, in some elections",
          },
          {
            id: "opt-no",
            label: "No, this will be my first time",
          },
          {
            id: "opt-first-eligible",
            label: "This is my first time being eligible",
          },
        ],
      },
      {
        id: "test-q7-multiple-no-other",
        type: "multiple",
        question:
          "Which communication channels do you use to follow political news?",
        description:
          "Select all that apply. No 'Other' option to test standard multi-choice",
        responseStats: {
          totalResponses: 350,
          topAnswer: {
            label: "Radio",
            percentage: 68,
          },
        },
        options: [
          {
            id: "opt-tv",
            label: "Television",
          },
          {
            id: "opt-radio",
            label: "Radio",
          },
          {
            id: "opt-newspapers",
            label: "Newspapers",
          },
          {
            id: "opt-social-media",
            label: "Social media (Facebook, Twitter, etc.)",
          },
          {
            id: "opt-whatsapp",
            label: "WhatsApp groups",
          },
          {
            id: "opt-community",
            label: "Community meetings and town halls",
          },
        ],
      },
      {
        id: "test-q8-text-long",
        type: "text",
        question:
          "Please share any additional feedback, suggestions, or concerns you have about this survey or our campaign",
        description:
          "Your detailed feedback helps us improve. Optional but encouraged (maximum 500 characters)",
      },
    ],
    createdAt: "2025-01-15T08:00:00Z",
  },
];

// Survey Helper Functions - These are kept here as they're tightly coupled to survey data structure

// Get survey by candidate ID - Used by mockApi functions to ensure consistent data access
export function getSurveyByCandidateId(
  candidateId: string,
): CandidateSurvey | undefined {
  return candidateSurveys.find((survey) => survey.candidateId === candidateId);
}

// Get survey by survey ID - Useful for direct survey lookups
export function getSurveyById(id: string): CandidateSurvey | undefined {
  return candidateSurveys.find((survey) => survey.id === id);
}

// Get all surveys - Useful for dashboard aggregations and analytics
export function getAllSurveys(): CandidateSurvey[] {
  return candidateSurveys;
}

// Check if candidate has a survey
export function candidateHasSurvey(candidateId: string): boolean {
  return candidateSurveys.some((survey) => survey.candidateId === candidateId);
}

// Get survey status for a candidate
export function getSurveyStatus(candidateId: string): SurveyStatus | "none" {
  const survey = getSurveyByCandidateId(candidateId);
  if (!survey) return "none";
  return survey.status || "published";
}
