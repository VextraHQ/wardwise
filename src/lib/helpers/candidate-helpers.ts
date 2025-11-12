/**
 * Candidate Helper Functions
 *
 * Utility functions for querying and filtering candidate data.
 * These helpers make it easy to access candidates by different criteria
 * without restructuring the underlying data source.
 *
 * NOTE: Supporter counts are now calculated dynamically from voter data.
 * Use getCandidateByIdWithSupporters() or getCandidatesWithSupporters() for accurate counts.
 */

import type { Candidate, CandidateSurvey } from "@/types";
import { candidates } from "@/lib/mock/data/candidates";
import { candidateSurveys } from "@/lib/mock/data/candidate-surveys";
import { getSupportersCount } from "@/lib/mock/data/candidate-analytics";

// ============================================================================
// FILTERING FUNCTIONS
// ============================================================================

/**
 * Get all candidates (useful as a base for chaining filters)
 */
export function getAllCandidates(): Candidate[] {
  return candidates;
}

/**
 * Get candidates by state
 * @param state - The state name (e.g., "Adamawa State", "Bauchi State")
 * @returns Array of candidates from the specified state
 */
export function getCandidatesByState(state: string): Candidate[] {
  return candidates.filter((candidate) => candidate.state === state);
}

/**
 * Get candidates by party
 * @param party - The party abbreviation (e.g., "APC", "PDP")
 * @returns Array of candidates from the specified party
 */
export function getCandidatesByParty(party: string): Candidate[] {
  return candidates.filter((candidate) => candidate.party === party);
}

/**
 * Get candidates by position
 * @param position - The position (e.g., "Governor", "Senator", "House of Representatives")
 * @returns Array of candidates running for the specified position
 */
export function getCandidatesByPosition(
  position: Candidate["position"],
): Candidate[] {
  return candidates.filter((candidate) => candidate.position === position);
}

/**
 * Get candidates by constituency
 * @param constituency - The constituency name
 * @returns Array of candidates from the specified constituency
 */
export function getCandidatesByConstituency(constituency: string): Candidate[] {
  return candidates.filter(
    (candidate) => candidate.constituency === constituency,
  );
}

/**
 * Get a single candidate by ID
 * @param id - The candidate ID
 * @returns The candidate object or undefined if not found
 */
export function getCandidateById(id: string): Candidate | undefined {
  return candidates.find((candidate) => candidate.id === id);
}

/**
 * Get a single candidate by ID with dynamically calculated supporter count
 * @param id - The candidate ID
 * @returns The candidate object with calculated supporters or undefined if not found
 */
export function getCandidateByIdWithSupporters(
  id: string,
): Candidate | undefined {
  const candidate = candidates.find((c) => c.id === id);
  if (!candidate) return undefined;

  return {
    ...candidate,
    supporters: getSupportersCount(id),
  };
}

/**
 * Get all candidates with dynamically calculated supporter counts
 * Use this instead of the raw candidates array when supporter counts are needed
 * @returns Array of candidates with calculated supporter counts
 */
export function getCandidatesWithSupporters(): Candidate[] {
  return candidates.map((candidate) => ({
    ...candidate,
    supporters: getSupportersCount(candidate.id),
  }));
}

// ============================================================================
// ADVANCED FILTERING
// ============================================================================

/**
 * Filter candidates by multiple criteria
 * @param filters - Object containing filter criteria
 * @returns Array of candidates matching all specified criteria
 *
 * @example
 * // Get all APC gubernatorial candidates
 * filterCandidates({ party: "APC", position: "Governor" })
 *
 * @example
 * // Get all senators in Bauchi State
 * filterCandidates({ state: "Bauchi State", position: "Senator" })
 */
export function filterCandidates(filters: {
  state?: string;
  party?: string;
  position?: Candidate["position"];
  constituency?: string;
}): Candidate[] {
  return candidates.filter((candidate) => {
    if (filters.state && candidate.state !== filters.state) return false;
    if (filters.party && candidate.party !== filters.party) return false;
    if (filters.position && candidate.position !== filters.position)
      return false;
    if (filters.constituency && candidate.constituency !== filters.constituency)
      return false;
    return true;
  });
}

