"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HiOutlineUserGroup,
  HiOutlineUserAdd,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineSearch,
  HiOutlineUsers,
  HiOutlineUserCircle,
} from "react-icons/hi";
import { toast } from "sonner";
import type { Candidate } from "@/types/candidate";
import { adminApi, type CandidateWithUser } from "@/lib/api/admin";
import {
  StatCardSkeleton,
  CandidateCardSkeleton,
  VoterCardSkeleton,
} from "@/components/admin/admin-skeletons";

const POSITIONS: Candidate["position"][] = [
  "Governor",
  "Senator",
  "House of Representatives",
  "State Assembly",
];

export function AdminDashboard() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive activeTab from URL params, default to "candidates"
  const tabParam = searchParams?.get("tab");
  const activeTab =
    tabParam === "candidates" || tabParam === "voters"
      ? tabParam
      : "candidates";
  const [searchQuery, setSearchQuery] = useState("");

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setSearchQuery(""); // Clear search when switching tabs
    // Update URL with tab parameter
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value === "candidates") {
      params.set("tab", "candidates");
    } else if (value === "voters") {
      params.set("tab", "voters");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] =
    useState<CandidateWithUser | null>(null);
  const [deletingCandidateId, setDeletingCandidateId] = useState<string | null>(
    null,
  );
  const [deletingVoterId, setDeletingVoterId] = useState<string | null>(null);
  const [newCandidate, setNewCandidate] = useState<{
    name: string;
    email: string;
    party: string;
    position: Candidate["position"] | "";
    constituency: string;
    description: string;
  }>({
    name: "",
    email: "",
    party: "",
    position: "",
    constituency: "",
    description: "",
  });

  // Fetch candidates - optimized for non-real-time data
  const {
    data: candidates = [],
    isLoading: isLoadingCandidates,
    error: candidatesError,
  } = useQuery({
    queryKey: ["admin", "candidates"],
    queryFn: () => adminApi.candidates.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes - data doesn't change frequently
    refetchOnWindowFocus: false, // Don't refetch on window focus for admin data
    refetchOnMount: false, // Use cached data if available
  });

  // Fetch voters - only when tab is active
  const { data: votersData, isLoading: isLoadingVoters } = useQuery({
    queryKey: ["admin", "voters"],
    queryFn: () => adminApi.voters.getAll({ limit: 100 }),
    enabled: activeTab === "voters",
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Filtered candidates based on search
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidates;
    const query = searchQuery.toLowerCase();
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.party.toLowerCase().includes(query) ||
        c.constituency.toLowerCase().includes(query) ||
        c.user.email.toLowerCase().includes(query),
    );
  }, [candidates, searchQuery]);

  // Filtered voters based on search
  const filteredVoters = useMemo(() => {
    if (!searchQuery.trim()) return votersData?.voters || [];
    const query = searchQuery.toLowerCase();
    return (votersData?.voters || []).filter(
      (v) =>
        `${v.firstName} ${v.lastName}`.toLowerCase().includes(query) ||
        v.nin.toLowerCase().includes(query) ||
        v.email?.toLowerCase().includes(query) ||
        v.state.toLowerCase().includes(query) ||
        v.lga.toLowerCase().includes(query),
    );
  }, [votersData?.voters, searchQuery]);

  // Create candidate mutation
  const createCandidateMutation = useMutation({
    mutationFn: (data: typeof newCandidate) =>
      adminApi.candidates.create({
        ...data,
        position: data.position as Candidate["position"],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "candidates"] });
      toast.success("Candidate created successfully!");
      setNewCandidate({
        name: "",
        email: "",
        party: "",
        position: "",
        constituency: "",
        description: "",
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create candidate");
    },
  });

  // Update candidate mutation
  const updateCandidateMutation = useMutation({
    mutationFn: (data: Parameters<typeof adminApi.candidates.update>[0]) =>
      adminApi.candidates.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "candidates"] });
      toast.success("Candidate updated successfully!");
      setEditingCandidate(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update candidate");
    },
  });

  // Delete candidate mutation
  const deleteCandidateMutation = useMutation({
    mutationFn: (id: string) => adminApi.candidates.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "candidates"] });
      toast.success("Candidate deleted successfully!");
      setDeletingCandidateId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete candidate");
    },
  });

  // Delete voter mutation
  const deleteVoterMutation = useMutation({
    mutationFn: (id: string) => adminApi.voters.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "voters"] });
      toast.success("Voter deleted successfully!");
      setDeletingVoterId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete voter");
    },
  });

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidate.position) {
      toast.error("Please select a position");
      return;
    }
    createCandidateMutation.mutate(newCandidate);
  };

  const handleUpdateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;
    updateCandidateMutation.mutate({
      id: editingCandidate.id,
      name: editingCandidate.name,
      email: editingCandidate.user.email,
      party: editingCandidate.party,
      position: editingCandidate.position,
      constituency: editingCandidate.constituency,
      description: editingCandidate.description,
    });
  };

  const totalSupporters = candidates.reduce((sum, c) => sum + c.supporters, 0);

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-3 lg:px-6">
            {isLoadingCandidates ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <Card className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-muted-foreground text-sm font-medium">
                      Total Candidates
                    </CardTitle>
                    <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
                      <HiOutlineUserGroup className="text-primary h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-foreground text-2xl font-semibold">
                      {candidates.length}
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Active candidate accounts
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-muted-foreground text-sm font-medium">
                      Total Supporters
                    </CardTitle>
                    <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
                      <HiOutlineUsers className="text-primary h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-foreground text-2xl font-semibold">
                      {totalSupporters.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Across all candidates
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-muted-foreground text-sm font-medium">
                      Total Voters
                    </CardTitle>
                    <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
                      <HiOutlineUserCircle className="text-primary h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-foreground text-2xl font-semibold">
                      {activeTab === "voters" && isLoadingVoters ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        votersData?.total.toLocaleString() || "0"
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Registered voters
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Tabs Section */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="flex flex-1 flex-col"
          >
            {/* Search and Actions Bar */}
            <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
              <TabsList className="border-border/50 bg-muted/50">
                <TabsTrigger
                  value="candidates"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <HiOutlineUserGroup className="mr-2 h-4 w-4" />
                  Candidates
                  {candidates.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-primary/20 text-primary ml-2"
                    >
                      {candidates.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="voters"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <HiOutlineUserCircle className="mr-2 h-4 w-4" />
                  Voters
                  {votersData && votersData.total > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-primary/20 text-primary ml-2"
                    >
                      {votersData.total}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-1 items-center gap-2 sm:justify-end">
                {/* Search Bar */}
                <div className="relative flex-1 sm:w-64">
                  <HiOutlineSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-border/50 pl-9"
                  />
                </div>

                {/* Create Button - Only show for candidates tab */}
                {activeTab === "candidates" && (
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="gap-2"
                  >
                    <HiOutlineUserAdd className="h-4 w-4" />
                    <span className="hidden sm:inline">Create Candidate</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Candidates Tab */}
            <TabsContent
              value="candidates"
              className="flex-1 space-y-4 px-4 lg:px-6"
            >
              <Card className="border-border/50 flex-1">
                <CardHeader>
                  <CardTitle>Candidate Accounts</CardTitle>
                  <CardDescription>
                    {filteredCandidates.length === candidates.length
                      ? `Manage ${candidates.length} candidate account${candidates.length !== 1 ? "s" : ""}`
                      : `Showing ${filteredCandidates.length} of ${candidates.length} candidates`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingCandidates ? (
                    <div className="space-y-4">
                      <CandidateCardSkeleton />
                      <CandidateCardSkeleton />
                      <CandidateCardSkeleton />
                    </div>
                  ) : candidatesError ? (
                    <div className="py-12 text-center">
                      <HiOutlineXCircle className="text-destructive mx-auto mb-3 h-12 w-12" />
                      <p className="text-muted-foreground mb-1 font-medium">
                        Failed to load candidates
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Please try refreshing the page
                      </p>
                    </div>
                  ) : filteredCandidates.length === 0 ? (
                    <div className="py-12 text-center">
                      <HiOutlineUserGroup className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                      <p className="text-muted-foreground mb-1 font-medium">
                        {searchQuery
                          ? "No candidates match your search"
                          : "No candidates found"}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {searchQuery
                          ? "Try adjusting your search terms"
                          : "Create your first candidate using the button above"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredCandidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="border-border/50 hover:border-primary/30 flex flex-col gap-4 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-foreground font-medium">
                                {candidate.name}
                              </h3>
                              <Badge
                                variant="default"
                                className="bg-primary/10 text-primary"
                              >
                                {candidate.party}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="border-border/50"
                              >
                                {candidate.position}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm">
                              {candidate.user.email}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {candidate.constituency} •{" "}
                              <span className="text-foreground font-medium">
                                {candidate.supporters.toLocaleString()}
                              </span>{" "}
                              supporters
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Created{" "}
                              {new Date(
                                candidate.user.createdAt,
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="flex gap-2 sm:shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingCandidate(candidate)}
                              disabled={
                                updateCandidateMutation.isPending ||
                                deleteCandidateMutation.isPending
                              }
                              className="border-border/50"
                            >
                              <HiOutlinePencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setDeletingCandidateId(candidate.id)
                              }
                              disabled={
                                updateCandidateMutation.isPending ||
                                deleteCandidateMutation.isPending
                              }
                            >
                              <HiOutlineTrash className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Voters Tab */}
            <TabsContent
              value="voters"
              className="flex-1 space-y-4 px-4 lg:px-6"
            >
              <Card className="border-border/50 flex-1">
                <CardHeader>
                  <CardTitle>Registered Voters</CardTitle>
                  <CardDescription>
                    {filteredVoters.length === (votersData?.voters.length || 0)
                      ? `View and manage ${votersData?.total || 0} registered voter${(votersData?.total || 0) !== 1 ? "s" : ""}`
                      : `Showing ${filteredVoters.length} of ${votersData?.voters.length || 0} voters`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingVoters ? (
                    <div className="space-y-4">
                      <VoterCardSkeleton />
                      <VoterCardSkeleton />
                      <VoterCardSkeleton />
                    </div>
                  ) : filteredVoters.length === 0 ? (
                    <div className="py-12 text-center">
                      <HiOutlineUserCircle className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                      <p className="text-muted-foreground mb-1 font-medium">
                        {searchQuery
                          ? "No voters match your search"
                          : "No voters found"}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {searchQuery
                          ? "Try adjusting your search terms"
                          : "Voters will appear here once they register"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredVoters.map((voter) => (
                        <div
                          key={voter.id}
                          className="border-border/50 hover:border-primary/30 flex flex-col gap-4 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex-1 space-y-2">
                            <h3 className="text-foreground font-medium">
                              {voter.firstName} {voter.middleName || ""}{" "}
                              {voter.lastName}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              NIN:{" "}
                              <span className="font-mono">{voter.nin}</span> •{" "}
                              {voter.email || "No email"}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {voter.state} • {voter.lga} • {voter.ward}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Registered{" "}
                              {new Date(
                                voter.registrationDate,
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeletingVoterId(voter.id)}
                            disabled={deleteVoterMutation.isPending}
                            className="sm:shrink-0"
                          >
                            <HiOutlineTrash className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Candidate Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Candidate</DialogTitle>
            <DialogDescription>
              Add a new candidate to the WardWise platform
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCandidate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Candidate Name *
                </Label>
                <Input
                  id="name"
                  placeholder="Hon. John Doe"
                  value={newCandidate.name}
                  onChange={(e) =>
                    setNewCandidate({
                      ...newCandidate,
                      name: e.target.value,
                    })
                  }
                  required
                  disabled={createCandidateMutation.isPending}
                  className="border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address *
                </Label>
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
                  disabled={createCandidateMutation.isPending}
                  className="border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="party" className="text-sm font-medium">
                  Political Party *
                </Label>
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
                  disabled={createCandidateMutation.isPending}
                  className="border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium">
                  Position *
                </Label>
                <Select
                  value={newCandidate.position}
                  onValueChange={(value) =>
                    setNewCandidate({
                      ...newCandidate,
                      position: value as Candidate["position"],
                    })
                  }
                  disabled={createCandidateMutation.isPending}
                >
                  <SelectTrigger id="position" className="border-border/50">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="constituency" className="text-sm font-medium">
                Constituency *
              </Label>
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
                disabled={createCandidateMutation.isPending}
                className="border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Brief description of the candidate"
                value={newCandidate.description}
                onChange={(e) =>
                  setNewCandidate({
                    ...newCandidate,
                    description: e.target.value,
                  })
                }
                rows={3}
                disabled={createCandidateMutation.isPending}
                className="border-border/50"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={createCandidateMutation.isPending}
                className="border-border/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCandidateMutation.isPending}
              >
                {createCandidateMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <HiOutlineCheckCircle className="mr-2 h-4 w-4" />
                    Create Candidate
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Candidate Dialog */}
      <Dialog
        open={!!editingCandidate}
        onOpenChange={(open) => !open && setEditingCandidate(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Candidate</DialogTitle>
            <DialogDescription>Update candidate information</DialogDescription>
          </DialogHeader>
          {editingCandidate && (
            <form onSubmit={handleUpdateCandidate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-sm font-medium">
                    Candidate Name *
                  </Label>
                  <Input
                    id="edit-name"
                    value={editingCandidate.name}
                    onChange={(e) =>
                      setEditingCandidate({
                        ...editingCandidate,
                        name: e.target.value,
                      })
                    }
                    required
                    disabled={updateCandidateMutation.isPending}
                    className="border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingCandidate.user.email}
                    onChange={(e) =>
                      setEditingCandidate({
                        ...editingCandidate,
                        user: {
                          ...editingCandidate.user,
                          email: e.target.value,
                        },
                      })
                    }
                    required
                    disabled={updateCandidateMutation.isPending}
                    className="border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-party" className="text-sm font-medium">
                    Political Party *
                  </Label>
                  <Input
                    id="edit-party"
                    value={editingCandidate.party}
                    onChange={(e) =>
                      setEditingCandidate({
                        ...editingCandidate,
                        party: e.target.value,
                      })
                    }
                    required
                    disabled={updateCandidateMutation.isPending}
                    className="border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-position"
                    className="text-sm font-medium"
                  >
                    Position *
                  </Label>
                  <Select
                    value={editingCandidate.position}
                    onValueChange={(value) =>
                      setEditingCandidate({
                        ...editingCandidate,
                        position: value as Candidate["position"],
                      })
                    }
                    disabled={updateCandidateMutation.isPending}
                  >
                    <SelectTrigger
                      id="edit-position"
                      className="border-border/50"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-constituency"
                  className="text-sm font-medium"
                >
                  Constituency *
                </Label>
                <Input
                  id="edit-constituency"
                  value={editingCandidate.constituency}
                  onChange={(e) =>
                    setEditingCandidate({
                      ...editingCandidate,
                      constituency: e.target.value,
                    })
                  }
                  required
                  disabled={updateCandidateMutation.isPending}
                  className="border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-description"
                  className="text-sm font-medium"
                >
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={editingCandidate.description || ""}
                  onChange={(e) =>
                    setEditingCandidate({
                      ...editingCandidate,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  disabled={updateCandidateMutation.isPending}
                  className="border-border/50"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingCandidate(null)}
                  disabled={updateCandidateMutation.isPending}
                  className="border-border/50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateCandidateMutation.isPending}
                >
                  {updateCandidateMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <HiOutlineCheckCircle className="mr-2 h-4 w-4" />
                      Update Candidate
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Candidate Confirmation */}
      <AlertDialog
        open={!!deletingCandidateId}
        onOpenChange={(open) => !open && setDeletingCandidateId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              candidate account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCandidateMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingCandidateId) {
                  deleteCandidateMutation.mutate(deletingCandidateId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCandidateMutation.isPending}
            >
              {deleteCandidateMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Voter Confirmation */}
      <AlertDialog
        open={!!deletingVoterId}
        onOpenChange={(open) => !open && setDeletingVoterId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              voter record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteVoterMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingVoterId) {
                  deleteVoterMutation.mutate(deletingVoterId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteVoterMutation.isPending}
            >
              {deleteVoterMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
