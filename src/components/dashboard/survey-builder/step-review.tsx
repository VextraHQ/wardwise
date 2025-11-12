"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionsList } from "@/components/survey/question-display";
import type { StepReviewProps } from "@/types/survey-builder";
import { IconClipboardList, IconClock, IconEdit } from "@tabler/icons-react";

export function StepReview({
  title,
  description,
  estimatedMinutes,
  questions,
  onEditStep,
}: StepReviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Review Your Survey</h3>
        <p className="text-muted-foreground text-sm">
          Preview how your survey will appear to voters. Make sure everything
          looks good before publishing.
        </p>
      </div>

      {/* Survey Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="mt-2">{description}</CardDescription>
              <div className="text-muted-foreground mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <IconClipboardList className="size-4" />
                  <span>{questions.length} questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconClock className="size-4" />
                  <span>{estimatedMinutes} min estimated</span>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => onEditStep("info")}>
              <IconEdit className="mr-2 size-4" />
              Edit Info
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Questions Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold">Questions Preview</h4>
          <Button variant="outline" onClick={() => onEditStep("questions")}>
            <IconEdit className="mr-2 size-4" />
            Edit Questions
          </Button>
        </div>

        <QuestionsList questions={questions} showIndex={true} showType={true} />
      </div>
    </div>
  );
}
