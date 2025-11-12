/**
 * Edit Survey Page
 *
 * Page for editing an existing survey
 */

"use client";

import { useParams } from "next/navigation";
import { useSurveyById } from "@/hooks/use-candidate-dashboard";
import { SurveyWizard } from "@/components/candidate-dashboard/survey-builder";
import { Skeleton } from "@/components/ui/skeleton";

export default function SurveysEditPage() {
  const params = useParams();
  const surveyId = params.surveyId as string;

  const { data: survey, isLoading } = useSurveyById(surveyId);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Survey Not Found
          </h1>
          <p className="text-muted-foreground text-sm">
            The survey you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <SurveyWizard
        initialSurvey={{
          id: survey.id,
          title: survey.title,
          description: survey.description,
          estimatedMinutes: survey.estimatedMinutes || 5,
          questions: survey.questions,
        }}
        isEditMode={true}
      />
    </div>
  );
}
