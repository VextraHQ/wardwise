"use client";

import { useSession } from "next-auth/react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPersonName } from "@/lib/utils";

function FieldCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border/60 rounded-sm border px-3 py-3">
      <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-medium wrap-anywhere">{value}</p>
    </div>
  );
}

function PlaceholderRow({ label, status }: { label: string; status: string }) {
  return (
    <div className="border-border/60 flex items-center justify-between gap-3 border-t py-3 first:border-t-0 first:pt-0 last:pb-0">
      <p className="text-sm font-medium">{label}</p>
      <Badge
        variant="outline"
        className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
      >
        {status}
      </Badge>
    </div>
  );
}

export function AdminAccount() {
  const { data: session } = useSession();

  const name = formatPersonName(session?.user?.name || "Super Admin");
  const email = session?.user?.email || "admin@wardwise.ng";
  const role = session?.user?.role === "admin" ? "Super Admin" : "Admin";

  return (
    <div className="flex flex-1 flex-col gap-5 p-3 sm:gap-6 sm:p-4 md:p-6">
      <div className="border-border/60 border-b pb-5">
        <p className="text-muted-foreground/70 font-mono text-[10px] font-bold tracking-widest uppercase">
          Account
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Admin Account
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Simple placeholder for personal account settings. We can expand this
          when profile, security, and preference controls are ready.
        </p>
      </div>

      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader className="border-border/60 border-b">
          <CardDescription className="text-muted-foreground/70 font-mono text-[10px] tracking-widest uppercase">
            Current Account
          </CardDescription>
          <CardTitle className="text-sm font-semibold tracking-tight">
            Signed-In Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar className="bg-primary text-primary-foreground h-12 w-12 rounded-sm">
              <AvatarFallback className="bg-primary text-primary-foreground rounded-sm text-sm font-semibold">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1">
              <p className="truncate text-base font-semibold tracking-tight">
                {name}
              </p>
              <p className="text-muted-foreground truncate text-sm">{email}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FieldCard label="Full Name" value={name} />
            <FieldCard label="Email Address" value={email} />
            <FieldCard label="Role" value={role} />
            <FieldCard label="Entry Route" value="/admin/account" />
          </div>
        </CardContent>
      </Card>

      {/* Intentionally lightweight until real account settings ship. */}
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader className="border-border/60 border-b">
          <CardDescription className="text-muted-foreground/70 font-mono text-[10px] tracking-widest uppercase">
            Placeholder
          </CardDescription>
          <CardTitle className="text-sm font-semibold tracking-tight">
            Future Account Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This page is intentionally lightweight for now. When the account
            surface is fully implemented, profile editing, password controls,
            and personal preferences can live here.
          </p>
          <div className="mt-4">
            <PlaceholderRow label="Profile Editing" status="Later" />
            <PlaceholderRow label="Security Controls" status="Later" />
            <PlaceholderRow label="Personal Preferences" status="Later" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
