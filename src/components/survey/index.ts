/**
 * Survey Components Index
 *
 * Centralized exports for survey-related components
 */

// Question Input Components (for taking surveys)
export {
  QuestionInput,
  SingleChoiceInput,
  MultipleChoiceInput,
  ScaleInput,
  TextInput,
  RankingInput,
  type QuestionInputProps,
} from "@/components/survey/question-inputs";

// Question Display Components (for preview/review)
export {
  QuestionDisplay,
  QuestionsList,
  type QuestionDisplayProps,
} from "@/components/survey/question-display";
