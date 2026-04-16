"use client";

import { useEffect } from "react";
import {
  AppStatusScreen,
  statusIcons,
} from "@/components/system/app-status-screen";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: Send this to an error reporting service like Sentry or Bugsnag.
    console.error(error);
  }, [error]);

  return (
    <AppStatusScreen
      code="500"
      protocol="Err_Protocol_500"
      title="We couldn’t load this page"
      description="Something unexpected interrupted this view. The issue has been logged, and your data is safe."
      tone="destructive"
      reference={error.digest}
      primaryAction={{
        label: "Try Again",
        onClick: reset,
        icon: statusIcons.refresh,
        variant: "destructive",
      }}
      secondaryAction={{
        label: "Return Home",
        href: "/",
        icon: statusIcons.home,
        variant: "outline",
      }}
      footerCode="WW-SYS-500"
      footerStatus="RECOVERABLE_ERROR"
    />
  );
}
