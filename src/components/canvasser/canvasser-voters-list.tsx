"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  HiArrowLeft,
  HiSearch,
  HiCheckCircle,
  HiClock,
  HiUser,
  HiLocationMarker,
  HiCalendar,
  HiFilter,
  HiUsers,
  HiPlus,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * TODO: [BACKEND] Voters list API
 * - GET /api/canvassers/:code/voters - Paginated list
 * - Query params: search, ward, status, page, limit
 * - Returns: voters[], total, hasMore
 */

/**
 * TODO: [FEATURE] Infinite scroll / pagination
 * - Use react-query for data fetching
 * - Implement cursor-based pagination
 * - Virtual scrolling for long lists
 */

/**
 * TODO: [SYNC] Real-time status updates
 * - WebSocket for verification status changes
 * - Update voter card badge in real-time
 */

// Mock data - Yola North LGA wards for Fintiri campaign
const mockVoters = [
  {
    id: "1",
    name: "Aliyu Mohammed",
    nin: "123****8901",
    phone: "0802 ***-**90",
    ward: "Karewa Ward",
    pollingUnit: "Unit 001",
    registeredAt: "2025-11-27T10:30:00Z",
    verified: true,
    completedCandidates: true,
  },
  {
    id: "2",
    name: "Hauwa Bello",
    nin: "987****2109",
    phone: "0803 ***-**45",
    ward: "Doubeli Ward",
    pollingUnit: "Unit 002",
    registeredAt: "2025-11-27T08:15:00Z",
    verified: true,
    completedCandidates: true,
  },
  {
    id: "3",
    name: "Ibrahim Tukur",
    nin: "112****4556",
    phone: "0805 ***-**12",
    ward: "Karewa Ward",
    pollingUnit: "Unit 004",
    registeredAt: "2025-11-26T14:20:00Z",
    verified: false,
    completedCandidates: false,
  },
  {
    id: "4",
    name: "Fatima Usman",
    nin: "445****7889",
    phone: "0806 ***-**78",
    ward: "Jimeta Ward",
    pollingUnit: "Unit 006",
    registeredAt: "2025-11-26T11:45:00Z",
    verified: true,
    completedCandidates: true,
  },
  {
    id: "5",
    name: "Musa Ahmad Tukur",
    nin: "223****5667",
    phone: "0807 ***-**34",
    ward: "Alkalawa Ward",
    pollingUnit: "Unit 003",
    registeredAt: "2025-11-25T16:30:00Z",
    verified: true,
    completedCandidates: false,
  },
  {
    id: "6",
    name: "Aisha Mohammed",
    nin: "334****6778",
    phone: "0808 ***-**56",
    ward: "Karewa Ward",
    pollingUnit: "Unit 001",
    registeredAt: "2025-11-25T09:00:00Z",
    verified: true,
    completedCandidates: true,
  },
  {
    id: "7",
    name: "Yusuf Ibrahim",
    nin: "550****2334",
    phone: "0809 ***-**67",
    ward: "Doubeli Ward",
    pollingUnit: "Unit 007",
    registeredAt: "2025-11-24T13:15:00Z",
    verified: true,
    completedCandidates: true,
  },
  {
    id: "8",
    name: "Zainab Ahmad",
    nin: "550****7889",
    phone: "0810 ***-**89",
    ward: "Jimeta Ward",
    pollingUnit: "Unit 012",
    registeredAt: "2025-11-24T10:00:00Z",
    verified: true,
    completedCandidates: true,
  },
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} min ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function VoterCardSkeleton() {
  return (
    <div className="border-border/60 bg-card relative overflow-hidden border">
      <div className="absolute top-0 left-0 size-2.5 border-t border-l border-amber-500/20" />
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </div>
  );
}

