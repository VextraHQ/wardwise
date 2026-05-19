"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

function pct(total: number, value: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function pctLabel(total: number, value: number) {
  return total > 0 ? `${pct(total, value)}%` : "—";
}

const groupChartConfig: ChartConfig = {
  count: { label: "Tagged supporters", color: "var(--chart-2)" },
};

function QualityStat({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="border-border/60 rounded-sm border px-3 py-3">
      <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
        {label}
      </p>
      <p className="text-foreground mt-2 font-mono text-lg font-semibold tabular-nums sm:text-xl">
        {value}
      </p>
      <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>
    </div>
  );
}

function DetailNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/20 border-border/60 rounded-sm border px-3 py-3">
      <p className="text-foreground text-sm leading-relaxed font-medium">
        {children}
      </p>
    </div>
  );
}

function CoverageRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percent = pct(total, value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-foreground text-sm font-medium">{label}</p>
        <p className="font-mono text-xs font-semibold tabular-nums">
          {value.toLocaleString()} · {percent}%
        </p>
      </div>
      <div className="bg-muted h-1.5 overflow-hidden rounded-full">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(percent, value > 0 ? 4 : 0)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function GroupRankedList({
  items,
}: {
  items: { group: string; count: number }[];
}) {
  const maxCount = items[0]?.count ?? 0;

  return (
    <div className="space-y-2 lg:hidden">
      {items.map((group, index) => {
        const percent =
          maxCount > 0 ? Math.round((group.count / maxCount) * 100) : 0;
        return (
          <div key={`${group.group}-${index}`} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-medium">
                <span className="text-muted-foreground mr-1.5 font-mono text-xs">
                  {index + 1}.
                </span>
                {group.group}
              </p>
              <p className="shrink-0 font-mono text-xs font-semibold tabular-nums">
                {group.count.toLocaleString()}
              </p>
            </div>
            <div className="bg-muted h-1.5 overflow-hidden rounded-full">
              <div
                className="bg-chart-2 h-full rounded-full"
                style={{ width: `${Math.max(percent, 4)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function InsightsQuality({
  total,
  verified,
  withVin,
  withIdentity,
  withBoth,
  withSupportGroup,
  byGroup,
  showGroupStats,
}: {
  total: number;
  verified: number;
  withVin: number;
  withIdentity: number;
  withBoth: number;
  withSupportGroup: number;
  byGroup: { group: string; count: number }[];
  showGroupStats: boolean;
}) {
  const topGroup = byGroup[0];
  const topGroups = byGroup.slice(0, 6);
  const combinedLeaders = byGroup
    .slice(0, 3)
    .reduce((sum, item) => sum + item.count, 0);
  const groupCaptureRate = pctLabel(total, withSupportGroup);
  const missingVin = Math.max(total - withVin, 0);
  const groupChartData = topGroups.map((group) => ({
    group: group.group,
    count: group.count,
  }));

  return (
    <div
      className={cn(
        "grid gap-6",
        showGroupStats ? "xl:grid-cols-[1.05fr_0.95fr]" : "",
      )}
    >
      <Card className="border-border/60 min-w-0 overflow-hidden rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
            Verification Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            A quick look at how many supporters shared their VIN, NIN or
            membership details, or both in this view.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <QualityStat
              label="VIN Shared"
              value={withVin.toLocaleString()}
              subtitle={pctLabel(total, withVin)}
            />
            <QualityStat
              label="VIN Missing"
              value={missingVin.toLocaleString()}
              subtitle={pctLabel(total, missingVin)}
            />
            <QualityStat
              label="NIN / Membership"
              value={withIdentity.toLocaleString()}
              subtitle={pctLabel(total, withIdentity)}
            />
            <QualityStat
              label="Both Shared"
              value={withBoth.toLocaleString()}
              subtitle={pctLabel(total, withBoth)}
            />
          </div>

          <div className="space-y-3 rounded-sm border border-dashed px-3 py-3">
            <CoverageRow
              label="Supporters who shared VIN"
              value={withVin}
              total={total}
              color="var(--chart-1)"
            />
            <CoverageRow
              label="Supporters who shared NIN or membership"
              value={withIdentity}
              total={total}
              color="var(--chart-2)"
            />
            <CoverageRow
              label="Supporters who shared both"
              value={withBoth}
              total={total}
              color="var(--chart-3)"
            />
            <CoverageRow
              label="Verified by admin"
              value={verified}
              total={total}
              color="var(--chart-4)"
            />
          </div>

          <DetailNote>
            {withBoth === 0
              ? "Supporters are coming in, but none in this view have shared both VIN and NIN or membership details yet."
              : `${withBoth.toLocaleString()} supporters in this view shared both VIN and NIN or membership details, making follow-up cleaner for the campaign team.`}
          </DetailNote>

          <p className="text-muted-foreground text-xs leading-relaxed">
            Verified is separate from supporter count. It shows records the
            admin team has already checked.
          </p>
        </CardContent>
      </Card>

      {showGroupStats ? (
        <Card className="border-border/60 min-w-0 overflow-hidden rounded-sm shadow-none">
          <CardHeader>
            <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
              Support Groups
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <QualityStat
                label="Tagged Supporters"
                value={withSupportGroup.toLocaleString()}
                subtitle={`${groupCaptureRate} capture rate`}
              />
              <QualityStat
                label="Top Group"
                value={topGroup ? topGroup.count.toLocaleString() : "0"}
                subtitle={topGroup ? topGroup.group : "No group data yet"}
              />
            </div>

            {topGroups.length > 0 ? (
              <>
                <div className="space-y-3">
                  <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                    Group Leaders
                  </p>

                  <GroupRankedList items={topGroups.slice(0, 5)} />

                  <div className="hidden lg:block">
                    <ChartContainer
                      config={groupChartConfig}
                      className="h-[240px] w-full"
                    >
                      <BarChart
                        accessibilityLayer
                        data={groupChartData}
                        layout="vertical"
                        margin={{ left: 8, right: 8 }}
                      >
                        <CartesianGrid
                          horizontal={false}
                          strokeDasharray="3 3"
                        />
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="group"
                          tickFormatter={(value: string) =>
                            value.length > 20 ? `${value.slice(0, 20)}…` : value
                          }
                          tickLine={false}
                          axisLine={false}
                          width={136}
                          fontSize={11}
                        />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          cursor={false}
                        />
                        <Bar dataKey="count" radius={4} fill="var(--chart-2)" />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </div>

                <DetailNote>
                  {combinedLeaders > 0
                    ? `The top ${Math.min(byGroup.length, 3)} group${byGroup.length > 1 ? "s" : ""} account for ${combinedLeaders.toLocaleString()} tagged supporters in this view.`
                    : "Support-group trends will appear here once supporters begin tagging themselves."}
                </DetailNote>
              </>
            ) : (
              <div className="border-border/60 rounded-sm border border-dashed px-3 py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  No support-group data yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
