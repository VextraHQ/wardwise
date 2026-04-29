"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconUsers,
  IconFingerprint,
  IconShieldCheck,
  IconAlertTriangle,
  IconCopy,
  IconChartBar,
  IconMapPin,
  IconDownload,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * TODO: [BACKEND] Reports API
 * - GET /api/reports/verification-summary
 * - GET /api/reports/deduplication
 * - GET /api/reports/coverage
 * - GET /api/reports/export/:type - CSV/PDF export
 */

const MOCK_VERIFICATION_SUMMARY = {
  totalRegistered: 2847,
  ninCollected: 2689,
  ninMissing: 158,
  phoneCollected: 2847,
  dataQualityScore: 87,
};

const MOCK_DEDUP_REPORT = {
  uniqueVoters: 2801,
  duplicateNins: 46,
  duplicateRate: 1.6,
  topDuplicates: [
    { nin: "123****890", count: 3, wards: ["Karewa", "Doubeli"] },
    { nin: "456****234", count: 2, wards: ["Jimeta"] },
    { nin: "789****567", count: 2, wards: ["Alkalawa", "Luggere"] },
  ],
};

const MOCK_COVERAGE = [
  {
    ward: "Karewa Ward",
    registered: 245,
    pollingUnits: 8,
    coveredUnits: 6,
    coverage: 75,
  },
  {
    ward: "Doubeli Ward",
    registered: 198,
    pollingUnits: 6,
    coveredUnits: 5,
    coverage: 83,
  },
  {
    ward: "Jimeta Ward",
    registered: 312,
    pollingUnits: 10,
    coveredUnits: 7,
    coverage: 70,
  },
  {
    ward: "Alkalawa Ward",
    registered: 167,
    pollingUnits: 5,
    coveredUnits: 3,
    coverage: 60,
  },
  {
    ward: "Luggere Ward",
    registered: 134,
    pollingUnits: 4,
    coveredUnits: 2,
    coverage: 50,
  },
  {
    ward: "Nassarawo Ward",
    registered: 89,
    pollingUnits: 3,
    coveredUnits: 1,
    coverage: 33,
  },
];

