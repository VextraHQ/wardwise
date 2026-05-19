"use client";

import { IconClockHour4 } from "@tabler/icons-react";

import type {
  AdminAccount,
  AdminAccountActivityItem,
} from "@/features/admin/api/admin-api";
import {
  ACCOUNT_DATETIME_OPTIONS,
  ADMIN_ACCOUNT_ACTIVITY_PREVIEW_LIMIT,
  describeActivity,
  getActivityContext,
} from "@/features/admin/lib/account";
import { formatDisplayDateTime, formatRelativeTime } from "@/lib/date-format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { OverviewField } from "@/features/admin/components/account/ui";

export function AccountRecordCard({ account }: { account: AdminAccount }) {
  return (
    <Card className="border-border/60 rounded-sm shadow-none">
      <CardHeader className="border-border/60 border-b px-4 sm:px-6">
        <CardTitle className="text-foreground font-mono text-[11px] font-bold tracking-widest uppercase">
          Account Record
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-3">
          <OverviewField
            label="Account Created"
            value={formatDisplayDateTime(
              account.createdAt,
              ACCOUNT_DATETIME_OPTIONS,
              "—",
            )}
          />
          <OverviewField
            label="Last Sign-in"
            value={
              account.lastLoginAt
                ? formatDisplayDateTime(
                    account.lastLoginAt,
                    ACCOUNT_DATETIME_OPTIONS,
                    "—",
                  )
                : "Not yet recorded"
            }
          />
          <OverviewField
            label="Password Changed"
            value={
              account.passwordChangedAt
                ? formatDisplayDateTime(
                    account.passwordChangedAt,
                    ACCOUNT_DATETIME_OPTIONS,
                    "—",
                  )
                : "Never"
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityCard({
  activity,
}: {
  activity: AdminAccountActivityItem[];
}) {
  const atPreviewLimit =
    activity.length >= ADMIN_ACCOUNT_ACTIVITY_PREVIEW_LIMIT;

  return (
    <Card className="border-border/60 rounded-sm shadow-none">
      <CardHeader className="border-border/60 flex flex-row items-start justify-between gap-3 border-b px-4 sm:px-6">
        <CardTitle className="text-foreground font-mono text-[11px] font-bold tracking-widest uppercase">
          Recent Account Activity
        </CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          title="Full team audit log is coming soon"
          className="text-muted-foreground h-7 shrink-0 rounded-sm px-2 font-mono text-[10px] font-bold tracking-widest uppercase"
        >
          View all
        </Button>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {activity.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="bg-muted/40 border-border/60 flex h-10 w-10 items-center justify-center rounded-sm border">
              <IconClockHour4 className="text-muted-foreground size-4" />
            </div>
            <div className="space-y-1">
              <p className="text-foreground text-sm font-medium">
                No account activity yet
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Sign-ins and security events will land here as they happen.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
              Latest {activity.length}{" "}
              {activity.length === 1 ? "event" : "events"}
              {atPreviewLimit
                ? ` (max ${ADMIN_ACCOUNT_ACTIVITY_PREVIEW_LIMIT})`
                : ""}
            </p>
            <ul className="divide-border/60 max-h-72 divide-y overflow-y-auto overscroll-contain">
              {activity.map((entry) => {
                const isFailed = entry.action === "admin.account.login_failed";
                const detail = getActivityContext(entry);
                const fullDate = formatDisplayDateTime(
                  entry.createdAt,
                  ACCOUNT_DATETIME_OPTIONS,
                  "—",
                );

                return (
                  <li
                    key={entry.id}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span
                      className={cn(
                        "mt-1.5 size-1.5 shrink-0 rounded-full",
                        isFailed ? "bg-destructive" : "bg-primary/60",
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium">
                          {describeActivity(entry.action)}
                        </p>
                        <p
                          className="text-muted-foreground shrink-0 font-mono text-[10px] font-bold tracking-wide uppercase"
                          title={fullDate}
                        >
                          {formatRelativeTime(entry.createdAt, {
                            emptyLabel: "Never",
                            olderDateStyle: "months",
                          })}
                        </p>
                      </div>
                      {detail ? (
                        <p className="text-muted-foreground text-xs leading-relaxed wrap-anywhere">
                          {detail}
                        </p>
                      ) : null}
                      {isFailed ? (
                        <Badge
                          variant="outline"
                          className="border-destructive/30 bg-destructive/5 text-destructive rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                        >
                          Failed
                        </Badge>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function LoadingState() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[88px] w-full rounded-sm" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="space-y-5">
          <Skeleton className="h-[250px] w-full rounded-sm" />
          <Skeleton className="h-[250px] w-full rounded-sm" />
          <Skeleton className="h-[260px] w-full rounded-sm" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-[220px] w-full rounded-sm" />
          <Skeleton className="h-[260px] w-full rounded-sm" />
        </div>
      </div>
    </div>
  );
}
