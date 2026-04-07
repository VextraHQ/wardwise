import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
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

type WardLookupRow = {
  id: number;
  code: string | null;
  name: string;
  lgaId: number;
};

function buildWardLookupMaps(wards: WardLookupRow[]) {
  const wardCodeMap = new Map<string, number>();
  const wardNameMap = new Map<string, number[]>();

  for (const ward of wards) {
    if (ward.code) {
      wardCodeMap.set(`${ward.code.toLowerCase()}|${ward.lgaId}`, ward.id);
    }

    const nameKey = `${ward.name.toLowerCase()}|${ward.lgaId}`;
    const ids = wardNameMap.get(nameKey) ?? [];
    ids.push(ward.id);
    wardNameMap.set(nameKey, ids);
  }

  return { wardCodeMap, wardNameMap };
}

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
    select: { code: true, name: true, lgaId: true },
  });
  const existingCodeSet = new Set(
    existingWards
      .filter((w) => Boolean(w.code))
      .map((w) => `code:${w.code!.toLowerCase()}|${w.lgaId}`),
  );
  const existingNameSet = new Set(
    existingWards.map((w) => `name:${w.name.toLowerCase()}|${w.lgaId}`),
  );
  const seenCodeSet = new Set<string>();
  const seenNameSet = new Set<string>();

  return rows.map((row) => {
    const code = sanitize(row.code || row.wardcode || "");
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
    const duplicateKey = code
      ? `code:${code.toLowerCase()}|${lgaId}`
      : `name:${name.toLowerCase()}|${lgaId}`;
    if (
      (code &&
        (existingCodeSet.has(duplicateKey) || seenCodeSet.has(duplicateKey))) ||
      (!code &&
        (existingNameSet.has(duplicateKey) || seenNameSet.has(duplicateKey)))
    ) {
      return {
        status: "duplicate",
        data: row,
        message: code
          ? "Ward code already exists in this LGA"
          : "Ward name already exists in this LGA. Add the official ward code if this is a distinct official ward.",
      };
    }

    if (code) {
      seenCodeSet.add(duplicateKey);
    } else {
      seenNameSet.add(duplicateKey);
    }

    return {
      status: "valid",
      data: { ...row, name, code, _lgaId: String(lgaId) },
    };
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
    select: { id: true, code: true, name: true, lgaId: true },
  });

  const { wardCodeMap, wardNameMap } = buildWardLookupMaps(allWards);

  // Batch lookup existing PUs
  const wardIds = Array.from(new Set(allWards.map((ward) => ward.id)));
  const existingPUs = await prisma.pollingUnit.findMany({
    where: { wardId: { in: wardIds } },
    select: { code: true, name: true, wardId: true },
  });
  const existingSet = new Set(
    existingPUs.map((p) =>
      p.code
        ? `code:${p.code.toLowerCase()}|${p.wardId}`
        : `name:${p.name.toLowerCase()}|${p.wardId}`,
    ),
  );

  return rows.map((row) => {
    const code = sanitize(row.code || "");
    const name = sanitize(row.name || "") || code;
    const lgaName = (row.lganame || "").trim().toLowerCase();
    const stateCode = (row.statecode || "").toUpperCase();
    const wardName = (row.wardname || "").trim().toLowerCase();
    const wardCode = sanitize(row.wardcode || "");

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

    const wardMatchesByName = wardNameMap.get(`${wardName}|${lgaId}`) ?? [];
    const wardId = wardCode
      ? wardCodeMap.get(`${wardCode.toLowerCase()}|${lgaId}`)
      : wardMatchesByName.length === 1
        ? wardMatchesByName[0]
        : undefined;
    if (!wardId) {
      return {
        status: "error",
        data: row,
        message: wardCode
          ? `Ward code "${row.wardcode}" was not found in LGA "${row.lganame}"`
          : wardMatchesByName.length > 1
            ? `Ward "${row.wardname}" is ambiguous in LGA "${row.lganame}". Include wardCode in the CSV.`
            : `Ward "${row.wardname}" not found in LGA "${row.lganame}"`,
      };
    }

    const duplicateKey = code
      ? `code:${code.toLowerCase()}|${wardId}`
      : `name:${name.toLowerCase()}|${wardId}`;
    if (existingSet.has(duplicateKey)) {
      return {
        status: "duplicate",
        data: row,
        message: code
          ? "Polling unit code already exists in this ward"
          : "Polling unit name already exists in this ward",
      };
    }
    return {
      status: "valid",
      data: { ...row, code, name, _wardId: String(wardId) },
    };
  });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

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
              code: r.data.code || null,
              name: r.data.name,
              lgaId: parseInt(r.data._lgaId),
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
              wardId: parseInt(r.data._wardId),
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