/**
 * Search candidates by name, description, tagline, or vision
 * @param query - The search query string
 * @returns Array of candidates matching the search query
 */
export function searchCandidates(query: string): Candidate[] {
  const lowerQuery = query.toLowerCase();
  return candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(lowerQuery) ||
      candidate.description?.toLowerCase().includes(lowerQuery) ||
      candidate.tagline?.toLowerCase().includes(lowerQuery) ||
      candidate.vision?.toLowerCase().includes(lowerQuery),
  );
}

// ============================================================================
// GROUPING FUNCTIONS
// ============================================================================

/**
 * Group candidates by state
 * @returns Object with state names as keys and arrays of candidates as values
 *
 * @example
 * const grouped = groupCandidatesByState()
 * // { "Adamawa State": [...], "Bauchi State": [...] }
 */
export function groupCandidatesByState(): Record<string, Candidate[]> {
  return candidates.reduce(
    (acc, candidate) => {
      if (!acc[candidate.state]) {
        acc[candidate.state] = [];
      }
      acc[candidate.state].push(candidate);
      return acc;
    },
    {} as Record<string, Candidate[]>,
  );
}

/**
 * Group candidates by party
 * @returns Object with party names as keys and arrays of candidates as values
 */
export function groupCandidatesByParty(): Record<string, Candidate[]> {
  return candidates.reduce(
    (acc, candidate) => {
      if (!acc[candidate.party]) {
        acc[candidate.party] = [];
      }
      acc[candidate.party].push(candidate);
      return acc;
    },
    {} as Record<string, Candidate[]>,
  );
}

/**
 * Group candidates by position
 * @returns Object with position names as keys and arrays of candidates as values
 */
