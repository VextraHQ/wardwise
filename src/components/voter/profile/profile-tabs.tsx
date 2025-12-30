"use client";

import { type ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileTabsProps {
  children: ReactNode;
  defaultValue?: string;
}

export function ProfileTabs({
  children,
  defaultValue = "overview",
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} className="space-y-4 sm:space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview" className="text-xs sm:text-sm">
          Overview
        </TabsTrigger>
        <TabsTrigger value="details" className="text-xs sm:text-sm">
          Details
        </TabsTrigger>
        <TabsTrigger value="updates" className="text-xs sm:text-sm">
          Updates
        </TabsTrigger>
        <TabsTrigger value="privacy" className="text-xs sm:text-sm">
          Privacy
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
