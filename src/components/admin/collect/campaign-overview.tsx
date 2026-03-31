"use client";

import { useState } from "react";
import { useCampaign, useCampaignStats } from "@/hooks/use-collect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { roleLabels } from "@/lib/helpers/collect-analytics";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  IconChartBar,
  IconUsers,
  IconFlag,
  IconShieldCheck,
  IconClipboardList,
  IconCalendar,
} from "@tabler/icons-react";
import Image from "next/image";

const dailyChartConfig: ChartConfig = {
  count: { label: "Registrations", color: "var(--chart-1)" },
};

const lgaChartConfig: ChartConfig = {
  count: { label: "Submissions", color: "var(--chart-2)" },
};

const trendChartConfig: ChartConfig = {
  cumulative: { label: "Total Registrations", color: "var(--chart-3)" },
};

const wardChartConfig: ChartConfig = {
  count: { label: "Submissions", color: "var(--chart-4)" },
};

function getPresetRange(preset: string): { from?: string; to?: string } {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  switch (preset) {
    case "7d": {
      const from = new Date(now);
      from.setDate(from.getDate() - 7);
      return { from: fmt(from), to: fmt(now) };
    }
    case "30d": {
      const from = new Date(now);
      from.setDate(from.getDate() - 30);
      return { from: fmt(from), to: fmt(now) };
    }
    case "month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: fmt(from), to: fmt(now) };
    }
    default:
      return {};
  }
}

