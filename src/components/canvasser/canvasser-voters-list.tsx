"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HiArrowLeft,
  HiSearch,
  HiFilter,
  HiCheckCircle,
  HiClock,
  HiUser,
  HiLocationMarker,
  HiCalendar,
} from "react-icons/hi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

// Mock data
const mockVoters = [
  {
    id: "1",
    name: "Aliyu Mohammed",
    nin: "123****8901",
    ward: "Song Ward 1",
    pollingUnit: "Unit 001",
    registeredAt: "2025-11-27T10:30:00Z",
    verified: true,
    completedCandidates: true,
  },
  {
    id: "2",
    name: "Hauwa Bello",
    nin: "987****2109",
    ward: "Malabu Ward",
    pollingUnit: "Unit 002",
    registeredAt: "2025-11-27T08:15:00Z",
    verified: true,
    completedCandidates: true,
  },
  {
    id: "3",
    name: "Ibrahim Tukur",
    nin: "112****4556",
    ward: "Song Ward 2",
    pollingUnit: "Unit 004",
    registeredAt: "2025-11-26T14:20:00Z",
    verified: false,
    completedCandidates: false,
  },
  {
    id: "4",
    name: "Fatima Usman",
    nin: "445****7889",
    ward: "Doubeli",
    pollingUnit: "Unit 006",
    registeredAt: "2025-11-26T11:45:00Z",
    verified: true,
    completedCandidates: true,
  },
  {
    id: "5",
    name: "Musa Ahmad Tukur",
    nin: "223****5667",
    ward: "Jambutu",
    pollingUnit: "Unit 003",
    registeredAt: "2025-11-25T16:30:00Z",
    verified: true,
    completedCandidates: false,
  },
  {
    id: "6",
    name: "Aisha Mohammed",
    nin: "334****6778",
    ward: "Song Ward 1",
    pollingUnit: "Unit 001",
    registeredAt: "2025-11-25T09:00:00Z",
    verified: true,
    completedCandidates: true,
  },
  {
    id: "7",
    name: "Yusuf Ibrahim",
    nin: "550****2334",
    ward: "Doubeli",
    pollingUnit: "Unit 007",
    registeredAt: "2025-11-24T13:15:00Z",
    verified: true,
    completedCandidates: true,
  },
  {
    id: "8",
    name: "Zainab Ahmad",
    nin: "550****7889",
    ward: "Malabu Ward",
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
      return `${diffMins} minutes ago`;
    }
    return `${diffHours} hours ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function CanvasserVotersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [wardFilter, setWardFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredVoters = mockVoters.filter((voter) => {
    const matchesSearch =
      voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.nin.includes(searchTerm);
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

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/canvasser">
              <HiArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">My Voters</h1>
            <p className="text-muted-foreground text-sm">
              {mockVoters.length} voters registered
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/canvasser/register">Register New Voter</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <HiSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search by name or NIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={wardFilter} onValueChange={setWardFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <HiFilter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by ward" />
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="complete">Completed Selection</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Voters List */}
      <div className="space-y-3">
        {filteredVoters.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <HiUser className="text-muted-foreground mx-auto h-12 w-12" />
              <p className="text-muted-foreground mt-4">No voters found</p>
            </CardContent>
          </Card>
        ) : (
          filteredVoters.map((voter) => (
            <Card key={voter.id}>
              <CardContent className="py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                      <span className="font-medium">
                        {voter.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{voter.name}</p>
                      <p className="text-muted-foreground font-mono text-sm">
                        NIN: {voter.nin}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1 text-sm">
                      <HiLocationMarker className="text-muted-foreground h-4 w-4" />
                      <span className="text-muted-foreground">
                        {voter.ward}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <HiCalendar className="text-muted-foreground h-4 w-4" />
                      <span className="text-muted-foreground">
                        {formatDate(voter.registeredAt)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {voter.verified ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-500/10 text-green-600"
                        >
                          <HiCheckCircle className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <HiClock className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                      {voter.completedCandidates ? (
                        <Badge variant="secondary">Candidates Selected</Badge>
                      ) : (
                        <Badge variant="outline">Awaiting Selection</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap justify-center gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">{mockVoters.length}</p>
              <p className="text-muted-foreground text-sm">Total Registered</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {mockVoters.filter((v) => v.verified).length}
              </p>
              <p className="text-muted-foreground text-sm">Verified</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {mockVoters.filter((v) => v.completedCandidates).length}
              </p>
              <p className="text-muted-foreground text-sm">
                Completed Selection
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {mockVoters.filter((v) => !v.completedCandidates).length}
              </p>
              <p className="text-muted-foreground text-sm">
                Awaiting Selection
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
