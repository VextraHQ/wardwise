// Transitional static ward seed source.
// Still used by partial geo seeding and the legacy /api/register/locations path.
// Do not treat this file as the long-term canonical runtime geo source.
import type { LocationWard } from "@/types/location";

export const wards: LocationWard[] = [
  // Adamawa State (AD)
  // Yola North LGA (YOLN) - AdamawaWards
  // Part of Yola North/Yola South/Girei Federal Constituency
  { code: "GWADABAWA", name: "Gwadabawa", lgaCode: "YOLN", stateCode: "AD" },
  { code: "JAMBUTU", name: "Jambutu", lgaCode: "YOLN", stateCode: "AD" },
  { code: "AJIYA", name: "Ajiya", lgaCode: "YOLN", stateCode: "AD" },
  { code: "KAREWA", name: "Karewa", lgaCode: "YOLN", stateCode: "AD" },
  { code: "ALKALAWA", name: "Alkalawa", lgaCode: "YOLN", stateCode: "AD" },
  { code: "DOUBELI", name: "Doubeli", lgaCode: "YOLN", stateCode: "AD" },
  { code: "DAMILU", name: "Damilu", lgaCode: "YOLN", stateCode: "AD" },
  { code: "LAMIDO", name: "Lamido", lgaCode: "YOLN", stateCode: "AD" },
  { code: "MAIBORI", name: "Maibori", lgaCode: "YOLN", stateCode: "AD" },
  {
    code: "WURO-CHEKKE",
    name: "Wuro Chekke",
    lgaCode: "YOLN",
    stateCode: "AD",
  },
  { code: "YELWA-YOLN", name: "Yelwa", lgaCode: "YOLN", stateCode: "AD" },

  // Yola South LGA (YOLS) - AdamawaWards
  // Part of Yola North/Yola South/Girei Federal Constituency
  { code: "BAMOI", name: "Bamoi", lgaCode: "YOLS", stateCode: "AD" },
  { code: "NGURORE", name: "Ngurore", lgaCode: "YOLS", stateCode: "AD" },
  { code: "ADARAWO", name: "Adarawo", lgaCode: "YOLS", stateCode: "AD" },
  { code: "BAMBAM", name: "Bambam", lgaCode: "YOLS", stateCode: "AD" },
  { code: "CHIROMI", name: "Chiromi", lgaCode: "YOLS", stateCode: "AD" },
  { code: "DANSULA", name: "Dansula", lgaCode: "YOLS", stateCode: "AD" },
  { code: "GARIKI", name: "Gariki", lgaCode: "YOLS", stateCode: "AD" },
  { code: "GIMBA", name: "Gimba", lgaCode: "YOLS", stateCode: "AD" },
  { code: "KARE", name: "Kare", lgaCode: "YOLS", stateCode: "AD" },
  {
    code: "MAYO-LAMURDE",
    name: "Mayo Lamurde",
    lgaCode: "YOLS",
    stateCode: "AD",
  },
  { code: "WURO-DOLE", name: "Wuro Dole", lgaCode: "YOLS", stateCode: "AD" },

  // Song LGA (SONG) - AdamawaWards
  // Part of Fufore/Song Federal Constituency
  { code: "SONG", name: "Song", lgaCode: "SONG", stateCode: "AD" },
  { code: "BARE", name: "Bare", lgaCode: "SONG", stateCode: "AD" },
  { code: "BINDI", name: "Bindi", lgaCode: "SONG", stateCode: "AD" },
  { code: "DUMNE-SONG", name: "Dumne", lgaCode: "SONG", stateCode: "AD" },
  { code: "FARU", name: "Faru", lgaCode: "SONG", stateCode: "AD" },
  { code: "GELENGI", name: "Gelengi", lgaCode: "SONG", stateCode: "AD" },
  { code: "KUBI", name: "Kubi", lgaCode: "SONG", stateCode: "AD" },
  { code: "MUBI-SONG", name: "Mubi", lgaCode: "SONG", stateCode: "AD" },
  { code: "PULAKU", name: "Pulaku", lgaCode: "SONG", stateCode: "AD" },
  { code: "WURO-GAIDE", name: "Wuro Gaide", lgaCode: "SONG", stateCode: "AD" },

  // Fufore LGA (FUF) - AdamawaWards
  // Part of Fufore/Song Federal Constituency
  { code: "FUFORE", name: "Fufore", lgaCode: "FUF", stateCode: "AD" },
  { code: "MALABU", name: "Malabu", lgaCode: "FUF", stateCode: "AD" },
  { code: "RIBADU", name: "Ribadu", lgaCode: "FUF", stateCode: "AD" },
  { code: "GURIN", name: "Gurin", lgaCode: "FUF", stateCode: "AD" },
  { code: "BETTEN", name: "Betten", lgaCode: "FUF", stateCode: "AD" },
  { code: "BANGO-FUF", name: "Bango", lgaCode: "FUF", stateCode: "AD" },
  { code: "BINDI-FUF", name: "Bindi", lgaCode: "FUF", stateCode: "AD" },
  { code: "DUMNE-FUF", name: "Dumne", lgaCode: "FUF", stateCode: "AD" },
  { code: "MAYO-INNE", name: "Mayo Inne", lgaCode: "FUF", stateCode: "AD" },
  { code: "WURO-BOKKI", name: "Wuro Bokki", lgaCode: "FUF", stateCode: "AD" },

  // Ganye LGA (GANYE) - AdamawaWards
  // Part of Jada/Ganye/Mayo-Belwa/Toungo Federal Constituency
  {
    code: "BAKARI-GUSO",
    name: "Bakari Guso",
    lgaCode: "GANYE",
    stateCode: "AD",
  },
  { code: "GAMU", name: "Gamu", lgaCode: "GANYE", stateCode: "AD" },
  { code: "GANYE-I", name: "Ganye I", lgaCode: "GANYE", stateCode: "AD" },
  { code: "GANYE-II", name: "Ganye II", lgaCode: "GANYE", stateCode: "AD" },
  { code: "GURUM", name: "Gurum", lgaCode: "GANYE", stateCode: "AD" },
  { code: "JAGGU", name: "Jaggu", lgaCode: "GANYE", stateCode: "AD" },
  { code: "SANGASUMI", name: "Sangasumi", lgaCode: "GANYE", stateCode: "AD" },
  { code: "SUGU", name: "Sugu", lgaCode: "GANYE", stateCode: "AD" },
  { code: "TIMDORE", name: "Timdore", lgaCode: "GANYE", stateCode: "AD" },
  { code: "YEBBI", name: "Yebbi", lgaCode: "GANYE", stateCode: "AD" },

  // Toungo LGA (TOUNGO) - AdamawaWards
  // Part of Jada/Ganye/Mayo-Belwa/Toungo Federal Constituency
  { code: "TOUNGO", name: "Toungo", lgaCode: "TOUNGO", stateCode: "AD" },
  { code: "BANGA", name: "Banga", lgaCode: "TOUNGO", stateCode: "AD" },
  { code: "DUMNE-TOUNGO", name: "Dumne", lgaCode: "TOUNGO", stateCode: "AD" },
  { code: "GURUM-TOUNGO", name: "Gurum", lgaCode: "TOUNGO", stateCode: "AD" },
  { code: "KONA", name: "Kona", lgaCode: "TOUNGO", stateCode: "AD" },
  {
    code: "MAYO-INNE-TOUNGO",
    name: "Mayo Inne",
    lgaCode: "TOUNGO",
    stateCode: "AD",
  },
  {
    code: "SABON-LEAKE",
    name: "Sabon Leake",
    lgaCode: "TOUNGO",
    stateCode: "AD",
  },
  { code: "TAMBUWA", name: "Tambuwa", lgaCode: "TOUNGO", stateCode: "AD" },
  {
    code: "WURO-JABBE",
    name: "Wuro Jabbe",
    lgaCode: "TOUNGO",
    stateCode: "AD",
  },
  { code: "YADIM", name: "Yadim", lgaCode: "TOUNGO", stateCode: "AD" },

  // Mayo Belwa LGA (MAYO-BELWA) - AdamawaWards
  // Part of Jada/Ganye/Mayo-Belwa/Toungo Federal Constituency
  {
    code: "MAYO-BELWA",
    name: "Mayo Belwa",
    lgaCode: "MAYO-BELWA",
    stateCode: "AD",
  },
  { code: "BANGO-MAYO", name: "Bango", lgaCode: "MAYO-BELWA", stateCode: "AD" },
  { code: "BARENG", name: "Bareng", lgaCode: "MAYO-BELWA", stateCode: "AD" },
  { code: "DUMNE-MAYO", name: "Dumne", lgaCode: "MAYO-BELWA", stateCode: "AD" },
  { code: "GURUM-MAYO", name: "Gurum", lgaCode: "MAYO-BELWA", stateCode: "AD" },
  { code: "JADA-MAYO", name: "Jada", lgaCode: "MAYO-BELWA", stateCode: "AD" },
  { code: "KONA-MAYO", name: "Kona", lgaCode: "MAYO-BELWA", stateCode: "AD" },
  {
    code: "MAYO-FARANG",
    name: "Mayo Farang",
    lgaCode: "MAYO-BELWA",
    stateCode: "AD",
  },
  {
    code: "SABON-LEAKE-MAYO",
    name: "Sabon Leake",
    lgaCode: "MAYO-BELWA",
    stateCode: "AD",
  },
  {
    code: "WURO-YOLDE",
    name: "Wuro Yolde",
    lgaCode: "MAYO-BELWA",
    stateCode: "AD",
  },

  // Jada LGA (JADA) - AdamawaWards
  // Part of Jada/Ganye/Mayo-Belwa/Toungo Federal Constituency
  { code: "JADA", name: "Jada", lgaCode: "JADA", stateCode: "AD" },
  { code: "BANGO-JADA", name: "Bango", lgaCode: "JADA", stateCode: "AD" },
  { code: "DUMNE-JADA", name: "Dumne", lgaCode: "JADA", stateCode: "AD" },
  { code: "GURUM-JADA", name: "Gurum", lgaCode: "JADA", stateCode: "AD" },
  { code: "KONA-JADA", name: "Kona", lgaCode: "JADA", stateCode: "AD" },
  {
    code: "MAYO-INNE-JADA",
    name: "Mayo Inne",
    lgaCode: "JADA",
    stateCode: "AD",
  },
  { code: "MUBI-JADA", name: "Mubi", lgaCode: "JADA", stateCode: "AD" },
  {
    code: "SABON-LEAKE-JADA",
    name: "Sabon Leake",
    lgaCode: "JADA",
    stateCode: "AD",
  },
  { code: "TAMBUWA-JADA", name: "Tambuwa", lgaCode: "JADA", stateCode: "AD" },
  { code: "WURO-HAMMA", name: "Wuro Hamma", lgaCode: "JADA", stateCode: "AD" },

  // Bauchi State (BA)
  // Jama'are LGA (JAMA-ARE) - BauchiWards
  // Part of Jama'are/Itas-Gadau Federal Constituency
  {
    code: "DOGON-JEJI-A",
    name: "Dogon Jeji 'A'",
    lgaCode: "JAMA-ARE",
    stateCode: "BA",
  },
  {
    code: "DOGON-JEJI-B",
    name: "Dogon Jeji 'B'",
    lgaCode: "JAMA-ARE",
    stateCode: "BA",
  },
  {
    code: "DOGON-JEJI-C",
    name: "Dogon Jeji 'C'",
    lgaCode: "JAMA-ARE",
    stateCode: "BA",
  },
  {
    code: "GALDIMARI",
    name: "Galdimari",
    lgaCode: "JAMA-ARE",
    stateCode: "BA",
  },
  { code: "HANAFARI", name: "Hanafari", lgaCode: "JAMA-ARE", stateCode: "BA" },
  {
    code: "JAMA-ARE-A",
    name: "Jama'are 'A'",
    lgaCode: "JAMA-ARE",
    stateCode: "BA",
  },
  {
    code: "JAMA-ARE-B",
    name: "Jama'are 'B'",
    lgaCode: "JAMA-ARE",
    stateCode: "BA",
  },
  {
    code: "JAMA-ARE-C",
    name: "Jama'are 'C'",
    lgaCode: "JAMA-ARE",
    stateCode: "BA",
  },
  {
    code: "JAMA-ARE-D",
    name: "Jama'are 'D'",
    lgaCode: "JAMA-ARE",
    stateCode: "BA",
  },
  { code: "JURARA", name: "Jurara", lgaCode: "JAMA-ARE", stateCode: "BA" },

  // Itas/Gadau LGA (ITAS-GADAU) - BauchiWards
  // Part of Jama'are/Itas-Gadau Federal Constituency
  { code: "ITAS", name: "Itas", lgaCode: "ITAS-GADAU", stateCode: "BA" },
  { code: "GADAU", name: "Gadau", lgaCode: "ITAS-GADAU", stateCode: "BA" },
  { code: "BALI-ITAS", name: "Bali", lgaCode: "ITAS-GADAU", stateCode: "BA" },
  { code: "BANGO-ITAS", name: "Bango", lgaCode: "ITAS-GADAU", stateCode: "BA" },
  { code: "DUMNE-ITAS", name: "Dumne", lgaCode: "ITAS-GADAU", stateCode: "BA" },
  { code: "GURUM-ITAS", name: "Gurum", lgaCode: "ITAS-GADAU", stateCode: "BA" },
  {
    code: "KARAYE-ITAS",
    name: "Karaye",
    lgaCode: "ITAS-GADAU",
    stateCode: "BA",
  },
  { code: "KONA-ITAS", name: "Kona", lgaCode: "ITAS-GADAU", stateCode: "BA" },
  {
    code: "MAYO-INNE-ITAS",
    name: "Mayo Inne",
    lgaCode: "ITAS-GADAU",
    stateCode: "BA",
  },
  {
    code: "SABON-GARI-ITAS",
    name: "Sabon Gari",
    lgaCode: "ITAS-GADAU",
    stateCode: "BA",
  },

  // Bauchi LGA (BAUCHI-LGA) - BauchiWards
  // Part of Bauchi Federal Constituency
  {
    code: "BAUCHI-CENTRAL",
    name: "Bauchi Central",
    lgaCode: "BAUCHI-LGA",
    stateCode: "BA",
  },
  {
    code: "BAUCHI-NORTH",
    name: "Bauchi North",
    lgaCode: "BAUCHI-LGA",
    stateCode: "BA",
  },
  {
    code: "BAUCHI-SOUTH",
    name: "Bauchi South",
    lgaCode: "BAUCHI-LGA",
    stateCode: "BA",
  },
  {
    code: "BAUCHI-EAST",
    name: "Bauchi East",
    lgaCode: "BAUCHI-LGA",
    stateCode: "BA",
  },
  {
    code: "BAUCHI-WEST",
    name: "Bauchi West",
    lgaCode: "BAUCHI-LGA",
    stateCode: "BA",
  },
  {
    code: "DANDANGO",
    name: "Dandango/Yamrat",
    lgaCode: "BAUCHI-LGA",
    stateCode: "BA",
  },
  { code: "DURUM", name: "Durum", lgaCode: "BAUCHI-LGA", stateCode: "BA" },
  { code: "FADAMA", name: "Fadama", lgaCode: "BAUCHI-LGA", stateCode: "BA" },
  { code: "GANDA", name: "Ganda", lgaCode: "BAUCHI-LGA", stateCode: "BA" },
  { code: "KUNDA", name: "Kunda", lgaCode: "BAUCHI-LGA", stateCode: "BA" },
  {
    code: "MAI-ADUWA",
    name: "Mai Aduwa",
    lgaCode: "BAUCHI-LGA",
    stateCode: "BA",
  },
  {
    code: "MALARABA",
    name: "Malaraba",
    lgaCode: "BAUCHI-LGA",
    stateCode: "BA",
  },
  { code: "MUDI", name: "Mudi", lgaCode: "BAUCHI-LGA", stateCode: "BA" },
  { code: "NATSIRI", name: "Natsiri", lgaCode: "BAUCHI-LGA", stateCode: "BA" },
  {
    code: "YALWAN-DANFULANI",
    name: "Yalwan Danfulani",
    lgaCode: "BAUCHI-LGA",
    stateCode: "BA",
  },
  { code: "YELWA", name: "Yelwa", lgaCode: "BAUCHI-LGA", stateCode: "BA" },

  // Ningi LGA (NINGI) - BauchiWards
  // Part of Ningi/Warji Federal Constituency
  {
    code: "NINGI-CENTRAL",
    name: "Ningi Central",
    lgaCode: "NINGI",
    stateCode: "BA",
  },
  {
    code: "NINGI-NORTH",
    name: "Ningi North",
    lgaCode: "NINGI",
    stateCode: "BA",
  },
  {
    code: "NINGI-SOUTH",
    name: "Ningi South",
    lgaCode: "NINGI",
    stateCode: "BA",
  },
  { code: "NINGI-EAST", name: "Ningi East", lgaCode: "NINGI", stateCode: "BA" },
  { code: "NINGI-WEST", name: "Ningi West", lgaCode: "NINGI", stateCode: "BA" },
  { code: "BAKARI", name: "Bakari", lgaCode: "NINGI", stateCode: "BA" },
  { code: "BURRA", name: "Burra", lgaCode: "NINGI", stateCode: "BA" },
  { code: "DANGUNA", name: "Danguna", lgaCode: "NINGI", stateCode: "BA" },
  { code: "GADAM", name: "Gadam", lgaCode: "NINGI", stateCode: "BA" },
  { code: "KARAYE", name: "Karaye", lgaCode: "NINGI", stateCode: "BA" },
  { code: "KUDU", name: "Kudu", lgaCode: "NINGI", stateCode: "BA" },
  { code: "PAWA", name: "Pawa", lgaCode: "NINGI", stateCode: "BA" },
  { code: "SABON-GARI", name: "Sabon Gari", lgaCode: "NINGI", stateCode: "BA" },
  { code: "TURAMU", name: "Turamu", lgaCode: "NINGI", stateCode: "BA" },
  { code: "YALO", name: "Yalo", lgaCode: "NINGI", stateCode: "BA" },

  // Warji LGA (WARJI) - BauchiWards
  // Part of Ningi/Warji Federal Constituency
  {
    code: "WARJI-CENTRAL",
    name: "Warji Central",
    lgaCode: "WARJI",
    stateCode: "BA",
  },
  {
    code: "WARJI-NORTH",
    name: "Warji North",
    lgaCode: "WARJI",
    stateCode: "BA",
  },
  {
    code: "WARJI-SOUTH",
    name: "Warji South",
    lgaCode: "WARJI",
    stateCode: "BA",
  },
  { code: "WARJI-EAST", name: "Warji East", lgaCode: "WARJI", stateCode: "BA" },
  { code: "WARJI-WEST", name: "Warji West", lgaCode: "WARJI", stateCode: "BA" },
  { code: "BALI", name: "Bali", lgaCode: "WARJI", stateCode: "BA" },
  { code: "BANGO-WARJI", name: "Bango", lgaCode: "WARJI", stateCode: "BA" },
  { code: "DAN-KURMI", name: "Dan Kurmi", lgaCode: "WARJI", stateCode: "BA" },
  { code: "GARU", name: "Garu", lgaCode: "WARJI", stateCode: "BA" },
  { code: "GUDUM", name: "Gudum", lgaCode: "WARJI", stateCode: "BA" },
];

// Get wards by LGA code
export function getWardsByLGA(lgaCode: string): LocationWard[] {
  return wards.filter((ward) => ward.lgaCode === lgaCode);
}

// Get ward by code
export function getWardByCode(code: string): LocationWard | undefined {
  return wards.find((ward) => ward.code === code);
}