export function CampaignOverview({ campaignId }: { campaignId: string }) {
  const { data: campaign } = useCampaign(campaignId);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const statsParams = {
    ...(dateFrom && { from: dateFrom }),
    ...(dateTo && { to: dateTo }),
  };
  const { data: stats } = useCampaignStats(
    campaignId,
    Object.keys(statsParams).length > 0 ? statsParams : undefined,
  );

  const total = stats?.total || 0;
  const verified = stats?.verified || 0;
  const flagged = stats?.flagged || 0;

  const dailyData = stats?.daily || [];
  const lgaData = stats?.byLga || [];
  const roleData = stats?.byRole || [];
  const sexData = stats?.bySex || [];
  const trendData = stats?.daily || [];
  const wardData = stats?.byWard || [];

  if (!campaign) {
    return (
      <div className="space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/60 rounded-sm shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-9 rounded-sm" />
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const baseUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_COLLECT_BASE_URL || window.location.origin
      : "";
  const formUrl = `${baseUrl}/c/${campaign.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(formUrl)}&size=256x256`;

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <IconCalendar className="text-muted-foreground h-4 w-4" />
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-8 w-auto rounded-sm text-xs"
          placeholder="From"
        />
        <span className="text-muted-foreground text-xs">to</span>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="h-8 w-auto rounded-sm text-xs"
          placeholder="To"
        />
        <div className="flex gap-1">
          {[
            { label: "7d", value: "7d" },
            { label: "30d", value: "30d" },
            { label: "This month", value: "month" },
            { label: "All time", value: "all" },
          ].map((p) => (
            <Button
              key={p.value}
              variant="outline"
              size="sm"
              className="h-7 rounded-sm px-2 text-[10px] font-medium tracking-wide uppercase"
              onClick={() => {
                const range = getPresetRange(p.value);
                setDateFrom(range.from || "");
                setDateTo(range.to || "");
              }}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 rounded-sm shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
              Total Submissions
            </CardTitle>
            <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-sm">
              <IconClipboardList className="text-primary h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-mono text-2xl font-semibold tabular-nums">
              {total}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              All registrations
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60 rounded-sm shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
              Verified
            </CardTitle>
            <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-sm">
              <IconShieldCheck className="text-primary h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-mono text-2xl font-semibold tabular-nums">
              {verified}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {total > 0 ? `${Math.round((verified / total) * 100)}%` : "0%"} of
              total
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60 rounded-sm shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
              Flagged
            </CardTitle>
            <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-sm">
              <IconFlag className="text-primary h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-mono text-2xl font-semibold tabular-nums">
              {flagged}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Requires review
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60 rounded-sm shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
              LGAs Active
            </CardTitle>
            <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-sm">
              <IconUsers className="text-primary h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-mono text-2xl font-semibold tabular-nums">
              {campaign.enabledLgaIds.length}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Enabled for collection
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Daily Registrations */}
        <Card className="border-border/60 rounded-sm shadow-none">
          <CardHeader className="">
            <CardTitle className="text-sm font-semibold tracking-tight">
              Daily Registrations
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            {dailyData.length > 0 ? (
              <ChartContainer config={dailyChartConfig} className="h-48 w-full">
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    fill="var(--chart-1)"
                    fillOpacity={0.3}
                    stroke="var(--chart-1)"
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="border-border flex flex-col items-center gap-2 rounded-sm border border-dashed py-12 text-center">
                <IconChartBar className="text-muted-foreground h-8 w-8" />
                <p className="text-muted-foreground text-sm">
                  No submissions yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* By LGA */}
        <Card className="border-border/60 rounded-sm shadow-none">
          <CardHeader className="">
            <CardTitle className="text-sm font-semibold tracking-tight">
              Submissions by LGA
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            {lgaData.length > 0 ? (
              <ChartContainer config={lgaChartConfig} className="h-48 w-full">
                <BarChart data={lgaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="lga" tick={{ fontSize: 11 }} />
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
              <div className="border-border flex flex-col items-center gap-2 rounded-sm border border-dashed py-12 text-center">
                <IconChartBar className="text-muted-foreground h-8 w-8" />
                <p className="text-muted-foreground text-sm">
                  No submissions yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Registration Trend + Top Wards */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 rounded-sm shadow-none">
          <CardHeader className="">
            <CardTitle className="text-sm font-semibold tracking-tight">
              Registration Trend (Cumulative)
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            {trendData.length > 1 ? (
              <ChartContainer config={trendChartConfig} className="h-48 w-full">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke="var(--chart-3)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Need more data for trend
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 rounded-sm shadow-none">
          <CardHeader className="">
            <CardTitle className="text-sm font-semibold tracking-tight">
              Top Wards (by Registrations)
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            {wardData.length > 0 ? (
              <ChartContainer config={wardChartConfig} className="h-48 w-full">
                <BarChart data={wardData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="ward"
                    width={100}
                    tick={{ fontSize: 10 }}
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
              <div className="border-border flex flex-col items-center gap-2 rounded-sm border border-dashed py-12 text-center">
                <IconChartBar className="text-muted-foreground h-8 w-8" />
                <p className="text-muted-foreground text-sm">
                  No submissions yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Demographics + QR Code */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Role Breakdown */}
        <Card className="border-border/60 rounded-sm shadow-none">
          <CardHeader className="">
            <CardTitle className="text-sm font-semibold tracking-tight">
              By Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            {roleData.length > 0 ? (
              <div className="space-y-2">
                {roleData.map((r) => (
                  <div
                    key={r.role}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{roleLabels[r.role] || r.role}</span>
                    <span className="font-mono font-medium tabular-nums">
                      {r.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-border flex flex-col items-center justify-center rounded-sm border border-dashed py-6 text-center">
                <p className="text-muted-foreground text-sm">No data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sex Breakdown */}
        <Card className="border-border/60 rounded-sm shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-tight">
              By Sex
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sexData.length > 0 ? (
              <div className="space-y-2">
                {sexData.map((s) => (
                  <div
                    key={s.sex}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="capitalize">{s.sex}</span>
                    <span className="font-mono font-medium tabular-nums">
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-border flex flex-col items-center justify-center rounded-sm border border-dashed py-6 text-center">
                <p className="text-muted-foreground text-sm">No data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card className="border-border/60 rounded-sm shadow-none">
          <CardHeader className="">
            <CardTitle className="text-sm font-semibold tracking-tight">
              Registration QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            {campaign.status === "active" ? (
              <>
                <Image
                  src={qrUrl}
                  alt="QR Code"
                  width={160}
                  height={160}
                  className="h-40 w-40 rounded"
                />
                <p className="text-muted-foreground max-w-full truncate text-xs">
                  {formUrl}
                </p>
                <button
                  className="text-primary text-xs underline"
                  onClick={async () => {
                    const res = await fetch(qrUrl);
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `qr-${campaign.slug}.png`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download QR
                </button>
              </>
            ) : (
              <p className="text-muted-foreground py-6 text-center text-sm">
                QR code available when campaign is active.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
