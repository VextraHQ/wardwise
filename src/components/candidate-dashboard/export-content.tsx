"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconDownload } from "@tabler/icons-react";

export function ExportContent() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Export Data</h1>
        <p className="text-muted-foreground text-sm">
          Export supporter data and analytics
        </p>
      </div>

      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-tight">
            Export Options
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1 text-sm">
            Data export functionality will be implemented here
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            This page will allow exporting supporter lists, field reports, and
            analytics data in various formats (CSV, Excel, PDF).
          </p>
          <div className="flex gap-2">
            <Button
              disabled
              className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
            >
              <IconDownload className="mr-2 size-4" />
              Export Supporters
            </Button>
            <Button
              disabled
              variant="outline"
              className="rounded-sm font-mono text-[11px] tracking-widest uppercase"
            >
              <IconDownload className="mr-2 size-4" />
              Export Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
