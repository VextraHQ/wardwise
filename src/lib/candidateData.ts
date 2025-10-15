export type Candidate = {
  id: string;
  name: string;
  party: string;
  position: string;
  constituency: string;
  photo?: string;
};

export const candidatesByConstituency: Record<string, Candidate[]> = {
  "Song-Fufore": [
    {
      id: "cand-apc-1",
      name: "Hon. Ahmed Suleiman",
      party: "APC",
      position: "House of Representatives",
      constituency: "Song & Fufore Federal Constituency",
    },
    {
      id: "cand-pdp-1",
      name: "Alhaji Bello Ibrahim",
      party: "PDP",
      position: "House of Representatives",
      constituency: "Song & Fufore Federal Constituency",
    },
    {
      id: "cand-lp-1",
      name: "Dr. Fatima Yusuf",
      party: "LP",
      position: "House of Representatives",
      constituency: "Song & Fufore Federal Constituency",
    },
    {
      id: "cand-undecided",
      name: "I'm Undecided",
      party: "",
      position: "",
      constituency: "",
    },
  ],
};

export function getCandidatesFor(
  stateCode: string,
  lgaCode: string,
): Candidate[] {
  // Demo mapping: If LGA includes SONG or FUF, show Song-Fufore
  const key =
    lgaCode.includes("SONG") || lgaCode.includes("FUF")
      ? "Song-Fufore"
      : "Song-Fufore";
  return candidatesByConstituency[key] ?? [];
}
