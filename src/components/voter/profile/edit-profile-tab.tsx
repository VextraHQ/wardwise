"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HiUser,
  HiLocationMarker,
  HiMail,
  HiPhone,
  HiLockClosed,
  HiSave,
  HiCheckCircle,
  HiSupport,
  HiChevronDown,
  HiPaperAirplane,
  HiExclamationCircle,
  HiClock,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ComboboxSelect } from "@/components/ui/combobox-select";
import { toast } from "sonner";
import {
  profileEditSchema,
  type ProfileEditFormValues,
} from "@/lib/schemas/voter-schemas";
import { OCCUPATION_OPTIONS } from "@/lib/constants/voter-options";

/**
 * TODO: [BACKEND] Integrate with voter update API endpoint
 * - POST /api/voters/:nin/profile for contact info updates
 * - Should validate edit window server-side (not just client)
 * - Return updated voter data on success
 */

/**
 * TODO: [BACKEND] Support request API
 * - POST /api/support/requests
 * - Store request with voter NIN, type, description
 * - Trigger email notification to support team
 * - Track request status (pending, approved, rejected)
 */

interface EditProfileTabProps {
  payload: {
    basic?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: "voter" | "supporter";
      vin?: string;
      gender?: string;
      age?: number;
      occupation?: string;
      dateOfBirth?: string;
    };
    phone?: string;
    location?: {
      state?: string;
      lga?: string;
      ward?: string;
      pollingUnit?: string;
    };
  };
  canEdit: boolean;
  daysRemaining: number;
  onSave?: (data: ProfileEditFormValues) => Promise<void>;
}

// Convert to ComboboxSelect format (spread to mutable array)
const occupationOptions = OCCUPATION_OPTIONS.map(
  (opt: { value: string; label: string }) => ({
    value: opt.value,
    label: opt.label,
  }),
);

