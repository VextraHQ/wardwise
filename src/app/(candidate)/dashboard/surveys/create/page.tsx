"use client";

import { SurveyWizard } from "@/components/candidate-dashboard/survey-builder/survey-wizard";

export default function SurveysCreatePage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <SurveyWizard isEditMode={false} />
    </div>
  );
}
