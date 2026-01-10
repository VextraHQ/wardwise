"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HiUser,
  HiPhone,
  HiMail,
  HiCalendar,
  HiInformationCircle,
  HiArrowRight,
  HiArrowLeft,
  HiUserCircle,
  HiCheckCircle,
  HiShieldCheck,
} from "react-icons/hi";
import { UserCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StepProgress } from "@/components/ui/step-progress";
import { Separator } from "@/components/ui/separator";
import { RegistrationStepHeader } from "@/components/voter/registration-step-header";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { motion } from "motion/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useRegistrationStore } from "@/stores/registration-store";
import { normalizeNigerianPhoneInput } from "@/lib/schemas/common-schemas";
import { useEffect, useMemo, useState } from "react";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import {
  ComboboxSelect,
  type ComboboxSelectOption,
} from "@/components/ui/combobox-select";
import { type Voter } from "@/types/voter";
import {
  profileSchema,
  type ProfileFormValues,
} from "@/lib/schemas/voter-schemas";
import {
  OCCUPATION_OPTIONS,
  RELIGION_OPTIONS,
} from "@/lib/constants/voter-options";

export function ProfileStep() {
  const router = useRouter();
  const { update, payload, hasHydrated } = useRegistrationStore();
  const [isDobOpen, setIsDobOpen] = useState(false);

  // Get role from store payload (set in previous step)
  const userRole = payload.basic?.role || "voter";

  // Get initial values - memoized to prevent unnecessary recalculations
  const initialValues = useMemo((): ProfileFormValues => {
    if (!hasHydrated) {
      // Return empty values until hydration
      return {
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        dateOfBirth: "",
        age: 18,
        gender: "male", // Default to avoid undefined type error
        occupation: "",
        religion: "",
        phoneNumber: "",
        vin: "",
      };
    }
    // Return hydrated values
    return {
      firstName: payload.basic?.firstName || "",
      middleName: payload.basic?.middleName || "",
      lastName: payload.basic?.lastName || "",
      email: payload.basic?.email || "",
      dateOfBirth: payload.basic?.dateOfBirth || "",
      age: payload.basic?.age ?? 18,
      gender: (payload.basic?.gender as Voter["gender"]) || "male",
      occupation: payload.basic?.occupation || "",
      religion: payload.basic?.religion || "",
      phoneNumber: payload.phone ? payload.phone.replace("+234", "0") : "",
      vin: payload.basic?.vin || "",
    };
  }, [hasHydrated, payload.basic, payload.phone]);

  // Form Initial Values - updates when hasHydrated changes
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialValues,
  });

  // Update form when hydration completes or payload changes
  useEffect(() => {
    if (!hasHydrated) return;
    form.reset(initialValues);
  }, [hasHydrated, initialValues, form]);

  // Form Submission Handler
  const onSubmit = (data: ProfileFormValues) => {
    update({
      basic: {
        role: payload.basic?.role as Voter["role"],
        ...data,
      },
      phone: normalizeNigerianPhoneInput(data.phoneNumber),
    });
    toast.success("Profile information saved!");
    router.push("/register/role");
  };

  // Calculate Age from Date of Birth
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return undefined;
    const today = new Date();
    const birthDate = getDateFromString(dateOfBirth);
    if (!birthDate) return undefined;
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Get max date (18 years ago from today)
  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today);
    // Remove restriction since age validation is handled in previous step
    // But keep a reasonable upper bound if needed, or just let it be
    maxDate.setFullYear(today.getFullYear() - 10); // Example: min age 10 for supporters
    return format(maxDate, "yyyy-MM-dd");
  };

  // Get min date (120 years ago from today)
  const getMinDate = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setFullYear(today.getFullYear() - 120);
    return format(minDate, "yyyy-MM-dd");
  };

  // Handle Date of Birth Change
  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    const dateString = format(date, "yyyy-MM-dd");
    const age = calculateAge(dateString);
    if (age !== undefined) {
      form.setValue("age", age);
    }
  };

  // Function to parse YYYY-MM-DD date string to Date object
  const parseYmdToLocalDate = (dateString: string | undefined) => {
    if (!dateString) return undefined;
    const parts = dateString.split("-");
    if (parts.length !== 3) return undefined;
    const [y, m, d] = parts.map((v) => Number(v));
    if (!y || !m || !d) return undefined;
    const date = new Date(y, m - 1, d);
    return isNaN(date.getTime()) ? undefined : date;
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      const date = parseYmdToLocalDate(dateString);
      if (!date) return "";
      if (isNaN(date.getTime())) return "";
      return format(date, "PPP"); // e.g., "January 1, 2000"
    } catch {
      return "";
    }
  };

  // Convert date string to Date object
  const getDateFromString = (
    dateString: string | undefined,
  ): Date | undefined => {
    if (!dateString) return undefined;
    try {
      const date = parseYmdToLocalDate(dateString);
      if (!date) return undefined;
      return date;
    } catch {
      return undefined;
    }
  };
  // Use centralized options from voter-schemas for consistency
  const occupationOptions: ComboboxSelectOption[] = [...OCCUPATION_OPTIONS];
  const religionOptions: ComboboxSelectOption[] = [...RELIGION_OPTIONS];

  // Show loading state until store has hydrated from localStorage
  if (!hasHydrated) {
    return (
      <div className="space-y-6">
        <StepProgress
          currentStep={2}
          totalSteps={6}
          stepTitle="Personal Information"
        />
        <div className="mx-auto w-full max-w-2xl">
          <div className="border-border/60 bg-card relative overflow-hidden border shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)]">
            {/* Architectural Markers */}
            <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
            <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />

            <div className="flex min-h-[400px] items-center justify-center p-10">
              <div className="space-y-4 text-center">
                <div className="text-primary mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                <p className="text-muted-foreground text-sm font-medium">
                  Loading your information...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reusable Progress Component */}
      <StepProgress
        currentStep={2}
        totalSteps={6}
        stepTitle="Personal Information"
      />

      {/* Hero Section with Sparkles Badge */}
      <RegistrationStepHeader
        icon={UserCircle}
        badge="Building Your Profile"
        title="Tell Us About Yourself"
        description="We need some basic information to complete your registration"
      />

      {/* Verification Info Banner */}
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
          <HiInformationCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Your information will be verified at the final step
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Please enter accurate details. We'll verify your NIN matches this
              information when you complete registration.
            </p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-border/60 bg-card relative overflow-hidden border shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)]"
      >
        {/* Architectural Markers */}
        <div className="border-primary absolute top-0 left-0 size-5 border-t border-l" />
        <div className="border-primary absolute top-0 right-0 size-5 border-t border-r" />

        <div className="p-7 sm:p-10">
          <div className="border-border/40 mb-8 flex items-center justify-between border-b pb-6">
            <div className="space-y-1">
              <h2 className="text-foreground text-lg font-bold tracking-tight uppercase">
                Personal Profile
              </h2>
              <div className="flex items-center gap-2">
                <div className="bg-primary/60 size-1.5 rounded-[1px]" />
                <p className="text-muted-foreground font-mono text-[10px] font-medium tracking-widest uppercase">
                  Profile Status <span className="text-primary/40 mx-1">|</span>{" "}
                  <span className="text-foreground font-bold">In Progress</span>
                </p>
              </div>
            </div>
            <div className="bg-primary/5 text-primary border-primary/20 flex size-9 items-center justify-center rounded-lg border">
              <HiUserCircle className="size-4.5" />
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-foreground text-xs font-bold tracking-widest uppercase">
                    Basic Information
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    Your personal identification details
                  </p>
                </div>

                {/* Name Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground text-[10px] font-bold tracking-widest uppercase">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md border">
                              <HiUser className="text-muted-foreground size-3.5" />
                            </div>
                            <Input
                              {...field}
                              placeholder="Enter first name"
                              className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 pl-12 font-medium transition-all placeholder:text-xs"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[9px] tracking-wide uppercase" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground text-[10px] font-bold tracking-widest uppercase">
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md border">
                              <HiUser className="text-muted-foreground size-3.5" />
                            </div>
                            <Input
                              {...field}
                              placeholder="Enter last name"
                              className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 pl-12 font-medium transition-all placeholder:text-xs"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[9px] tracking-wide uppercase" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Middle Name Field */}
                <FormField
                  control={form.control}
                  name="middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground text-[10px] font-bold tracking-widest uppercase">
                        Middle Name (Optional)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md border">
                            <HiUser className="text-muted-foreground size-3.5" />
                          </div>
                          <Input
                            {...field}
                            placeholder="Enter middle name"
                            className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 pl-12 font-medium transition-all placeholder:text-xs"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[9px] tracking-wide uppercase" />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground text-[10px] font-bold tracking-widest uppercase">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md border">
                            <HiMail className="text-muted-foreground size-3.5" />
                          </div>
                          <Input
                            {...field}
                            type="email"
                            placeholder="your.email@example.com"
                            className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 pl-12 font-medium transition-all placeholder:text-xs"
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        We&apos;ll use this to keep you updated about your
                        candidates
                      </FormDescription>
                      <FormMessage className="text-[9px] tracking-wide uppercase" />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Date of Birth & Age Section */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-foreground text-xs font-bold tracking-widest uppercase">
                    Date of Birth & Age
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {userRole === "voter"
                      ? "Verifying your eligibility to vote"
                      : "Your age helps us tailor your experience"}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Date of Birth Field */}
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => {
                      const selectedDate = getDateFromString(field.value);
                      const maxDate = getDateFromString(getMaxDate())!;
                      const minDate = getDateFromString(getMinDate())!;

                      return (
                        <FormItem>
                          <FormLabel className="text-foreground text-[10px] font-bold tracking-widest uppercase">
                            Date of Birth
                          </FormLabel>
                          <FormControl>
                            <div className="relative w-full">
                              <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2.5 z-20 flex size-7 -translate-y-1/2 items-center justify-center rounded-md border">
                                <HiCalendar className="text-muted-foreground size-3.5" />
                              </div>
                              <Popover
                                open={isDobOpen}
                                onOpenChange={setIsDobOpen}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                      "border-border/60 bg-muted/5 focus:border-primary focus:ring-primary hover:bg-muted/10 h-12 w-full justify-start pl-12 text-left font-medium transition-all",
                                      !field.value &&
                                        "text-muted-foreground/50 text-[10px] tracking-wider uppercase",
                                    )}
                                  >
                                    {field.value
                                      ? formatDateForDisplay(field.value)
                                      : "Select date of birth"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                      const nextValue = date
                                        ? format(date, "yyyy-MM-dd")
                                        : "";
                                      field.onChange(nextValue);
                                      handleDateChange(date);
                                      setIsDobOpen(false);
                                    }}
                                    captionLayout="dropdown" // Essential for DOB to allow year selection
                                    startMonth={
                                      new Date(
                                        minDate.getFullYear(),
                                        minDate.getMonth(),
                                        1,
                                      )
                                    }
                                    endMonth={
                                      new Date(
                                        maxDate.getFullYear(),
                                        maxDate.getMonth(),
                                        1,
                                      )
                                    }
                                    disabled={(date) =>
                                      date > maxDate || date < minDate
                                    }
                                    autoFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </FormControl>
                          <FormMessage className="text-[9px] tracking-wide uppercase" />
                        </FormItem>
                      );
                    }}
                  />

                  {/* Age Field - Read-only */}
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground text-[10px] font-bold tracking-widest uppercase">
                          Age
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type="number"
                              inputMode="numeric"
                              placeholder="Auto-calculated"
                              className="border-border/60 bg-muted/20 focus:border-primary/60 h-12 cursor-not-allowed font-mono transition-all"
                              value={field.value ?? ""}
                              readOnly
                            />
                            <div className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-[9px] font-bold tracking-wider uppercase">
                              years
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-[9px] tracking-wide uppercase" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Personal Details Section */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-foreground text-xs font-bold tracking-widest uppercase">
                    Personal Details
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    Additional information about yourself
                  </p>
                </div>

                {/* Gender Field */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground text-[10px] font-bold tracking-widest uppercase">
                        Gender
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                          className="grid grid-cols-3 gap-3 sm:gap-4"
                        >
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <RadioGroupItem
                                  value="male"
                                  id="male"
                                  className="peer sr-only"
                                />
                                <label
                                  htmlFor="male"
                                  className={cn(
                                    "border-border bg-card hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all sm:p-4",
                                    field.value === "male" &&
                                      "ring-primary/20 ring-2 ring-offset-1",
                                  )}
                                >
                                  <HiUserCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                                  <span className="text-sm font-medium">
                                    Male
                                  </span>
                                </label>
                              </div>
                            </FormControl>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <RadioGroupItem
                                  value="female"
                                  id="female"
                                  className="peer sr-only"
                                />
                                <label
                                  htmlFor="female"
                                  className={cn(
                                    "border-border bg-card hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all sm:p-4",
                                    field.value === "female" &&
                                      "ring-primary/20 ring-2 ring-offset-1",
                                  )}
                                >
                                  <HiUserCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                                  <span className="text-sm font-medium">
                                    Female
                                  </span>
                                </label>
                              </div>
                            </FormControl>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <RadioGroupItem
                                  value="other"
                                  id="other"
                                  className="peer sr-only"
                                />
                                <label
                                  htmlFor="other"
                                  className={cn(
                                    "border-border bg-card hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all sm:p-4",
                                    field.value === "other" &&
                                      "ring-primary/20 ring-2 ring-offset-1",
                                  )}
                                >
                                  <HiUserCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                                  <span className="text-sm font-medium">
                                    Other
                                  </span>
                                </label>
                              </div>
                            </FormControl>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Occupation Field */}
                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel className="text-foreground text-[10px] font-bold tracking-widest uppercase">
                            Occupation
                          </FormLabel>
                          <FormControl>
                            <ComboboxSelect
                              options={occupationOptions}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Select occupation"
                              searchPlaceholder="Search occupations..."
                              emptyMessage="No occupation found."
                            />
                          </FormControl>
                          <FormMessage className="text-[9px] tracking-wide uppercase" />
                        </FormItem>
                      );
                    }}
                  />

                  {/* Religion Field */}
                  <FormField
                    control={form.control}
                    name="religion"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel className="text-foreground text-[10px] font-bold tracking-widest uppercase">
                            Religion/Creed
                          </FormLabel>
                          <FormControl>
                            <ComboboxSelect
                              options={religionOptions}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Select religion"
                              searchPlaceholder="Search religions..."
                              emptyMessage="No religion found."
                            />
                          </FormControl>
                          <FormMessage className="text-[9px] tracking-wide uppercase" />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>

              <Separator />

              {/* Contact Information Section */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-foreground text-xs font-bold tracking-widest uppercase">
                    Contact Information
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    Your phone number for registration and notifications
                  </p>
                </div>

                {/* Phone Number Field (Required) */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => {
                    const isValid =
                      field.value &&
                      /^(\+234|0)?(7\d{2}|8\d{2}|9\d{2})\d{7}$/.test(
                        field.value,
                      );
                    return (
                      <FormItem>
                        <div className="flex items-center gap-1.5">
                          <FormLabel className="text-foreground text-[10px] font-bold tracking-widest uppercase">
                            Phone Number
                          </FormLabel>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors"
                                >
                                  <HiInformationCircle className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Your phone number is required for registration
                                  and to receive notifications about your
                                  registration
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md border">
                              <HiPhone className="text-muted-foreground size-3.5" />
                            </div>
                            <Input
                              {...field}
                              inputMode="tel"
                              autoComplete="tel"
                              placeholder="080 1234 5678"
                              className={cn(
                                "border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 pr-11 pl-12 font-mono font-medium tracking-wider transition-all",
                                isValid &&
                                  !form.formState.errors.phoneNumber &&
                                  "border-primary/30",
                              )}
                            />
                            {isValid && !form.formState.errors.phoneNumber && (
                              <HiCheckCircle className="text-primary absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2" />
                            )}
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Enter a valid Nigerian mobile number
                        </FormDescription>
                        <FormMessage className="text-[9px] tracking-wide uppercase" />
                      </FormItem>
                    );
                  }}
                />
              </div>

              {/* VIN - Only for voters */}
              {userRole === "voter" && (
                <>
                  <Separator />
                  <FormField
                    control={form.control}
                    name="vin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                          VIN/PVC Number (Optional)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="border-border/60 bg-muted/30 absolute top-1/2 left-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md border">
                              <HiShieldCheck className="text-muted-foreground size-3.5" />
                            </div>
                            <Input
                              {...field}
                              placeholder="Enter VIN Number"
                              maxLength={20}
                              className="border-border/60 bg-muted/5 focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 h-12 pl-12 font-mono font-medium tracking-wider transition-all placeholder:text-xs"
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-[9px] tracking-wide uppercase">
                          Your Voter Identification Number from your PVC card
                        </FormDescription>
                        <FormMessage className="text-[9px] tracking-wide uppercase" />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/register")}
                  className="hover:bg-muted/10 h-11 rounded-xl px-8 text-xs font-bold tracking-widest uppercase"
                >
                  <HiArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/95 h-11 flex-1 rounded-xl text-xs font-bold tracking-widest uppercase shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] transition-all active:scale-95"
                >
                  Continue to Role Selection
                  <HiArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </motion.div>

      {/* Subtle Trust Indicators */}
      <TrustIndicators
        items={[
          { icon: <HiUser className="h-4 w-4" />, label: "DATA_PRIVACY" },
          {
            icon: <HiShieldCheck className="h-4 w-4" />,
            label: "SECURE_ENCRYPTION",
          },
          {
            icon: <HiCheckCircle className="h-4 w-4" />,
            label: "VERIFIED_ON_SUBMIT",
          },
        ]}
      />
    </div>
  );
}
