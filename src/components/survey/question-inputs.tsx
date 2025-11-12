/**
 * Shared Survey Question Input Components
 *
 * Reusable components for rendering survey questions that can be used
 * in both voter survey taking and candidate survey building/preview
 */

"use client";

import type { SurveyQuestion, SurveyOption } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuestionTypeIcon } from "@/components/dashboard/survey-builder/question-type-icon";
import { cn } from "@/lib/utils";

/**
 * Props for question input components
 */
export interface QuestionInputProps {
  question: SurveyQuestion;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
  showTypeIcon?: boolean;
  className?: string;
}

/**
 * Single Choice Question Input
 */
export function SingleChoiceInput({
  question,
  value,
  onChange,
  disabled = false,
  showTypeIcon = false,
  className,
}: QuestionInputProps) {
  if (!question.options || question.options.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">
        No options available for this question
      </div>
    );
  }

  const selectedValue = typeof value === "string" ? value : undefined;

  return (
    <div className={cn("space-y-3", className)}>
      {showTypeIcon && (
        <div className="flex items-center gap-2">
          <QuestionTypeIcon type="single" />
          <span className="text-muted-foreground text-xs">Single Choice</span>
        </div>
      )}
      <RadioGroup
        value={selectedValue}
        onValueChange={(newValue) => onChange(newValue)}
        disabled={disabled}
      >
        {question.options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={option.id} id={option.id} />
            <Label htmlFor={option.id} className="cursor-pointer">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

/**
 * Multiple Choice Question Input
 */
export function MultipleChoiceInput({
  question,
  value,
  onChange,
  disabled = false,
  showTypeIcon = false,
  className,
}: QuestionInputProps) {
  if (!question.options || question.options.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">
        No options available for this question
      </div>
    );
  }

  const selectedValues = Array.isArray(value) ? value : [];

  const handleToggle = (optionId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, optionId]);
    } else {
      onChange(selectedValues.filter((id) => id !== optionId));
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {showTypeIcon && (
        <div className="flex items-center gap-2">
          <QuestionTypeIcon type="multiple" />
          <span className="text-muted-foreground text-xs">Multiple Choice</span>
        </div>
      )}
      <div className="space-y-2">
        {question.options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={option.id}
              checked={selectedValues.includes(option.id)}
              onCheckedChange={(checked) =>
                handleToggle(option.id, checked === true)
              }
              disabled={disabled}
            />
            <Label htmlFor={option.id} className="cursor-pointer">
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Scale Question Input (1-5)
 */
export function ScaleInput({
  question,
  value,
  onChange,
  disabled = false,
  showTypeIcon = false,
  className,
}: QuestionInputProps) {
  const scaleValue = typeof value === "string" ? value : "";
  const minLabel = question.minLabel || "1";
  const maxLabel = question.maxLabel || "5";

  return (
    <div className={cn("space-y-3", className)}>
      {showTypeIcon && (
        <div className="flex items-center gap-2">
          <QuestionTypeIcon type="scale" />
          <span className="text-muted-foreground text-xs">Scale</span>
        </div>
      )}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{minLabel}</span>
          <span className="text-muted-foreground">{maxLabel}</span>
        </div>
        <RadioGroup
          value={scaleValue}
          onValueChange={onChange}
          disabled={disabled}
          className="flex justify-between"
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="flex items-center space-x-2">
              <RadioGroupItem value={num.toString()} id={`scale-${num}`} />
              <Label htmlFor={`scale-${num}`} className="cursor-pointer">
                {num}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}

/**
 * Text Question Input
 */
export function TextInput({
  question,
  value,
  onChange,
  disabled = false,
  showTypeIcon = false,
  className,
}: QuestionInputProps) {
  const textValue = typeof value === "string" ? value : "";

  return (
    <div className={cn("space-y-3", className)}>
      {showTypeIcon && (
        <div className="flex items-center gap-2">
          <QuestionTypeIcon type="text" />
          <span className="text-muted-foreground text-xs">Text Response</span>
        </div>
      )}
      <Textarea
        value={textValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Type your response here..."
        rows={4}
        className="resize-none"
      />
    </div>
  );
}

/**
 * Ranking Question Input (simplified - full drag-drop can be added later)
 */
export function RankingInput({
  question,
  value,
  onChange,
  disabled = false,
  showTypeIcon = false,
  className,
}: QuestionInputProps) {
  if (!question.options || question.options.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">
        No options available for this question
      </div>
    );
  }

  // For now, use a simple select-based ranking
  // TODO: Implement drag-and-drop ranking
  const rankingValue = typeof value === "string" ? value : "";

  return (
    <div className={cn("space-y-3", className)}>
      {showTypeIcon && (
        <div className="flex items-center gap-2">
          <QuestionTypeIcon type="ranking" />
          <span className="text-muted-foreground text-xs">Ranking</span>
        </div>
      )}
      <div className="text-muted-foreground text-sm">
        Drag-and-drop ranking coming soon. For now, please use single or
        multiple choice questions.
      </div>
    </div>
  );
}

/**
 * Universal Question Input Component
 * Automatically renders the correct input based on question type
 */
export function QuestionInput(props: QuestionInputProps) {
  const { question } = props;

  switch (question.type) {
    case "single":
      return <SingleChoiceInput {...props} />;
    case "multiple":
      return <MultipleChoiceInput {...props} />;
    case "scale":
      return <ScaleInput {...props} />;
    case "text":
      return <TextInput {...props} />;
    case "ranking":
      return <RankingInput {...props} />;
    default:
      return (
        <div className="text-muted-foreground text-sm">
          Unknown question type: {(question as SurveyQuestion).type}
        </div>
      );
  }
}
