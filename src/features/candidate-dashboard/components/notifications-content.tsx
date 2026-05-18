"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function NotificationsContent() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Notifications
          </h1>
          <p className="text-muted-foreground text-sm">
            Stay updated with campaign activities
          </p>
        </div>
        <Badge
          variant="outline"
          className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
        >
          All
        </Badge>
      </div>

      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-tight">
            Notifications
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1 text-sm">
            Notification system will be implemented here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            This page will show notifications about new supporters, survey
            responses, and campaign updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
