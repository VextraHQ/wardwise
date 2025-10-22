"use client";

import { useQuery, type QueryClient } from "@tanstack/react-query";
import {
  mockApi,
  type LocationState,
  type LocationLGA,
  type LocationWard,
  type LocationPollingUnit,
} from "@/lib/mock/mockApi";

// Query keys for consistent caching
export const locationQueryKeys = {
  states: ["location", "states"] as const,
  lgas: (stateCode: string) => ["location", "lgas", stateCode] as const,
  wards: (lgaCode: string) => ["location", "wards", lgaCode] as const,
  pollingUnits: (wardCode: string) =>
    ["location", "polling-units", wardCode] as const,
};

// Hook to get all states
export function useStates() {
  return useQuery({
    queryKey: locationQueryKeys.states,
    queryFn: () => mockApi.getStates(),
    staleTime: 1000 * 60 * 60, // 1 hour - states rarely change
    gcTime: 1000 * 60 * 60 * 24, // 24 hours cache
    select: (data) => data.states,
  });
}

// Hook to get LGAs by state
export function useLGAsByState(stateCode: string | null) {
  return useQuery({
    queryKey: locationQueryKeys.lgas(stateCode || ""),
    queryFn: () => mockApi.getLGAsByState(stateCode!),
    enabled: !!stateCode, // Only fetch when stateCode is available
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // 2 hours cache
    select: (data) => data.lgas,
  });
}

// Hook to get wards by LGA
export function useWardsByLGA(lgaCode: string | null) {
  return useQuery({
    queryKey: locationQueryKeys.wards(lgaCode || ""),
    queryFn: () => mockApi.getWardsByLGA(lgaCode!),
    enabled: !!lgaCode, // Only fetch when lgaCode is available
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour cache
    select: (data) => data.wards,
  });
}

// Hook to get polling units by ward
export function usePollingUnitsByWard(wardCode: string | null) {
  return useQuery({
    queryKey: locationQueryKeys.pollingUnits(wardCode || ""),
    queryFn: () => mockApi.getPollingUnitsByWard(wardCode!),
    enabled: !!wardCode, // Only fetch when wardCode is available
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    select: (data) => data.pollingUnits,
  });
}

// Combined hook for optimized location data management
export function useLocationData() {
  const statesQuery = useStates();

  return {
    // States
    states: statesQuery.data || [],
    statesLoading: statesQuery.isLoading,
    statesError: statesQuery.error,

    // Helper function to get LGAs for a specific state
    useLGAs: (stateCode: string | null) => useLGAsByState(stateCode),

    // Helper function to get wards for a specific LGA
    useWards: (lgaCode: string | null) => useWardsByLGA(lgaCode),

    // Helper function to get polling units for a specific ward
    usePollingUnits: (wardCode: string | null) =>
      usePollingUnitsByWard(wardCode),

    // Prefetch functions for optimizing UX
    prefetchLGAs: (queryClient: QueryClient, stateCode: string) => {
      return queryClient.prefetchQuery({
        queryKey: locationQueryKeys.lgas(stateCode),
        queryFn: () => mockApi.getLGAsByState(stateCode),
        staleTime: 1000 * 60 * 30,
      });
    },

    prefetchWards: (queryClient: QueryClient, lgaCode: string) => {
      return queryClient.prefetchQuery({
        queryKey: locationQueryKeys.wards(lgaCode),
        queryFn: () => mockApi.getWardsByLGA(lgaCode),
        staleTime: 1000 * 60 * 15,
      });
    },

    prefetchPollingUnits: (queryClient: QueryClient, wardCode: string) => {
      return queryClient.prefetchQuery({
        queryKey: locationQueryKeys.pollingUnits(wardCode),
        queryFn: () => mockApi.getPollingUnitsByWard(wardCode),
        staleTime: 1000 * 60 * 10,
      });
    },
  };
}

// Enhanced NIN verification hook with location data
export function useNINVerificationWithLocation(nin: string | null) {
  return useQuery({
    queryKey: ["nin-verification", nin],
    queryFn: async () => {
      // This would be replaced with a real NIN verification service
      // For now, we import the mock API dynamically
      const { mockApi } = await import("@/lib/mock/mockApi");
      return mockApi.verifyNINWithLocation(nin!);
    },
    enabled: !!nin && nin.length === 11,
    staleTime: 1000 * 60 * 5, // 5 minutes for NIN verification
    gcTime: 1000 * 60 * 15, // 15 minutes cache
    retry: 2, // Retry failed requests twice
  });
}

// Types for convenience
export type { LocationState, LocationLGA, LocationWard, LocationPollingUnit };
