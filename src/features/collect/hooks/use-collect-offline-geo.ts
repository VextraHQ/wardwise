"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useOnlineStatus } from "@/hooks/shared/use-online-status";
import { useQueryClient } from "@tanstack/react-query";
import { publicCollectApi } from "@/features/collect/api/collect-api";
import {
  computeOfflineGeoHealth,
  type OfflineGeoHealth,
} from "@/features/collect/lib/offline/offline-geo-health";
import {
  clearOfflineGeoPack,
  getOfflineGeoPack,
  saveOfflineGeoPack,
  type OfflineGeoPack,
} from "@/features/collect/lib/offline/offline-geo-pack";
import type {
  GeoLga,
  GeoWard,
  PublicCampaign,
} from "@/features/collect/types/collect.types";

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
 * lives in '@/features/collect/lib/offline/offline-geo-health'.
 */
export function useCollectOfflineGeo(
  campaign: PublicCampaign,
): UseCollectOfflineGeoReturn {
  const queryClient = useQueryClient();
  // The stored pack and the campaign it was loaded for. A pack loaded for a
  // previous campaign counts as "not loaded yet" for the current one.
  const [stored, setStored] = useState<{
    slug: string;
    pack: OfflineGeoPack | null;
  } | null>(null);
  const [isPreparing, setIsPreparing] = useState<boolean>(false);
  const isOffline = !useOnlineStatus();
  const [freshAllowedSet, setFreshAllowedSet] = useState<Set<number> | null>(
    null,
  );
  const slug = campaign.slug;
  const packLoaded = stored?.slug === slug;
  const pack = packLoaded ? stored.pack : null;

  // Latest slug for async work that may finish after the campaign changed.
  const slugRef = useRef(slug);

  useEffect(() => {
    slugRef.current = slug;
  }, [slug]);

  // Load the offline geo pack when component mounts or when the campaign changes.
  useEffect(() => {
    let cancelled = false;
    getOfflineGeoPack(slug)
      .then((saved) => {
        if (!cancelled) setStored({ slug, pack: saved });
      })
      .catch(() => {
        if (!cancelled) setStored({ slug, pack: null });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

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
        if (slugRef.current === slug) setStored({ slug, pack: next });
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
      setStored({ slug, pack: null });
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
