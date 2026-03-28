import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <Card className="border-border/60 rounded-sm shadow-none border-dashed animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <Skeleton className="h-4 w-32 rounded-sm" />
        <Skeleton className="h-5 w-5 rounded-sm" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-2 h-8 w-20 rounded-sm" />
        <Skeleton className="h-3 w-24 rounded-sm" />
      </CardContent>
    </Card>
  );
}

export function CandidateCardSkeleton() {
  return (
    <div className="border-border/60 animate-pulse flex flex-col gap-4 rounded-sm border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 space-y-2">
        {/* Name with badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-5 w-28 rounded-sm sm:w-36" />
          <Skeleton className="h-5 w-14 rounded-sm sm:w-16" />
          <Skeleton className="h-5 w-20 rounded-sm sm:w-24" />
        </div>
        {/* Email */}
        <Skeleton className="h-4 w-full max-w-[200px] rounded-sm sm:w-48" />
        {/* Constituency with supporters */}
        <Skeleton className="h-4 w-full max-w-[280px] rounded-sm sm:w-64" />
        {/* Created date */}
        <Skeleton className="h-3 w-32 rounded-sm sm:w-36" />
      </div>
      {/* Action buttons */}
      <div className="flex gap-2 sm:shrink-0">
        <Skeleton className="h-9 w-full flex-1 rounded-sm sm:w-20" />
        <Skeleton className="h-9 w-full flex-1 rounded-sm sm:w-20" />
      </div>
    </div>
  );
}

export function VoterCardSkeleton() {
  return (
    <div className="border-border/60 animate-pulse flex flex-col gap-4 rounded-sm border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 space-y-2">
        {/* Full name */}
        <Skeleton className="h-5 w-full max-w-[180px] rounded-sm sm:w-48" />
        {/* NIN and email */}
        <Skeleton className="h-4 w-full max-w-[240px] rounded-sm sm:w-56" />
        {/* State • LGA • Ward */}
        <Skeleton className="h-4 w-full max-w-[200px] rounded-sm sm:w-52" />
        {/* Registered date */}
        <Skeleton className="h-3 w-32 rounded-sm sm:w-36" />
      </div>
      {/* Delete button */}
      <Skeleton className="h-9 w-full rounded-sm sm:w-20 sm:shrink-0" />
    </div>
  );
}

