"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  HiArrowRight,
  HiArrowLeft,
  HiQuestionMarkCircle,
  HiShieldCheck,
  HiClipboardList,
  HiUsers,
  HiOutlineClock,
  HiTrendingUp,
  HiCheckCircle,
  HiSparkles,
  HiFire,
  HiLightningBolt,
} from "react-icons/hi";
import { ClipboardList } from "lucide-react";
import { PiSpinnerGapBold } from "react-icons/pi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StepProgress } from "@/components/ui/step-progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { candidateApi } from "@/lib/api/candidate";
import type { CandidateSurvey, SurveyQuestion } from "@/types/survey";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import { RegistrationStepHeader } from "../registration-step-header";

export function CandidateSurveyStep() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({}); // For "Other" option text inputs
  // TODO: Implement ranking question type with drag-and-drop functionality
  // const [rankingOrder, setRankingOrder] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastMilestone, setLastMilestone] = useState<number | null>(null);
  const [showMilestone, setShowMilestone] = useState(false);
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Multi-candidate support - survey disabled for now
  // TODO: Implement per-position surveys or aggregate survey
  const candidateId = null;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  // TODO: Replace with actual API call
  // Fetch the survey for the candidate
  const { data, isLoading, isPending } = useQuery({
    queryKey: ["candidate-survey", candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      return await candidateApi.getCandidateSurvey(candidateId);
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

  // Check if the current answer has been answered (including "Other" text validation)
  const hasAnswer = (() => {
    if (!currentAnswer || !currentQuestion) return false;

    // Check basic answer existence
    const hasBasicAnswer = Array.isArray(currentAnswer)
      ? currentAnswer.length > 0
      : currentAnswer.length > 0;

    if (!hasBasicAnswer) return false;

    // Check if "Other" option is selected and requires text
    if (currentQuestion.options) {
      const selectedOptions = Array.isArray(currentAnswer)
        ? currentAnswer
        : [currentAnswer];

      // Find if any selected option has allowOther
      const hasOtherOption = currentQuestion.options.some(
        (opt) => opt.allowOther && selectedOptions.includes(opt.id),
      );

      // If "Other" option is selected, validate the text is provided
      if (hasOtherOption) {
        const otherText = otherTexts[currentQuestion.id];
        return otherText && otherText.trim().length > 0;
      }
    }

    return true;
  })();

  // Calculate total answered (answers already includes current if answered)
  const totalAnswered = Object.keys(answers).length;

  // Calculate progress percentage
  const progressPercentage = survey
    ? Math.round((totalAnswered / survey.questions.length) * 100)
    : 0;

  // Calculate questions remaining
  const questionsRemaining = survey
    ? survey.questions.length - totalAnswered
    : 0;

  // Estimate time remaining (simplified: 30 seconds per question)
  const estimatedMinutes = Math.ceil((questionsRemaining * 30) / 60);

  // Handle single choice (with deselection support)
  const handleSingleChoice = (optionId: string) => {
    if (currentQuestion) {
      setAnswers((prev) => {
        // If clicking the same option, deselect it
        if (prev[currentQuestion.id] === optionId) {
          // Also clear "Other" text if deselecting
          setOtherTexts((otherPrev) => {
            const { [currentQuestion.id]: _, ...rest } = otherPrev;
            return rest;
          });
          const { [currentQuestion.id]: _, ...rest } = prev;
          return rest;
        }
        // Otherwise, select the new option
        // Clear "Other" text when switching to a different option
        const previousOption = currentQuestion.options?.find(
          (opt) => opt.id === prev[currentQuestion.id],
        );
        if (previousOption?.allowOther) {
          setOtherTexts((otherPrev) => {
            const { [currentQuestion.id]: _, ...rest } = otherPrev;
            return rest;
          });
        }
        return {
          ...prev,
          [currentQuestion.id]: optionId,
        };
      });
    }
  };

  // Handle multiple choice
  const handleMultipleChoice = (optionId: string, checked: boolean) => {
    if (currentQuestion) {
      // If unchecking an "Other" option, clear its text
      if (!checked) {
        const option = currentQuestion.options?.find(
          (opt) => opt.id === optionId,
        );
        if (option?.allowOther) {
          setOtherTexts((otherPrev) => {
            const { [currentQuestion.id]: _, ...rest } = otherPrev;
            return rest;
          });
        }
      }

      setAnswers((prev) => {
        const current = (prev[currentQuestion.id] as string[]) || [];
        const updated = checked
          ? [...current, optionId]
          : current.filter((id) => id !== optionId);

        // If no options are selected, remove the question from answers entirely
        if (updated.length === 0) {
          // Also clear "Other" text
          setOtherTexts((otherPrev) => {
            const { [currentQuestion.id]: _, ...rest } = otherPrev;
            return rest;
          });
          const { [currentQuestion.id]: _, ...rest } = prev;
          return rest;
        }

        return {
          ...prev,
          [currentQuestion.id]: updated,
        };
      });
    }
  };

  // Handle scale change (with deselection support)
  const handleScaleChange = (value: string) => {
    if (currentQuestion) {
      setAnswers((prev) => {
        // If clicking the same value, deselect it
        if (prev[currentQuestion.id] === value) {
          const { [currentQuestion.id]: _, ...rest } = prev;
          return rest;
        }
        // Otherwise, select the new value
        return {
          ...prev,
          [currentQuestion.id]: value,
        };
      });
    }
  };

  // Handle text change
  const handleTextChange = (text: string) => {
    if (currentQuestion) {
      setAnswers((prev) => {
        const trimmedText = text.trim();

        // If completely empty, remove from answers
        if (trimmedText.length === 0) {
          const { [currentQuestion.id]: _, ...rest } = prev;
          return rest;
        }

        // Valid text with content - update normally
        return {
          ...prev,
          [currentQuestion.id]: text,
        };
      });
    }
  };

  // Handle next question
  const handleNext = () => {
    if (!hasAnswer) {
      toast.error("Please answer the question to continue");
      return;
    }

    if (isLastQuestion && survey) {
      // Prevent double submission
      if (isSubmitting) return;

      // Final validation: Check all questions are answered
      const allAnswered = survey.questions.every((q) => {
        const answer = answers[q.id];
        if (!answer) return false;

        // Validate based on question type
        if (q.type === "multiple") {
          const isValidArray = Array.isArray(answer) && answer.length > 0;
          if (!isValidArray) return false;
        } else if (q.type === "text") {
          const isValidText =
            typeof answer === "string" && answer.trim().length > 0;
          if (!isValidText) return false;
        } else {
          // single, scale, ranking
          const isValidString = typeof answer === "string" && answer.length > 0;
          if (!isValidString) return false;
        }

        // Check "Other" text if option with allowOther is selected
        if (q.options) {
          const selectedOptions = Array.isArray(answer) ? answer : [answer];
          const hasOtherOption = q.options.some(
            (opt) => opt.allowOther && selectedOptions.includes(opt.id),
          );

          if (hasOtherOption) {
            const otherText = otherTexts[q.id];
            return otherText && otherText.trim().length > 0;
          }
        }

        return true;
      });

      if (!allAnswered) {
        toast.error("Please answer all questions before submitting the survey");
        return;
      }

      // Mark as submitting
      setIsSubmitting(true);

      // Prepare answers with "Other" text included
      const finalAnswers = { ...answers };
      Object.keys(otherTexts).forEach((questionId) => {
        if (otherTexts[questionId]) {
          // Append "Other" text to the answer
          // Format: optionId + ": " + otherText
          const answer = finalAnswers[questionId];
          if (answer) {
            // Store the other text separately in a special format
            finalAnswers[`${questionId}_other_text`] = otherTexts[questionId];
          }
        }
      });

      // Survey data saving disabled - multi-candidate support
      // TODO: Implement per-position surveys or aggregate survey later
      // update({
      //   survey: {
      //     surveyId: survey.id,
      //     answers: finalAnswers,
      //   },
      // });

      // Navigate after delay with cleanup tracking
      completionTimeoutRef.current = setTimeout(() => {
        toast.success("Survey completed! Thank you for your input.");
        router.push("/register/complete");
      }, 800);
    } else {
      // Check for milestones and show celebration
      const nextProgress = Math.round(
        ((currentQuestionIndex + 2) / (survey?.questions.length || 1)) * 100,
      );

      const milestones = [25, 50, 75];
      const hitMilestone = milestones.find(
        (m) =>
          nextProgress >= m && (lastMilestone === null || lastMilestone < m),
      );

      if (hitMilestone) {
        setLastMilestone(hitMilestone);
        setShowMilestone(true);

        const messages = {
          25: "Great start! You're 25% done! 🎉",
          50: "Halfway there! You're doing amazing! ⚡",
          75: "Almost done! Just a few more questions! 🔥",
        };

        toast.success(messages[hitMilestone as keyof typeof messages], {
          duration: 3000,
        });

        // Hide milestone after animation
        setTimeout(() => setShowMilestone(false), 2000);
      }

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

  // Handle question navigation via navigator dots
  const handleQuestionNavigate = (targetIndex: number) => {
    // Allow navigation to current or previous questions
    // For forward navigation, require all intermediate questions to be answered
    if (targetIndex <= currentQuestionIndex) {
      // Going backward or staying - always allowed
      setCurrentQuestionIndex(targetIndex);
    } else if (survey) {
      // Going forward - check if all questions up to target are answered
      const allPreviousAnswered = survey.questions
        .slice(0, targetIndex)
        .every((q) => {
          const answer = answers[q.id];
          if (!answer) return false;

          if (q.type === "multiple") {
            return Array.isArray(answer) && answer.length > 0;
          }
          if (q.type === "text") {
            return typeof answer === "string" && answer.trim().length > 0;
          }
          return typeof answer === "string" && answer.length > 0;
        });

      if (allPreviousAnswered) {
        setCurrentQuestionIndex(targetIndex);
      } else {
        toast.error("Please answer previous questions first");
      }
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
                <PiSpinnerGapBold className="text-primary h-8 w-8 animate-spin" />
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
            <CardContent className="flex min-h-[300px] flex-col items-center justify-center space-y-6">
              <HiQuestionMarkCircle className="text-muted-foreground h-16 w-16" />
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
                    <HiArrowLeft className="mr-2 h-4 w-4" />
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
      <StepProgress currentStep={5} totalSteps={6} stepTitle="Survey" />

      {/* Hero Section - Only show on first question */}
      {currentQuestionIndex === 0 && (
        <RegistrationStepHeader
          icon={ClipboardList}
          badge="Candidate Survey"
          title={survey.title}
          description={survey.description}
        />
      )}

      {/* Milestone Celebration */}
      {showMilestone && lastMilestone && (
        <div className="mx-auto max-w-2xl">
          <div className="border-primary/30 bg-primary/5 flex items-center justify-center gap-3 rounded-lg border p-4">
            {lastMilestone === 25 && (
              <HiSparkles className="text-primary h-6 w-6" />
            )}
            {lastMilestone === 50 && (
              <HiLightningBolt className="text-primary h-6 w-6" />
            )}
            {lastMilestone === 75 && (
              <HiFire className="text-primary h-6 w-6" />
            )}
            <p className="text-foreground text-sm font-semibold">
              {lastMilestone}% Complete! Keep going! 🎉
            </p>
          </div>
        </div>
      )}

      {/* Progress and Stats Bar */}
      <div className="space-y-3">
        <div className="bg-muted/50 mx-auto flex max-w-2xl flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full">
              <span className="text-sm font-bold">{progressPercentage}%</span>
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-primary opacity-20"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-primary transition-all duration-300"
                  strokeLinecap="round"
                  strokeDasharray={`${(progressPercentage / 100) * 150.8} 150.8`}
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-foreground text-sm font-semibold">
                {totalAnswered} of {survey.questions.length} answered
              </p>
              <p className="text-muted-foreground text-xs">
                {questionsRemaining > 0
                  ? `${questionsRemaining} question${questionsRemaining !== 1 ? "s" : ""} remaining`
                  : "All done!"}
              </p>
              {/* Progress bar for mobile */}
              <div className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full sm:hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
            {survey.estimatedMinutes && (
              <div className="flex items-center gap-1.5">
                <HiOutlineClock className="text-muted-foreground h-4 w-4 shrink-0" />
                <span className="text-muted-foreground text-xs">
                  {estimatedMinutes > 0
                    ? `~${estimatedMinutes} min left`
                    : "Almost done!"}
                </span>
              </div>
            )}
            {survey.totalResponses && (
              <div className="flex items-center gap-1.5">
                <HiUsers className="text-muted-foreground h-4 w-4 shrink-0" />
                <span className="text-muted-foreground text-xs">
                  {survey.totalResponses.toLocaleString()} voters
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Survey Card */}
        <div className="mx-auto w-full max-w-2xl">
          <Card className="border-border/60 bg-card/95 backdrop-blur-sm">
            <CardHeader className="border-border border-b">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs font-medium">
                        Question {currentQuestionIndex + 1} of{" "}
                        {survey.questions.length}
                      </span>
                    </div>
                    <h2 className="text-foreground text-lg leading-tight font-semibold tracking-tight sm:text-xl">
                      {currentQuestion.question}
                    </h2>
                  </div>
                  {hasAnswer && (
                    <div>
                      <HiCheckCircle className="text-primary h-5 w-5 shrink-0" />
                    </div>
                  )}
                </div>
                {currentQuestion.description && (
                  <p className="text-muted-foreground text-sm">
                    {currentQuestion.description}
                  </p>
                )}

                {/* Social Proof - Show anonymized stats */}
                {currentQuestion.responseStats &&
                  currentQuestion.responseStats.topAnswer && (
                    <div className="bg-primary/5 border-primary/20 flex items-start gap-2 rounded-lg border p-3">
                      <HiTrendingUp className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-foreground text-xs font-semibold">
                          Community Insight
                        </p>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          <span className="text-foreground font-semibold">
                            {currentQuestion.responseStats.topAnswer.percentage}
                            %
                          </span>{" "}
                          of{" "}
                          {currentQuestion.responseStats.totalResponses.toLocaleString()}{" "}
                          voters chose:{" "}
                          <span className="text-foreground font-medium">
                            {currentQuestion.responseStats.topAnswer.label}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </CardHeader>

            <CardContent>
              {/* Single Choice */}
              {currentQuestion.type === "single" && currentQuestion.options && (
                <div
                  className={cn(
                    "space-y-3",
                    currentQuestion.options.length > 5 &&
                      "max-h-[400px] overflow-y-auto px-1 sm:max-h-[500px]",
                  )}
                >
                  <RadioGroup
                    value={
                      typeof currentAnswer === "string" ? currentAnswer : ""
                    }
                    onValueChange={handleSingleChoice}
                  >
                    {currentQuestion.options.map((option) => {
                      const isSelected = currentAnswer === option.id;
                      const showOtherInput = option.allowOther && isSelected;
                      return (
                        <div key={option.id} className="space-y-2">
                          <div className="relative">
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
                                  ? "border-primary bg-primary/5 ring-primary/20 ring-2 ring-offset-1"
                                  : "border-border hover:bg-muted/50 hover:border-primary/30",
                              )}
                            >
                              <div className="flex items-center gap-3">
                                {option.icon && (
                                  <span className="shrink-0 text-xl">
                                    {option.icon}
                                  </span>
                                )}
                                <div
                                  className={cn(
                                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
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
                          {showOtherInput && (
                            <div className="pl-7">
                              <Input
                                placeholder="Please specify..."
                                value={otherTexts[currentQuestion.id] || ""}
                                onChange={(e) => {
                                  setOtherTexts((prev) => ({
                                    ...prev,
                                    [currentQuestion.id]: e.target.value,
                                  }));
                                }}
                                className="focus:border-primary"
                                autoFocus
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              )}

              {/* Multiple Choice */}
              {currentQuestion.type === "multiple" &&
                currentQuestion.options && (
                  <div
                    className={cn(
                      "space-y-3",
                      currentQuestion.options.length > 5 &&
                        "max-h-[400px] overflow-y-auto px-1 sm:max-h-[500px]",
                    )}
                  >
                    {currentQuestion.options.map((option) => {
                      const currentAnswerArray =
                        (currentAnswer as string[]) || [];
                      const isChecked = currentAnswerArray.includes(option.id);
                      const showOtherInput = option.allowOther && isChecked;
                      return (
                        <div key={option.id} className="space-y-2">
                          <div className="relative">
                            <Label
                              htmlFor={option.id}
                              className={cn(
                                "block h-full cursor-pointer rounded-lg border p-4 transition-all duration-200",
                                isChecked
                                  ? "border-primary bg-primary/5 ring-primary/20 ring-2 ring-offset-1"
                                  : "border-border hover:bg-muted/50 hover:border-primary/30",
                              )}
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
                                  className="shrink-0"
                                />
                                {option.icon && (
                                  <span className="shrink-0 text-xl">
                                    {option.icon}
                                  </span>
                                )}
                                <span
                                  className={cn(
                                    "flex-1 text-sm font-medium transition-colors",
                                    isChecked
                                      ? "text-foreground"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {option.label}
                                </span>
                              </div>
                            </Label>
                          </div>
                          {showOtherInput && (
                            <div className="pl-7">
                              <Input
                                placeholder="Please specify..."
                                value={otherTexts[currentQuestion.id] || ""}
                                onChange={(e) => {
                                  setOtherTexts((prev) => ({
                                    ...prev,
                                    [currentQuestion.id]: e.target.value,
                                  }));
                                }}
                                className="focus:border-primary"
                                autoFocus
                              />
                            </div>
                          )}
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
                            ? "border-primary bg-primary text-primary-foreground ring-primary/20 ring-2 ring-offset-1"
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
                      {((currentAnswer as string) || "").length}/{500}{" "}
                      characters
                    </span>
                  </div>
                </div>
              )}

              {/* TODO: Ranking Question Type */}
              {/* Implement drag-and-drop ranking with @dnd-kit/core or react-beautiful-dnd */}
              {/* {currentQuestion.type === "ranking" && currentQuestion.options && (
                <RankingQuestion
                  options={currentQuestion.options}
                  value={rankingOrder[currentQuestion.id] || []}
                  onChange={(order) => setRankingOrder(prev => ({ ...prev, [currentQuestion.id]: order }))}
                />
              )} */}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="h-10 flex-1"
                >
                  <HiArrowLeft className="mr-2 h-4 w-4" />
                  {currentQuestionIndex > 0 ? "Previous" : "Back"}
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!hasAnswer || isSubmitting}
                  className={cn(
                    "bg-primary hover:bg-primary/90 text-primary-foreground h-10 flex-1 font-semibold transition-all duration-300 ease-in-out disabled:opacity-50",
                    hasAnswer &&
                      !isSubmitting &&
                      "hover:bg-primary/90 hover:text-primary-foreground",
                  )}
                >
                  {isLastQuestion ? (
                    <>
                      <HiSparkles className="mr-2 h-4 w-4" />
                      Complete Survey
                    </>
                  ) : (
                    <>
                      Next Question
                      <HiArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Navigator */}
        <div className="mx-auto max-w-2xl">
          <div className="overflow-x-auto py-2">
            <div className="flex min-w-fit justify-center gap-2 px-2">
              {survey.questions.map((_, index) => {
                const isAnswered = !!answers[survey.questions[index].id];
                const isCurrent = index === currentQuestionIndex;
                return (
                  <button
                    key={index}
                    onClick={() => handleQuestionNavigate(index)}
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all sm:h-8 sm:w-8",
                      isCurrent &&
                        "ring-primary ring-offset-background ring-2 ring-offset-2",
                      isAnswered
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                    aria-label={`Question ${index + 1}${isAnswered ? ", answered" : ""}${isCurrent ? ", current question" : ""}`}
                  >
                    {isAnswered ? (
                      <HiCheckCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="text-muted-foreground mt-3 text-center text-xs">
            Click any number to navigate. Green dots indicate answered
            questions.
          </p>
        </div>

        {/* Subtle Trust Indicators */}
        <TrustIndicators
          items={[
            {
              icon: <HiShieldCheck className="h-4 w-4" />,
              label: "Secure Survey",
            },
            {
              icon: <HiClipboardList className="h-4 w-4" />,
              label: "Policy-Guided",
            },
            {
              icon: <HiUsers className="h-4 w-4" />,
              label: "Anonymous Aggregation",
            },
          ]}
        />
      </div>
    </div>
  );
}
