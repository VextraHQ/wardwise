"use client";

import { useState } from "react";
import {
  useCandidateDashboard,
  useCandidateRegistrationTrends,
} from "@/hooks/use-candidate-dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  Pie,
  PieChart,
  Cell,
  Bar,
  BarChart,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Generate theme-based color variations for pie charts
const getThemeColors = () => {
  // Using chart colors from theme (chart-1 through chart-5)
  return [
    "var(--chart-1)", // Primary green
    "var(--chart-2)", // Dark green
    "var(--chart-3)", // Medium green
    "var(--chart-4)", // Accent color
    "var(--chart-5)", // Muted green
  ];
};

const themeColors = getThemeColors();

export function AnalyticsContent() {
  const [trendPeriod, setTrendPeriod] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  const { data: dashboardData, isLoading } = useCandidateDashboard();
  const { data: dailyTrends } = useCandidateRegistrationTrends("daily");
  const { data: weeklyTrends } = useCandidateRegistrationTrends("weekly");
  const { data: monthlyTrends } = useCandidateRegistrationTrends("monthly");

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="bg-muted/20 h-10 w-48 rounded-sm" />
        </div>
        <Skeleton className="bg-muted/20 h-64 rounded-sm" />
        <Skeleton className="bg-muted/20 h-64 rounded-sm" />
        <Skeleton className="bg-muted/20 h-64 rounded-sm" />
      </div>
    );
  }

  const demographics = dashboardData?.demographics;
  const ageGroups = demographics?.ageGroups || {};
  const gender = demographics?.gender || {};

  // Transform data for charts
  const ageGroupData = Object.entries(ageGroups).map(([name, value]) => ({
    name,
    value,
  }));

  const genderData = Object.entries(gender).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const chartConfig = {
    registrations: {
      label: "Registrations",
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Detailed insights into your campaign performance and supporter
            demographics
          </p>
        </div>
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="bg-muted/40 rounded-sm p-1">
          <TabsTrigger
            value="trends"
            className="rounded-sm font-mono text-[10px] tracking-widest uppercase"
          >
            Registration Trends
          </TabsTrigger>
          <TabsTrigger
            value="demographics"
            className="rounded-sm font-mono text-[10px] tracking-widest uppercase"
          >
            Demographics
          </TabsTrigger>
          <TabsTrigger
            value="geographic"
            className="rounded-sm font-mono text-[10px] tracking-widest uppercase"
          >
            Geographic
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card className="border-border/60 rounded-sm shadow-none">
            <CardHeader>
              <CardTitle className="text-sm font-semibold tracking-tight">
                Registration Trends
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1 text-sm">
                Track voter registration growth over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <Button
                  variant={trendPeriod === "daily" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTrendPeriod("daily")}
                  className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
                >
                  Daily
                </Button>
                <Button
                  variant={trendPeriod === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTrendPeriod("weekly")}
                  className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
                >
                  Weekly
                </Button>
                <Button
                  variant={trendPeriod === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTrendPeriod("monthly")}
                  className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
                >
                  Monthly
                </Button>
              </div>
              {(() => {
                const trends =
                  trendPeriod === "daily"
                    ? dailyTrends
                    : trendPeriod === "weekly"
                      ? weeklyTrends
                      : monthlyTrends;
                return trends && trends.length > 0 ? (
                  <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                  >
                    <AreaChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="var(--primary)"
                        fill="var(--primary)"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <div className="text-muted-foreground flex h-[300px] items-center justify-center">
                    No registration data available
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/60 rounded-sm shadow-none">
              <CardHeader>
                <CardTitle className="text-sm font-semibold tracking-tight">
                  Age Groups
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1 text-sm">
                  Distribution by age
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ageGroupData.length > 0 ? (
                  <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                  >
                    <BarChart data={ageGroupData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="var(--primary)" />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="text-muted-foreground flex h-[300px] items-center justify-center">
                    No demographic data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60 rounded-sm shadow-none">
              <CardHeader>
                <CardTitle className="text-sm font-semibold tracking-tight">
                  Gender Distribution
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1 text-sm">
                  Supporters by gender
                </CardDescription>
              </CardHeader>
              <CardContent>
                {genderData.length > 0 ? (
                  <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                  >
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {genderData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={themeColors[index % themeColors.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="text-muted-foreground flex h-[300px] items-center justify-center">
                    No gender data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <Card className="border-border/60 rounded-sm shadow-none">
            <CardHeader>
              <CardTitle className="text-sm font-semibold tracking-tight">
                Geographic Distribution
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1 text-sm">
                Supporters by location
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.demographics?.locations ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-sm font-medium">By LGA</h3>
                    <div className="space-y-2">
                      {Object.entries(dashboardData.demographics.locations.lgas)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .slice(0, 10)
                        .map(([lga, count]) => (
                          <div
                            key={lga}
                            className="border-border/40 bg-muted/10 hover:bg-muted/20 flex items-center justify-between rounded-sm border p-3 transition-colors"
                          >
                            <span className="font-sans text-sm font-medium tracking-tight">
                              {lga}
                            </span>
                            <span className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
                              {count as number} supporters
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground flex h-[300px] items-center justify-center">
                  No geographic data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
