"use client";

import { useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-tight">
            Campaign Status
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1 text-sm">
            Control whether the public form accepts submissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-2">
            <span className="text-muted-foreground text-sm">
              Current status:
            </span>
            <Badge
              variant="outline"
              className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase ${CAMPAIGN_STATUS_STYLES[campaign.status] ?? ""}`}
            >
              {capitalize(campaign.status)}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {campaign.status !== "active" && (
              <Button
                size="sm"
                className="h-9 w-full justify-center rounded-sm font-mono text-[11px] tracking-widest uppercase sm:w-auto"
                onClick={() => handleStatusChange("active")}
              >
                <IconPlayerPlay className="mr-1.5 h-3.5 w-3.5" />
                Activate
              </Button>
            )}
            {campaign.status === "active" && (
              <Button
                size="sm"
                variant="outline"
                className="h-9 w-full justify-center rounded-sm font-mono text-[11px] tracking-widest uppercase sm:w-auto"
                onClick={() => handleStatusChange("paused")}
              >
                <IconPlayerPause className="mr-1.5 h-3.5 w-3.5" />
                Pause
              </Button>
            )}
            {campaign.status !== "closed" && (
              <Button
                size="sm"
                variant="outline"
                className="h-9 w-full justify-center rounded-sm font-mono text-[11px] tracking-widest uppercase sm:w-auto"
                onClick={() => handleStatusChange("closed")}
              >
                <IconLock className="mr-1.5 h-3.5 w-3.5" />
                Close
              </Button>
            )}
            {campaign.status !== "draft" && (
              <Button
                size="sm"
                variant="outline"
                className="col-span-2 h-9 w-full justify-center rounded-sm font-mono text-[11px] tracking-widest uppercase sm:col-auto sm:w-auto"
                onClick={() => handleStatusChange("draft")}
              >
                <IconFileDescription className="mr-1.5 h-3.5 w-3.5" />
                Set to Draft
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Branding */}
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-tight">
            Campaign Branding
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1 text-sm">
            Control how this campaign appears on Collect pages while keeping the
            underlying candidate anchor unchanged.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Runs As
            </Label>
            <ToggleGroup
              type="single"
              value={brandingType}
              onValueChange={(value) => {
                if (!value) return;
                setBrandingType(value as Campaign["brandingType"]);
              }}
              variant="outline"
              className="grid w-full grid-cols-1 rounded-sm sm:grid-cols-3"
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

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Public Campaign Name
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
              className="h-9 rounded-sm"
            />
            <p className="text-muted-foreground text-xs">
              Public preview:{" "}
              <span className="text-foreground font-medium">
                {getEffectiveCampaignName({
                  candidateName: campaign.candidateName,
                  displayName,
                })}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-xs leading-relaxed">
              Anchor candidate stays linked for scope, analytics, and campaign
              rules.
            </p>
            <Button
              size="sm"
              className="h-9 w-full rounded-sm font-mono text-[11px] tracking-widest uppercase sm:w-auto"
              onClick={handleSaveBranding}
              disabled={!brandingDirty || updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Branding"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Details */}
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-tight">
            Campaign Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <span className="text-muted-foreground">Public name</span>
            <span className="max-w-full text-left wrap-break-word sm:max-w-[65%] sm:text-right">
              {campaignName}
            </span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <span className="text-muted-foreground">Branding</span>
            <span className="text-left sm:text-right">
              {getCampaignBrandingLabel(campaign.brandingType)}
            </span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <span className="text-muted-foreground">Slug</span>
            <span className="max-w-full text-left font-mono wrap-break-word sm:max-w-[65%] sm:text-right">
              {campaign.slug}
            </span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <span className="text-muted-foreground">Anchor candidate</span>
            <span className="max-w-full text-left wrap-break-word sm:max-w-[65%] sm:text-right">
              {campaign.candidateName}
            </span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <span className="text-muted-foreground">Party</span>
            <span className="text-left sm:text-right">{campaign.party}</span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <span className="text-muted-foreground">Constituency</span>
            <span className="max-w-full text-left wrap-break-word sm:max-w-[65%] sm:text-right">
              {campaign.constituency}
            </span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="text-left capitalize sm:text-right">
              {campaign.constituencyType}
            </span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <span className="text-muted-foreground">Created</span>
            <span className="text-left sm:text-right">
              {new Date(campaign.createdAt).toLocaleString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      {canShowBoundarySync && (
        <Card className="border-border/60 rounded-sm shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-tight">
              Boundary Sync
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1 text-sm">
              Campaigns keep their own saved coverage after creation. Reset this
              campaign only if you want the public form to match the
              candidate&apos;s current boundary again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <span className="text-muted-foreground">Campaign coverage</span>
                <span className="text-left font-medium sm:text-right">
                  {campaign.enabledLgaIds.length} LGA
                  {campaign.enabledLgaIds.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <span className="text-muted-foreground">
                  Candidate coverage now
                </span>
                <span className="text-left font-medium sm:text-right">
                  {currentCandidateBoundaryIds.length > 0
                    ? `${currentCandidateBoundaryIds.length} LGA${currentCandidateBoundaryIds.length === 1 ? "" : "s"}`
                    : "Unavailable"}
                </span>
              </div>
            </div>

            {campaign.candidateBoundaryError ? (
              <p className="text-muted-foreground text-sm">
                {campaign.candidateBoundaryError}
              </p>
            ) : campaign.isBoundaryOutOfSync ? (
              <p className="text-sm text-amber-700">
                The candidate boundary changed after this campaign was created.
                Reset the campaign boundary if you want the public form to use
                the new scope.
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
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
              <IconRefresh className="mr-1.5 h-3.5 w-3.5" />
              Reset to Candidate Boundary
            </Button>

            <p className="text-muted-foreground text-xs">
              This updates future form submissions only. Existing submissions
              remain unchanged.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Client Access */}
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight">
                Client Access
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1 text-sm">
                Give the client a private read-only results view for this
                campaign.
              </CardDescription>
            </div>
            {isEnabled && (
              <Badge
                variant="outline"
                className="rounded-sm border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-emerald-600 uppercase"
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
                <p className="text-sm text-amber-700">
                  Activate the campaign before enabling the client report. Draft
                  campaigns are not accessible to clients.
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">
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
                <IconShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                {updateMutation.isPending
                  ? "Enabling..."
                  : "Enable Client Report"}
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Report URL */}
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Report URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={reportUrl}
                    className="h-9 rounded-sm font-mono text-xs"
                    onFocus={(e) => e.target.select()}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 shrink-0 rounded-sm"
                    onClick={() => copyToClipboard(reportUrl, "Report link")}
                  >
                    <IconCopy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 shrink-0 rounded-sm"
                    onClick={() => window.open(reportUrl, "_blank")}
                  >
                    <IconExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Passcode */}
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Passcode
                </Label>
                {visiblePasscode ? (
                  <div className="flex items-center gap-2">
                    <div className="bg-muted/50 flex h-9 items-center rounded-sm border px-3 font-mono text-sm font-bold tracking-[0.3em]">
                      {visiblePasscode}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 shrink-0 rounded-sm"
                      onClick={() =>
                        copyToClipboard(visiblePasscode, "Passcode")
                      }
                    >
                      <IconCopy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs">
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
                  <IconKey className="mr-1.5 h-3.5 w-3.5" />
                  {resettingPasscode ? "Resetting..." : "Reset Passcode"}
                </Button>
              </div>

              {/* Security Info */}
              <div className="space-y-2 text-sm">
                <Separator />
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <span className="text-muted-foreground">Last viewed</span>
                  <span className="text-left sm:text-right">
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
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <span className="text-muted-foreground">Access mode</span>
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
                  <IconRotateClockwise className="mr-1.5 h-3.5 w-3.5" />
                  {regeneratingToken ? "Regenerating..." : "Regenerate Link"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 w-full rounded-sm font-mono text-[11px] tracking-widest text-orange-600 uppercase hover:bg-orange-500/10 hover:text-orange-700 sm:w-auto"
                  onClick={handleRevokeClientAccess}
                  disabled={updateMutation.isPending}
                >
                  <IconEye className="mr-1.5 h-3.5 w-3.5" />
                  Revoke Access
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-destructive text-sm font-semibold tracking-tight">
            Danger Zone
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1 text-sm">
            Delete this campaign
            {submissionCount > 0
              ? ` and all ${submissionCount} submission${submissionCount === 1 ? "" : "s"}`
              : ""}
            . This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="space-y-3">
            <Label>
              Type{" "}
              <span className="font-mono font-semibold">{campaign.slug}</span>{" "}
              to confirm
            </Label>
            <Input
              value={deleteSlug}
              onChange={(e) => setDeleteSlug(e.target.value)}
              placeholder={campaign.slug}
              className="rounded-sm"
            />
            <Button
              variant="destructive"
              size="sm"
              className="h-9 w-full rounded-sm font-mono text-[11px] tracking-widest uppercase sm:w-auto"
              disabled={
                deleteSlug !== campaign.slug || deleteMutation.isPending
              }
              onClick={handleDelete}
            >
              <IconTrash className="mr-1 h-4 w-4" />
              {deleteMutation.isPending ? "Deleting..." : "Delete Campaign"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
