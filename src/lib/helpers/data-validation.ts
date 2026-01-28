/**
 * Data Validation Helpers
 *
 * Ensures data integrity between candidates and surveys.
 * Validates that every candidate has a corresponding survey and vice versa.
 */

import { candidates } from "@/lib/mock/data/candidates";
import {
  candidateSurveys,
  getSurveyByCandidateId,
} from "@/lib/mock/data/candidate-surveys";

/**
 * Validation result type
 */
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

/**
 * Validates that all candidates have corresponding surveys
 * @returns Validation result with any errors or warnings
 */
export function validateCandidateSurveySync(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check: Every candidate should have a survey
  candidates.forEach((candidate) => {
    const survey = getSurveyByCandidateId(candidate.id);

    if (!survey) {
      errors.push(
        `Candidate "${candidate.name}" (${candidate.id}) does not have a corresponding survey. Expected surveyId: ${candidate.surveyId}`,
      );
    } else {
      // Validate that candidate.surveyId matches the survey.id
      if (candidate.surveyId && candidate.surveyId !== survey.id) {
        errors.push(
          `Candidate "${candidate.name}" has surveyId "${candidate.surveyId}" but the actual survey has id "${survey.id}"`,
        );
      }

      // Validate that survey candidateName matches candidate name
      if (survey.candidateName !== candidate.name) {
        warnings.push(
          `Survey candidate name "${survey.candidateName}" does not match candidate name "${candidate.name}" for candidate ${candidate.id}`,
        );
      }
    }
  });

  // Check: Every survey should have a corresponding candidate
  candidateSurveys.forEach((survey) => {
    const candidate = candidates.find((c) => c.id === survey.candidateId);

    if (!candidate) {
      errors.push(
        `Survey "${survey.title}" (${survey.id}) references non-existent candidate ID: ${survey.candidateId}`,
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get candidates without surveys
 * @returns Array of candidate IDs that don't have surveys
 */
export function getCandidatesWithoutSurveys(): string[] {
  return candidates
    .filter((candidate) => !getSurveyByCandidateId(candidate.id))
    .map((candidate) => candidate.id);
}

/**
 * Get surveys without candidates
 * @returns Array of survey IDs that don't have corresponding candidates
 */
export function getSurveysWithoutCandidates(): string[] {
  return candidateSurveys
    .filter((survey) => !candidates.find((c) => c.id === survey.candidateId))
    .map((survey) => survey.id);
}

/**
 * Get statistics about candidate-survey sync
 * @returns Object with sync statistics
 */
export function getCandidateSurveyStats() {
  const totalCandidates = candidates.length;
  const totalSurveys = candidateSurveys.length;
  const candidatesWithSurveys = candidates.filter((c) =>
    getSurveyByCandidateId(c.id),
  ).length;
  const candidatesWithoutSurveys = getCandidatesWithoutSurveys();
  const surveysWithoutCandidates = getSurveysWithoutCandidates();

  return {
    totalCandidates,
    totalSurveys,
    candidatesWithSurveys,
    candidatesWithoutSurveys: candidatesWithoutSurveys.length,
    candidatesWithoutSurveysList: candidatesWithoutSurveys,
    surveysWithoutCandidates: surveysWithoutCandidates.length,
    surveysWithoutCandidatesList: surveysWithoutCandidates,
    syncPercentage: (candidatesWithSurveys / totalCandidates) * 100,
  };
}

/**
 * Validates and logs results (useful for development/debugging)
 * Call this in development to check data integrity
 */
export function validateAndLog(): void {
  const result = validateCandidateSurveySync();
  const stats = getCandidateSurveyStats();

  console.group("📊 Candidate-Survey Data Validation");

  console.log("\nStatistics:");
  console.log(`  Total Candidates: ${stats.totalCandidates}`);
  console.log(`  Total Surveys: ${stats.totalSurveys}`);
  console.log(
    `  Candidates with Surveys: ${stats.candidatesWithSurveys} (${stats.syncPercentage.toFixed(1)}%)`,
  );

  if (stats.candidatesWithoutSurveys > 0) {
    console.log(
      `  ⚠️  Candidates without Surveys: ${stats.candidatesWithoutSurveys}`,
    );
    console.log(`     IDs: ${stats.candidatesWithoutSurveysList.join(", ")}`);
  }

  if (stats.surveysWithoutCandidates > 0) {
    console.log(
      `  ⚠️  Surveys without Candidates: ${stats.surveysWithoutCandidates}`,
    );
    console.log(`     IDs: ${stats.surveysWithoutCandidatesList.join(", ")}`);
  }

  if (result.errors.length > 0) {
    console.group("\n❌ Errors:");
    result.errors.forEach((error) => console.error(`  - ${error}`));
    console.groupEnd();
  }

  if (result.warnings.length > 0) {
    console.group("\n⚠️  Warnings:");
    result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
    console.groupEnd();
  }

  if (result.isValid && result.warnings.length === 0) {
    console.log("\n✅ All validation checks passed!");
  } else if (result.isValid) {
    console.log("\n✅ Validation passed with warnings");
  } else {
    console.log("\n❌ Validation failed");
  }

  console.groupEnd();
}

/**
 * Assert that candidate-survey data is valid
 * Throws an error if validation fails (useful in tests or strict mode)
 */
export function assertCandidateSurveySync(): void {
  const result = validateCandidateSurveySync();

  if (!result.isValid) {
    throw new Error(
      `Candidate-Survey sync validation failed:\n${result.errors.join("\n")}`,
    );
  }
}

/**
 * NIN Validation Result Type
 */
export type NINValidationResult = {
  isValid: boolean;
  error?: string;
  formattedNIN?: string;
};

/**
 * Validates Nigerian National Identification Number (NIN)
 *
 * Rules:
 * - Must be exactly 11 digits
 * - Must contain only numeric characters
 * - No spaces, dashes, or special characters
 *
 * @param nin - The NIN string to validate
 * @returns Validation result with error message if invalid
 *
 * @example
 * validateNIN("12345678901") // { isValid: true, formattedNIN: "12345678901" }
 * validateNIN("123456789") // { isValid: false, error: "NIN must be exactly 11 digits" }
 */
export function validateNIN(nin: string): NINValidationResult {
  // Remove any whitespace
  const trimmedNIN = nin.trim();

  // Check if empty
  if (!trimmedNIN) {
    return {
      isValid: false,
      error: "NIN is required",
    };
  }

  // Check if contains only digits
  if (!/^\d+$/.test(trimmedNIN)) {
    return {
      isValid: false,
      error: "NIN must contain only numbers",
    };
  }

  // Check length
  if (trimmedNIN.length !== 11) {
    return {
      isValid: false,
      error: `NIN must be exactly 11 digits (you entered ${trimmedNIN.length})`,
    };
  }

  // Check if it's not all the same digit (e.g., "11111111111")
  if (/^(\d)\1{10}$/.test(trimmedNIN)) {
    return {
      isValid: false,
      error: "NIN cannot be all the same digit",
    };
  }

  // Check if it's not a sequential pattern (e.g., "12345678901")
  if (trimmedNIN === "12345678901" || trimmedNIN === "01234567890") {
    return {
      isValid: false,
      error: "Please enter a valid NIN (sequential patterns not allowed)",
    };
  }

  return {
    isValid: true,
    formattedNIN: trimmedNIN,
  };
}

/**
 * Quick check if NIN is valid (returns boolean only)
 * @param nin - The NIN string to validate
 * @returns true if valid, false otherwise
 */
export function isValidNIN(nin: string): boolean {
  return validateNIN(nin).isValid;
}

/**
 * Formats NIN for display (adds spaces for readability)
 * @param nin - The NIN string to format
 * @returns Formatted NIN (e.g., "123 4567 8901")
 *
 * @example
 * formatNINForDisplay("12345678901") // "123 4567 8901"
 */
export function formatNINForDisplay(nin: string): string {
  if (!nin || nin.length !== 11) return nin;
  return `${nin.slice(0, 3)} ${nin.slice(3, 7)} ${nin.slice(7)}`;
}

/**
 * Masks NIN for privacy (shows only last 4 digits)
 * @param nin - The NIN string to mask
 * @returns Masked NIN (e.g., "*******8901")
 *
 * @example
 * maskNIN("12345678901") // "*******8901"
 */
export function maskNIN(nin: string): string {
  if (!nin || nin.length !== 11) return nin;
  return `*******${nin.slice(-4)}`;
}
