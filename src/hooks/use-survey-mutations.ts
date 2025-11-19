/**
 * Survey Mutation Hooks
 *
 * React Query hooks for survey CRUD operations
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { surveyApi } from "@/lib/api/survey";
import { toast } from "sonner";
import type {
  SurveyPayload,
  UpdateSurveyPayload,
} from "@/types/survey-builder";

function useCandidateId() {
  const { data: session } = useSession();
  return session?.user?.candidateId || null;
}

export function useCreateSurvey() {
  const queryClient = useQueryClient();
  const candidateId = useCandidateId();

  return useMutation({
    mutationFn: async (surveyData: SurveyPayload) => {
      if (!candidateId) throw new Error("No candidate ID");
      const result = await surveyApi.createCandidateSurvey(candidateId, {
        ...surveyData,
        questions: surveyData.questions.map((q) => ({
          id:
            q.id ||
            `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: q.type,
          question: q.question,
          description: q.description,
          options: q.options?.map((opt) => ({
            id: opt.id,
            label: opt.label,
            allowOther: opt.allowOther,
          })),
          minLabel: q.minLabel,
          maxLabel: q.maxLabel,
        })),
      });
      return result.survey;
    },
    onSuccess: (_survey) => {
      queryClient.invalidateQueries({
        queryKey: ["candidate-survey", candidateId],
      });
      queryClient.invalidateQueries({
        queryKey: ["candidate-survey-responses", candidateId],
      });
      toast.success("Survey created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create survey");
    },
  });
}

export function useUpdateSurvey() {
  const queryClient = useQueryClient();
  const candidateId = useCandidateId();

  return useMutation({
    mutationFn: async ({ surveyId, surveyData }: UpdateSurveyPayload) => {
      const result = await surveyApi.updateCandidateSurvey(surveyId, {
        ...surveyData,
        questions: surveyData.questions.map((q) => ({
          id:
            q.id ||
            `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: q.type,
          question: q.question,
          description: q.description,
          options: q.options?.map((opt) => ({
            id: opt.id,
            label: opt.label,
            allowOther: opt.allowOther,
          })),
          minLabel: q.minLabel,
          maxLabel: q.maxLabel,
        })),
      });
      return result.survey;
    },
    onSuccess: (_survey) => {
      queryClient.invalidateQueries({
        queryKey: ["candidate-survey", candidateId],
      });
      queryClient.invalidateQueries({
        queryKey: ["candidate-survey-responses", candidateId],
      });
      toast.success("Survey updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update survey");
    },
  });
}

export function usePublishSurvey() {
  const queryClient = useQueryClient();
  const candidateId = useCandidateId();

  return useMutation({
    mutationFn: async (surveyId: string) => {
      const result = await surveyApi.publishCandidateSurvey(surveyId);
      return result.survey;
    },
    onSuccess: (_survey) => {
      queryClient.invalidateQueries({
        queryKey: ["candidate-survey", candidateId],
      });
      queryClient.invalidateQueries({
        queryKey: ["candidate-survey-responses", candidateId],
      });
      toast.success("Survey published successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to publish survey");
    },
  });
}

export function useSaveDraft() {
  const queryClient = useQueryClient();
  const candidateId = useCandidateId();

  return useMutation({
    mutationFn: async (surveyData: SurveyPayload) => {
      if (!candidateId) throw new Error("No candidate ID");
      const result = await surveyApi.saveSurveyDraft(candidateId, {
        ...surveyData,
        questions: surveyData.questions.map((q) => ({
          id:
            q.id ||
            `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: q.type,
          question: q.question,
          description: q.description,
          options: q.options?.map((opt) => ({
            id: opt.id,
            label: opt.label,
            allowOther: opt.allowOther,
          })),
          minLabel: q.minLabel,
          maxLabel: q.maxLabel,
        })),
      });
      return result.survey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["candidate-survey", candidateId],
      });
      // Silent success for auto-save
    },
    onError: () => {
      // Silent error for auto-save
    },
  });
}
