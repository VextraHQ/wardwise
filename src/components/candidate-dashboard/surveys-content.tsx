"use client";

import {
  useCandidateSurvey,
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
import {
  IconPlus,
  IconClipboardList,
  IconUsers,
  IconCalendar,
  IconArrowRight,
  IconEdit,
} from "@tabler/icons-react";

export function SurveysContent() {
  const { data: survey, isLoading: surveyLoading } = useCandidateSurvey();
  const { data: surveyAnalytics, isLoading: analyticsLoading } =
    useCandidateSurveyResponses();
  const isLoading = surveyLoading || analyticsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Surveys</h1>
          <p className="text-muted-foreground text-sm">
            Manage and analyze your campaign surveys
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/surveys/create">
            <IconPlus className="mr-2 size-4" />
            Create Survey
          </Link>
        </Button>
      </div>

      {survey ? (
        <>
          {/* Survey Overview Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {surveyAnalytics?.totalResponses ||
                    survey.totalResponses ||
                    0}
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
                  {survey.totalResponses || 0} total responses
                </p>
                {survey.updatedAt && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Updated {new Date(survey.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Survey Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                      <IconClipboardList className="text-primary size-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{survey.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {survey.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-muted-foreground mt-4 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <IconUsers className="size-4" />
                      <span>
                        {survey.totalResponses ||
                          surveyAnalytics?.totalResponses ||
                          0}{" "}
                        responses
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconCalendar className="size-4" />
                      <span>
                        {new Date(survey.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {survey.estimatedMinutes} min
                    </Badge>
                    <Badge variant="outline">
                      {survey.questions.length} questions
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/surveys/${survey.id}/edit`}>
                      <IconEdit className="mr-2 size-4" />
                      Edit Survey
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/surveys/${survey.id}`}>
                      View Details
                      <IconArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {surveyAnalytics &&
              surveyAnalytics.questionBreakdown &&
              Object.keys(surveyAnalytics.questionBreakdown).length > 0 ? (
                <div className="space-y-6">
                  <h3 className="text-sm font-medium">Question Breakdown</h3>
                  {survey.questions.slice(0, 3).map((question) => {
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
                            <p className="text-sm">
                              {breakdown.topAnswer.label}
                            </p>
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
                  {survey.questions.length > 3 && (
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/dashboard/surveys/${survey.id}`}>
                        View All {survey.questions.length} Questions
                        <IconArrowRight className="ml-2 size-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border p-6 text-center">
                  <IconClipboardList className="text-muted-foreground mx-auto mb-2 size-8" />
                  <p className="text-muted-foreground text-sm">
                    No responses yet. Responses will appear here once supporters
                    complete your survey.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconClipboardList className="text-muted-foreground mb-4 size-12" />
            <h3 className="mb-2 text-lg font-semibold">No Surveys Yet</h3>
            <p className="text-muted-foreground mb-6 text-center text-sm">
              Create your first survey to start collecting feedback from your
              supporters.
            </p>
            <Button asChild>
              <Link href="/dashboard/surveys/create">
                <IconPlus className="mr-2 size-4" />
                Create Your First Survey
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
