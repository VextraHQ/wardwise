// Polling Unit Data - Real INEC Data
import type { LocationPollingUnit } from "@/types/location";
import { getWardsByLGA, getWardByCode } from "@/lib/data/wards";

// Real INEC Polling Units by Ward Code
// Source: INEC Directory of Polling Units (Revised January 2015)
const realPollingUnits: Record<string, LocationPollingUnit[]> = {
  // Jama'are LGA - Jama'are 'D' Ward
  "JAMA-ARE-D": [
    {
      code: "JAD-001",
      name: "Zango, Abdulqadir Primary School I",
      wardCode: "JAMA-ARE-D",
    },
    {
      code: "JAD-002",
      name: "Zango, Abdulqadir Primary School II",
      wardCode: "JAMA-ARE-D",
    },
    {
      code: "JAD-003",
      name: "Nadadaruwa, Abdulqadir Primary School I",
      wardCode: "JAMA-ARE-D",
    },
    {
      code: "JAD-004",
      name: "Nadadaruwa, Abdulqadir Primary School II",
      wardCode: "JAMA-ARE-D",
    },
    {
      code: "JAD-005",
      name: "Agayari, Women Centre",
      wardCode: "JAMA-ARE-D",
    },
    {
      code: "JAD-006",
      name: "Tsangayar, Tudun M. Dauda",
      wardCode: "JAMA-ARE-D",
    },
    {
      code: "JAD-007",
      name: "Masama, Masam Primary School",
      wardCode: "JAMA-ARE-D",
    },
  ],

  // Jama'are LGA - Jama'are 'C' Ward
  "JAMA-ARE-C": [
    {
      code: "JAC-001",
      name: "Unguwan Tsamiya, Mai Ungis House",
      wardCode: "JAMA-ARE-C",
    },
    {
      code: "JAC-002",
      name: "Unguwan S. Fawa, Sarkin Fawa House",
      wardCode: "JAMA-ARE-C",
    },
    {
      code: "JAC-003",
      name: "Unguwar S. Fawa, Post Office",
      wardCode: "JAMA-ARE-C",
    },
    {
      code: "JAC-004",
      name: "Unguwar Baure, Wazirin Aska House",
      wardCode: "JAMA-ARE-C",
    },
    {
      code: "JAC-005",
      name: "Unguwar Ganneri, K. Primary School I",
      wardCode: "JAMA-ARE-C",
    },
    {
      code: "JAC-006",
      name: "Unguwar Ganneri, K. Primary School II",
      wardCode: "JAMA-ARE-C",
    },
    {
      code: "JAC-007",
      name: "Yangamai Primary School",
      wardCode: "JAMA-ARE-C",
    },
    {
      code: "JAC-008",
      name: "Dako Dako Primary School",
      wardCode: "JAMA-ARE-C",
    },
    {
      code: "JAC-009",
      name: "Ayas' Kofar Jauro",
      wardCode: "JAMA-ARE-C",
    },
  ],

  // Jama'are LGA - Dogon Jeji 'A' Ward
  "DOGON-JEJI-A": [
    {
      code: "DJA-001",
      name: "Kofar Fada District Head I",
      wardCode: "DOGON-JEJI-A",
    },
    {
      code: "DJA-002",
      name: "Kofar Fada District Head II",
      wardCode: "DOGON-JEJI-A",
    },
    {
      code: "DJA-003",
      name: "Kofar Fada Opposite Guest House",
      wardCode: "DOGON-JEJI-A",
    },
    {
      code: "DJA-004",
      name: "Wudilawa, Unguwar Wudilawa",
      wardCode: "DOGON-JEJI-A",
    },
    {
      code: "DJA-005",
      name: "Wallawa, Primary School",
      wardCode: "DOGON-JEJI-A",
    },
    {
      code: "DJA-006",
      name: "Kofar Kudu, Kofar Kudu",
      wardCode: "DOGON-JEJI-A",
    },
    {
      code: "DJA-007",
      name: "Mukaddas Primary School, Primary School",
      wardCode: "DOGON-JEJI-A",
    },
    {
      code: "DJA-008",
      name: "Bakin Kasuwa, Bakin Kasuwa",
      wardCode: "DOGON-JEJI-A",
    },
  ],

  // Jama'are LGA - Dogon Jeji 'B' Ward
  "DOGON-JEJI-B": [
    {
      code: "DJB-001",
      name: "Sabon Kafi, Primary School I",
      wardCode: "DOGON-JEJI-B",
    },
    {
      code: "DJB-002",
      name: "Sabon Kafi, Primary School II",
      wardCode: "DOGON-JEJI-B",
    },
    {
      code: "DJB-003",
      name: "Sabon Kafi, Dispensary",
      wardCode: "DOGON-JEJI-B",
    },
    {
      code: "DJB-004",
      name: "Boggajedda, K/Jauro House",
      wardCode: "DOGON-JEJI-B",
    },
    {
      code: "DJB-005",
      name: "Kayarda, K/Jauro House",
      wardCode: "DOGON-JEJI-B",
    },
    {
      code: "DJB-006",
      name: "Mabai, Primary School",
      wardCode: "DOGON-JEJI-B",
    },
    {
      code: "DJB-007",
      name: "Marmanji, Primary School",
      wardCode: "DOGON-JEJI-B",
    },
    {
      code: "DJB-008",
      name: "Dasgalwo, G/Ganji",
      wardCode: "DOGON-JEJI-B",
    },
    {
      code: "DJB-009",
      name: "Yalwa, Kofar Jauro",
      wardCode: "DOGON-JEJI-B",
    },
  ],

  // Jama'are LGA - Dogon Jeji 'C' Ward
  "DOGON-JEJI-C": [
    {
      code: "DJC-001",
      name: "Gongo, Gongo Primary School I",
      wardCode: "DOGON-JEJI-C",
    },
    {
      code: "DJC-002",
      name: "Gongo, Gongo Primary School II",
      wardCode: "DOGON-JEJI-C",
    },
    {
      code: "DJC-003",
      name: "Gilar, Gilar Primary School I",
      wardCode: "DOGON-JEJI-C",
    },
    {
      code: "DJC-004",
      name: "Gilar, Gilar Primary School II",
      wardCode: "DOGON-JEJI-C",
    },
    {
      code: "DJC-005",
      name: "Gilar, Gilar Primary School III",
      wardCode: "DOGON-JEJI-C",
    },
    {
      code: "DJC-006",
      name: "Arewa, Arewa I",
      wardCode: "DOGON-JEJI-C",
    },
    {
      code: "DJC-007",
      name: "Arewa, Arewa II",
      wardCode: "DOGON-JEJI-C",
    },
    {
      code: "DJC-008",
      name: "Fatiske, H. Jauro",
      wardCode: "DOGON-JEJI-C",
    },
  ],

  // Yola North LGA - Gwadabawa Ward (Adamawa State)
  GWADABAWA: [
    {
      code: "GWA-001",
      name: "Old Govt. House / Behind Ribadu Square",
      wardCode: "GWADABAWA",
    },
    {
      code: "GWA-002",
      name: "Old Govt. House / Opp Main Gate",
      wardCode: "GWADABAWA",
    },
    {
      code: "GWA-003",
      name: "Units of 80 Houses / Opp NDLEA",
      wardCode: "GWADABAWA",
    },
    {
      code: "GWA-004",
      name: "Yola Club / No 1 Adamawa Rd",
      wardCode: "GWADABAWA",
    },
    {
      code: "GWA-005",
      name: "Gwadabawa Primary School",
      wardCode: "GWADABAWA",
    },
    {
      code: "GWA-006",
      name: "Gwadabawa Central Mosque",
      wardCode: "GWADABAWA",
    },
  ],

  // Yola North LGA - Jambutu Ward (Adamawa State)
  JAMBUTU: [
    {
      code: "JAM-001",
      name: "Damilu Primary School / Damilu Primary School I",
      wardCode: "JAMBUTU",
    },
    {
      code: "JAM-002",
      name: "Damilu Primary School / Damilu Primary School II",
      wardCode: "JAMBUTU",
    },
    {
      code: "JAM-003",
      name: "Jambutu Primary School / Jambutu Primary School",
      wardCode: "JAMBUTU",
    },
    {
      code: "JAM-004",
      name: "Jauro Damilu / Kofar Jauro",
      wardCode: "JAMBUTU",
    },
    {
      code: "JAM-005",
      name: "Jambutu Market Square",
      wardCode: "JAMBUTU",
    },
    {
      code: "JAM-006",
      name: "Jambutu Central Mosque",
      wardCode: "JAMBUTU",
    },
  ],

  // Bauchi LGA - Dandango/Yamrat Ward (Bauchi State)
  DANDANGO: [
    {
      code: "DAN-001",
      name: "Dandango Primary School",
      wardCode: "DANDANGO",
    },
    {
      code: "DAN-002",
      name: "Sabongari / Dandango",
      wardCode: "DANDANGO",
    },
    {
      code: "DAN-003",
      name: "Yamrat Primary School",
      wardCode: "DANDANGO",
    },
    {
      code: "DAN-004",
      name: "Yamrat Central Mosque",
      wardCode: "DANDANGO",
    },
  ],

  // Bauchi LGA - Yelwa Ward (Bauchi State)
  // Note: YELWA ward code is for Bauchi LGA, not Yola North
  YELWA: [
    {
      code: "YEL-001",
      name: "Yelwa Primary School I",
      wardCode: "YELWA",
    },
    {
      code: "YEL-002",
      name: "Yelwa Primary School II",
      wardCode: "YELWA",
    },
    {
      code: "YEL-003",
      name: "Yelwa Central Mosque",
      wardCode: "YELWA",
    },
    {
      code: "YEL-004",
      name: "Yelwa Market Square",
      wardCode: "YELWA",
    },
  ],
};

