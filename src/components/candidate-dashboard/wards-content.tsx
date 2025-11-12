"use client";

import { useCandidateWardData } from "@/hooks/use-candidate-dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function WardsContent() {
  const { data: wardData, isLoading, error } = useCandidateWardData();

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Ward Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-32" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const { coveredWards, totalWards, coveragePercentage, wardDetails } =
    wardData || {
      coveredWards: 0,
      totalWards: 20,
      coveragePercentage: 0,
      wardDetails: [],
    };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Wards</h1>
          <p className="text-muted-foreground text-sm">
            Ward-by-ward breakdown of supporter distribution
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ward Coverage Overview</CardTitle>
          <CardDescription>
            {coveredWards} of {totalWards} wards have active supporters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Overall Coverage</span>
                <span className="text-muted-foreground">
                  {coveragePercentage}%
                </span>
              </div>
              <Progress value={coveragePercentage} className="h-2" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold">{coveredWards}</div>
                <div className="text-muted-foreground text-sm">
                  Covered Wards
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold">{totalWards}</div>
                <div className="text-muted-foreground text-sm">Total Wards</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold">
                  {totalWards - coveredWards}
                </div>
                <div className="text-muted-foreground text-sm">
                  Remaining Wards
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Ward Details</h2>
        {wardDetails.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="mb-2 text-lg font-semibold">No Ward Data Yet</h3>
              <p className="text-muted-foreground text-center text-sm">
                No ward data available yet. Supporters will appear here once
                they register.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(() => {
              // Calculate the maximum supporter count across all wards for relative progress
              const maxSupporterCount = Math.max(
                ...wardDetails.map((ward) => ward.supporterCount),
                1, // Minimum of 1 to avoid division by zero
              );

              return wardDetails
                .sort((a, b) => b.supporterCount - a.supporterCount)
                .map((ward) => (
                  <Card key={ward.ward}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {ward.ward}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {ward.lga}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            ward.supporterCount > 5
                              ? "default"
                              : ward.supporterCount > 2
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {ward.supporterCount > 5
                            ? "High"
                            : ward.supporterCount > 2
                              ? "Medium"
                              : "Low"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Supporters
                          </span>
                          <span className="text-lg font-semibold">
                            {ward.supporterCount}
                          </span>
                        </div>
                        <Progress
                          value={
                            maxSupporterCount > 0
                              ? Math.min(
                                  (ward.supporterCount / maxSupporterCount) *
                                    100,
                                  100,
                                )
                              : 0
                          }
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