export function groupCandidatesByPosition(): Record<string, Candidate[]> {
  return candidates.reduce(
    (acc, candidate) => {
      if (!acc[candidate.position]) {
        acc[candidate.position] = [];
      }
      acc[candidate.position].push(candidate);
      return acc;
    },
    {} as Record<string, Candidate[]>,
  );
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

/**
 * Get total number of candidates
 */
export function getTotalCandidates(): number {
  return candidates.length;
}

/**
 * Get candidate count by state
 * @returns Object with state names as keys and counts as values
 */
export function getCandidateCountByState(): Record<string, number> {
  return candidates.reduce(
    (acc, candidate) => {
      acc[candidate.state] = (acc[candidate.state] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

/**
 * Get candidate count by party
 * @returns Object with party names as keys and counts as values
 */
export function getCandidateCountByParty(): Record<string, number> {
  return candidates.reduce(
    (acc, candidate) => {
      acc[candidate.party] = (acc[candidate.party] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

/**
 * Get candidate count by position
 * @returns Object with position names as keys and counts as values
 */
export function getCandidateCountByPosition(): Record<string, number> {
  return candidates.reduce(
    (acc, candidate) => {
      acc[candidate.position] = (acc[candidate.position] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

/**
 * Get total supporters across all candidates
 */
export function getTotalSupporters(): number {
  return candidates.reduce(
    (total, candidate) => total + candidate.supporters,
    0,
  );
}

/**
 * Get total supporters by state
 * @returns Object with state names as keys and supporter counts as values
 */
export function getSupportersByState(): Record<string, number> {
  return candidates.reduce(
    (acc, candidate) => {
      acc[candidate.state] = (acc[candidate.state] || 0) + candidate.supporters;
      return acc;
    },
    {} as Record<string, number>,
  );
}

/**
 * Get total supporters by party
 * @returns Object with party names as keys and supporter counts as values
 */
export function getSupportersByParty(): Record<string, number> {
  return candidates.reduce(
    (acc, candidate) => {
      acc[candidate.party] = (acc[candidate.party] || 0) + candidate.supporters;
      return acc;
    },
    {} as Record<string, number>,
  );
}

/**
 * Get top N candidates by supporter count
 * @param limit - Number of top candidates to return (default: 10)
 * @returns Array of candidates sorted by supporter count (descending)
 */
export function getTopCandidatesBySupporters(limit: number = 10): Candidate[] {
  return [...candidates]
    .sort((a, b) => b.supporters - a.supporters)
    .slice(0, limit);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get list of unique states from candidates
 * @returns Array of unique state names
 */
export function getUniqueStates(): string[] {
  return Array.from(new Set(candidates.map((c) => c.state)));
}

/**
 * Get list of unique parties from candidates
 * @returns Array of unique party names
 */
export function getUniqueParties(): string[] {
  return Array.from(new Set(candidates.map((c) => c.party)));
}

/**
 * Get list of unique positions from candidates
 * @returns Array of unique position names
 */
export function getUniquePositions(): string[] {
  return Array.from(new Set(candidates.map((c) => c.position)));
}

/**
 * Get candidates sorted by a specific field
 * @param field - The field to sort by
 * @param order - Sort order ("asc" or "desc")
 * @returns Sorted array of candidates
 */
export function sortCandidatesBy(
  field: keyof Candidate,
  order: "asc" | "desc" = "asc",
): Candidate[] {
  return [...candidates].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    // Handle undefined values
    if (aVal === undefined && bVal === undefined) return 0;
    if (aVal === undefined) return order === "asc" ? 1 : -1;
    if (bVal === undefined) return order === "asc" ? -1 : 1;

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
}

// ============================================================================
// SURVEY HELPER FUNCTIONS
// ============================================================================

/**
 * Get surveys by state
 * Returns all surveys for candidates from a specific state
 * @param state - The state name (e.g., "Adamawa State", "Bauchi State")
 * @returns Array of surveys for candidates from the specified state
 *
 * @example
 * // Get all surveys for Bauchi State candidates
 * const bauchiSurveys = getSurveysByState("Bauchi State")
 */
export function getSurveysByState(state: string): CandidateSurvey[] {
  return candidateSurveys.filter((survey) => {
    const candidate = getCandidateById(survey.candidateId);
    return candidate?.state === state;
  });
}

/**
 * Get surveys by party
 * Returns all surveys for candidates from a specific party
 * @param party - The party abbreviation (e.g., "APC", "PDP")
 * @returns Array of surveys for candidates from the specified party
 *
 * @example
 * // Get all surveys for APC candidates
 * const apcSurveys = getSurveysByParty("APC")
 */
export function getSurveysByParty(party: string): CandidateSurvey[] {
  return candidateSurveys.filter((survey) => {
    const candidate = getCandidateById(survey.candidateId);
    return candidate?.party === party;
  });
}

/**
 * Get surveys by position
 * Returns all surveys for candidates running for a specific position
 * @param position - The position (e.g., "Governor", "Senator", "House of Representatives")
 * @returns Array of surveys for candidates running for the specified position
 *
 * @example
 * // Get all surveys for gubernatorial candidates
 * const governorSurveys = getSurveysByPosition("Governor")
 */
export function getSurveysByPosition(
  position: Candidate["position"],
): CandidateSurvey[] {
  return candidateSurveys.filter((survey) => {
    const candidate = getCandidateById(survey.candidateId);
    return candidate?.position === position;
  });
}

/**
 * Get candidate information for a survey
 * Convenience function to get candidate details when you have a survey
 * @param survey - The survey object
 * @returns The candidate object or undefined if not found
 *
 * @example
 * const survey = getSurveyByCandidateId("cand-apc-1")
 * const candidate = getCandidateForSurvey(survey)
 * console.log(candidate?.party) // "APC"
 */
export function getCandidateForSurvey(
  survey: CandidateSurvey,
): Candidate | undefined {
  return getCandidateById(survey.candidateId);
}
