"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconChartBar,
  IconClipboardList,
  IconCopy,
  IconDotsVertical,
  IconExternalLink,
  IconSettings,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type CampaignActionsMenuCampaign = {
  id: string;
  slug: string;
  clientReportEnabled: boolean;
  clientReportToken: string | null;
};

type CampaignActionMenuItemsProps = {
  campaign: CampaignActionsMenuCampaign;
  includeViewCollect?: boolean;
};

type CampaignActionsMenuProps = CampaignActionMenuItemsProps & {
  ariaLabel?: string;
  label?: string;
};

function getCollectBaseUrl() {
  return process.env.NEXT_PUBLIC_COLLECT_BASE_URL || window.location.origin;
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(
    () => toast.success(`${label} copied`),
    () => toast.error(`Could not copy ${label.toLowerCase()}`),
  );
}

export function CampaignActionMenuItems({
  campaign,
  includeViewCollect = true,
}: CampaignActionMenuItemsProps) {
  const router = useRouter();

  function copyFormLink() {
    copyToClipboard(`${getCollectBaseUrl()}/c/${campaign.slug}`, "Form link");
  }

  function copyReportLink() {
    if (!campaign.clientReportToken) return;
    copyToClipboard(
      `${getCollectBaseUrl()}/r/${campaign.clientReportToken}`,
      "Report link",
    );
  }

  function openPublicForm() {
    window.open(`${getCollectBaseUrl()}/c/${campaign.slug}`, "_blank");
  }

  function openReport() {
    if (!campaign.clientReportToken) return;
    window.open(
      `${getCollectBaseUrl()}/r/${campaign.clientReportToken}`,
      "_blank",
    );
  }

  return (
    <>
      {includeViewCollect && (
        <>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              router.push(`/admin/collect/campaigns/${campaign.id}`);
            }}
          >
            <IconClipboardList className="mr-2 h-4 w-4" />
            View Collect
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      )}

      <DropdownMenuItem
        onClick={(event) => {
          event.stopPropagation();
          openPublicForm();
        }}
      >
        <IconExternalLink className="mr-2 h-4 w-4" />
        Open Public Form
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={(event) => {
          event.stopPropagation();
          copyFormLink();
        }}
      >
        <IconCopy className="mr-2 h-4 w-4" />
        Copy Form Link
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={(event) => {
          event.stopPropagation();
          router.push(`/admin/collect/campaigns/${campaign.id}?tab=settings`);
        }}
      >
        <IconSettings className="mr-2 h-4 w-4" />
        Campaign Settings
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {campaign.clientReportEnabled && campaign.clientReportToken ? (
        <>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              openReport();
            }}
          >
            <IconChartBar className="mr-2 h-4 w-4" />
            Open Campaign Insights
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              copyReportLink();
            }}
          >
            <IconCopy className="mr-2 h-4 w-4" />
            Copy Report Link
          </DropdownMenuItem>
        </>
      ) : (
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation();
            router.push(`/admin/collect/campaigns/${campaign.id}?tab=settings`);
          }}
        >
          <IconChartBar className="mr-2 h-4 w-4" />
          Enable Campaign Insights
        </DropdownMenuItem>
      )}
    </>
  );
}

export function CampaignActionsMenu({
  campaign,
  includeViewCollect = true,
  ariaLabel = "Open campaign actions",
  label = "Campaign Actions",
}: CampaignActionsMenuProps) {
  return (
    <div className="flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm shadow-none"
            aria-label={ariaLabel}
          >
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
            {label}
          </DropdownMenuLabel>
          <CampaignActionMenuItems
            campaign={campaign}
            includeViewCollect={includeViewCollect}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
