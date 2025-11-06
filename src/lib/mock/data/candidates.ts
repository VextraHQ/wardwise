// Mock Candidate Data - DEMO ONLY
import type { Candidate } from "@/types";

export const candidates: Candidate[] = [
  // ============================================================================
  // ADAMAWA STATE CANDIDATES
  // ============================================================================

  // --- Gubernatorial Candidates ---
  {
    id: "cand-apc-1",
    name: "Dr. Ahmadu Umaru Fintiri",
    party: "APC",
    position: "Governor",
    state: "Adamawa State",
    constituency: "Adamawa State",
    description: "Experienced leader focused on development and security.",
    supporters: 1250,
    photo: "/api/placeholder/150/150",
    surveyId: "survey-apc-1",
    tagline: "Security, Development, Progress",
    vision: "Building a safer and more prosperous Adamawa State",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-10-15T10:00:00Z",
  },
  {
    id: "cand-pdp-1",
    name: "Senator Aishatu Dahiru Ahmed",
    party: "PDP",
    position: "Governor",
    state: "Adamawa State",
    constituency: "Adamawa State",
    description: "Progressive leader committed to education and healthcare.",
    supporters: 980,
    photo: "/api/placeholder/150/150",
    surveyId: "survey-pdp-1",
    tagline: "Education, Healthcare, Women Empowerment",
    vision:
      "Creating an Adamawa State where everyone has access to quality education and healthcare",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-10-15T10:00:00Z",
  },

  // --- Senatorial Candidates ---
  {
    id: "cand-pdp-2",
    name: "Dr. Maryam Inna Ciroma",
    party: "PDP",
    position: "Senator",
    state: "Adamawa State",
    constituency: "Adamawa Central",
    description:
      "Healthcare professional dedicated to women's empowerment and community welfare.",
    supporters: 650,
    photo: "/api/placeholder/150/150",
    surveyId: "survey-pdp-2",
    tagline: "Healthcare, Women's Rights, Community Welfare",
    vision:
      "Ensuring every community in Adamawa Central has access to quality healthcare",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-10-15T10:00:00Z",
  },

  // --- House of Representatives Candidates ---
  {
    id: "cand-apc-2",
    name: "Hon. Abdulrazak Namdas",
    party: "APC",
    position: "House of Representatives",
    state: "Adamawa State",
    constituency: "Jada/Ganye/Mayo-Belwa/Toungo",
    description: "Youth advocate and infrastructure development champion.",
    supporters: 750,
    photo: "/api/placeholder/150/150",
    surveyId: "survey-apc-2",
    tagline: "Youth Empowerment, Infrastructure",
    vision:
      "Transforming Jada/Ganye/Mayo-Belwa/Toungo through youth-driven development",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-10-15T10:00:00Z",
  },
  {
    id: "cand-apc-4",
    name: "Hon. Aliyu Wakili Boya",
    party: "APC",
    position: "House of Representatives",
    state: "Adamawa State",
    constituency: "Fufore/Song Federal Constituency",
    description:
      "Former ALGON Chairman and Executive Chairman of Fufore LGA. Currently serving first term in 10th National Assembly.",
    supporters: 850,
    photo: "/api/placeholder/150/150",
    surveyId: "survey-apc-4",
    tagline: "Fixing Roads, Creating Jobs, Building Communities",
    vision:
      "Transforming Fufore/Song through infrastructure and economic development",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-10-15T10:00:00Z",
  },

  // ============================================================================
  // BAUCHI STATE CANDIDATES
  // ============================================================================

  // --- Gubernatorial Candidates ---
  {
    id: "cand-apc-bauchi-1",
    name: "Senator Bala Abdulkadir Mohammed",
    party: "APC",
    position: "Governor",
    state: "Bauchi State",
    constituency: "Bauchi State",
    description:
      "Former FCT Minister with extensive experience in urban development and infrastructure.",
    supporters: 1420,
    photo: "/api/placeholder/150/150",
    surveyId: "survey-apc-bauchi-1",
    tagline: "Infrastructure, Economic Growth, Unity",
    vision:
      "Transforming Bauchi into a hub of commerce and sustainable development",
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-10-20T09:00:00Z",
  },
  {
    id: "cand-pdp-bauchi-1",
    name: "Hajiya Samira Ado Sanusi",
    party: "PDP",
    position: "Governor",
    state: "Bauchi State",
    constituency: "Bauchi State",
    description:
      "Education reformer and advocate for social welfare programs across Bauchi.",
    supporters: 1150,
    photo: "/api/placeholder/150/150",
    surveyId: "survey-pdp-bauchi-1",
    tagline: "Quality Education, Social Welfare, Inclusivity",
    vision:
      "Creating equal opportunities for all Bauchi citizens through education and empowerment",
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-10-20T09:00:00Z",
  },

  // --- Senatorial Candidates ---
  {
    id: "cand-apc-bauchi-2",
    name: "Senator Halliru Dauda Jika",
    party: "APC",
    position: "Senator",
    state: "Bauchi State",
    constituency: "Bauchi Central",
    description:
      "Business leader committed to economic empowerment and job creation.",
    supporters: 820,
    photo: "/api/placeholder/150/150",
    surveyId: "survey-apc-bauchi-2",
    tagline: "Jobs, Business Growth, Prosperity",
    vision: "Making Bauchi Central the economic powerhouse of Northern Nigeria",
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-10-20T09:00:00Z",
  },
  {
    id: "cand-pdp-bauchi-2",
    name: "Dr. Fatima Binta Bello",
    party: "PDP",
    position: "Senator",
    state: "Bauchi State",
    constituency: "Bauchi South",
    description:
      "Medical doctor and public health advocate focused on rural healthcare access.",
    supporters: 720,
    photo: "/api/placeholder/150/150",
    surveyId: "survey-pdp-bauchi-2",
    tagline: "Healthcare Access, Rural Development",
    vision:
      "Ensuring every community in Bauchi South has access to modern healthcare",
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-10-20T09:00:00Z",
  },

  // --- House of Representatives Candidates ---
  {
    id: "cand-apc-bauchi-3",
    name: "Hon. Yakubu Shehu Abdullahi",
    party: "APC",
    position: "House of Representatives",
    state: "Bauchi State",
    constituency: "Bauchi Federal Constituency",
    description:
      "Former Local Government Chairman with strong grassroots support and focus on rural electrification.",
    supporters: 680,
    photo: "/api/placeholder/150/150",
    surveyId: "survey-apc-bauchi-3",
    tagline: "Power to the People, Rural Development",
    vision: "Bringing electricity and modern amenities to every community",
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-10-20T09:00:00Z",
  },
  {
    id: "cand-pdp-bauchi-3",
    name: "Hon. Abubakar Sadiq Ningi",
    party: "PDP",
    position: "House of Representatives",
    state: "Bauchi State",
    constituency: "Ningi/Warji Federal Constituency",
    description:
      "Agricultural economist dedicated to farming communities and food security.",
    supporters: 590,
    photo: "/api/placeholder/150/150",
    surveyId: "survey-pdp-bauchi-3",
    tagline: "Agriculture, Food Security, Farmers First",
    vision:
      "Empowering our farmers and ensuring food security for Bauchi State",
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-10-20T09:00:00Z",
  },
];

/**
 * NOTE: Helper functions have been moved to @/lib/helpers/candidate-helpers.ts
 * Please import from there for better organization and DRY principles.
 *
 * Available helper functions:
 * - getCandidateById(id)
 * - getCandidatesByState(state)
 * - getCandidatesByParty(party)
 * - getCandidatesByPosition(position)
 * - filterCandidates(filters)
 * - searchCandidates(query)
 * - groupCandidatesByState()
 * - And many more...
 */
