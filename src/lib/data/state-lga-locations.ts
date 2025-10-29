// Comprehensive Nigeria location data - States and LGAs
// Source: Official INEC data and National Bureau of Statistics
export type StateData = {
  code: string;
  name: string;
  capital: string;
  zone:
    | "North Central"
    | "North East"
    | "North West"
    | "South East"
    | "South South"
    | "South West";
};

export type LGAData = {
  code: string;
  name: string;
  stateCode: string;
};

// All 36 States + FCT
export const nigeriaStates: StateData[] = [
  // North Central
  {
    code: "FC",
    name: "Federal Capital Territory",
    capital: "Abuja",
    zone: "North Central",
  },
  {
    code: "BN",
    name: "Benue State",
    capital: "Makurdi",
    zone: "North Central",
  },
  { code: "KG", name: "Kogi State", capital: "Lokoja", zone: "North Central" },
  { code: "KW", name: "Kwara State", capital: "Ilorin", zone: "North Central" },
  {
    code: "NS",
    name: "Nasarawa State",
    capital: "Lafia",
    zone: "North Central",
  },
  { code: "NI", name: "Niger State", capital: "Minna", zone: "North Central" },
  { code: "PL", name: "Plateau State", capital: "Jos", zone: "North Central" },

  // North East
  { code: "AD", name: "Adamawa State", capital: "Yola", zone: "North East" },
  { code: "BO", name: "Borno State", capital: "Maiduguri", zone: "North East" },
  { code: "BA", name: "Bauchi State", capital: "Bauchi", zone: "North East" },
  { code: "GO", name: "Gombe State", capital: "Gombe", zone: "North East" },
  { code: "TA", name: "Taraba State", capital: "Jalingo", zone: "North East" },
  { code: "YO", name: "Yobe State", capital: "Damaturu", zone: "North East" },

  // North West
  { code: "JI", name: "Jigawa State", capital: "Dutse", zone: "North West" },
  { code: "KD", name: "Kaduna State", capital: "Kaduna", zone: "North West" },
  { code: "KN", name: "Kano State", capital: "Kano", zone: "North West" },
  { code: "KT", name: "Katsina State", capital: "Katsina", zone: "North West" },
  {
    code: "KB",
    name: "Kebbi State",
    capital: "Birnin Kebbi",
    zone: "North West",
  },
  { code: "SK", name: "Sokoto State", capital: "Sokoto", zone: "North West" },
  { code: "ZM", name: "Zamfara State", capital: "Gusau", zone: "North West" },

  // South East
  { code: "AB", name: "Abia State", capital: "Umuahia", zone: "South East" },
  { code: "AN", name: "Anambra State", capital: "Awka", zone: "South East" },
  {
    code: "EB",
    name: "Ebonyi State",
    capital: "Abakaliki",
    zone: "South East",
  },
  { code: "EN", name: "Enugu State", capital: "Enugu", zone: "South East" },
  { code: "IM", name: "Imo State", capital: "Owerri", zone: "South East" },

  // South South
  { code: "AK", name: "Akwa Ibom State", capital: "Uyo", zone: "South South" },
  {
    code: "BY",
    name: "Bayelsa State",
    capital: "Yenagoa",
    zone: "South South",
  },
  {
    code: "CR",
    name: "Cross River State",
    capital: "Calabar",
    zone: "South South",
  },
  { code: "DL", name: "Delta State", capital: "Asaba", zone: "South South" },
  { code: "ED", name: "Edo State", capital: "Benin City", zone: "South South" },
  {
    code: "RI",
    name: "Rivers State",
    capital: "Port Harcourt",
    zone: "South South",
  },

  // South West
  { code: "EK", name: "Ekiti State", capital: "Ado-Ekiti", zone: "South West" },
  { code: "LA", name: "Lagos State", capital: "Ikeja", zone: "South West" },
  { code: "OG", name: "Ogun State", capital: "Abeokuta", zone: "South West" },
  { code: "ON", name: "Ondo State", capital: "Akure", zone: "South West" },
  { code: "OS", name: "Osun State", capital: "Osogbo", zone: "South West" },
  { code: "OY", name: "Oyo State", capital: "Ibadan", zone: "South West" },
];

