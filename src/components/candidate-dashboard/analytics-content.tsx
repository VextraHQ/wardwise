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
  ChartConfig,
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
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
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
        <TabsList>
          <TabsTrigger value="trends">Registration Trends</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registration Trends</CardTitle>
              <CardDescription>
                Track voter registration growth over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <Button
                  variant={trendPeriod === "daily" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTrendPeriod("daily")}
                >
                  Daily
                </Button>
                <Button
                  variant={trendPeriod === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTrendPeriod("weekly")}
                >
                  Weekly
                </Button>
                <Button
                  variant={trendPeriod === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTrendPeriod("monthly")}
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
            <Card>
              <CardHeader>
                <CardTitle>Age Groups</CardTitle>
                <CardDescription>Distribution by age</CardDescription>
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

            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
                <CardDescription>Supporters by gender</CardDescription>
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
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Supporters by location</CardDescription>
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
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <span className="text-sm font-medium">{lga}</span>
                            <span className="text-muted-foreground text-sm">
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
