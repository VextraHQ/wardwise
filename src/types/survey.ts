/**
 * Survey Types
 *
 * Types for candidate surveys and survey questions.
 */

// Survey question option
export type SurveyOption = {
  id: string;
  label: string;
  icon?: string;
  allowOther?: boolean; // If true, shows "Other (please specify)" with text input
};

// Survey question types
export type SurveyQuestion = {
  id: string;
  type: "single" | "multiple" | "ranking" | "scale" | "text";
  question: string;
  description?: string;
  icon?: string;
  options?: SurveyOption[];
  minLabel?: string; // For scale questions
  maxLabel?: string;
  responseStats?: {
    // Anonymized response statistics for social proof
    totalResponses: number;
    topAnswer?: { label: string; percentage: number };
  };
};

// Candidate survey
export type CandidateSurvey = {
  id: string;
  candidateId: string;
  candidateName: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  createdAt: string; // ISO datetime string
  estimatedMinutes?: number; // Estimated time to complete
  totalResponses?: number; // Total completed responses for social proof
};
