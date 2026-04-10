import type { CampaignBrandingType } from "@/lib/collect/branding";

export type CampaignReportSummary = {
  campaign: {
    candidateName: string;
    candidateTitle: string | null;
    brandingType: CampaignBrandingType;
    displayName: string | null;
    party: string;
    constituency: string;
    constituencyType: string;
    slug: string;
    status: string;
    enabledLgaCount: number;
  };
  stats: {
    total: number;
    verified: number;
    flagged: number;
    daily: { date: string; count: number; cumulative: number }[];
    byLga: { lga: string; count: number }[];
    byWard: { ward: string; count: number }[];
    byRole: { role: string; count: number }[];
    bySex: { sex: string; count: number }[];
  };
  health: {
    lastSubmissionAt: string | null;
    canvasserCount: number;
    formStatus: string;
    topCanvassers: { name: string; phone: string; count: number }[];
  };
};

export type CampaignReportSubmission = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  sex: string;
  age: number;
  occupation: string;
  maritalStatus: string;
  lgaName: string;
  wardName: string;
  pollingUnitName: string;
  pollingUnitCode: string | null;
  role: string;
  canvasserName: string | null;
  canvasserPhone: string | null;
  isVerified: boolean;
  isFlagged: boolean;
  createdAt: string;
};

export type CampaignReportSubmissionsResponse = {
  submissions: CampaignReportSubmission[];
  total: number;
  page: number;
  pageSize: number;
};
