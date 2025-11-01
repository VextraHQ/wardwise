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

import type { CandidateSurvey } from "@/types";

export const candidateSurveys: CandidateSurvey[] = [
  {
    id: "survey-apc-4",
    candidateId: "cand-apc-4",
    candidateName: "Hon. Aliyu Wakili Boya",
    title:
      "Community Development Priorities for Fufore/Song Federal Constituency",
    description:
      "Your responses will help shape policy priorities and infrastructure investments in our constituency. This survey covers infrastructure, economic development, education, healthcare, and security.",
    questions: [
      {
        id: "q1",
        type: "single",
        question:
          "How would you rate the overall condition of road infrastructure in your area?",
        description:
          "Please assess the current state of roads including federal, state, and local roads",
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
        ],
      },
      {
        id: "q2",
        type: "multiple",
        question:
          "Which infrastructure projects should be prioritized in the next legislative term?",
        description:
          "Select all that are critical to your community's development",
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
    createdAt: "2024-10-15T10:00:00Z",
  },
  {
    id: "survey-pdp-2",
    candidateId: "cand-pdp-2",
    candidateName: "Dr. Maryam Inna Ciroma",
    title: "Healthcare and Social Welfare Priorities for Adamawa Central",
    description:
      "As a healthcare professional, Dr. Ciroma seeks to understand your priorities for healthcare, education, women's empowerment, and social welfare programs. Your input directly informs policy development.",
    questions: [
      {
        id: "q1",
        type: "single",
        question:
          "What is your primary concern regarding healthcare access in your area?",
        description:
          "Identify the most critical barrier to healthcare in your community",
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
    createdAt: "2024-10-15T10:00:00Z",
  },
  {
    id: "survey-apc-1",
    candidateId: "cand-apc-1",
    candidateName: "Dr. Ahmadu Umaru Fintiri",
    title: "Security and Development Priorities for Adamawa State",
    description:
      "As Governor, Dr. Fintiri seeks your input on security, economic development, infrastructure, and governance priorities. Your responses help shape the state's development agenda and policy direction.",
    questions: [
      {
        id: "q1",
        type: "single",
        question:
          "What is your most pressing security concern in Adamawa State?",
        description:
          "Identify the security issue that affects you most significantly",
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
    createdAt: "2024-10-15T10:00:00Z",
  },
  {
    id: "survey-pdp-1",
    candidateId: "cand-pdp-1",
    candidateName: "Senator Aishatu Dahiru Ahmed",
    title: "Education and Human Development Priorities for Adamawa State",
    description:
      "Senator Ahmed focuses on education, healthcare, women's empowerment, and human capital development. Your responses help shape legislative priorities and advocacy efforts for Adamawa State.",
    questions: [
      {
        id: "q1",
        type: "single",
        question:
          "What is the most critical challenge facing the education sector in Adamawa?",
        description: "Identify the primary barrier to quality education",
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
    createdAt: "2024-10-15T10:00:00Z",
  },
  {
    id: "survey-apc-2",
    candidateId: "cand-apc-2",
    candidateName: "Hon. Abdulrazak Namdas",
    title:
      "Youth Development and Economic Opportunities for Ganye/Toungo/Mayo Belwa",
    description:
      "As a youth advocate, Hon. Namdas seeks your input on youth empowerment, job creation, skills development, infrastructure, and economic opportunities. Your responses inform policy priorities for the constituency.",
    questions: [
      {
        id: "q1",
        type: "single",
        question:
          "What is the biggest challenge facing youth in your constituency?",
        description: "Identify the primary barrier to youth development",
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
          "What specific programs or policies would create the most economic opportunities for youth in Ganye/Toungo/Mayo Belwa?",
        description:
          "Please provide detailed recommendations (minimum 20 words, maximum 500 words)",
      },
    ],
    createdAt: "2024-10-15T10:00:00Z",
  },
];

/**
 * Helper function to get survey by candidate ID
 * Used by mockApi functions to ensure consistent data access
 */
export function getSurveyByCandidateId(
  candidateId: string,
): CandidateSurvey | undefined {
  return candidateSurveys.find((survey) => survey.candidateId === candidateId);
}

/**
 * Helper function to get survey by survey ID
 * Useful for direct survey lookups
 */
export function getSurveyById(id: string): CandidateSurvey | undefined {
  return candidateSurveys.find((survey) => survey.id === id);
}

/**
 * Helper function to get all surveys
 * Useful for dashboard aggregations and analytics
 */
export function getAllSurveys(): CandidateSurvey[] {
  return candidateSurveys;
}
