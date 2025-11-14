/**
 * Voter Analytics Functions
 *
 * Comprehensive analytics functions for analyzing voter/supporter data.
 * All functions read from voters.ts data - single source of truth.
 *
 * These functions calculate real metrics from voter data:
 * - Supporter counts and distributions
 * - Ward coverage and polling unit statistics
 * - Demographic breakdowns
 * - Registration trends over time
 * - Survey response analytics
 *
 * NOTE: All functions filter by candidateId to ensure data isolation.
 * Each candidate sees only their own supporters and metrics.
 *
 * These analytics can be used by:
 * - Candidates (for dashboards)
 * - Voters (for viewing community stats)
 * - Admin (for platform-wide analytics)
 */

import type { Voter } from "@/types/voter";
import type { CandidateSurvey } from "@/types/survey";
import { getVotersByCandidate } from "@/lib/mock/data/voters";
import { getSurveyByCandidateId } from "@/lib/mock/data/candidate-surveys";

// Get total supporter count for a candidate - Calculated from actual voters supporting the candidate
export function getSupportersCount(candidateId: string): number {
  return getVotersByCandidate(candidateId).length;
}

// Get supporters filtered by ward - Returns all voters supporting a candidate in a specific ward
export function getSupportersByWard(
  candidateId: string,
  ward: string,
): Voter[] {
  return getVotersByCandidate(candidateId).filter(
    (voter) => voter.ward === ward,
  );
}

// Get supporters filtered by LGA - Returns all voters supporting a candidate in a specific LGA
export function getSupportersByLGA(candidateId: string, lga: string): Voter[] {
  return getVotersByCandidate(candidateId).filter((voter) => voter.lga === lga);
}

// Get ward coverage statistics for a candidate - Calculates coverage metrics: covered wards, total wards, coverage percentage
export function getWardCoverage(candidateId: string): {
  coveredWards: number;
  totalWards: number;
  coveragePercentage: number;
  wardsWithSupporters: string[];
  wardDetails: Array<{
    ward: string;
    supporterCount: number;
    lga: string;
  }>;
} {
  const supporters = getVotersByCandidate(candidateId);

  // Get unique wards with supporters
  const wardsWithSupporters = [
    ...new Set(supporters.map((voter) => voter.ward)),
  ];

  // Get ward details with supporter counts
  const wardDetails = wardsWithSupporters.map((ward) => {
    const wardSupporters = supporters.filter((v) => v.ward === ward);
    return {
      ward,
      supporterCount: wardSupporters.length,
      lga: wardSupporters[0]?.lga || "",
    };
  });

  // For demo purposes, we'll use a reasonable total ward count
  // In production, this would come from actual ward data
  const totalWards = 20; // Typical number of wards in a constituency
  const coveredWards = wardsWithSupporters.length;
  const coveragePercentage =
    totalWards > 0 ? Math.round((coveredWards / totalWards) * 100) : 0;

  return {
    coveredWards,
    totalWards,
    coveragePercentage,
    wardsWithSupporters,
    wardDetails,
  };
}

// Get polling unit statistics for a candidate - Returns unique polling units and voters per unit
export function getPollingUnitStats(candidateId: string): {
  uniquePollingUnits: number;
  votersPerUnit: Record<string, number>;
  unitDetails: Array<{
    pollingUnit: string;
    supporterCount: number;
    ward: string;
    lga: string;
  }>;
} {
  const supporters = getVotersByCandidate(candidateId);

  // Get unique polling units
  const uniquePollingUnits = new Set(
    supporters.map((voter) => voter.pollingUnit),
  ).size;

  // Calculate voters per unit
  const votersPerUnit: Record<string, number> = {};
  const unitDetails: Array<{
    pollingUnit: string;
    supporterCount: number;
    ward: string;
    lga: string;
  }> = [];

  supporters.forEach((voter) => {
    votersPerUnit[voter.pollingUnit] =
      (votersPerUnit[voter.pollingUnit] || 0) + 1;
  });

  // Create unit details array
  Object.entries(votersPerUnit).forEach(([pollingUnit, count]) => {
    const unitVoter = supporters.find((v) => v.pollingUnit === pollingUnit);
    if (unitVoter) {
      unitDetails.push({
        pollingUnit,
        supporterCount: count,
        ward: unitVoter.ward,
        lga: unitVoter.lga,
      });
    }
  });

  return {
    uniquePollingUnits,
    votersPerUnit,
    unitDetails,
  };
}

