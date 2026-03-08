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
          className="gap-2"
          onClick={() => handleExport("Full Report")}
        >
          <IconDownload className="size-4" />
          Export All
        </Button>
      </div>

      {/* Verification Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registration Summary</CardTitle>
              <CardDescription>
                Registration and data collection breakdown
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => handleExport("Verification Summary")}
            >
              <IconDownload className="size-3.5" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                  <IconUsers className="size-4" />
                </div>
                <span className="text-muted-foreground text-xs font-medium">
                  Total Registered
                </span>
              </div>
              <p className="text-foreground text-2xl font-bold">
                {MOCK_VERIFICATION_SUMMARY.totalRegistered.toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-green-500/10">
                  <IconFingerprint className="size-4 text-green-600" />
                </div>
                <span className="text-muted-foreground text-xs font-medium">
                  NIN Collected
                </span>
              </div>
              <p className="text-foreground text-2xl font-bold">
                {MOCK_VERIFICATION_SUMMARY.ninCollected.toLocaleString()}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {Math.round(
                  (MOCK_VERIFICATION_SUMMARY.ninCollected /
                    MOCK_VERIFICATION_SUMMARY.totalRegistered) *
                    100
                )}
                % of registrations
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10">
                  <IconAlertTriangle className="size-4 text-amber-600" />
                </div>
                <span className="text-muted-foreground text-xs font-medium">
                  NIN Missing
                </span>
              </div>
              <p className="text-foreground text-2xl font-bold">
                {MOCK_VERIFICATION_SUMMARY.ninMissing}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Registrations without NIN
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <IconShieldCheck className="size-4 text-blue-600" />
                </div>
                <span className="text-muted-foreground text-xs font-medium">
                  Phone Collected
                </span>
              </div>
              <p className="text-foreground text-2xl font-bold">
                {MOCK_VERIFICATION_SUMMARY.phoneCollected.toLocaleString()}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Primary contact channel
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <IconChartBar className="size-4 text-emerald-600" />
                </div>
                <span className="text-muted-foreground text-xs font-medium">
                  Data Quality Score
                </span>
              </div>
              <p className="text-foreground text-2xl font-bold">
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Deduplication Report</CardTitle>
              <CardDescription>
                NIN-based voter uniqueness analysis
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
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
            <div className="rounded-lg border p-4 text-center">
              <p className="text-foreground text-2xl font-bold">
                {MOCK_DEDUP_REPORT.uniqueVoters.toLocaleString()}
              </p>
              <p className="text-muted-foreground text-xs font-medium">
                Unique Voters
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-800 dark:bg-amber-950/30">
              <div className="flex items-center justify-center gap-1">
                <IconCopy className="size-4 text-amber-600" />
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {MOCK_DEDUP_REPORT.duplicateNins}
                </p>
              </div>
              <p className="text-xs font-medium text-amber-600">
                Duplicate NINs
              </p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-foreground text-2xl font-bold">
                {MOCK_DEDUP_REPORT.duplicateRate}%
              </p>
              <p className="text-muted-foreground text-xs font-medium">
                Duplicate Rate
              </p>
            </div>
          </div>

          {/* Top Duplicates */}
          {MOCK_DEDUP_REPORT.topDuplicates.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium">
                Top Duplicate NINs
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIN (Masked)</TableHead>
                    <TableHead className="text-right">
                      Registrations
                    </TableHead>
                    <TableHead>Wards</TableHead>
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ward Coverage Report</CardTitle>
              <CardDescription>
                Voter registrations and polling unit coverage by ward
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => handleExport("Coverage Report")}
            >
              <IconDownload className="size-3.5" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ward</TableHead>
                <TableHead className="text-right">Registered</TableHead>
                <TableHead className="text-right">Polling Units</TableHead>
                <TableHead className="text-right">Covered</TableHead>
                <TableHead>Coverage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_COVERAGE.map((ward) => (
                <TableRow key={ward.ward}>
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
                      <Progress
                        value={ward.coverage}
                        className="h-1.5 w-16"
                      />
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
