"use client";

import { useCandidateDashboard } from "@/hooks/use-candidate-dashboard";
import { ChartAreaInteractive } from "@/components/candidate-dashboard/chart-area-interactive";
import { DataTable } from "@/components/candidate-dashboard/data-table";
import { SectionCards } from "@/components/candidate-dashboard/section-cards";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  IconArrowRight,
  IconClipboardList,
  IconShieldCheck,
  IconFingerprint,
  IconUsers,
} from "@tabler/icons-react";

export function DashboardContent() {
  const { data: dashboardData, isLoading, error } = useCandidateDashboard();

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="mx-4 h-64 lg:mx-6" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  // Transform ward data for DataTable if available
  const tableData =
    dashboardData?.wardCoverage?.wardDetails.map((ward, index) => ({
      id: index + 1,
      header: ward.ward,
      type: ward.lga,
      status: ward.supporterCount > 0 ? "Active" : "Planning",
      target: ward.supporterCount.toString(),
      limit:
        ward.supporterCount > 5
          ? "High"
          : ward.supporterCount > 2
            ? "Medium"
            : "Low",
      reviewer: ward.supporterCount > 0 ? "Active" : "Inactive",
    })) || [];

  // Get survey analytics for top issues
  const surveyAnalytics = dashboardData?.surveyAnalytics;
  const topIssues = surveyAnalytics?.questionBreakdown
    ? Object.values(surveyAnalytics.questionBreakdown)
        .filter((q) => q.topAnswer && q.topAnswer.percentage > 0)
        .sort(
          (a, b) =>
            (b.topAnswer?.percentage || 0) - (a.topAnswer?.percentage || 0),
        )
        .slice(0, 3)
    : [];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards dashboardData={dashboardData} />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive dashboardData={dashboardData} />
          </div>
          <div className="grid gap-4 px-4 md:grid-cols-2 lg:px-6">
            {surveyAnalytics && surveyAnalytics.survey && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Survey Insights</CardTitle>
                      <CardDescription>
                        Top responses from your active survey
                      </CardDescription>
                    </div>
                    <Link
                      href="/dashboard/surveys"
                      className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-medium"
                    >
                      View All
                      <IconArrowRight className="size-4" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                          <IconClipboardList className="text-primary size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {surveyAnalytics.survey.title}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {surveyAnalytics.totalResponses} responses
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {surveyAnalytics.completionRate}% complete
                      </Badge>
                    </div>

                    {topIssues.length > 0 ? (
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium">Top Issues</h3>
                        {topIssues.map((issue) => (
                          <div key={issue.questionId} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                {issue.questionText}
                              </span>
                              {issue.topAnswer && (
                                <Badge variant="outline">
                                  {issue.topAnswer.percentage}%
                                </Badge>
                              )}
                            </div>
                            {issue.topAnswer && (
                              <>
                                <p className="text-muted-foreground text-xs">
                                  {issue.topAnswer.label}
                                </p>
                                <Progress
                                  value={issue.topAnswer.percentage}
                                  className="h-1.5"
                                />
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border p-6 text-center">
                        <p className="text-muted-foreground text-sm">
                          No survey responses yet. Responses will appear here
                          once supporters complete your survey.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Verification Stats Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Verification Status</CardTitle>
                    <CardDescription>
                      Voter identity verification overview
                    </CardDescription>
                  </div>
                  <Link
                    href="/dashboard/verification"
                    className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-medium"
                  >
                    Manage
                    <IconArrowRight className="size-4" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3 text-center">
                      <div className="text-primary mx-auto mb-1 flex size-8 items-center justify-center rounded-lg bg-green-500/10">
                        <IconUsers className="size-4 text-green-600" />
                      </div>
                      <p className="text-foreground text-xl font-bold">
                        {dashboardData?.overview?.totalSupporters?.toLocaleString() ||
                          "0"}
                      </p>
                      <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">
                        Registered
                      </p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <div className="mx-auto mb-1 flex size-8 items-center justify-center rounded-lg bg-amber-500/10">
                        <IconFingerprint className="size-4 text-amber-600" />
                      </div>
                      <p className="text-foreground text-xl font-bold">0</p>
                      <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">
                        NIN Verified
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Verification Rate
                      </span>
                      <span className="font-medium">0%</span>
                    </div>
                    <Progress value={0} className="h-1.5" />
                  </div>
                  <div className="bg-primary/5 flex items-center gap-3 rounded-lg border p-3">
                    <IconShieldCheck className="text-primary size-5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-foreground text-xs font-medium">
                        Start verifying voters
                      </p>
                      <p className="text-muted-foreground text-[10px]">
                        Upgrade to Premium for NIN identity verification
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {tableData.length > 0 && <DataTable data={tableData} />}
        </div>
      </div>
    </div>
  );
}
