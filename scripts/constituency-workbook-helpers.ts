import { nigeriaLGAs } from "../src/lib/data/state-lga-locations";

type AliasTarget = string | string[];

export const OFFICIAL_INEC_XLS_URL =
  "https://www.inecnigeria.org/wp-content/uploads/2019/02/Name-of-Senatorial-DistrictsFederal-and-State-Constituencies-Nationwide-1.xls";

const workbookCodeToStateCode: Record<string, string> = {
  AB: "AB",
  AD: "AD",
  AK: "AK",
  AN: "AN",
  BA: "BA",
  BY: "BY",
  BN: "BN",
  BO: "BO",
  CR: "CR",
  DT: "DL",
  EB: "EB",
  ED: "ED",
  EK: "EK",
  EN: "EN",
  FCT: "FC",
  GM: "GO",
  IM: "IM",
  JG: "JI",
  KD: "KD",
  KN: "KN",
  KT: "KT",
  KB: "KB",
  KG: "KG",
  KW: "KW",
  LA: "LA",
  NW: "NS",
  NG: "NI",
  OG: "OG",
  OD: "ON",
  OS: "OS",
  OY: "OY",
  PL: "PL",
  RV: "RI",
  SO: "SK",
  TR: "TA",
  YB: "YO",
  ZF: "ZM",
};

const rawGlobalTokenAliases = {
  OBINGWA: "Obi Ngwa",
  "ITAS-GADAU": "Itas/Gadau",
  "ITAS-GIDAU": "Itas/Gadau",
  NGANZA: "Nganzai",
  MOGUNO: "Monguno",
  "KALA BALGE": "Kala/Balge",
  METROPOLITAN: "Maiduguri",
  DAMABOA: "Damboa",
  KAIMA: "Kaiama",
  ALABASU: "Albasu",
  KWAYA: "Kwaya Kusar",
  OLAMABARO: "Olamaboro",
  BEKWARRA: "Bekwarra",
  "UGHELI SOUTH": "Ughelli South",
  "OSHIMILI NORTH AND SOUTH": ["Oshimili North", "Oshimili South"],
  OBADIGBO: "Ogbadibo",
  "AFIKPO NORTH": "Afikpo",
  "AFIKPO SOUTH": "Edda",
  UHUNMWODE: "Uhunmwonde",
  BOOSO: "Bosso",
  ANINIRI: "Aninri",
  SHONGOM: "Shongom",
  SHAMI: "Shani",
  SHEDAM: "Shendam",
  GBOYIN: "Gbonyin",
  "NKOKWA EAST": "Ndokwa East",
  NAFADA: "Nafada/Bajoga",
  EZINIHITTE: "Ezinihitte Mbaise",
  ESEODO: "Ese Odo",
  JAUN: "Jahun",
  BIRNIWA: "Biriniwa",
  BUSARI: "Bursari",
  DAMATTA: "Dambatta",
  "DAWAKIN KUDU": "Dawaki Kudu",
  "DAWAKIN TOFA": "Dawaki Tofa",
  GAGARA: "Gagarawa",
  MAIGATAR: "Maigatari",
  RINGIN: "Ringim",
  DANBATTA: "Dambatta",
  IKABO: "Kabo",
  TAPA: "Tafa",
  GUZAMALI: "Guzamala",
  MOPAMURO: "Mopa-Muro",
  MAIADUA: "Mai'Adua",
  MALUMEFASHI: "Malumfashi",
  DANMUSA: "Dan Musa",
  AREWA: "Arewa Dandi",
  "AREWA DANDI": ["Arewa Dandi", "Dandi"],
  BATAGI: "Gbako",
  "EDATI-IDATI": "Edati",
  SAGAMU: "Shagamu",
  AYADAADE: "Aiyedade",
  AYEDAADE: "Aiyedade",
  AYEDIRE: "Aiyedire",
  "ILESHA EAST": "Ilesa East",
  "ILESHA WEST": "Ilesa West",
  OKIRIKA: "Okrika",
  EMOHUA: "Emuoha",
  UMOHUA: "Emuoha",
  ETVHE: "Etche",
  WAMAKKO: "Wamako",
  AMBUWAL: "Tambuwal",
  TAMBUWA: "Tambuwal",
  "BIRNIN MAGAJI": "Birnin Magaji/Kiyaw",
  "ABAJI AREA COUNCIL": "Abaji",
  "KUJE AREA COUNCIL": "Kuje",
  "KWALI AREA COUNCIL": "Kwali",
  "BWARI AREA COUNCIL": "Bwari",
  "GWAGWA AREA COUNCIL": "Gwagwalada",
  "MUNICIPAL AREA COUNCIL": "Abuja Municipal",
  MUNICIPAL: "Abuja Municipal",
  AKO: "Akko",
  "YAMALTU DELBA": "Yamaltu/Deba",
  "IFAKO IJAYE": "Ifako-Ijaiye",
  "AHAODA EAST": "Ahoada East",
  "OGBA EGBEMA": "Ogba/Egbema/Ndoni",
  "ORUN ISE": "Ise/Orun",
  "WARRI SOUTH WEST": "Warri Central",
  INGWA: "Ingawa",
  AITA: "Kaita",
  "ZANGON KATAF": "Zango Kataf",
  EGBADO: "Egbeda",
  "OGBOMOSO NORTH": "Ogbomosho North",
  "OGBOMOSO SOUTH": "Ogbomosho South",
  AKAWANGA: "Akwanga",
  "NASARAWA EGGON": "Nasarawa Eggon",
  "ANAMBRA EAST AND WEST": ["Anambra East", "Anambra West"],
  "AWKA NORTH AND SOUTH": ["Awka North", "Awka South"],
  "ONITSHA NORTH AND SOUTH": ["Onitsha North", "Onitsha South"],
  "IDEMILI NORTH AND SOUTH": ["Idemili North", "Idemili South"],
  "ISIALA NGWA NORTH AND SOUTH": ["Isiala Ngwa North", "Isiala Ngwa South"],
  "IHITE UBOMA": "Ihitte/Uboma",
  "KOLOKUMA AND OPOKUMA": "Kolokuma/Opokuma",
  "URUE OFFONG AND ORUKO": "Urue-Offong/Oruko",
  "UKWA EAST AND EAST": ["Ukwa East", "Ukwa West"],
  KIRIKASAMMA: "Kiri Kasamma",
  "MALLAM MADORI": "Malam Madori",
  "TALATA MARAFA": "Talata Mafara",
  NWAGELE: "Nwangele",
  "OHAJJI EGBEMA": "Ohaji/Egbema",
} satisfies Record<string, AliasTarget>;

