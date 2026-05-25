"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CampaignReportSummary } from "@/features/reporting/types/campaign-report.types";

type ReferralStats = Pick<
  CampaignReportSummary["stats"],
  "referredCount" | "directCount" | "topKnownSources" | "otherReferralNames"
>;

function ReferralStat({
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
      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
        {subtitle}
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

function ReferralList({
  items,
  showPhone = false,
}: {
  items: { key: string; name: string; count: number; phone?: string | null }[];
  showPhone?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      {items.map((item, index) => (
        <div
          key={item.key}
          className="border-border/60 flex items-center justify-between gap-4 rounded-sm border border-dashed px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              <span className="text-muted-foreground mr-1.5 font-mono text-xs">
                {index + 1}.
              </span>
              {item.name}
            </p>
            {showPhone && item.phone ? (
              <p className="text-muted-foreground mt-0.5 font-mono text-xs">
                {item.phone}
              </p>
            ) : null}
          </div>
          <span className="shrink-0 font-mono text-xs font-semibold tabular-nums">
            {item.count.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function InsightsReferral({
  referredCount,
  directCount,
  topKnownSources,
  otherReferralNames,
}: ReferralStats) {
  const total = referredCount + directCount;
  const referredPct = total > 0 ? Math.round((referredCount / total) * 100) : 0;
  const directPct = total > 0 ? Math.max(0, 100 - referredPct) : 0;

  if (referredCount === 0) return null;

  return (
    <Card className="border-border/60 min-w-0 overflow-hidden rounded-sm shadow-none">
      <CardHeader>
        <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
          Canvasser Activity
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <ReferralStat
            label="Canvasser-Referred"
            value={referredCount.toLocaleString()}
            subtitle={`${referredPct}% named a canvasser in this view.`}
          />
          <ReferralStat
            label="Direct Supporters"
            value={directCount.toLocaleString()}
            subtitle={`${directPct}% submitted without a canvasser.`}
          />
        </div>

        {topKnownSources.length > 0 ? (
          <div className="space-y-3">
            <SectionEyebrow>Listed Canvassers</SectionEyebrow>
            <ReferralList
              showPhone
              items={topKnownSources.slice(0, 8).map((source) => ({
                key: source.id,
                name: source.name,
                phone: source.phone,
                count: source.count,
              }))}
            />
          </div>
        ) : null}

        {otherReferralNames.length > 0 ? (
          <div className="space-y-3">
            <SectionEyebrow>Typed Canvasser Names</SectionEyebrow>
            <ReferralList
              items={otherReferralNames.slice(0, 12).map((item, index) => ({
                key: `${item.name}-${item.phone ?? "no-phone"}-${index}`,
                name: item.name,
                count: item.count,
              }))}
            />
            <div className="bg-muted/20 border-border/60 rounded-sm border px-3 py-3">
              <p className="text-muted-foreground text-xs leading-relaxed">
                These names were typed manually by supporters, so alternate
                spellings, different phone formats, or repeat canvasser entries
                can still appear here.
              </p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
