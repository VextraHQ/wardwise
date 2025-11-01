// Mock Candidate Data - DEMO ONLY
import type { Candidate } from "@/types";

export const candidates: Candidate[] = [
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
  {
    id: "cand-apc-2",
    name: "Hon. Abdulrazak Namdas",
    party: "APC",
    position: "House of Representatives",
    state: "Adamawa State",
    constituency: "Ganye/Toungo/Mayo Belwa",
    description: "Youth advocate and infrastructure development champion.",
    supporters: 750,
    photo: "/api/placeholder/150/150",
    surveyId: "survey-apc-2",
    tagline: "Youth Empowerment, Infrastructure",
    vision:
      "Transforming Ganye/Toungo/Mayo Belwa through youth-driven development",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-10-15T10:00:00Z",
  },
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
];

/**
 * Helper function to get candidate by ID
 * Used by mockApi functions to ensure consistent data access
 */
export function getCandidateById(id: string): Candidate | undefined {
  return candidates.find((candidate) => candidate.id === id);
}

/**
 * Helper function to get candidates by position
 * Useful for filtering and dashboard queries
 */
export function getCandidatesByPosition(position: string): Candidate[] {
  return candidates.filter((candidate) => candidate.position === position);
}

/**
 * Helper function to get candidates by state
 * Useful for location-based filtering
 */
export function getCandidatesByState(state: string): Candidate[] {
  return candidates.filter((candidate) => candidate.state === state);
}
