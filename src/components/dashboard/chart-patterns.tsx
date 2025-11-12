"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

/**
 * Mock Chart Patterns Showcase
 *
 * This file demonstrates various chart patterns using Shadcn's chart UI components.
 * Use these patterns as reference when implementing charts in the dashboard.
 */

// Mock data for different chart types
const registrationTrendsData = [
  { date: "Jan", registrations: 45, supporters: 32 },
  { date: "Feb", registrations: 52, supporters: 38 },
  { date: "Mar", registrations: 48, supporters: 35 },
  { date: "Apr", registrations: 61, supporters: 45 },
  { date: "May", registrations: 55, supporters: 42 },
  { date: "Jun", registrations: 67, supporters: 51 },
];

const wardComparisonData = [
  { ward: "Ward A", supporters: 45, target: 50 },
  { ward: "Ward B", supporters: 38, target: 50 },
  { ward: "Ward C", supporters: 52, target: 50 },
  { ward: "Ward D", supporters: 29, target: 50 },
  { ward: "Ward E", supporters: 41, target: 50 },
];

// Generate theme-based color variations for pie charts
// Using chart colors from theme for better visual distinction
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

const demographicsData = [
  { name: "18-25", value: 25, fill: themeColors[0] },
  { name: "26-35", value: 35, fill: themeColors[1] },
  { name: "36-45", value: 22, fill: themeColors[2] },
  { name: "46-55", value: 12, fill: themeColors[3] },
  { name: "55+", value: 6, fill: themeColors[4] },
];

const genderData = [
  { name: "Male", value: 58, fill: themeColors[0] },
  { name: "Female", value: 42, fill: themeColors[1] },
];

const surveyResponseData = [
  { question: "Q1", responses: 120, completed: 95 },
  { question: "Q2", responses: 115, completed: 92 },
  { question: "Q3", responses: 108, completed: 88 },
  { question: "Q4", responses: 125, completed: 98 },
];

const supportStrengthData = [
  { name: "Strong", value: 65, fill: "var(--chart-1)" },
  { name: "Moderate", value: 25, fill: "var(--chart-3)" },
  { name: "Weak", value: 10, fill: "var(--chart-5)" },
];

// Chart configurations - using app theme colors
const trendsChartConfig = {
  registrations: {
    label: "Registrations",
    color: "var(--primary)",
  },
  supporters: {
    label: "Supporters",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

const wardChartConfig = {
  supporters: {
    label: "Supporters",
    color: "var(--primary)",
  },
  target: {
    label: "Target",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

const demographicsChartConfig = {
  value: {
    label: "Count",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const surveyChartConfig = {
  responses: {
    label: "Total Responses",
    color: "var(--primary)",
  },
  completed: {
    label: "Completed",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

export function ChartPatternsShowcase() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Chart Patterns Showcase
        </h1>
        <p className="text-muted-foreground text-sm">
          Reference patterns for implementing charts in the dashboard
        </p>
      </div>

      {/* Area Chart - Registration Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Area Chart - Registration Trends</CardTitle>
          <CardDescription>
            Use for showing trends over time with filled area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={trendsChartConfig} className="h-[300px]">
            <AreaChart data={registrationTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="registrations"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.2}
              />
              <Area
                type="monotone"
                dataKey="supporters"
                stroke="var(--muted-foreground)"
                fill="var(--muted-foreground)"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Bar Chart - Ward Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Bar Chart - Ward Comparison</CardTitle>
          <CardDescription>
            Use for comparing values across categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={wardChartConfig} className="h-[300px]">
            <BarChart data={wardComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ward" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="supporters" fill="var(--primary)" />
              <Bar dataKey="target" fill="var(--muted-foreground)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Pie Chart - Demographics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pie Chart - Age Distribution</CardTitle>
            <CardDescription>
              Use for showing proportional distributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={demographicsChartConfig}
              className="h-[300px]"
            >
              <PieChart>
                <Pie
                  data={demographicsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="var(--primary)"
                  dataKey="value"
                >
                  {demographicsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pie Chart - Gender Distribution</CardTitle>
            <CardDescription>Simple two-category distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={demographicsChartConfig}
              className="h-[300px]"
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
                  fill="var(--primary)"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Line Chart - Survey Responses */}
      <Card>
        <CardHeader>
          <CardTitle>Line Chart - Survey Response Trends</CardTitle>
          <CardDescription>
            Use for showing trends without filled area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={surveyChartConfig} className="h-[300px]">
            <LineChart data={surveyResponseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="question" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="responses"
                stroke="var(--primary)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="var(--muted-foreground)"
                strokeWidth={2}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Composed Chart - Multiple Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Composed Chart - Multiple Metrics</CardTitle>
          <CardDescription>
            Combine bars and lines for different data types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={surveyChartConfig} className="h-[300px]">
            <ComposedChart data={surveyResponseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="question" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="responses" fill="var(--primary)" />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="var(--muted-foreground)"
                strokeWidth={2}
              />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Radial Bar Chart - Support Strength */}
      <Card>
        <CardHeader>
          <CardTitle>Radial Bar Chart - Support Strength</CardTitle>
          <CardDescription>
            Use for showing progress or percentage metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={demographicsChartConfig}
            className="h-[300px]"
          >
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              data={supportStrengthData}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={4}
                fill="var(--primary)"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
