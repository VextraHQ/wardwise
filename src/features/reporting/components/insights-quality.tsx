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

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
      {children}
    </p>
  );
}

function CoverageRow({
  label,
  value,
  total,
  color,
  description,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  description?: string;
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
      {description ? (
        <p className="text-muted-foreground text-xs leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function ReviewProgressCard({
  verified,
  total,
}: {
  verified: number;
  total: number;
}) {
  const percent = pct(total, verified);

  return (
    <div className="bg-muted/20 border-border/60 space-y-3 rounded-sm border px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-foreground text-sm font-semibold">
            Verified by admin
          </p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            Records the campaign team has already reviewed and confirmed.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-lg font-semibold tabular-nums">
            {verified.toLocaleString()}
          </p>
          <p className="text-muted-foreground font-mono text-xs">
            {percent}% of total
          </p>
        </div>
      </div>
      <div className="bg-muted h-1.5 overflow-hidden rounded-full">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(percent, verified > 0 ? 4 : 0)}%`,
            backgroundColor: "var(--chart-4)",
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
  withoutVinAndIdentity,
  withSupportGroup,
  byGroup,
  showGroupStats,
}: {
  total: number;
  verified: number;
  withVin: number;
  withIdentity: number;
  withBoth: number;
  withoutVinAndIdentity: number;
  withSupportGroup: number;
  byGroup: { group: string; count: number }[];
  showGroupStats: boolean;
}) {
  const topGroup = byGroup[0];
  const topGroups = byGroup.slice(0, 5);
  const combinedLeaders = topGroups.reduce((sum, item) => sum + item.count, 0);
  const groupCaptureRate = pctLabel(total, withSupportGroup);
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
          <div className="space-y-3">
            <div className="space-y-3 rounded-sm border border-dashed px-3 py-3">
              <CoverageRow
                label="Supporters who shared VIN"
                value={withVin}
                total={total}
                color="var(--chart-1)"
                description="Helps confirm polling-unit registration and avoid duplicate VIN entries."
              />
              <CoverageRow
                label="Supporters who shared NIN or membership"
                value={withIdentity}
                total={total}
                color="var(--chart-2)"
                description="Shows how many supporters shared one of the core identity details available in this campaign."
              />
              <CoverageRow
                label="Supporters who shared both"
                value={withBoth}
                total={total}
                color="var(--chart-3)"
                description="These records are the most complete for follow-up and verification work."
              />
              <CoverageRow
                label="Supporters who shared neither VIN nor NIN or membership"
                value={withoutVinAndIdentity}
                total={total}
                color="var(--muted-foreground)"
                description="These supporters did not share any verification details."
              />
            </div>
          </div>

          <div className="space-y-3">
            <SectionEyebrow>Admin Review Progress</SectionEyebrow>
            <ReviewProgressCard verified={verified} total={total} />
          </div>

          {withBoth === 0 ? (
            <DetailNote>
              Supporters are coming in, but none in this view have shared both
              VIN and NIN or membership details yet.
            </DetailNote>
          ) : null}

          <p className="text-muted-foreground text-xs leading-relaxed">
            Shared details come from supporters during registration. Verified
            records are a separate admin review step.
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
                    Leading Groups
                  </p>

                  <GroupRankedList items={topGroups} />

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
                    ? `Showing the top ${topGroups.length} group${topGroups.length > 1 ? "s" : ""} in this view. Together they account for ${combinedLeaders.toLocaleString()} tagged supporters${byGroup.length > topGroups.length ? ". Use Supporters to browse every tagged supporter." : "."}`
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
