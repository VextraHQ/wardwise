"use client";

import { useEffect } from "react";
import {
  AppStatusScreen,
  getErrorStatusScreenState,
  statusIcons,
} from "@/components/system/app-status-screen";

export default function CampaignFormError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const screen = getErrorStatusScreenState(error, "collect");

  return (
    <AppStatusScreen
      code="500"
      protocol={screen.protocol}
      title={screen.title}
      description={screen.description}
      tone={screen.tone}
      reference={screen.reference}
      supportHref={screen.supportHref}
      supportLabel={screen.supportLabel}
      primaryAction={{
        label: "Try Again",
        onClick: reset,
        icon: statusIcons.refresh,
        variant: screen.tone === "destructive" ? "destructive" : "default",
      }}
      secondaryAction={{
        label: "Return Home",
        href: "/",
        icon: statusIcons.home,
        variant: "outline",
      }}
      footerCode={screen.footerCode}
      footerStatus={screen.footerStatus}
    />
  );
}
