const INTEGER_PATTERN = /^-?\d+$/;

export function parseOptionalStringParam(
  params: URLSearchParams,
  key: string,
): string | undefined {
  const raw = params.get(key);
  if (raw === null) return undefined;
  const trimmed = raw.trim();
  return trimmed === "" ? undefined : trimmed;
}

export function parseBooleanParam(value: string | null): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export function parseIntegerParam(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  if (!INTEGER_PATTERN.test(value)) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseRequiredIntegerParam(
  params: URLSearchParams,
  key: string,
  label: string,
): { value: number } | { error: string } {
  const parsed = parseIntegerParam(params.get(key));
  if (parsed === undefined) {
    return { error: `${label} must be a valid integer` };
  }
  return { value: parsed };
}

export type PaginationParams = { page: number; pageSize: number };

export function parsePaginationParams(
  params: URLSearchParams,
  opts: { defaultPageSize?: number; maxPageSize?: number } = {},
): PaginationParams {
  const defaultPageSize = opts.defaultPageSize ?? 20;
  const maxPageSize = opts.maxPageSize ?? 100;

  const rawPage = parseIntegerParam(params.get("page"));
  const page = rawPage !== undefined && rawPage >= 1 ? rawPage : 1;

  const rawPageSize = parseIntegerParam(params.get("pageSize"));
  const pageSize =
    rawPageSize !== undefined && rawPageSize >= 1
      ? Math.min(rawPageSize, maxPageSize)
      : defaultPageSize;

  return { page, pageSize };
}

export type LimitOffsetParams = { limit: number; offset: number };

export function parseLimitOffsetParams(
  params: URLSearchParams,
  opts: { defaultLimit?: number; maxLimit?: number } = {},
): LimitOffsetParams {
  const defaultLimit = opts.defaultLimit ?? 50;
  const maxLimit = opts.maxLimit ?? 100;

  const rawLimit = parseIntegerParam(params.get("limit"));
  const limit =
    rawLimit !== undefined && rawLimit >= 1
      ? Math.min(rawLimit, maxLimit)
      : defaultLimit;

  const rawOffset = parseIntegerParam(params.get("offset"));
  const offset = rawOffset !== undefined && rawOffset >= 0 ? rawOffset : 0;

  return { limit, offset };
}
