"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconDeviceFloppy, IconPencil, IconX } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useUpdateAdminProfile } from "@/hooks/use-admin";
import { useEditModeForm } from "@/lib/admin/account";
import {
  updateAdminProfileSchema,
  type UpdateAdminProfileFormValues,
} from "@/lib/schemas/admin-schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

interface ProfileCardProps {
  name: string | null;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaved: (name: string) => void;
}

export function ProfileCard({
  name,
  isEditing,
  onEdit,
  onCancel,
  onSaved,
}: ProfileCardProps) {
  const updateProfile = useUpdateAdminProfile();
  const defaults = useMemo<UpdateAdminProfileFormValues>(
    () => ({ name: name ?? "" }),
    [name],
  );

  const form = useForm<UpdateAdminProfileFormValues>({
    resolver: zodResolver(updateAdminProfileSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!isEditing) form.reset(defaults);
  }, [defaults, form, isEditing]);

  useEditModeForm(isEditing, form, "name", defaults);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = form;

  return (
    <Card className="border-border/60 rounded-sm shadow-none">
      <CardHeader className="border-border/60 border-b px-4 sm:px-6">
        <CardTitle className="text-foreground font-mono text-[11px] font-bold tracking-widest uppercase">
          Profile Identity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 sm:px-6">
        <form
          onSubmit={handleSubmit(async (values) => {
            try {
              const updated = await updateProfile.mutateAsync({
                name: values.name,
              });
              onSaved(updated.name ?? values.name);
              toast.success("Profile updated");
            } catch (err) {
              toast.error(
                err instanceof Error ? err.message : "Could not save profile.",
              );
            }
          })}
          className="space-y-4"
        >
          {isEditing ? (
            <div className="space-y-3">
              <div className="max-w-2xl space-y-1.5">
                <Label
                  htmlFor="profile-name"
                  className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase"
                >
                  Display name
                </Label>
                <div className="space-y-1.5">
                  <Input
                    id="profile-name"
                    autoComplete="name"
                    className="border-border/60 h-10 rounded-sm text-base sm:h-9 sm:text-sm"
                    {...register("name")}
                  />
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Used in the admin shell and account activity.
                  </p>
                  {errors.name ? (
                    <p className="text-destructive font-mono text-[10px] font-medium tracking-wide uppercase">
                      {errors.name.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 sm:flex sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={updateProfile.isPending}
                  className="h-9 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:h-8 sm:w-auto"
                >
                  <IconX className="mr-1.5 size-3.5" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateProfile.isPending || !isDirty}
                  className="h-9 w-full rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:h-8 sm:w-auto"
                >
                  {updateProfile.isPending ? (
                    <Spinner className="mr-1.5 size-3.5" />
                  ) : (
                    <IconDeviceFloppy className="mr-1.5 size-3.5" />
                  )}
                  {updateProfile.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
                  Display name
                </p>
                <div className="space-y-1">
                  <p className="text-foreground text-sm font-medium wrap-anywhere">
                    {name || "—"}
                  </p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Used in the admin shell and account activity.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="h-9 w-full shrink-0 rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase sm:h-8 sm:w-auto"
              >
                <IconPencil className="mr-1.5 size-3.5" />
                Edit
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
