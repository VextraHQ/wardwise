"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { titleCase } from "@/lib/utils/text";

const roleChartConfig: ChartConfig = {
  count: { label: "Supporters", color: "var(--chart-1)" },
};

const mixChartConfig: ChartConfig = {
  value: { label: "Supporters", color: "var(--chart-2)" },
};

const mixColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

function MobileSummary({
  title,
  items,
}: {
  title: string;
  items: { name: string; value: number }[];
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-border/60 rounded-sm shadow-none lg:hidden">
      <CardHeader>
        <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className="font-mono text-xs tabular-nums">
                    {item.value} • {pct}%
                  </span>
                </div>
                <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                  <div
                    className="bg-primary/60 h-full rounded-full"
                    style={{ width: `${Math.max(pct, 3)}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No data yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function InsightsBreakdown({
  byRole,
  bySex,
}: {
  byRole: { role: string; count: number }[];
  bySex: { sex: string; count: number }[];
}) {
  const roleData = byRole.map((entry) => ({
    role: titleCase(entry.role),
    count: entry.count,
  }));
  const mixData = bySex.map((entry) => ({
    name: titleCase(entry.sex),
    value: entry.count,
  }));
  const mixTotal = mixData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <MobileSummary
        title="Supporter Roles"
        items={roleData.map((item) => ({ name: item.role, value: item.count }))}
      />
      <MobileSummary title="Supporter Mix" items={mixData} />

      <Card className="border-border/60 hidden min-w-0 overflow-hidden rounded-sm shadow-none lg:block">
        <CardHeader>
          <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
            Supporter Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {roleData.length > 0 ? (
            <ChartContainer
              config={roleChartConfig}
              className="h-[240px] w-full"
            >
              <BarChart accessibilityLayer data={roleData} layout="vertical">
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="role"
                  tickLine={false}
                  axisLine={false}
                  width={112}
                  fontSize={11}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={4} fill="var(--chart-1)" />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="text-muted-foreground flex h-[240px] items-center justify-center text-sm">
              No role data yet
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 hidden min-w-0 overflow-hidden rounded-sm shadow-none lg:block">
        <CardHeader>
          <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
            Supporter Mix
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mixData.length > 0 ? (
            <>
              <ChartContainer
                config={mixChartConfig}
                className="h-[220px] w-full"
              >
                <PieChart>
                  <Pie
                    data={mixData}
                    cx="50%"
                    cy="50%"
                    dataKey="value"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={78}
                    labelLine={false}
                  >
                    {mixData.map((entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={mixColors[index % mixColors.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>

              <div className="grid gap-2 sm:grid-cols-2">
                {mixData.map((entry, index) => {
                  const pct =
                    mixTotal > 0
                      ? Math.round((entry.value / mixTotal) * 100)
                      : 0;
                  return (
                    <div
                      key={`${entry.name}-${index}`}
                      className="flex items-center justify-between rounded-sm border border-dashed px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              mixColors[index % mixColors.length],
                          }}
                        />
                        <span className="text-sm font-medium">
                          {entry.name}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-semibold tabular-nums">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-muted-foreground flex h-[240px] items-center justify-center text-sm">
              No mix data yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
