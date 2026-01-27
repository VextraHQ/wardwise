"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  IconPhone,
  IconFingerprint,
  IconPercentage,
  IconShieldCheck,
  IconAlertTriangle,
  IconX,
  IconPlayerPlay,
  IconCrown,
  IconArrowRight,
} from "@tabler/icons-react";
import { toast } from "sonner";
import Link from "next/link";

/**
 * TODO: [BACKEND] Verification Campaign API
 * - POST /api/verification/campaigns - Start verification campaign
 * - GET /api/verification/campaigns - List campaigns
 * - GET /api/verification/campaigns/:id - Campaign details & progress
 * - GET /api/verification/stats - Aggregated verification stats
 */

// Mock tier — in production, fetch from subscription API
const CURRENT_TIER: "starter" | "standard" | "premium" = "premium";

const MOCK_STATS = {
  totalRegistered: 2847,
  phoneVerified: 0,
  identityVerified: 0,
  verificationRate: 0,
};

const MOCK_HISTORY = [
  {
    id: "vc-001",
    date: "2025-01-15",
    scope: "Yola North LGA",
    total: 500,
    verified: 420,
    mismatched: 50,
    failed: 30,
    cost: 250000,
  },
  {
    id: "vc-002",
    date: "2025-01-10",
    scope: "Karewa Ward",
    total: 150,
    verified: 132,
    mismatched: 12,
    failed: 6,
    cost: 75000,
  },
  {
    id: "vc-003",
    date: "2025-01-05",
    scope: "Doubeli Ward",
    total: 200,
    verified: 178,
    mismatched: 15,
    failed: 7,
    cost: 100000,
  },
];

const ADAMAWA_LGAS = [
  "Yola North",
  "Yola South",
  "Girei",
  "Fufore",
  "Song",
  "Gombi",
  "Hong",
  "Mubi North",
  "Mubi South",
  "Michika",
];

const WARDS_BY_LGA: Record<string, string[]> = {
  "Yola North": [
    "Karewa",
    "Doubeli",
    "Jimeta",
    "Alkalawa",
    "Luggere",
    "Nassarawo",
  ],
  "Yola South": ["Yolde Pate", "Adarawo", "Bole Yolde", "Namtari", "Toungo"],
};

