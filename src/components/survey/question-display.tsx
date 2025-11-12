/**
 * Survey Question Display Components
 *
 * Components for displaying survey questions in preview/review mode
 */

"use client";

import type { SurveyQuestion } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuestionTypeIcon } from "@/components/candidate-dashboard/survey-builder/question-type-icon";
import { cn } from "@/lib/utils";

export interface QuestionDisplayProps {
  question: SurveyQuestion;
  index?: number;
  showIndex?: boolean;
  showType?: boolean;
  className?: string;
}

/**
 * Display a survey question in preview/review mode
 */
export function QuestionDisplay({
  question,
  index,
  showIndex = true,
  showType = true,
  className,
}: QuestionDisplayProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-start gap-3">
          {showIndex && index !== undefined && (
            <div className="bg-muted flex size-8 items-center justify-center rounded text-sm font-semibold">
              {index + 1}
            </div>
          )}
          <div className="flex-1">
            {showType && (
              <div className="mb-2 flex items-center gap-2">
                <QuestionTypeIcon type={question.type} />
                <Badge variant="outline">{question.type}</Badge>
              </div>
            )}
            <CardTitle className="text-base">{question.question}</CardTitle>
            {question.description && (
              <CardDescription className="mt-1">
                {question.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {question.options && question.options.length > 0 && (
          <div className="space-y-2">
            {question.options.map((option) => (
              <div
                key={option.id}
                className="text-muted-foreground flex items-center gap-2 text-sm"
              >
                <span>•</span>
                <span>{option.label}</span>
                {option.allowOther && (
                  <Badge variant="outline" className="text-xs">
                    Other option available
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
        {question.type === "scale" && (
          <div className="text-muted-foreground text-sm">
            Scale: {question.minLabel || "1"} to {question.maxLabel || "5"}
          </div>
        )}
        {question.type === "text" && (
          <div className="text-muted-foreground text-sm italic">
            Text response field
          </div>
        )}
        {question.type === "ranking" && (
          <div className="text-muted-foreground text-sm italic">
            Ranking question (drag to reorder)
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Display multiple questions in a list
 */
export function QuestionsList({
  questions,
  showIndex = true,
  showType = true,
  className,
}: {
  questions: SurveyQuestion[];
  showIndex?: boolean;
  showType?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {questions.map((question, index) => (
        <QuestionDisplay
          key={question.id}
          question={question}
          index={index}
          showIndex={showIndex}
          showType={showType}
        />
      ))}
    </div>
  );
}
