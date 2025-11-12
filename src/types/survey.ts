import type { Candidate } from "@/types/candidate";

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

// Survey status
export type SurveyStatus = "draft" | "published" | "archived";

// Candidate survey
export type CandidateSurvey = {
  id: string;
  candidateId: string;
  candidateName: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  createdAt: string; // ISO datetime string
  updatedAt?: string; // ISO datetime string
  estimatedMinutes?: number; // Estimated time to complete
  totalResponses?: number; // Total completed responses for social proof
  status?: SurveyStatus; // Survey status (defaults to "published" for existing surveys)
};

// Survey template metadata
export type SurveyTemplate = {
  id: string;
  name: string;
  description: string;
  position: Candidate["position"] | "All";
  focusArea: string;
  estimatedMinutes: number;
  questionCount: number;
  preview: {
    title: string;
    description: string;
    sampleQuestions: Array<{
      type: SurveyQuestion["type"];
      question: string;
    }>;
  };
  questions: SurveyQuestion[];
};

// Survey builder state types
export type SurveyBuilderStep = "info" | "questions" | "review";

export type SurveyBuilderState = {
  step: SurveyBuilderStep;
  survey: {
    title: string;
    description: string;
    estimatedMinutes: number;
    questions: SurveyQuestion[];
  };
  selectedTemplateId?: string;
  isDirty: boolean;
  lastSaved?: string;
};
