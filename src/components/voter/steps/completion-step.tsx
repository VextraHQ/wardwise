"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import {
  HiShare,
  HiClipboardCopy,
  HiHome,
  HiUser,
  HiUserAdd,
  HiCheckCircle,
  HiLocationMarker,
  HiUsers,
  HiShieldCheck,
  HiDownload,
  HiChatAlt,
  HiMail,
} from "react-icons/hi";
import { HiLockClosed } from "react-icons/hi2";
import { PartyPopper } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "motion/react";
import { useRegistrationStore } from "@/stores/registration-store";
import { candidateApi } from "@/lib/api/candidate";
import { HiExclamationCircle } from "react-icons/hi";
import { Skeleton } from "@/components/ui/skeleton";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import type { Candidate } from "@/types/candidate";
import { RegistrationStepHeader } from "@/components/voter/registration-step-header";

export function CompletionStep() {
  const router = useRouter();
  const { payload, reset, hasHydrated } = useRegistrationStore();

  // Share URL and text
  const shareUrl =
    typeof window !== "undefined" ? window.location.origin + "/register" : "";
  const shareText = `I just registered with WardWise to participate in upcoming elections! Join me in making your voice heard. Register now: ${shareUrl}`;

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success("Link copied to clipboard!");
      }
    } catch {
      toast.error("Failed to copy link. Please try again.");
    }
  };

  // Share on WhatsApp
  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  // Share via SMS
  const handleSMSShare = () => {
    const url = `sms:?body=${encodeURIComponent(shareText)}`;
    window.location.href = url;
  };

  // Share via Email
  const handleEmailShare = () => {
    const subject = "Join WardWise - Register to Vote";
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`;
    window.location.href = url;
  };

  // Support multi-candidate selections
  const candidateSelections = payload.candidates?.selections;

  // Determine if we're using multi-candidate mode
  const isMultiCandidateMode = Boolean(
    candidateSelections && candidateSelections.length > 0,
  );

  const candidateIds = useMemo(() => {
    if (isMultiCandidateMode && candidateSelections) {
      return candidateSelections.map((selection) => ({
        position: selection.position,
        candidateId: selection.candidateId,
      }));
    }
    return [];
  }, [isMultiCandidateMode, candidateSelections]);

  // Fetch all candidate details using useQueries for dynamic queries
  const candidateQueriesResults = useQueries({
    queries: candidateIds.map(({ candidateId, position }) => ({
      queryKey: ["candidate", candidateId, position] as const,
      queryFn: async () => {
        if (!candidateId) return null;
        const result = await candidateApi.getCandidateById(candidateId);
        return { ...result, position };
      },
      enabled: !!candidateId && hasHydrated,
      retry: 2,
      retryDelay: 1000,
    })),
  });

  // Organize candidates by position for display
  const candidatesData = useMemo(() => {
    const grouped: Record<
      string,
      Array<{
        candidate: Candidate;
        position: string | null;
      }>
    > = {};

    candidateQueriesResults.forEach((result, index) => {
      const { position } = candidateIds[index];
      const candidate = result.data?.candidate;
      if (candidate) {
        const pos = position || candidate.position || "Other";
        if (!grouped[pos]) {
          grouped[pos] = [];
        }
        grouped[pos].push({ candidate, position: pos });
      }
    });

    return grouped;
  }, [candidateQueriesResults, candidateIds]);

  const hasCandidates = Object.keys(candidatesData).length > 0;
  const isLoadingAnyCandidate = candidateQueriesResults.some(
    (result) => result.isLoading,
  );
  const hasCandidateError = candidateQueriesResults.some(
    (result) => result.isError,
  );

  // First name and full name
  const firstName = payload.basic?.firstName || "Voter";
  const fullName =
    `${payload.basic?.firstName || ""} ${payload.basic?.middleName || ""} ${payload.basic?.lastName || ""}`.trim();

  // Get position labels for display
  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      President: "President",
      Governor: "Governor",
      Senator: "Senator",
      "House of Representatives": "House of Reps",
      "State Assembly": "State Assembly",
    };
    return labels[position] || position;
  };

  // Check if registration data is complete
  const hasCompleteData =
    payload.basic?.firstName &&
    payload.basic?.lastName &&
    payload.location?.state &&
    payload.location?.lga &&
    payload.location?.ward &&
    payload.location?.pollingUnit;

  // Export registration summary as text
  const handleExport = () => {
    const summary = `
WardWise Registration Summary
============================

Personal Information:
--------------------
Full Name: ${fullName || "Not provided"}
Age: ${payload.basic?.age ? `${payload.basic.age} years` : "Not provided"}
Gender: ${payload.basic?.gender || "Not provided"}
Occupation: ${payload.basic?.occupation?.replace(/-/g, " ") || "Not provided"}
Religion: ${payload.basic?.religion || "Not provided"}
Phone: ${payload.phone || "Not provided"}

Voting Location:
---------------
State: ${payload.location?.state || "Not provided"}
LGA: ${payload.location?.lga || "Not provided"}
Ward: ${payload.location?.ward || "Not provided"}
Polling Unit: ${payload.location?.pollingUnit || "Not provided"}

Survey & Support:
----------------
Survey: Complete
${
  isMultiCandidateMode
    ? Object.entries(candidatesData)
        .map(
          ([position, candidates]) =>
            `${getPositionLabel(position)}: ${candidates.map((c) => c.candidate.name).join(", ")}`,
        )
        .join("\n")
    : candidateQueriesResults[0]?.data?.candidate?.name || "Not selected"
}

Registration Date: ${new Date().toLocaleDateString("en-NG", {
      dateStyle: "long",
    })}

Important: You can update your information once within 7 days.
    `.trim();

    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wardwise-registration-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Registration summary exported!");
  };

  // Trigger confetti on mount - simplified single burst
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  useEffect(() => {
    if (hasHydrated && hasCompleteData && !hasTriggeredConfetti) {
      const timer = setTimeout(() => {
        // Single celebratory burst from center
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#46C2A7", "#1D453A", "#0f2b24"],
        });
        setHasTriggeredConfetti(true);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [hasHydrated, hasCompleteData, hasTriggeredConfetti]);

  // Generate registration reference from existing data (stable and deterministic)
  const registrationRef = useMemo(() => {
    if (!hasCompleteData) return null;
    // Use NIN or phone as base for deterministic reference
    const base = payload.nin?.slice(-6) || payload.phone?.slice(-6) || "REG";
    return `WR-${base.toUpperCase()}`;
  }, [hasCompleteData, payload.nin, payload.phone]);

  // Show loading state until store has hydrated from localStorage
  if (!hasHydrated) {
    return (
      <div className="space-y-6">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-border/60 bg-card border p-10"
          >
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="space-y-4 text-center">
                <div className="text-primary mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                <p className="text-muted-foreground text-sm font-medium">
                  Loading your registration...
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Edge case: Missing critical registration data
  if (!hasCompleteData) {
    return (
      <div className="space-y-6">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-destructive/30 bg-destructive/5 border p-10"
          >
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 text-center">
              <div className="bg-destructive/10 text-destructive flex h-12 w-12 items-center justify-center rounded-full">
                <HiExclamationCircle className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-foreground text-lg font-bold tracking-tight uppercase">
                  Incomplete Registration
                </h2>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Your registration appears to be incomplete. Please complete
                  all required steps to finish your registration.
                </p>
              </div>
              <Button
                onClick={() => router.push("/register")}
                variant="default"
                className="h-11 gap-2 rounded-xl text-xs font-bold tracking-widest uppercase"
              >
                Complete Registration
                <HiCheckCircle className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Header with RegistrationStepHeader */}
      <section aria-live="polite" className="mx-auto max-w-2xl">
        <div className="text-center">
          {/* Simplified Animated Checkmark Circle */}
          <div className="mb-5 flex justify-center">
            <div className="relative">
              {/* Single pulsing ring */}
              <div className="border-primary/40 absolute inset-0 animate-ping rounded-full border-2 opacity-30" />
              {/* Checkmark circle */}
              <div className="bg-primary/10 border-primary relative flex h-20 w-20 items-center justify-center rounded-full border-2 sm:h-24 sm:w-24">
                <HiCheckCircle className="text-primary animate-in zoom-in h-10 w-10 duration-500 sm:h-12 sm:w-12" />
              </div>
            </div>
          </div>

          <RegistrationStepHeader
            icon={PartyPopper}
            badge="Registration Complete"
            title={`You're all set, ${firstName}!`}
            description="Your registration has been saved securely"
          />
        </div>
      </section>

      {/* Navigation Actions */}
      <nav aria-label="Next steps" className="mx-auto max-w-2xl">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <Button
            asChild
            size="default"
            variant="outline"
            className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 h-11 rounded-xl px-5 text-xs font-bold tracking-widest uppercase transition-colors"
          >
            <Link href="/voter/profile" aria-label="View my profile">
              <HiUser className="mr-2 h-3.5 w-3.5" />
              View My Profile
            </Link>
          </Button>
          <Button
            asChild
            size="default"
            variant="outline"
            className="border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 h-11 rounded-xl px-5 text-xs font-bold tracking-widest uppercase transition-colors"
          >
            <Link href="/" aria-label="Return to home">
              <HiHome className="mr-2 h-3.5 w-3.5" />
              Return Home
            </Link>
          </Button>
          <Button
            size="default"
            variant="outline"
            className="border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 h-11 rounded-xl px-5 text-xs font-bold tracking-widest uppercase transition-colors"
            onClick={() => {
              reset();
              router.push("/register");
            }}
            aria-label="Start a new registration"
          >
            <HiUserAdd className="mr-2 h-3.5 w-3.5" />
            New Registration
          </Button>
        </div>
      </nav>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-border/60 bg-card relative overflow-hidden border shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)]"
      >
        {/* Architectural Markers */}
        <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
        <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />

        <div className="space-y-8 p-7 sm:p-10">
          <div className="border-border/40 flex items-start justify-between gap-4 border-b pb-6">
            <div className="space-y-1">
              <h2 className="text-foreground text-lg font-bold tracking-tight uppercase">
                Your Registration Summary
              </h2>
              <div className="flex items-center gap-2">
                <div className="bg-primary/60 size-1.5 rounded-[1px]" />
                <p className="text-muted-foreground font-mono text-[10px] font-medium tracking-widest uppercase">
                  System Status <span className="text-primary/40 mx-1">|</span>{" "}
                  <span className="text-foreground font-bold">Complete</span>
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="h-9 gap-1.5 rounded-lg px-3 text-xs font-bold tracking-widest uppercase"
              aria-label="Export registration summary"
            >
              <HiDownload className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
          {registrationRef && (
            <div className="-mt-4">
              <div className="bg-muted/50 border-border/60 inline-flex items-center gap-2 rounded-md border px-3 py-1.5">
                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  Registration Reference:
                </span>
                <span className="text-foreground font-mono text-xs font-bold tracking-wider">
                  {registrationRef}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {/* Personal Info */}
            <div className="space-y-4">
              <div className="text-primary flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                <HiUser className="h-4 w-4" />
                <span>Personal Information</span>
              </div>
              <div className="bg-muted/5 border-border/60 rounded-xl border p-5">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                      Full Name
                    </dt>
                    <dd className="text-foreground mt-1 text-sm font-bold uppercase">
                      {fullName || "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                      Email
                    </dt>
                    <dd className="text-foreground mt-1 text-sm font-medium">
                      {payload.basic?.email || "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                      Role
                    </dt>
                    <dd className="mt-1">
                      <Badge
                        variant={
                          payload.basic?.role === "voter"
                            ? "default"
                            : "secondary"
                        }
                        className="rounded-md px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase"
                      >
                        {payload.basic?.role || "Not specified"}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                      Age
                    </dt>
                    <dd className="text-foreground mt-1 text-sm font-medium">
                      {payload.basic?.age
                        ? `${payload.basic.age} years`
                        : "Not provided"}
                    </dd>
                  </div>
                  {payload.basic?.vin && (
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
                        VIN Status
                      </dt>
                      <dd className="mt-1">
                        <Badge
                          variant="default"
                          className="gap-1.5 rounded-md px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase"
                        >
                          <HiShieldCheck className="h-3 w-3" />
                          Registered Voter
                        </Badge>
                      </dd>
                    </div>
                  )}
                  {payload.canvasser?.canvasserCode && (
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                        Referred by Canvasser
                      </dt>
                      <dd className="text-foreground mt-1 font-mono text-sm font-bold tracking-wider">
                        Code: {payload.canvasser.canvasserCode}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
                      Gender
                    </dt>
                    <dd className="text-foreground mt-1 text-sm font-medium capitalize">
                      {payload.basic?.gender || "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
                      Occupation
                    </dt>
                    <dd className="text-foreground mt-1 text-sm font-medium capitalize">
                      {payload.basic?.occupation
                        ? payload.basic.occupation.replace(/-/g, " ")
                        : "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
                      Religion
                    </dt>
                    <dd className="text-foreground mt-1 text-sm font-medium capitalize">
                      {payload.basic?.religion || "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
                      Phone
                    </dt>
                    <dd className="text-foreground mt-1 font-mono text-sm font-medium tracking-wide">
                      {payload.phone || "Not provided"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <Separator className="bg-border/60" />

            {/* Location */}
            <div className="space-y-4">
              <div className="text-primary flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                <HiLocationMarker className="h-4 w-4" />
                <span>Voting Location</span>
              </div>
              <div className="bg-muted/5 border-border/60 rounded-xl border p-5">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                      State
                    </dt>
                    <dd className="text-foreground mt-1 text-sm font-medium">
                      {payload.location?.state || "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                      LGA
                    </dt>
                    <dd className="text-foreground mt-1 text-sm font-medium">
                      {payload.location?.lga || "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                      Ward
                    </dt>
                    <dd className="text-foreground mt-1 text-sm font-medium">
                      {payload.location?.ward || "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                      Polling Unit
                    </dt>
                    <dd className="text-foreground mt-1 text-sm font-medium">
                      {payload.location?.pollingUnit || "Not provided"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <Separator className="bg-border/60" />

            {/* Candidate Support */}
            <div className="space-y-4">
              <div className="text-primary flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                <HiUsers className="h-4 w-4" />
                <span>Your Selected Candidates</span>
              </div>
              <div className="bg-muted/5 border-border/60 space-y-4 rounded-xl border p-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <HiUsers className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                      {isMultiCandidateMode
                        ? "Positions Selected"
                        : "Candidate Selected"}
                    </span>
                  </div>
                  {hasCandidates ? (
                    <div className="ml-6 space-y-3">
                      {isLoadingAnyCandidate ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      ) : hasCandidateError ? (
                        <div className="flex items-center gap-2">
                          <HiExclamationCircle className="text-destructive h-4 w-4 shrink-0" />
                          <p className="text-destructive text-xs">
                            Failed to load some candidate details
                          </p>
                        </div>
                      ) : (
                        // Group by position for better organization
                        Object.entries(candidatesData)
                          .sort(([a], [b]) => {
                            // Sort positions: President, Governor, Senator, House of Reps, State Assembly
                            const order = [
                              "President",
                              "Governor",
                              "Senator",
                              "House of Representatives",
                              "State Assembly",
                            ];
                            return (
                              (order.indexOf(a) === -1
                                ? 999
                                : order.indexOf(a)) -
                              (order.indexOf(b) === -1 ? 999 : order.indexOf(b))
                            );
                          })
                          .map(([position, candidates]) => (
                            <div key={position} className="space-y-2">
                              {isMultiCandidateMode && (
                                <p className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
                                  {getPositionLabel(position)}
                                </p>
                              )}
                              {candidates.map(({ candidate }) => (
                                <div
                                  key={candidate.id}
                                  className="bg-background/50 border-border/60 rounded-md border p-3"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-foreground text-xs font-bold tracking-wide uppercase">
                                        {candidate.name}
                                      </p>
                                      <p className="text-muted-foreground mt-0.5 text-[10px] font-medium uppercase">
                                        {candidate.party}
                                        {!isMultiCandidateMode &&
                                          candidate.position && (
                                            <>
                                              {" "}
                                              •{" "}
                                              {getPositionLabel(
                                                candidate.position,
                                              )}
                                            </>
                                          )}
                                      </p>
                                    </div>
                                    {isMultiCandidateMode && (
                                      <Badge
                                        variant="outline"
                                        className="bg-primary/5 text-primary border-primary/20 shrink-0 text-[8px] font-bold tracking-wider uppercase"
                                      >
                                        {getPositionLabel(position)}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))
                      )}
                    </div>
                  ) : (
                    !isLoadingAnyCandidate && (
                      <div className="bg-muted/30 border-border/60 ml-6 rounded-md border p-2.5">
                        <p className="text-muted-foreground text-xs">
                          No candidate selected
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-100">
              <HiShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="space-y-1">
                <p className="text-xs font-bold tracking-widest uppercase">
                  Important: 7-Day Update Window
                </p>
                <p className="text-xs leading-relaxed opacity-90">
                  You can update your information once within 7 days. After
                  that, your registration is locked to maintain election
                  integrity.
                </p>
              </div>
            </div>

            {/* What Happens Next */}
            <div className="bg-muted/30 border-border rounded-xl border p-5">
              <h3 className="text-foreground mb-3 text-xs font-bold tracking-widest uppercase">
                What Happens Next?
              </h3>
              <ul className="space-y-2 text-xs">
                <li className="text-muted-foreground flex items-start gap-2 text-xs leading-relaxed">
                  <span className="text-primary mt-0.5 shrink-0">•</span>
                  <span>
                    You'll receive a confirmation email with your registration
                    details
                  </span>
                </li>
                <li className="text-muted-foreground flex items-start gap-2 text-xs leading-relaxed">
                  <span className="text-primary mt-0.5 shrink-0">•</span>
                  <span>Your registration is saved in the WardWise system</span>
                </li>
                <li className="text-muted-foreground flex items-start gap-2 text-xs leading-relaxed">
                  <span className="text-primary mt-0.5 shrink-0">•</span>
                  <span>
                    Visit your profile to track your registration status
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Share WardWise Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="border-border/60 bg-card/80 relative overflow-hidden border p-6 backdrop-blur-sm"
      >
        {/* Architectural Markers */}
        <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
        <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="border-primary/30 bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
              <HiShare className="text-primary h-5 w-5" />
            </div>
            <div>
              <h3 className="text-foreground text-sm font-bold tracking-widest uppercase">
                Share WardWise
              </h3>
              <p className="text-muted-foreground text-xs font-medium">
                Spread the word with your network
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary hover:bg-primary/10 h-9 gap-1.5 rounded-lg px-3 text-[10px] font-bold tracking-widest uppercase"
              onClick={handleWhatsAppShare}
              aria-label="Share on WhatsApp"
            >
              <FaWhatsapp className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary hover:bg-primary/10 h-9 gap-1.5 rounded-lg px-3 text-[10px] font-bold tracking-widest uppercase"
              onClick={handleEmailShare}
              aria-label="Share via Email"
            >
              <HiMail className="h-3.5 w-3.5" />
              <span>Email</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary hover:bg-primary/10 h-9 gap-1.5 rounded-lg px-3 text-[10px] font-bold tracking-widest uppercase"
              onClick={handleSMSShare}
              aria-label="Share via SMS"
            >
              <HiChatAlt className="h-3.5 w-3.5" />
              <span>SMS</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary hover:bg-primary/10 h-9 gap-1.5 rounded-lg px-3 text-[10px] font-bold tracking-widest uppercase"
              onClick={handleCopyLink}
              aria-label="Copy share link"
            >
              <HiClipboardCopy className="h-3.5 w-3.5" />
              <span>Copy link</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Subtle Trust Indicators */}
      <TrustIndicators
        items={[
          {
            icon: <HiShieldCheck />,
            label: "COMPLETE_REGISTRATION",
          },
          { icon: <HiLockClosed />, label: "SECURE_DATA" },
          {
            icon: <HiCheckCircle />,
            label: "READY_TO_PARTICIPATE",
          },
        ]}
      />
    </div>
  );
}