export function VerificationContent() {
  const [selectedLga, setSelectedLga] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [campaignResults, setCampaignResults] = useState<{
    verified: number;
    mismatched: number;
    failed: number;
    total: number;
  } | null>(null);

  const voterCount = selectedWard ? 150 : selectedLga ? 500 : 0;
  const estimatedCost = voterCount * 500;

  const handleStartVerification = () => {
    if (!selectedLga) {
      toast.error("Please select an LGA to verify");
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setCampaignResults(null);

    // Simulate verification progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          setCampaignResults({
            verified: Math.round(voterCount * 0.84),
            mismatched: Math.round(voterCount * 0.1),
            failed: Math.round(voterCount * 0.06),
            total: voterCount,
          });
          toast.success("Verification campaign complete!");
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const tierAccess = {
    starter: { phone: false, identity: false },
    standard: { phone: true, identity: false },
    premium: { phone: true, identity: true },
  };

  const access = tierAccess[CURRENT_TIER];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Voter Verification
          </h1>
          <Badge variant="outline" className="gap-1 text-xs font-medium">
            <IconCrown className="size-3" />
            {CURRENT_TIER.charAt(0).toUpperCase() + CURRENT_TIER.slice(1)} Plan
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Verify registered voters to confirm their identity and ensure data
          integrity across your campaign database.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <IconUsers className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {MOCK_STATS.totalRegistered.toLocaleString()}
                </p>
                <p className="text-muted-foreground text-xs">
                  Total Registered
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={!access.phone ? "opacity-60" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <IconPhone className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {access.phone ? MOCK_STATS.phoneVerified : "\u2014"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {access.phone
                    ? "Phone Verified"
                    : "Upgrade to Standard"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={!access.identity ? "opacity-60" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                <IconFingerprint className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {access.identity ? MOCK_STATS.identityVerified : "\u2014"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {access.identity
                    ? "Identity Verified"
                    : "Upgrade to Premium"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <IconPercentage className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {MOCK_STATS.verificationRate}%
                </p>
                <p className="text-muted-foreground text-xs">
                  Verification Rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Campaign */}
      {!access.identity ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-2xl">
              <IconShieldCheck className="size-7" />
            </div>
            <div>
              <h3 className="text-foreground text-lg font-semibold">
                Unlock Identity Verification
              </h3>
              <p className="text-muted-foreground mx-auto mt-1 max-w-md text-sm">
                Upgrade to the Premium plan to run NIN identity verification
                campaigns and confirm your voters&apos; identities.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/pricing">
                View Plans
                <IconArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Start Verification Campaign</CardTitle>
            <CardDescription>
              Select a scope and verify registered voters in that area. Each NIN
              verification costs {"\u20A6"}500.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Scope Selection */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Local Government Area
                </label>
                <Select
                  value={selectedLga}
                  onValueChange={(val) => {
                    setSelectedLga(val);
                    setSelectedWard("");
                    setCampaignResults(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select LGA" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADAMAWA_LGAS.map((lga) => (
                      <SelectItem key={lga} value={lga}>
                        {lga}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ward (Optional)</label>
                <Select
                  value={selectedWard}
                  onValueChange={(val) => {
                    setSelectedWard(val);
                    setCampaignResults(null);
                  }}
                  disabled={
                    !selectedLga || !WARDS_BY_LGA[selectedLga]
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All wards" />
                  </SelectTrigger>
                  <SelectContent>
                    {(WARDS_BY_LGA[selectedLga] || []).map((ward) => (
                      <SelectItem key={ward} value={ward}>
                        {ward}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cost Estimate */}
            {selectedLga && (
              <div className="bg-muted/50 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {voterCount} voters in{" "}
                      {selectedWard
                        ? `${selectedWard} Ward`
                        : `${selectedLga} LGA`}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Estimated cost: {"\u20A6"}
                      {estimatedCost.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    onClick={handleStartVerification}
                    disabled={isRunning}
                    className="gap-2"
                  >
                    <IconPlayerPlay className="size-4" />
                    {isRunning ? "Verifying..." : `Verify ${voterCount} Voters`}
                  </Button>
                </div>

                {/* Progress Bar */}
                {isRunning && (
                  <div className="mt-4 space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-muted-foreground text-xs">
                      Verifying... {Math.round((progress / 100) * voterCount)}/
                      {voterCount} voters
                    </p>
                  </div>
                )}

                {/* Results Summary */}
                {campaignResults && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-950/30">
                      <div className="flex items-center justify-center gap-1">
                        <IconShieldCheck className="size-4 text-green-600" />
                        <span className="text-lg font-bold text-green-700 dark:text-green-300">
                          {campaignResults.verified}
                        </span>
                      </div>
                      <p className="text-xs text-green-600">Verified</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-3 text-center dark:bg-amber-950/30">
                      <div className="flex items-center justify-center gap-1">
                        <IconAlertTriangle className="size-4 text-amber-600" />
                        <span className="text-lg font-bold text-amber-700 dark:text-amber-300">
                          {campaignResults.mismatched}
                        </span>
                      </div>
                      <p className="text-xs text-amber-600">Mismatched</p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-3 text-center dark:bg-red-950/30">
                      <div className="flex items-center justify-center gap-1">
                        <IconX className="size-4 text-red-600" />
                        <span className="text-lg font-bold text-red-700 dark:text-red-300">
                          {campaignResults.failed}
                        </span>
                      </div>
                      <p className="text-xs text-red-600">Failed</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Verification History */}
      <Card>
        <CardHeader>
          <CardTitle>Verification History</CardTitle>
          <CardDescription>
            Past verification campaigns and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {MOCK_HISTORY.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <IconShieldCheck className="text-muted-foreground mb-4 size-12" />
              <h3 className="mb-2 text-lg font-semibold">
                No verification campaigns yet
              </h3>
              <p className="text-muted-foreground text-sm">
                Start a campaign above to verify your registered voters
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Verified</TableHead>
                  <TableHead className="text-right">Mismatched</TableHead>
                  <TableHead className="text-right">Failed</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_HISTORY.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      {new Date(campaign.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {campaign.scope}
                    </TableCell>
                    <TableCell className="text-right">
                      {campaign.total}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-green-600">{campaign.verified}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-amber-600">
                        {campaign.mismatched}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-red-600">{campaign.failed}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {"\u20A6"}
                      {campaign.cost.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
