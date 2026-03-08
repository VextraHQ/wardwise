/**
 * Candidate Helper Functions
 *
 * Utility functions for querying and filtering candidate data.
 * These helpers make it easy to access candidates by different criteria
 * without restructuring the underlying data source.
 *
 * NOTE: Supporter counts are now calculated dynamically from voter data.
 * Use getCandidateByIdWithSupporters() or getCandidatesWithSupporters() for accurate counts.
 *
 * USAGE STATUS:
 * - ✅ Currently Used: getCandidateByIdWithSupporters()
 * - 🔮 Future Use: Most other functions are kept for future features (admin panels, search, filtering, etc.)
 */

import type { Candidate } from "@/types/candidate";
import { candidates } from "@/lib/mock/data/candidates";
import { getSupportersCount } from "@/lib/helpers/voter-analytics";

// ============================================================================
// FILTERING FUNCTIONS
// ============================================================================
// NOTE: These functions are kept for future use (admin panels, search features, etc.)

/**
 * Get all candidates (useful as a base for chaining filters)
 * 🔮 Future Use: Admin panels, candidate listings
 */
export function getAllCandidates(): Candidate[] {
  return candidates;
}

/**
 * Get candidates by state
 * 🔮 Future Use: State-based filtering in admin/search
 * @param state - The state name (e.g., "Adamawa State", "Bauchi State")
 * @returns Array of candidates from the specified state
 */
export function getCandidatesByState(state: string): Candidate[] {
  return candidates.filter((candidate) => candidate.state === state);
}

/**
 * Get candidates by party
 * 🔮 Future Use: Party-based filtering in admin/search
 * @param party - The party abbreviation (e.g., "APC", "PDP")
 * @returns Array of candidates from the specified party
 */
export function getCandidatesByParty(party: string): Candidate[] {
  return candidates.filter((candidate) => candidate.party === party);
}

/**
 * Get candidates by position
 * 🔮 Future Use: Position-based filtering in admin/search
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
 * 🔮 Future Use: Constituency-based filtering
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
 * ⚙️ Internal Use: Used by other helper functions
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
// NOTE: These functions are kept for future use (advanced search, filtering UI)

/**
 * Filter candidates by multiple criteria
 * 🔮 Future Use: Advanced search/filter UI
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
 * 🔮 Future Use: Search functionality in admin/voter interfaces
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
// NOTE: These functions are kept for future use (admin dashboards, analytics)

/**
 * Group candidates by state
 * 🔮 Future Use: Admin dashboards, analytics views
 * @returns Object with state names as keys and arrays of candidates as values
 *
 * @example
 * const grouped = groupCandidatesByState()
 * // { "Adamawa State": [...], "Bauchi State": [...] }
 */
export function groupCandidatesByState(): Record<string, Candidate[]> {
  return candidates.reduce(
    (acc, candidate) => {
      const state = candidate.state ?? "National";
      if (!acc[state]) {
        acc[state] = [];
      }
      acc[state].push(candidate);
      return acc;
    },
    {} as Record<string, Candidate[]>,
  );
}

/**
 * Group candidates by party
 * 🔮 Future Use: Admin dashboards, analytics views
 * @returns Object with party names as keys and arrays of candidates as values
 */
