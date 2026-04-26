"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InsightsHero } from "./insights-hero";
import { InsightsSupporters } from "./insights-supporters";
import { InsightsMomentum } from "./insights-momentum";
import { InsightsGeography } from "./insights-geography";
import { InsightsBreakdown } from "./insights-breakdown";
import { CampaignInsightsHeader } from "./campaign-insights-header";
import { InsightsOverview, ReadyToCollectState } from "./insights-overview";
import {
  useCampaignReportSubmissions,
  useCampaignReportSummary,
} from "@/hooks/use-campaign-report";
import { useCampaignInsightsScope } from "@/hooks/use-campaign-insights-scope";
import {
  computeDelta,
  formatQueryDate,
  getPriorRange,
  getRecentWindowCount,
  getVerificationRate,
} from "@/lib/collect/reporting";
import { getEffectiveCampaignName } from "@/lib/collect/branding";
import { IconFlag, IconRefresh } from "@tabler/icons-react";

export function CampaignInsights({ token }: { token: string }) {
  const scope = useCampaignInsightsScope();

  const rangeParams = {
    ...(scope.dateFrom && { from: formatQueryDate(scope.dateFrom) }),
    ...(scope.dateTo && { to: formatQueryDate(scope.dateTo) }),
  };
  const summaryParams = {
    ...rangeParams,
    ...(scope.filterLga && { lga: scope.filterLga }),
    ...(scope.filterRole && { role: scope.filterRole }),
  };
  const activeParams =
    scope.hasRange || scope.hasFilters ? summaryParams : undefined;

  const {
    data: summary,
    isLoading: loading,
    error,
    dataUpdatedAt,
    refetch,
    isFetching,
  } = useCampaignReportSummary(token, activeParams);

  const { data: filterOptionSummary } = useCampaignReportSummary(
    token,
    scope.hasRange ? rangeParams : undefined,
  );
  const { data: allTimeSummary } = useCampaignReportSummary(token);

  const priorRange = scope.effectiveCompareOn
    ? getPriorRange(scope.dateFrom, scope.dateTo)
    : null;
  const priorParams = priorRange
    ? {
        ...priorRange,
        ...(scope.filterLga && { lga: scope.filterLga }),
        ...(scope.filterRole && { role: scope.filterRole }),
      }
    : undefined;
  const { data: priorSummary } = useCampaignReportSummary(
    priorParams ? token : "",
    priorParams,
  );

  const deltas =
    scope.effectiveCompareOn && priorSummary && summary
      ? {
          total: computeDelta(summary.stats.total, priorSummary.stats.total),
          verified: computeDelta(
            summary.stats.verified,
            priorSummary.stats.verified,
          ),
          flagged: computeDelta(
            summary.stats.flagged,
            priorSummary.stats.flagged,
          ),
        }
      : undefined;

  const {
    data: recentData,
    isLoading: recentLoading,
    error: recentError,
  } = useCampaignReportSubmissions(token, {
    page: 1,
    pageSize: 5,
    ...(scope.hasRange && rangeParams),
    ...(scope.filterLga && { lga: scope.filterLga }),
    ...(scope.filterRole && { role: scope.filterRole }),
  });

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-[220px] rounded-sm" />
        <div className="border-border/60 bg-muted/30 h-11 w-full rounded-sm border" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-sm" />
          ))}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[240px] rounded-sm" />
          <Skeleton className="h-[240px] rounded-sm" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[280px] rounded-sm" />
          <Skeleton className="h-[280px] rounded-sm" />
        </div>
        <Skeleton className="h-[260px] rounded-sm" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Card className="border-border/60 w-full max-w-md rounded-sm shadow-none">
          <CardContent className="flex flex-col items-center text-center">
            <div className="bg-destructive/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <IconFlag className="text-destructive h-6 w-6" />
            </div>
            <h2 className="text-foreground text-lg font-semibold">
              Unable to load report
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xs text-sm leading-relaxed">
              {error instanceof Error
                ? error.message
                : "Something went wrong while loading this report. Please try again."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-5 h-9 rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase"
              onClick={() => window.location.reload()}
            >
              <IconRefresh className="mr-1.5 h-3.5 w-3.5" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const campaignName = getEffectiveCampaignName(summary.campaign);
  const verifiedRate = getVerificationRate(
    summary.stats.total,
    summary.stats.verified,
  );
  const recentWindowCount = getRecentWindowCount(summary.stats.daily);
  const isFilteredView = scope.hasRange || scope.hasFilters;
  const allTimeTotal = allTimeSummary?.stats.total ?? summary.stats.total;
  const isEmpty = allTimeTotal === 0 && !isFilteredView;
  const momentumLabel =
    scope.effectiveCompareOn && priorSummary
      ? `${scope.activeScopeLabel} vs prior period`
      : scope.activeScopeLabel;
  const filterSource = filterOptionSummary ?? summary;

  return (
    <div className="space-y-4">
      <InsightsHero campaign={summary.campaign} total={allTimeTotal} />

      <Tabs defaultValue="overview" className="space-y-5">
        <CampaignInsightsHeader
          scope={scope}
          filterSource={filterSource}
          dataUpdatedAt={dataUpdatedAt}
          isFetching={isFetching}
          onRefresh={() => refetch()}
        />

        <TabsContent value="overview" className="space-y-6">
          <InsightsOverview
            summary={summary}
            campaignName={campaignName}
            deltas={deltas}
            recentSubmissions={recentData?.submissions ?? []}
            recentLoading={recentLoading}
            recentError={recentError instanceof Error ? recentError : null}
            isFilteredView={isFilteredView}
            isEmpty={isEmpty}
            recentWindowCount={recentWindowCount}
            verifiedRate={verifiedRate}
          />
        </TabsContent>

        <TabsContent value="supporters">
          <InsightsSupporters token={token} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {isEmpty ? (
            <ReadyToCollectState
              slug={summary.campaign.slug}
              campaignName={campaignName}
              party={summary.campaign.party}
              constituency={summary.campaign.constituency}
            />
          ) : (
            <>
              <InsightsMomentum
                daily={summary.stats.daily}
                comparisonDaily={
                  scope.effectiveCompareOn && priorSummary
                    ? priorSummary.stats.daily
                    : undefined
                }
                periodLabel={momentumLabel}
              />
              <InsightsGeography
                byLga={summary.stats.byLga}
                byWard={summary.stats.byWard}
              />
              <InsightsBreakdown
                byRole={summary.stats.byRole}
                bySex={summary.stats.bySex}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
