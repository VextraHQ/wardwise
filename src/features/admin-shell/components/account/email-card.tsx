"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconClockHour4, IconMail, IconX } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  ACCOUNT_DATETIME_OPTIONS,
  useEditModeForm,
} from "@/features/admin-shell/lib/account";
import {
  useCancelAdminEmailChange,
  useRequestAdminEmailChange,
} from "@/features/admin-shell/hooks/use-admin";
import type { PendingAdminEmailChange } from "@/features/admin-shell/api/admin-api";
import { formatDisplayDateTime } from "@/lib/date-format";
import {
  requestAdminEmailChangeSchema,
  type RequestAdminEmailChangeFormValues,
} from "@/lib/schemas/admin-schemas";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { RevealablePasswordInput } from "@/features/admin-shell/components/account/ui";

interface EmailCardProps {
  currentEmail: string;
  pending: PendingAdminEmailChange | null;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaved: () => void;
}

function PendingEmailRow({
  pending,
  onCancel,
  isCancelling,
}: {
  pending: PendingAdminEmailChange;
  onCancel: () => void;
  isCancelling: boolean;
}) {
  return (
    <div className="rounded-sm border border-orange-500/30 bg-orange-500/5 px-3 py-3">
      <div className="flex items-start gap-3">
        <IconClockHour4 className="mt-0.5 size-4 shrink-0 text-orange-700 dark:text-orange-300" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="font-mono text-[10px] font-bold tracking-widest text-orange-700 uppercase dark:text-orange-300">
            Pending confirmation
          </p>
          <p className="text-sm font-medium wrap-anywhere">
            {pending.targetEmail}
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Click the confirmation link we sent to switch your sign-in email.
            Until then, keep using your current address.
          </p>
          <p
            className="text-muted-foreground font-mono text-[10px] font-bold tracking-wide uppercase"
            title={formatDisplayDateTime(
              pending.expiresAt,
              ACCOUNT_DATETIME_OPTIONS,
              "—",
            )}
          >
            Expires{" "}
            {formatDisplayDateTime(
              pending.expiresAt,
              ACCOUNT_DATETIME_OPTIONS,
              "—",
            )}
          </p>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isCancelling}
          className="h-9 w-full rounded-sm font-mono text-[10px] font-bold tracking-widest uppercase sm:h-8 sm:w-auto"
        >
          {isCancelling ? (
            <Spinner className="mr-1.5 size-3.5" />
          ) : (
            <IconX className="mr-1.5 size-3.5" />
          )}
          {isCancelling ? "Cancelling..." : "Cancel pending"}
        </Button>
      </div>
    </div>
  );
}

export function EmailCard({
  currentEmail,
  pending,
  isEditing,
  onEdit,
  onCancel,
  onSaved,
}: EmailCardProps) {
  const request = useRequestAdminEmailChange();
  const cancel = useCancelAdminEmailChange();

  const defaults = useMemo<RequestAdminEmailChangeFormValues>(
    () => ({ newEmail: "", currentPassword: "" }),
    [],
  );

  const form = useForm<RequestAdminEmailChangeFormValues>({
    resolver: zodResolver(requestAdminEmailChangeSchema),
    defaultValues: defaults,
  });

  useEditModeForm(isEditing, form, "newEmail", defaults);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <Card className="border-border/60 rounded-sm shadow-none">
      <CardHeader className="border-border/60 border-b px-4 sm:px-6">
        <CardTitle className="text-foreground font-mono text-[11px] font-bold tracking-widest uppercase">
          Sign-in Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <p className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
              Current email
            </p>
            <p className="text-foreground text-sm font-medium wrap-anywhere">
              {currentEmail}
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Recovery stays anchored here until a new inbox confirms.
            </p>
          </div>
          {!pending ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-9 w-full shrink-0 rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:h-8 sm:w-auto"
            >
              <IconMail className="mr-1.5 size-3.5" />
              Change email
            </Button>
          ) : null}
        </div>

        {pending ? (
          <PendingEmailRow
            pending={pending}
            onCancel={() =>
              cancel.mutate(undefined, {
                onSuccess: () =>
                  toast.success("Pending email change cancelled"),
                onError: (err: Error) =>
                  toast.error(err.message || "Could not cancel."),
              })
            }
            isCancelling={cancel.isPending}
          />
        ) : null}
      </CardContent>

      <Dialog open={isEditing} onOpenChange={(open) => !open && onCancel()}>
        <DialogContent className="border-border/60 max-w-lg gap-0 rounded-sm p-0 shadow-none">
          <DialogHeader className="border-border/60 space-y-2 border-b px-4 py-4 text-left sm:px-5">
            <DialogTitle className="text-foreground font-mono text-[11px] font-bold tracking-widest uppercase">
              Change Sign-in Email
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              We&apos;ll send a confirmation link to the next inbox. Your
              current address stays usable until that link is approved.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(async (values) => {
              try {
                await request.mutateAsync(values);
                onSaved();
                toast.success(
                  "Confirmation link sent. Check the new inbox to finish.",
                );
              } catch (err) {
                toast.error(
                  err instanceof Error
                    ? err.message
                    : "Could not request email change.",
                );
              }
            })}
          >
            <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="email-new"
                  className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase"
                >
                  New email
                </Label>
                <Input
                  id="email-new"
                  type="email"
                  autoComplete="email"
                  className="border-border/60 h-10 rounded-sm text-base sm:h-9 sm:text-sm"
                  {...register("newEmail")}
                />
                {errors.newEmail ? (
                  <p className="text-destructive font-mono text-[10px] font-medium tracking-wide uppercase">
                    {errors.newEmail.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="email-current-password"
                  className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase"
                >
                  Current password
                </Label>
                <RevealablePasswordInput
                  id="email-current-password"
                  autoComplete="current-password"
                  className="border-border/60 h-10 rounded-sm text-base sm:h-9 sm:text-sm"
                  {...register("currentPassword")}
                />
                {errors.currentPassword ? (
                  <p className="text-destructive font-mono text-[10px] font-medium tracking-wide uppercase">
                    {errors.currentPassword.message}
                  </p>
                ) : null}
              </div>
            </div>
            <DialogFooter className="border-border/60 bg-muted/10 border-t px-4 py-4 sm:px-5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting || request.isPending}
                className="h-9 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:h-8 sm:w-auto"
              >
                <IconX className="mr-1.5 size-3.5" />
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || request.isPending}
                className="h-9 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:h-8 sm:w-auto"
              >
                {request.isPending ? (
                  <Spinner className="mr-1.5 size-3.5" />
                ) : (
                  <IconMail className="mr-1.5 size-3.5" />
                )}
                {request.isPending ? "Sending..." : "Send confirmation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
