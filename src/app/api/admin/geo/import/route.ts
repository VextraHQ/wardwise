import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nigeriaStates } from "@/lib/data/state-lga-locations";
import type {
  ImportRowResult,
  ImportPreviewResponse,
  ImportCommitResponse,
} from "@/types/geo";

const MAX_ROWS = 5000;
const FORMULA_CHARS = ["=", "+", "-", "@", "\t", "\r"];

function sanitize(value: string): string {
  let v = value.trim();
  if (v.length > 0 && FORMULA_CHARS.includes(v[0])) {
    v = "'" + v;
  }
  return v;
}

type ImportLevel = "lga" | "ward" | "polling-unit";

interface ImportRequest {
  level: ImportLevel;
  rows: Record<string, string>[];
  preview: boolean;
  stateCode?: string;
  lgaId?: number;
  wardId?: number;
}

const validStateCodes = new Set(nigeriaStates.map((s) => s.code));

async function validateLgaRows(
  rows: Record<string, string>[],
): Promise<ImportRowResult[]> {
  // Collect unique stateCodes from rows
  const stateCodes = new Set<string>();
  for (const row of rows) {
    if (row.statecode) stateCodes.add(row.statecode.toUpperCase());
  }

  // Batch lookup existing LGAs for these states
  const existingLgas = await prisma.lga.findMany({
    where: { stateCode: { in: Array.from(stateCodes) } },
    select: { name: true, stateCode: true },
  });
  const existingSet = new Set(
    existingLgas.map((l) => `${l.name.toLowerCase()}|${l.stateCode}`),
  );

  return rows.map((row) => {
    const name = sanitize(row.name || "");
    const stateCode = (row.statecode || "").toUpperCase();

    if (name.length < 2) {
      return {
        status: "error",
        data: row,
        message: "Name must be at least 2 characters",
      };
    }
    if (!validStateCodes.has(stateCode)) {
      return {
        status: "error",
        data: row,
        message: `Invalid state code: ${stateCode}`,
      };
    }
    if (existingSet.has(`${name.toLowerCase()}|${stateCode}`)) {
      return { status: "duplicate", data: row, message: "LGA already exists" };
    }
    return { status: "valid", data: { ...row, name, statecode: stateCode } };
  });
}

async function validateWardRows(
  rows: Record<string, string>[],
): Promise<ImportRowResult[]> {
  // Collect unique lgaName+stateCode pairs
  const lgaPairs = new Set<string>();
  for (const row of rows) {
    const lgaName = (row.lganame || "").trim().toLowerCase();
    const stateCode = (row.statecode || "").toUpperCase();
    if (lgaName && stateCode) lgaPairs.add(`${lgaName}|${stateCode}`);
  }

  // Batch lookup LGAs
  const allLgas = await prisma.lga.findMany({
    where: {
      stateCode: {
        in: Array.from(
          new Set(Array.from(lgaPairs).map((p) => p.split("|")[1])),
        ),
      },
    },
    select: { id: true, name: true, stateCode: true },
  });

  const lgaMap = new Map<string, number>();
  for (const lga of allLgas) {
    lgaMap.set(`${lga.name.toLowerCase()}|${lga.stateCode}`, lga.id);
  }

  // Batch lookup existing wards
  const lgaIds = Array.from(new Set(lgaMap.values()));
  const existingWards = await prisma.ward.findMany({
    where: { lgaId: { in: lgaIds } },
    select: { name: true, lgaId: true },
  });
  const existingSet = new Set(
    existingWards.map((w) => `${w.name.toLowerCase()}|${w.lgaId}`),
  );

  return rows.map((row) => {
    const name = sanitize(row.name || "");
    const lgaName = (row.lganame || "").trim().toLowerCase();
    const stateCode = (row.statecode || "").toUpperCase();

    if (name.length < 2) {
      return {
        status: "error",
        data: row,
        message: "Name must be at least 2 characters",
      };
    }
    if (!validStateCodes.has(stateCode)) {
      return {
        status: "error",
        data: row,
        message: `Invalid state code: ${stateCode}`,
      };
    }

    const lgaId = lgaMap.get(`${lgaName}|${stateCode}`);
    if (!lgaId) {
      return {
        status: "error",
        data: row,
        message: `LGA "${row.lganame}" not found in state ${stateCode}`,
      };
    }
    if (existingSet.has(`${name.toLowerCase()}|${lgaId}`)) {
      return {
        status: "duplicate",
        data: row,
        message: "Ward already exists in this LGA",
      };
    }
    return { status: "valid", data: { ...row, name, _lgaId: String(lgaId) } };
  });
}

