"use client";

import { use } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { IconCopy } from "@tabler/icons-react";
import { toast } from "sonner";

import { useCampaign } from "@/hooks/use-collect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { CampaignOverview } from "./campaign-overview";
import { CampaignSubmissions } from "./campaign-submissions";
import { CampaignCanvassers } from "./campaign-canvassers";
import { CampaignSettings } from "./campaign-settings";

const STATUS_VARIANT: Record<
  string,
  "secondary" | "default" | "outline" | "destructive"
> = {
  draft: "secondary",
  active: "default",
  paused: "outline",
  closed: "destructive",
};

const STATUS_DOT: Record<string, string> = {
  draft: "bg-muted-foreground",
  active: "bg-emerald-500",
  paused: "bg-orange-500",
  closed: "bg-destructive",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const TABS = ["overview", "submissions", "canvassers", "settings"] as const;

export function CampaignDetail({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = use(paramsPromise);
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = searchParams.get("tab") ?? "overview";
  const { data: campaign, isLoading } = useCampaign(id);

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`?${params.toString()}`);
  }

  function copyPublicLink() {
    const baseUrl =
      process.env.NEXT_PUBLIC_COLLECT_BASE_URL || window.location.origin;
    const url = `${baseUrl}/c/${campaign?.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Public form link copied to clipboard");
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <p className="text-muted-foreground">Campaign not found.</p>
        <Link
          href="/admin/collect"
          className="text-primary mt-2 inline-block underline"
        >
          Back to campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="bg-muted/40 border-border/40 rounded-sm border px-4 py-2.5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/admin/collect">Campaigns</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{campaign.candidateName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {campaign.candidateName}
              </h1>
              <div className="flex items-center gap-2">
                <Badge
                  variant={STATUS_VARIANT[campaign.status] ?? "secondary"}
                  className="gap-1.5 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                >
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[campaign.status] ?? "bg-muted-foreground"}`}
                  />
                  {capitalize(campaign.status)}
                </Badge>
                <span className="text-muted-foreground text-sm font-medium">
                  {campaign.party}
                </span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              {campaign.constituency}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={copyPublicLink}
            className="shrink-0 self-start rounded-sm font-mono text-[11px] tracking-widest uppercase"
          >
            <IconCopy className="mr-1.5 h-4 w-4" />
            Copy Link
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="font-mono text-[10px] font-bold tracking-widest uppercase">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <CampaignOverview campaignId={id} />
        </TabsContent>
        <TabsContent value="submissions">
          <CampaignSubmissions campaignId={id} />
        </TabsContent>
        <TabsContent value="canvassers">
          <CampaignCanvassers campaignId={id} />
        </TabsContent>
        <TabsContent value="settings">
          <CampaignSettings campaignId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
