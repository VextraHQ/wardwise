"use client";

import { SurveyWizard } from "@/components/candidate-dashboard/survey-builder/survey-wizard";

export default function SurveysCreatePage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create Survey
          </h1>
          <p className="text-muted-foreground text-sm">
            Create a new survey to collect feedback from your supporters
          </p>
        </div>
      </div>
      <SurveyWizard isEditMode={false} />
    </div>
  );
}