async function validatePollingUnitRows(
  rows: Record<string, string>[],
): Promise<ImportRowResult[]> {
  // Collect unique lgaName+stateCode and wardName+lgaKey pairs
  const lgaPairs = new Set<string>();
  for (const row of rows) {
    const lgaName = (row.lganame || "").trim().toLowerCase();
    const stateCode = (row.statecode || "").toUpperCase();
    if (lgaName && stateCode) lgaPairs.add(`${lgaName}|${stateCode}`);
  }

  // Batch lookup LGAs
  const allLgas = await prisma.lga.findMany({
    where: {
      stateCode: {
        in: Array.from(
          new Set(Array.from(lgaPairs).map((p) => p.split("|")[1])),
        ),
      },
    },
    select: { id: true, name: true, stateCode: true },
  });

  const lgaMap = new Map<string, number>();
  for (const lga of allLgas) {
    lgaMap.set(`${lga.name.toLowerCase()}|${lga.stateCode}`, lga.id);
  }

  // Batch lookup wards
  const lgaIds = Array.from(new Set(lgaMap.values()));
  const allWards = await prisma.ward.findMany({
    where: { lgaId: { in: lgaIds } },
    select: { id: true, name: true, lgaId: true },
  });

  const wardMap = new Map<string, number>();
  for (const ward of allWards) {
    wardMap.set(`${ward.name.toLowerCase()}|${ward.lgaId}`, ward.id);
  }

  // Batch lookup existing PUs
  const wardIds = Array.from(new Set(wardMap.values()));
  const existingPUs = await prisma.pollingUnit.findMany({
    where: { wardId: { in: wardIds } },
    select: { name: true, wardId: true },
  });
  const existingSet = new Set(
    existingPUs.map((p) => `${p.name.toLowerCase()}|${p.wardId}`),
  );

  return rows.map((row) => {
    const code = sanitize(row.code || "");
    const name = sanitize(row.name || "") || code;
    const lgaName = (row.lganame || "").trim().toLowerCase();
    const stateCode = (row.statecode || "").toUpperCase();
    const wardName = (row.wardname || "").trim().toLowerCase();

    if (!code) {
      return { status: "error", data: row, message: "INEC Code is required" };
    }
    if (!validStateCodes.has(stateCode)) {
      return {
        status: "error",
        data: row,
        message: `Invalid state code: ${stateCode}`,
      };
    }

    const lgaId = lgaMap.get(`${lgaName}|${stateCode}`);
    if (!lgaId) {
      return {
        status: "error",
        data: row,
        message: `LGA "${row.lganame}" not found in state ${stateCode}`,
      };
    }

    const wardId = wardMap.get(`${wardName}|${lgaId}`);
    if (!wardId) {
      return {
        status: "error",
        data: row,
        message: `Ward "${row.wardname}" not found in LGA "${row.lganame}"`,
      };
    }

    if (existingSet.has(`${name.toLowerCase()}|${wardId}`)) {
      return {
        status: "duplicate",
        data: row,
        message: "Polling unit already exists in this ward",
      };
    }
    return {
      status: "valid",
      data: { ...row, code, name, _wardId: String(wardId) },
    };
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as ImportRequest;
    const { level, rows, preview } = body;

    if (!level || !rows || !Array.isArray(rows)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }
    if (rows.length === 0) {
      return NextResponse.json({ error: "No rows to import" }, { status: 400 });
    }
    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_ROWS} rows per import` },
        { status: 400 },
      );
    }

    // Normalize header keys to lowercase
    const normalizedRows = rows.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]),
      ),
    );

    let results: ImportRowResult[];

    switch (level) {
      case "lga":
        results = await validateLgaRows(normalizedRows);
        break;
      case "ward":
        results = await validateWardRows(normalizedRows);
        break;
      case "polling-unit":
        results = await validatePollingUnitRows(normalizedRows);
        break;
      default:
        return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }

    const summary = {
      total: results.length,
      valid: results.filter((r) => r.status === "valid").length,
      duplicates: results.filter((r) => r.status === "duplicate").length,
      errors: results.filter((r) => r.status === "error").length,
    };

    if (preview) {
      return NextResponse.json({
        summary,
        rows: results,
      } satisfies ImportPreviewResponse);
    }

    // Commit phase
    const validRows = results.filter((r) => r.status === "valid");
    if (validRows.length === 0) {
      return NextResponse.json({
        created: 0,
        skipped: summary.duplicates,
        errors: [],
      } satisfies ImportCommitResponse);
    }

    const commitErrors: string[] = [];

    await prisma.$transaction(async (tx) => {
      switch (level) {
        case "lga": {
          await tx.lga.createMany({
            data: validRows.map((r) => ({
              name: r.data.name,
              stateCode: r.data.statecode,
            })),
            skipDuplicates: true,
          });
          break;
        }
        case "ward": {
          await tx.ward.createMany({
            data: validRows.map((r) => ({
              name: r.data.name,
              lgaId: parseInt(r.data._lgaid),
            })),
            skipDuplicates: true,
          });
          break;
        }
        case "polling-unit": {
          await tx.pollingUnit.createMany({
            data: validRows.map((r) => ({
              code: r.data.code,
              name: r.data.name,
              wardId: parseInt(r.data._wardid),
            })),
            skipDuplicates: true,
          });
          break;
        }
      }
    });

    return NextResponse.json({
      created: validRows.length,
      skipped: summary.duplicates,
      errors: commitErrors,
    } satisfies ImportCommitResponse);
  } catch (error) {
    console.error("Geo import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed" },
      { status: 500 },
    );
  }
}
