"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconDeviceFloppy, IconKey, IconX } from "@tabler/icons-react";
import { signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  ACCOUNT_DATETIME_OPTIONS,
  PASSWORD_STALE_DAYS,
  passwordAgeDays,
  useEditModeForm,
} from "@/lib/admin/account";
import { useChangeAdminPassword } from "@/hooks/use-admin";
import { formatDisplayDateTime, formatRelativeTime } from "@/lib/date-format";
import {
  changeAdminPasswordSchema,
  type ChangeAdminPasswordFormValues,
} from "@/lib/schemas/admin-schemas";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { RevealablePasswordInput } from "@/components/admin/account/ui";

interface PasswordCardProps {
  passwordChangedAt: string | null;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

export function PasswordCard({
  passwordChangedAt,
  isEditing,
  onEdit,
  onCancel,
}: PasswordCardProps) {
  const change = useChangeAdminPassword();
  const defaults = useMemo<ChangeAdminPasswordFormValues>(
    () => ({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }),
    [],
  );

  const form = useForm<ChangeAdminPasswordFormValues>({
    resolver: zodResolver(changeAdminPasswordSchema),
    defaultValues: defaults,
  });

  useEditModeForm(isEditing, form, "currentPassword", defaults);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const ageDays = passwordAgeDays(passwordChangedAt);
  const isStale = ageDays !== null && ageDays > PASSWORD_STALE_DAYS;

  return (
    <Card className="border-border/60 rounded-sm shadow-none">
      <CardHeader className="border-border/60 border-b px-4 sm:px-6">
        <CardTitle className="text-foreground font-mono text-[11px] font-bold tracking-widest uppercase">
          Password Security
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <p className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
              Last updated
            </p>
            <p
              className={cn(
                "text-sm font-medium",
                isStale
                  ? "text-amber-700 dark:text-amber-300"
                  : "text-foreground",
              )}
              title={
                passwordChangedAt
                  ? formatDisplayDateTime(
                      passwordChangedAt,
                      ACCOUNT_DATETIME_OPTIONS,
                    )
                  : undefined
              }
            >
              {formatRelativeTime(passwordChangedAt, {
                emptyLabel: "Never",
                olderDateStyle: "months",
              })}
            </p>
            {isStale ? (
              <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                Consider rotating — this password is {ageDays}+ days old.
              </p>
            ) : (
              <p className="text-muted-foreground text-xs leading-relaxed">
                Updating the password signs you out across devices and clears
                pending email confirmations.
              </p>
            )}
          </div>
          {!isEditing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-9 w-full shrink-0 rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:h-8 sm:w-auto"
            >
              <IconKey className="mr-1.5 size-3.5" />
              Change password
            </Button>
          ) : null}
        </div>
      </CardContent>

      <Dialog open={isEditing} onOpenChange={(open) => !open && onCancel()}>
        <DialogContent className="border-border/60 max-w-lg gap-0 rounded-sm p-0 shadow-none">
          <DialogHeader className="border-border/60 space-y-2 border-b px-4 py-4 text-left sm:px-5">
            <DialogTitle className="text-foreground font-mono text-[11px] font-bold tracking-widest uppercase">
              Change Password
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              Use a fresh password to strengthen recovery. Saving signs you out
              across devices and clears pending email confirmations.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(async (values) => {
              try {
                await change.mutateAsync(values);
                toast.success("Password updated. Signing you out…");
                await signOut({
                  callbackUrl: "/login?notice=password-changed",
                });
              } catch (err) {
                toast.error(
                  err instanceof Error
                    ? err.message
                    : "Could not change password.",
                );
              }
            })}
          >
            <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="pwd-current"
                  className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase"
                >
                  Current password
                </Label>
                <RevealablePasswordInput
                  id="pwd-current"
                  autoComplete="current-password"
                  className="border-border/60 h-9 rounded-sm font-mono text-sm"
                  {...register("currentPassword")}
                />
                {errors.currentPassword ? (
                  <p className="text-destructive font-mono text-[10px] font-medium tracking-wide uppercase">
                    {errors.currentPassword.message}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="pwd-new"
                    className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase"
                  >
                    New password
                  </Label>
                  <RevealablePasswordInput
                    id="pwd-new"
                    autoComplete="new-password"
                    className="border-border/60 h-9 rounded-sm font-mono text-sm"
                    {...register("newPassword")}
                  />
                  {errors.newPassword ? (
                    <p className="text-destructive font-mono text-[10px] font-medium tracking-wide uppercase">
                      {errors.newPassword.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="pwd-confirm"
                    className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase"
                  >
                    Confirm new password
                  </Label>
                  <RevealablePasswordInput
                    id="pwd-confirm"
                    autoComplete="new-password"
                    className="border-border/60 h-9 rounded-sm font-mono text-sm"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword ? (
                    <p className="text-destructive font-mono text-[10px] font-medium tracking-wide uppercase">
                      {errors.confirmPassword.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
            <DialogFooter className="border-border/60 bg-muted/10 border-t px-4 py-4 sm:px-5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting || change.isPending}
                className="h-9 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:h-8 sm:w-auto"
              >
                <IconX className="mr-1.5 size-3.5" />
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || change.isPending}
                className="h-9 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:h-8 sm:w-auto"
              >
                {change.isPending ? (
                  <Spinner className="mr-1.5 size-3.5" />
                ) : (
                  <IconDeviceFloppy className="mr-1.5 size-3.5" />
                )}
                {change.isPending ? "Updating..." : "Update password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
