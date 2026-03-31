"use client";

import { useState } from "react";
import { HiUser, HiPhone, HiUsers } from "react-icons/hi";
import { Users } from "lucide-react";
import { motion } from "motion/react";
import type { UseFormReturn } from "react-hook-form";
import type { RegistrationFormData } from "@/lib/schemas/collect-schemas";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RegistrationStepHeader } from "@/components/collect/registration-step-header";
import {
  FieldLabel,
  InputIcon,
  FieldError,
  NavButtons,
  SubmitError,
  StepCard,
  CardSectionHeader,
} from "@/components/collect/form-ui";
import { cn } from "@/lib/utils";

type PreloadedCanvasser = { id: string; name: string; phone: string };

export function CanvasserStep({
  form,
  hasCanvasser,
  setHasCanvasser,
  isSubmitting,
  submitError,
  onBack,
  onNext,
  preloadedCanvassers = [],
}: {
  form: UseFormReturn<RegistrationFormData>;
  hasCanvasser: boolean | null;
  setHasCanvasser: (v: boolean | null) => void;
  isSubmitting: boolean;
  submitError?: string;
  onBack: () => void;
  onNext: () => void;
  preloadedCanvassers?: PreloadedCanvasser[];
}) {
  const {
    register,
    setValue,
    formState: { errors },
  } = form;

  const hasPreloaded = preloadedCanvassers.length > 0;
  const [selectedCanvasserId, setSelectedCanvasserId] = useState<string>("");
  const isOther = selectedCanvasserId === "__other__";

  const handleCanvasserSelect = (value: string) => {
    setSelectedCanvasserId(value);
    if (value === "__other__") {
      setValue("canvasserName", "");
      setValue("canvasserPhone", "");
    } else {
      const canvasser = preloadedCanvassers.find((c) => c.id === value);
      if (canvasser) {
        setValue("canvasserName", canvasser.name);
        setValue("canvasserPhone", canvasser.phone);
      }
    }
  };

  return (
    <div className="space-y-6">
      <RegistrationStepHeader
        icon={Users}
        badge="Referral Attribution"
        title="Canvasser Details"
        description="Were you referred by someone on the campaign team?"
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <StepCard>
          <CardSectionHeader
            title="Canvasser Info"
            subtitle="Attribution"
            statusLabel="Optional"
            icon={<HiUsers className="size-4.5" />}
          />

          <div className="space-y-6">
            <div className="space-y-1.5">
              <FieldLabel>Were you referred by a canvasser?</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  role="radio"
                  aria-checked={hasCanvasser === true}
                  aria-label="Yes, I was referred by a canvasser"
                  onClick={() => setHasCanvasser(true)}
                  className={cn(
                    "border-border bg-card hover:border-primary/50 focus-visible:ring-primary flex cursor-pointer items-center justify-center gap-2 rounded-sm border-2 p-3 transition-all focus-visible:ring-2 focus-visible:outline-none",
                    hasCanvasser === true &&
                      "border-primary bg-primary/10 ring-primary/20 ring-2 ring-offset-1",
                  )}
                >
                  <span className="text-sm font-medium">Yes</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={hasCanvasser === false}
                  aria-label="No, I was not referred by a canvasser"
                  onClick={() => {
                    setHasCanvasser(false);
                    setValue("canvasserName", "");
                    setValue("canvasserPhone", "");
                    setSelectedCanvasserId("");
                  }}
                  className={cn(
                    "border-border bg-card hover:border-primary/50 focus-visible:ring-primary flex cursor-pointer items-center justify-center gap-2 rounded-sm border-2 p-3 transition-all focus-visible:ring-2 focus-visible:outline-none",
                    hasCanvasser === false &&
                      "border-primary bg-primary/10 ring-primary/20 ring-2 ring-offset-1",
                  )}
                >
                  <span className="text-sm font-medium">No</span>
                </button>
              </div>
            </div>

            {hasCanvasser && hasPreloaded && (
              <div className="space-y-1.5">
                <FieldLabel>Select your canvasser</FieldLabel>
                <Select
                  value={selectedCanvasserId}
                  onValueChange={handleCanvasserSelect}
                >
                  <SelectTrigger className="border-border/60 bg-muted/5 h-12">
                    <SelectValue placeholder="Choose a canvasser..." />
                  </SelectTrigger>
                  <SelectContent>
                    {preloadedCanvassers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} — {c.phone}
                      </SelectItem>
                    ))}
                    <SelectItem value="__other__">
                      Other (not listed)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {hasCanvasser && (!hasPreloaded || isOther) && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel>Canvasser Name</FieldLabel>
                  <div className="relative">
                    <InputIcon>
                      <HiUser className="text-muted-foreground size-3.5" />
                    </InputIcon>
                    <Input
                      {...register("canvasserName")}
                      placeholder="Canvasser's name"
                      className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 pl-12 font-medium transition-all placeholder:text-xs"
                    />
                  </div>
                  <FieldError error={errors.canvasserName?.message} />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel>Canvasser Phone</FieldLabel>
                  <div className="relative">
                    <InputIcon>
                      <HiPhone className="text-muted-foreground size-3.5" />
                    </InputIcon>
                    <Input
                      {...register("canvasserPhone")}
                      placeholder="Canvasser's phone"
                      type="tel"
                      className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 pl-12 font-mono font-medium tracking-wider transition-all placeholder:text-xs"
                    />
                  </div>
                  <FieldError error={errors.canvasserPhone?.message} />
                </div>
              </div>
            )}

            <Separator />

            <NavButtons
              onBack={onBack}
              onNext={onNext}
              nextLabel="Submit Registration"
              isLoading={isSubmitting}
            />

            <SubmitError error={submitError} />
          </div>
        </StepCard>
      </motion.div>
    </div>
  );
}
