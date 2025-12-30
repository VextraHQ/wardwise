/**
 * Survey API Client
 *
 * Handles all survey CRUD operations: create, update, publish, and auto-save drafts.
 * Used by candidates to manage their voter surveys.
 *
 * MOCK vs PRODUCTION:
 * - Mock: Stores surveys in-memory array (candidateSurveys)
 * - Mock: Auto-save creates or updates draft surveys
 * - Production: Replace with real API endpoints that persist to database
 *
 * TRANSITION TO PRODUCTION:
 * 1. Update apiCall() endpoints to match your backend
 * 2. Remove in-memory array operations
 * 3. Backend should handle draft management and publishing
 */

import type { CandidateSurvey, SurveyQuestion } from "@/types/survey";
import { getCandidateByIdWithSupporters } from "@/lib/helpers/candidate-helpers";

// Simple helper for API calls (for real API)
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `API error: ${response.statusText}`);
  }

  return response.json();
}

// Mock mode: true if explicitly set, or default to mock in development
// Production mode: false if explicitly set, or default in production
const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK_API === "true" ||
  (!process.env.NEXT_PUBLIC_USE_MOCK_API &&
    process.env.NODE_ENV === "development");

export const surveyApi = {
  createCandidateSurvey: async (
    candidateId: string,
    surveyData: {
      title: string;
      description: string;
      estimatedMinutes: number;
      questions: Array<{
        id: string;
        type: "single" | "multiple" | "ranking" | "scale" | "text";
        question: string;
        description?: string;
        options?: Array<{
          id: string;
          label: string;
          allowOther?: boolean;
        }>;
        minLabel?: string;
        maxLabel?: string;
      }>;
    },
  ): Promise<{ survey: CandidateSurvey }> => {
    if (USE_MOCK) {
      // MOCK: Creates a new survey draft in memory
      console.log(`📝 Mock: Creating survey for candidate ${candidateId}`);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const { candidateSurveys } =
        await import("@/lib/mock/data/candidate-surveys");

      const candidate = getCandidateByIdWithSupporters(candidateId);
      if (!candidate) {
        throw new Error("Candidate not found");
      }

      const surveyId = `survey-${candidateId}-${Date.now()}`;
      const newSurvey: CandidateSurvey = {
        id: surveyId,
        candidateId,
        candidateName: candidate.name,
        title: surveyData.title,
        description: surveyData.description,
        questions: surveyData.questions as CandidateSurvey["questions"],
        estimatedMinutes: surveyData.estimatedMinutes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "draft",
        totalResponses: 0,
      };

      candidateSurveys.push(newSurvey);
      return { survey: newSurvey };
    }

    // PRODUCTION: Replace with real API call
    return apiCall(`/candidates/${candidateId}/surveys`, {
      method: "POST",
      body: JSON.stringify(surveyData),
    });
  },

  updateCandidateSurvey: async (
    surveyId: string,
    surveyData: {
      title: string;
      description: string;
      estimatedMinutes: number;
      questions: Array<{
        id: string;
        type: SurveyQuestion["type"];
        question: string;
        description?: string;
        options?: Array<{
          id: string;
          label: string;
          allowOther?: boolean;
        }>;
        minLabel?: string;
        maxLabel?: string;
      }>;
    },
  ): Promise<{ survey: CandidateSurvey }> => {
    if (USE_MOCK) {
      // MOCK: Updates survey in memory
      console.log(`📝 Mock: Updating survey ${surveyId}`);
      await new Promise((resolve) => setTimeout(resolve, 600));

      const { candidateSurveys, getSurveyById } =
        await import("@/lib/mock/data/candidate-surveys");

      const existingSurvey = getSurveyById(surveyId);
      if (!existingSurvey) {
        throw new Error("Survey not found");
      }

      const updatedSurvey: CandidateSurvey = {
        ...existingSurvey,
        title: surveyData.title,
        description: surveyData.description,
        questions: surveyData.questions as CandidateSurvey["questions"],
        estimatedMinutes: surveyData.estimatedMinutes,
        updatedAt: new Date().toISOString(),
      };

      const index = candidateSurveys.findIndex((s) => s.id === surveyId);
      if (index !== -1) {
        candidateSurveys[index] = updatedSurvey;
      }

      return { survey: updatedSurvey };
    }

    // PRODUCTION: Replace with real API call
    return apiCall(`/surveys/${surveyId}`, {
      method: "PUT",
      body: JSON.stringify(surveyData),
    });
  },

  publishCandidateSurvey: async (
    surveyId: string,
  ): Promise<{ survey: CandidateSurvey }> => {
    if (USE_MOCK) {
      // MOCK: Changes survey status from draft to published
      console.log(`📢 Mock: Publishing survey ${surveyId}`);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const { candidateSurveys, getSurveyById } =
        await import("@/lib/mock/data/candidate-surveys");

      const survey = getSurveyById(surveyId);
      if (!survey) {
        throw new Error("Survey not found");
      }

      const publishedSurvey: CandidateSurvey = {
        ...survey,
        status: "published",
        updatedAt: new Date().toISOString(),
      };

      const index = candidateSurveys.findIndex((s) => s.id === surveyId);
      if (index !== -1) {
        candidateSurveys[index] = publishedSurvey;
      }

      return { survey: publishedSurvey };
    }

    // PRODUCTION: Replace with real API call
    return apiCall(`/surveys/${surveyId}/publish`, {
      method: "POST",
    });
  },

  saveSurveyDraft: async (
    candidateId: string,
    surveyData: {
      title: string;
      description: string;
      estimatedMinutes: number;
      questions: Array<{
        id: string;
        type: SurveyQuestion["type"];
        question: string;
        description?: string;
        options?: Array<{
          id: string;
          label: string;
          allowOther?: boolean;
        }>;
        minLabel?: string;
        maxLabel?: string;
      }>;
    },
  ): Promise<{ survey: CandidateSurvey }> => {
    if (USE_MOCK) {
      // MOCK: Auto-saves survey draft (creates or updates existing draft)
      console.log(
        `💾 Mock: Auto-saving survey draft for candidate ${candidateId}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 300));

      const { candidateSurveys, getSurveyByCandidateId } =
        await import("@/lib/mock/data/candidate-surveys");

      const candidate = getCandidateByIdWithSupporters(candidateId);
      if (!candidate) {
        throw new Error("Candidate not found");
      }

      // Check if draft exists
      const existingDraft = getSurveyByCandidateId(candidateId);
      if (existingDraft && existingDraft.status === "draft") {
        // Update existing draft
        const updatedSurvey: CandidateSurvey = {
          ...existingDraft,
          title: surveyData.title,
          description: surveyData.description,
          questions: surveyData.questions as CandidateSurvey["questions"],
          estimatedMinutes: surveyData.estimatedMinutes,
          updatedAt: new Date().toISOString(),
        };

        const index = candidateSurveys.findIndex(
          (s) => s.id === existingDraft.id,
        );
        if (index !== -1) {
          candidateSurveys[index] = updatedSurvey;
        }

        return { survey: updatedSurvey };
      }

      // Create new draft
      const surveyId = `survey-${candidateId}-${Date.now()}`;
      const newDraft: CandidateSurvey = {
        id: surveyId,
        candidateId,
        candidateName: candidate.name,
        title: surveyData.title,
        description: surveyData.description,
        questions: surveyData.questions as CandidateSurvey["questions"],
        estimatedMinutes: surveyData.estimatedMinutes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "draft",
        totalResponses: 0,
      };

      candidateSurveys.push(newDraft);
      return { survey: newDraft };
    }

    // PRODUCTION: Replace with real API call
    return apiCall(`/candidates/${candidateId}/surveys/draft`, {
      method: "POST",
      body: JSON.stringify(surveyData),
    });
  },
};
