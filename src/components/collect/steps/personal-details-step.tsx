"use client";

import {
  HiUser,
  HiPhone,
  HiMail,
  HiUserCircle,
  HiCheckCircle,
  HiShieldCheck,
} from "react-icons/hi";
import { FaMale, FaFemale } from "react-icons/fa";
import { UserCircle } from "lucide-react";
import { motion } from "motion/react";
import type { UseFormReturn } from "react-hook-form";
import type { RegistrationFormData } from "@/lib/schemas/collect-schemas";
import type { PublicCampaign } from "@/types/collect";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ComboboxSelect,
  type ComboboxSelectOption,
} from "@/components/ui/combobox-select";
import { RegistrationStepHeader } from "@/components/collect/registration-step-header";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import {
  SectionLabel,
  FieldLabel,
  InputIcon,
  FieldError,
  NavButtons,
  StepCard,
  CardSectionHeader,
} from "@/components/collect/form-ui";
import { cn } from "@/lib/utils";

const OCCUPATION_OPTIONS: ComboboxSelectOption[] = [
  { value: "civil-servant", label: "Civil Servant" },
  { value: "teacher", label: "Teacher/Educator" },
  { value: "healthcare-worker", label: "Healthcare Worker" },
  { value: "farmer", label: "Farmer" },
  { value: "trader", label: "Trader/Business Owner" },
  { value: "artisan", label: "Artisan (Carpenter, Tailor, etc.)" },
  { value: "student", label: "Student" },
  { value: "unemployed", label: "Unemployed" },
  { value: "retired", label: "Retired" },
  { value: "private-sector", label: "Private Sector Employee" },
  { value: "security", label: "Security Personnel" },
  { value: "driver", label: "Driver/Transport Worker" },
  { value: "engineer", label: "Engineer" },
  { value: "lawyer", label: "Lawyer" },
  { value: "doctor", label: "Doctor/Medical Professional" },
  { value: "nurse", label: "Nurse" },
  { value: "accountant", label: "Accountant" },
  { value: "banker", label: "Banker" },
  { value: "journalist", label: "Journalist/Media" },
  { value: "pastor", label: "Pastor/Religious Leader" },
  { value: "imam", label: "Imam/Religious Leader" },
  { value: "self-employed", label: "Self Employed" },
  { value: "other", label: "Other" },
];

const MARITAL_OPTIONS: ComboboxSelectOption[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
];
const toggleToListActionClass =
  "border-border/70 bg-muted/40 text-foreground/80 hover:bg-muted/70 h-6 rounded-sm border px-2 text-[11px] font-medium transition-colors";

