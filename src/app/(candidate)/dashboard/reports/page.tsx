import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Campaign Reports",
  description:
    "View and download campaign reports including supporter lists, analytics summaries, and ward breakdowns.",
};

export default function ReportsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Campaign Reports
        </h1>
        <p className="text-muted-foreground text-sm">
          View and download campaign reports
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>
            Campaign reporting functionality will be implemented here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            This page will contain downloadable reports including supporter
            lists, analytics summaries, and ward breakdowns.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
