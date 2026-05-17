"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "An interactive area chart";

const chartConfig = {
  registrations: {
    label: "Registrations",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({
  dashboardData,
}: {
  dashboardData?: {
    registrationTrends?: Array<{ date: string; count: number; label: string }>;
  };
}) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("7d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  // Use registration trends from dashboard data, or fallback to empty array
  const trendsData = dashboardData?.registrationTrends || [];

  // Transform trends data to chart format
  const chartData = trendsData.map((trend) => ({
    date: trend.date,
    registrations: trend.count,
  }));

  // If no data, use empty array
  const filteredData =
    chartData.length > 0
      ? chartData.filter((item) => {
          const date = new Date(item.date);
          const referenceDate = new Date();
          let daysToSubtract = 90;
          if (timeRange === "30d") {
            daysToSubtract = 30;
          } else if (timeRange === "7d") {
            daysToSubtract = 7;
          }
          const startDate = new Date(referenceDate);
          startDate.setDate(startDate.getDate() - daysToSubtract);
          return date >= startDate;
        })
      : [];

  return (
    <Card className="border-border/60 @container/card rounded-sm shadow-none">
      <CardHeader>
        <CardTitle className="text-sm font-semibold tracking-tight">
          Registration Trends
        </CardTitle>
        <CardDescription className="text-muted-foreground/70 font-mono text-[10px] tracking-widest uppercase">
          <span className="hidden @[540px]/card:block">
            Voter Registrations Over Time
          </span>
          <span className="@[540px]/card:hidden">Registration Trends</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:rounded-sm *:data-[slot=toggle-group-item]:px-4! *:data-[slot=toggle-group-item]:font-mono *:data-[slot=toggle-group-item]:text-[11px] *:data-[slot=toggle-group-item]:tracking-widest *:data-[slot=toggle-group-item]:uppercase @[767px]/card:flex"
          >
            <ToggleGroupItem value="7d">7 Days</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 Days</ToggleGroupItem>
            <ToggleGroupItem value="90d">90 Days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-32 rounded-sm font-mono text-[11px] tracking-widest uppercase **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="90 Days" />
            </SelectTrigger>
            <SelectContent className="rounded-sm">
              <SelectItem
                value="7d"
                className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
              >
                7 Days
              </SelectItem>
              <SelectItem
                value="30d"
                className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
              >
                30 Days
              </SelectItem>
              <SelectItem
                value="90d"
                className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
              >
                90 Days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient
                id="fillRegistrations"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-registrations)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-registrations)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="registrations"
              type="natural"
              fill="url(#fillRegistrations)"
              stroke="var(--color-registrations)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
