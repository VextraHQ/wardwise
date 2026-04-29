"use client";

import {
  HiOutlineFlag,
  HiOutlineGlobe,
  HiOutlineLocationMarker,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import { useGeoStats } from "@/hooks/use-geo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCardSkeleton } from "@/components/admin/admin-skeletons";

export function GeoStatsBar() {
  const { data: stats, isLoading } = useGeoStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  const items = [
    {
      label: "States Seeded",
      icon: HiOutlineGlobe,
      value: `${stats?.statesSeeded ?? 0}/37`,
      subtitle: "of 37 states",
    },
    {
      label: "Total LGAs",
      icon: HiOutlineOfficeBuilding,
      value: stats?.totalLgas.toLocaleString() ?? "0",
      subtitle: "local government areas",
    },
    {
      label: "Total Wards",
      icon: HiOutlineLocationMarker,
      value: stats?.totalWards.toLocaleString() ?? "0",
      subtitle: "wards seeded",
    },
    {
      label: "Polling Units",
      icon: HiOutlineFlag,
      value: stats?.totalPollingUnits.toLocaleString() ?? "0",
      subtitle: "polling units",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {items.map((item) => (
        <Card
          key={item.label}
          className="border-border/60 rounded-sm shadow-none"
        >
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
              {item.label}
            </CardTitle>
            <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm sm:h-9 sm:w-9">
              <item.icon className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-xl font-semibold tabular-nums sm:text-2xl">
              {item.value}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {item.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
