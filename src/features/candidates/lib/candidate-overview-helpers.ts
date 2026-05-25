import type { ZodError } from "zod";

import type { CandidateWithUser } from "@/features/admin/api/admin-api";
import {
  NIGERIAN_PARTIES,
  CANDIDATE_TITLES,
  CANDIDATE_PARTY_OTHER_OPTION,
  CANDIDATE_TITLE_OTHER_OPTION,
} from "@/features/candidates/data/nigerian-parties";
import type { UpdateCandidateFormValues } from "@/features/candidates/schemas/candidate-schemas";
import { nigeriaStates } from "@/features/geo/data/state-lga-locations";

export function resolveStateName(stateCode: string | null): string {
  if (!stateCode) return "—";
  return nigeriaStates.find((s) => s.code === stateCode)?.name ?? stateCode;
}

export const POSITIONS = [
  "President",
  "Governor",
  "Senator",
  "House of Representatives",
  "State Assembly",
] as const;

export type CandidateOverviewPosition = (typeof POSITIONS)[number];

export const PARTY_OPTIONS_WITH_OTHER = [
  ...NIGERIAN_PARTIES,
  CANDIDATE_PARTY_OTHER_OPTION,
];

export const TITLE_OPTIONS_WITH_OTHER = [
  ...CANDIDATE_TITLES,
  CANDIDATE_TITLE_OTHER_OPTION,
];

export type EditingSection = "identity" | "electoral" | "contact" | "bio";

export const LGA_CHIP_DISPLAY_LIMIT = 4;

export function buildCandidateFormDefaults(
  candidate: CandidateWithUser,
): UpdateCandidateFormValues {
  return {
    id: candidate.id,
    name: candidate.name,
    email: candidate.user?.email ?? "",
    party: candidate.party,
    position: candidate.position,
    constituency: candidate.constituency ?? "",
    stateCode: candidate.stateCode ?? "",
    lga: candidate.lga ?? "",
    constituencyLgaIds: candidate.constituencyLgaIds ?? [],
    description: candidate.description ?? "",
    phone: candidate.phone ?? "",
    title: candidate.title ?? "",
  };
}

export function firstZodIssueMessage(error: ZodError): string {
  return error.issues[0]?.message ?? "Validation failed";
}
