"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HiOutlineUserGroup,
  HiOutlineUserAdd,
  HiOutlineUsers,
  HiOutlineUserCircle,
  HiExclamationCircle,
  HiOutlineIdentification,
} from "react-icons/hi";
import { toast } from "sonner";
import type { Candidate } from "@/types/candidate";
import {
  adminApi,
  type CandidateWithUser,
  type CanvasserWithCandidate,
} from "@/lib/api/admin";
import { StatCardSkeleton } from "@/components/admin/admin-skeletons";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { CandidateFilters } from "@/components/admin/admin-filters/candidate-filters";
import { VoterFilters } from "@/components/admin/admin-filters/voter-filters";
import { CanvasserFilters } from "@/components/admin/admin-filters/canvasser-filters";
import { CandidatesTab } from "@/components/admin/admin-tabs/candidates-tab";
import { VotersTab } from "@/components/admin/admin-tabs/voters-tab";
import { CanvassersTab } from "@/components/admin/admin-tabs/canvassers-tab";
import { CreateCandidateDialog } from "@/components/admin/admin-dialogs/create-candidate-dialog";
import { EditCandidateDialog } from "@/components/admin/admin-dialogs/edit-candidate-dialog";
import { DeleteCandidateDialog } from "@/components/admin/admin-dialogs/delete-candidate-dialog";
import { DeleteVoterDialog } from "@/components/admin/admin-dialogs/delete-voter-dialog";
import { DeleteCanvasserDialog } from "@/components/admin/admin-dialogs/delete-canvasser-dialog";
import { EditCanvasserDialog } from "@/components/admin/admin-dialogs/edit-canvasser-dialog";

