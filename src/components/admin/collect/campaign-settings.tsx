"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import {
  IconTrash,
  IconPlayerPlay,
  IconPlayerPause,
  IconLock,
  IconFileDescription,
  IconRefresh,
} from "@tabler/icons-react";
import type { Campaign } from "@/types/collect";

const CAMPAIGN_STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border/60",
  active: "bg-primary/10 text-primary border-primary/30",
  paused: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  closed: "bg-destructive/10 text-destructive border-destructive/30",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function CampaignSettings({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const { data: campaign, isLoading } = useCampaign(campaignId) as {
    data: Campaign | undefined;
    isLoading: boolean;
  };
  const updateMutation = useUpdateCampaign(campaignId);
  const deleteMutation = useDeleteCampaign();
  const [deleteSlug, setDeleteSlug] = useState("");
  const submissionCount = campaign?._count?.submissions ?? 0;

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
        onSuccess: () => toast.success(`Campaign ${status}`),
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
          toast.success("Campaign boundary reset to the candidate boundary");
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

      {/* Campaign Details */}
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-tight">
            Campaign Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <span className="text-muted-foreground">Slug</span>
            <span className="max-w-full text-left font-mono wrap-break-word sm:max-w-[65%] sm:text-right">
              {campaign.slug}
            </span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <span className="text-muted-foreground">Candidate</span>
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
