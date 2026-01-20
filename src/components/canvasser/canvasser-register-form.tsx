"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  HiArrowLeft,
  HiArrowRight,
  HiCheckCircle,
  HiInformationCircle,
  HiPhone,
  HiShieldCheck,
  HiCreditCard,
  HiCheck,
  HiLocationMarker,
  HiMail,
} from "react-icons/hi";
import { IdCard, MapPin, ClipboardCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { StepProgress } from "@/components/ui/step-progress";
import { RegistrationStepHeader } from "@/components/voter/registration-step-header";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ComboboxSelect } from "@/components/ui/combobox-select";
import { useLocationData } from "@/hooks/use-location-data";
import { useQueryClient } from "@tanstack/react-query";
import {
  emailSchema,
  ninSchema,
  phoneSchema,
  formatNINForDisplay,
  normalizeNINInput,
  isValidNIN,
} from "@/lib/schemas/common-schemas";

/**
 * TODO: [BACKEND] Voter registration API
 * - POST /api/canvassers/:code/voters - Create new voter
 * - Validate NIN with external service
 * - Check for duplicate registrations
 * - Send SMS confirmation to voter
 */

/**
 * TODO: [SYNC] Offline registration
 * - Queue registrations in IndexedDB when offline
 * - Sync when connection restored
 * - Show offline indicator
 */

type Step = "nin" | "details" | "location" | "confirm";

const steps: { id: Step; label: string }[] = [
  { id: "nin", label: "NIN Verification" },
  { id: "details", label: "Personal Details" },
  { id: "location", label: "Location" },
  { id: "confirm", label: "Confirm" },
];

// Production mock - matches canvasser data
const CANVASSER_DATA = {
  code: "FINT-A001",
  name: "Chioma Okonkwo",
  candidateName: "Ahmadu Umaru Fintiri",
  candidateParty: "APC",
};

// NIN step validation schema (reuse shared NIN rules, custom consent message)
const canvasserNinFormSchema = z.object({
  nin: ninSchema,
  terms: z.boolean().refine((val) => val === true, {
    message: "You must confirm voter consent",
  }),
});

// Details step validation schema (reuse shared phone/email rules)
const canvasserDetailsSchema = z.object({
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("")),
});

// Location step validation schema
const canvasserLocationSchema = z.object({
  state: z.string().min(1, "Please select a state"),
  lga: z.string().min(1, "Please select an LGA"),
  ward: z.string().min(1, "Please select a ward"),
  pollingUnit: z.string().min(1, "Please select a polling unit"),
});

type NinFormValues = z.infer<typeof canvasserNinFormSchema>;
type DetailsFormValues = z.infer<typeof canvasserDetailsSchema>;
type LocationFormValues = z.infer<typeof canvasserLocationSchema>;

