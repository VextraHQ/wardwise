"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  FileQuestion,
  ShieldCheck,
  ClipboardList,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StepProgress } from "@/components/ui/step-progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRegistration } from "@/hooks/use-registration";
import { cn } from "@/lib/utils";
import { mockApi } from "@/lib/mock/mockApi";
import type { CandidateSurvey, SurveyQuestion } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { TrustIndicators } from "@/components/ui/trust-indicators";

export function CandidateSurveyStep() {
  const router = useRouter();
  const { update, payload } = useRegistration();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const candidateId = payload.candidate?.candidateId;

  // TODO: Replace with actual API call
  // Fetch the survey for the candidate
  const { data, isLoading, isPending } = useQuery({
    queryKey: ["candidate-survey", candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      return await mockApi.getCandidateSurvey(candidateId);
    },
    enabled: !!candidateId,
  });

  // TODO: Replace with actual API call
  // Get the survey for the candidate
  const survey: CandidateSurvey | null = data?.survey || null;
  const currentQuestion: SurveyQuestion | null =
    survey && currentQuestionIndex < survey.questions.length
      ? survey.questions[currentQuestionIndex]
      : null;

  // Check if the current question is the last question
  const isLastQuestion =
    survey && currentQuestionIndex === survey.questions.length - 1;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  // Simple word count utility
  const wordCount = (text: string) =>
    text.trim().split(/\s+/).filter(Boolean).length;

  // Check if the current answer has been answered
  const hasAnswer = currentAnswer
    ? Array.isArray(currentAnswer)
      ? currentAnswer.length > 0
      : currentAnswer.length > 0
    : false;

  // Handle single choice
  const handleSingleChoice = (optionId: string) => {
    if (currentQuestion) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: optionId,
      }));
    }
  };

  // Handle multiple choice
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

  // Handle scale change
  const handleScaleChange = (value: string) => {
    if (currentQuestion) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: value,
      }));
    }
  };

  // Handle text change
  const handleTextChange = (text: string) => {
    if (currentQuestion) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: text,
      }));
    }
  };

  // Handle next question
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

  // Handle back question
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      router.push("/register/candidate");
    }
  };

  // Loading state
  if (isLoading || isPending) {
    return (
      <div className="space-y-6">
        <StepProgress currentStep={5} totalSteps={6} stepTitle="Survey" />

        <div className="space-y-2 text-center">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Loading Survey
          </h1>
          <p className="text-muted-foreground text-sm">
            Please wait while we load the candidate's survey
          </p>
        </div>

        <div className="mx-auto w-full max-w-2xl">
          <Card>
            <CardContent className="flex min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
                <div className="space-y-1">
                  <p className="text-foreground text-sm font-medium">
                    Loading candidate survey...
                  </p>
                  <p className="text-muted-foreground text-xs">
                    This may take a few moments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // No survey or current question - only show after loading completes and data exists
  if (
    !isLoading &&
    !isPending &&
    data !== undefined &&
    (!survey || !currentQuestion)
  ) {
    return (
      <div className="space-y-6">
        <StepProgress currentStep={5} totalSteps={6} stepTitle="Survey" />

        <div className="space-y-2 text-center">
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Survey Not Available
          </h1>
          <p className="text-muted-foreground mx-auto max-w-lg text-sm sm:text-base">
            We couldn't find a survey for this candidate
          </p>
        </div>

        <div className="mx-auto w-full max-w-md">
          <Card>
            <CardContent className="flex min-h-[300px] flex-col items-center justify-center space-y-6 py-12">
              <FileQuestion className="text-muted-foreground h-16 w-16" />
              <div className="space-y-4 text-center">
                <div className="space-y-2">
                  <p className="text-foreground text-lg font-semibold">
                    Survey Not Found
                  </p>
                  <p className="text-muted-foreground text-sm">
                    This candidate hasn't created a survey yet. Please select a
                    different candidate or contact support if you believe this
                    is an error.
                  </p>
                </div>
                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                  <Button
                    onClick={() => router.push("/register/candidate")}
                    variant="outline"
                    className="h-10 flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Select Different Candidate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // At this point, we should have a survey and current question
  // This is a safety check for TypeScript
  if (!survey || !currentQuestion) {
    return null;
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
                          "block h-full cursor-pointer rounded-lg border p-4 transition-all duration-200",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {option.icon && (
                            <span className="flex-shrink-0 text-xl">
                              {option.icon}
                            </span>
                          )}
                          <div
                            className={cn(
                              "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/30",
                            )}
                          >
                            {isSelected && (
                              <div className="bg-primary-foreground h-1.5 w-1.5 rounded-full" />
                            )}
                          </div>
                          <span
                            className={cn(
                              "flex-1 text-sm font-medium transition-colors",
                              isSelected
                                ? "text-foreground"
                                : "text-muted-foreground",
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
                          "block h-full cursor-pointer rounded-lg border p-4 transition-all duration-200",
                          isChecked
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50",
                        )}
                        onClick={() =>
                          handleMultipleChoice(option.id, !isChecked)
                        }
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={option.id}
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              handleMultipleChoice(
                                option.id,
                                checked as boolean,
                              )
                            }
                            className="flex-shrink-0"
                          />
                          {option.icon && (
                            <span className="flex-shrink-0 text-xl">
                              {option.icon}
                            </span>
                          )}
                          <Label
                            htmlFor={option.id}
                            className={cn(
                              "flex-1 cursor-pointer text-sm font-medium transition-colors",
                              isChecked
                                ? "text-foreground"
                                : "text-muted-foreground",
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
                        "flex-1 rounded-lg border py-3 font-semibold transition-all duration-200",
                        currentAnswer === String(score)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:border-primary/50 hover:bg-muted/50",
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
                <Textarea
                  placeholder="Share your thoughts..."
                  value={(currentAnswer as string) || ""}
                  onChange={(e) => handleTextChange(e.target.value)}
                  maxLength={500}
                  className="focus:border-primary min-h-32 resize-y rounded-lg border p-3 transition-all"
                />
                <div className="text-muted-foreground flex justify-between text-xs">
                  <span>
                    {wordCount((currentAnswer as string) || "")} words
                  </span>
                  <span>
                    {((currentAnswer as string) || "").length}/{500} characters
                  </span>
                </div>
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
                className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground h-10 flex-1 bg-gradient-to-r font-semibold transition-all duration-200 disabled:opacity-50"
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

      {/* Subtle Trust Indicators */}
      <TrustIndicators
        items={[
          { icon: <ShieldCheck className="h-4 w-4" />, label: "Secure Survey" },
          {
            icon: <ClipboardList className="h-4 w-4" />,
            label: "Policy-Guided",
          },
          {
            icon: <Users className="h-4 w-4" />,
            label: "Anonymous Aggregation",
          },
        ]}
      />
    </div>
  );
}
