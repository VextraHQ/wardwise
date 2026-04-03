// Transitional static polling-unit seed source.
// Still used by partial geo seeding and the legacy /api/register/locations path.
// Do not treat this file as the long-term canonical runtime geo source.
import type { LocationPollingUnit } from "@/types/location";
import { getWardsByLGA, getWardByCode } from "@/lib/data/wards";

// Real INEC Polling Units by Ward Code
// Source: INEC Directory of Polling Units (Revised January 2015)
// Updated: All codes now use numeric format (001, 002, etc.) per INEC standards
const realPollingUnits: Record<string, LocationPollingUnit[]> = {
  // Jama'are LGA - Jama'are 'D' Ward
  "JAMA-ARE-D": [
    {
      code: "001",
      name: "Zango, Abdulqadir Primary School I",
      wardCode: "JAMA-ARE-D",
    },
    {
      code: "002",
      name: "Zango, Abdulqadir Primary School II",
      wardCode: "JAMA-ARE-D",
    },
    {
      code: "003",
      name: "Nadadaruwa, Abdulqadir Primary School I",
      wardCode: "JAMA-ARE-D",
    },
    {
      code: "004",
      name: "Nadadaruwa, Abdulqadir Primary School II",
      wardCode: "JAMA-ARE-D",
    },
    {
      code: "005",
      name: "Agayari, Women Centre",
      wardCode: "JAMA-ARE-D",
    },
    {
      code: "006",
      name: "Tsangayar, Tudun M. Dauda",
      wardCode: "JAMA-ARE-D",
    },
    {
      code: "007",
      name: "Masama, Masam Primary School",
      wardCode: "JAMA-ARE-D",
    },
  ],

  // Jama'are LGA - Jama'are 'C' Ward
  "JAMA-ARE-C": [
    {
      code: "001",
      name: "Unguwan Tsamiya, Mai Ungis House",
      wardCode: "JAMA-ARE-C",
    },
    {
      code: "002",
      name: "Unguwan S. Fawa, Sarkin Fawa House",
      wardCode: "JAMA-ARE-C",
    },
    {
      code: "003",
      name: "Unguwar S. Fawa, Post Office",
      wardCode: "JAMA-ARE-C",
    },
    {
      code: "004",
      name: "Unguwar Baure, Wazirin Aska House",
      wardCode: "JAMA-ARE-C",
    },
    {
      code: "005",
      name: "Unguwar Ganneri, K. Primary School I",
      wardCode: "JAMA-ARE-C",
    },
    {
      code: "006",
      name: "Unguwar Ganneri, K. Primary School II",
      wardCode: "JAMA-ARE-C",
    },
    {
      code: "007",
      name: "Yangamai Primary School",
      wardCode: "JAMA-ARE-C",
    },
    {
      code: "008",
      name: "Dako Dako Primary School",
      wardCode: "JAMA-ARE-C",
    },
    {
      code: "009",
      name: "Ayas' Kofar Jauro",
      wardCode: "JAMA-ARE-C",
    },
  ],

  // Jama'are LGA - Dogon Jeji 'A' Ward
  "DOGON-JEJI-A": [
    {
      code: "001",
      name: "Kofar Fada District Head I",
      wardCode: "DOGON-JEJI-A",
    },
    {
      code: "002",
      name: "Kofar Fada District Head II",
      wardCode: "DOGON-JEJI-A",
    },
    {
      code: "003",
      name: "Kofar Fada Opposite Guest House",
      wardCode: "DOGON-JEJI-A",
    },
    {
      code: "004",
      name: "Wudilawa, Unguwar Wudilawa",
      wardCode: "DOGON-JEJI-A",
    },
    {
      code: "005",
      name: "Wallawa, Primary School",
      wardCode: "DOGON-JEJI-A",
    },
    {
      code: "006",
      name: "Kofar Kudu, Kofar Kudu",
      wardCode: "DOGON-JEJI-A",
    },
    {
      code: "007",
      name: "Mukaddas Primary School, Primary School",
      wardCode: "DOGON-JEJI-A",
    },
    {
      code: "008",
      name: "Bakin Kasuwa, Bakin Kasuwa",
      wardCode: "DOGON-JEJI-A",
    },
  ],

  // Jama'are LGA - Dogon Jeji 'B' Ward
  "DOGON-JEJI-B": [
    {
      code: "001",
      name: "Sabon Kafi, Primary School I",
      wardCode: "DOGON-JEJI-B",
    },
    {
      code: "002",
      name: "Sabon Kafi, Primary School II",
      wardCode: "DOGON-JEJI-B",
    },
    {
      code: "003",
      name: "Sabon Kafi, Dispensary",
      wardCode: "DOGON-JEJI-B",
    },
    {
      code: "004",
      name: "Boggajedda, K/Jauro House",
      wardCode: "DOGON-JEJI-B",
    },
    {
      code: "005",
      name: "Kayarda, K/Jauro House",
      wardCode: "DOGON-JEJI-B",
    },
    {
      code: "006",
      name: "Mabai, Primary School",
      wardCode: "DOGON-JEJI-B",
    },
    {
      code: "007",
      name: "Marmanji, Primary School",
      wardCode: "DOGON-JEJI-B",
    },
    {
      code: "008",
      name: "Dasgalwo, G/Ganji",
      wardCode: "DOGON-JEJI-B",
    },
    {
      code: "009",
      name: "Yalwa, Kofar Jauro",
      wardCode: "DOGON-JEJI-B",
    },
  ],

  // Jama'are LGA - Dogon Jeji 'C' Ward
  "DOGON-JEJI-C": [
    {
      code: "001",
      name: "Gongo, Gongo Primary School I",
      wardCode: "DOGON-JEJI-C",
    },
    {
      code: "002",
      name: "Gongo, Gongo Primary School II",
      wardCode: "DOGON-JEJI-C",
    },
    {
      code: "003",
      name: "Gilar, Gilar Primary School I",
      wardCode: "DOGON-JEJI-C",
    },
    {
      code: "004",
      name: "Gilar, Gilar Primary School II",
      wardCode: "DOGON-JEJI-C",
    },
    {
      code: "005",
      name: "Gilar, Gilar Primary School III",
      wardCode: "DOGON-JEJI-C",
    },
    {
      code: "006",
      name: "Arewa, Arewa I",
      wardCode: "DOGON-JEJI-C",
    },
    {
      code: "007",
      name: "Arewa, Arewa II",
      wardCode: "DOGON-JEJI-C",
    },
    {
      code: "008",
      name: "Fatiske, H. Jauro",
      wardCode: "DOGON-JEJI-C",
    },
  ],

  // Yola North LGA - Gwadabawa Ward (Adamawa State)
  GWADABAWA: [
    {
      code: "014",
      name: "Old Govt. House / Opp Main Gate",
      wardCode: "GWADABAWA",
    },
    {
      code: "015",
      name: "Old Govt. House / Behind Ribadu Square",
      wardCode: "GWADABAWA",
    },
    {
      code: "016",
      name: "Units of 80 Houses / Opp NDLEA",
      wardCode: "GWADABAWA",
    },
    {
      code: "017",
      name: "Yola Club / No 1 Adamawa Rd",
      wardCode: "GWADABAWA",
    },
    {
      code: "001",
      name: "Gwadabawa Primary School",
      wardCode: "GWADABAWA",
    },
    {
      code: "002",
      name: "Gwadabawa Central Mosque",
      wardCode: "GWADABAWA",
    },
  ],

  // Yola North LGA - Jambutu Ward (Adamawa State)
  JAMBUTU: [
    {
      code: "001",
      name: "Damilu Primary School / Damilu Primary School I",
      wardCode: "JAMBUTU",
    },
    {
      code: "002",
      name: "Damilu Primary School / Damilu Primary School II",
      wardCode: "JAMBUTU",
    },
    {
      code: "003",
      name: "Jambutu Primary School / Jambutu Primary School",
      wardCode: "JAMBUTU",
    },
    {
      code: "004",
      name: "Jauro Damilu / Kofar Jauro",
      wardCode: "JAMBUTU",
    },
    {
      code: "005",
      name: "Jambutu Market Square",
      wardCode: "JAMBUTU",
    },
    {
      code: "006",
      name: "Jambutu Central Mosque",
      wardCode: "JAMBUTU",
    },
  ],

  // Yola North LGA - Karewa Ward (Adamawa State)
  KAREWA: [
    {
      code: "001",
      name: "BACHURE/ KOFAR JAURO BACHURE I",
      wardCode: "KAREWA",
    },
    {
      code: "002",
      name: "BACHURE/ KOFAR JAURO BACHURE II",
      wardCode: "KAREWA",
    },
    {
      code: "003",
      name: "BEKAJI PRI. SCH I",
      wardCode: "KAREWA",
    },
    {
      code: "004",
      name: "BEKAJI PRI. SCH. II",
      wardCode: "KAREWA",
    },
    {
      code: "005",
      name: "GDSS (ARMY) STAFF QTRS. I",
      wardCode: "KAREWA",
    },
    {
      code: "006",
      name: "GDSS (ARMY) STAFF QTRS. II",
      wardCode: "KAREWA",
    },
    {
      code: "007",
      name: "GDSS (ARMY) STAFF QTRS. III",
      wardCode: "KAREWA",
    },
    {
      code: "008",
      name: "GDSS (ARMY) STAFF QTRS. IV",
      wardCode: "KAREWA",
    },
    {
      code: "009",
      name: "KAREWA GDSS I",
      wardCode: "KAREWA",
    },
    {
      code: "010",
      name: "KAREWA GDSS II",
      wardCode: "KAREWA",
    },
    {
      code: "011",
      name: "KAREWA PRI. SCH. I",
      wardCode: "KAREWA",
    },
    {
      code: "012",
      name: "KAREWA PRI. SCH. II",
      wardCode: "KAREWA",
    },
    {
      code: "013",
      name: "KOFARE/ KOFAR JAURO KOFARE",
      wardCode: "KAREWA",
    },
    {
      code: "014",
      name: "MALAMRE MARKET",
      wardCode: "KAREWA",
    },
    {
      code: "015",
      name: "MALAMRE QTRS/ KOFAR SULEIMAN WAPANDA",
      wardCode: "KAREWA",
    },
    {
      code: "016",
      name: "NYIBANGO/ KOFAR JAURO NYIBANGO",
      wardCode: "KAREWA",
    },
    {
      code: "017",
      name: "STATE POLY I",
      wardCode: "KAREWA",
    },
    {
      code: "018",
      name: "STATE POLY II",
      wardCode: "KAREWA",
    },
    {
      code: "019",
      name: "STATE POLY III",
      wardCode: "KAREWA",
    },
    {
      code: "020",
      name: "BACHURE PRIMARY SCHOOL I",
      wardCode: "KAREWA",
    },
    {
      code: "021",
      name: "BACHURE PRIMARY SCHOOL II",
      wardCode: "KAREWA",
    },
    {
      code: "022",
      name: "BACHURE PRIMARY SCHOOL III",
      wardCode: "KAREWA",
    },
    {
      code: "023",
      name: "BACHURE PRIMARY SCHOOL IV",
      wardCode: "KAREWA",
    },
    {
      code: "024",
      name: "BACHURE PRIMARY SCHOOL V",
      wardCode: "KAREWA",
    },
    {
      code: "025",
      name: "BACHURE PRIMARY SCHOOL VI",
      wardCode: "KAREWA",
    },
    {
      code: "026",
      name: "BACHURE SKILLS ACQUISITION CENTRE",
      wardCode: "KAREWA",
    },
    {
      code: "027",
      name: "NVRI KOFARE I",
      wardCode: "KAREWA",
    },
    {
      code: "028",
      name: "NVRI KOFARE II",
      wardCode: "KAREWA",
    },
    {
      code: "029",
      name: "AGRIC STORE",
      wardCode: "KAREWA",
    },
    {
      code: "030",
      name: "ICPC GATE BACHURE",
      wardCode: "KAREWA",
    },
    {
      code: "031",
      name: "KOFARE PRIMARY SCHOOL I",
      wardCode: "KAREWA",
    },
    {
      code: "032",
      name: "KOFARE PRIMARY SCHOOL II",
      wardCode: "KAREWA",
    },
    {
      code: "033",
      name: "NEAR ROYAL HOSPITAL",
      wardCode: "KAREWA",
    },
    {
      code: "034",
      name: "FAAN PRIMARY SCHOOL",
      wardCode: "KAREWA",
    },
    {
      code: "035",
      name: "BEKAJI PRIMARY SCHOOL III",
      wardCode: "KAREWA",
    },
    {
      code: "036",
      name: "BEKAJI PRIMARY SCHOOL IV",
      wardCode: "KAREWA",
    },
    {
      code: "037",
      name: "BEKAJI PRIMARY SCHOOL V",
      wardCode: "KAREWA",
    },
    {
      code: "038",
      name: "STATE POLY IV",
      wardCode: "KAREWA",
    },
    {
      code: "039",
      name: "STATE POLY V",
      wardCode: "KAREWA",
    },
    {
      code: "040",
      name: "STATE POLY VI",
      wardCode: "KAREWA",
    },
    {
      code: "041",
      name: "STATE POLY VII",
      wardCode: "KAREWA",
    },
    {
      code: "042",
      name: "KAREWA GDSS III",
      wardCode: "KAREWA",
    },
    {
      code: "043",
      name: "KAREWA GDSS IV",
      wardCode: "KAREWA",
    },
    {
      code: "044",
      name: "AIRFORCE OFFICER'S QUARTERS KAREWA (FAAN)",
      wardCode: "KAREWA",
    },
    {
      code: "045",
      name: "BEHIND GMMC (RAMAT)",
      wardCode: "KAREWA",
    },
    {
      code: "046",
      name: "CHILDREN'S HOME PRIMARY SCH.",
      wardCode: "KAREWA",
    },
    {
      code: "047",
      name: "NALDA OFFICE MASAKARE",
      wardCode: "KAREWA",
    },
    {
      code: "048",
      name: "NOUN STUDY CENTER",
      wardCode: "KAREWA",
    },
    {
      code: "049",
      name: "NYIBANGO PRIMARY SCHOOL I",
      wardCode: "KAREWA",
    },
    {
      code: "050",
      name: "NYIBANGO PRIMARY SCHOOL II",
      wardCode: "KAREWA",
    },
    {
      code: "051",
      name: "GDSS ARMY STAFF QUARTERS IV",
      wardCode: "KAREWA",
    },
    {
      code: "052",
      name: "GDSS ARMY STAFF QUARTERS V",
      wardCode: "KAREWA",
    },
    {
      code: "053",
      name: "GDSS ARMY STAFF QUARTERS VI",
      wardCode: "KAREWA",
    },
    {
      code: "054",
      name: "GDSS ARMY STAFF QUARTERS VII",
      wardCode: "KAREWA",
    },
    {
      code: "055",
      name: "GDSS ARMY STAFF QUARTERS VIII",
      wardCode: "KAREWA",
    },
    {
      code: "056",
      name: "DURAGI HOTEL JUNCTION (OPEN SPACE)",
      wardCode: "KAREWA",
    },
    {
      code: "057",
      name: "ADAMAWA STATE AGENCY FOR MASS EDU. CENTRE FOR ADULT & HOME ECONOMICS MULTI PURPOSE CENTRE MALAMRE",
      wardCode: "KAREWA",
    },
    {
      code: "058",
      name: "MALAMRE MARKET I",
      wardCode: "KAREWA",
    },
    {
      code: "059",
      name: "MALAMRE HEALTH CLINIC",
      wardCode: "KAREWA",
    },
    {
      code: "060",
      name: "KAREWA PRIMARY SCHOOL I",
      wardCode: "KAREWA",
    },
  ],

  // Yola North LGA - Ajiya Ward (Adamawa State)
  AJIYA: [
    {
      code: "001",
      name: "ALH. BUBA JALO / 5 ABEOKUTA ST",
      wardCode: "AJIYA",
    },
    {
      code: "002",
      name: "ALH. JALO / NO 2 JEN CLOSE",
      wardCode: "AJIYA",
    },
    {
      code: "003",
      name: "AJIYA CLINIC OPP. AJIYA CLINIC",
      wardCode: "AJIYA",
    },
    {
      code: "004",
      name: "BUBAKARI MAIGARI / 1,KADUNA ST.",
      wardCode: "AJIYA",
    },
    {
      code: "005",
      name: "CENTRAL PRI. SCH. /CENTRAL PRI. SCH. I",
      wardCode: "AJIYA",
    },
    {
      code: "006",
      name: "CENTRAL PRI. SCH. /CENTRAL PRI. SCH. II",
      wardCode: "AJIYA",
    },
    {
      code: "007",
      name: "CENTRAL PRI. SCH. /CENTRAL PRI. SCH. III",
      wardCode: "AJIYA",
    },
    {
      code: "008",
      name: "CENTRAL PRI. SCH. /CENTRAL PRI. SCH. IV",
      wardCode: "AJIYA",
    },
    {
      code: "009",
      name: "CENTRAL PRI. SCH. /CENTRAL PRI. SCH. V",
      wardCode: "AJIYA",
    },
    {
      code: "010",
      name: "KOFAR GANA / NO 9 NDAFORO ST.",
      wardCode: "AJIYA",
    },
    {
      code: "011",
      name: "KOFAR NABARA / 120 NEPA RD.",
      wardCode: "AJIYA",
    },
    {
      code: "012",
      name: "OPP. CP'S HOUSE / 14 IBRAHIM ATTAH RD.",
      wardCode: "AJIYA",
    },
    {
      code: "013",
      name: "NEAR OLD PRISON",
      wardCode: "AJIYA",
    },
    {
      code: "014",
      name: "CENTRAL PRI. SCHOOL VI",
      wardCode: "AJIYA",
    },
    {
      code: "015",
      name: "14 IBRAHIM ATTA RD CPS HOUSE II",
      wardCode: "AJIYA",
    },
  ],

  // Yola North LGA - Yelwa Ward (Adamawa State)
  "YELWA-YOLN": [
    {
      code: "001",
      name: "EMBASSY HOTEL/ MUBI ROAD",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "002",
      name: "KOFAR M. ABUBAKAR/ 9 JIMETA ST.",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "003",
      name: "KOFAR M. BABA/ 17 JIMETA ST.",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "004",
      name: "KOFAR M. FARI/ 18 JIMETA ST.",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "005",
      name: "KOFAR MOH'D GARBA/ BEHIND YELWA PRI. SCH.",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "006",
      name: "KOFAR MUAZU/ 30 JIMETA ST.",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "007",
      name: "YELWA PRI. SCH. I",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "008",
      name: "YELWA PRI. SCH. II",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "009",
      name: "YELWA PRI. SCH. III",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "010",
      name: "YELWA PRI. SCH IV",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "011",
      name: "YELWA PRI. SCH. V",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "012",
      name: "YELWA PRI. SCH. VI",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "013",
      name: "KOFAR M. ABUBAKAR JIMETA STREET II",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "014",
      name: "22, JIMETA STREET",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "015",
      name: "NO. 43 AJIYA STREET NEAR PUBLIC BORE HOLE",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "016",
      name: "TARABA RD JIMETA",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "017",
      name: "YOLA NORTH LOCAL GOVT SECRE.",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "018",
      name: "YELWA PRI. SCHOOL VII",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "019",
      name: "YELWA PRIMARY SCHOOL VIII",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "020",
      name: "YELWA PRIMARY SCHOOL IX",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "021",
      name: "YELWA PRIMARY SCH. X",
      wardCode: "YELWA-YOLN",
    },
    {
      code: "022",
      name: "YELWA PRIMARY SCHOOL XI",
      wardCode: "YELWA-YOLN",
    },
  ],

  // Bauchi LGA - Dandango/Yamrat Ward (Bauchi State)
  DANDANGO: [
    {
      code: "001",
      name: "Dandango Primary School",
      wardCode: "DANDANGO",
    },
    {
      code: "002",
      name: "Sabongari / Dandango",
      wardCode: "DANDANGO",
    },
    {
      code: "003",
      name: "Yamrat Primary School",
      wardCode: "DANDANGO",
    },
    {
      code: "004",
      name: "Yamrat Central Mosque",
      wardCode: "DANDANGO",
    },
  ],

  // Bauchi LGA - Yelwa Ward (Bauchi State)
  // Note: YELWA ward code is for Bauchi LGA, not Yola North
  YELWA: [
    {
      code: "001",
      name: "Yelwa Primary School I",
      wardCode: "YELWA",
    },
    {
      code: "002",
      name: "Yelwa Primary School II",
      wardCode: "YELWA",
    },
    {
      code: "003",
      name: "Yelwa Central Mosque",
      wardCode: "YELWA",
    },
    {
      code: "004",
      name: "Yelwa Market Square",
      wardCode: "YELWA",
    },
  ],
};