export function CanvasserRegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<Step>("nin");
  const [rawNin, setRawNin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifiedData, setVerifiedData] = useState<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
  } | null>(null);

  // Location state
  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // Location data hook
  const locationData = useLocationData();
  const lgasQuery = locationData.useLGAs(selectedState);
  const wardsQuery = locationData.useWards(selectedLga);
  const pollingUnitsQuery = locationData.usePollingUnits(selectedWard);

  const states = locationData.states;
  const lgas = lgasQuery.data || [];
  const wards = wardsQuery.data || [];
  const pollingUnits = pollingUnitsQuery.data || [];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  // NIN form
  const ninForm = useForm<NinFormValues>({
    resolver: zodResolver(canvasserNinFormSchema),
    defaultValues: {
      nin: "",
      terms: false,
    },
  });

  // Details form
  const detailsForm = useForm<DetailsFormValues>({
    resolver: zodResolver(canvasserDetailsSchema),
    defaultValues: {
      phone: "",
      email: "",
    },
  });

  // Location form
  const locationForm = useForm<LocationFormValues>({
    resolver: zodResolver(canvasserLocationSchema),
    defaultValues: {
      state: "",
      lga: "",
      ward: "",
      pollingUnit: "",
    },
  });

  // Watch location form values for completion indicators
  const watchedLocation = locationForm.watch();
  const completedFields = [
    !!watchedLocation.state,
    !!watchedLocation.lga,
    !!watchedLocation.ward,
    !!watchedLocation.pollingUnit,
  ].filter(Boolean).length;

  // Reset dependent location fields when parent changes
  useEffect(() => {
    if (selectedState) {
      locationForm.setValue("lga", "");
      locationForm.setValue("ward", "");
      locationForm.setValue("pollingUnit", "");
      setSelectedLga("");
      setSelectedWard("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState]);

  useEffect(() => {
    if (selectedLga) {
      locationForm.setValue("ward", "");
      locationForm.setValue("pollingUnit", "");
      setSelectedWard("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLga]);

  useEffect(() => {
    if (selectedWard) {
      locationForm.setValue("pollingUnit", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWard]);

  const handleNINChange = useCallback(
    (input: string) => {
      const normalized = normalizeNINInput(input).slice(0, 11);
      const formatted = formatNINForDisplay(normalized);
      setRawNin(formatted);
      ninForm.setValue("nin", normalized);
    },
    [ninForm],
  );

  const isNINComplete = () => {
    const value = ninForm.watch("nin") || "";
    return isValidNIN(value);
  };

  const getCharacterCount = () => {
    const value = ninForm.watch("nin") || "";
    return `${value.length}/11`;
  };

  const handleVerifyNin = async (_data: NinFormValues) => {
    setIsVerifying(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock verified data
    const mockData = {
      firstName: "Aminu",
      lastName: "Bello",
      dateOfBirth: "1995-03-15",
      gender: "Male",
      phone: "08034567890",
    };
    setVerifiedData(mockData);
    detailsForm.setValue("phone", mockData.phone);
    setIsVerifying(false);
    toast.success("NIN verified successfully!");
    setCurrentStep("details");
  };

  const handleDetailsSubmit = async (_data: DetailsFormValues) => {
    setCurrentStep("location");
  };

  const handleLocationSubmit = async (_data: LocationFormValues) => {
    setCurrentStep("confirm");
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    toast.success(
      "Voter registered successfully! They will receive an SMS confirmation.",
    );
    setTimeout(() => {
      router.push("/canvasser");
    }, 1500);
  };

  const isLoading = (type: "lgas" | "wards" | "pollingUnits") => {
    switch (type) {
      case "lgas":
        return lgasQuery.isLoading && !!selectedState;
      case "wards":
        return wardsQuery.isLoading && !!selectedLga;
      case "pollingUnits":
        return pollingUnitsQuery.isLoading && !!selectedWard;
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case "nin":
        return IdCard;
      case "details":
        return User;
      case "location":
        return MapPin;
      case "confirm":
        return ClipboardCheck;
      default:
        return IdCard;
    }
  };

  const getStepBadge = () => {
    switch (currentStep) {
      case "nin":
        return "Identity Verification";
      case "details":
        return "Personal Information";
      case "location":
        return "Voting Location";
      case "confirm":
        return "Final Review";
      default:
        return "Registration";
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "nin":
        return "Verify Voter's NIN";
      case "details":
        return "Confirm Voter Details";
      case "location":
        return "Select Voting Location";
      case "confirm":
        return "Review & Submit";
      default:
        return "Register Voter";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "nin":
        return "Enter the voter's National Identification Number to verify their identity.";
      case "details":
        return "Review and confirm the voter's personal information retrieved from NIN.";
      case "location":
        return "Select the voter's preferred voting location within your assigned territory.";
      case "confirm":
        return "Review all information before submitting the registration.";
      default:
        return "";
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:py-8">
      {/* Step Progress */}
      <StepProgress
        currentStep={currentStepIndex + 1}
        totalSteps={steps.length}
        stepTitle={steps[currentStepIndex].label}
        canvasser
      />

      {/* Step Header */}
      <RegistrationStepHeader
        icon={getStepIcon()}
        badge={getStepBadge()}
        title={getStepTitle()}
        description={getStepDescription()}
        canvasser
      />

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
          className="border-border/60 bg-card relative overflow-hidden border shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)]"
        >
          {/* Architectural Markers - Amber for canvasser */}
          <div className="absolute top-0 left-0 size-5 border-t border-l border-amber-500" />
          <div className="absolute top-0 right-0 size-5 border-t border-r border-amber-500" />

          <div className="p-7 sm:p-10">
            {/* ========== NIN STEP ========== */}
            {currentStep === "nin" && (
              <>
                <div className="mb-8 flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-foreground text-lg font-bold tracking-tight uppercase">
                      Identification
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="size-1.5 rounded-[1px] bg-amber-500/60" />
                      <p className="text-muted-foreground font-mono text-[10px] font-medium tracking-widest uppercase">
                        Identity Check{" "}
                        <span className="mx-1 text-amber-500/40">|</span>{" "}
                        <span className="text-foreground font-bold">
                          Required
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <Form {...ninForm}>
                  <form
                    onSubmit={ninForm.handleSubmit(handleVerifyNin)}
                    className="space-y-6"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5">
                        <Label
                          htmlFor="nin"
                          className="text-foreground text-xs font-bold tracking-widest uppercase"
                        >
                          National ID (NIN)
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HiInformationCircle className="text-muted-foreground h-4 w-4 cursor-help transition-colors hover:text-amber-600" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                The voter's 11-digit NIN from their NIMC ID card
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="relative">
                        <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md border">
                          <HiCreditCard className="text-muted-foreground size-3.5" />
                        </div>
                        <Input
                          id="nin"
                          type="text"
                          inputMode="numeric"
                          placeholder="0000 0000 000"
                          value={rawNin}
                          onChange={(e) => handleNINChange(e.target.value)}
                          maxLength={13}
                          className={cn(
                            "border-border/60 bg-muted/5 h-12 pr-14 pl-12 font-mono text-base font-bold tracking-[0.15em] transition-all focus-visible:border-amber-500 focus-visible:ring-amber-500",
                            ninForm.formState.errors.nin &&
                              "border-destructive focus:border-destructive focus:ring-destructive",
                          )}
                        />
                        <div className="text-muted-foreground absolute top-1/2 right-3.5 -translate-y-1/2 font-mono text-[9px] font-bold uppercase">
                          {getCharacterCount()}
                        </div>
                      </div>
                      {ninForm.formState.errors.nin && (
                        <p className="text-destructive font-mono text-xs font-medium tracking-wide uppercase">
                          {ninForm.formState.errors.nin.message}
                        </p>
                      )}
                    </div>

                    {/* Canvasser Notice */}
                    <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                      <HiInformationCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold tracking-widest text-amber-700 uppercase dark:text-amber-400">
                          Assisted Registration
                        </p>
                        <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                          You are registering a voter for{" "}
                          <span className="text-foreground font-bold">
                            {CANVASSER_DATA.candidateName}
                          </span>{" "}
                          ({CANVASSER_DATA.candidateParty}). They will receive
                          an SMS confirmation.
                        </p>
                      </div>
                    </div>

                    {/* Terms checkbox with FormField */}
                    <FormField
                      control={ninForm.control}
                      name="terms"
                      render={({ field }) => (
                        <FormItem>
                          <div className="border-border/60 bg-muted/20 hover:bg-muted/30 rounded-xl border p-4 transition-colors">
                            <div className="flex items-start space-x-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="mt-0.5 border-2"
                                />
                              </FormControl>
                              <div className="space-y-0.5">
                                <FormLabel className="text-foreground block cursor-pointer text-xs leading-relaxed font-bold tracking-tight uppercase">
                                  I verify that my information is accurate and I
                                  accept the{" "}
                                  <Link
                                    href="/terms"
                                    className="text-amber-600 underline decoration-amber-600/30 underline-offset-4 hover:decoration-amber-600"
                                    target="_blank"
                                  >
                                    Terms and Conditions
                                  </Link>
                                  .
                                </FormLabel>
                              </div>
                            </div>
                          </div>
                          <FormMessage className="mt-2 text-[9px] tracking-wide uppercase" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={
                        !isNINComplete() ||
                        !ninForm.watch("terms") ||
                        isVerifying
                      }
                      className="h-11 w-full gap-2 rounded-xl bg-amber-600 text-xs font-bold tracking-widest text-white uppercase transition-all hover:bg-amber-700 active:scale-95 disabled:grayscale"
                    >
                      {isVerifying ? (
                        <>
                          <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Verifying NIN...
                        </>
                      ) : (
                        <>
                          Verify NIN
                          <HiArrowRight className="size-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </>
            )}

            {/* ========== DETAILS STEP ========== */}
            {currentStep === "details" && verifiedData && (
              <>
                <div className="mb-8 flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-foreground text-lg font-bold tracking-tight uppercase">
                      Personal Details
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="size-1.5 rounded-[1px] bg-green-500/60" />
                      <p className="text-muted-foreground font-mono text-[10px] font-medium tracking-widest uppercase">
                        NIN Verified{" "}
                        <span className="mx-1 text-green-500/40">|</span>{" "}
                        <span className="font-bold text-green-600">
                          Confirmed
                        </span>
                      </p>
                    </div>
                  </div>
                  <Badge className="h-6 gap-1 bg-green-100 px-2 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <HiCheckCircle className="size-3" />
                    Verified
                  </Badge>
                </div>

                <Form {...detailsForm}>
                  <form
                    onSubmit={detailsForm.handleSubmit(handleDetailsSubmit)}
                    className="space-y-6"
                  >
                    {/* Verified info display */}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "First Name", value: verifiedData.firstName },
                        { label: "Last Name", value: verifiedData.lastName },
                        {
                          label: "Date of Birth",
                          value: verifiedData.dateOfBirth,
                        },
                        { label: "Gender", value: verifiedData.gender },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="border-border/40 bg-muted/20 rounded-lg border p-3"
                        >
                          <p className="text-muted-foreground text-[9px] font-bold tracking-widest uppercase">
                            {item.label}
                          </p>
                          <p className="text-foreground mt-1 text-sm font-bold">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Phone input with FormField */}
                    <FormField
                      control={detailsForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                            <HiPhone className="size-3" />
                            Phone Number (for SMS)
                            {field.value && (
                              <HiCheck className="h-3.5 w-3.5 text-amber-600" />
                            )}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md border">
                                <HiPhone className="text-muted-foreground size-3.5" />
                              </div>
                              <Input
                                {...field}
                                placeholder="08031234567"
                                className={cn(
                                  "border-border/60 bg-muted/5 h-12 pr-4 pl-12 font-mono text-base font-bold tracking-[0.08em] transition-all focus-visible:border-amber-500 focus-visible:ring-amber-500",
                                  detailsForm.formState.errors.phone &&
                                    "border-destructive focus:border-destructive focus:ring-destructive",
                                )}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[9px] tracking-wide uppercase" />
                        </FormItem>
                      )}
                    />

                    {/* Email input with FormField */}
                    <FormField
                      control={detailsForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground z-10 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                            Email (Optional)
                            {field.value && (
                              <HiCheck className="h-3.5 w-3.5 text-amber-600" />
                            )}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md border">
                                <HiMail className="text-muted-foreground size-3.5" />
                              </div>
                              <Input
                                {...field}
                                type="email"
                                placeholder="voter@example.com"
                                className={cn(
                                  "border-border/60 bg-muted/5 h-12 pr-4 pl-12 font-mono text-base font-normal tracking-[0.02em] transition-all focus-visible:border-amber-500 focus-visible:ring-amber-500",
                                  detailsForm.formState.errors.email &&
                                    "border-destructive focus:border-destructive focus:ring-destructive",
                                )}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[9px] tracking-wide uppercase" />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep("nin")}
                        className="h-11 flex-1 gap-2 rounded-xl text-sm font-bold"
                      >
                        <HiArrowLeft className="size-4" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="h-11 flex-1 gap-2 rounded-xl bg-amber-600 text-sm font-bold text-white hover:bg-amber-700 active:scale-95"
                      >
                        Continue
                        <HiArrowRight className="size-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </>
            )}

            {/* ========== LOCATION STEP ========== */}
            {currentStep === "location" && (
              <>
                <div className="border-border/40 mb-8 border-b pb-6">
                  <div className="space-y-4">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="space-y-1">
                        <h2 className="text-foreground text-lg font-bold tracking-tight uppercase">
                          Voting Location
                        </h2>
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 rounded-[1px] bg-amber-500/60" />
                          <p className="text-muted-foreground font-mono text-[10px] font-medium tracking-widest uppercase">
                            Location Finder{" "}
                            <span className="mx-1 text-amber-500/40">|</span>{" "}
                            <span className="text-foreground font-bold">
                              Active
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-muted-foreground font-mono text-[9px] font-bold tracking-widest uppercase">
                          {completedFields}/4 FIELDS
                        </div>
                        <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full">
                          <div
                            className="h-full bg-amber-500 transition-all duration-300 ease-out"
                            style={{
                              width: `${(completedFields / 4) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Form {...locationForm}>
                  <form
                    onSubmit={locationForm.handleSubmit(handleLocationSubmit)}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {/* State */}
                      <FormField
                        control={locationForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center justify-between">
                              <span className="text-foreground flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                                State
                                {field.value && (
                                  <HiCheck className="h-3.5 w-3.5 text-amber-600" />
                                )}
                              </span>
                            </FormLabel>
                            <FormControl>
                              <ComboboxSelect
                                options={states.map((s) => ({
                                  value: s.code,
                                  label: s.name,
                                }))}
                                value={field.value}
                                isLoading={locationData.statesLoading}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setSelectedState(value);
                                  setSelectedLga("");
                                  setSelectedWard("");
                                  locationData.prefetchLGAs(queryClient, value);
                                }}
                                placeholder="Select state"
                                searchPlaceholder="Search states..."
                                emptyMessage={
                                  locationData.statesError
                                    ? "Could not load states."
                                    : "No state found."
                                }
                              />
                            </FormControl>
                            <FormMessage className="text-[9px] tracking-wide uppercase" />
                          </FormItem>
                        )}
                      />

                      {/* LGA */}
                      <FormField
                        control={locationForm.control}
                        name="lga"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center justify-between">
                              <span className="text-foreground flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                                Local Government (LGA)
                                {field.value && (
                                  <HiCheck className="h-3.5 w-3.5 text-amber-600" />
                                )}
                              </span>
                            </FormLabel>
                            <FormControl>
                              <ComboboxSelect
                                options={lgas.map((l) => ({
                                  value: l.code,
                                  label: l.name,
                                }))}
                                value={field.value}
                                isLoading={isLoading("lgas")}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setSelectedLga(value);
                                  setSelectedWard("");
                                  locationData.prefetchWards(
                                    queryClient,
                                    value,
                                  );
                                }}
                                placeholder={
                                  !selectedState
                                    ? "Select state first"
                                    : "Select LGA"
                                }
                                searchPlaceholder="Search LGAs..."
                                emptyMessage={
                                  lgasQuery.isError
                                    ? "Error loading LGAs."
                                    : "No LGA found."
                                }
                                disabled={!selectedState}
                              />
                            </FormControl>
                            <FormMessage className="text-[9px] tracking-wide uppercase" />
                          </FormItem>
                        )}
                      />

                      {/* Ward */}
                      <FormField
                        control={locationForm.control}
                        name="ward"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center justify-between">
                              <span className="text-foreground flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                                Ward
                                {field.value && (
                                  <HiCheck className="h-3.5 w-3.5 text-amber-600" />
                                )}
                              </span>
                            </FormLabel>
                            <FormControl>
                              <ComboboxSelect
                                options={wards.map((w) => ({
                                  value: w.code,
                                  label: w.name,
                                }))}
                                value={field.value}
                                isLoading={isLoading("wards")}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setSelectedWard(value);
                                  locationData.prefetchPollingUnits(
                                    queryClient,
                                    value,
                                  );
                                }}
                                placeholder={
                                  !selectedLga
                                    ? "Select LGA first"
                                    : "Select ward"
                                }
                                searchPlaceholder="Search wards..."
                                emptyMessage={
                                  wardsQuery.isError
                                    ? "Error loading wards."
                                    : "No ward found."
                                }
                                disabled={!selectedLga}
                              />
                            </FormControl>
                            <FormMessage className="text-[9px] tracking-wide uppercase" />
                          </FormItem>
                        )}
                      />

                      {/* Polling Unit */}
                      <FormField
                        control={locationForm.control}
                        name="pollingUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center justify-between">
                              <span className="text-foreground flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                                Polling Unit
                                {field.value && (
                                  <HiCheck className="h-3.5 w-3.5 text-amber-600" />
                                )}
                              </span>
                            </FormLabel>
                            <FormControl>
                              <ComboboxSelect
                                options={pollingUnits.map((pu) => ({
                                  value: pu.code,
                                  label: `${pu.code} - ${pu.name}`,
                                }))}
                                value={field.value}
                                isLoading={isLoading("pollingUnits")}
                                onValueChange={field.onChange}
                                placeholder={
                                  !selectedWard
                                    ? "Select ward first"
                                    : "Select polling unit"
                                }
                                searchPlaceholder="Search by code or name..."
                                emptyMessage={
                                  pollingUnitsQuery.isError
                                    ? "Error loading polling units."
                                    : "No polling unit found."
                                }
                                disabled={!selectedWard}
                              />
                            </FormControl>
                            <FormMessage className="text-[9px] tracking-wide uppercase" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Help Section */}
                    <div className="border-border bg-muted/20 mt-4 rounded-xl border p-4">
                      <div className="flex items-start gap-3">
                        <HiLocationMarker className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <div className="space-y-1">
                          <p className="text-foreground text-xs font-bold tracking-wider uppercase">
                            Voter's Preferred Location
                          </p>
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            Select the polling unit closest to where the voter
                            resides. They can change this later if needed.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep("details")}
                        className="h-11 flex-1 gap-2 rounded-xl text-sm font-bold"
                      >
                        <HiArrowLeft className="size-4" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="h-11 flex-1 gap-2 rounded-xl bg-amber-600 text-sm font-bold text-white hover:bg-amber-700 active:scale-95"
                      >
                        Continue
                        <HiArrowRight className="size-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </>
            )}

            {/* ========== CONFIRM STEP ========== */}
            {currentStep === "confirm" && verifiedData && (
              <>
                <div className="mb-8 flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-foreground text-lg font-bold tracking-tight uppercase">
                      Final Review
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="size-1.5 rounded-[1px] bg-green-500/60" />
                      <p className="text-muted-foreground font-mono text-[10px] font-medium tracking-widest uppercase">
                        Ready to Submit{" "}
                        <span className="mx-1 text-green-500/40">|</span>{" "}
                        <span className="font-bold text-green-600">
                          Complete
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Summary */}
                  <div className="divide-border/40 border-border/60 bg-muted/10 divide-y rounded-xl border">
                    {[
                      {
                        label: "Voter Name",
                        value: `${verifiedData.firstName} ${verifiedData.lastName}`,
                      },
                      {
                        label: "NIN",
                        value: `${ninForm.watch("nin").slice(0, 3)}****${ninForm.watch("nin").slice(-4)}`,
                        mono: true,
                      },
                      {
                        label: "Phone",
                        value: detailsForm.watch("phone"),
                      },
                      {
                        label: "Location",
                        value:
                          states.find((s) => s.code === selectedState)?.name &&
                          lgas.find((l) => l.code === selectedLga)?.name
                            ? `${wards.find((w) => w.code === selectedWard)?.name || "N/A"}, ${lgas.find((l) => l.code === selectedLga)?.name}`
                            : "N/A",
                      },
                      {
                        label: "Canvasser",
                        value: CANVASSER_DATA.code,
                        badge: true,
                      },
                      {
                        label: "For Candidate",
                        value: `${CANVASSER_DATA.candidateName} (${CANVASSER_DATA.candidateParty})`,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between p-4"
                      >
                        <span className="text-muted-foreground text-xs font-medium">
                          {item.label}
                        </span>
                        {item.badge ? (
                          <Badge className="h-5 bg-amber-100 px-2 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                            {item.value}
                          </Badge>
                        ) : (
                          <span
                            className={cn(
                              "text-foreground text-sm font-bold",
                              item.mono && "font-mono",
                            )}
                          >
                            {item.value}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* SMS Info */}
                  <div className="flex gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                    <HiInformationCircle className="mt-0.5 size-4 shrink-0 text-blue-600" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
                        SMS Confirmation
                      </p>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        The voter will receive an SMS with their registration ID
                        and a link to complete candidate selection.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep("location")}
                      className="h-11 flex-1 gap-2 rounded-xl text-sm font-bold"
                      disabled={isSubmitting}
                    >
                      <HiArrowLeft className="size-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handleFinalSubmit}
                      className="h-11 flex-1 gap-2 rounded-xl bg-green-600 text-sm font-bold text-white hover:bg-green-700 active:scale-95"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <HiCheckCircle className="size-4" />
                          Register Voter
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Trust Indicators */}
      <TrustIndicators
        items={[
          {
            icon: <HiShieldCheck />,
            label: "DATA_SECURE",
          },
          {
            icon: <HiCreditCard />,
            label: "NIMC_VERIFIED",
          },
          {
            icon: <HiShieldCheck />,
            label: "SMS_CONFIRM",
          },
        ]}
        canvasser
      />
    </div>
  );
}
