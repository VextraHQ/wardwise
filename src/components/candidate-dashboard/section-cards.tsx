"use client";

import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Dashboard Section Cards
 *
 * Displays key metrics calculated from voter data:
 * - Total Supporters: Calculated from actual voters
 * - Ward Coverage: Unique wards with supporters / total wards
 * - Polling Units: Unique polling units with supporters
 * - Support Strength: Registration coverage as engagement metric
 */

interface SectionCardsProps {
  dashboardData?: {
    totalSupporters: number;
    wardCoverage: {
      coveredWards: number;
      totalWards: number;
      coveragePercentage: number;
    };
    pollingUnitStats: {
      uniquePollingUnits: number;
    };
    supportStrength: number;
  };
}

export function SectionCards({ dashboardData }: SectionCardsProps) {
  const totalSupporters = dashboardData?.totalSupporters || 0;
  const wardCoverage = dashboardData?.wardCoverage || {
    coveredWards: 0,
    totalWards: 20,
    coveragePercentage: 0,
  };
  const pollingUnits = dashboardData?.pollingUnitStats?.uniquePollingUnits || 0;
  const supportStrength = dashboardData?.supportStrength || 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="border-border/60 hover:border-border group @container/card relative overflow-hidden rounded-sm shadow-none transition-colors">
        <div className="bg-primary/20 absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
        <CardHeader>
          <CardDescription className="text-muted-foreground/70 font-mono text-[10px] tracking-widest uppercase">
            Total Supporters
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalSupporters.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={`rounded-sm py-0 font-mono text-[11px] tracking-widest uppercase ${
                totalSupporters > 0
                  ? "border-primary/30 text-primary"
                  : "border-red-500/30 text-red-500"
              }`}
            >
              {totalSupporters > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {totalSupporters > 0 ? "Active" : "None"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {totalSupporters > 0
              ? "Growing supporter base"
              : "Start building your base"}{" "}
            {totalSupporters > 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            {totalSupporters > 0 ? `Registered` : "No supporters yet"}
          </div>
        </CardFooter>
      </Card>

      <Card className="border-border/60 hover:border-border group @container/card relative overflow-hidden rounded-sm shadow-none transition-colors">
        <div className="bg-primary/20 absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
        <CardHeader>
          <CardDescription className="text-muted-foreground/70 font-mono text-[10px] tracking-widest uppercase">
            Ward Coverage
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {wardCoverage.coveredWards}/{wardCoverage.totalWards}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={`rounded-sm py-0 font-mono text-[11px] tracking-widest uppercase ${
                wardCoverage.coveragePercentage >= 50
                  ? "border-primary/30 text-primary"
                  : "border-red-500/30 text-red-500"
              }`}
            >
              {wardCoverage.coveragePercentage >= 50 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {wardCoverage.coveragePercentage}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {wardCoverage.coveragePercentage >= 50
              ? "Strong ward presence"
              : "Expanding coverage"}{" "}
            {wardCoverage.coveragePercentage >= 50 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            {wardCoverage.coveragePercentage >= 50
              ? "Good territorial reach"
              : "More wards to cover"}
          </div>
        </CardFooter>
      </Card>

      <Card className="border-border/60 hover:border-border group @container/card relative overflow-hidden rounded-sm shadow-none transition-colors">
        <div className="bg-primary/20 absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
        <CardHeader>
          <CardDescription className="text-muted-foreground/70 font-mono text-[10px] tracking-widest uppercase">
            Polling Units
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {pollingUnits}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={`rounded-sm py-0 font-mono text-[11px] tracking-widest uppercase ${
                pollingUnits > 0
                  ? "border-primary/30 text-primary"
                  : "border-red-500/30 text-red-500"
              }`}
            >
              {pollingUnits > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {pollingUnits > 0 ? "Active" : "None"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {pollingUnits > 0
              ? "Units with supporters"
              : "No units covered yet"}{" "}
            {pollingUnits > 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            {pollingUnits > 0
              ? "Grassroots presence"
              : "Start at polling units"}
          </div>
        </CardFooter>
      </Card>

      <Card className="border-border/60 hover:border-border group @container/card relative overflow-hidden rounded-sm shadow-none transition-colors">
        <div className="bg-primary/20 absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
        <CardHeader>
          <CardDescription className="text-muted-foreground/70 font-mono text-[10px] tracking-widest uppercase">
            Support Strength
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {supportStrength}%
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={`rounded-sm py-0 font-mono text-[11px] tracking-widest uppercase ${
                supportStrength >= 50
                  ? "border-primary/30 text-primary"
                  : "border-red-500/30 text-red-500"
              }`}
            >
              {supportStrength >= 50 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {supportStrength >= 50 ? "Strong" : "Building"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {supportStrength >= 50
              ? "High engagement rate"
              : "Growing engagement"}{" "}
            {supportStrength >= 50 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            {supportStrength >= 50
              ? "Strong supporter commitment"
              : "Building momentum"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
