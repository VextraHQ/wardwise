"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepProgress } from "@/components/ui/step-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSurveyBuilder } from "@/hooks/use-survey-builder";
import {
  StepBasicInfo,
  StepQuestions,
  StepReview,
  ValidationErrors,
} from "@/components/dashboard/survey-builder";
import {
  useCreateSurvey,
  useUpdateSurvey,
  usePublishSurvey,
  useSaveDraft,
} from "@/hooks/use-survey-mutations";
import {
  IconArrowLeft,
  IconArrowRight,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { SurveyWizardProps } from "@/types/survey-builder";
import type { SurveyTemplate } from "@/types";

const STEP_TITLES = {
  info: "Basic Information",
  questions: "Add Questions",
  review: "Review & Publish",
};

export function SurveyWizard({
  initialSurvey,
  isEditMode = false,
}: SurveyWizardProps) {
  const router = useRouter();
  const builder = useSurveyBuilder(initialSurvey);
  const createSurvey = useCreateSurvey();
  const updateSurvey = useUpdateSurvey();
  const publishSurvey = usePublishSurvey();
  const saveDraft = useSaveDraft();

  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    state,
    goToStep,
    applyTemplate,
    updateBasicInfo,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    validateStep,
    markAsSaved,
  } = builder;

  const currentStepIndex =
    state.step === "info" ? 1 : state.step === "questions" ? 2 : 3;
  const totalSteps = 3;

  const handleNext = () => {
    const validation = validateStep(state.step);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }
    setValidationErrors([]);

    if (state.step === "info") {
      goToStep("questions");
    } else if (state.step === "questions") {
      goToStep("review");
    }
  };

  const handleBack = () => {
    if (state.step === "questions") {
      goToStep("info");
    } else if (state.step === "review") {
      goToStep("questions");
    }
  };

  const handleSaveDraft = async () => {
    await saveDraft.mutateAsync({
      title: state.survey.title,
      description: state.survey.description,
      estimatedMinutes: state.survey.estimatedMinutes,
      questions: state.survey.questions,
    });
    markAsSaved();
  };

  const handlePublish = async () => {
    if (isEditMode && initialSurvey?.id) {
      await updateSurvey.mutateAsync({
        surveyId: initialSurvey.id,
        surveyData: {
          title: state.survey.title,
          description: state.survey.description,
          estimatedMinutes: state.survey.estimatedMinutes,
          questions: state.survey.questions,
        },
      });
      await publishSurvey.mutateAsync(initialSurvey.id);
    } else {
      const result = await createSurvey.mutateAsync({
        title: state.survey.title,
        description: state.survey.description,
        estimatedMinutes: state.survey.estimatedMinutes,
        questions: state.survey.questions,
      });
      await publishSurvey.mutateAsync(result.id);
    }
    router.push("/dashboard/surveys");
  };

  const handleExit = () => {
    if (state.isDirty) {
      setPendingAction(() => () => {
        router.push("/dashboard/surveys");
      });
      setShowExitDialog(true);
    } else {
      router.push("/dashboard/surveys");
    }
  };

  const handleTemplateSelect = (template: SurveyTemplate) => {
    applyTemplate(template);
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEditMode ? "Edit Survey" : "Create Survey"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isEditMode
                ? "Update your survey questions and settings"
                : "Build a survey to collect feedback from your supporters"}
            </p>
          </div>
          <Button variant="outline" onClick={handleExit}>
            Exit
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <StepProgress
              currentStep={currentStepIndex}
              totalSteps={totalSteps}
              stepTitle={STEP_TITLES[state.step]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <ValidationErrors errors={validationErrors} />
            {state.step === "info" && (
              <StepBasicInfo
                title={state.survey.title}
                description={state.survey.description}
                estimatedMinutes={state.survey.estimatedMinutes}
                selectedTemplateId={state.selectedTemplateId}
                onUpdate={updateBasicInfo}
                onTemplateSelect={handleTemplateSelect}
              />
            )}

            {state.step === "questions" && (
              <StepQuestions
                questions={state.survey.questions}
                onAddQuestion={addQuestion}
                onUpdateQuestion={updateQuestion}
                onDeleteQuestion={deleteQuestion}
                onDuplicateQuestion={duplicateQuestion}
                minQuestions={builder.MIN_QUESTIONS}
                maxQuestions={builder.MAX_QUESTIONS}
              />
            )}

            {state.step === "review" && (
              <StepReview
                title={state.survey.title}
                description={state.survey.description}
                estimatedMinutes={state.survey.estimatedMinutes}
                questions={state.survey.questions}
                onEditStep={goToStep}
              />
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {state.isDirty && (
              <>
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={saveDraft.isPending}
                >
                  <IconDeviceFloppy className="mr-2 size-4" />
                  Save Draft
                </Button>
                {state.lastSaved && (
                  <span className="text-muted-foreground text-xs">
                    Saved {new Date(state.lastSaved).toLocaleTimeString()}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStepIndex > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <IconArrowLeft className="mr-2 size-4" />
                Back
              </Button>
            )}
            {currentStepIndex < totalSteps ? (
              <Button onClick={handleNext}>
                Next
                <IconArrowRight className="ml-2 size-4" />
              </Button>
            ) : (
              <Button
                onClick={handlePublish}
                disabled={
                  createSurvey.isPending ||
                  updateSurvey.isPending ||
                  publishSurvey.isPending
                }
              >
                {isEditMode ? "Update & Publish" : "Publish Survey"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to exit? Your
              progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingAction) {
                  pendingAction();
                }
                setShowExitDialog(false);
              }}
            >
              Exit Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
