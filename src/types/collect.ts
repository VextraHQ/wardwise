import type { CampaignBrandingType } from "@/lib/collect/branding";

// Campaign type (matches API response — dates as ISO strings)
export type Campaign = {
  id: string;
  candidateId: string;
  slug: string;
  candidateName: string;
  candidateTitle: string | null;
  brandingType: CampaignBrandingType;
  displayName: string | null;
  party: string;
  constituency: string;
  constituencyType: string; // "federal" | "state" | "lga"
  enabledLgaIds: number[];
  customQuestion1: string | null;
  customQuestion2: string | null;
  status: string; // "draft" | "active" | "paused" | "closed"
  clientReportEnabled: boolean;
  clientReportToken: string | null;
  clientReportLastViewedAt: string | null;
  currentCandidateBoundaryLgaIds?: number[];
  candidateBoundaryError?: string | null;
  isBoundaryOutOfSync?: boolean;
  _count?: { submissions: number };
  createdAt: string;
  updatedAt: string;
};

// Campaign with submission count for list views
export type CampaignSummary = Campaign & {
  _count: { submissions: number };
  lastSubmissionAt: string | null;
};

// Collect submission type
export type CollectSubmission = {
  id: string;
  refCode?: string;
  campaignId: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  fullName: string;
  phone: string;
  email: string | null;
  sex: string;
  age: number;
  occupation: string;
  maritalStatus: string;
  lgaId: number | null;
  lgaName: string;
  wardId: number | null;
  wardName: string;
  pollingUnitId: number | null;
  pollingUnitName: string;
  apcRegNumber: string | null;
  voterIdNumber: string | null;
  isVerified: boolean;
  role: string; // "volunteer" | "member" | "canvasser"
  customAnswer1: string | null;
  customAnswer2: string | null;
  canvasserName: string | null;
  canvasserPhone: string | null;
  isFlagged: boolean;
  adminNotes: string | null;
  createdAt: string;
};

// Public-safe campaign subset for the registration form
export type PublicCampaign = {
  id: string;
  slug: string;
  candidateName: string;
  candidateTitle: string | null;
  brandingType: CampaignBrandingType;
  displayName: string | null;
  party: string;
  constituency: string;
  constituencyType: string;
  enabledLgaIds: number[];
  customQuestion1: string | null;
  customQuestion2: string | null;
  status: string;
  updatedAt: string;
  campaignCanvassers?: { id: string; name: string; phone: string }[];
};

// Geo types for dropdowns
export type GeoLga = { id: number; name: string; stateCode: string };
export type GeoWard = {
  id: number;
  code?: string | null;
  name: string;
  lgaId: number;
};
export type GeoPollingUnit = {
  id: number;
  code: string;
  name: string;
  wardId: number;
};

// Pre-loaded canvasser (added by admin)
export type CampaignCanvasserRecord = {
  id: string;
  campaignId: string;
  name: string;
  phone: string;
  zone: string | null;
  createdAt: string;
};

// Canvasser aggregation from submissions
export type CanvasserSummary = {
  canvasserName: string;
  canvasserPhone: string;
  _count: number;
  verified: number;
  flagged: number;
  lastActive: string | null;
};
