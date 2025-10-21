"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Shield, Plus } from "lucide-react";
import { toast } from "sonner";

interface Candidate {
  id: string;
  name: string;
  party: string;
  position: string;
  constituency: string;
  description: string;
  supporters: number;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
  };
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    email: "",
    party: "",
    position: "",
    constituency: "",
    description: "",
  });

  // Fetch candidates from API
  const {
    data: candidatesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["candidates"],
    queryFn: async () => {
      const response = await fetch("/api/admin/candidates");
      if (!response.ok) throw new Error("Failed to fetch candidates");
      return response.json();
    },
  });

  // Create candidate mutation
  const createCandidateMutation = useMutation({
    mutationFn: async (candidateData: typeof newCandidate) => {
      const response = await fetch("/api/admin/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candidateData),
      });
      if (!response.ok) throw new Error("Failed to create candidate");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Candidate account created successfully!");
      setNewCandidate({
        name: "",
        email: "",
        party: "",
        position: "",
        constituency: "",
        description: "",
      });
    },
    onError: () => {
      toast.error("Failed to create candidate account");
    },
  });

  const candidates: Candidate[] = candidatesData?.candidates || [];

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    createCandidateMutation.mutate(newCandidate);
  };

  const handleSuspendCandidate = async (candidateId: string) => {
    try {
      // In real app, call API to suspend candidate
      toast.success("Candidate account suspended");
    } catch (error) {
      console.error("Failed to suspend candidate", error);
      toast.error("Failed to suspend candidate");
    }
  };

  // Check if user is admin
  if (session?.user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Access Denied
            </CardTitle>
            <CardDescription className="text-center">
              This page is only accessible to administrators.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading candidates...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error</CardTitle>
            <CardDescription className="text-center">
              Failed to load candidates data.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Manage candidate accounts and system settings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="font-medium">Admin Access</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Candidates
              </CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{candidates.length}</div>
              <p className="text-muted-foreground text-xs">Active candidates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Supporters
              </CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {candidates
                  .reduce((sum, c) => sum + c.supporters, 0)
                  .toLocaleString()}
              </div>
              <p className="text-muted-foreground text-xs">
                Across all candidates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Database Status
              </CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Connected</div>
              <p className="text-muted-foreground text-xs">Real-time data</p>
            </CardContent>
          </Card>
        </div>

        {/* Create New Candidate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Candidate Account
            </CardTitle>
            <CardDescription>
              Add a new candidate to the WardWise platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCandidate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Candidate Name</Label>
                  <Input
                    id="name"
                    placeholder="Hon. John Doe"
                    value={newCandidate.name}
                    onChange={(e) =>
                      setNewCandidate({ ...newCandidate, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@wardwise.ng"
                    value={newCandidate.email}
                    onChange={(e) =>
                      setNewCandidate({
                        ...newCandidate,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="party">Political Party</Label>
                  <Input
                    id="party"
                    placeholder="APC, PDP, LP..."
                    value={newCandidate.party}
                    onChange={(e) =>
                      setNewCandidate({
                        ...newCandidate,
                        party: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    placeholder="House of Representatives"
                    value={newCandidate.position}
                    onChange={(e) =>
                      setNewCandidate({
                        ...newCandidate,
                        position: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="constituency">Constituency</Label>
                <Input
                  id="constituency"
                  placeholder="Song & Fufore Federal Constituency"
                  value={newCandidate.constituency}
                  onChange={(e) =>
                    setNewCandidate({
                      ...newCandidate,
                      constituency: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Brief description of the candidate"
                  value={newCandidate.description}
                  onChange={(e) =>
                    setNewCandidate({
                      ...newCandidate,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <Button
                type="submit"
                disabled={createCandidateMutation.isPending}
                className="w-full"
              >
                {createCandidateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Candidate Account
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Candidates List */}
        <Card>
          <CardHeader>
            <CardTitle>Candidate Accounts</CardTitle>
            <CardDescription>
              Manage existing candidate accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{candidate.name}</h3>
                      <Badge variant="default">{candidate.party}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {candidate.user.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      {candidate.position} •{" "}
                      {candidate.supporters.toLocaleString()} supporters
                    </p>
                    <p className="text-xs text-gray-400">
                      Created:{" "}
                      {new Date(candidate.user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleSuspendCandidate(candidate.id)}
                    >
                      Suspend
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
