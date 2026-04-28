"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { NotFoundStatusScreen } from "@/components/system/not-found-status-screen";
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
  return (
    <>
      <ClearOfflinePackForSlug />
      <NotFoundStatusScreen />
    </>
  );
}
