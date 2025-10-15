export type StateItem = { code: string; name: string };
export type LGAItem = { code: string; name: string };
export type WardItem = { code: string; name: string };
export type PollingUnitItem = { code: string; name: string };

// Demo data focused on Adamawa with a few LGAs and wards, and generated PUs
export const states: StateItem[] = [{ code: "AD", name: "Adamawa State" }];

export const lgasByState: Record<string, LGAItem[]> = {
  AD: [
    { code: "YOLN", name: "Yola North" },
    { code: "YOLS", name: "Yola South" },
    { code: "SONG", name: "Song" },
    { code: "FUF", name: "Fufore" },
  ],
};

export const wardsByLga: Record<string, WardItem[]> = {
  YOLN: [
    { code: "JAMBUTU", name: "Jambutu" },
    { code: "AJIYA", name: "Ajiya" },
    { code: "KAREWA", name: "Karewa" },
  ],
  YOLS: [
    { code: "BAMBAAMBA", name: "Bamoi" },
    { code: "NGURORE", name: "Ngurore" },
  ],
  SONG: [
    { code: "SONG-W1", name: "Song Ward 1" },
    { code: "SONG-W2", name: "Song Ward 2" },
  ],
  FUF: [
    { code: "FUF-W1", name: "Fufore Ward 1" },
    { code: "FUF-W2", name: "Fufore Ward 2" },
  ],
};

function genUnits(prefix: string, count = 12): PollingUnitItem[] {
  return Array.from({ length: count }).map((_, i) => {
    const num = String(i + 1).padStart(3, "0");
    return { code: `${prefix}-${num}`, name: `Unit ${num} - Community Centre` };
  });
}

export const pollingUnitsByWard: Record<string, PollingUnitItem[]> = {
  JAMBUTU: genUnits("JAM", 10),
  AJIYA: genUnits("AJI", 10),
  KAREWA: genUnits("KAR", 10),
  BAMBAAMBA: genUnits("BAM", 10),
  NGURORE: genUnits("NGU", 10),
  "SONG-W1": genUnits("S1", 12),
  "SONG-W2": genUnits("S2", 12),
  "FUF-W1": genUnits("FW1", 12),
  "FUF-W2": genUnits("FW2", 12),
};
