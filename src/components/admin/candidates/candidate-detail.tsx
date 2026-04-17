"use client";

import { use } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { adminApi, type CandidateWithUser } from "@/lib/api/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { nigeriaStates } from "@/lib/data/state-lga-locations";

import { CandidateOverview } from "./candidate-overview";
import { CandidateCampaigns } from "./candidate-campaigns";
import { CandidateAccount } from "./candidate-account";
import {
  AdminResourceState,
  adminResourceStateIcons,
} from "@/components/admin/shared/admin-resource-state";

const ONBOARDING_STATUS_STYLES: Record<string, string> = {
  pending: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  credentials_sent: "bg-muted text-muted-foreground border-border/60",
  active: "bg-primary/10 text-primary border-primary/30",
  suspended: "bg-destructive/10 text-destructive border-destructive/30",
};

function resolveStateName(stateCode: string | null): string {
  if (!stateCode) return "";
  return nigeriaStates.find((s) => s.code === stateCode)?.name ?? stateCode;
}

const TABS = ["overview", "campaigns", "account"] as const;

export function CandidateDetail({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = use(paramsPromise);
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = searchParams.get("tab") ?? "overview";

  const { data: candidate, isLoading } = useQuery<CandidateWithUser | null>({
    queryKey: ["admin", "candidates", id],
    queryFn: () => adminApi.candidates.getById(id),
    staleTime: 1000 * 60,
  });

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`?${params.toString()}`);
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-xs sm:w-72" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <AdminResourceState
          tone="missing"
          title="Candidate not found"
          description="This candidate may have been deleted, or the link may be incorrect."
          action={{
            label: "Back to Candidates",
            href: "/admin/candidates",
            icon: adminResourceStateIcons.back,
            variant: "outline",
          }}
        />
      </div>
    );
  }

  const statusLabel = candidate.onboardingStatus
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const stateName = resolveStateName(candidate.stateCode);

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:gap-6 md:p-6">
      {/* Header Zone */}
      <header className="flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="text-foreground/90 hover:text-foreground font-mono text-[9px] font-bold tracking-[0.15em] uppercase transition-colors"
              >
                <Link href="/admin/candidates">Candidates</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/70">
              /
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground/40 font-mono text-[9px] font-bold tracking-[0.15em] uppercase">
                {candidate.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <h1 className="text-foreground text-[1.9rem] leading-none font-extrabold tracking-tighter sm:text-4xl">
                {candidate.title ? `${candidate.title} ` : ""}
                {candidate.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase ${ONBOARDING_STATUS_STYLES[candidate.onboardingStatus] ?? ""}`}
                >
                  {statusLabel}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-primary/20 bg-primary/5 text-primary rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                >
                  {candidate.party}
                </Badge>
              </div>
            </div>

            <div className="text-foreground/70 flex flex-col items-start gap-1.5 font-mono text-[9px] font-bold tracking-widest uppercase sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2 sm:text-[10px]">
              <div className="flex max-w-full items-center gap-2">
                <span className="bg-primary/40 size-1.5 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
                <span>{candidate.position}</span>
              </div>
              {stateName && (
                <div className="flex max-w-full items-center gap-2">
                  <span className="bg-border size-1.5 rounded-full" />
                  <span>{stateName}</span>
                </div>
              )}
              {candidate.constituency && (
                <div className="flex max-w-full items-center gap-2">
                  <span className="bg-border size-1.5 rounded-full" />
                  <span className="wrap-break-word">
                    {candidate.constituency}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="from-border/80 via-border/40 h-px w-full bg-linear-to-r to-transparent" />
      </header>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="bg-muted w-fit justify-start overflow-x-auto rounded-sm [scrollbar-width:none] sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="flex-none rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <CandidateOverview candidate={candidate} />
        </TabsContent>
        <TabsContent value="campaigns">
          <CandidateCampaigns candidateId={id} />
        </TabsContent>
        <TabsContent value="account">
          <CandidateAccount candidate={candidate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
