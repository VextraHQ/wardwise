import type { Prisma } from "@prisma/client";
import { parseRefCodePrefix } from "@/lib/utils";
import {
  parseBooleanParam,
  parseIntegerParam,
  parseOptionalStringParam,
} from "@/lib/server/query-params";

export type SubmissionFilters = {
  search?: string;
  lgaId?: number;
  wardId?: number;
  role?: string;
  isFlagged?: boolean;
  isVerified?: boolean;
  canvasserName?: string;
  canvasserPhone?: string;
};

export function parseSubmissionFilters(
  searchParams: URLSearchParams,
): SubmissionFilters {
  return {
    search: parseOptionalStringParam(searchParams, "search"),
    lgaId: parseIntegerParam(searchParams.get("lgaId")),
    wardId: parseIntegerParam(searchParams.get("wardId")),
    role: parseOptionalStringParam(searchParams, "role"),
    isFlagged: parseBooleanParam(searchParams.get("isFlagged")),
    isVerified: parseBooleanParam(searchParams.get("isVerified")),
    canvasserName: parseOptionalStringParam(searchParams, "canvasserName"),
    canvasserPhone: parseOptionalStringParam(searchParams, "canvasserPhone"),
  };
}

export function buildSubmissionWhere(
  campaignId: string,
  filters: SubmissionFilters,
): Prisma.CollectSubmissionWhereInput {
  const where: Prisma.CollectSubmissionWhereInput = { campaignId };

  if (filters.search) {
    const refCodePrefix = parseRefCodePrefix(filters.search);

    where.OR = [
      { fullName: { contains: filters.search, mode: "insensitive" } },
      { firstName: { contains: filters.search, mode: "insensitive" } },
      { middleName: { contains: filters.search, mode: "insensitive" } },
      { lastName: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search } },
      { email: { contains: filters.search, mode: "insensitive" } },
      ...(refCodePrefix ? [{ id: { startsWith: refCodePrefix } }] : []),
    ];
  }

  if (filters.lgaId) where.lgaId = filters.lgaId;
  if (filters.wardId) where.wardId = filters.wardId;
  if (filters.role) where.role = filters.role;
  if (filters.isFlagged !== undefined) where.isFlagged = filters.isFlagged;
  if (filters.isVerified !== undefined) where.isVerified = filters.isVerified;
  if (filters.canvasserName) {
    where.canvasserName = {
      equals: filters.canvasserName,
      mode: "insensitive",
    };
  }
  if (filters.canvasserPhone) where.canvasserPhone = filters.canvasserPhone;

  return where;
}