export function ReportsContent() {
  const handleExport = (type: string) => {
    toast.info(`${type} export coming soon`, {
      description:
        "Export functionality will be available when backend is connected.",
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Campaign Reports
          </h1>
          <p className="text-muted-foreground text-sm">
            Registration summaries, data quality analysis, and coverage
            breakdowns
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 rounded-sm font-mono text-[11px] tracking-widest uppercase"
          onClick={() => handleExport("Full Report")}
        >
          <IconDownload className="size-4" />
          Export All
        </Button>
      </div>

      {/* Verification Summary */}
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight">
                Registration Summary
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1 text-sm">
                Registration and data collection breakdown
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 rounded-sm font-mono text-[10px] tracking-widest uppercase"
              onClick={() => handleExport("Verification Summary")}
            >
              <IconDownload className="size-3.5" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <div className="border-border/40 bg-muted/10 hover:bg-muted/20 rounded-sm border p-4 transition-all">
              <div className="mb-2 flex items-center gap-2">
                <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-sm">
                  <IconUsers className="size-4" />
                </div>
                <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                  Total Registered
                </span>
              </div>
              <p className="text-foreground font-mono text-2xl font-bold tracking-tight">
                {MOCK_VERIFICATION_SUMMARY.totalRegistered.toLocaleString()}
              </p>
            </div>

            <div className="border-border/40 bg-muted/10 hover:bg-muted/20 rounded-sm border p-4 transition-all">
              <div className="mb-2 flex items-center gap-2">
                <div className="bg-brand-emerald/10 flex size-8 items-center justify-center rounded-sm">
                  <IconFingerprint className="text-brand-lagoon size-4" />
                </div>
                <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                  NIN Collected
                </span>
              </div>
              <p className="text-foreground font-mono text-2xl font-bold tracking-tight">
                {MOCK_VERIFICATION_SUMMARY.ninCollected.toLocaleString()}
              </p>
              <p className="text-muted-foreground mt-1 font-mono text-[10px] font-bold tracking-widest uppercase">
                {Math.round(
                  (MOCK_VERIFICATION_SUMMARY.ninCollected /
                    MOCK_VERIFICATION_SUMMARY.totalRegistered) *
                    100,
                )}
                % of registrations
              </p>
            </div>

            <div className="border-border/40 bg-muted/10 hover:bg-muted/20 rounded-sm border p-4 transition-all">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-sm bg-amber-500/10">
                  <IconAlertTriangle className="size-4 text-amber-600" />
                </div>
                <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                  NIN Missing
                </span>
              </div>
              <p className="text-foreground font-mono text-2xl font-bold tracking-tight">
                {MOCK_VERIFICATION_SUMMARY.ninMissing}
              </p>
              <p className="text-muted-foreground mt-1 font-mono text-[10px] font-bold tracking-widest uppercase">
                Registrations without NIN
              </p>
            </div>

            <div className="border-border/40 bg-muted/10 hover:bg-muted/20 rounded-sm border p-4 transition-all">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-sm bg-blue-500/10">
                  <IconShieldCheck className="size-4 text-blue-600" />
                </div>
                <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                  Phone Collected
                </span>
              </div>
              <p className="text-foreground font-mono text-2xl font-bold tracking-tight">
                {MOCK_VERIFICATION_SUMMARY.phoneCollected.toLocaleString()}
              </p>
              <p className="text-muted-foreground mt-1 font-mono text-[10px] font-bold tracking-widest uppercase">
                Primary contact channel
              </p>
            </div>

            <div className="border-border/40 bg-muted/10 hover:bg-muted/20 rounded-sm border p-4 transition-all">
              <div className="mb-2 flex items-center gap-2">
                <div className="bg-brand-emerald/10 flex size-8 items-center justify-center rounded-sm">
                  <IconChartBar className="text-brand-lagoon size-4" />
                </div>
                <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                  Data Quality Score
                </span>
              </div>
              <p className="text-foreground font-mono text-2xl font-bold tracking-tight">
                {MOCK_VERIFICATION_SUMMARY.dataQualityScore}%
              </p>
              <Progress
                value={MOCK_VERIFICATION_SUMMARY.dataQualityScore}
                className="mt-2 h-1.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deduplication Report */}
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight">
                Deduplication Report
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1 text-sm">
                NIN-based voter uniqueness analysis
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 rounded-sm font-mono text-[10px] tracking-widest uppercase"
              onClick={() => handleExport("Deduplication Report")}
            >
              <IconDownload className="size-3.5" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border-border/40 bg-muted/10 hover:bg-muted/20 rounded-sm border p-4 text-center transition-all">
              <p className="text-foreground font-mono text-2xl font-bold tracking-tight">
                {MOCK_DEDUP_REPORT.uniqueVoters.toLocaleString()}
              </p>
              <p className="text-muted-foreground mt-1 font-mono text-[10px] font-bold tracking-widest uppercase">
                Unique Voters
              </p>
            </div>
            <div className="rounded-sm border border-amber-200 bg-amber-50 p-4 text-center transition-all hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:hover:bg-amber-900/40">
              <div className="flex items-center justify-center gap-1">
                <IconCopy className="size-4 text-amber-600" />
                <p className="font-mono text-2xl font-bold tracking-tight text-amber-700 dark:text-amber-300">
                  {MOCK_DEDUP_REPORT.duplicateNins}
                </p>
              </div>
              <p className="mt-1 font-mono text-[10px] font-bold tracking-widest text-amber-600 uppercase">
                Duplicate NINs
              </p>
            </div>
            <div className="border-border/40 bg-muted/10 hover:bg-muted/20 rounded-sm border p-4 text-center transition-all">
              <p className="text-foreground font-mono text-2xl font-bold tracking-tight">
                {MOCK_DEDUP_REPORT.duplicateRate}%
              </p>
              <p className="text-muted-foreground mt-1 font-mono text-[10px] font-bold tracking-widest uppercase">
                Duplicate Rate
              </p>
            </div>
          </div>

          {/* Top Duplicates */}
          {MOCK_DEDUP_REPORT.topDuplicates.length > 0 && (
            <div>
              <h3 className="text-muted-foreground mb-3 font-mono text-[11px] font-bold tracking-widest uppercase">
                Top Duplicate NINs
              </h3>
              <Table>
                <TableHeader className="bg-muted/30 border-border/60 border-b">
                  <TableRow>
                    <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                      NIN (Masked)
                    </TableHead>
                    <TableHead className="text-muted-foreground h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase">
                      Registrations
                    </TableHead>
                    <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                      Wards
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_DEDUP_REPORT.topDuplicates.map((dup, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-sm">
                        {dup.nin}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className="border-amber-500 text-amber-600"
                        >
                          {dup.count}x
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {dup.wards.join(", ")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coverage Report */}
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight">
                Ward Coverage Report
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1 text-sm">
                Voter registrations and polling unit coverage by ward
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 rounded-sm font-mono text-[10px] tracking-widest uppercase"
              onClick={() => handleExport("Coverage Report")}
            >
              <IconDownload className="size-3.5" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted/30 border-border/60 border-b">
              <TableRow>
                <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                  Ward
                </TableHead>
                <TableHead className="text-muted-foreground h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase">
                  Registered
                </TableHead>
                <TableHead className="text-muted-foreground h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase">
                  Polling Units
                </TableHead>
                <TableHead className="text-muted-foreground h-10 text-right font-mono text-[10px] font-bold tracking-widest uppercase">
                  Covered
                </TableHead>
                <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                  Coverage
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_COVERAGE.map((ward) => (
                <TableRow
                  key={ward.ward}
                  className={`transition-colors ${
                    ward.coverage < 50
                      ? "bg-destructive/5 hover:bg-destructive/10"
                      : ward.coverage < 75
                        ? "bg-amber-500/5 hover:bg-amber-500/10"
                        : "hover:bg-muted/30"
                  }`}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <IconMapPin className="text-muted-foreground size-4" />
                      {ward.ward}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {ward.registered}
                  </TableCell>
                  <TableCell className="text-right">
                    {ward.pollingUnits}
                  </TableCell>
                  <TableCell className="text-right">
                    {ward.coveredUnits}/{ward.pollingUnits}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={ward.coverage} className="h-1.5 w-16" />
                      <span
                        className={`text-xs font-medium ${
                          ward.coverage >= 75
                            ? "text-green-600"
                            : ward.coverage >= 50
                              ? "text-amber-600"
                              : "text-red-600"
                        }`}
                      >
                        {ward.coverage}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
