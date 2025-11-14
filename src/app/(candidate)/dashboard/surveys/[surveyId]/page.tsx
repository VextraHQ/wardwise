"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useSurveyById,
  useCandidateSurveyResponses,
} from "@/hooks/use-candidate-dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { QuestionsList } from "@/components/survey/question-display";
import {
  IconArrowLeft,
  IconEdit,
  IconClipboardList,
  IconUsers,
  IconCalendar,
} from "@tabler/icons-react";

export default function SurveyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.surveyId as string;

  const { data: survey, isLoading: surveyLoading } = useSurveyById(surveyId);
  const { data: surveyAnalytics, isLoading: analyticsLoading } =
    useCandidateSurveyResponses();
  const isLoading = surveyLoading || analyticsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32" />
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
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/surveys")}
        >
          <IconArrowLeft className="mr-2 size-4" />
          Back to Surveys
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <IconArrowLeft className="size-4" />
          </Button>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {survey.title}
            </h1>
            <p className="text-muted-foreground text-sm">
              {survey.description}
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/surveys/${survey.id}/edit`}>
            <IconEdit className="mr-2 size-4" />
            Edit Survey
          </Link>
        </Button>
      </div>

      {/* Survey Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {surveyAnalytics?.totalResponses || survey.totalResponses || 0}
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              Survey responses collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {surveyAnalytics?.completionRate || 0}%
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              Supporters who completed survey
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Survey Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                survey.status === "published"
                  ? "default"
                  : survey.status === "draft"
                    ? "secondary"
                    : "outline"
              }
              className="mt-2"
            >
              {survey.status === "published"
                ? "Published"
                : survey.status === "draft"
                  ? "Draft"
                  : "Active"}
            </Badge>
            <p className="text-muted-foreground mt-2 text-sm">
              {survey.questions.length} questions
            </p>
            {survey.updatedAt && (
              <p className="text-muted-foreground mt-1 text-xs">
                Updated {new Date(survey.updatedAt).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Survey Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Survey Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                <IconClipboardList className="text-primary size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Questions</p>
                <p className="text-muted-foreground text-xs">
                  {survey.questions.length} total questions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                <IconUsers className="text-primary size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Responses</p>
                <p className="text-muted-foreground text-xs">
                  {surveyAnalytics?.totalResponses ||
                    survey.totalResponses ||
                    0}{" "}
                  total responses
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                <IconCalendar className="text-primary size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-muted-foreground text-xs">
                  {new Date(survey.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {survey.estimatedMinutes && (
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                  <IconCalendar className="text-primary size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Estimated Time</p>
                  <p className="text-muted-foreground text-xs">
                    {survey.estimatedMinutes} minutes
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Survey Questions</CardTitle>
          <CardDescription>
            Preview of all questions in this survey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionsList
            questions={survey.questions}
            showIndex={true}
            showType={true}
          />
        </CardContent>
      </Card>

      {/* Analytics Preview */}
      {surveyAnalytics &&
        surveyAnalytics.questionBreakdown &&
        Object.keys(surveyAnalytics.questionBreakdown).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Response Analytics</CardTitle>
              <CardDescription>Top responses for each question</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {survey.questions.slice(0, 5).map((question) => {
                  const breakdown =
                    surveyAnalytics.questionBreakdown[question.id];
                  if (!breakdown) return null;

                  return (
                    <div key={question.id} className="space-y-3">
                      <div>
                        <h4 className="font-medium">{question.question}</h4>
                        {question.description && (
                          <p className="text-muted-foreground mt-1 text-sm">
                            {question.description}
                          </p>
                        )}
                      </div>

                      {breakdown.topAnswer && (
                        <div className="rounded-lg border p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Top Response
                            </span>
                            <Badge variant="outline">
                              {breakdown.topAnswer.percentage}%
                            </Badge>
                          </div>
                          <p className="text-sm">{breakdown.topAnswer.label}</p>
                          <Progress
                            value={breakdown.topAnswer.percentage}
                            className="mt-2 h-2"
                          />
                        </div>
                      )}

                      {breakdown.responseCount === 0 && (
                        <div className="text-muted-foreground rounded-lg border p-4 text-center text-sm">
                          No responses yet
                        </div>
                      )}
                    </div>
                  );
                })}
                {survey.questions.length > 5 && (
                  <Button variant="outline" className="w-full" disabled>
                    View All {survey.questions.length} Questions Analytics
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
