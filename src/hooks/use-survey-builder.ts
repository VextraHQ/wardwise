/**
 * Survey Builder Hook
 *
 * Custom hook to manage survey creation state and operations.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  SurveyQuestion,
  SurveyBuilderStep,
  SurveyBuilderState,
  SurveyTemplate,
} from "@/types/survey";

const MIN_QUESTIONS = 3;
const MAX_QUESTIONS = 15;

export function useSurveyBuilder(initialSurvey?: {
  title: string;
  description: string;
  estimatedMinutes: number;
  questions: SurveyQuestion[];
}) {
  const [state, setState] = useState<SurveyBuilderState>({
    step: "info",
    survey: initialSurvey || {
      title: "",
      description: "",
      estimatedMinutes: 5,
      questions: [],
    },
    isDirty: false,
  });

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Apply template to survey
  const applyTemplate = useCallback((template: SurveyTemplate) => {
    setState((prev) => ({
      ...prev,
      survey: {
        title: template.preview.title,
        description: template.preview.description,
        estimatedMinutes: template.estimatedMinutes,
        questions: template.questions.map((q) => ({
          ...q,
          id: `q${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        })),
      },
      selectedTemplateId: template.id,
      isDirty: true,
    }));
  }, []);

  // Navigate to step
  const goToStep = useCallback((step: SurveyBuilderStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  // Update basic info
  const updateBasicInfo = useCallback(
    (updates: {
      title?: string;
      description?: string;
      estimatedMinutes?: number;
    }) => {
      setState((prev) => ({
        ...prev,
        survey: {
          ...prev.survey,
          ...updates,
        },
        isDirty: true,
      }));
    },
    [],
  );

  // Add question
  const addQuestion = useCallback((question: SurveyQuestion) => {
    setState((prev) => ({
      ...prev,
      survey: {
        ...prev.survey,
        questions: [...prev.survey.questions, question],
      },
      isDirty: true,
    }));
  }, []);

  // Update question
  const updateQuestion = useCallback(
    (questionId: string, updates: Partial<SurveyQuestion>) => {
      setState((prev) => ({
        ...prev,
        survey: {
          ...prev.survey,
          questions: prev.survey.questions.map((q) =>
            q.id === questionId ? { ...q, ...updates } : q,
          ),
        },
        isDirty: true,
      }));
    },
    [],
  );

  // Delete question
  const deleteQuestion = useCallback((questionId: string) => {
    setState((prev) => ({
      ...prev,
      survey: {
        ...prev.survey,
        questions: prev.survey.questions.filter((q) => q.id !== questionId),
      },
      isDirty: true,
    }));
  }, []);

  // Duplicate question
  const duplicateQuestion = useCallback((questionId: string) => {
    setState((prev) => {
      const question = prev.survey.questions.find((q) => q.id === questionId);
      if (!question) return prev;

      const newQuestion: SurveyQuestion = {
        ...question,
        id: `q${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        question: `${question.question} (Copy)`,
        options: question.options?.map((opt) => ({
          ...opt,
          id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        })),
      };

      const questionIndex = prev.survey.questions.findIndex(
        (q) => q.id === questionId,
      );
      const newQuestions = [...prev.survey.questions];
      newQuestions.splice(questionIndex + 1, 0, newQuestion);

      return {
        ...prev,
        survey: {
          ...prev.survey,
          questions: newQuestions,
        },
        isDirty: true,
      };
    });
  }, []);

  // Reorder questions
  const reorderQuestions = useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      const newQuestions = [...prev.survey.questions];
      const [removed] = newQuestions.splice(fromIndex, 1);
      newQuestions.splice(toIndex, 0, removed);

      return {
        ...prev,
        survey: {
          ...prev.survey,
          questions: newQuestions,
        },
        isDirty: true,
      };
    });
  }, []);

  // Validation
  const validateStep = useCallback(
    (step: SurveyBuilderStep): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (step === "info") {
        if (!state.survey.title.trim()) {
          errors.push("Survey title is required");
        }
        if (state.survey.title.length > 200) {
          errors.push("Survey title must be 200 characters or less");
        }
        if (!state.survey.description.trim()) {
          errors.push("Survey description is required");
        }
        if (state.survey.description.length < 20) {
          errors.push("Survey description must be at least 20 characters");
        }
        if (
          state.survey.estimatedMinutes < 1 ||
          state.survey.estimatedMinutes > 30
        ) {
          errors.push("Estimated minutes must be between 1 and 30");
        }
      }

      if (step === "questions") {
        if (state.survey.questions.length < MIN_QUESTIONS) {
          errors.push(`At least ${MIN_QUESTIONS} questions are required`);
        }
        if (state.survey.questions.length > MAX_QUESTIONS) {
          errors.push(`Maximum ${MAX_QUESTIONS} questions allowed`);
        }

        state.survey.questions.forEach((q, index) => {
          if (!q.question.trim()) {
            errors.push(`Question ${index + 1} is missing text`);
          }
          if (
            (q.type === "single" || q.type === "multiple") &&
            (!q.options || q.options.length < 2)
          ) {
            errors.push(`Question ${index + 1} must have at least 2 options`);
          }
          if (q.type === "text" && q.question.length > 500) {
            errors.push(
              `Question ${index + 1} text is too long (max 500 characters)`,
            );
          }
        });
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
    [state.survey],
  );

  // Mark as saved
  const markAsSaved = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDirty: false,
      lastSaved: new Date().toISOString(),
    }));
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setState({
      step: "info",
      survey: {
        title: "",
        description: "",
        estimatedMinutes: 5,
        questions: [],
      },
      isDirty: false,
    });
  }, []);

  // Auto-save effect (for future implementation)
  useEffect(() => {
    if (state.isDirty && state.step !== "review") {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        // Auto-save logic would go here
        // For now, just clear the timeout
      }, 30000); // 30 seconds
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [state.isDirty, state.step]);

  return {
    state,
    goToStep,
    applyTemplate,
    updateBasicInfo,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    reorderQuestions,
    validateStep,
    markAsSaved,
    reset,
    MIN_QUESTIONS,
    MAX_QUESTIONS,
  };
}
