/**
 * Survey Templates
 *
 * Pre-built survey templates for candidates to use as starting points.
 * Templates are organized by position and focus area.
 */

import type { SurveyTemplate } from "@/types";
import type { Candidate } from "@/types/candidate";

export const surveyTemplates: SurveyTemplate[] = [
  // ============================================================================
  // GOVERNOR TEMPLATES
  // ============================================================================

  {
    id: "template-governor-security",
    name: "Security & Development Priorities",
    description:
      "Comprehensive survey covering security, infrastructure, economic development, and governance",
    position: "Governor",
    focusArea: "Security & Development",
    estimatedMinutes: 6,
    questionCount: 8,
    preview: {
      title: "Security and Development Priorities for [State]",
      description:
        "As Governor, I seek your input on security, economic development, infrastructure, and governance priorities. Your responses help shape the state's development agenda.",
      sampleQuestions: [
        {
          type: "single",
          question: "What is your most pressing security concern?",
        },
        {
          type: "multiple",
          question: "Which security measures should be prioritized?",
        },
        {
          type: "scale",
          question:
            "How confident are you in the state government's ability to address key challenges?",
        },
      ],
    },
    questions: [
      {
        id: "q1",
        type: "single",
        question: "What is your most pressing security concern in [State]?",
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
        ],
      },
      {
        id: "q3",
        type: "single",
        question:
          "How would you rate the current state of infrastructure in [State]?",
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
          "Which economic development initiatives should be prioritized for [State]?",
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
        ],
      },
      {
        id: "q5",
        type: "single",
        question:
          "How would you assess the performance of public institutions in [State]?",
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
          "What specific policy or program would have the greatest positive impact on [State]?",
        description:
          "Please provide detailed recommendations (minimum 20 words, maximum 500 words)",
      },
    ],
  },

  {
    id: "template-governor-infrastructure",
    name: "Infrastructure & Economic Development",
    description:
      "Focus on infrastructure modernization, urban development, and economic diversification",
    position: "Governor",
    focusArea: "Infrastructure & Economy",
    estimatedMinutes: 6,
    questionCount: 7,
    preview: {
      title: "Infrastructure and Economic Development Priorities for [State]",
      description:
        "Your input on infrastructure modernization, urban development, economic diversification, and unity initiatives helps shape strategic development plans.",
      sampleQuestions: [
        {
          type: "single",
          question:
            "What is the most critical infrastructure need in your area?",
        },
        {
          type: "multiple",
          question: "Which economic sectors should be prioritized?",
        },
        {
          type: "scale",
          question:
            "How confident are you in [State]'s potential for economic growth?",
        },
      ],
    },
    questions: [
      {
        id: "q1",
        type: "single",
        question: "What is the most critical infrastructure need in your area?",
        description:
          "Identify the primary infrastructure gap affecting your community",
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
            id: "opt-telecom-bauchi",
            label: "Telecommunications and internet connectivity",
          },
        ],
      },
      {
        id: "q2",
        type: "multiple",
        question:
          "Which economic sectors should be prioritized for [State]'s development?",
        description: "Select all sectors that would drive economic growth",
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
        ],
      },
      {
        id: "q3",
        type: "single",
        question: "How would you rate the business environment in [State]?",
        description:
          "Consider ease of doing business, access to finance, and regulatory framework",
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
        ],
      },
      {
        id: "q4",
        type: "multiple",
        question:
          "Which urban development initiatives are most needed in your area?",
        description: "Select all urban improvements that are critical",
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
            id: "opt-waste-management",
            label: "Waste management and sanitation",
          },
          {
            id: "opt-traffic",
            label: "Traffic management and road safety",
          },
        ],
      },
      {
        id: "q5",
        type: "single",
        question:
          "What is the primary challenge to unity and social cohesion in [State]?",
        description:
          "Identify barriers to harmonious coexistence across communities",
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
        ],
      },
      {
        id: "q6",
        type: "scale",
        question:
          "How confident are you in [State]'s potential for economic growth?",
        description: "Rate your optimism about economic development prospects",
        minLabel: "Not Confident",
        maxLabel: "Very Confident",
      },
      {
        id: "q7",
        type: "text",
        question:
          "What specific infrastructure project would have the greatest impact on [State]'s development?",
        description:
          "Please provide detailed suggestions (minimum 20 words, maximum 500 words)",
      },
    ],
  },

  // ============================================================================
  // SENATOR TEMPLATES
  // ============================================================================

  {
    id: "template-senator-healthcare",
    name: "Healthcare & Social Welfare",
    description:
      "Focus on healthcare access, social welfare programs, and inclusive development",
    position: "Senator",
    focusArea: "Healthcare & Welfare",
    estimatedMinutes: 5,
    questionCount: 6,
    preview: {
      title: "Healthcare and Social Welfare Priorities for [Constituency]",
      description:
        "Your responses help prioritize healthcare improvements, maternal health programs, and rural community development initiatives.",
      sampleQuestions: [
        {
          type: "single",
          question:
            "What is the biggest healthcare challenge in your community?",
        },
        {
          type: "multiple",
          question: "Which healthcare improvements are most urgently needed?",
        },
        {
          type: "scale",
          question:
            "How satisfied are you with the availability of healthcare services?",
        },
      ],
    },
    questions: [
      {
        id: "q1",
        type: "single",
        question: "What is the biggest healthcare challenge in your community?",
        description:
          "Identify the most critical barrier to accessing healthcare",
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
        ],
      },
      {
        id: "q2",
        type: "multiple",
        question:
          "Which healthcare improvements are most urgently needed in your constituency?",
        description: "Select all healthcare priorities for your constituency",
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
            id: "opt-health-insurance",
            label: "Health insurance and financing schemes",
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
        ],
      },
      {
        id: "q4",
        type: "multiple",
        question:
          "Which rural development initiatives would most benefit your community?",
        description: "Select all rural improvements that are priorities",
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
          "What healthcare or rural development initiative would have the greatest impact in your constituency?",
        description:
          "Please provide detailed recommendations (minimum 20 words, maximum 500 words)",
      },
    ],
  },

  {
    id: "template-senator-education",
    name: "Education & Human Development",
    description:
      "Focus on education reform, women's empowerment, and human capital development",
    position: "Senator",
    focusArea: "Education & Development",
    estimatedMinutes: 6,
    questionCount: 8,
    preview: {
      title: "Education and Human Development Priorities for [Constituency]",
      description:
        "Your responses help shape legislative priorities and advocacy efforts for education, healthcare, and women's empowerment.",
      sampleQuestions: [
        {
          type: "single",
          question:
            "What is the most critical challenge facing the education sector?",
        },
        {
          type: "multiple",
          question: "Which education interventions should be prioritized?",
        },
        {
          type: "scale",
          question:
            "How important is education quality improvement as a priority?",
        },
      ],
    },
    questions: [
      {
        id: "q1",
        type: "single",
        question:
          "What is the most critical challenge facing the education sector in [Constituency]?",
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
        ],
      },
      {
        id: "q7",
        type: "scale",
        question:
          "How important is education quality improvement as a state priority?",
        description: "Rate the importance of education reform for development",
        minLabel: "Not Important",
        maxLabel: "Very Important",
      },
      {
        id: "q8",
        type: "text",
        question:
          "What specific legislation or policy would most advance education and human development in [Constituency]?",
        description:
          "Please provide detailed recommendations for legislative action (minimum 20 words, maximum 500 words)",
      },
    ],
  },

  // ============================================================================
  // HOUSE OF REPRESENTATIVES TEMPLATES
  // ============================================================================

  {
    id: "template-house-community",
    name: "Community Development Priorities",
    description:
      "Focus on infrastructure, economic development, education, healthcare, and security at the constituency level",
    position: "House of Representatives",
    focusArea: "Community Development",
    estimatedMinutes: 5,
    questionCount: 8,
    preview: {
      title: "Community Development Priorities for [Constituency]",
      description:
        "Your responses will help shape policy priorities and infrastructure investments in our constituency.",
      sampleQuestions: [
        {
          type: "single",
          question:
            "How would you rate the overall condition of road infrastructure?",
        },
        {
          type: "multiple",
          question: "Which infrastructure projects should be prioritized?",
        },
        {
          type: "scale",
          question:
            "How satisfied are you with the quality of public services?",
        },
      ],
    },
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
  },

  {
    id: "template-house-youth",
    name: "Youth Development & Economic Opportunities",
    description:
      "Focus on youth empowerment, job creation, skills development, and economic opportunities",
    position: "House of Representatives",
    focusArea: "Youth & Economy",
    estimatedMinutes: 5,
    questionCount: 8,
    preview: {
      title: "Youth Development and Economic Opportunities for [Constituency]",
      description:
        "Your responses inform policy priorities for youth empowerment, job creation, and economic opportunities.",
      sampleQuestions: [
        {
          type: "single",
          question:
            "What is the biggest challenge facing youth in your constituency?",
        },
        {
          type: "multiple",
          question: "Which youth empowerment programs would be most effective?",
        },
        {
          type: "scale",
          question:
            "How satisfied are you with current government programs for youth development?",
        },
      ],
    },
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
            id: "opt-networking",
            label: "Networking and mentorship",
          },
        ],
      },
      {
        id: "q8",
        type: "text",
        question:
          "What specific programs or policies would create the most economic opportunities for youth in [Constituency]?",
        description:
          "Please provide detailed recommendations (minimum 20 words, maximum 500 words)",
      },
    ],
  },

  // ============================================================================
  // STATE ASSEMBLY TEMPLATES
  // ============================================================================

  {
    id: "template-state-assembly-community",
    name: "Local Community Development Priorities",
    description:
      "Focus on local infrastructure, community services, education, healthcare, and grassroots development at the state constituency level",
    position: "State Assembly",
    focusArea: "Community Development",
    estimatedMinutes: 4,
    questionCount: 7,
    preview: {
      title: "Local Community Development Priorities for [State Constituency]",
      description:
        "Your responses will help shape local development priorities and community investments in our state constituency.",
      sampleQuestions: [
        {
          type: "single",
          question:
            "How would you rate local road infrastructure in your area?",
        },
        {
          type: "multiple",
          question: "Which local projects should be prioritized?",
        },
        {
          type: "scale",
          question: "How satisfied are you with local government services?",
        },
      ],
    },
    questions: [
      {
        id: "q1",
        type: "single",
        question: "How would you rate local road infrastructure in your area?",
        description:
          "Please assess state and local roads within your constituency",
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
          "Which local infrastructure projects should be prioritized in our constituency?",
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
        ],
      },
      {
        id: "q3",
        type: "scale",
        question:
          "How satisfied are you with the quality of local government services?",
        description:
          "Consider services like waste management, local security, and community facilities",
        minLabel: "Very Dissatisfied",
        maxLabel: "Very Satisfied",
      },
      {
        id: "q4",
        type: "single",
        question: "What is the most pressing issue in your local community?",
        description: "Identify the primary concern affecting your area",
        options: [
          {
            id: "opt-infrastructure-local",
            label: "Infrastructure (roads, water, electricity)",
          },
          {
            id: "opt-education-local",
            label: "Education and school facilities",
          },
          {
            id: "opt-healthcare-local",
            label: "Healthcare and medical facilities",
          },
          {
            id: "opt-security-local",
            label: "Security and safety",
          },
          {
            id: "opt-jobs-local",
            label: "Employment and economic opportunities",
          },
        ],
      },
      {
        id: "q5",
        type: "multiple",
        question: "Which community services need the most improvement?",
        description: "Select all services that require urgent attention",
        options: [
          {
            id: "opt-primary-health",
            label: "Primary healthcare centers",
          },
          {
            id: "opt-schools",
            label: "Primary and secondary schools",
          },
          {
            id: "opt-markets",
            label: "Markets and trading centers",
          },
          {
            id: "opt-security-services",
            label: "Security and law enforcement",
          },
          {
            id: "opt-waste-management",
            label: "Waste management and sanitation",
          },
        ],
      },
      {
        id: "q6",
        type: "single",
        question:
          "How would you rate access to quality education in your constituency?",
        description:
          "Consider availability of schools, quality of education, and accessibility",
        options: [
          {
            id: "opt-edu-excellent",
            label: "Excellent - High quality and easily accessible",
          },
          {
            id: "opt-edu-good",
            label: "Good - Adequate with room for improvement",
          },
          {
            id: "opt-edu-fair",
            label: "Fair - Limited access and quality issues",
          },
          {
            id: "opt-edu-poor",
            label: "Poor - Significant gaps in access and quality",
          },
        ],
      },
      {
        id: "q7",
        type: "text",
        question:
          "What specific local development projects or initiatives would have the greatest impact on your community?",
        description:
          "Please provide detailed recommendations (minimum 20 words, maximum 500 words)",
      },
    ],
  },
  {
    id: "template-state-assembly-healthcare",
    name: "Local Healthcare & Social Services",
    description:
      "Focus on primary healthcare access, local health facilities, social welfare, and community health programs",
    position: "State Assembly",
    focusArea: "Healthcare & Social Services",
    estimatedMinutes: 4,
    questionCount: 6,
    preview: {
      title: "Local Healthcare and Social Services for [State Constituency]",
      description:
        "Your responses help prioritize healthcare investments and social service improvements in our constituency.",
      sampleQuestions: [
        {
          type: "single",
          question:
            "How would you rate access to healthcare facilities in your area?",
        },
        {
          type: "multiple",
          question: "Which healthcare services need improvement?",
        },
        {
          type: "scale",
          question: "How satisfied are you with local healthcare services?",
        },
      ],
    },
    questions: [
      {
        id: "q1",
        type: "single",
        question:
          "How would you rate access to healthcare facilities in your constituency?",
        description:
          "Consider distance, availability, and quality of healthcare services",
        options: [
          {
            id: "opt-health-excellent",
            label: "Excellent - Easily accessible and high quality",
          },
          {
            id: "opt-health-good",
            label: "Good - Generally accessible with minor issues",
          },
          {
            id: "opt-health-fair",
            label: "Fair - Limited access or quality concerns",
          },
          {
            id: "opt-health-poor",
            label: "Poor - Very limited access or poor quality",
          },
        ],
      },
      {
        id: "q2",
        type: "multiple",
        question:
          "Which healthcare services need the most improvement in your area?",
        description: "Select all services that require urgent attention",
        options: [
          {
            id: "opt-primary-care",
            label: "Primary healthcare centers",
          },
          {
            id: "opt-maternal",
            label: "Maternal and child health services",
          },
          {
            id: "opt-emergency",
            label: "Emergency medical services",
          },
          {
            id: "opt-pharmacy",
            label: "Pharmacy and medication access",
          },
          {
            id: "opt-mental-health",
            label: "Mental health services",
          },
        ],
      },
      {
        id: "q3",
        type: "scale",
        question: "How satisfied are you with local healthcare services?",
        description: "Rate your overall satisfaction with available healthcare",
        minLabel: "Very Dissatisfied",
        maxLabel: "Very Satisfied",
      },
      {
        id: "q4",
        type: "single",
        question:
          "What is the biggest barrier to accessing healthcare in your community?",
        description: "Identify the primary obstacle",
        options: [
          {
            id: "opt-distance",
            label: "Distance to healthcare facilities",
          },
          {
            id: "opt-cost",
            label: "Cost of healthcare services",
          },
          {
            id: "opt-quality",
            label: "Quality of available services",
          },
          {
            id: "opt-availability",
            label: "Limited availability of services",
          },
        ],
      },
      {
        id: "q5",
        type: "multiple",
        question:
          "Which social welfare programs would benefit your community most?",
        description: "Select all programs that would improve community welfare",
        options: [
          {
            id: "opt-youth-programs",
            label: "Youth empowerment programs",
          },
          {
            id: "opt-women-programs",
            label: "Women's empowerment initiatives",
          },
          {
            id: "opt-elderly-care",
            label: "Elderly care and support",
          },
          {
            id: "opt-disability",
            label: "Disability support services",
          },
          {
            id: "opt-poverty",
            label: "Poverty alleviation programs",
          },
        ],
      },
      {
        id: "q6",
        type: "text",
        question:
          "What specific healthcare or social service improvements would have the greatest impact on your community?",
        description:
          "Please provide detailed recommendations (minimum 20 words, maximum 500 words)",
      },
    ],
  },
];

// Get templates by position
export function getTemplatesByPosition(
  position: Candidate["position"] | "All",
): SurveyTemplate[] {
  if (position === "All") {
    return surveyTemplates;
  }
  return surveyTemplates.filter((template) => template.position === position);
}

// Get template by ID
export function getTemplateById(id: string): SurveyTemplate | undefined {
  return surveyTemplates.find((template) => template.id === id);
}
