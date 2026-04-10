"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { formatGeoDisplayName } from "@/lib/geo/display";

const lgaChartConfig: ChartConfig = {
  count: { label: "Submissions", color: "var(--chart-2)" },
};

const wardChartConfig: ChartConfig = {
  count: { label: "Submissions", color: "var(--chart-4)" },
};

function RankedList({
  title,
  items,
  nameKey,
}: {
  title: string;
  items: { name: string; count: number }[];
  nameKey: string;
}) {
  if (items.length === 0) {
    return (
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-6 text-center text-sm">
            No data yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxCount = items[0]?.count ?? 1;

  return (
    <Card className="border-border/60 rounded-sm shadow-none lg:hidden">
      <CardHeader>
        <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {items.map((item, i) => (
          <div key={`${nameKey}-${item.name}`} className="space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-medium">
                <span className="text-muted-foreground mr-1.5 font-mono text-xs">
                  {i + 1}.
                </span>
                {formatGeoDisplayName(item.name)}
              </span>
              <span className="shrink-0 font-mono text-sm font-semibold tabular-nums">
                {item.count.toLocaleString()}
              </span>
            </div>
            <div className="bg-muted h-1.5 overflow-hidden rounded-full">
              <div
                className="bg-primary/60 h-full rounded-full transition-all"
                style={{
                  width: `${Math.max((item.count / maxCount) * 100, 2)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function InsightsGeography({
  byLga,
  byWard,
}: {
  byLga: { lga: string; count: number }[];
  byWard: { ward: string; count: number }[];
}) {
  const lgaItems = byLga.map((d) => ({ name: d.lga, count: d.count }));
  const wardItems = byWard.map((d) => ({ name: d.ward, count: d.count }));
  const lgaChartData = byLga.slice(0, 8).map((entry) => ({
    lga: formatGeoDisplayName(entry.lga),
    count: entry.count,
  }));
  const wardChartData = byWard.slice(0, 8).map((entry) => ({
    ward: formatGeoDisplayName(entry.ward),
    count: entry.count,
  }));

  const truncateLabel = (value: string, max = 16) =>
    value.length > max ? `${value.slice(0, max - 1)}…` : value;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <RankedList title="Top LGAs" items={lgaItems} nameKey="lga" />
      <RankedList title="Top Wards" items={wardItems} nameKey="ward" />

      <Card className="border-border/60 hidden min-w-0 overflow-hidden rounded-sm shadow-none lg:block">
        <CardHeader>
          <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
            Submissions by LGA
          </CardTitle>
        </CardHeader>
        <CardContent className="pl-0">
          {lgaChartData.length > 0 ? (
            <ChartContainer
              config={lgaChartConfig}
              className="h-[260px] w-full"
            >
              <BarChart data={lgaChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="lga"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-16}
                  textAnchor="end"
                  height={54}
                  tickFormatter={(value) => truncateLabel(String(value))}
                />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--chart-2)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="text-muted-foreground flex h-[260px] items-center justify-center text-sm">
              No data yet
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 hidden min-w-0 overflow-hidden rounded-sm shadow-none lg:block">
        <CardHeader>
          <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
            Top Wards
          </CardTitle>
        </CardHeader>
        <CardContent className="pl-0">
          {wardChartData.length > 0 ? (
            <ChartContainer
              config={wardChartConfig}
              className="h-[260px] w-full"
            >
              <BarChart data={wardChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="ward"
                  width={148}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => truncateLabel(String(value), 20)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--chart-4)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="text-muted-foreground flex h-[260px] items-center justify-center text-sm">
              No data yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
