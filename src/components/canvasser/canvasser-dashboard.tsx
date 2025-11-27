"use client";

import {
  HiUsers,
  HiTrendingUp,
  HiLocationMarker,
  HiClipboardList,
  HiClock,
  HiCheckCircle,
  HiPlus,
} from "react-icons/hi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

// Mock data for demo
const mockStats = {
  totalVoters: 147,
  thisWeek: 23,
  thisMonth: 67,
  targetProgress: 73,
  targetTotal: 200,
  rank: 1,
  totalCanvassers: 15,
};

const mockRecentVoters = [
  {
    id: "1",
    name: "Aliyu Mohammed",
    ward: "Song Ward 1",
    time: "2 hours ago",
    verified: true,
  },
  {
    id: "2",
    name: "Hauwa Bello",
    ward: "Malabu Ward",
    time: "5 hours ago",
    verified: true,
  },
  {
    id: "3",
    name: "Ibrahim Tukur",
    ward: "Song Ward 2",
    time: "Yesterday",
    verified: false,
  },
  {
    id: "4",
    name: "Fatima Usman",
    ward: "Doubeli",
    time: "Yesterday",
    verified: true,
  },
  {
    id: "5",
    name: "Musa Ahmad",
    ward: "Jambutu",
    time: "2 days ago",
    verified: true,
  },
];

const mockWardCoverage = [
  { ward: "Song Ward 1", voters: 45, target: 50, percentage: 90 },
  { ward: "Malabu Ward", voters: 32, target: 50, percentage: 64 },
  { ward: "Song Ward 2", voters: 28, target: 50, percentage: 56 },
  { ward: "Doubeli", voters: 24, target: 50, percentage: 48 },
  { ward: "Jambutu", voters: 18, target: 50, percentage: 36 },
];

export function CanvasserDashboard() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Welcome back, Chioma! 👋
          </h1>
          <p className="text-muted-foreground">
            You&apos;re doing great! Keep up the momentum.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/canvasser/register">
            <HiPlus className="mr-2 h-5 w-5" />
            Register New Voter
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Voters</p>
                <p className="text-3xl font-bold">{mockStats.totalVoters}</p>
              </div>
              <div className="bg-primary/10 rounded-full p-3">
                <HiUsers className="text-primary h-6 w-6" />
              </div>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              +{mockStats.thisWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Monthly Target</p>
                <p className="text-3xl font-bold">
                  {mockStats.targetProgress}%
                </p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <HiTrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <Progress value={mockStats.targetProgress} className="mt-2" />
            <p className="text-muted-foreground mt-1 text-xs">
              {mockStats.totalVoters} / {mockStats.targetTotal} voters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Your Rank</p>
                <p className="text-3xl font-bold">#{mockStats.rank}</p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-3">
                <span className="text-2xl">🥇</span>
              </div>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              Out of {mockStats.totalCanvassers} canvassers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Wards Covered</p>
                <p className="text-3xl font-bold">5</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <HiLocationMarker className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              Song LGA, Adamawa State
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Registrations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <h3 className="font-semibold">Recent Registrations</h3>
              <p className="text-muted-foreground text-sm">
                Voters you&apos;ve registered
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/canvasser/voters">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockRecentVoters.map((voter) => (
                <div
                  key={voter.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                      <span className="text-sm font-medium">
                        {voter.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{voter.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {voter.ward}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <span className="text-muted-foreground text-xs">
                      {voter.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ward Coverage */}
        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold">Ward Coverage</h3>
            <p className="text-muted-foreground text-sm">
              Your progress by ward
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockWardCoverage.map((ward) => (
                <div key={ward.ward} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{ward.ward}</span>
                    <span className="text-muted-foreground">
                      {ward.voters}/{ward.target}
                    </span>
                  </div>
                  <Progress value={ward.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <h3 className="font-semibold">Quick Actions</h3>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              asChild
            >
              <Link href="/canvasser/register">
                <HiClipboardList className="h-6 w-6" />
                <span>Register Voter</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              asChild
            >
              <Link href="/canvasser/voters">
                <HiUsers className="h-6 w-6" />
                <span>View My Voters</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              disabled
            >
              <HiLocationMarker className="h-6 w-6" />
              <span>Ward Map</span>
              <Badge variant="secondary" className="text-[10px]">
                Coming Soon
              </Badge>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              disabled
            >
              <HiTrendingUp className="h-6 w-6" />
              <span>Leaderboard</span>
              <Badge variant="secondary" className="text-[10px]">
                Coming Soon
              </Badge>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
