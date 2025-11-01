// Ward data - single source of truth for ward data - DEMO ONLY
import type { LocationWard } from "@/types/location";

export const wards: LocationWard[] = [
  // Adamawa State (AD)
  // Yola North LGA (YOLN) - AdamawaWards
  { code: "JAMBUTU", name: "Jambutu", lgaCode: "YOLN", stateCode: "AD" },
  { code: "AJIYA", name: "Ajiya", lgaCode: "YOLN", stateCode: "AD" },
  { code: "KAREWA", name: "Karewa", lgaCode: "YOLN", stateCode: "AD" },
  { code: "ALKALAWA", name: "Alkalawa", lgaCode: "YOLN", stateCode: "AD" },
  { code: "DOUBELI", name: "Doubeli", lgaCode: "YOLN", stateCode: "AD" },

  // Yola South LGA (YOLS) - AdamawaWards
  { code: "BAMOI", name: "Bamoi", lgaCode: "YOLS", stateCode: "AD" },
  { code: "NGURORE", name: "Ngurore", lgaCode: "YOLS", stateCode: "AD" },
  { code: "ADARAWO", name: "Adarawo", lgaCode: "YOLS", stateCode: "AD" },

  // Song LGA (SONG) - AdamawaWards
  { code: "SONG-W1", name: "Song Ward 1", lgaCode: "SONG", stateCode: "AD" },
  { code: "SONG-W2", name: "Song Ward 2", lgaCode: "SONG", stateCode: "AD" },
  { code: "SONG-W3", name: "Song Central", lgaCode: "SONG", stateCode: "AD" },

  // Fufore LGA (FUF) - AdamawaWards
  { code: "FUF-W1", name: "Fufore Ward 1", lgaCode: "FUF", stateCode: "AD" },
  { code: "FUF-W2", name: "Fufore Ward 2", lgaCode: "FUF", stateCode: "AD" },
  { code: "MALABU", name: "Malabu Ward", lgaCode: "FUF", stateCode: "AD" },
  { code: "RIBADU", name: "Ribadu Ward", lgaCode: "FUF", stateCode: "AD" },

  // Bauchi State (BA)
  // Bauchi LGA (BAUCHI-LGA) - BauchiWards
  {
    code: "BAUCHI-W1",
    name: "Bauchi Ward 1",
    lgaCode: "BAUCHI-LGA",
    stateCode: "BA",
  },
  {
    code: "BAUCHI-W2",
    name: "Bauchi Ward 2",
    lgaCode: "BAUCHI-LGA",
    stateCode: "BA",
  },
  {
    code: "BAUCHI-W3",
    name: "Bauchi Ward 3",
    lgaCode: "BAUCHI-LGA",
    stateCode: "BA",
  },
  {
    code: "BAUCHI-W4",
    name: "Bauchi Ward 4",
    lgaCode: "BAUCHI-LGA",
    stateCode: "BA",
  },

  // Azare LGA (AZARE) - BauchiWards
  { code: "AZARE-W1", name: "Azare Ward 1", lgaCode: "AZARE", stateCode: "BA" },
  { code: "AZARE-W2", name: "Azare Ward 2", lgaCode: "AZARE", stateCode: "BA" },
  { code: "AZARE-W3", name: "Azare Ward 3", lgaCode: "AZARE", stateCode: "BA" },
  { code: "AZARE-W4", name: "Azare Ward 4", lgaCode: "AZARE", stateCode: "BA" },
];

// Get wards by LGA code
export function getWardsByLGA(lgaCode: string): LocationWard[] {
  return wards.filter((ward) => ward.lgaCode === lgaCode);
}

// Get ward by code
export function getWardByCode(code: string): LocationWard | undefined {
  return wards.find((ward) => ward.code === code);
}