export function PersonalDetailsStep({
  form,
  campaign,
  occupationMode,
  setOccupationMode,
  onBack,
  onNext,
}: {
  form: UseFormReturn<RegistrationFormData>;
  campaign: PublicCampaign;
  occupationMode: "select" | "custom";
  setOccupationMode: (mode: "select" | "custom") => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const watchedSex = watch("sex");

  return (
    <div className="space-y-6">
      <RegistrationStepHeader
        icon={UserCircle}
        badge="Personal Profile"
        title="Tell Us About Yourself"
        description="We need some basic information to register you as a supporter"
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <StepCard>
          <CardSectionHeader
            title="Personal Profile"
            subtitle="Profile Status"
            statusLabel="In Progress"
            icon={<HiUserCircle className="size-4.5" />}
          />

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <SectionLabel
                title="Basic Information"
                subtitle="Your personal identification details"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel>First Name</FieldLabel>
                  <div className="relative">
                    <InputIcon>
                      <HiUser className="text-muted-foreground size-3.5" />
                    </InputIcon>
                    <Input
                      {...register("firstName")}
                      autoComplete="given-name"
                      placeholder="Enter your first name"
                      className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 pl-12 font-medium transition-all placeholder:text-xs"
                    />
                  </div>
                  <FieldError error={errors.firstName?.message} />
                </div>

                <div className="space-y-1.5">
                  <FieldLabel>Last Name</FieldLabel>
                  <div className="relative">
                    <InputIcon>
                      <HiUser className="text-muted-foreground size-3.5" />
                    </InputIcon>
                    <Input
                      {...register("lastName")}
                      autoComplete="family-name"
                      placeholder="Enter your last name"
                      className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 pl-12 font-medium transition-all placeholder:text-xs"
                    />
                  </div>
                  <FieldError error={errors.lastName?.message} />
                </div>
              </div>

              <div className="space-y-1.5">
                <FieldLabel optional>Middle Name</FieldLabel>
                <div className="relative">
                  <InputIcon>
                    <HiUser className="text-muted-foreground size-3.5" />
                  </InputIcon>
                  <Input
                    {...register("middleName")}
                    autoComplete="additional-name"
                    placeholder="Enter your middle name"
                    className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 pl-12 font-medium transition-all placeholder:text-xs"
                  />
                </div>
                <FieldError error={errors.middleName?.message} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel>Phone Number</FieldLabel>
                  <div className="relative">
                    <InputIcon>
                      <HiPhone className="text-muted-foreground size-3.5" />
                    </InputIcon>
                    <Input
                      {...register("phone")}
                      placeholder="08031234567"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 pl-12 font-mono font-medium tracking-wider transition-all placeholder:text-xs"
                    />
                  </div>
                  <FieldError error={errors.phone?.message} />
                </div>

                <div className="space-y-1.5">
                  <FieldLabel optional>Email Address</FieldLabel>
                  <div className="relative">
                    <InputIcon>
                      <HiMail className="text-muted-foreground size-3.5" />
                    </InputIcon>
                    <Input
                      {...register("email")}
                      placeholder="your@email.com"
                      type="email"
                      autoComplete="email"
                      className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 pl-12 font-medium transition-all placeholder:text-xs"
                    />
                  </div>
                  <FieldError error={errors.email?.message} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Demographics */}
            <div className="space-y-4">
              <SectionLabel
                title="Demographics"
                subtitle="Additional personal details"
              />

              <div className="space-y-1.5">
                <FieldLabel>Sex</FieldLabel>
                <div className="grid grid-cols-2 gap-3">
                  {(["male", "female"] as const).map((s) => {
                    const Icon = s === "male" ? FaMale : FaFemale;
                    return (
                      <button
                        key={s}
                        type="button"
                        role="radio"
                        aria-checked={watchedSex === s}
                        aria-label={`Select ${s}`}
                        onClick={() => setValue("sex", s)}
                        className={cn(
                          "border-border bg-card hover:border-primary/50 focus-visible:ring-primary flex h-12 cursor-pointer flex-row items-center justify-center gap-2 rounded-sm border-2 transition-all focus-visible:ring-2 focus-visible:outline-none",
                          watchedSex === s &&
                            "border-primary bg-primary/10 ring-primary/20 ring-2 ring-offset-1",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 transition-colors",
                            watchedSex === s
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        />
                        <span className="text-sm font-medium capitalize">
                          {s}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <FieldError error={errors.sex?.message} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel>Age</FieldLabel>
                  <Input
                    {...register("age", {
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    type="number"
                    inputMode="numeric"
                    min={18}
                    max={120}
                    placeholder="Age (18+)"
                    className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 font-medium transition-all placeholder:text-xs"
                  />
                  <FieldError error={errors.age?.message} />
                </div>

                <div className="space-y-1.5">
                  <FieldLabel>Marital Status</FieldLabel>
                  <ComboboxSelect
                    options={MARITAL_OPTIONS}
                    value={watch("maritalStatus") || ""}
                    onValueChange={(v) =>
                      setValue(
                        "maritalStatus",
                        v as RegistrationFormData["maritalStatus"],
                      )
                    }
                    placeholder="Select status"
                    searchPlaceholder="Search..."
                    emptyMessage="No options found."
                  />
                  <FieldError error={errors.maritalStatus?.message} />
                </div>
              </div>

              {/* Occupation */}
              <div className="space-y-1.5">
                <FieldLabel>Occupation</FieldLabel>
                {occupationMode === "select" ? (
                  <div className="space-y-2">
                    <ComboboxSelect
                      options={OCCUPATION_OPTIONS}
                      value={watch("occupation") || ""}
                      onValueChange={(v) => {
                        if (v === "other") {
                          setOccupationMode("custom");
                          setValue("occupation", "");
                        } else {
                          setValue("occupation", v);
                        }
                      }}
                      placeholder="Select occupation"
                      searchPlaceholder="Search occupations..."
                      emptyMessage="No occupation found."
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Input
                      {...register("occupation")}
                      aria-describedby="custom-occupation-hint"
                      placeholder="Type your occupation"
                      className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 font-medium transition-all placeholder:text-xs"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <p
                        id="custom-occupation-hint"
                        className="text-muted-foreground text-[11px]"
                      >
                        Typed manually
                      </p>
                      <button
                        type="button"
                        onClick={() => setOccupationMode("select")}
                        className={toggleToListActionClass}
                      >
                        Use list
                      </button>
                    </div>
                  </div>
                )}
                <FieldError error={errors.occupation?.message} />
              </div>
            </div>

            {/* Custom questions */}
            {(campaign.customQuestion1 || campaign.customQuestion2) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <SectionLabel
                    title="Additional Questions"
                    subtitle="A few more questions from the campaign"
                  />
                  {campaign.customQuestion1 && (
                    <div className="space-y-1.5">
                      <FieldLabel>{campaign.customQuestion1}</FieldLabel>
                      <Input
                        {...register("customAnswer1")}
                        placeholder="Your answer"
                        className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 font-medium transition-all placeholder:text-xs"
                      />
                    </div>
                  )}
                  {campaign.customQuestion2 && (
                    <div className="space-y-1.5">
                      <FieldLabel>{campaign.customQuestion2}</FieldLabel>
                      <Input
                        {...register("customAnswer2")}
                        placeholder="Your answer"
                        className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 font-medium transition-all placeholder:text-xs"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            <Separator />
            <NavButtons onBack={onBack} onNext={onNext} />
          </div>
        </StepCard>
      </motion.div>

      <TrustIndicators
        items={[
          { icon: <HiUser />, label: "DATA_PRIVACY" },
          { icon: <HiShieldCheck />, label: "SECURE_ENCRYPTION" },
          { icon: <HiCheckCircle />, label: "VERIFIED_CAMPAIGN" },
        ]}
      />
    </div>
  );
}