const rawCodeSpecificTokenAliases = {
  "SD/050/JG": {
    "K/HAUSA": "Kafin Hausa",
    "K/KASAMMA": "Kiri Kasamma",
    "M/MADORI": "Malam Madori",
  },
  "SD/051/JG": {
    "S/TANKAR": "Sule Tankarkar",
    GUME: "Gumel",
  },
  "SD/055/KN": {
    DAWAKIN: "Dawaki Kudu",
    "GARUM MALLAM": "Garun Mallam",
  },
  "SD/056/KN": {
    DAWAKIN: "Dawaki Tofa",
    "RIMI GADO": "Rimin Gado",
  },
  "SD/066/KG": {
    KABBA: "Kabba/Bunu",
    MOPAMURO: "Mopa-Muro",
  },
  "SD/067/KW": {
    PATIGI: "Pategi",
  },
  "SD/072/LA": {
    "IFAKO-IJAYE": "Ifako-Ijaiye",
  },
  "FC/179/KN": {
    MUNICIPAL: "Kano Municipal",
  },
  "FC/087/DT": {
    "IKA NORTH": "Ika North East",
  },
  "SD/076/NG": {
    CHACHANGA: "Chanchaga",
    MUYA: "Munya",
  },
  "SD/084/OD": {
    "ILEOLUJI/OKEIGBO": "Ile Oluji/Okeigbo",
  },
  "SD/085/OS": {
    BOLOWADURO: "Boluwaduro",
  },
  "SD/086/OS": {
    "ATAKUNMOSA EAST": "Atakumosa East",
    "ATAKUNMOSA WEST": "Atakumosa West",
  },
  "SD/089/OY": {
    ORIRE: "Oriire",
  },
  "SD/030/DT": {
    "WARRI SOUTH WEST": "Warri Central",
  },
  "SD/042/EN": {
    "IGBO-ETITI": "Igbo-Etiti",
    "IGO-EZE SOUTH": "Igbo-Eze South",
  },
  "SD/047/IM": {
    NKWERE: "Nkwerre",
  },
  "SD/048/IM": {
    "IHITE/UBOMA": "Ihitte/Uboma",
  },
  "SD/079/OG": {
    "OBAFEMI/OWODE": "Obafemi Owode",
  },
  "SD/094/RV": {
    "OGU BOLO": "Ogu/Bolo",
  },
  "SD/096/RV": {
    "ABUA-ODUAL": "Abua/Odual",
  },
  "SD/106/ZF": {
    "K/NAMODA": "Kaura Namoda",
    "T/MAFARA": "Talata Mafara",
  },
} satisfies Record<string, Record<string, AliasTarget>>;

