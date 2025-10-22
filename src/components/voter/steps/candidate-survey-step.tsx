"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StepProgress } from "@/components/ui/step-progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRegistration } from "@/hooks/use-registration";
import { cn } from "@/lib/utils";
import { mockApi, CandidateSurvey, SurveyQuestion } from "@/lib/mock/mockApi";

export function CandidateSurveyStep() {
  const router = useRouter();
  const { update, payload } = useRegistration();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const candidateId = payload.candidate?.candidateId;

  const { data, isLoading } = useQuery({
    queryKey: ["candidate-survey", candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      return await mockApi.getCandidateSurvey(candidateId);
    },
    enabled: !!candidateId,
  });

  const survey: CandidateSurvey | null = data?.survey || null;
  const currentQuestion: SurveyQuestion | null =
    survey && currentQuestionIndex < survey.questions.length
      ? survey.questions[currentQuestionIndex]
      : null;

  const isLastQuestion =
    survey && currentQuestionIndex === survey.questions.length - 1;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;
  const hasAnswer = currentAnswer
    ? Array.isArray(currentAnswer)
      ? currentAnswer.length > 0
      : currentAnswer.length > 0
    : false;

  const handleSingleChoice = (optionId: string) => {
    if (currentQuestion) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: optionId,
      }));
    }
  };

  const handleMultipleChoice = (optionId: string, checked: boolean) => {
    if (currentQuestion) {
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
    }
  };

  const handleScaleChange = (value: string) => {
    if (currentQuestion) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: value,
      }));
    }
  };

  const handleTextChange = (text: string) => {
    if (currentQuestion) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: text,
      }));
    }
  };

  const handleNext = () => {
    if (!hasAnswer) {
      toast.error("Please answer the question to continue");
      return;
    }

    if (isLastQuestion && survey) {
      // Save survey data
      update({
        survey: {
          surveyId: survey.id,
          answers: answers,
        } as { surveyId: string; answers: Record<string, string | string[]> },
      });
      toast.success("Survey completed!");
      router.push("/register/complete");
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      router.push("/register/candidate");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
          <p className="text-muted-foreground text-lg">
            Loading candidate survey...
          </p>
        </div>
      </div>
    );
  }

  if (!survey || !currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Survey not found</p>
            <Button
              onClick={() => router.push("/register/candidate")}
              className="mt-4"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reusable Progress Component */}
      <StepProgress
        currentStep={5}
        totalSteps={6}
        stepTitle={`Question ${currentQuestionIndex + 1} of ${survey.questions.length}`}
      />

      {/* Hero Section */}
      <div className="space-y-2 text-center">
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          {survey.title}
        </h1>
        <p className="text-muted-foreground mx-auto max-w-lg text-sm sm:text-base">
          {survey.description}
        </p>
      </div>

      {/* Main Survey Card */}
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-border/60 bg-card/95 backdrop-blur-sm">
          <CardHeader className="border-border border-b">
            <div className="space-y-1">
              <h2 className="text-foreground text-lg font-semibold tracking-tight">
                {currentQuestion.question}
              </h2>
              {currentQuestion.description && (
                <p className="text-muted-foreground text-sm">
                  {currentQuestion.description}
                </p>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Single Choice */}
            {currentQuestion.type === "single" && currentQuestion.options && (
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
                          "group flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all duration-200",
                          isSelected
                            ? "border-primary/60 bg-primary/5 ring-primary/20 ring-2"
                            : "border-border/60 bg-card hover:border-primary/30",
                        )}
                      >
                        <div className="flex flex-1 items-center gap-3">
                          {option.icon && (
                            <span className="text-xl">{option.icon}</span>
                          )}
                          <div
                            className={cn(
                              "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                              isSelected
                                ? "border-primary bg-primary scale-110"
                                : "border-muted-foreground/40 group-hover:border-primary/50",
                            )}
                          >
                            {isSelected && (
                              <div className="bg-primary-foreground h-2 w-2 rounded-full" />
                            )}
                          </div>
                          <span
                            className={cn(
                              "flex-1 text-sm font-medium transition-colors",
                              isSelected
                                ? "text-foreground"
                                : "text-muted-foreground group-hover:text-foreground",
                            )}
                          >
                            {option.label}
                          </span>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            )}

            {/* Multiple Choice */}
            {currentQuestion.type === "multiple" && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isChecked = (currentAnswer as string[])?.includes(
                    option.id,
                  );
                  return (
                    <div key={option.id} className="relative">
                      <div
                        className={cn(
                          "group flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all duration-200",
                          isChecked
                            ? "border-primary/60 bg-primary/5 ring-primary/20 ring-2"
                            : "border-border/60 bg-card hover:border-primary/30 hover:bg-accent/50",
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
                          className="flex-shrink-0 transition-transform duration-200 data-[state=checked]:scale-110"
                        />
                        <div className="flex flex-1 items-center gap-3">
                          {option.icon && (
                            <span className="text-xl">{option.icon}</span>
                          )}
                          <Label
                            htmlFor={option.id}
                            className={cn(
                              "flex-1 cursor-pointer text-sm font-medium transition-colors",
                              isChecked
                                ? "text-foreground"
                                : "text-muted-foreground group-hover:text-foreground",
                            )}
                          >
                            {option.label}
                          </Label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Scale/Slider */}
            {currentQuestion.type === "scale" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-medium">
                    {currentQuestion.minLabel || "Not at all"}
                  </span>
                  <span className="text-muted-foreground text-xs font-medium">
                    {currentQuestion.maxLabel || "Very much"}
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleScaleChange(String(score))}
                      className={cn(
                        "flex-1 rounded-lg border-2 py-3 font-semibold transition-all",
                        currentAnswer === String(score)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/60 bg-card hover:border-primary/30",
                      )}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Text Input */}
            {currentQuestion.type === "text" && (
              <div className="space-y-2">
                <Input
                  placeholder="Share your thoughts..."
                  value={(currentAnswer as string) || ""}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className="border-border/60 bg-background/50 focus:border-primary/60 focus:bg-background min-h-24 resize-none rounded-lg border p-3 transition-all"
                />
                <p className="text-muted-foreground text-xs">
                  {((currentAnswer as string) || "").length}/280 characters
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="h-10 flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {currentQuestionIndex > 0 ? "Previous" : "Back"}
              </Button>
              <Button
                onClick={handleNext}
                disabled={!hasAnswer}
                className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground h-10 flex-1 bg-gradient-to-r font-semibold transition-all duration-200"
              >
                {isLastQuestion ? "Complete Survey" : "Next Question"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Navigator */}
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-wrap justify-center gap-2">
          {survey.questions.map((_, index) => {
            const isAnswered = !!answers[survey.questions[index].id];
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
    </div>
  );
}
