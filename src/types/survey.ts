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
};