export function EditProfileTab({
  payload,
  canEdit,
  daysRemaining,
  onSave,
}: EditProfileTabProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [supportExpanded, setSupportExpanded] = useState(false);
  const [supportReason, setSupportReason] = useState("");
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      email: payload.basic?.email || "",
      phone: payload.phone || "",
      occupation: payload.basic?.occupation || "",
    },
  });

  const occupation = watch("occupation");

  const onSubmit = async (data: ProfileEditFormValues) => {
    if (!canEdit) {
      toast.error("Edit window has expired");
      return;
    }

    setIsSaving(true);
    try {
      /**
       * TODO: [BACKEND] Replace with actual API call
       * - Validate edit window server-side
       * - Check for rate limiting (prevent spam updates)
       * - Log change in audit trail
       */
      if (onSave) {
        await onSave(data);
      } else {
        // Simulate API call for demo
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSupportRequest = async () => {
    if (!supportReason.trim()) {
      toast.error("Please describe what you need to change");
      return;
    }

    setIsSubmittingSupport(true);
    try {
      /**
       * TODO: [BACKEND] Submit support request
       * - Include voter NIN, requested changes, reason
       * - Send confirmation email to voter
       * - Create ticket in support system
       */
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Request submitted!", {
        description: "We'll respond within 48 hours via email.",
      });
      setSupportReason("");
      setSupportExpanded(false);
    } catch {
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  const fullName = `${payload.basic?.firstName || ""} ${
    payload.basic?.lastName || ""
  }`.trim();

  const hasProfileData = Boolean(payload.basic?.firstName);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Edit Window Status Alert */}
      {canEdit ? (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <HiClock className="size-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-800 sm:text-sm dark:text-amber-200">
            <span className="font-bold">
              {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
            </span>{" "}
            remaining to edit your contact information. After this, changes
            require support approval.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-border bg-muted/30">
          <HiLockClosed className="text-muted-foreground size-4" />
          <AlertDescription className="text-muted-foreground text-xs sm:text-sm">
            Edit window expired. Submit a support request below to request
            changes.
          </AlertDescription>
        </Alert>
      )}

      {/* Editable Contact Information */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-border/60 bg-card relative overflow-hidden border"
        >
          <div className="border-primary/30 absolute top-0 left-0 size-3 border-t border-l" />
          <div className="border-primary/30 absolute top-0 right-0 size-3 border-t border-r" />

          <div className="p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`flex size-8 items-center justify-center rounded-lg border ${
                    canEdit
                      ? "bg-primary/5 text-primary border-primary/20"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {canEdit ? (
                    <HiUser className="size-4" />
                  ) : (
                    <HiLockClosed className="size-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-foreground text-xs font-bold tracking-tight uppercase sm:text-sm">
                    Contact Information
                  </h3>
                  <p className="text-muted-foreground font-mono text-xs font-medium tracking-widest uppercase">
                    {canEdit ? "Editable" : "Locked"}
                  </p>
                </div>
              </div>
              {canEdit && (
                <Badge className="h-5 gap-1 bg-amber-100 px-2 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  <HiClock className="size-2.5" />
                  {daysRemaining}d left
                </Badge>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold tracking-widest uppercase">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2 flex size-6 -translate-y-1/2 items-center justify-center rounded border">
                    <HiMail className="text-muted-foreground size-3" />
                  </div>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    disabled={!canEdit || isSaving}
                    className="h-10 pl-10 text-sm"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive flex items-center gap-1 text-xs">
                    <HiExclamationCircle className="size-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold tracking-widest uppercase">
                  Phone Number
                </Label>
                <div className="relative">
                  <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2 flex size-6 -translate-y-1/2 items-center justify-center rounded border">
                    <HiPhone className="text-muted-foreground size-3" />
                  </div>
                  <Input
                    type="tel"
                    placeholder="+234 XXX XXX XXXX"
                    disabled={!canEdit || isSaving}
                    className="h-10 pl-10 text-sm"
                    {...register("phone")}
                  />
                </div>
                {errors.phone && (
                  <p className="text-destructive flex items-center gap-1 text-xs">
                    <HiExclamationCircle className="size-3" />
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Occupation */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold tracking-widest uppercase">
                  Occupation
                </Label>
                <ComboboxSelect
                  options={occupationOptions}
                  value={occupation}
                  onValueChange={(value) =>
                    setValue("occupation", value, { shouldDirty: true })
                  }
                  placeholder="Select your occupation"
                  searchPlaceholder="Search occupations..."
                  disabled={!canEdit || isSaving}
                  triggerClassName="h-10"
                />
              </div>
            </div>

            {canEdit && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-muted-foreground text-xs">
                  Changes saved to your profile immediately.
                </p>
                <Button
                  type="submit"
                  disabled={!isDirty || isSaving}
                  className="h-9 gap-2 rounded-lg px-4 text-xs font-bold tracking-widest uppercase"
                >
                  {isSaving ? (
                    <>
                      <div className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving
                    </>
                  ) : (
                    <>
                      <HiSave className="size-3.5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </form>

      {/* Verified Information - Always Read Only */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-border/60 bg-muted/20 relative overflow-hidden border"
      >
        <div className="border-muted-foreground/20 absolute top-0 left-0 size-3 border-t border-l" />

        <div className="p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-lg border">
              <HiLockClosed className="size-4" />
            </div>
            <div>
              <h3 className="text-foreground text-xs font-bold tracking-tight uppercase sm:text-sm">
                Verified Information
              </h3>
              <p className="text-muted-foreground font-mono text-xs font-medium tracking-widest uppercase">
                NIN Verified • Contact support to modify
              </p>
            </div>
          </div>

          {hasProfileData ? (
            <>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                    Full Name
                  </p>
                  <p className="text-foreground text-xs font-semibold">
                    {fullName || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                    Date of Birth
                  </p>
                  <p className="text-foreground text-xs font-semibold">
                    {payload.basic?.dateOfBirth
                      ? new Date(payload.basic.dateOfBirth).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" },
                        )
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                    Gender
                  </p>
                  <p className="text-foreground text-xs font-semibold capitalize">
                    {payload.basic?.gender || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                    Age
                  </p>
                  <p className="text-foreground text-xs font-semibold">
                    {payload.basic?.age ? `${payload.basic.age} years` : "—"}
                  </p>
                </div>
              </div>

              <div className="border-border/40 my-4 border-t" />

              {/* Location Info */}
              {/**
               * TODO: [CRITICAL] Ward/location changes
               * - If voter moves, this is critical for election validity
               * - Requires re-verification of new polling unit
               * - May require candidate re-selection
               * - Should trigger notification to relevant candidates
               */}
              <div className="flex items-center gap-2">
                <HiLocationMarker className="text-muted-foreground size-4 shrink-0" />
                <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                  <div>
                    <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                      State
                    </p>
                    <p className="text-foreground truncate text-xs font-semibold">
                      {payload.location?.state || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                      LGA
                    </p>
                    <p className="text-foreground truncate text-xs font-semibold">
                      {payload.location?.lga || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                      Ward
                    </p>
                    <p className="text-foreground truncate text-xs font-semibold">
                      {payload.location?.ward || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                      Polling Unit
                    </p>
                    <p className="text-foreground truncate text-xs font-semibold">
                      {payload.location?.pollingUnit || "—"}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground mt-3 flex items-center gap-1 text-xs">
                <HiCheckCircle className="size-3 text-green-600" />
                Verified via National Identification Number (NIN)
              </p>
            </>
          ) : (
            <div className="text-muted-foreground py-4 text-center text-sm">
              No verified information available
            </div>
          )}
        </div>
      </motion.div>

      {/* Contact Support - For any locked info changes */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
      >
        <button
          type="button"
          onClick={() => setSupportExpanded(!supportExpanded)}
          className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-amber-100/50 dark:hover:bg-amber-900/20"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
            <HiSupport className="size-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">
              {canEdit
                ? "Need to Change Verified Info?"
                : "Need to Make Changes?"}
            </h4>
            <p className="text-sm text-amber-700/70 dark:text-amber-300/60">
              {canEdit
                ? "Request changes to name, DOB, or location"
                : "Submit a request to update your information"}
            </p>
          </div>
          <HiChevronDown
            className={`size-5 text-amber-600 transition-transform dark:text-amber-400 ${
              supportExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {supportExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 border-t border-amber-200 px-4 pt-3 pb-4 dark:border-amber-800">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold tracking-widest text-amber-800 uppercase dark:text-amber-200">
                    What do you need to change?
                  </Label>
                  <Textarea
                    placeholder="E.g., My name is misspelled, I moved to a new ward, I need to update my phone number..."
                    value={supportReason}
                    onChange={(e) => setSupportReason(e.target.value)}
                    className="min-h-[80px] resize-none border-amber-300 bg-white text-sm dark:border-amber-700 dark:bg-amber-950/50"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/60">
                    We'll email you within 48 hours
                  </p>
                  <Button
                    type="button"
                    onClick={handleSupportRequest}
                    disabled={!supportReason.trim() || isSubmittingSupport}
                    className="h-8 gap-1.5 rounded-lg bg-amber-600 px-3 text-xs font-bold tracking-widest text-white uppercase hover:bg-amber-700"
                  >
                    {isSubmittingSupport ? (
                      <>
                        <div className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Sending
                      </>
                    ) : (
                      <>
                        <HiPaperAirplane className="size-3" />
                        Submit
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