// Get demographic breakdown for a candidate's supporters - Returns age groups, gender distribution, and location breakdowns
export function getDemographics(candidateId: string): {
  ageGroups: Record<string, number>;
  gender: Record<string, number>;
  locations: {
    states: Record<string, number>;
    lgas: Record<string, number>;
    wards: Record<string, number>;
  };
  totalCount: number;
} {
  const supporters = getVotersByCandidate(candidateId);

  const ageGroups: Record<string, number> = {
    "18-25": 0,
    "26-35": 0,
    "36-45": 0,
    "46-55": 0,
    "56+": 0,
  };

  const gender: Record<string, number> = {
    male: 0,
    female: 0,
    other: 0,
  };

  const states: Record<string, number> = {};
  const lgas: Record<string, number> = {};
  const wards: Record<string, number> = {};

  supporters.forEach((voter) => {
    // Age grouping
    switch (true) {
      case voter.age >= 18 && voter.age <= 25:
        ageGroups["18-25"]++;
        break;
      case voter.age >= 26 && voter.age <= 35:
        ageGroups["26-35"]++;
        break;
      case voter.age >= 36 && voter.age <= 45:
        ageGroups["36-45"]++;
        break;
      case voter.age >= 46 && voter.age <= 55:
        ageGroups["46-55"]++;
        break;
      case voter.age >= 56:
        ageGroups["56+"]++;
        break;
    }

    // Gender
    if (voter.gender) {
      gender[voter.gender] = (gender[voter.gender] || 0) + 1;
    }

    // Locations
    states[voter.state] = (states[voter.state] || 0) + 1;
    lgas[voter.lga] = (lgas[voter.lga] || 0) + 1;
    wards[voter.ward] = (wards[voter.ward] || 0) + 1;
  });

  return {
    ageGroups,
    gender,
    locations: {
      states,
      lgas,
      wards,
    },
    totalCount: supporters.length,
  };
}

