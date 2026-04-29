"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AppStatusScreen,
  statusIcons,
} from "@/components/system/app-status-screen";
import { clearOfflineGeoPack } from "@/lib/collect/offline-geo-pack";

// Removes any offline map data for the missing campaign (by slug)
function ClearOfflinePackForSlug() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  useEffect(() => {
    if (!slug) return;
    void clearOfflineGeoPack(slug);
  }, [slug]);

  return null;
}

export default function CampaignNotFound() {
  const router = useRouter();

  return (
    <>
      <ClearOfflinePackForSlug />
      <AppStatusScreen
        code="404"
        protocol="Err_Protocol_Collect_404"
        title="This registration form is unavailable"
        description="The link may be incorrect, expired, or the campaign is not currently live."
        tone="primary"
        supportHref="/contact"
        supportLabel="Contact WardWise Support"
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
        footerCode="WW-COLLECT-404"
        footerStatus="FORM_UNAVAILABLE"
      />
    </>
  );
}
