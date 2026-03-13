import type {
  LocationLGA,
  LocationPollingUnit,
  LocationState,
  LocationWard,
} from "@/types/location";

type LocationLevel = "state" | "lga" | "ward" | "pu";

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `API error: ${response.statusText}`);
  }

  return response.json();
}

async function getLocationItems<T>(
  level: LocationLevel,
  parent?: string,
): Promise<T[]> {
  const params = new URLSearchParams({ level });

  if (parent) {
    params.set("parent", parent);
  }

  const data = await apiCall<{ items: T[] }>(
    `/register/locations?${params.toString()}`,
  );

  return data.items;
}

export const locationApi = {
  getStates: async (): Promise<{ states: LocationState[] }> => {
    const states = await getLocationItems<LocationState>("state");
    return { states };
  },

  getLGAsByState: async (
    stateCode: string,
  ): Promise<{ lgas: LocationLGA[] }> => {
    const lgas = await getLocationItems<LocationLGA>("lga", stateCode);
    return { lgas };
  },

  getWardsByLGA: async (
    lgaCode: string,
  ): Promise<{ wards: LocationWard[] }> => {
    const wards = await getLocationItems<LocationWard>("ward", lgaCode);
    return { wards };
  },

  getPollingUnitsByWard: async (
    wardCode: string,
  ): Promise<{ pollingUnits: LocationPollingUnit[] }> => {
    const pollingUnits = await getLocationItems<LocationPollingUnit>(
      "pu",
      wardCode,
    );
    return { pollingUnits };
  },

  verifyNINWithLocation: async (
    nin: string,
  ): Promise<{
    verified: boolean;
    message: string;
    data?: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      stateCode: string;
      stateName: string;
      lgaCode: string;
      lgaName: string;
    };
  }> => {
    return apiCall("/register/verify-nin", {
      method: "POST",
      body: JSON.stringify({ nin }),
    });
  },
};
