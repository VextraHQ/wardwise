"use client";

import { motion } from "motion/react";
import {
  HiClipboardList,
  HiClock,
  HiCheckCircle,
  HiChevronRight,
} from "react-icons/hi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * TODO: [BACKEND] Surveys API
 * - GET /api/voters/:nin/surveys - list voter's surveys
 * - GET /api/surveys/:id - get survey details and questions
 * - POST /api/surveys/:id/responses - submit survey responses
 */

/**
 * TODO: [SYNC] Candidate Dashboard Integration
 * - Surveys created on candidate dashboard appear here
 * - When candidate creates survey, eligible voters see it
 * - Filter by candidate's position/ward match
 */

/**
 * TODO: [FEATURE] Survey completion flow
 * - Open survey in modal or new page
 * - Save progress for incomplete surveys
 * - Prevent duplicate submissions
 * - Handle survey expiry
 */

interface Survey {
  id: string;
  title: string;
  candidate: string;
  candidateId: string; // For linking to candidate profile
  position: string;
  questions: number;
  estimatedTime: string;
  status: "pending" | "completed";
  dueDate?: string;
  completedDate?: string;
}

// Mock survey data - in production this would come from API
const surveys: Survey[] = [
  {
    id: "1",
    title: "Ward Development Priorities",
    candidate: "Hon. Aliyu Wakili Boya",
    candidateId: "cand-001",
    position: "House of Representatives",
    questions: 8,
    estimatedTime: "3 min",
    status: "pending",
    dueDate: "Jan 15, 2026",
  },
  {
    id: "2",
    title: "Infrastructure Feedback",
    candidate: "Senator Aishatu Dahiru Ahmed",
    candidateId: "cand-002",
    position: "Governor",
    questions: 5,
    estimatedTime: "2 min",
    status: "pending",
    dueDate: "Jan 20, 2026",
  },
  {
    id: "3",
    title: "Election Day Experience",
    candidate: "Campaign Office",
    candidateId: "system",
    position: "General",
    questions: 6,
    estimatedTime: "2 min",
    status: "completed",
    completedDate: "Dec 28, 2025",
  },
];

export function SurveysTab() {
  const pendingSurveys = surveys.filter((s) => s.status === "pending");
  const completedSurveys = surveys.filter((s) => s.status === "completed");

  /**
   * TODO: [FEATURE] Start survey handler
   * - Navigate to survey completion page/modal
   * - Track survey start time for analytics
   * - Check if survey is still valid (not expired)
   */
  const handleStartSurvey = (surveyId: string) => {
    console.log("Starting survey:", surveyId);
    // In production: navigate to survey page
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Pending Surveys */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div>
          <h3 className="text-foreground text-sm font-bold tracking-tight uppercase sm:text-base">
            Pending Surveys
          </h3>
          <div className="flex items-center gap-1.5">
            <div className="bg-primary/60 size-1.5 rounded-[1px]" />
            <p className="text-muted-foreground font-mono text-xs font-medium tracking-widest uppercase sm:text-xs">
              Action Required <span className="text-primary/40 mx-0.5">|</span>{" "}
              <span className="text-foreground font-bold">
                {pendingSurveys.length} Available
              </span>
            </p>
          </div>
        </div>

        {pendingSurveys.length > 0 ? (
          <div className="space-y-3">
            {pendingSurveys.map((survey, index) => (
              <motion.div
                key={survey.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-border/60 bg-card hover:border-primary/30 relative overflow-hidden border transition-colors"
              >
                <div className="border-primary/30 absolute top-0 left-0 size-3 border-t border-l" />

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Badge
                        variant="outline"
                        className="bg-muted/30 mb-2 h-5 px-1.5 text-[10px] font-bold tracking-wider uppercase"
                      >
                        {survey.position}
                      </Badge>
                      <h4 className="text-foreground text-sm font-bold">
                        {survey.title}
                      </h4>
                      <p className="text-muted-foreground mt-0.5 text-sm">
                        From: {survey.candidate}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStartSurvey(survey.id)}
                      className="h-8 gap-1 rounded-lg px-3 text-[10px] font-bold tracking-widest uppercase"
                    >
                      Start
                      <HiChevronRight className="size-3" />
                    </Button>
                  </div>

                  <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-1">
                      <HiClipboardList className="size-3" />
                      <span className="text-xs">
                        {survey.questions} questions
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HiClock className="size-3" />
                      <span className="text-xs">{survey.estimatedTime}</span>
                    </div>
                    {survey.dueDate && (
                      <div className="ml-auto text-xs font-medium">
                        Due: {survey.dueDate}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-border/60 bg-card flex flex-col items-center justify-center border p-8 text-center"
          >
            <div className="bg-muted/50 mb-3 flex size-12 items-center justify-center rounded-xl">
              <HiClipboardList className="text-muted-foreground size-6" />
            </div>
            <p className="text-foreground text-sm font-medium">
              No pending surveys
            </p>
            <p className="text-muted-foreground mt-1 max-w-[200px] text-xs">
              Check back later for new surveys from your candidates.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Completed Surveys */}
      {completedSurveys.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <h3 className="text-muted-foreground text-xs font-bold tracking-tight uppercase">
            Completed ({completedSurveys.length})
          </h3>

          <div className="space-y-2">
            {completedSurveys.map((survey) => (
              <div
                key={survey.id}
                className="border-border/60 bg-muted/20 flex items-center justify-between gap-3 border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <HiCheckCircle className="size-4" />
                  </div>
                  <div>
                    <p className="text-foreground text-xs font-bold">
                      {survey.title}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {survey.completedDate}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="h-5 gap-1 px-1.5 text-xs font-bold"
                >
                  <HiCheckCircle className="size-2.5" />
                  Done
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
