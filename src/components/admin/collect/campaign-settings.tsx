"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
} from "@/hooks/use-collect";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { track } from "@/lib/analytics/client";
import {
  IconTrash,
  IconPlayerPlay,
  IconPlayerPause,
  IconLock,
  IconFileDescription,
  IconRefresh,
  IconEye,
  IconCopy,
  IconShieldCheck,
  IconExternalLink,
  IconRotateClockwise,
  IconKey,
} from "@tabler/icons-react";
import { adminCollectApi } from "@/lib/api/collect";
import type { Campaign } from "@/types/collect";
import {
  campaignBrandingTypes,
  getCampaignBrandingLabel,
  getEffectiveCampaignName,
} from "@/lib/collect/branding";
import { formatPersonName } from "@/lib/utils";

const CAMPAIGN_STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border/60",
  active: "bg-primary/10 text-primary border-primary/30",
  paused: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  closed: "bg-destructive/10 text-destructive border-destructive/30",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(
    () => toast.success(`${label} copied`),
    () => toast.error("Failed to copy"),
  );
}

export function CampaignSettings({ campaignId }: { campaignId: string }) {
  const dangerConfirmInputId = useId();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: campaign, isLoading } = useCampaign(campaignId) as {
    data: Campaign | undefined;
    isLoading: boolean;
  };
  const updateMutation = useUpdateCampaign(campaignId);
  const deleteMutation = useDeleteCampaign();

  // Local state
  const [deleteSlug, setDeleteSlug] = useState("");
  const [visiblePasscode, setVisiblePasscode] = useState<string | null>(null);
  const [regeneratingToken, setRegeneratingToken] = useState(false);
  const [resettingPasscode, setResettingPasscode] = useState(false);
  const [brandingType, setBrandingType] =
    useState<Campaign["brandingType"]>("candidate");
  const [displayName, setDisplayName] = useState("");

  const submissionCount = campaign?._count?.submissions ?? 0;

  // Client report derived state
  const isEnabled = campaign?.clientReportEnabled ?? false;
  const baseUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_COLLECT_BASE_URL || window.location.origin
      : "";
  const reportUrl = campaign?.clientReportToken
    ? `${baseUrl}/r/${campaign.clientReportToken}`
    : "";

  const updatePatch = updateMutation.variables as
    | {
        status?: string;
        brandingType?: Campaign["brandingType"];
        displayName?: string | null;
        enabledLgaIds?: number[];
        clientReportEnabled?: boolean;
      }
    | undefined;
  const isEnablingClientReport =
    updateMutation.isPending && updatePatch?.clientReportEnabled === true;
  const isRevokingClientReport =
    updateMutation.isPending && updatePatch?.clientReportEnabled === false;
  const pendingStatusTarget =
    updateMutation.isPending && updatePatch?.status != null
      ? updatePatch.status
      : null;
  const isBrandingSaving =
    updateMutation.isPending &&
    updatePatch != null &&
    ("brandingType" in updatePatch || "displayName" in updatePatch) &&
    updatePatch.status === undefined &&
    updatePatch.enabledLgaIds === undefined &&
    updatePatch.clientReportEnabled === undefined;
  const isBoundaryResetPending =
    updateMutation.isPending && updatePatch?.enabledLgaIds != null;

  useEffect(() => {
    if (!campaign) return;
    setBrandingType(campaign.brandingType);
    setDisplayName(campaign.displayName ?? "");
  }, [campaign]);

  if (isLoading || !campaign) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64" />
      </div>
    );
  }

  const handleStatusChange = (status: string) => {
    updateMutation.mutate(
      { status },
      {
        onSuccess: () => {
          track("admin_campaign_updated", {
            action: "status_changed",
            campaign_id: campaignId,
            next_status: status,
          });
          toast.success(`Campaign ${status}`);
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const handleDelete = () => {
    if (deleteSlug !== campaign.slug) {
      toast.error("Slug does not match");
      return;
    }
    deleteMutation.mutate(campaignId, {
      onSuccess: () => {
        track("admin_campaign_deleted", {
          campaign_id: campaignId,
        });
        toast.success("Campaign deleted");
        router.push("/admin/collect");
      },
      onError: (e) => toast.error(e.message),
    });
  };

  const currentCandidateBoundaryIds =
    campaign.currentCandidateBoundaryLgaIds ?? [];
  const canShowBoundarySync =
    currentCandidateBoundaryIds.length > 0 ||
    Boolean(campaign.candidateBoundaryError) ||
    Boolean(campaign.isBoundaryOutOfSync);
  const canResetToCandidateBoundary =
    currentCandidateBoundaryIds.length > 0 &&
    campaign.isBoundaryOutOfSync === true;

  const handleResetBoundary = () => {
    if (!canResetToCandidateBoundary) return;

    updateMutation.mutate(
      { enabledLgaIds: currentCandidateBoundaryIds },
      {
        onSuccess: () => {
          track("admin_campaign_updated", {
            action: "boundary_reset",
            campaign_id: campaignId,
          });
          toast.success("Campaign boundary reset to the candidate boundary");
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const handleEnableClientAccess = () => {
    updateMutation.mutate(
      { clientReportEnabled: true },
      {
        onSuccess: (data) => {
          track("admin_campaign_updated", {
            action: "client_report_enabled",
            campaign_id: campaignId,
          });
          const passcode = (data as { clientReportPasscode?: string })
            ?.clientReportPasscode;
          if (passcode) setVisiblePasscode(passcode);
          toast.success("Client report enabled");
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const handleRevokeClientAccess = () => {
    setVisiblePasscode(null);
    updateMutation.mutate(
      { clientReportEnabled: false },
      {
        onSuccess: () => {
          track("admin_campaign_updated", {
            action: "client_report_revoked",
            campaign_id: campaignId,
          });
          toast.success("Client report access revoked");
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const handleRegenerateToken = async () => {
    setRegeneratingToken(true);
    try {
      await adminCollectApi.regenerateReportToken(campaignId);
      track("admin_campaign_updated", {
        action: "client_report_token_regenerated",
        campaign_id: campaignId,
      });
      setVisiblePasscode(null);
      updateMutation.reset();
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-campaign", campaignId],
        }),
        queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] }),
      ]);
      toast.success("Client report link regenerated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to regenerate");
    } finally {
      setRegeneratingToken(false);
    }
  };

  const handleResetPasscode = async () => {
    setResettingPasscode(true);
    try {
      const data = await adminCollectApi.resetReportPasscode(campaignId);
      track("admin_campaign_updated", {
        action: "client_report_passcode_reset",
        campaign_id: campaignId,
      });
      setVisiblePasscode(data.passcode);
      await queryClient.invalidateQueries({
        queryKey: ["admin-campaign", campaignId],
      });
      toast.success("Passcode reset — copy the new one now");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reset passcode");
    } finally {
      setResettingPasscode(false);
    }
  };

  const campaignName = getEffectiveCampaignName(campaign);
  const brandingDirty =
    brandingType !== campaign.brandingType ||
    displayName !== (campaign.displayName ?? "");

  const handleSaveBranding = () => {
    if (brandingType !== "candidate" && displayName.trim().length === 0) {
      toast.error("Enter a public campaign name for movement or team branding");
      return;
    }

    updateMutation.mutate(
      {
        brandingType,
        displayName: displayName.trim() || null,
      },
      {
        onSuccess: () => {
          track("admin_campaign_updated", {
            action: "branding_updated",
            campaign_id: campaignId,
            branding_type: brandingType,
          });
          toast.success("Campaign branding updated");
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Status Control */}
      <Card className="border-border/60 bg-card rounded-sm shadow-none">
        <CardHeader className="border-border/50 border-b pb-4">
          <CardTitle className="text-sm font-semibold tracking-tight">
            Campaign status
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1 text-sm leading-relaxed">
            Control whether the public form accepts submissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Badge
              variant="outline"
              className={`rounded-sm px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase ${CAMPAIGN_STATUS_STYLES[campaign.status] ?? ""}`}
            >
              {capitalize(campaign.status)}
            </Badge>
            <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
              {campaign.status === "active" && (
                <>
                  The public Collect form is live and accepting new submissions.
                </>
              )}
              {campaign.status === "paused" && (
                <>
                  The form URL is paused. Visitors with the link see an
                  unavailable state until you resume or change status.
                </>
              )}
              {campaign.status === "closed" && (
                <>
                  This campaign is closed. The form does not accept further
                  input.
                </>
              )}
              {campaign.status === "draft" && (
                <>
                  Still in draft. Activate the campaign when you are ready to
                  publish the Collect link.
                </>
              )}
            </p>
          </div>

          <div className="border-border/40 space-y-3 border-t pt-6">
            <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
              Change status
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {campaign.status !== "active" && (
                <Button
                  size="sm"
                  className="h-10 w-full shrink-0 justify-center rounded-sm font-mono text-[11px] tracking-widest uppercase sm:w-auto sm:min-w-34"
                  disabled={updateMutation.isPending}
                  onClick={() => handleStatusChange("active")}
                >
                  {pendingStatusTarget === "active" ? (
                    <Spinner className="mr-1.5 size-3.5" />
                  ) : (
                    <IconPlayerPlay className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {pendingStatusTarget === "active"
                    ? "Activating..."
                    : "Activate"}
                </Button>
              )}
              {campaign.status === "active" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 w-full shrink-0 justify-center rounded-sm font-mono text-[11px] tracking-widest uppercase sm:w-auto sm:min-w-34"
                  disabled={updateMutation.isPending}
                  onClick={() => handleStatusChange("paused")}
                >
                  {pendingStatusTarget === "paused" ? (
                    <Spinner className="mr-1.5 size-3.5" />
                  ) : (
                    <IconPlayerPause className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {pendingStatusTarget === "paused" ? "Pausing..." : "Pause"}
                </Button>
              )}
              {campaign.status !== "closed" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 w-full shrink-0 justify-center rounded-sm font-mono text-[11px] tracking-widest uppercase sm:w-auto sm:min-w-34"
                  disabled={updateMutation.isPending}
                  onClick={() => handleStatusChange("closed")}
                >
                  {pendingStatusTarget === "closed" ? (
                    <Spinner className="mr-1.5 size-3.5" />
                  ) : (
                    <IconLock className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {pendingStatusTarget === "closed" ? "Closing..." : "Close"}
                </Button>
              )}
              {campaign.status !== "draft" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 w-full shrink-0 justify-center rounded-sm font-mono text-[11px] tracking-widest uppercase sm:w-auto sm:min-w-34"
                  disabled={updateMutation.isPending}
                  onClick={() => handleStatusChange("draft")}
                >
                  {pendingStatusTarget === "draft" ? (
                    <Spinner className="mr-1.5 size-3.5" />
                  ) : (
                    <IconFileDescription className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {pendingStatusTarget === "draft"
                    ? "Updating..."
                    : "Set to Draft"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Branding */}
      <Card className="border-border/60 bg-card rounded-sm shadow-none">
        <CardHeader className="border-border/50 border-b pb-4">
          <CardTitle className="text-sm font-semibold tracking-tight">
            Campaign branding
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1 text-sm leading-relaxed">
            Control how this campaign appears on Collect pages while keeping the
            underlying candidate anchor unchanged.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Runs as
            </Label>
            <ToggleGroup
              type="single"
              value={brandingType}
              onValueChange={(value) => {
                if (!value) return;
                setBrandingType(value as Campaign["brandingType"]);
              }}
              variant="outline"
              className="grid w-full grid-cols-1 rounded-sm shadow-none! sm:grid-cols-3"
            >
              {campaignBrandingTypes.map((type) => (
                <ToggleGroupItem
                  key={type}
                  value={type}
                  className="h-10 rounded-none font-mono text-[10px] font-bold tracking-widest uppercase first:rounded-t-sm last:rounded-b-sm sm:first:rounded-l-sm sm:first:rounded-tr-none sm:last:rounded-r-sm sm:last:rounded-bl-none"
                >
                  {getCampaignBrandingLabel(type)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Public campaign name
            </Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={
                brandingType === "movement"
                  ? "e.g. City Boy Movement"
                  : brandingType === "team"
                    ? "e.g. Fintiri Canvassers"
                    : "Optional if you want a public campaign name different from the candidate"
              }
              className="border-border/60 h-9 rounded-sm"
            />
            <div className="border-border/50 bg-muted/20 text-muted-foreground rounded-sm border px-3 py-2 text-xs leading-relaxed">
              <span className="text-foreground/70 font-mono text-[10px] font-bold tracking-widest uppercase">
                Preview
              </span>
              <span className="text-foreground mt-1 block font-medium">
                {getEffectiveCampaignName({
                  candidateName: campaign.candidateName,
                  displayName,
                })}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground max-w-prose text-xs leading-relaxed">
              Anchor candidate stays linked for scope, analytics, and campaign
              rules.
            </p>
            <Button
              size="sm"
              className="h-9 w-full rounded-sm font-mono text-[11px] tracking-widest uppercase sm:w-auto"
              onClick={handleSaveBranding}
              disabled={!brandingDirty || updateMutation.isPending}
            >
              {isBrandingSaving ? (
                <Spinner className="mr-1.5 size-3.5" />
              ) : null}
              {isBrandingSaving ? "Saving..." : "Save Branding"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Details */}
      <Card className="border-border/60 bg-card rounded-sm shadow-none">
        <CardHeader className="border-border/50 border-b pb-4">
          <CardTitle className="text-sm font-semibold tracking-tight">
            Campaign details
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1 text-sm leading-relaxed">
            Read-only snapshot of metadata stored with this campaign.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="divide-border/40 divide-y text-sm">
            <div className="flex flex-col gap-1 py-2.5 first:pt-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <dt className="text-muted-foreground shrink-0 font-mono text-[10px] font-bold tracking-widest uppercase">
                Public name
              </dt>
              <dd className="max-w-full min-w-0 text-left wrap-break-word sm:max-w-[65%] sm:text-right">
                {campaignName}
              </dd>
            </div>
            <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <dt className="text-muted-foreground shrink-0 font-mono text-[10px] font-bold tracking-widest uppercase">
                Branding
              </dt>
              <dd className="text-left sm:max-w-[65%] sm:text-right">
                {getCampaignBrandingLabel(campaign.brandingType)}
              </dd>
            </div>
            <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <dt className="text-muted-foreground shrink-0 font-mono text-[10px] font-bold tracking-widest uppercase">
                Slug
              </dt>
              <dd className="max-w-full min-w-0 text-left font-mono wrap-break-word sm:max-w-[65%] sm:text-right">
                {campaign.slug}
              </dd>
            </div>
            <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <dt className="text-muted-foreground shrink-0 font-mono text-[10px] font-bold tracking-widest uppercase">
                Anchor candidate
              </dt>
              <dd className="max-w-full min-w-0 text-left wrap-break-word sm:max-w-[65%] sm:text-right">
                {formatPersonName(campaign.candidateName)}
              </dd>
            </div>
            <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <dt className="text-muted-foreground shrink-0 font-mono text-[10px] font-bold tracking-widest uppercase">
                Party
              </dt>
              <dd className="text-left sm:text-right">{campaign.party}</dd>
            </div>
            <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <dt className="text-muted-foreground shrink-0 font-mono text-[10px] font-bold tracking-widest uppercase">
                Constituency
              </dt>
              <dd className="max-w-full min-w-0 text-left wrap-break-word sm:max-w-[65%] sm:text-right">
                {campaign.constituency}
              </dd>
            </div>
            <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <dt className="text-muted-foreground shrink-0 font-mono text-[10px] font-bold tracking-widest uppercase">
                Type
              </dt>
              <dd className="text-left capitalize sm:text-right">
                {campaign.constituencyType}
              </dd>
            </div>
            <div className="flex flex-col gap-1 py-2.5 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <dt className="text-muted-foreground shrink-0 font-mono text-[10px] font-bold tracking-widest uppercase">
                Created
              </dt>
              <dd className="text-left tabular-nums sm:text-right">
                {new Date(campaign.createdAt).toLocaleString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {canShowBoundarySync && (
        <Card className="border-border/60 bg-card rounded-sm shadow-none">
          <CardHeader className="border-border/50 border-b pb-4">
            <CardTitle className="text-sm font-semibold tracking-tight">
              Boundary sync
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1 text-sm leading-relaxed">
              Campaigns keep their own saved coverage after creation. Reset this
              campaign only if you want the public form to match the
              candidate&apos;s current boundary again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6 text-sm sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                  Campaign coverage
                </p>
                <p className="font-medium tabular-nums">
                  {campaign.enabledLgaIds.length} LGA
                  {campaign.enabledLgaIds.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                  Candidate now
                </p>
                <p className="font-medium tabular-nums">
                  {currentCandidateBoundaryIds.length > 0
                    ? `${currentCandidateBoundaryIds.length} LGA${currentCandidateBoundaryIds.length === 1 ? "" : "s"}`
                    : "Unavailable"}
                </p>
              </div>
            </div>

            {campaign.candidateBoundaryError ? (
              <p className="text-muted-foreground border-border/50 bg-muted/20 rounded-sm border px-3 py-2.5 text-sm leading-relaxed">
                {campaign.candidateBoundaryError}
              </p>
            ) : campaign.isBoundaryOutOfSync ? (
              <p className="rounded-sm border border-amber-500/25 bg-amber-500/5 px-3 py-2.5 text-sm leading-relaxed text-amber-800 dark:text-amber-200">
                The candidate boundary changed after this campaign was created.
                Reset the campaign boundary if you want the public form to use
                the new scope.
              </p>
            ) : (
              <p className="text-muted-foreground border-border/50 bg-muted/10 rounded-sm border px-3 py-2.5 text-sm leading-relaxed">
                This campaign already matches the candidate&apos;s current
                boundary.
              </p>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 w-full rounded-sm font-mono text-[11px] tracking-widest uppercase sm:w-auto"
              onClick={handleResetBoundary}
              disabled={
                !canResetToCandidateBoundary || updateMutation.isPending
              }
            >
              {isBoundaryResetPending ? (
                <Spinner className="mr-1.5 size-3.5" />
              ) : (
                <IconRefresh className="mr-1.5 h-3.5 w-3.5" />
              )}
              {isBoundaryResetPending
                ? "Resetting boundary..."
                : "Reset to Candidate Boundary"}
            </Button>

            <p className="text-muted-foreground text-xs">
              This updates future form submissions only. Existing submissions
              remain unchanged.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Client Access */}
      <Card className="border-border/60 bg-card rounded-sm shadow-none">
        <CardHeader className="border-border/50 border-b pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-sm font-semibold tracking-tight">
                Client access
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                Give the client a private read-only results view for this
                campaign.
              </CardDescription>
            </div>
            {isEnabled && (
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/10 text-primary shrink-0 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
              >
                Enabled
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEnabled ? (
            <div className="space-y-3">
              {campaign.status === "draft" ? (
                <p className="rounded-sm border border-amber-500/25 bg-amber-500/5 px-3 py-2.5 text-sm leading-relaxed text-amber-800 dark:text-amber-200">
                  Activate the campaign before enabling the client report. Draft
                  campaigns are not accessible to clients.
                </p>
              ) : (
                <p className="text-muted-foreground border-border/50 bg-muted/15 rounded-sm border px-3 py-2.5 text-sm leading-relaxed">
                  Enable to generate a private report link with a passcode that
                  you can share with the client.
                </p>
              )}
              <Button
                size="sm"
                className="h-9 w-full rounded-sm font-mono text-[11px] tracking-widest uppercase sm:w-auto"
                onClick={handleEnableClientAccess}
                disabled={
                  updateMutation.isPending || campaign.status === "draft"
                }
              >
                {isEnablingClientReport ? (
                  <Spinner className="mr-1.5 size-3.5" />
                ) : (
                  <IconShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                )}
                {isEnablingClientReport
                  ? "Enabling..."
                  : "Enable Client Report"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Report URL */}
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Report URL
                </Label>
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-2">
                  <div
                    className="border-border/60 bg-muted/30 text-foreground pointer-events-none w-full min-w-0 cursor-default rounded-sm border px-3 py-2 font-mono text-[11px] leading-relaxed wrap-break-word break-all shadow-none select-none sm:min-h-10 sm:flex-1 sm:text-xs"
                    role="status"
                    aria-label="Report link. Use Copy or Open—this value is not editable."
                  >
                    {reportUrl}
                  </div>
                  <div className="flex min-h-10 shrink-0 gap-2 sm:items-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-10 flex-1 rounded-sm sm:h-10 sm:min-w-10 sm:flex-none sm:px-0"
                      aria-label="Copy report link"
                      onClick={() => copyToClipboard(reportUrl, "Report link")}
                    >
                      <IconCopy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-10 flex-1 rounded-sm sm:h-10 sm:min-w-10 sm:flex-none sm:px-0"
                      aria-label="Open report in new tab"
                      onClick={() => window.open(reportUrl, "_blank")}
                    >
                      <IconExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Passcode */}
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Passcode
                </Label>
                {visiblePasscode ? (
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                    <div className="border-border/60 bg-muted/40 flex min-h-10 min-w-0 flex-1 items-center rounded-sm border px-3 py-2 font-mono text-sm font-bold tracking-[0.3em] sm:py-0">
                      {visiblePasscode}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-10 w-full shrink-0 rounded-sm sm:w-auto sm:min-w-10 sm:px-0"
                      aria-label="Copy passcode"
                      onClick={() =>
                        copyToClipboard(visiblePasscode, "Passcode")
                      }
                    >
                      <IconCopy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground border-border/50 bg-muted/15 rounded-sm border px-3 py-2.5 text-xs leading-relaxed">
                    Passcode is hidden. Reset it to generate a new one you can
                    copy.
                  </p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 w-full rounded-sm font-mono text-[11px] tracking-widest uppercase sm:w-auto"
                  onClick={handleResetPasscode}
                  disabled={resettingPasscode}
                >
                  {resettingPasscode ? (
                    <Spinner className="mr-1.5 size-3.5" />
                  ) : (
                    <IconKey className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {resettingPasscode ? "Resetting..." : "Reset Passcode"}
                </Button>
              </div>

              {/* Security Info */}
              <div className="border-border/40 space-y-4 border-t pt-4 text-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                    Last viewed
                  </span>
                  <span className="text-left tabular-nums sm:text-right">
                    {campaign.clientReportLastViewedAt
                      ? new Date(
                          campaign.clientReportLastViewedAt,
                        ).toLocaleString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "Never"}
                  </span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                    Access mode
                  </span>
                  <span className="text-left sm:text-right">
                    Private link + passcode
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 w-full rounded-sm font-mono text-[11px] tracking-widest uppercase sm:w-auto"
                  onClick={handleRegenerateToken}
                  disabled={regeneratingToken}
                >
                  {regeneratingToken ? (
                    <Spinner className="mr-1.5 size-3.5" />
                  ) : (
                    <IconRotateClockwise className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {regeneratingToken ? "Regenerating..." : "Regenerate Link"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 w-full rounded-sm font-mono text-[11px] tracking-widest text-orange-600 uppercase hover:bg-orange-500/10 hover:text-orange-700 sm:w-auto"
                  onClick={handleRevokeClientAccess}
                  disabled={updateMutation.isPending}
                >
                  {isRevokingClientReport ? (
                    <Spinner className="mr-1.5 size-3.5" />
                  ) : (
                    <IconEye className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {isRevokingClientReport ? "Revoking..." : "Revoke Access"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/25 bg-destructive/5 dark:border-destructive/35 dark:bg-destructive/10 rounded-sm border shadow-none">
        <CardHeader className="border-destructive/20 border-b pb-4">
          <CardTitle className="text-destructive text-sm font-semibold tracking-tight">
            Danger zone
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1 text-sm leading-relaxed">
            Permanently delete this campaign
            {submissionCount > 0
              ? ` and all ${submissionCount.toLocaleString()} submission${submissionCount === 1 ? "" : "s"}`
              : ""}
            . This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
              Type the campaign slug shown below into the confirmation field.
              Matching is case-sensitive. Deliberate typing reduces accidental
              deletion.
            </p>
            <div>
              <p className="text-foreground/70 mb-1.5 font-mono text-[10px] font-bold tracking-widest uppercase">
                Expected slug
              </p>
              <div className="border-destructive/20 bg-background/60 text-foreground dark:bg-background/40 rounded-sm border px-3 py-2.5 font-mono text-[11px] wrap-anywhere break-all shadow-none select-none sm:text-xs">
                {campaign.slug}
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor={dangerConfirmInputId}
                className="text-foreground font-mono text-[10px] font-bold tracking-widest uppercase"
              >
                Confirmation
              </Label>
              <Input
                id={dangerConfirmInputId}
                value={deleteSlug}
                onChange={(e) => setDeleteSlug(e.target.value)}
                placeholder="Type the slug exactly as shown"
                className="border-destructive/30 bg-background/80 selection:bg-destructive/15 selection:text-foreground hover:border-destructive/50 focus-visible:border-destructive focus-visible:ring-destructive/30 dark:border-destructive/45 dark:bg-background/60 dark:hover:border-destructive/60 dark:focus-visible:ring-destructive/35 rounded-sm font-mono text-xs shadow-none transition-[border-color,box-shadow] focus-visible:ring-[3px] sm:text-sm"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                aria-describedby={`${dangerConfirmInputId}-hint`}
              />
              <p
                id={`${dangerConfirmInputId}-hint`}
                className="text-muted-foreground text-[11px] leading-snug"
              >
                Delete stays disabled until this field matches exactly. The slug
                cannot be selected, so you type it deliberately.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              type="button"
              className="h-10 w-full rounded-sm font-mono text-[11px] font-bold tracking-widest uppercase"
              disabled={
                deleteSlug !== campaign.slug || deleteMutation.isPending
              }
              onClick={handleDelete}
            >
              {deleteMutation.isPending ? (
                <Spinner className="mr-1.5 size-3.5" />
              ) : (
                <IconTrash className="mr-1.5 h-4 w-4" />
              )}
              {deleteMutation.isPending ? "Deleting..." : "Delete campaign"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