export function CanvasserVotersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [wardFilter, setWardFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading] = useState(false);

  const filteredVoters = mockVoters.filter((voter) => {
    const matchesSearch =
      voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.nin.includes(searchTerm) ||
      voter.phone.includes(searchTerm);
    const matchesWard = wardFilter === "all" || voter.ward === wardFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && voter.verified) ||
      (statusFilter === "pending" && !voter.verified) ||
      (statusFilter === "complete" && voter.completedCandidates) ||
      (statusFilter === "incomplete" && !voter.completedCandidates);

    return matchesSearch && matchesWard && matchesStatus;
  });

  const uniqueWards = [...new Set(mockVoters.map((v) => v.ward))];
  const verifiedCount = mockVoters.filter((v) => v.verified).length;
  const completedCount = mockVoters.filter((v) => v.completedCandidates).length;
  const pendingCount = mockVoters.filter((v) => !v.verified).length;

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-4 sm:space-y-5 sm:py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-border/60 bg-card relative overflow-hidden border"
      >
        <div className="absolute top-0 left-0 size-4 border-t border-l border-amber-500" />
        <div className="absolute top-0 right-0 size-4 border-t border-r border-amber-500" />
        <div className="h-0.5 w-full bg-amber-500/30" />

        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="size-8 shrink-0"
              >
                <Link href="/canvasser">
                  <HiArrowLeft className="size-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-foreground text-lg font-bold sm:text-xl">
                  My Voters
                </h1>
                <div className="text-muted-foreground flex items-center gap-1.5">
                  <div className="size-1.5 rounded-[1px] bg-amber-500/60" />
                  <p className="font-mono text-[9px] font-medium tracking-widest uppercase sm:text-[10px]">
                    <span className="text-foreground font-bold">
                      {mockVoters.length}
                    </span>{" "}
                    Voters Registered
                  </p>
                </div>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              className="h-9 gap-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase"
            >
              <Link href="/canvasser/register">
                <HiPlus className="size-4" />
                Register New
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="border-border/60 bg-card relative overflow-hidden border"
      >
        <div className="absolute top-0 left-0 size-3 border-t border-l border-amber-500" />

        <div className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <HiSearch className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search by name, NIN, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 rounded-lg pl-9 text-sm"
              />
            </div>

            {/* Ward Filter */}
            <Select value={wardFilter} onValueChange={setWardFilter}>
              <SelectTrigger className="h-10 w-full rounded-lg sm:w-[160px]">
                <HiFilter className="mr-2 size-4" />
                <SelectValue placeholder="Ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                {uniqueWards.map((ward) => (
                  <SelectItem key={ward} value={ward}>
                    {ward}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-full rounded-lg sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="complete">Candidates Selected</SelectItem>
                <SelectItem value="incomplete">Awaiting Selection</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-border/60 divide-border/40 grid grid-cols-4 divide-x rounded-lg border"
      >
        <div className="bg-card p-3 text-center">
          <p className="text-foreground text-lg font-black sm:text-xl">
            {mockVoters.length}
          </p>
          <p className="text-muted-foreground text-[8px] font-bold tracking-widest uppercase sm:text-[9px]">
            Total
          </p>
        </div>
        <div className="bg-card p-3 text-center">
          <p className="text-lg font-black text-green-600 sm:text-xl">
            {verifiedCount}
          </p>
          <p className="text-muted-foreground text-[8px] font-bold tracking-widest uppercase sm:text-[9px]">
            Verified
          </p>
        </div>
        <div className="bg-card p-3 text-center">
          <p className="text-lg font-black text-blue-600 sm:text-xl">
            {completedCount}
          </p>
          <p className="text-muted-foreground text-[8px] font-bold tracking-widest uppercase sm:text-[9px]">
            Selected
          </p>
        </div>
        <div className="bg-card p-3 text-center">
          <p className="text-lg font-black text-amber-600 sm:text-xl">
            {pendingCount}
          </p>
          <p className="text-muted-foreground text-[8px] font-bold tracking-widest uppercase sm:text-[9px]">
            Pending
          </p>
        </div>
      </motion.div>

      {/* Voters List */}
      <div className="space-y-2 sm:space-y-3">
        {isLoading ? (
          // Loading skeletons
          [...Array(5)].map((_, i) => <VoterCardSkeleton key={i} />)
        ) : filteredVoters.length === 0 ? (
          // Empty state
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-border/60 bg-card relative overflow-hidden border py-12 text-center"
          >
            <div className="absolute top-0 left-0 size-3 border-t border-l border-amber-500/20" />
            <div className="bg-muted/50 mx-auto mb-4 flex size-14 items-center justify-center rounded-xl">
              <HiUser className="text-muted-foreground size-7" />
            </div>
            <p className="text-foreground font-bold">No voters found</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {searchTerm || wardFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "You haven't registered any voters yet"}
            </p>
            {!searchTerm && wardFilter === "all" && statusFilter === "all" && (
              <Button asChild size="sm" className="mt-4">
                <Link href="/canvasser/register">
                  Register Your First Voter
                </Link>
              </Button>
            )}
          </motion.div>
        ) : (
          // Voters list
          <AnimatePresence mode="popLayout">
            {filteredVoters.map((voter, index) => (
              <motion.div
                key={voter.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
                layout
                className="border-border/60 bg-card group relative overflow-hidden border transition-colors hover:border-amber-500"
              >
                {/* Architectural marker */}
                <div className="absolute top-0 left-0 size-2.5 border-t border-l border-amber-500/20 transition-colors group-hover:border-amber-500/40" />

                <div className="p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left: Avatar + Info */}
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 sm:size-11 dark:text-amber-400">
                        <span className="text-xs font-bold sm:text-sm">
                          {getInitials(voter.name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-bold sm:text-base">
                          {voter.name}
                        </p>
                        <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] sm:text-xs">
                          <span className="font-mono">NIN: {voter.nin}</span>
                          <span className="text-border hidden sm:inline">
                            •
                          </span>
                          <span className="hidden sm:inline">
                            {voter.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Location + Status + Date */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {/* Location */}
                      <div className="text-muted-foreground flex items-center gap-1 text-[10px] sm:text-xs">
                        <HiLocationMarker className="size-3" />
                        <span className="max-w-[100px] truncate sm:max-w-none">
                          {voter.ward}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="text-muted-foreground flex items-center gap-1 text-[10px] sm:text-xs">
                        <HiCalendar className="size-3" />
                        <span>{formatDate(voter.registeredAt)}</span>
                      </div>

                      {/* Status badges */}
                      <div className="flex gap-1.5">
                        {voter.verified ? (
                          <Badge
                            variant="secondary"
                            className="h-5 gap-1 bg-green-100 px-1.5 text-[9px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          >
                            <HiCheckCircle className="size-2.5" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="h-5 gap-1 border-amber-300 bg-amber-50 px-1.5 text-[9px] font-bold text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                          >
                            <HiClock className="size-2.5" />
                            Pending
                          </Badge>
                        )}
                        {voter.completedCandidates ? (
                          <Badge
                            variant="secondary"
                            className="hidden h-5 px-1.5 text-[9px] font-bold sm:flex"
                          >
                            <HiUsers className="mr-1 size-2.5" />
                            Selected
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="hidden h-5 px-1.5 text-[9px] font-bold sm:flex"
                          >
                            Awaiting
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Load More (for future pagination) */}
      {filteredVoters.length > 0 && filteredVoters.length >= 8 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Button
            variant="outline"
            className="h-10 gap-2 rounded-lg text-[10px] font-bold tracking-widest uppercase"
            disabled
          >
            Load More
            <Badge variant="secondary" className="h-4 px-1 text-[8px]">
              Coming Soon
            </Badge>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
