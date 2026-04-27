"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { publicCollectApi } from "@/lib/api/collect";
import {
  computeOfflineGeoHealth,
  type OfflineGeoHealth,
} from "@/lib/collect/offline-geo-health";
import {
  clearOfflineGeoPack,
  getOfflineGeoPack,
  saveOfflineGeoPack,
  type OfflineGeoPack,
} from "@/lib/collect/offline-geo-pack";
import type { GeoLga, GeoWard, PublicCampaign } from "@/types/collect";

export type { OfflineGeoHealth };

export type UseCollectOfflineGeoReturn = {
  pack: OfflineGeoPack | null;
  isPrepared: boolean;
  preparedLgaIds: number[];
  preparedAt: string | null;
  health: OfflineGeoHealth;
  isPreparing: boolean;
  isOffline: boolean;
  prepare: (lgaIds: number[]) => Promise<void>;
  clear: () => Promise<void>;
};

/**
 * Handles per-campaign offline geo data, storing it in IndexedDB.
 * The logic for checking how "healthy" (up-to-date/synced) the offline data is,
 * lives in '@/lib/collect/offline-geo-health'.
 */
export function useCollectOfflineGeo(
  campaign: PublicCampaign,
): UseCollectOfflineGeoReturn {
  const queryClient = useQueryClient();
  const [pack, setPack] = useState<OfflineGeoPack | null>(null);
  const [packLoaded, setPackLoaded] = useState<boolean>(false);
  const [isPreparing, setIsPreparing] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [freshAllowedSet, setFreshAllowedSet] = useState<Set<number> | null>(
    null,
  );
  const slug = campaign.slug;
  const slugRef = useRef(slug);
  slugRef.current = slug;

  // Load the offline geo pack when component mounts or when the campaign changes.
  useEffect(() => {
    let cancelled = false;
    setPackLoaded(false);
    getOfflineGeoPack(slug)
      .then((stored) => {
        if (cancelled) return;
        setPack(stored);
        setPackLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setPack(null);
        setPackLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Detect network going online/offline. Update isOffline accordingly.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOffline(!navigator.onLine);
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  // When we have a local pack and we're online, refresh the allowed LGAs for this campaign.
  // This result also updates any usage via TanStack (react-query) for the same query key.
  useEffect(() => {
    if (isOffline) return;
    if (!packLoaded || !pack) return;
    let cancelled = false;
    void queryClient
      .fetchQuery({
        queryKey: ["campaign-lgas", slug],
        queryFn: async () => {
          const data = await publicCollectApi.getLgas(slug);
          return data.lgas;
        },
        staleTime: 0,
      })
      .then((lgas: GeoLga[]) => {
        if (cancelled) return;
        setFreshAllowedSet(new Set(lgas.map((l) => l.id)));
      })
      .catch(() => {
        // If fetching LGAs fails, don't overwrite allowed set with a bad value.
        if (cancelled) return;
        setFreshAllowedSet(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isOffline, packLoaded, pack, slug, queryClient]);

  // Prepares (downloads and saves) geo data for the given LGA IDs for this campaign.
  const prepare = useCallback(
    async (lgaIds: number[]) => {
      if (lgaIds.length === 0) return;
      setIsPreparing(true);
      try {
        const response = await publicCollectApi.getOfflinePack({
          campaignSlug: slug,
          lgaIds,
        });

        // Group wards under their LGA.
        const wardsByLgaId: Record<number, GeoWard[]> = {};
        for (const ward of response.wards) {
          (wardsByLgaId[ward.lgaId] ??= []).push(ward);
        }
        // Group polling units under their ward.
        const pollingUnitsByWardId: Record<
          number,
          (typeof response.pollingUnits)[number][]
        > = {};
        for (const pu of response.pollingUnits) {
          (pollingUnitsByWardId[pu.wardId] ??= []).push(pu);
        }

        const next: OfflineGeoPack = {
          campaignSlug: slug,
          campaignUpdatedAt: response.campaignUpdatedAt,
          preparedAt: new Date().toISOString(),
          preparedLgaIds: [...lgaIds].sort((a, b) => a - b),
          lgas: response.lgas,
          wardsByLgaId,
          pollingUnitsByWardId,
        };

        // Save the new offline geo pack.
        await saveOfflineGeoPack(next);
        // Only update React state if this campaign is still the selected one.
        if (slugRef.current === slug) setPack(next);
      } finally {
        setIsPreparing(false);
      }
    },
    [slug],
  );

  // Removes (deletes) the local offline geo pack for this campaign.
  const clear = useCallback(async () => {
    await clearOfflineGeoPack(slug);
    if (slugRef.current === slug) {
      setPack(null);
      setFreshAllowedSet(null);
    }
  }, [slug]);

  // Determine offline geo data status for the current state.
  const health = computeOfflineGeoHealth({
    pack,
    campaignUpdatedAt: campaign.updatedAt,
    freshAllowedSet,
  });

  return {
    pack,
    isPrepared: pack !== null,
    preparedLgaIds: pack?.preparedLgaIds ?? [],
    preparedAt: pack?.preparedAt ?? null,
    health,
    isPreparing,
    isOffline,
    prepare,
    clear,
  };
}
