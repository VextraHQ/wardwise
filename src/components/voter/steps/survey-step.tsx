"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, ArrowRight, ArrowLeft, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRegistration } from "@/hooks/use-registration";
import { getSurveyQuestions } from "@/lib/mock/surveyData";
import { cn } from "@/lib/utils";

export function SurveyStep() {
  const router = useRouter();
  const { update } = useRegistration();
  const questions = getSurveyQuestions();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentAnswer = answers[currentQuestion.id];
  const hasAnswer = currentAnswer
    ? Array.isArray(currentAnswer)
      ? currentAnswer.length > 0
      : currentAnswer.length > 0
    : false;

  const handleSingleChoice = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleMultipleChoice = (optionId: string, checked: boolean) => {
    setAnswers((prev) => {
      const current = (prev[currentQuestion.id] as string[]) || [];
      const updated = checked
        ? [...current, optionId]
        : current.filter((id) => id !== optionId);
      return {
        ...prev,
        [currentQuestion.id]: updated,
      };
    });
  };

  const handleNext = () => {
    if (!hasAnswer) {
      toast.error("Please select an answer to continue");
      return;
    }

    if (isLastQuestion) {
      // Save survey data and move to candidate selection
      update({
        survey: {
          priorities: Object.values(answers).flat(),
          comments: "",
        },
      });
      toast.success("Survey completed!");
      router.push("/register/candidate");
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      router.push("/register/location");
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Hero Section */}
      <div className="space-y-2 text-center">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          Help Us Understand Your Priorities
        </h1>
        <p className="text-muted-foreground text-lg">
          Your answers remain confidential and help candidates serve you better
        </p>
      </div>

      {/* Main Card */}
      <Card className="border-border/60 bg-card/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="border-border/60 space-y-4 border-b pb-6">
          <div className="flex items-start gap-3">
            <div className="bg-primary/15 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
              <ClipboardList className="text-primary h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-foreground text-xl leading-tight font-semibold">
                {currentQuestion.question}
              </h2>
              {currentQuestion.description && (
                <p className="text-muted-foreground text-sm">
                  {currentQuestion.description}
                </p>
              )}
            </div>
          </div>

          {/* Question Type Indicator */}
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Info className="h-3.5 w-3.5" />
            <span>
              {currentQuestion.type === "single"
                ? "Select one option"
                : "Select all that apply"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-8">
          {/* Options */}
          {currentQuestion.type === "single" ? (
            <RadioGroup
              value={currentAnswer as string}
              onValueChange={handleSingleChoice}
              className="space-y-3"
            >
              {currentQuestion.options.map((option) => {
                const isSelected = currentAnswer === option.id;
                return (
                  <div key={option.id} className="relative">
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={option.id}
                      className={cn(
                        "hover:bg-accent flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-all",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-muted bg-card",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground",
                        )}
                      >
                        {isSelected && (
                          <div className="bg-primary-foreground h-2 w-2 rounded-full" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isSelected
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {option.label}
                      </span>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          ) : (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isChecked = (currentAnswer as string[])?.includes(
                  option.id,
                );
                return (
                  <div key={option.id} className="relative">
                    <div
                      className={cn(
                        "hover:bg-accent flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-all",
                        isChecked
                          ? "border-primary bg-primary/10"
                          : "border-muted bg-card",
                      )}
                      onClick={() =>
                        handleMultipleChoice(option.id, !isChecked)
                      }
                    >
                      <Checkbox
                        id={option.id}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleMultipleChoice(option.id, checked as boolean)
                        }
                        className="flex-shrink-0"
                      />
                      <Label
                        htmlFor={option.id}
                        className={cn(
                          "cursor-pointer text-sm font-medium",
                          isChecked
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {option.label}
                      </Label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Why We Ask */}
          <div className="border-border/60 bg-muted/50 rounded-lg border p-4">
            <p className="text-muted-foreground text-xs">
              <strong className="text-foreground">Why we ask:</strong> Your
              candidate needs to know what matters to you. This helps them
              prioritize policies and programs that address your community's
              real needs.
            </p>
          </div>

          {/* Navigation */}
          <div className="border-border/60 flex items-center justify-between border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {currentQuestionIndex > 0 ? "Previous" : "Back"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!hasAnswer}
              className="from-primary to-primary/90 gap-2 bg-gradient-to-r"
            >
              {isLastQuestion ? "Complete Survey" : "Next Question"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question Navigator */}
      <div className="flex flex-wrap justify-center gap-2">
        {questions.map((_, index) => {
          const isAnswered = !!answers[questions[index].id];
          const isCurrent = index === currentQuestionIndex;
          return (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all",
                isCurrent &&
                  "ring-primary ring-offset-background ring-2 ring-offset-2",
                isAnswered
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