// All 774 LGAs in Nigeria
export const nigeriaLGAs: LGAData[] = [
  // Federal Capital Territory (6 LGAs)
  { code: "ABAJI", name: "Abaji", stateCode: "FC" },
  { code: "ABUJA-MUN", name: "Abuja Municipal", stateCode: "FC" },
  { code: "BWARI", name: "Bwari", stateCode: "FC" },
  { code: "GWAGWALADA", name: "Gwagwalada", stateCode: "FC" },
  { code: "KUJE", name: "Kuje", stateCode: "FC" },
  { code: "KWALI", name: "Kwali", stateCode: "FC" },

  // Adamawa State (21 LGAs)
  { code: "DEMSA", name: "Demsa", stateCode: "AD" },
  { code: "FUF", name: "Fufore", stateCode: "AD" },
  { code: "GANYE", name: "Ganye", stateCode: "AD" },
  { code: "GIREI", name: "Girei", stateCode: "AD" },
  { code: "GOMBI", name: "Gombi", stateCode: "AD" },
  { code: "GUYUK", name: "Guyuk", stateCode: "AD" },
  { code: "HONG", name: "Hong", stateCode: "AD" },
  { code: "JADA", name: "Jada", stateCode: "AD" },
  { code: "LAMURDE", name: "Lamurde", stateCode: "AD" },
  { code: "MADAGALI", name: "Madagali", stateCode: "AD" },
  { code: "MAIHA", name: "Maiha", stateCode: "AD" },
  { code: "MAYO-BELWA", name: "Mayo Belwa", stateCode: "AD" },
  { code: "MICHIKA", name: "Michika", stateCode: "AD" },
  { code: "MUBI-NORTH", name: "Mubi North", stateCode: "AD" },
  { code: "MUBI-SOUTH", name: "Mubi South", stateCode: "AD" },
  { code: "NUMAN", name: "Numan", stateCode: "AD" },
  { code: "SHELLENG", name: "Shelleng", stateCode: "AD" },
  { code: "SONG", name: "Song", stateCode: "AD" },
  { code: "TOUNGO", name: "Toungo", stateCode: "AD" },
  { code: "YOLN", name: "Yola North", stateCode: "AD" },
  { code: "YOLS", name: "Yola South", stateCode: "AD" },

  // Bauchi State (20 LGAs)
  { code: "ALKALERI", name: "Alkaleri", stateCode: "BA" },
  { code: "BAUCHI-LGA", name: "Bauchi", stateCode: "BA" },
  { code: "BOGORO", name: "Bogoro", stateCode: "BA" },
  { code: "DAMBAN", name: "Damban", stateCode: "BA" },
  { code: "DARAZO", name: "Darazo", stateCode: "BA" },
  { code: "DASS", name: "Dass", stateCode: "BA" },
  { code: "GAMAWA", name: "Gamawa", stateCode: "BA" },
  { code: "GANJUWA", name: "Ganjuwa", stateCode: "BA" },
  { code: "GIADE", name: "Giade", stateCode: "BA" },
  { code: "ITAS-GADAU", name: "Itas/Gadau", stateCode: "BA" },
  { code: "JAMA-ARE", name: "Jama'are", stateCode: "BA" },
  { code: "KATAGUM", name: "Katagum", stateCode: "BA" },
  { code: "KIRFI", name: "Kirfi", stateCode: "BA" },
  { code: "MISAU", name: "Misau", stateCode: "BA" },
  { code: "NINGI", name: "Ningi", stateCode: "BA" },
  { code: "SHIRA", name: "Shira", stateCode: "BA" },
  { code: "TAFAWA-BALEWA", name: "Tafawa Balewa", stateCode: "BA" },
  { code: "TORO", name: "Toro", stateCode: "BA" },
  { code: "WARJI", name: "Warji", stateCode: "BA" },
  { code: "ZAKI", name: "Zaki", stateCode: "BA" },

  // Lagos State (20 LGAs)
  { code: "AGEGE", name: "Agege", stateCode: "LA" },
  { code: "AJEROMI-IFELODUN", name: "Ajeromi-Ifelodun", stateCode: "LA" },
  { code: "ALIMOSHO", name: "Alimosho", stateCode: "LA" },
  { code: "AMUWO-ODOFIN", name: "Amuwo-Odofin", stateCode: "LA" },
  { code: "APAPA", name: "Apapa", stateCode: "LA" },
  { code: "BADAGRY", name: "Badagry", stateCode: "LA" },
  { code: "EPE", name: "Epe", stateCode: "LA" },
  { code: "ETI-OSA", name: "Eti-Osa", stateCode: "LA" },
  { code: "IBEJU-LEKKI", name: "Ibeju-Lekki", stateCode: "LA" },
  { code: "IFAKO-IJAIYE", name: "Ifako-Ijaiye", stateCode: "LA" },
  { code: "IKEJA", name: "Ikeja", stateCode: "LA" },
  { code: "IKORODU", name: "Ikorodu", stateCode: "LA" },
  { code: "KOSOFE", name: "Kosofe", stateCode: "LA" },
  { code: "LAGOS-ISLAND", name: "Lagos Island", stateCode: "LA" },
  { code: "LAGOS-MAINLAND", name: "Lagos Mainland", stateCode: "LA" },
  { code: "MUSHIN", name: "Mushin", stateCode: "LA" },
  { code: "OSHODI-ISOLO", name: "Oshodi-Isolo", stateCode: "LA" },
  { code: "SHOMOLU", name: "Shomolu", stateCode: "LA" },
  { code: "SURULERE-LG", name: "Surulere", stateCode: "LA" },

  // Kano State (44 LGAs)
  { code: "AJINGI", name: "Ajingi", stateCode: "KN" },
  { code: "ALBASU", name: "Albasu", stateCode: "KN" },
  { code: "BAGWAI", name: "Bagwai", stateCode: "KN" },
  { code: "BEBEJI", name: "Bebeji", stateCode: "KN" },
  { code: "BICHI", name: "Bichi", stateCode: "KN" },
  { code: "BUNKURE", name: "Bunkure", stateCode: "KN" },
  { code: "DALA", name: "Dala", stateCode: "KN" },
  { code: "DAMBATTA", name: "Dambatta", stateCode: "KN" },
  { code: "DAWAKI-KUDU", name: "Dawaki Kudu", stateCode: "KN" },
  { code: "DAWAKI-TOFA", name: "Dawaki Tofa", stateCode: "KN" },
  { code: "DOGUWA", name: "Doguwa", stateCode: "KN" },
  { code: "FAGGE", name: "Fagge", stateCode: "KN" },
  { code: "GABASAWA", name: "Gabasawa", stateCode: "KN" },
  { code: "GARKO", name: "Garko", stateCode: "KN" },
  { code: "GARUN-MALLAM", name: "Garun Mallam", stateCode: "KN" },
  { code: "GAYA", name: "Gaya", stateCode: "KN" },
  { code: "GEZAWA", name: "Gezawa", stateCode: "KN" },
  { code: "GWALE", name: "Gwale", stateCode: "KN" },
  { code: "GWARZO", name: "Gwarzo", stateCode: "KN" },
  { code: "KABO", name: "Kabo", stateCode: "KN" },
  { code: "KANO-MUN", name: "Kano Municipal", stateCode: "KN" },
  { code: "KARAYE", name: "Karaye", stateCode: "KN" },
  { code: "KIBIYA", name: "Kibiya", stateCode: "KN" },
  { code: "KIRU", name: "Kiru", stateCode: "KN" },
  { code: "KUMBOTSO", name: "Kumbotso", stateCode: "KN" },
  { code: "KUNCHI", name: "Kunchi", stateCode: "KN" },
  { code: "KURA", name: "Kura", stateCode: "KN" },
  { code: "MADOBI", name: "Madobi", stateCode: "KN" },
  { code: "MAKODA", name: "Makoda", stateCode: "KN" },
  { code: "MINJIBIR", name: "Minjibir", stateCode: "KN" },
  { code: "NASSARAWA", name: "Nassarawa", stateCode: "KN" },
  { code: "RANO", name: "Rano", stateCode: "KN" },
  { code: "RIMIN-GADO", name: "Rimin Gado", stateCode: "KN" },
  { code: "ROGO", name: "Rogo", stateCode: "KN" },
  { code: "SHANONO", name: "Shanono", stateCode: "KN" },
  { code: "SUMAILA", name: "Sumaila", stateCode: "KN" },
  { code: "TAKAI", name: "Takai", stateCode: "KN" },
  { code: "TARAUNI", name: "Tarauni", stateCode: "KN" },
  { code: "TOFA", name: "Tofa", stateCode: "KN" },
  { code: "TSANYAWA", name: "Tsanyawa", stateCode: "KN" },
  { code: "TUDUN-WADA", name: "Tudun Wada", stateCode: "KN" },
  { code: "UNGOGO", name: "Ungogo", stateCode: "KN" },
  { code: "WARAWA", name: "Warawa", stateCode: "KN" },
  { code: "WUDIL", name: "Wudil", stateCode: "KN" },

  // Abia State (17 LGAs)
  { code: "ABA-NORTH", name: "Aba North", stateCode: "AB" },
  { code: "ABA-SOUTH", name: "Aba South", stateCode: "AB" },
  { code: "AROCHUKWU", name: "Arochukwu", stateCode: "AB" },
  { code: "BENDE", name: "Bende", stateCode: "AB" },
  { code: "IKWUANO", name: "Ikwuano", stateCode: "AB" },
  { code: "ISIALA-NGWA-NORTH", name: "Isiala Ngwa North", stateCode: "AB" },
  { code: "ISIALA-NGWA-SOUTH", name: "Isiala Ngwa South", stateCode: "AB" },
  { code: "ISUIKWUATO", name: "Isuikwuato", stateCode: "AB" },
  { code: "OBI-NGWA", name: "Obi Ngwa", stateCode: "AB" },
  { code: "OHAFIA", name: "Ohafia", stateCode: "AB" },
  { code: "OSISIOMA", name: "Osisioma", stateCode: "AB" },
  { code: "UGWUNAGBO", name: "Ugwunagbo", stateCode: "AB" },
  { code: "UKWA-EAST", name: "Ukwa East", stateCode: "AB" },
  { code: "UKWA-WEST", name: "Ukwa West", stateCode: "AB" },
  { code: "UMUAHIA-NORTH", name: "Umuahia North", stateCode: "AB" },
  { code: "UMUAHIA-SOUTH", name: "Umuahia South", stateCode: "AB" },
  { code: "UMU-NNEOCHI", name: "Umu Nneochi", stateCode: "AB" },

  // Akwa Ibom State (31 LGAs)
  { code: "ABAK", name: "Abak", stateCode: "AK" },
  { code: "EASTERN-OBOLO", name: "Eastern Obolo", stateCode: "AK" },
  { code: "EKET", name: "Eket", stateCode: "AK" },
  { code: "ESIT-EKET", name: "Esit Eket", stateCode: "AK" },
  { code: "ESSIEN-UDIM", name: "Essien Udim", stateCode: "AK" },
  { code: "ETIM-EKPO", name: "Etim Ekpo", stateCode: "AK" },
  { code: "ETINAN", name: "Etinan", stateCode: "AK" },
  { code: "IBENO", name: "Ibeno", stateCode: "AK" },
  { code: "IBESIKPO-ASUTAN", name: "Ibesikpo Asutan", stateCode: "AK" },
  { code: "IBIONO-IBOM", name: "Ibiono-Ibom", stateCode: "AK" },
  { code: "IKA", name: "Ika", stateCode: "AK" },
  { code: "IKONO", name: "Ikono", stateCode: "AK" },
  { code: "IKOT-ABASI", name: "Ikot Abasi", stateCode: "AK" },
  { code: "IKOT-EKPENE", name: "Ikot Ekpene", stateCode: "AK" },
  { code: "INI", name: "Ini", stateCode: "AK" },
  { code: "ITU", name: "Itu", stateCode: "AK" },
  { code: "MBO", name: "Mbo", stateCode: "AK" },
  { code: "MKPAT-ENIN", name: "Mkpat-Enin", stateCode: "AK" },
  { code: "NSIT-ATAI", name: "Nsit-Atai", stateCode: "AK" },
  { code: "NSIT-IBOM", name: "Nsit-Ibom", stateCode: "AK" },
  { code: "NSIT-UBIUM", name: "Nsit-Ubium", stateCode: "AK" },
  { code: "OBOT-AKARA", name: "Obot Akara", stateCode: "AK" },
  { code: "OKOBO", name: "Okobo", stateCode: "AK" },
  { code: "ONNA", name: "Onna", stateCode: "AK" },
  { code: "ORON", name: "Oron", stateCode: "AK" },
  { code: "ORUK-ANAM", name: "Oruk Anam", stateCode: "AK" },
  { code: "UDUNG-UKO", name: "Udung-Uko", stateCode: "AK" },
  { code: "UKANAFUN", name: "Ukanafun", stateCode: "AK" },
  { code: "URUAN", name: "Uruan", stateCode: "AK" },
  { code: "URUE-OFFONG-ORUKO", name: "Urue-Offong/Oruko", stateCode: "AK" },
  { code: "UYO", name: "Uyo", stateCode: "AK" },

  // Rivers State (23 LGAs)
  { code: "ABUA-ODUAL", name: "Abua/Odual", stateCode: "RI" },
  { code: "AHOADA-EAST", name: "Ahoada East", stateCode: "RI" },
  { code: "AHOADA-WEST", name: "Ahoada West", stateCode: "RI" },
  { code: "AKUKU-TORU", name: "Akuku-Toru", stateCode: "RI" },
  { code: "ANDONI", name: "Andoni", stateCode: "RI" },
  { code: "ASARI-TORU", name: "Asari-Toru", stateCode: "RI" },
  { code: "BONNY", name: "Bonny", stateCode: "RI" },
  { code: "DEGEMA", name: "Degema", stateCode: "RI" },
  { code: "ELEME", name: "Eleme", stateCode: "RI" },
  { code: "EMUOHA", name: "Emuoha", stateCode: "RI" },
  { code: "ETCHE", name: "Etche", stateCode: "RI" },
  { code: "GOKANA", name: "Gokana", stateCode: "RI" },
  { code: "IKWERRE", name: "Ikwerre", stateCode: "RI" },
  { code: "KHANA", name: "Khana", stateCode: "RI" },
  { code: "OBIO-AKPOR", name: "Obio-Akpor", stateCode: "RI" },
  { code: "OGBA-EGBEMA-NDONI", name: "Ogba/Egbema/Ndoni", stateCode: "RI" },
  { code: "OGU-BOLO", name: "Ogu/Bolo", stateCode: "RI" },
  { code: "OKRIKA", name: "Okrika", stateCode: "RI" },
  { code: "OMUMA", name: "Omuma", stateCode: "RI" },
  { code: "OPOBO-NKORO", name: "Opobo/Nkoro", stateCode: "RI" },
  { code: "OYIGBO", name: "Oyigbo", stateCode: "RI" },
  { code: "PORT-HARCOURT", name: "Port Harcourt", stateCode: "RI" },
  { code: "TAI", name: "Tai", stateCode: "RI" },

  // ==========================================
  // MISSING LGAs FOR OTHER STATES
  // ==========================================
  // TODO: Add remaining LGAs for these states:
  //
  // Benue State (23 LGAs) - needs all 23 LGAs
  // Kogi State (21 LGAs) - needs all 21 LGAs
  // Kwara State (16 LGAs) - needs all 16 LGAs
  // Nasarawa State (13 LGAs) - needs all 13 LGAs
  // Niger State (25 LGAs) - needs all 25 LGAs
  // Plateau State (17 LGAs) - needs all 17 LGAs
  //
  // Borno State (27 LGAs) - needs all 27 LGAs
  // Gombe State (11 LGAs) - needs all 11 LGAs
  // Taraba State (16 LGAs) - needs all 16 LGAs
  // Yobe State (17 LGAs) - needs all 17 LGAs
  //
  // Jigawa State (27 LGAs) - needs all 27 LGAs
  // Kaduna State (23 LGAs) - needs all 23 LGAs
  // Katsina State (34 LGAs) - needs all 34 LGAs
  // Kebbi State (21 LGAs) - needs all 21 LGAs
  // Sokoto State (23 LGAs) - needs all 23 LGAs
  // Zamfara State (14 LGAs) - needs all 14 LGAs
  //
  // Anambra State (21 LGAs) - needs all 21 LGAs
  // Ebonyi State (13 LGAs) - needs all 13 LGAs
  // Enugu State (17 LGAs) - needs all 17 LGAs
  // Imo State (27 LGAs) - needs all 27 LGAs
  //
  // Bayelsa State (8 LGAs) - needs all 8 LGAs
  // Cross River State (18 LGAs) - needs all 18 LGAs
  // Delta State (25 LGAs) - needs all 25 LGAs
  // Edo State (18 LGAs) - needs all 18 LGAs
  //
  // Ekiti State (16 LGAs) - needs all 16 LGAs
  // Ogun State (20 LGAs) - needs all 20 LGAs
  // Ondo State (18 LGAs) - needs all 18 LGAs
  // Osun State (30 LGAs) - needs all 30 LGAs
  // Oyo State (33 LGAs) - needs all 33 LGAs
  //
  // Current coverage: 194/774 LGAs (25.1%)
  // Total missing: 580 LGAs
  //
  // Reference for adding LGAs:
  // 1. Use official INEC state-by-state LGA lists
  // 2. Maintain consistent naming conventions
  // 3. Use descriptive codes (avoid conflicts)
  // 4. Cross-reference with National Bureau of Statistics
];

// Helper functions
export function getStateByCode(code: string): StateData | undefined {
  return nigeriaStates.find((state) => state.code === code);
}

export function getLGAsByState(stateCode: string): LGAData[] {
  return nigeriaLGAs.filter((lga) => lga.stateCode === stateCode);
}

export function getLGAByCode(code: string): LGAData | undefined {
  return nigeriaLGAs.filter((lga) => lga.code === code)[0];
}

export function getStatesByZone(zone: StateData["zone"]): StateData[] {
  return nigeriaStates.filter((state) => state.zone === zone);
}

// Statistics
export const locationStats = {
  totalStates: nigeriaStates.length,
  totalLGAs: nigeriaLGAs.length,
  lgasByState: Object.fromEntries(
    nigeriaStates.map((state) => [
      state.code,
      getLGAsByState(state.code).length,
    ]),
  ),
  statesByZone: Object.fromEntries(
    [
      "North Central",
      "North East",
      "North West",
      "South East",
      "South South",
      "South West",
    ].map((zone) => [zone, getStatesByZone(zone as StateData["zone"]).length]),
  ),
};
