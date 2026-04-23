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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconUsers,
  IconLock,
  IconArrowRight,
} from "@tabler/icons-react";
import Link from "next/link";
import { composeFullName, formatPersonName } from "@/lib/utils";

// Mock tier — in production, fetch from subscription API
const CURRENT_TIER: "starter" | "standard" | "premium" = "starter";

export function SupportersContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(25);

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
          <Skeleton className="bg-muted/20 h-10 w-48 rounded-sm" />
          <Skeleton className="bg-muted/20 h-10 w-64 rounded-sm" />
        </div>
        <Skeleton className="bg-muted/20 h-96 rounded-sm" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card className="border-border/60 w-full max-w-md rounded-sm shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-tight">
              Error Loading Supporters
            </CardTitle>
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
            className="w-64 rounded-sm pl-9 text-sm shadow-none focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Tier Upgrade Banner */}
      {CURRENT_TIER === "starter" && (
        <Card className="border-primary/20 bg-primary/5 rounded-sm shadow-none">
          <CardContent className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-sm">
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
            <Button
              variant="outline"
              size="sm"
              asChild
              className="shrink-0 rounded-sm font-mono text-[11px] tracking-widest uppercase"
            >
              <Link href="/dashboard/pricing">
                View Plans
                <IconArrowRight className="ml-1 size-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight">
                All Supporters
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1 text-sm">
                {total} total supporters
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {supporters.length === 0 ? (
            <div className="border-border flex flex-col items-center justify-center rounded-sm border border-dashed py-12 text-center">
              <IconUsers className="text-muted-foreground mb-4 size-12" />
              <h3 className="mb-2 text-sm font-semibold tracking-tight">
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
              <div className="border-border/60 overflow-hidden rounded-sm border">
                <Table>
                  <TableHeader className="bg-muted/30 border-border/60 sticky top-0 z-10 border-b">
                    <TableRow>
                      <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                        Name
                      </TableHead>
                      <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                        Location
                      </TableHead>
                      <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                        Ward
                      </TableHead>
                      {(CURRENT_TIER === "standard" ||
                        CURRENT_TIER === "premium") && (
                        <>
                          <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                            Phone
                          </TableHead>
                          <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                            Email
                          </TableHead>
                        </>
                      )}

                      <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                        Registered
                      </TableHead>
                      <TableHead className="text-muted-foreground h-10 font-mono text-[10px] font-bold tracking-widest uppercase">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supporters.map((supporter) => (
                      <TableRow key={supporter.id}>
                        <TableCell className="font-medium">
                          {formatPersonName(
                            composeFullName({
                              firstName: supporter.firstName,
                              middleName: supporter.middleName,
                              lastName: supporter.lastName,
                            }),
                          )}
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
                          <Badge
                            variant="outline"
                            className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                          >
                            Registered
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-muted-foreground hidden flex-1 font-mono text-[11px] tracking-wider lg:flex">
                    Showing {(page - 1) * pageSize + 1} to{" "}
                    {Math.min(page * pageSize, total)} of {total} supporters
                  </div>
                  <div className="flex w-full items-center gap-8 lg:w-fit">
                    <div className="hidden items-center gap-2 lg:flex">
                      <Label className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                        Rows per page
                      </Label>
                      <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                          setPageSize(Number(value));
                          setPage(1);
                        }}
                      >
                        <SelectTrigger size="sm" className="w-20 rounded-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent side="top">
                          {[10, 20, 25, 50].map((size) => (
                            <SelectItem key={size} value={`${size}`}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex w-fit items-center justify-center font-mono text-[11px] font-medium tracking-wider">
                      Page {page} of {totalPages}
                    </div>
                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                      <Button
                        variant="outline"
                        className="hidden h-8 w-8 rounded-sm p-0 lg:flex"
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                      >
                        <span className="sr-only">Go to first page</span>
                        <IconChevronsLeft />
                      </Button>
                      <Button
                        variant="outline"
                        className="size-8 rounded-sm"
                        size="icon"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <span className="sr-only">Go to previous page</span>
                        <IconChevronLeft />
                      </Button>
                      <Button
                        variant="outline"
                        className="size-8 rounded-sm"
                        size="icon"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                      >
                        <span className="sr-only">Go to next page</span>
                        <IconChevronRight />
                      </Button>
                      <Button
                        variant="outline"
                        className="hidden size-8 rounded-sm lg:flex"
                        size="icon"
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages}
                      >
                        <span className="sr-only">Go to last page</span>
                        <IconChevronsRight />
                      </Button>
                    </div>
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
