// Types for voter registration flow
export type { Voter } from "@/types/voter";
// Types for candidate data
export type { Candidate } from "@/types/candidate";

// Types for candidate survey data
export type {
  CandidateSurvey,
  SurveyOption,
  SurveyQuestion,
  SurveyTemplate,
  SurveyStatus,
  SurveyBuilderStep,
  SurveyBuilderState,
} from "@/types/survey";

// Types for survey builder components
export type {
  StepBasicInfoProps,
  StepQuestionsProps,
  StepReviewProps,
  QuestionEditorProps,
  TemplateCardProps,
  QuestionTypeIconProps,
  SurveyWizardProps,
  SurveyPayload,
  UpdateSurveyPayload,
} from "@/types/survey-builder";

// Types for location data
export type {
  LocationState,
  LocationLGA,
  LocationWard,
  LocationPollingUnit,
} from "@/types/location";

// Types for registration data
export type { RegistrationData } from "@/types/registration";
