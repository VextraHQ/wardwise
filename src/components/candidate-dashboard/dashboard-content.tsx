"use client";

import { useCandidateDashboard } from "@/hooks/use-candidate-dashboard";
import { ChartAreaInteractive } from "@/components/candidate-dashboard/chart-area-interactive";
import { DataTable } from "@/components/candidate-dashboard/data-table";
import { SectionCards } from "@/components/candidate-dashboard/section-cards";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconMapPin,
  IconUsers,
} from "@tabler/icons-react";

export function DashboardContent() {
  const { data: dashboardData, isLoading, error } = useCandidateDashboard();

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="mx-4 h-64 lg:mx-6" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  // Transform ward data for DataTable if available
  const tableData =
    dashboardData?.wardCoverage?.wardDetails.map((ward, index) => ({
      id: index + 1,
      header: ward.ward,
      type: ward.lga,
      status: ward.supporterCount > 0 ? "Active" : "Planning",
      target: ward.supporterCount.toString(),
      limit:
        ward.supporterCount > 5
          ? "High"
          : ward.supporterCount > 2
            ? "Medium"
            : "Low",
      reviewer: ward.supporterCount > 0 ? "Active" : "Inactive",
    })) || [];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards dashboardData={dashboardData} />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive dashboardData={dashboardData} />
          </div>
          <div className="grid gap-4 px-4 md:grid-cols-2 lg:px-6">
            {/* Ward Coverage Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ward Coverage</CardTitle>
                    <CardDescription>
                      Registration activity across your wards
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3 text-center">
                      <div className="mx-auto mb-1 flex size-8 items-center justify-center rounded-lg bg-green-500/10">
                        <IconUsers className="size-4 text-green-600" />
                      </div>
                      <p className="text-foreground text-xl font-bold">
                        {dashboardData?.totalSupporters?.toLocaleString() ||
                          "0"}
                      </p>
                      <p className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
                        Registered
                      </p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <div className="mx-auto mb-1 flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
                        <IconMapPin className="size-4 text-blue-600" />
                      </div>
                      <p className="text-foreground text-xl font-bold">
                        {dashboardData?.wardCoverage?.wardDetails?.length || "0"}
                      </p>
                      <p className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
                        Active Wards
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {tableData.length > 0 && <DataTable data={tableData} />}
        </div>
      </div>
    </div>
  );
}
