"use client";

import { use } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { IconCopy, IconExternalLink } from "@tabler/icons-react";
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

import { CampaignOverview } from "@/components/admin/collect/campaign-overview";
import { CampaignSubmissions } from "@/components/admin/collect/campaign-submissions";
import { CampaignCanvassers } from "@/components/admin/collect/campaign-canvassers";
import { CampaignSettings } from "@/components/admin/collect/campaign-settings";
import {
  getCampaignBrandingLabel,
  getEffectiveCampaignName,
} from "@/lib/collect/branding";
import {
  AdminResourceState,
  adminResourceStateIcons,
} from "@/components/admin/shared/admin-resource-state";
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
  const campaignName = campaign ? getEffectiveCampaignName(campaign) : "";

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`?${params.toString()}`);
  }

  function getPublicFormUrl(slug: string) {
    const baseUrl =
      process.env.NEXT_PUBLIC_COLLECT_BASE_URL || window.location.origin;
    return `${baseUrl}/c/${slug}`;
  }

  function copyPublicLink() {
    if (!campaign) return;
    navigator.clipboard.writeText(getPublicFormUrl(campaign.slug));
    toast.success("Public form link copied to clipboard");
  }

  function openPublicForm() {
    if (!campaign) return;
    window.open(getPublicFormUrl(campaign.slug), "_blank");
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-xs sm:w-72" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <AdminResourceState
          tone="missing"
          title="Campaign not found"
          description="This Collect campaign may have been deleted, or the link may be incorrect."
          action={{
            label: "Back to Campaigns",
            href: "/admin/collect",
            icon: adminResourceStateIcons.back,
            variant: "outline",
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:gap-6 md:p-6">
      {/* Header Zone */}
      <header className="flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="text-foreground/90 hover:text-foreground font-mono text-[9px] font-bold tracking-[0.15em] uppercase transition-colors"
              >
                <Link href="/admin/collect">Campaigns</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/70">
              /
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground/40 font-mono text-[9px] font-bold tracking-[0.15em] uppercase">
                {campaignName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="w-full min-w-0 flex-1 space-y-2 md:space-y-3">
            <div className="space-y-2">
              <h1 className="text-foreground text-2xl leading-tight font-extrabold tracking-tighter wrap-break-word sm:text-3xl md:text-4xl">
                {campaignName}
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Badge
                  variant="outline"
                  className="rounded-sm px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase sm:text-[10px]"
                >
                  {getCampaignBrandingLabel(campaign.brandingType)}
                </Badge>
                <Badge
                  variant="outline"
                  className={`rounded-sm px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase sm:text-[10px] ${CAMPAIGN_STATUS_STYLES[campaign.status] ?? ""}`}
                >
                  {capitalize(campaign.status)}
                </Badge>
              </div>
            </div>

            <div className="text-muted-foreground/70 flex min-w-0 flex-row flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[9px] font-bold tracking-widest uppercase sm:gap-x-4 sm:text-[10px]">
              <div className="flex max-w-full items-center gap-2">
                <span className="bg-primary/40 size-1.5 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
                <span>{campaign.party}</span>
              </div>
              {campaign.displayName && (
                <div className="flex max-w-full items-center gap-2">
                  <span className="bg-border size-1.5 rounded-full" />
                  <span className="wrap-break-word">
                    Anchor: {formatPersonName(campaign.candidateName)}
                  </span>
                </div>
              )}
              <div className="flex max-w-full items-center gap-2">
                <span className="bg-border size-1.5 rounded-full" />
                <span className="wrap-break-word">{campaign.constituency}</span>
              </div>
            </div>
          </div>

          <div className="flex w-full min-w-0 shrink-0 flex-row gap-2 md:w-auto md:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={openPublicForm}
              className="hover:bg-muted h-9 min-w-0 flex-1 rounded-sm font-mono text-[10px] tracking-widest uppercase shadow-sm transition-all md:w-auto md:flex-none"
            >
              <IconExternalLink className="mr-2 h-3.5 w-3.5 shrink-0" />
              Open Form
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyPublicLink}
              className="hover:bg-muted h-9 min-w-0 flex-1 rounded-sm font-mono text-[10px] tracking-widest uppercase shadow-sm transition-all md:w-auto md:flex-none"
            >
              <IconCopy className="mr-2 h-3.5 w-3.5 shrink-0" />
              Copy Link
            </Button>
          </div>
        </div>
        <div className="from-border/80 via-border/40 h-px w-full bg-linear-to-r to-transparent" />
      </header>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="bg-muted w-fit max-w-full justify-start overflow-x-auto rounded-sm p-1 [scrollbar-width:none] sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="flex-none rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase"
            >
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
