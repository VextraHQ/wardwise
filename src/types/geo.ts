// Geo admin types — for the /admin/geo management page

export type GeoLga = {
  id: number;
  name: string;
  stateCode: string;
  _count: { wards: number };
  puCount: number;
};

export type GeoWard = {
  id: number;
  name: string;
  lgaId: number;
  _count: { pollingUnits: number };
};

export type GeoPollingUnit = {
  id: number;
  code: string;
  name: string;
  wardId: number;
};

export type GeoStateStats = {
  stateCode: string;
  lgasSeeded: number;
  lgasExpected: number;
  totalWards: number;
  totalPUs: number;
};

export type GeoStats = {
  statesSeeded: number;
  totalLgas: number;
  totalWards: number;
  totalPollingUnits: number;
  byState: GeoStateStats[];
};

export type GeoImpact = {
  children: number;
  submissions: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

// Bulk CSV import types
export type ImportRowResult = {
  status: "valid" | "duplicate" | "error";
  data: Record<string, string>;
  message?: string;
};

export type ImportPreviewResponse = {
  summary: { total: number; valid: number; duplicates: number; errors: number };
  rows: ImportRowResult[];
};

export type ImportCommitResponse = {
  created: number;
  skipped: number;
  errors: string[];
};
