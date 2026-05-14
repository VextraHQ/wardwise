"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { IconAlertTriangle } from "@tabler/icons-react";

import { useAdminAccount } from "@/hooks/use-admin";
import { ACCOUNT_DATETIME_OPTIONS } from "@/lib/admin/account";
import { formatDisplayDateTime, formatRelativeTime } from "@/lib/date-format";

import { EmailCard } from "@/components/admin/account/email-card";
import { PasswordCard } from "@/components/admin/account/password-card";
import { ProfileCard } from "@/components/admin/account/profile-card";
import {
  AccountRecordCard,
  ActivityCard,
  LoadingState,
} from "@/components/admin/account/support-cards";

type EditingSection = "profile" | "email" | "password" | null;

export function AdminAccount() {
  const { data, isLoading, error } = useAdminAccount();
  const { update: updateSession } = useSession();

  const [editingSection, setEditingSection] = useState<EditingSection>(null);

  const account = data?.account;
  const pendingEmailChange = data?.pendingEmailChange ?? null;
  const activity = data?.activity ?? [];

  function beginEdit(section: Exclude<EditingSection, null>) {
    setEditingSection(section);
  }

  function cancelEdit() {
    setEditingSection(null);
  }

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:gap-6 md:p-6">
      <header className="border-border/60 space-y-3 border-b pb-5">
        <p className="text-primary font-mono text-[10px] font-bold tracking-[0.18em] uppercase">
          Account & Security
        </p>
        <div className="space-y-2">
          <h1 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
            Admin Account
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Manage the name, sign-in email, and password behind this admin
            account.
          </p>
        </div>
        {account ? (
          <div className="text-foreground/70 flex min-w-0 flex-row flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[10px] font-bold tracking-widest uppercase">
            <div className="flex max-w-full items-center gap-2">
              <span className="bg-primary/40 size-1.5 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
              <span className="wrap-break-word">{account.email}</span>
            </div>
            <div className="flex max-w-full items-center gap-2">
              <span className="bg-border size-1.5 rounded-full" />
              <span>{account.role === "admin" ? "Admin" : account.role}</span>
            </div>
            <div className="flex max-w-full items-center gap-2">
              <span className="bg-border size-1.5 rounded-full" />
              <span
                title={formatDisplayDateTime(
                  account.lastLoginAt,
                  ACCOUNT_DATETIME_OPTIONS,
                  "—",
                )}
              >
                Last sign-in{" "}
                {formatRelativeTime(account.lastLoginAt, {
                  emptyLabel: "Never",
                  olderDateStyle: "months",
                })}
              </span>
            </div>
          </div>
        ) : null}
      </header>

      {error ? (
        <div className="border-destructive/30 bg-destructive/5 flex items-start gap-3 rounded-sm border p-4">
          <IconAlertTriangle className="text-destructive mt-0.5 size-4 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-destructive text-sm font-semibold">
              Could not load account
            </p>
            <p className="text-muted-foreground text-xs">
              {error instanceof Error ? error.message : "Please try again."}
            </p>
          </div>
        </div>
      ) : null}

      {isLoading || !account ? (
        <LoadingState />
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <div className="space-y-5">
            <ProfileCard
              name={account.name}
              isEditing={editingSection === "profile"}
              onEdit={() => beginEdit("profile")}
              onCancel={cancelEdit}
              onSaved={(newName) => {
                void updateSession({ name: newName });
                cancelEdit();
              }}
            />
            <EmailCard
              currentEmail={account.email}
              pending={pendingEmailChange}
              isEditing={editingSection === "email"}
              onEdit={() => beginEdit("email")}
              onCancel={cancelEdit}
              onSaved={cancelEdit}
            />
            <PasswordCard
              passwordChangedAt={account.passwordChangedAt}
              isEditing={editingSection === "password"}
              onEdit={() => beginEdit("password")}
              onCancel={cancelEdit}
            />
          </div>

          <aside className="space-y-5 xl:sticky xl:top-16">
            <AccountRecordCard account={account} />
            <ActivityCard activity={activity} />
          </aside>
        </div>
      )}
    </div>
  );
}