// Realistic Nigerian polling unit naming patterns
// Based on common INEC polling unit naming conventions
const pollingUnitNamePatterns = [
  // Kofar Jauro patterns
  (wardName: string, num: number) =>
    `Kofar Jauro ${wardName}${num > 1 ? ` ${num}` : ""}`,
  (wardName: string, num: number) =>
    `${wardName} / Kofar Jauro ${wardName}${num > 1 ? ` ${num}` : ""}`,

  // Primary School patterns
  (wardName: string, num: number) =>
    `${wardName} Primary School${num > 1 ? ` ${num}` : ""}`,
  (wardName: string, num: number) =>
    `${wardName} Pri. Sch.${num > 1 ? ` ${num}` : ""}`,
  (wardName: string, num: number) =>
    `${wardName} Central Primary School${num > 1 ? ` ${num}` : ""}`,

  // Market patterns
  (wardName: string) => `${wardName} Market Square`,
  (wardName: string) => `${wardName} Central Market`,
  (wardName: string) => `${wardName} Market`,

  // Health Centre patterns
  (wardName: string) => `${wardName} Health Centre`,
  (wardName: string) => `${wardName} Health Clinic`,
  (wardName: string) => `${wardName} Primary Health Centre`,
  (wardName: string) => `${wardName} Dispensary`,

  // Mosque patterns
  (wardName: string, num: number) =>
    `${wardName} Central Mosque${num > 1 ? ` ${num}` : ""}`,
  (wardName: string) => `${wardName} Jumu'at Mosque`,

  // Community Centre patterns
  (wardName: string) => `${wardName} Community Centre`,
  (wardName: string) => `${wardName} Town Hall`,
  (wardName: string) => `${wardName} Youth Centre`,
  (wardName: string) => `${wardName} Women Centre`,

  // Secondary School patterns
  (wardName: string, num: number) =>
    `${wardName} Secondary School${num > 1 ? ` ${num}` : ""}`,
  (wardName: string) => `${wardName} GDSS`,

  // Ward Office patterns
  (wardName: string) => `${wardName} Ward Office`,
  (wardName: string) => `${wardName} Local Govt. Office`,

  // Street/Area patterns
  (wardName: string, num: number) =>
    `Kofar ${wardName}${num > 1 ? ` ${num}` : ""}`,
  (wardName: string) => `${wardName} / Near ${wardName} Primary School`,
];

// Helper to get ward name from ward code
function getWardName(wardCode: string): string {
  const ward = getWardByCode(wardCode);
  return ward?.name || wardCode;
}

// Generate polling units for a ward - fallback for wards without real data
// Uses realistic Nigerian polling unit naming patterns
function generatePollingUnits(
  wardCode: string,
  count = 15,
): LocationPollingUnit[] {
  const wardName = getWardName(wardCode);

  return Array.from({ length: count }).map((_, i) => {
    const num = i + 1;
    const code = String(num).padStart(3, "0");

    // Select a pattern based on index, cycling through different types
    const patternIndex = i % pollingUnitNamePatterns.length;
    const pattern = pollingUnitNamePatterns[patternIndex];

    // Generate name using the pattern
    // Some patterns use the number parameter, others don't
    const name = pattern(wardName, num);

    return {
      code,
      name,
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