export function normalizeToken(value: string): string {
  return value
    .replace(/\bof(?=[A-Z])/g, "of ")
    .replace(/\bpresent(?=[A-Z])/gi, "present ")
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/&/g, " and ")
    .replace(/['".,;:%#()]/g, " ")
    .replace(/[-/]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\bnassarawa\b/g, "nasarawa")
    .replace(/\begon\b/g, "eggon")
    .replace(/\beggon\b/g, "eggon")
    .replace(/\bfurore\b/g, "fufore")
    .replace(/\bgerfi\b/g, "girei")
    .replace(/\bakawanga\b/g, "akwanga")
    .replace(/\bgunjuwa\b/g, "ganjuwa")
    .replace(/\bdambam\b/g, "damban")
    .replace(/\bmarkurdi\b/g, "makurdi")
    .replace(/\bkolokuna\b/g, "kolokuma")
    .replace(/\banyamelum\b/g, "ayamelum")
    .replace(/\bdunkofia\b/g, "dunukofia")
    .replace(/\bekusigo\b/g, "ekwusigo")
    .replace(/\bnember\b/g, "nembe")
    .replace(/\bisiukwuato\b/g, "isuikwuato")
    .replace(/\bisukwuato\b/g, "isuikwuato")
    .replace(/\bumunneochi\b/g, "umu nneochi")
    .replace(/\bnsiti\b/g, "nsit")
    .replace(/\boruko anam\b/g, "oruk anam")
    .replace(/\burue offong oruko\b/g, "urue offong oruko")
    .replace(/\batigbo\b/g, "atisbo")
    .replace(/\boorelope\b/g, "orelope")
    .replace(/\begbado north\b/g, "yewa north")
    .replace(/\begbado south\b/g, "yewa south")
    .replace(/\blantang\b/g, "langtang")
    .replace(/\bqua an pan\b/g, "qua'an pan")
    .replace(/\bjema a\b/g, "jema'a")
    .replace(/\s+/g, " ")
    .trim();
}

function aliasToArray(value: AliasTarget): string[] {
  return Array.isArray(value) ? value : [value];
}

const globalTokenAliases = new Map(
  Object.entries(rawGlobalTokenAliases).map(([raw, canonical]) => [
    normalizeToken(raw),
    aliasToArray(canonical),
  ]),
);

const codeSpecificTokenAliases = new Map(
  Object.entries(rawCodeSpecificTokenAliases).map(([code, aliases]) => [
    code,
    new Map(
      Object.entries(aliases).map(([raw, canonical]) => [
        normalizeToken(raw),
        aliasToArray(canonical),
      ]),
    ),
  ]),
);

export function resolveWorkbookStateCode(officialStateCode: string): string {
  const stateCode = workbookCodeToStateCode[officialStateCode];
  if (!stateCode) {
    throw new Error(`Unknown workbook state code "${officialStateCode}"`);
  }
  return stateCode;
}

export function buildStateLgaLookup(stateCode: string): Map<string, string> {
  return new Map(
    nigeriaLGAs
      .filter((lga) => lga.stateCode === stateCode)
      .map((lga) => [normalizeToken(lga.name), lga.name]),
  );
}

export function getStateLgaNames(stateCode: string): string[] {
  return nigeriaLGAs
    .filter((lga) => lga.stateCode === stateCode)
    .map((lga) => lga.name);
}

export function resolveWorkbookToken(
  rawToken: string,
  workbookCode: string,
  stateLgaLookup: Map<string, string>,
): string[] | null {
  const normalizedToken = normalizeToken(rawToken);
  const codeSpecificAliases = codeSpecificTokenAliases.get(workbookCode);

  const alias =
    codeSpecificAliases?.get(normalizedToken) ??
    globalTokenAliases.get(normalizedToken);

  if (alias) {
    return alias;
  }

  const canonicalName = stateLgaLookup.get(normalizedToken);
  if (canonicalName) {
    return [canonicalName];
  }

  return null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function findCanonicalLgasInComposition(
  composition: string,
  stateCode: string,
  workbookCode: string,
): string[] {
  let remainingComposition = ` ${normalizeToken(composition)} `;
  const stateLgaLookup = buildStateLgaLookup(stateCode);
  const stateLgaNames = new Set(stateLgaLookup.values());
  const codeSpecificAliases = codeSpecificTokenAliases.get(workbookCode);
  const matchers = new Map<string, string[]>();

  for (const [normalizedToken, canonicalName] of stateLgaLookup.entries()) {
    matchers.set(normalizedToken, [canonicalName]);
  }

  for (const [
    normalizedToken,
    canonicalNames,
  ] of globalTokenAliases.entries()) {
    const filtered = canonicalNames.filter((name) => stateLgaNames.has(name));
    if (filtered.length > 0) {
      matchers.set(normalizedToken, filtered);
    }
  }

  for (const [normalizedToken, canonicalNames] of codeSpecificAliases ?? []) {
    const filtered = canonicalNames.filter((name) => stateLgaNames.has(name));
    if (filtered.length > 0) {
      matchers.set(normalizedToken, filtered);
    }
  }

  const found = new Set<string>();
  const sortedMatchers = [...matchers.entries()].sort(
    (a, b) => b[0].length - a[0].length,
  );

  for (const [normalizedToken, canonicalNames] of sortedMatchers) {
    const pattern = new RegExp(`(^| )${escapeRegExp(normalizedToken)}($| )`);
    if (!pattern.test(remainingComposition)) continue;
    for (const canonicalName of canonicalNames) {
      found.add(canonicalName);
    }
    remainingComposition = remainingComposition.replace(pattern, " ");
  }

  return [...found];
}