export function groupCandidatesByParty(): Record<string, Candidate[]> {
  return candidates.reduce(
    (acc, candidate) => {
      const party = candidate.party;
      if (!acc[party]) {
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
 * 🔮 Future Use: Admin dashboards, analytics views
 * @returns Object with position names as keys and arrays of candidates as values
 */
export function groupCandidatesByPosition(): Record<string, Candidate[]> {
  return candidates.reduce(
    (acc, candidate) => {
      const position = candidate.position;
      if (!acc[position]) {
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
// NOTE: These functions are kept for future use (admin dashboards, platform stats)

/**
 * Get total number of candidates
 * 🔮 Future Use: Admin dashboard stats
 */
export function getTotalCandidates(): number {
  return candidates.length;
}

/**
 * Get candidate count by state
 * 🔮 Future Use: Admin dashboard analytics
 * @returns Object with state names as keys and counts as values
 */
export function getCandidateCountByState(): Record<string, number> {
  return candidates.reduce(
    (acc, candidate) => {
      const state = candidate.state || "National";
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

/**
 * Get candidate count by party
 * 🔮 Future Use: Admin dashboard analytics
 * @returns Object with party names as keys and counts as values
 */
export function getCandidateCountByParty(): Record<string, number> {
  return candidates.reduce(
    (acc, candidate) => {
      const party = candidate.party;
      acc[party] = (acc[party] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

/**
 * Get candidate count by position
 * 🔮 Future Use: Admin dashboard analytics
 * @returns Object with position names as keys and counts as values
 */
export function getCandidateCountByPosition(): Record<string, number> {
  return candidates.reduce(
    (acc, candidate) => {
      const position = candidate.position;
      acc[position] = (acc[position] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

/**
 * Get total supporters across all candidates
 * 🔮 Future Use: Admin dashboard platform stats
 * NOTE: Uses dynamic supporter counts from voter data for accuracy
 */
export function getTotalSupporters(): number {
  return candidates.reduce(
    (total, candidate) => total + getSupportersCount(candidate.id),
    0,
  );
}

/**
 * Get total supporters by state
 * 🔮 Future Use: Admin dashboard analytics
 * NOTE: Uses dynamic supporter counts from voter data for accuracy
 * @returns Object with state names as keys and supporter counts as values
 */
export function getSupportersByState(): Record<string, number> {
  return candidates.reduce(
    (acc, candidate) => {
      const state = candidate.state || "National";
      acc[state] = (acc[state] || 0) + getSupportersCount(candidate.id);
      return acc;
    },
    {} as Record<string, number>,
  );
}

/**
 * Get total supporters by party
 * 🔮 Future Use: Admin dashboard analytics
 * NOTE: Uses dynamic supporter counts from voter data for accuracy
 * @returns Object with party names as keys and supporter counts as values
 */
export function getSupportersByParty(): Record<string, number> {
  return candidates.reduce(
    (acc, candidate) => {
      const party = candidate.party;
      acc[party] =
        (acc[candidate.party] || 0) + getSupportersCount(candidate.id);
      return acc;
    },
    {} as Record<string, number>,
  );
}

/**
 * Get top N candidates by supporter count
 * 🔮 Future Use: Leaderboards, admin dashboards
 * NOTE: Uses dynamic supporter counts from voter data for accuracy
 * @param limit - Number of top candidates to return (default: 10)
 * @returns Array of candidates sorted by supporter count (descending)
 */
export function getTopCandidatesBySupporters(limit: number = 10): Candidate[] {
  return getCandidatesWithSupporters()
    .sort((a, b) => b.supporters - a.supporters)
    .slice(0, limit);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
// NOTE: These functions are kept for future use (dropdowns, filters, etc.)

/**
 * Get list of unique states from candidates
 * 🔮 Future Use: Dropdown filters, form options
 * @returns Array of unique state names
 */
export function getUniqueStates(): string[] {
  return Array.from<string>(
    new Set(
      candidates
        .map((c) => c.state ?? "National")
        .filter((state): state is string => Boolean(state)),
    ),
  ).sort() as string[];
}

/**
 * Get list of unique parties from candidates
 * 🔮 Future Use: Dropdown filters, form options
 * @returns Array of unique party names
 */
export function getUniqueParties(): string[] {
  return Array.from<string>(
    new Set(
      candidates
        .map((c) => c.party)
        .filter((party): party is string => Boolean(party)),
    ),
  ).sort() as string[];
}

/**
 * Get list of unique positions from candidates
 * 🔮 Future Use: Dropdown filters, form options
 * @returns Array of unique position names
 */
export function getUniquePositions(): string[] {
  return Array.from(new Set(candidates.map((c) => c.position)));
}

/**
 * Get candidates sorted by a specific field
 * 🔮 Future Use: Sortable tables, candidate listings
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

    // Handle undefined and null values
    if (
      (aVal === undefined || aVal === null) &&
      (bVal === undefined || bVal === null)
    )
      return 0;
    if (aVal === undefined || aVal === null) return order === "asc" ? 1 : -1;
    if (bVal === undefined || bVal === null) return order === "asc" ? -1 : 1;

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
}