export function AdminDashboard() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive activeTab from URL params, default to "candidates"
  const tabParam = searchParams?.get("tab");
  const activeTab =
    tabParam === "candidates" ||
    tabParam === "voters" ||
    tabParam === "canvassers"
      ? tabParam
      : "candidates";
  const [searchQuery, setSearchQuery] = useState("");
  // Filter states for candidates
  const [partyFilter, setPartyFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [candidateSort, setCandidateSort] = useState<
    "name" | "supporters" | "date"
  >("name");
  // Filter states for voters
  const [stateFilter, setStateFilter] = useState("all");
  const [lgaFilter, setLgaFilter] = useState("all");
  const [voterSort, setVoterSort] = useState<"name" | "date">("name");
  // Filter states for canvassers
  const [canvasserStateFilter, setCanvasserStateFilter] = useState("all");
  const [canvasserLgaFilter, setCanvasserLgaFilter] = useState("all");
  const [canvasserCandidateFilter, setCanvasserCandidateFilter] =
    useState("all");
  const [canvasserSort, setCanvasserSort] = useState<
    "name" | "voters" | "date"
  >("name");
  // Pagination state
  const [candidatePage, setCandidatePage] = useState(1);
  const [voterPage, setVoterPage] = useState(1);
  const [canvasserPage, setCanvasserPage] = useState(1);
  const [candidatePageSize, setCandidatePageSize] = useState(10);
  const [voterPageSize, setVoterPageSize] = useState(10);
  const [canvasserPageSize, setCanvasserPageSize] = useState(10);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    // Reset all filters and pagination when switching tabs
    setSearchQuery("");
    setPartyFilter("all");
    setPositionFilter("all");
    setCandidateSort("name");
    setStateFilter("all");
    setLgaFilter("all");
    setVoterSort("name");
    setCanvasserStateFilter("all");
    setCanvasserLgaFilter("all");
    setCanvasserCandidateFilter("all");
    setCanvasserSort("name");
    setCandidatePage(1);
    setVoterPage(1);
    setCanvasserPage(1);
    setCandidatePageSize(10);
    setVoterPageSize(10);
    setCanvasserPageSize(10);
    // Update URL with tab parameter
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value === "candidates") {
      params.set("tab", "candidates");
    } else if (value === "voters") {
      params.set("tab", "voters");
    } else if (value === "canvassers") {
      params.set("tab", "canvassers");
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
  const [editingCanvasser, setEditingCanvasser] =
    useState<CanvasserWithCandidate | null>(null);
  const [deletingCanvasserId, setDeletingCanvasserId] = useState<string | null>(
    null,
  );

  // Fetch candidates - optimized for non-real-time data
  const {
    data: candidates = [],
    isLoading: isLoadingCandidates,
    error: candidatesError,
  } = useQuery({
    queryKey: ["admin", "candidates"],
    queryFn: async () => {
      try {
        return await adminApi.candidates.getAll();
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data doesn't change frequently
    refetchOnWindowFocus: false, // Don't refetch on window focus for admin data
    refetchOnMount: false, // Use cached data if available
    retry: 2, // Retry twice on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Fetch voters - always fetch to show counts in tabs
  const {
    data: votersData,
    isLoading: isLoadingVoters,
    error: votersError,
  } = useQuery({
    queryKey: ["admin", "voters"],
    queryFn: async () => {
      try {
        return await adminApi.voters.getAll({ limit: 100 });
      } catch (error) {
        console.error("Failed to fetch voters:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch canvassers - always fetch to show counts in tabs
  const {
    data: canvassersData,
    isLoading: isLoadingCanvassers,
    error: canvassersError,
  } = useQuery({
    queryKey: ["admin", "canvassers"],
    queryFn: async () => {
      try {
        return await adminApi.canvassers.getAll({ limit: 100 });
      } catch (error) {
        console.error("Failed to fetch canvassers:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Get unique parties and positions for filters
  const uniqueParties = useMemo(
    () =>
      Array.from(
        new Set(candidates.map((c) => c.party).filter(Boolean)),
      ).sort(),
    [candidates],
  );

  const uniquePositions = useMemo(
    () =>
      Array.from(
        new Set(candidates.map((c) => c.position).filter(Boolean)),
      ).sort(),
    [candidates],
  );

  // Filtered candidates based on search, party, position, and sort
  const filteredCandidates = useMemo(() => {
    // Safety check: ensure candidates is an array
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return [];
    }

    // Defensive deduplication by email (safety net)
    const seen = new Set<string>();
    let filtered = candidates.filter((c) => {
      // Safety checks for user and email
      if (!c?.user?.email) return false;
      const email = c.user.email.toLowerCase();
      if (seen.has(email)) return false;
      seen.add(email);
      return true;
    });

    const query = searchQuery?.trim().toLowerCase() || "";

    // Apply party filter
    if (partyFilter !== "all" && partyFilter) {
      filtered = filtered.filter((c) => c.party === partyFilter);
    }

    // Apply position filter
    if (positionFilter !== "all" && positionFilter) {
      filtered = filtered.filter((c) => c.position === positionFilter);
    }

    // Apply search query
    if (query) {
      filtered = filtered.filter((c) => {
        const name = c.name?.toLowerCase() || "";
        const party = c.party?.toLowerCase() || "";
        const constituency = c.constituency?.toLowerCase() || "";
        const email = c.user?.email?.toLowerCase() || "";
        return (
          name.includes(query) ||
          party.includes(query) ||
          constituency.includes(query) ||
          email.includes(query)
        );
      });
    }

    // Apply sorting with null safety
    filtered.sort((a, b) => {
      if (candidateSort === "name") {
        return (a.name || "").localeCompare(b.name || "");
      } else if (candidateSort === "supporters") {
        return (b.supporters || 0) - (a.supporters || 0);
      } else {
        // date - handle missing createdAt
        const dateA = a.user?.createdAt
          ? new Date(a.user.createdAt).getTime()
          : 0;
        const dateB = b.user?.createdAt
          ? new Date(b.user.createdAt).getTime()
          : 0;
        return dateB - dateA;
      }
    });

    return filtered;
  }, [candidates, searchQuery, partyFilter, positionFilter, candidateSort]);

  // Calculate total pages for candidates
  const candidateTotalPages = Math.max(
    1,
    Math.ceil(filteredCandidates.length / candidatePageSize),
  );

  // Paginated candidates with bounds checking
  const paginatedCandidates = useMemo(() => {
    if (!Array.isArray(filteredCandidates) || filteredCandidates.length === 0) {
      return [];
    }

    const safePage = Math.max(1, Math.min(candidatePage, candidateTotalPages));
    const start = (safePage - 1) * candidatePageSize;
    const end = Math.min(start + candidatePageSize, filteredCandidates.length);

    return filteredCandidates.slice(start, end);
  }, [
    filteredCandidates,
    candidatePage,
    candidatePageSize,
    candidateTotalPages,
  ]);

  // Reset candidate page if out of bounds (outside useMemo to avoid infinite loop)
  if (candidatePage > candidateTotalPages && candidateTotalPages > 0) {
    setCandidatePage(1);
  }

  // Get unique states and LGAs for voter filters
  const uniqueStates = useMemo(
    () =>
      Array.from(
        new Set((votersData?.voters || []).map((v) => v.state).filter(Boolean)),
      ).sort(),
    [votersData?.voters],
  );

  const uniqueLgas = useMemo(
    () =>
      Array.from(
        new Set((votersData?.voters || []).map((v) => v.lga).filter(Boolean)),
      ).sort(),
    [votersData?.voters],
  );

  // Filtered voters based on search, state, lga, and sort
  const filteredVoters = useMemo(() => {
    const voters = votersData?.voters || [];
    if (!Array.isArray(voters) || voters.length === 0) {
      return [];
    }

    let filtered = [...voters];
    const query = searchQuery?.trim().toLowerCase() || "";

    // Apply state filter
    if (stateFilter !== "all" && stateFilter) {
      filtered = filtered.filter((v) => v.state === stateFilter);
    }

    // Apply LGA filter
    if (lgaFilter !== "all" && lgaFilter) {
      filtered = filtered.filter((v) => v.lga === lgaFilter);
    }

    // Apply search query with null safety
    if (query) {
      filtered = filtered.filter((v) => {
        const fullName = `${v.firstName || ""} ${v.lastName || ""}`
          .trim()
          .toLowerCase();
        const nin = v.nin?.toLowerCase() || "";
        const email = v.email?.toLowerCase() || "";
        const state = v.state?.toLowerCase() || "";
        const lga = v.lga?.toLowerCase() || "";
        return (
          fullName.includes(query) ||
          nin.includes(query) ||
          email.includes(query) ||
          state.includes(query) ||
          lga.includes(query)
        );
      });
    }

    // Apply sorting with null safety
    filtered.sort((a, b) => {
      if (voterSort === "name") {
        const nameA = `${a.firstName || ""} ${a.lastName || ""}`
          .trim()
          .toLowerCase();
        const nameB = `${b.firstName || ""} ${b.lastName || ""}`
          .trim()
          .toLowerCase();
        return nameA.localeCompare(nameB);
      } else {
        // date - handle missing registrationDate
        const dateA = a.registrationDate
          ? new Date(a.registrationDate).getTime()
          : 0;
        const dateB = b.registrationDate
          ? new Date(b.registrationDate).getTime()
          : 0;
        return dateB - dateA;
      }
    });

    return filtered;
  }, [votersData?.voters, searchQuery, stateFilter, lgaFilter, voterSort]);

  // Paginated voters with bounds checking
  const paginatedVoters = useMemo(() => {
    if (!Array.isArray(filteredVoters) || filteredVoters.length === 0) {
      return [];
    }

    const totalPages = Math.ceil(filteredVoters.length / voterPageSize);
    const safePage = Math.max(1, Math.min(voterPage, totalPages || 1));
    const start = (safePage - 1) * voterPageSize;
    const end = Math.min(start + voterPageSize, filteredVoters.length);

    return filteredVoters.slice(start, end);
  }, [filteredVoters, voterPage, voterPageSize]);

  const voterTotalPages = Math.max(
    1,
    Math.ceil(filteredVoters.length / voterPageSize),
  );

  // Reset voter page if out of bounds
  if (voterPage > voterTotalPages && voterTotalPages > 0) {
    setVoterPage(1);
  }

  // Get unique states, LGAs, and candidates for canvasser filters
  const canvassers = useMemo(
    () => canvassersData?.canvassers || [],
    [canvassersData?.canvassers],
  );
  const uniqueCanvasserStates = useMemo(
    () =>
      Array.from(
        new Set(
          canvassers.map((c) => c.state).filter((s): s is string => Boolean(s)),
        ),
      ).sort(),
    [canvassers],
  );

  const uniqueCanvasserLgas = useMemo(
    () =>
      Array.from(
        new Set(
          canvassers.map((c) => c.lga).filter((l): l is string => Boolean(l)),
        ),
      ).sort(),
    [canvassers],
  );

  const uniqueCanvasserCandidates = useMemo(() => {
    const candidateMap = new Map<string, { id: string; name: string }>();
    canvassers.forEach((c) => {
      if (!candidateMap.has(c.candidateId)) {
        candidateMap.set(c.candidateId, {
          id: c.candidateId,
          name: c.candidate.name,
        });
      }
    });
    return Array.from(candidateMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [canvassers]);

  // Filtered canvassers based on search, state, lga, candidate, and sort
  const filteredCanvassers = useMemo(() => {
    if (!Array.isArray(canvassers) || canvassers.length === 0) {
      return [];
    }

    let filtered = [...canvassers];
    const query = searchQuery?.trim().toLowerCase() || "";

    // Apply state filter
    if (canvasserStateFilter !== "all" && canvasserStateFilter) {
      filtered = filtered.filter((c) => c.state === canvasserStateFilter);
    }

    // Apply LGA filter
    if (canvasserLgaFilter !== "all" && canvasserLgaFilter) {
      filtered = filtered.filter((c) => c.lga === canvasserLgaFilter);
    }

    // Apply candidate filter
    if (canvasserCandidateFilter !== "all" && canvasserCandidateFilter) {
      filtered = filtered.filter(
        (c) => c.candidateId === canvasserCandidateFilter,
      );
    }

    // Apply search query with null safety
    if (query) {
      filtered = filtered.filter((c) => {
        const name = c.name?.toLowerCase() || "";
        const code = c.code?.toLowerCase() || "";
        const phone = c.phone?.toLowerCase() || "";
        const candidateName = c.candidate?.name?.toLowerCase() || "";
        const state = c.state?.toLowerCase() || "";
        const lga = c.lga?.toLowerCase() || "";
        return (
          name.includes(query) ||
          code.includes(query) ||
          phone.includes(query) ||
          candidateName.includes(query) ||
          state.includes(query) ||
          lga.includes(query)
        );
      });
    }

    // Apply sorting with null safety
    filtered.sort((a, b) => {
      if (canvasserSort === "name") {
        return (a.name || "").localeCompare(b.name || "");
      } else if (canvasserSort === "voters") {
        return (b.votersCount || 0) - (a.votersCount || 0);
      } else {
        // date - handle missing createdAt
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
    });

    return filtered;
  }, [
    canvassers,
    searchQuery,
    canvasserStateFilter,
    canvasserLgaFilter,
    canvasserCandidateFilter,
    canvasserSort,
  ]);

  // Calculate total pages for canvassers
  const canvasserTotalPages = Math.max(
    1,
    Math.ceil(filteredCanvassers.length / canvasserPageSize),
  );

  // Paginated canvassers with bounds checking
  const paginatedCanvassers = useMemo(() => {
    if (!Array.isArray(filteredCanvassers) || filteredCanvassers.length === 0) {
      return [];
    }

    const safePage = Math.max(1, Math.min(canvasserPage, canvasserTotalPages));
    const start = (safePage - 1) * canvasserPageSize;
    const end = Math.min(start + canvasserPageSize, filteredCanvassers.length);

    return filteredCanvassers.slice(start, end);
  }, [
    filteredCanvassers,
    canvasserPage,
    canvasserPageSize,
    canvasserTotalPages,
  ]);

  // Reset canvasser page if out of bounds
  if (canvasserPage > canvasserTotalPages && canvasserTotalPages > 0) {
    setCanvasserPage(1);
  }

  // Check if filters are applied
  const hasCandidateFilters =
    partyFilter !== "all" ||
    positionFilter !== "all" ||
    candidateSort !== "name" ||
    searchQuery.trim().length > 0;

  const hasVoterFilters =
    stateFilter !== "all" ||
    lgaFilter !== "all" ||
    voterSort !== "name" ||
    searchQuery.trim().length > 0;

  const hasCanvasserFilters =
    canvasserStateFilter !== "all" ||
    canvasserLgaFilter !== "all" ||
    canvasserCandidateFilter !== "all" ||
    canvasserSort !== "name" ||
    searchQuery.trim().length > 0;

  // Reset filter handlers
  const handleResetCandidateFilters = () => {
    setSearchQuery("");
    setPartyFilter("all");
    setPositionFilter("all");
    setCandidateSort("name");
    setCandidatePage(1);
  };

  const handleResetVoterFilters = () => {
    setSearchQuery("");
    setStateFilter("all");
    setLgaFilter("all");
    setVoterSort("name");
    setVoterPage(1);
  };

  const handleResetCanvasserFilters = () => {
    setSearchQuery("");
    setCanvasserStateFilter("all");
    setCanvasserLgaFilter("all");
    setCanvasserCandidateFilter("all");
    setCanvasserSort("name");
    setCanvasserPage(1);
  };

  // Filter change handlers
  const handleCandidateFilterChange = (filter: {
    party?: string;
    position?: string;
    sort?: "name" | "supporters" | "date";
  }) => {
    if (filter.party !== undefined) {
      setPartyFilter(filter.party);
      setCandidatePage(1);
    }
    if (filter.position !== undefined) {
      setPositionFilter(filter.position);
      setCandidatePage(1);
    }
    if (filter.sort !== undefined) {
      setCandidateSort(filter.sort);
      setCandidatePage(1);
    }
  };

  const handleVoterFilterChange = (filter: {
    state?: string;
    lga?: string;
    sort?: "name" | "date";
  }) => {
    if (filter.state !== undefined) {
      setStateFilter(filter.state);
      setVoterPage(1);
    }
    if (filter.lga !== undefined) {
      setLgaFilter(filter.lga);
      setVoterPage(1);
    }
    if (filter.sort !== undefined) {
      setVoterSort(filter.sort);
      setVoterPage(1);
    }
  };

  const handleCanvasserFilterChange = (filter: {
    state?: string;
    lga?: string;
    candidate?: string;
    sort?: "name" | "voters" | "date";
  }) => {
    if (filter.state !== undefined) {
      setCanvasserStateFilter(filter.state);
      setCanvasserPage(1);
    }
    if (filter.lga !== undefined) {
      setCanvasserLgaFilter(filter.lga);
      setCanvasserPage(1);
    }
    if (filter.candidate !== undefined) {
      setCanvasserCandidateFilter(filter.candidate);
      setCanvasserPage(1);
    }
    if (filter.sort !== undefined) {
      setCanvasserSort(filter.sort);
      setCanvasserPage(1);
    }
  };

  // Create candidate mutation
  const createCandidateMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      party: string;
      position: Candidate["position"];
      constituency: string;
      description: string;
    }) => {
      // Validation
      if (!data.name?.trim()) {
        throw new Error("Candidate name is required");
      }
      if (!data.email?.trim()) {
        throw new Error("Email is required");
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        throw new Error("Please enter a valid email address");
      }
      if (!data.party?.trim()) {
        throw new Error("Party is required");
      }
      if (!data.constituency?.trim()) {
        throw new Error("Constituency is required");
      }

      try {
        return await adminApi.candidates.create({
          ...data,
          position: data.position as Candidate["position"],
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Network error. Please check your connection and try again.";
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "candidates"] });
      toast.success("Candidate created successfully!");
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      console.error("Failed to create candidate:", error);
      toast.error(error.message || "Failed to create candidate");
    },
  });

  // Update candidate mutation
  const updateCandidateMutation = useMutation({
    mutationFn: async (
      data: Parameters<typeof adminApi.candidates.update>[0],
    ) => {
      // Validation
      if (!data.id) {
        throw new Error("Candidate ID is required");
      }
      if (data.name !== undefined && !data.name?.trim()) {
        throw new Error("Candidate name cannot be empty");
      }
      if (data.email !== undefined) {
        if (!data.email.trim()) {
          throw new Error("Email cannot be empty");
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
          throw new Error("Please enter a valid email address");
        }
      }

      try {
        return await adminApi.candidates.update(data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Network error. Please check your connection and try again.";
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "candidates"] });
      toast.success("Candidate updated successfully!");
      setEditingCandidate(null);
    },
    onError: (error: Error) => {
      console.error("Failed to update candidate:", error);
      toast.error(error.message || "Failed to update candidate");
    },
  });

  // Delete candidate mutation
  const deleteCandidateMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id?.trim()) {
        throw new Error("Candidate ID is required");
      }

      try {
        await adminApi.candidates.delete(id);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Network error. Please check your connection and try again.";
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "candidates"] });
      toast.success("Candidate deleted successfully!");
      setDeletingCandidateId(null);
    },
    onError: (error: Error) => {
      console.error("Failed to delete candidate:", error);
      toast.error(error.message || "Failed to delete candidate");
    },
  });

  // Delete voter mutation
  const deleteVoterMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id?.trim()) {
        throw new Error("Voter ID is required");
      }

      try {
        await adminApi.voters.delete(id);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Network error. Please check your connection and try again.";
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "voters"] });
      toast.success("Voter deleted successfully!");
      setDeletingVoterId(null);
    },
    onError: (error: Error) => {
      console.error("Failed to delete voter:", error);
      toast.error(error.message || "Failed to delete voter");
    },
  });

  // Update canvasser mutation
  const updateCanvasserMutation = useMutation({
    mutationFn: async (
      data: Parameters<typeof adminApi.canvassers.update>[0],
    ) => {
      // Validation
      if (!data.id) {
        throw new Error("Canvasser ID is required");
      }
      if (data.name !== undefined && !data.name?.trim()) {
        throw new Error("Canvasser name cannot be empty");
      }
      if (data.phone !== undefined && !data.phone?.trim()) {
        throw new Error("Phone number cannot be empty");
      }

      try {
        return await adminApi.canvassers.update(data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Network error. Please check your connection and try again.";
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "canvassers"] });
      toast.success("Canvasser updated successfully!");
      setEditingCanvasser(null);
    },
    onError: (error: Error) => {
      console.error("Failed to update canvasser:", error);
      toast.error(error.message || "Failed to update canvasser");
    },
  });

  // Delete canvasser mutation
  const deleteCanvasserMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id?.trim()) {
        throw new Error("Canvasser ID is required");
      }

      try {
        await adminApi.canvassers.delete(id);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Network error. Please check your connection and try again.";
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "canvassers"] });
      toast.success("Canvasser deleted successfully!");
      setDeletingCanvasserId(null);
    },
    onError: (error: Error) => {
      console.error("Failed to delete canvasser:", error);
      toast.error(error.message || "Failed to delete canvasser");
    },
  });

  const handleCreateCandidate = async (data: {
    name: string;
    email: string;
    party: string;
    position: Candidate["position"];
    constituency: string;
    state?: string;
    lga?: string;
    description: string;
  }) => {
    createCandidateMutation.mutate(data);
  };

  const handleUpdateCandidate = async (data: {
    id: string;
    name: string;
    email: string;
    party: string;
    position: Candidate["position"];
    constituency: string;
    state?: string;
    lga?: string;
    description: string;
  }) => {
    updateCandidateMutation.mutate(data);
  };

  const handleUpdateCanvasser = async (data: {
    id: string;
    code?: string;
    name?: string;
    phone?: string;
    candidateId?: string;
    ward?: string;
    lga?: string;
    state?: string;
  }) => {
    updateCanvasserMutation.mutate(data);
  };

  const totalSupporters = useMemo(() => {
    if (!Array.isArray(candidates)) return 0;
    return candidates.reduce((sum, c) => sum + (c.supporters || 0), 0);
  }, [candidates]);

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Error States */}
          {candidatesError && (
            <Alert
              variant="destructive"
              className="border-destructive/50 bg-destructive/10 mx-4 sm:mx-6"
            >
              <HiExclamationCircle className="h-4 w-4" />
              <AlertTitle>Failed to load candidates</AlertTitle>
              <AlertDescription>
                {candidatesError instanceof Error
                  ? candidatesError.message
                  : "An error occurred while loading candidates. Please try refreshing the page."}
              </AlertDescription>
            </Alert>
          )}

          {votersError && activeTab === "voters" && (
            <Alert
              variant="destructive"
              className="border-destructive/50 bg-destructive/10 mx-4 sm:mx-6"
            >
              <HiExclamationCircle className="h-4 w-4" />
              <AlertTitle>Failed to load voters</AlertTitle>
              <AlertDescription>
                {votersError instanceof Error
                  ? votersError.message
                  : "An error occurred while loading voters. Please try refreshing the page."}
              </AlertDescription>
            </Alert>
          )}

          {canvassersError && activeTab === "canvassers" && (
            <Alert
              variant="destructive"
              className="border-destructive/50 bg-destructive/10 mx-4 sm:mx-6"
            >
              <HiExclamationCircle className="h-4 w-4" />
              <AlertTitle>Failed to load canvassers</AlertTitle>
              <AlertDescription>
                {canvassersError instanceof Error
                  ? canvassersError.message
                  : "An error occurred while loading canvassers. Please try refreshing the page."}
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-3 sm:gap-4 lg:px-6">
            {isLoadingCandidates ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : candidatesError ? (
              <>
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardContent className="pt-6">
                    <div className="text-destructive text-sm">
                      Unable to load stats
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardContent className="pt-6">
                    <div className="text-destructive text-sm">
                      Unable to load stats
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardContent className="pt-6">
                    <div className="text-destructive text-sm">
                      Unable to load stats
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                    <CardTitle className="text-muted-foreground text-xs font-medium sm:text-sm">
                      Total Candidates
                    </CardTitle>
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg sm:h-9 sm:w-9">
                      <HiOutlineUserGroup className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-foreground text-xl font-semibold sm:text-2xl">
                      {candidates.length}
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs sm:mt-1">
                      Active candidate accounts
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                    <CardTitle className="text-muted-foreground text-xs font-medium sm:text-sm">
                      Total Supporters
                    </CardTitle>
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg sm:h-9 sm:w-9">
                      <HiOutlineUsers className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-foreground text-xl font-semibold sm:text-2xl">
                      {totalSupporters.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs sm:mt-1">
                      Across all candidates
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                    <CardTitle className="text-muted-foreground text-xs font-medium sm:text-sm">
                      Total Voters
                    </CardTitle>
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg sm:h-9 sm:w-9">
                      <HiOutlineUserCircle className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-foreground text-xl font-semibold sm:text-2xl">
                      {activeTab === "voters" && isLoadingVoters ? (
                        <Skeleton className="h-6 w-12 sm:h-8 sm:w-16" />
                      ) : (
                        votersData?.total.toLocaleString() || "0"
                      )}
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs sm:mt-1">
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
            defaultValue="candidates"
            className="flex flex-1 flex-col"
          >
            {/* Search and Actions Bar */}
            <div className="flex flex-col gap-4 px-4 lg:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-3 overflow-hidden sm:flex-row sm:items-center sm:gap-4">
                  <TabsList className="border-border/50 bg-muted/50 w-full justify-start overflow-x-auto sm:w-auto">
                    <TabsTrigger
                      value="candidates"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground group relative min-w-fit flex-1 items-center gap-2 px-4 py-2.5 sm:flex-none"
                    >
                      <HiOutlineUserGroup className="h-4 w-4 shrink-0" />
                      <span className="font-medium">Candidates</span>
                      {!isLoadingCandidates && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/20 text-primary ml-auto font-semibold"
                        >
                          {candidates.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="voters"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground group relative min-w-fit flex-1 items-center gap-2 px-4 py-2.5 sm:flex-none"
                    >
                      <HiOutlineUserCircle className="h-4 w-4 shrink-0" />
                      <span className="font-medium">Voters</span>
                      {!isLoadingVoters && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/20 text-primary ml-auto font-semibold"
                        >
                          {votersData?.total.toLocaleString() || "0"}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="canvassers"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground group relative min-w-fit flex-1 items-center gap-2 px-4 py-2.5 sm:flex-none"
                    >
                      <HiOutlineIdentification className="h-4 w-4 shrink-0" />
                      <span className="font-medium">Canvassers</span>
                      {!isLoadingCanvassers && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/20 text-primary ml-auto font-semibold"
                        >
                          {canvassersData?.total.toLocaleString() || "0"}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab Preview Info - Hidden on mobile */}
                  <div className="hidden items-center gap-4 text-sm sm:flex">
                    {activeTab === "candidates" ? (
                      <div className="text-muted-foreground flex items-center gap-2">
                        <HiOutlineUserGroup className="h-4 w-4" />
                        <span>
                          <span className="text-foreground font-semibold">
                            {candidates.length}
                          </span>{" "}
                          candidate{candidates.length !== 1 ? "s" : ""}{" "}
                          registered
                        </span>
                      </div>
                    ) : activeTab === "voters" ? (
                      <div className="text-muted-foreground flex items-center gap-2">
                        <HiOutlineUserCircle className="h-4 w-4" />
                        <span>
                          <span className="text-foreground font-semibold">
                            {votersData?.total.toLocaleString() || "0"}
                          </span>{" "}
                          voter{(votersData?.total || 0) !== 1 ? "s" : ""}{" "}
                          registered
                        </span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground flex items-center gap-2">
                        <HiOutlineIdentification className="h-4 w-4" />
                        <span>
                          <span className="text-foreground font-semibold">
                            {canvassersData?.total.toLocaleString() || "0"}
                          </span>{" "}
                          canvasser
                          {(canvassersData?.total || 0) !== 1 ? "s" : ""}{" "}
                          registered
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Create Button - Only show for candidates tab */}
                {activeTab === "candidates" && (
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="w-full gap-2 sm:w-auto"
                  >
                    <HiOutlineUserAdd className="h-4 w-4" />
                    <span>Create Candidate</span>
                  </Button>
                )}
              </div>

              {/* Search Bar */}
              <AdminSearchBar
                value={searchQuery}
                onChange={(value) => {
                  setSearchQuery(value);
                  // Reset to page 1 when search changes
                  if (activeTab === "candidates") setCandidatePage(1);
                  else if (activeTab === "voters") setVoterPage(1);
                  else if (activeTab === "canvassers") setCanvasserPage(1);
                }}
                placeholder={`Search ${activeTab}...`}
              />

              {/* Filters Row - Candidates */}
              {activeTab === "candidates" && (
                <CandidateFilters
                  partyFilter={partyFilter}
                  positionFilter={positionFilter}
                  sort={candidateSort}
                  uniqueParties={uniqueParties}
                  uniquePositions={uniquePositions}
                  onFilterChange={handleCandidateFilterChange}
                  onReset={handleResetCandidateFilters}
                  hasFilters={hasCandidateFilters}
                />
              )}

              {/* Filters Row - Voters */}
              {activeTab === "voters" && (
                <VoterFilters
                  stateFilter={stateFilter}
                  lgaFilter={lgaFilter}
                  sort={voterSort}
                  uniqueStates={uniqueStates}
                  uniqueLgas={uniqueLgas}
                  onFilterChange={handleVoterFilterChange}
                  onReset={handleResetVoterFilters}
                  hasFilters={hasVoterFilters}
                />
              )}

              {/* Filters Row - Canvassers */}
              {activeTab === "canvassers" && (
                <CanvasserFilters
                  stateFilter={canvasserStateFilter}
                  lgaFilter={canvasserLgaFilter}
                  candidateFilter={canvasserCandidateFilter}
                  sort={canvasserSort}
                  uniqueStates={uniqueCanvasserStates}
                  uniqueLgas={uniqueCanvasserLgas}
                  uniqueCandidates={uniqueCanvasserCandidates}
                  onFilterChange={handleCanvasserFilterChange}
                  onReset={handleResetCanvasserFilters}
                  hasFilters={hasCanvasserFilters}
                />
              )}
            </div>

            {/* Candidates Tab */}
            <CandidatesTab
              candidates={candidates}
              filteredCandidates={filteredCandidates}
              paginatedCandidates={paginatedCandidates}
              isLoading={isLoadingCandidates}
              error={candidatesError}
              searchQuery={searchQuery}
              currentPage={candidatePage}
              pageSize={candidatePageSize}
              totalPages={candidateTotalPages}
              onEdit={setEditingCandidate}
              onDelete={setDeletingCandidateId}
              onPageChange={setCandidatePage}
              onPageSizeChange={(size) => {
                setCandidatePageSize(size);
                setCandidatePage(1);
              }}
              isLoadingActions={
                updateCandidateMutation.isPending ||
                deleteCandidateMutation.isPending
              }
            />

            {/* Voters Tab */}
            <VotersTab
              voters={votersData?.voters || []}
              filteredVoters={filteredVoters}
              paginatedVoters={paginatedVoters}
              totalVoters={votersData?.total || 0}
              isLoading={isLoadingVoters}
              searchQuery={searchQuery}
              currentPage={voterPage}
              pageSize={voterPageSize}
              totalPages={voterTotalPages}
              onDelete={setDeletingVoterId}
              onPageChange={setVoterPage}
              onPageSizeChange={(size) => {
                setVoterPageSize(size);
                setVoterPage(1);
              }}
              isLoadingActions={deleteVoterMutation.isPending}
            />

            {/* Canvassers Tab */}
            <CanvassersTab
              canvassers={canvassers}
              filteredCanvassers={filteredCanvassers}
              paginatedCanvassers={paginatedCanvassers}
              isLoading={isLoadingCanvassers}
              error={canvassersError}
              searchQuery={searchQuery}
              currentPage={canvasserPage}
              pageSize={canvasserPageSize}
              totalPages={canvasserTotalPages}
              onEdit={setEditingCanvasser}
              onDelete={setDeletingCanvasserId}
              onPageChange={setCanvasserPage}
              onPageSizeChange={(size) => {
                setCanvasserPageSize(size);
                setCanvasserPage(1);
              }}
              isLoadingActions={
                updateCanvasserMutation.isPending ||
                deleteCanvasserMutation.isPending
              }
            />
          </Tabs>
        </div>
      </div>

      {/* Create Candidate Dialog */}
      <CreateCandidateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateCandidate}
        isLoading={createCandidateMutation.isPending}
      />

      {/* Edit Candidate Dialog */}
      <EditCandidateDialog
        candidate={editingCandidate}
        open={!!editingCandidate}
        onOpenChange={(open) => !open && setEditingCandidate(null)}
        onSubmit={handleUpdateCandidate}
        isLoading={updateCandidateMutation.isPending}
      />

      {/* Delete Candidate Confirmation */}
      <DeleteCandidateDialog
        candidateId={deletingCandidateId}
        candidateName={
          candidates.find((c) => c.id === deletingCandidateId)?.name
        }
        open={!!deletingCandidateId}
        onOpenChange={(open) => !open && setDeletingCandidateId(null)}
        onConfirm={(id) => deleteCandidateMutation.mutate(id)}
        isLoading={deleteCandidateMutation.isPending}
      />

      {/* Delete Voter Confirmation */}
      <DeleteVoterDialog
        voterId={deletingVoterId}
        voterName={
          votersData?.voters.find((v) => v.id === deletingVoterId)
            ? `${votersData.voters.find((v) => v.id === deletingVoterId)?.firstName} ${votersData.voters.find((v) => v.id === deletingVoterId)?.lastName}`
            : undefined
        }
        open={!!deletingVoterId}
        onOpenChange={(open) => !open && setDeletingVoterId(null)}
        onConfirm={(id) => deleteVoterMutation.mutate(id)}
        isLoading={deleteVoterMutation.isPending}
      />

      {/* Edit Canvasser Dialog */}
      <EditCanvasserDialog
        canvasser={editingCanvasser}
        candidates={candidates}
        open={!!editingCanvasser}
        onOpenChange={(open) => !open && setEditingCanvasser(null)}
        onSubmit={handleUpdateCanvasser}
        isLoading={updateCanvasserMutation.isPending}
      />

      {/* Delete Canvasser Confirmation */}
      <DeleteCanvasserDialog
        canvasserId={deletingCanvasserId}
        canvasserName={
          canvassers.find((c) => c.id === deletingCanvasserId)?.name
        }
        open={!!deletingCanvasserId}
        onOpenChange={(open) => !open && setDeletingCanvasserId(null)}
        onConfirm={(id) => deleteCanvasserMutation.mutate(id)}
        isLoading={deleteCanvasserMutation.isPending}
      />
    </div>
  );
}
