import type { CollectSubmission } from "@/types/collect";

export function getDailySubmissions(submissions: CollectSubmission[]) {
  const counts: Record<string, number> = {};
  for (const s of submissions) {
    const date = s.createdAt.split("T")[0];
    counts[date] = (counts[date] || 0) + 1;
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

export function getSubmissionsByLga(submissions: CollectSubmission[]) {
  const counts: Record<string, number> = {};
  for (const s of submissions) {
    counts[s.lgaName] = (counts[s.lgaName] || 0) + 1;
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([lga, count]) => ({ lga, count }));
}

export function getSubmissionsByRole(submissions: CollectSubmission[]) {
  const counts: Record<string, number> = {};
  for (const s of submissions) {
    counts[s.role] = (counts[s.role] || 0) + 1;
  }
  return Object.entries(counts).map(([role, count]) => ({ role, count }));
}

export function getSubmissionsBySex(submissions: CollectSubmission[]) {
  const counts: Record<string, number> = {};
  for (const s of submissions) {
    counts[s.sex] = (counts[s.sex] || 0) + 1;
  }
  return Object.entries(counts).map(([sex, count]) => ({ sex, count }));
}

export function getCumulativeRegistrations(submissions: CollectSubmission[]) {
  const daily = getDailySubmissions(submissions);
  let cumulative = 0;
  return daily.map(({ date, count }) => {
    cumulative += count;
    return { date, daily: count, cumulative };
  });
}

export function getSubmissionsByWard(submissions: CollectSubmission[]) {
  const counts: Record<string, number> = {};
  for (const s of submissions) {
    counts[s.wardName] = (counts[s.wardName] || 0) + 1;
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([ward, count]) => ({ ward, count }));
}

export const roleLabels: Record<string, string> = {
  volunteer: "Volunteer",
  member: "Member",
  canvasser: "Canvasser",
  // Legacy labels (backward compat for old data)
  women_leader: "Women Leader",
  coordinator: "Coordinator",
  youth_leader: "Youth Leader",
};
