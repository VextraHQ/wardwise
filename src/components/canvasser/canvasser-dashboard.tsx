"use client";

import { motion } from "motion/react";
import {
  HiUsers,
  HiTrendingUp,
  HiLocationMarker,
  HiClipboardList,
  HiClock,
  HiCheckCircle,
  HiPlus,
  HiCalendar,
  HiLightningBolt,
  HiArrowRight,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { CanvasserProfileCard } from "@/components/canvasser/canvasser-profile-header";
import { CanvasserStatCard } from "@/components/canvasser/canvasser-stat-card";

/**
 * TODO: [BACKEND] Dashboard API endpoints
 * - GET /api/canvassers/:code/dashboard - Aggregated dashboard data
 * - GET /api/canvassers/:code/recent-voters - Recent registrations
 * - GET /api/canvassers/:code/ward-coverage - Coverage by ward
 */

/**
 * TODO: [SYNC] Real-time updates
 * - WebSocket connection for live voter registration status
 * - Push notifications when voters complete candidate selection
 */

// Production mock data - matches Ahmadu Umaru Fintiri campaign
const mockCanvasserProfile = {
  name: "Chioma Okonkwo",
  phone: "08012345671",
  canvasserCode: "FINT-A001",
  candidateName: "Ahmadu Umaru Fintiri",
  candidateParty: "APC",
  candidatePosition: "Governor, Adamawa State",
  territory: {
    state: "Adamawa",
    lga: "Yola North",
    wards: ["Karewa Ward", "Doubeli Ward", "Jimeta Ward", "Alkalawa Ward"],
  },
  stats: {
    totalVoters: 147,
    registered: 139,
    incomplete: 8,
    completionRate: 95,
  },
};

const mockStats = {
  totalVoters: 147,
  todayRegistrations: 5,
  todayTarget: 10,
  thisWeek: 23,
  thisMonth: 67,
  targetProgress: 73,
  targetTotal: 200,
  rank: 1,
  totalCanvassers: 15,
  completionRate: 95,
  activeDays: 21,
};

const mockRecentVoters = [
  {
    id: "1",
    name: "Aliyu Mohammed",
    ward: "Karewa Ward",
    time: "2 hours ago",
    registered: true,
  },
  {
    id: "2",
    name: "Hauwa Bello",
    ward: "Doubeli Ward",
    time: "5 hours ago",
    registered: true,
  },
  {
    id: "3",
    name: "Ibrahim Tukur",
    ward: "Karewa Ward",
    time: "Yesterday",
    registered: false,
  },
  {
    id: "4",
    name: "Fatima Usman",
    ward: "Jimeta Ward",
    time: "Yesterday",
    registered: true,
  },
  {
    id: "5",
    name: "Musa Ahmad",
    ward: "Alkalawa Ward",
    time: "2 days ago",
    registered: true,
  },
];

const mockWardCoverage = [
  { ward: "Karewa Ward", voters: 45, target: 50, percentage: 90 },
  { ward: "Doubeli Ward", voters: 38, target: 50, percentage: 76 },
  { ward: "Jimeta Ward", voters: 36, target: 50, percentage: 72 },
  { ward: "Alkalawa Ward", voters: 28, target: 50, percentage: 56 },
];

interface CanvasserPanelProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function CanvasserPanel({ title, icon, children }: CanvasserPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="border-border/60 bg-card relative overflow-hidden border"
    >
      <div className="border-amber-500/40 absolute top-0 left-0 size-3 border-t border-l" />
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2">
          {icon && (
            <div className="bg-amber-500/5 text-amber-700 border-amber-500/30 flex size-7 items-center justify-center rounded-lg border sm:size-8">
              {icon}
            </div>
          )}
          <h3 className="text-foreground text-[11px] font-bold tracking-tight uppercase sm:text-xs">
            {title}
          </h3>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

export function CanvasserDashboard() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-4 sm:space-y-5 sm:py-6">
      {/* Profile Card */}
      <CanvasserProfileCard
        name={mockCanvasserProfile.name}
        phone={mockCanvasserProfile.phone}
        canvasserCode={mockCanvasserProfile.canvasserCode}
        candidateName={mockCanvasserProfile.candidateName}
        candidateParty={mockCanvasserProfile.candidateParty}
        candidatePosition={mockCanvasserProfile.candidatePosition}
        territory={mockCanvasserProfile.territory}
        stats={mockCanvasserProfile.stats}
      />

      {/* Quick Actions - More polished buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <Button
          asChild
          size="default"
          className="group h-12 gap-3 rounded-xl bg-amber-600 text-white transition-all hover:bg-amber-700"
        >
          <Link href="/canvasser/register">
            <div className="flex size-7 items-center justify-center rounded-lg bg-white/20">
              <HiPlus className="size-5" />
            </div>
            <span className="text-sm font-bold">
              Register New Voter
            </span>
            <HiArrowRight className="ml-auto size-4 opacity-60 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="default"
          className="group h-12 gap-3 rounded-xl border border-amber-500 transition-all hover:border-amber-500/50 hover:bg-amber-500/5"
        >
          <Link href="/canvasser/voters">
            <div className="bg-muted flex size-7 items-center justify-center rounded-lg">
              <HiUsers className="size-5 text-amber-600" />
            </div>
            <span className="text-sm font-bold">
              View All Voters
            </span>
            <HiArrowRight className="ml-auto size-4 opacity-40 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </motion.div>

      {/* Today's Performance Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="border-border/60 bg-card relative overflow-hidden border"
      >
        <div className="absolute top-0 left-0 size-3 border-t border-l border-amber-500" />
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/5 sm:size-8">
              <HiLightningBolt className="size-4 text-amber-600" />
            </div>
            <h3 className="text-foreground text-xs font-bold tracking-tight uppercase sm:text-sm">
              Today's Performance
            </h3>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-foreground text-3xl font-black sm:text-4xl">
                {mockStats.todayRegistrations}
                <span className="text-muted-foreground ml-1 text-base font-medium">
                  / {mockStats.todayTarget}
                </span>
              </p>
              <p className="text-muted-foreground mt-1 text-xs font-medium">
                Registrations today
              </p>
            </div>
            <div className="text-right">
              <Badge
                className={`h-6 px-2 text-xs font-bold ${
                  mockStats.todayRegistrations >= mockStats.todayTarget
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                }`}
              >
                {Math.round(
                  (mockStats.todayRegistrations / mockStats.todayTarget) * 100,
                )}
                % of target
              </Badge>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <Progress
              value={
                (mockStats.todayRegistrations / mockStats.todayTarget) * 100
              }
              className="h-2"
            />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <CanvasserStatCard
          label="Total Voters"
          value={mockStats.totalVoters}
          subValue={`+${mockStats.thisWeek} this week`}
          icon={<HiUsers className="size-5" />}
          delay={0}
        />
        <CanvasserStatCard
          label="Monthly Target"
          value={`${mockStats.targetProgress}%`}
          icon={<HiTrendingUp className="size-5" />}
          iconBgColor="bg-green-500/10"
          iconColor="text-green-600"
          progress={{
            current: mockStats.totalVoters,
            total: mockStats.targetTotal,
          }}
          delay={1}
        />
        <CanvasserStatCard
          label="Your Rank"
          value={`#${mockStats.rank}`}
          subValue={`Out of ${mockStats.totalCanvassers} canvassers`}
          icon={<span className="text-lg">🥇</span>}
          delay={2}
        />
        <CanvasserStatCard
          label="Active Days"
          value={mockStats.activeDays}
          subValue="Days with registrations"
          icon={<HiCalendar className="size-5" />}
          iconBgColor="bg-blue-500/10"
          iconColor="text-blue-600"
          delay={3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        {/* Recent Registrations */}
        <CanvasserPanel
          title="Recent Registrations"
          icon={<HiClipboardList className="size-4" />}
        >
          <div className="divide-border/40 -mx-4 -mb-4 divide-y">
            {mockRecentVoters.map((voter, index) => (
              <motion.div
                key={voter.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="hover:bg-muted/30 flex items-center justify-between gap-3 px-4 py-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    <span className="text-xs font-bold">
                      {voter.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-foreground truncate text-sm font-bold">
                      {voter.name}
                    </p>
                    <div className="text-muted-foreground flex items-center gap-1 text-[10px]">
                      <HiLocationMarker className="size-3" />
                      <span>{voter.ward}</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {voter.registered ? (
                    <Badge
                      variant="secondary"
                      className="h-5 gap-1 bg-green-100 px-1.5 text-[9px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    >
                      <HiCheckCircle className="size-2.5" />
                      Registered
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="h-5 gap-1 px-1.5 text-[9px] font-bold"
                    >
                      <HiClock className="size-2.5" />
                      Incomplete
                    </Badge>
                  )}
                  <span className="text-muted-foreground text-[10px]">
                    {voter.time}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="border-border/40 -mx-4 mt-3 -mb-4 border-t px-4 pt-3 pb-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-8 w-full gap-1.5 text-[10px] font-bold tracking-widest uppercase"
            >
              <Link href="/canvasser/voters">View All Voters</Link>
            </Button>
          </div>
        </CanvasserPanel>

        {/* Ward Coverage */}
        <CanvasserPanel
          title="Ward Coverage"
          icon={<HiLocationMarker className="size-4" />}
        >
          <div className="space-y-3">
            {mockWardCoverage.map((ward, index) => (
              <motion.div
                key={ward.ward}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + index * 0.05 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-bold">{ward.ward}</span>
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {ward.voters}/{ward.target}
                  </span>
                </div>
                <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                  <motion.div
                    className="h-full rounded-full bg-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${ward.percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </CanvasserPanel>
      </div>

      {/* Quick Actions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="border-border/60 bg-card relative overflow-hidden border"
      >
        <div className="absolute top-0 left-0 size-3 border-t border-l border-amber-500" />

        <div className="p-4 sm:p-5">
          <h3 className="text-foreground mb-3 text-xs font-bold tracking-tight uppercase sm:text-sm">
            Quick Actions
          </h3>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            <Link
              href="/canvasser/register"
              className="group border-border/60 bg-card flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:border-amber-500 hover:bg-amber-500/5 active:scale-[0.98]"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 transition-transform group-hover:scale-105">
                <HiClipboardList className="size-5 text-amber-600" />
              </div>
              <span className="text-foreground text-[10px] font-bold tracking-wide uppercase">
                Register Voter
              </span>
            </Link>
            <Link
              href="/canvasser/voters"
              className="group border-border/60 bg-card flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:border-blue-500/30 hover:bg-blue-500/5 active:scale-[0.98]"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 transition-transform group-hover:scale-105">
                <HiUsers className="size-5 text-blue-600" />
              </div>
              <span className="text-foreground text-[10px] font-bold tracking-wide uppercase">
                My Voters
              </span>
            </Link>
            <div className="border-border/40 bg-muted/30 flex flex-col items-center gap-2 rounded-xl border p-4 opacity-60">
              <div className="bg-muted flex size-10 items-center justify-center rounded-xl">
                <HiLocationMarker className="text-muted-foreground size-5" />
              </div>
              <span className="text-muted-foreground text-[10px] font-bold tracking-wide uppercase">
                Ward Map
              </span>
              <Badge
                variant="secondary"
                className="h-4 px-1.5 text-[7px] font-bold"
              >
                Soon
              </Badge>
            </div>
            <div className="border-border/40 bg-muted/30 flex flex-col items-center gap-2 rounded-xl border p-4 opacity-60">
              <div className="bg-muted flex size-10 items-center justify-center rounded-xl">
                <HiTrendingUp className="text-muted-foreground size-5" />
              </div>
              <span className="text-muted-foreground text-[10px] font-bold tracking-wide uppercase">
                Leaderboard
              </span>
              <Badge
                variant="secondary"
                className="h-4 px-1.5 text-[7px] font-bold"
              >
                Soon
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
