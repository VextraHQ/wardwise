import { NextResponse } from "next/server";
import { nigeriaStates } from "@/lib/data/state-lga-locations";
import { getLGAsByState } from "@/lib/data/state-lga-locations";
import { getWardsByLGA } from "@/lib/data/wards";
import { getPollingUnitsByWard } from "@/lib/data/polling-units";

// Legacy static location route kept for the future public voter/NIN flow.
// Current admin/candidate geo uses DB-backed APIs instead and should not rely on
// this route as the canonical runtime source.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get("level");
  const parent = searchParams.get("parent");

  if (level === "state") {
    const states = nigeriaStates.map((state) => ({
      code: state.code,
      name: state.name,
    }));
    return NextResponse.json({ items: states });
  }
  if (level === "lga" && parent) {
    const lgas = getLGAsByState(parent);
    return NextResponse.json({ items: lgas });
  }
  if (level === "ward" && parent) {
    const wards = getWardsByLGA(parent);
    return NextResponse.json({ items: wards });
  }
  if (level === "pu" && parent) {
    const pollingUnits = getPollingUnitsByWard(parent);
    return NextResponse.json({ items: pollingUnits });
  }

  return NextResponse.json({ error: "Invalid query" }, { status: 400 });
}
