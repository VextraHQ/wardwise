"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { GeoBreadcrumb } from "./geo-breadcrumb";
import { GeoStatsBar } from "./geo-stats-bar";
import { GeoLevelStates } from "./geo-level-states";
import { GeoLevelLgas } from "./geo-level-lgas";
import { GeoLevelWards } from "./geo-level-wards";
import { GeoLevelPollingUnits } from "./geo-level-polling-units";
import { Skeleton } from "@/components/ui/skeleton";

function GeoManagementContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stateCode = searchParams.get("state");
  const lgaId = searchParams.get("lga");
  const wardId = searchParams.get("ward");

  // Additional context passed for breadcrumb names
  const lgaName = searchParams.get("lgaName");
  const wardName = searchParams.get("wardName");

  const level = wardId
    ? "polling-units"
    : lgaId
      ? "wards"
      : stateCode
        ? "lgas"
        : "states";

  const navigate = (params: Record<string, string>) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
    router.push(`/admin/geo?${sp.toString()}`);
  };

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:gap-6 md:p-6">
      <GeoBreadcrumb
        stateCode={stateCode}
        lgaId={lgaId ? parseInt(lgaId) : null}
        lgaName={lgaName}
        wardId={wardId ? parseInt(wardId) : null}
        wardName={wardName}
        onNavigate={navigate}
      />

      <GeoStatsBar />

      {level === "states" && (
        <GeoLevelStates onDrillDown={(code) => navigate({ state: code })} />
      )}
      {level === "lgas" && stateCode && (
        <GeoLevelLgas
          stateCode={stateCode}
          onDrillDown={(id, name) =>
            navigate({ state: stateCode, lga: String(id), lgaName: name })
          }
        />
      )}
      {level === "wards" && lgaId && (
        <GeoLevelWards
          lgaId={parseInt(lgaId)}
          lgaName={lgaName}
          onDrillDown={(id, name) =>
            navigate({
              state: stateCode || "",
              lga: lgaId,
              lgaName: lgaName || "",
              ward: String(id),
              wardName: name,
            })
          }
        />
      )}
      {level === "polling-units" && wardId && (
        <GeoLevelPollingUnits wardId={parseInt(wardId)} wardName={wardName} />
      )}
    </div>
  );
}

export function GeoManagement() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 flex-col gap-5 p-4 md:gap-6 md:p-6">
          <Skeleton className="bg-card border-border/60 h-8 w-full max-w-[18rem] animate-pulse rounded-sm border border-dashed sm:w-64" />
          <Skeleton className="bg-card border-border/60 h-40 w-full animate-pulse rounded-sm border border-dashed sm:h-24" />
          <Skeleton className="bg-card border-border/60 h-96 w-full animate-pulse rounded-sm border border-dashed" />
        </div>
      }
    >
      <GeoManagementContent />
    </Suspense>
  );
}
