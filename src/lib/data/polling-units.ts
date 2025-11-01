// Polling Unit Data - DEMO ONLY
import type { LocationPollingUnit } from "@/types/location";
import { getWardsByLGA } from "@/lib/data/wards";

const pollingUnitLocations = [
  "Community Centre",
  "Primary School",
  "Secondary School",
  "Town Hall",
  "Health Centre",
  "Civic Centre",
  "Church Hall",
  "Mosque",
  "Market Square",
  "Police Station",
  "Fire Station",
  "Youth Centre",
  "Women Centre",
  "Sports Complex",
  "Public Library",
  "Council Ward Office",
];

// Generate polling units for a ward - dynamic polling units for demo purposes
export function generatePollingUnits(
  wardCode: string,
  count = 15,
): LocationPollingUnit[] {
  return Array.from({ length: count }).map((_, i) => {
    const num = String(i + 1).padStart(3, "0");
    const location = pollingUnitLocations[i % pollingUnitLocations.length];
    const prefix = wardCode.slice(0, 3).toUpperCase();

    return {
      code: `${prefix}-${num}`,
      name: `Unit ${num} - ${location}`,
      wardCode,
    };
  });
}

// Get polling units by ward code
export function getPollingUnitsByWard(wardCode: string): LocationPollingUnit[] {
  return generatePollingUnits(wardCode);
}

// Get polling units by LGA code (through wards)
export function getPollingUnitsByLGA(lgaCode: string): LocationPollingUnit[] {
  const wards = getWardsByLGA(lgaCode);
  return wards.flatMap((ward) => generatePollingUnits(ward.code));
}