// Common Nigerian polling unit location names
const pollingUnitLocations = [
  "Primary School",
  "Central Mosque",
  "Primary School II",
  "Market Square",
  "Health Centre",
  "Community Centre",
  "Primary School III",
  "Secondary School",
  "Dispensary",
  "Ward Office",
  "Town Hall",
  "Youth Centre",
  "Women Centre",
  "Primary School IV",
  "Central Mosque II",
];

// Helper to get ward name from ward code
function getWardName(wardCode: string): string {
  const ward = getWardByCode(wardCode);
  return ward?.name || wardCode;
}

// Generate polling units for a ward - fallback for wards without real data
function generatePollingUnits(
  wardCode: string,
  count = 15,
): LocationPollingUnit[] {
  const wardName = getWardName(wardCode);
  const prefix = wardCode.slice(0, 3).toUpperCase();

  return Array.from({ length: count }).map((_, i) => {
    const num = i + 1;
    const location = pollingUnitLocations[i % pollingUnitLocations.length];

    return {
      code: `${prefix}-${String(num).padStart(3, "0")}`,
      name: `${wardName} ${location}`,
      wardCode,
    };
  });
}

// Get polling units by ward code
// Returns real INEC data if available, otherwise generates demo data
export function getPollingUnitsByWard(wardCode: string): LocationPollingUnit[] {
  // Check if we have real data for this ward
  if (realPollingUnits[wardCode]) {
    return realPollingUnits[wardCode];
  }
  // Fallback to generated data for other wards
  return generatePollingUnits(wardCode);
}

// Get polling units by LGA code (through wards)
export function getPollingUnitsByLGA(lgaCode: string): LocationPollingUnit[] {
  const wards = getWardsByLGA(lgaCode);
  return wards.flatMap((ward) => getPollingUnitsByWard(ward.code));
}
