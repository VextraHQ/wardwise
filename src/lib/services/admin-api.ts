/**
 * Admin API Service - Abstraction Layer
 *
 * This service provides a unified interface for admin operations.
 * Switch between mock and real APIs by changing the import in admin-api-config.ts
 *
 * Usage:
 *   import { adminApi } from "@/lib/services/admin-api";
 *   const candidates = await adminApi.candidates.getAll();
 */

import type { Candidate } from "@/types/candidate";
import type { Voter } from "@/types/voter";

// Types
export interface CandidateWithUser extends Candidate {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
  };
}

export interface CreateCandidateData {
  name: string;
  email: string;
  party: string;
  position: Candidate["position"];
  constituency: string;
  description?: string;
}

export interface UpdateCandidateData {
  id: string;
  name?: string;
  email?: string;
  party?: string;
  position?: Candidate["position"];
  constituency?: string;
  description?: string;
}

export interface AdminApiService {
  candidates: {
    getAll: () => Promise<CandidateWithUser[]>;
    getById: (id: string) => Promise<CandidateWithUser | null>;
    create: (data: CreateCandidateData) => Promise<CandidateWithUser>;
    update: (data: UpdateCandidateData) => Promise<CandidateWithUser>;
    delete: (id: string) => Promise<void>;
  };
  voters: {
    getAll: (params?: {
      candidateId?: string;
      limit?: number;
      offset?: number;
    }) => Promise<{ voters: Voter[]; total: number }>;
    getById: (id: string) => Promise<Voter | null>;
    getByNIN: (nin: string) => Promise<Voter | null>;
    delete: (id: string) => Promise<void>;
  };
}

// Import the implementation based on config
// Change this import to switch between mock and real APIs
export { adminApi } from "./admin-api-config";
