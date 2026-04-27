"use client";

import { useCallback } from "react";
import type { UseCollectOfflineGeoReturn } from "@/hooks/use-collect-offline-geo";
import type { GeoLga, GeoPollingUnit, GeoWard } from "@/types/collect";

/**
 * Returned object explains which source was used for each geo unit,
 * and what the loading/error states are.
 */
export type GeoResolution = {
  resolvedLgas: GeoLga[];
  resolvedWards: GeoWard[];
  resolvedPollingUnits: GeoPollingUnit[];
  lgasLoading: boolean;
  wardsLoading: boolean;
  unitsLoading: boolean;
  lgasError: boolean;
  wardsError: boolean;
  unitsError: boolean;
  usingLocalLgas: boolean;
  usingLocalWards: boolean;
  usingLocalUnits: boolean;
  usingLocalData: boolean;
  offlineBlockReason: "no-pack" | "scope-invalid" | null;
  retryGeo: () => void;
};

/**
 * Picks the right geo data based on various online/offline and error states.
 */
export function useCollectGeoResolution({
  lgaId,
  wardId,
  isOffline,
  offlineGeo,
  liveLgas,
  liveWards,
  livePollingUnits,
  liveLgasLoading,
  liveWardsLoading,
  liveUnitsLoading,
  liveLgasError,
  liveWardsError,
  liveUnitsError,
  refetchLgas,
  refetchWards,
  refetchUnits,
}: {
  lgaId: number | undefined;
  wardId: number | undefined;
  isOffline: boolean;
  offlineGeo: UseCollectOfflineGeoReturn;
  liveLgas: GeoLga[];
  liveWards: GeoWard[];
  livePollingUnits: GeoPollingUnit[];
  liveLgasLoading: boolean;
  liveWardsLoading: boolean;
  liveUnitsLoading: boolean;
  liveLgasError: boolean;
  liveWardsError: boolean;
  liveUnitsError: boolean;
  refetchLgas: () => void;
  refetchWards: () => void;
  refetchUnits: () => void;
}): GeoResolution {
  // Grab offline data pack if available and healthy
  const offlinePack = offlineGeo.pack;
  const packIsUsable =
    offlinePack !== null && offlineGeo.health !== "scope_invalid";
  const packLgas = packIsUsable ? (offlinePack?.lgas ?? []) : [];
  const packWardsForLga =
    packIsUsable && lgaId ? (offlinePack?.wardsByLgaId?.[lgaId] ?? []) : [];
  const packUnitsForWard =
    packIsUsable && wardId
      ? (offlinePack?.pollingUnitsByWardId?.[wardId] ?? [])
      : [];

  // Decide which source to use for each geo layer.
  // If offline and pack available, use that; otherwise, fallback if errors and offline pack has data.
  const usingLocalLgas = isOffline
    ? packIsUsable
    : liveLgasError && packIsUsable;
  const usingLocalWards = isOffline
    ? packIsUsable
    : liveWardsError && packWardsForLga.length > 0;
  const usingLocalUnits = isOffline
    ? packIsUsable
    : liveUnitsError && packUnitsForWard.length > 0;

  // If *any* layer falls back locally, usingLocalData is true
  const usingLocalData = usingLocalLgas || usingLocalWards || usingLocalUnits;

  // Final resolved lists, using local or live based on above
  const resolvedLgas = usingLocalLgas ? packLgas : liveLgas;
  const resolvedWards = usingLocalWards ? packWardsForLga : liveWards;
  const resolvedPollingUnits = usingLocalUnits
    ? packUnitsForWard
    : livePollingUnits;

  // If offline, indicate reason for not using local
  const offlineBlockReason: "no-pack" | "scope-invalid" | null = isOffline
    ? !offlinePack
      ? "no-pack"
      : offlineGeo.health === "scope_invalid"
        ? "scope-invalid"
        : null
    : null;

  // Retry will try to fetch layers again, but only for those with selected keys
  const retryGeo = useCallback(() => {
    refetchLgas();
    if (lgaId) refetchWards();
    if (wardId) refetchUnits();
  }, [refetchLgas, refetchWards, refetchUnits, lgaId, wardId]);

  // Each state reflects what's really loading/erroring, but not if we're falling back to local cache
  return {
    resolvedLgas,
    resolvedWards,
    resolvedPollingUnits,
    lgasLoading: liveLgasLoading && !usingLocalLgas,
    wardsLoading: liveWardsLoading && !usingLocalWards,
    unitsLoading: liveUnitsLoading && !usingLocalUnits,
    lgasError: liveLgasError && !usingLocalLgas,
    wardsError: liveWardsError && !usingLocalWards,
    unitsError: liveUnitsError && !usingLocalUnits,
    usingLocalLgas,
    usingLocalWards,
    usingLocalUnits,
    usingLocalData,
    offlineBlockReason,
    retryGeo,
  };
}
