"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";
import { IconChartBar } from "@tabler/icons-react";
import { formatDateKey } from "@/lib/collect/reporting";

const chartConfig: ChartConfig = {
  count: { label: "Current period", color: "var(--chart-1)" },
  priorCount: { label: "Prior period", color: "var(--muted-foreground)" },
};

export function InsightsMomentum({
  daily,
  comparisonDaily,
  periodLabel,
}: {
  daily: { date: string; count: number; cumulative: number }[];
  comparisonDaily?: { date: string; count: number; cumulative: number }[];
  periodLabel?: string;
}) {
  const hasData = daily.length > 0;
  const chartData = daily.map((entry, index) => ({
    ...entry,
    priorCount: comparisonDaily?.[index]?.count ?? null,
    priorDate: comparisonDaily?.[index]?.date ?? null,
  }));
  const tickIndices = Array.from(
    new Set([0, Math.floor((daily.length - 1) / 2), daily.length - 1]),
  ).filter((index) => index >= 0);
  const tickValues = tickIndices
    .map((index) => daily[index]?.date)
    .filter(Boolean);

  const formatTick = (value: string) => formatDateKey(value);

  return (
    <Card className="border-border/60 min-w-0 overflow-hidden rounded-sm shadow-none">
      <CardHeader>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
            Momentum
          </CardTitle>
          {periodLabel && (
            <p className="text-muted-foreground text-xs">{periodLabel}</p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer
            config={chartConfig}
            className="h-[230px] w-full md:h-[250px]"
          >
            <AreaChart
              data={chartData}
              accessibilityLayer
              margin={{ left: 0, right: 8, top: 8, bottom: 4 }}
            >
              <defs>
                <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                ticks={tickValues}
                tickMargin={10}
                minTickGap={24}
                tickFormatter={formatTick}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={10}
                width={28}
                allowDecimals={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      typeof value === "string" ? formatTick(value) : value
                    }
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#pulseGrad)"
              />
              {comparisonDaily && comparisonDaily.length > 0 && (
                <Line
                  type="monotone"
                  dataKey="priorCount"
                  stroke="var(--muted-foreground)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={false}
                />
              )}
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[220px] flex-col items-center justify-center text-center">
            <IconChartBar className="text-muted-foreground/40 mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">No data yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
