"use client";

import { useRouter } from "next/navigation";
import {
  AppStatusScreen,
  statusIcons,
} from "@/components/system/app-status-screen";

export function NotFoundStatusScreen() {
  const router = useRouter();

  return (
    <AppStatusScreen
      code="404"
      protocol="Err_Protocol_404"
      title="Page Not Found"
      description="We couldn’t find the page you’re looking for. It may have moved, expired, or never existed."
      tone="primary"
      primaryAction={{
        label: "Return Home",
        href: "/",
        icon: statusIcons.home,
        variant: "default",
      }}
      secondaryAction={{
        label: "Go Back",
        onClick: () => router.back(),
        icon: statusIcons.back,
        variant: "outline",
      }}
      footerCode="WW-SYS-404"
      footerStatus="END_OF_LINE"
    />
  );
}
