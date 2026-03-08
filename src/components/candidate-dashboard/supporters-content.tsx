"use client";

import { useState } from "react";
import { useCandidateSupporters } from "@/hooks/use-candidate-dashboard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconUsers,
  IconLock,
  IconArrowRight,
} from "@tabler/icons-react";
import Link from "next/link";

// Mock tier — in production, fetch from subscription API
const CURRENT_TIER: "starter" | "standard" | "premium" = "starter";

export function SupportersContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 25;

  const {
    data: supportersData,
    isLoading,
    error,
  } = useCandidateSupporters({
    page,
    pageSize,
    search: search || undefined,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Supporters</CardTitle>
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

  const supporters = supportersData?.supporters || [];
  const total = supportersData?.total || 0;
  const totalPages = supportersData?.totalPages || 0;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Supporters</h1>
          <p className="text-muted-foreground text-sm">
            View and manage all voters supporting your campaign
          </p>
        </div>
        <div className="relative">
          <IconSearch className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search supporters..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-64 pl-9"
          />
        </div>
      </div>

      {/* Tier Upgrade Banner */}
      {CURRENT_TIER === "starter" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
              <IconLock className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium">
                Upgrade to see contact information
              </p>
              <p className="text-muted-foreground text-xs">
                Standard plan includes phone numbers and email addresses.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link href="/dashboard/pricing">
                View Plans
                <IconArrowRight className="ml-1 size-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Supporters</CardTitle>
              <CardDescription>{total} total supporters</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {supporters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <IconUsers className="text-muted-foreground mb-4 size-12" />
              <h3 className="mb-2 text-lg font-semibold">
                {search ? "No supporters found" : "No supporters yet"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {search
                  ? "Try adjusting your search terms"
                  : "Supporters will appear here once canvassers register voters in the field"}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Ward</TableHead>
                    {(CURRENT_TIER === "standard" ||
                      CURRENT_TIER === "premium") && (
                      <>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                      </>
                    )}

                    <TableHead>Registered</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supporters.map((supporter) => (
                    <TableRow key={supporter.id}>
                      <TableCell className="font-medium">
                        {supporter.firstName} {supporter.middleName || ""}{" "}
                        {supporter.lastName}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{supporter.lga}</span>
                          <span className="text-muted-foreground text-xs">
                            {supporter.state}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{supporter.ward}</TableCell>
                      {(CURRENT_TIER === "standard" ||
                        CURRENT_TIER === "premium") && (
                        <>
                          <TableCell className="text-sm">
                            {supporter.phoneNumber || "\u2014"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {supporter.email || "\u2014"}
                          </TableCell>
                        </>
                      )}

                      <TableCell>
                        {new Date(
                          supporter.registrationDate,
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Registered</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    Showing {(page - 1) * pageSize + 1} to{" "}
                    {Math.min(page * pageSize, total)} of {total} supporters
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <IconChevronLeft className="size-4" />
                      Previous
                    </Button>
                    <span className="text-muted-foreground text-sm">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    >
                      Next
                      <IconChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
