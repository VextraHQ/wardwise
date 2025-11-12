import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-5 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-2 h-8 w-20" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}

export function CandidateCardSkeleton() {
  return (
    <div className="border-border/50 hover:border-primary/30 flex flex-col gap-4 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 space-y-2">
        {/* Name with badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-5 w-28 sm:w-36" />
          <Skeleton className="h-5 w-14 rounded-full sm:w-16" />
          <Skeleton className="h-5 w-20 rounded-full sm:w-24" />
        </div>
        {/* Email */}
        <Skeleton className="h-4 w-full max-w-[200px] sm:w-48" />
        {/* Constituency with supporters */}
        <Skeleton className="h-4 w-full max-w-[280px] sm:w-64" />
        {/* Created date */}
        <Skeleton className="h-3 w-32 sm:w-36" />
      </div>
      {/* Action buttons */}
      <div className="flex gap-2 sm:shrink-0">
        <Skeleton className="h-9 w-full flex-1 sm:w-20" />
        <Skeleton className="h-9 w-full flex-1 sm:w-20" />
      </div>
    </div>
  );
}

export function VoterCardSkeleton() {
  return (
    <div className="border-border/50 hover:border-primary/30 flex flex-col gap-4 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 space-y-2">
        {/* Full name */}
        <Skeleton className="h-5 w-full max-w-[180px] sm:w-48" />
        {/* NIN and email */}
        <Skeleton className="h-4 w-full max-w-[240px] sm:w-56" />
        {/* State • LGA • Ward */}
        <Skeleton className="h-4 w-full max-w-[200px] sm:w-52" />
        {/* Registered date */}
        <Skeleton className="h-3 w-32 sm:w-36" />
      </div>
      {/* Delete button */}
      <Skeleton className="h-9 w-full sm:w-20 sm:shrink-0" />
    </div>
  );
}
