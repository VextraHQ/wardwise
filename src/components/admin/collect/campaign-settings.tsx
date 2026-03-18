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
} from "@tabler/icons-react";

const STATUS_DOT: Record<string, string> = {
  draft: "bg-muted-foreground",
  active: "bg-emerald-500",
  paused: "bg-orange-500",
  closed: "bg-destructive",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function CampaignSettings({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const { data: campaign, isLoading } = useCampaign(campaignId);
  const updateMutation = useUpdateCampaign(campaignId);
  const deleteMutation = useDeleteCampaign();
  const [deleteSlug, setDeleteSlug] = useState("");

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
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              Current status:
            </span>
            <Badge
              variant={campaign.status === "active" ? "default" : "secondary"}
              className="gap-1.5 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[campaign.status] ?? "bg-muted-foreground"}`}
              />
              {capitalize(campaign.status)}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {campaign.status !== "active" && (
              <Button
                size="sm"
                className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
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
                className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
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
                className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
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
                className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
                onClick={() => handleStatusChange("draft")}
              >
                <IconFileDescription className="mr-1.5 h-3.5 w-3.5" />
                Set to Draft
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Field Requirements */}
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-tight">
            Field Requirements
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1 text-sm">
            Verification fields that are always required on the registration
            form.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              APC Registration Number / NIN
            </span>
            <Badge
              variant="default"
              className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
            >
              Required
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Voter ID (VIN)</span>
            <Badge
              variant="default"
              className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
            >
              Required
            </Badge>
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
          <div className="flex justify-between">
            <span className="text-muted-foreground">Slug</span>
            <span className="font-mono">{campaign.slug}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Candidate</span>
            <span>{campaign.candidateName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Party</span>
            <span>{campaign.party}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Constituency</span>
            <span>{campaign.constituency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="capitalize">{campaign.constituencyType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-destructive text-sm font-semibold tracking-tight">
            Danger Zone
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1 text-sm">
            Delete this campaign and all its submissions. This action cannot be
            undone.
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
              className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
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
