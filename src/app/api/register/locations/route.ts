import { NextResponse } from "next/server";
import {
  states,
  lgasByState,
  wardsByLga,
  pollingUnitsByWard,
} from "@/lib/locationData";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get("level");
  const parent = searchParams.get("parent");

  if (level === "state") {
    return NextResponse.json({ items: states });
  }
  if (level === "lga" && parent) {
    return NextResponse.json({
      items: lgasByState[parent as keyof typeof lgasByState] ?? [],
    });
  }
  if (level === "ward" && parent) {
    return NextResponse.json({
      items: wardsByLga[parent as keyof typeof wardsByLga] ?? [],
    });
  }
  if (level === "pu" && parent) {
    return NextResponse.json({
      items:
        pollingUnitsByWard[parent as keyof typeof pollingUnitsByWard] ?? [],
    });
  }

  return NextResponse.json({ error: "Invalid query" }, { status: 400 });
}
