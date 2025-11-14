import type {
  SurveyQuestion,
  SurveyTemplate,
  SurveyBuilderStep,
} from "@/types/survey";

// Props for StepBasicInfo component
export interface StepBasicInfoProps {
  title: string;
  description: string;
  estimatedMinutes: number;
  selectedTemplateId?: string;
  onUpdate: (updates: {
    title?: string;
    description?: string;
    estimatedMinutes?: number;
  }) => void;
  onTemplateSelect: (template: SurveyTemplate) => void;
}

// Props for StepQuestions component
export interface StepQuestionsProps {
  questions: SurveyQuestion[];
  onAddQuestion: (question: SurveyQuestion) => void;
  onUpdateQuestion: (questionId: string, question: SurveyQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDuplicateQuestion: (questionId: string) => void;
  onReorderQuestions?: (fromIndex: number, toIndex: number) => void;
  minQuestions: number;
  maxQuestions: number;
}

// Props for StepReview component
export interface StepReviewProps {
  title: string;
  description: string;
  estimatedMinutes: number;
  questions: SurveyQuestion[];
  onEditStep: (step: SurveyBuilderStep) => void;
}

// Props for QuestionEditor component
export interface QuestionEditorProps {
  question?: SurveyQuestion;
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: SurveyQuestion) => void;
}

// Props for TemplateCard component
export interface TemplateCardProps {
  template: SurveyTemplate;
  onSelect: (template: SurveyTemplate) => void;
  isSelected?: boolean;
}

// Props for QuestionTypeIcon component
export interface QuestionTypeIconProps {
  type: SurveyQuestion["type"];
  className?: string;
}

// Props for SurveyWizard component
export interface SurveyWizardProps {
  initialSurvey?: {
    id?: string;
    title: string;
    description: string;
    estimatedMinutes: number;
    questions: SurveyQuestion[];
  };
  isEditMode?: boolean;
}

// Survey payload for API calls
export interface SurveyPayload {
  title: string;
  description: string;
  estimatedMinutes: number;
  questions: Array<
    Omit<SurveyQuestion, "id" | "responseStats"> & { id?: string }
  >;
}

// Update survey mutation payload
export interface UpdateSurveyPayload {
  surveyId: string;
  surveyData: SurveyPayload;
}
