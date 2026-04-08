"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { IconChartBar } from "@tabler/icons-react";

const chartConfig: ChartConfig = {
  count: { label: "Registrations", color: "var(--chart-1)" },
};

export function InsightsMomentum({
  daily,
}: {
  daily: { date: string; count: number; cumulative: number }[];
}) {
  const hasData = daily.length > 0;
  const tickIndices = Array.from(
    new Set([0, Math.floor((daily.length - 1) / 2), daily.length - 1]),
  ).filter((index) => index >= 0);
  const tickValues = tickIndices
    .map((index) => daily[index]?.date)
    .filter(Boolean);

  const formatTick = (value: string) =>
    new Date(value).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
    });

  return (
    <Card className="border-border/60 min-w-0 overflow-hidden rounded-sm shadow-none">
      <CardHeader>
        <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
          Momentum
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer
            config={chartConfig}
            className="h-[230px] w-full md:h-[250px]"
          >
            <AreaChart
              data={daily}
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