// Get registration trends over time for a candidate - Returns registration counts grouped by date, week, or month
export function getRegistrationTrends(
  candidateId: string,
  period: "daily" | "weekly" | "monthly" = "daily",
): Array<{
  date: string;
  count: number;
  label: string;
}> {
  const supporters = getVotersByCandidate(candidateId);

  // Group by date
  const dailyTrends: Record<string, number> = {};
  supporters.forEach((voter) => {
    const date = voter.registrationDate || voter.createdAt.split("T")[0];
    dailyTrends[date] = (dailyTrends[date] || 0) + 1;
  });

  // Convert to array and sort by date
  const dailyData = Object.entries(dailyTrends)
    .map(([date, count]) => ({
      date,
      count,
      label: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (period === "daily") {
    return dailyData;
  }

  if (period === "weekly") {
    // Group by week
    const weeklyTrends: Record<string, number> = {};
    dailyData.forEach(({ date, count }) => {
      const dateObj = new Date(date);
      const weekStart = new Date(dateObj);
      weekStart.setDate(dateObj.getDate() - dateObj.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split("T")[0];

      weeklyTrends[weekKey] = (weeklyTrends[weekKey] || 0) + count;
    });

    return Object.entries(weeklyTrends)
      .map(([date, count]) => ({
        date,
        count,
        label: `Week of ${new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}`,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Monthly grouping
  const monthlyTrends: Record<string, number> = {};
  dailyData.forEach(({ date, count }) => {
    const dateObj = new Date(date);
    const monthKey = `${dateObj.getFullYear()}-${String(
      dateObj.getMonth() + 1,
    ).padStart(2, "0")}`;

    monthlyTrends[monthKey] = (monthlyTrends[monthKey] || 0) + count;
  });

  return Object.entries(monthlyTrends)
    .map(([date, count]) => ({
      date,
      count,
      label: new Date(date + "-01").toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Get survey analytics for a candidate - Aggregates survey responses from voters who completed the candidate's survey
export function getSurveyAnalytics(candidateId: string): {
  totalResponses: number;
  completionRate: number;
  questionBreakdown: Record<
    string,
    {
      questionId: string;
      questionText: string;
      responseCount: number;
      responses: Record<string, number>;
      topAnswer?: {
        label: string;
        count: number;
        percentage: number;
      };
    }
  >;
  survey: CandidateSurvey | null;
} {
  const supporters = getVotersByCandidate(candidateId);
  const survey = getSurveyByCandidateId(candidateId);

  if (!survey) {
    return {
      totalResponses: 0,
      completionRate: 0,
      questionBreakdown: {},
      survey: null,
    };
  }

  // Count voters who have survey answers
  const votersWithAnswers = supporters.filter(
    (voter) =>
      voter.surveyAnswers && Object.keys(voter.surveyAnswers).length > 0,
  );

  const totalResponses = votersWithAnswers.length;
  const completionRate =
    supporters.length > 0
      ? Math.round((totalResponses / supporters.length) * 100)
      : 0;

  // Aggregate responses by question
  const questionBreakdown: Record<
    string,
    {
      questionId: string;
      questionText: string;
      responseCount: number;
      responses: Record<string, number>;
      topAnswer?: {
        label: string;
        count: number;
        percentage: number;
      };
    }
  > = {};

  survey.questions.forEach((question) => {
    const responses: Record<string, number> = {};

    votersWithAnswers.forEach((voter) => {
      const answer = voter.surveyAnswers[question.id];
      if (answer) {
        if (Array.isArray(answer)) {
          // Multiple choice - count each selected option
          answer.forEach((option) => {
            if (!option.endsWith("_other_text")) {
              responses[option] = (responses[option] || 0) + 1;
            }
          });
        } else if (typeof answer === "string") {
          // Single choice or text
          if (!answer.endsWith("_other_text")) {
            responses[answer] = (responses[answer] || 0) + 1;
          }
        }
      }
    });

    // Find top answer
    let topAnswer:
      | { label: string; count: number; percentage: number }
      | undefined;
    const totalResponseCount = Object.values(responses).reduce(
      (sum, count) => sum + count,
      0,
    );

    if (totalResponseCount > 0) {
      const entries = Object.entries(responses);
      const topEntry = entries.reduce((max, [key, count]) =>
        count > max[1] ? [key, count] : max,
      );

      // Find the label for this option
      const option = question.options?.find((opt) => opt.id === topEntry[0]);
      const label = option?.label || topEntry[0];

      topAnswer = {
        label,
        count: topEntry[1],
        percentage: Math.round((topEntry[1] / totalResponseCount) * 100),
      };
    }

    questionBreakdown[question.id] = {
      questionId: question.id,
      questionText: question.question,
      responseCount: totalResponseCount,
      responses,
      topAnswer,
    };
  });

  return {
    totalResponses,
    completionRate,
    questionBreakdown,
    survey,
  };
}

// Get support strength metric - Calculates a support strength percentage based on various factors
// For now, uses survey completion rate as a proxy
export function getSupportStrength(candidateId: string): number {
  const supporters = getVotersByCandidate(candidateId);
  if (supporters.length === 0) return 0;

  const surveyAnalytics = getSurveyAnalytics(candidateId);
  const completionRate = surveyAnalytics.completionRate;

  // Support strength is based on engagement (survey completion)
  // In a real system, this might include other factors like:
  // - Recency of registration
  // - Activity levels
  // - Survey response quality
  // For demo, we'll use completion rate as the main metric
  return completionRate;
}

// Get comprehensive dashboard data for a candidate - Aggregates all key metrics in one call
export function getCandidateDashboardData(candidateId: string): {
  totalSupporters: number;
  wardCoverage: ReturnType<typeof getWardCoverage>;
  pollingUnitStats: ReturnType<typeof getPollingUnitStats>;
  demographics: ReturnType<typeof getDemographics>;
  registrationTrends: ReturnType<typeof getRegistrationTrends>;
  surveyAnalytics: ReturnType<typeof getSurveyAnalytics>;
  supportStrength: number;
} {
  return {
    totalSupporters: getSupportersCount(candidateId),
    wardCoverage: getWardCoverage(candidateId),
    pollingUnitStats: getPollingUnitStats(candidateId),
    demographics: getDemographics(candidateId),
    registrationTrends: getRegistrationTrends(candidateId, "daily"),
    surveyAnalytics: getSurveyAnalytics(candidateId),
    supportStrength: getSupportStrength(candidateId),
  };
}
