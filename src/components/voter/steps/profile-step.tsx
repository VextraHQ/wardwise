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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { StepProgress } from "@/components/ui/step-progress";
import { Separator } from "@/components/ui/separator";
import { RegistrationStepHeader } from "../registration-step-header";
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
import { useRegistrationStore } from "@/stores/registration-store";
import { normalizeNigerianPhoneInput } from "@/lib/schemas/common-schemas";
import { useEffect, useMemo } from "react";
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

export function ProfileStep() {
  const router = useRouter();
  const { update, payload, hasHydrated } = useRegistrationStore();

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
    router.push("/register/location");
  };

  // Calculate Age from Date of Birth
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return undefined;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
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
    return maxDate.toISOString().split("T")[0];
  };

  // Get min date (120 years ago from today)
  const getMinDate = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setFullYear(today.getFullYear() - 120);
    return minDate.toISOString().split("T")[0];
  };

  // Handle Date of Birth Change
  const handleDateChange = (date: string) => {
    form.setValue("dateOfBirth", date);
    const age = calculateAge(date);
    if (age !== undefined) {
      form.setValue("age", age);
    }
  };

  // Autofilled Information
  const isAutoFilled = payload.basic?.firstName && payload.basic?.lastName;

  const occupationOptions: ComboboxSelectOption[] = [
    { value: "civil-servant", label: "Civil Servant" },
    { value: "teacher", label: "Teacher" },
    {
      value: "healthcare-worker",
      label: "Healthcare Worker",
    },
    { value: "farmer", label: "Farmer" },
    { value: "trader", label: "Trader/Business Owner" },
    {
      value: "artisan",
      label: "Artisan (Carpenter, Tailor, etc.)",
    },
    { value: "student", label: "Student" },
    { value: "unemployed", label: "Unemployed" },
    { value: "retired", label: "Retired" },
    {
      value: "private-sector",
      label: "Private Sector Employee",
    },
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
    { value: "other", label: "Other" },
  ];

  const religionOptions: ComboboxSelectOption[] = [
    { value: "christianity", label: "Christianity" },
    { value: "islam", label: "Islam" },
    { value: "traditional", label: "Traditional Religion" },
    { value: "other", label: "Other" },
    { value: "none", label: "None/Prefer not to say" },
  ];

  // Show loading state until store has hydrated from localStorage
  if (!hasHydrated) {
    return (
      <div className="space-y-6">
        <StepProgress
          currentStep={3}
          totalSteps={6}
          stepTitle="Personal Information"
        />
        <div className="mx-auto w-full max-w-2xl">
          <Card className="border-border/60 bg-card/95 backdrop-blur-sm">
            <CardContent className="flex min-h-[400px] items-center justify-center">
              <div className="space-y-4 text-center">
                <div className="text-primary mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                <p className="text-muted-foreground text-sm">
                  Loading your information...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reusable Progress Component */}
      <StepProgress
        currentStep={3}
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
      {isAutoFilled && (
        <Badge variant="secondary" className="mx-auto -mt-4 mb-6 flex w-fit">
          <HiInformationCircle className="mr-1 h-3 w-3" />
          Some information was auto-filled from NIN verification
        </Badge>
      )}

      {/* Main Card */}
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-border/60 bg-card/95 backdrop-blur-sm">
          <CardHeader className="border-border border-b">
            <div className="space-y-1">
              <h2 className="text-foreground text-lg font-semibold tracking-tight">
                Personal Information
              </h2>
              <p className="text-muted-foreground text-sm">
                Your details remain confidential and secure
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-foreground text-sm font-semibold">
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
                      render={({ field }) => {
                        const isDisabled = Boolean(
                          isAutoFilled && field.value && field.value !== "",
                        );
                        return (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              First Name
                              {isAutoFilled && field.value && (
                                <Badge
                                  variant="secondary"
                                  className="bg-primary/10 text-primary border-primary/20 text-xs"
                                >
                                  <HiCheckCircle className="mr-1 h-3 w-3" />
                                  Auto-filled
                                </Badge>
                              )}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <HiUser className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                                <Input
                                  {...field}
                                  placeholder="Enter your first name"
                                  className={cn(
                                    "border-border/60 bg-background/50 focus:border-primary/60 focus:bg-background h-12 pl-11 transition-all",
                                    isDisabled &&
                                      "cursor-not-allowed opacity-60",
                                  )}
                                  disabled={isDisabled}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => {
                        const isDisabled = Boolean(
                          isAutoFilled && field.value && field.value !== "",
                        );
                        return (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Last Name
                              {isAutoFilled && field.value && (
                                <Badge
                                  variant="secondary"
                                  className="bg-primary/10 text-primary border-primary/20 text-xs"
                                >
                                  <HiCheckCircle className="mr-1 h-3 w-3" />
                                  Auto-filled
                                </Badge>
                              )}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <HiUser className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                                <Input
                                  {...field}
                                  placeholder="Enter your last name"
                                  className={cn(
                                    "border-border/60 bg-background/50 focus:border-primary/60 focus:bg-background h-12 pl-11 transition-all",
                                    isDisabled &&
                                      "cursor-not-allowed opacity-60",
                                  )}
                                  disabled={isDisabled}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  {/* Middle Name Field */}
                  <FormField
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <HiUser className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                            <Input
                              {...field}
                              placeholder="Enter your middle name (optional)"
                              className="border-border/60 bg-background/50 focus:border-primary/60 focus:bg-background h-12 pl-11 transition-all"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <HiMail className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="your.email@example.com"
                              className="border-border/60 bg-background/50 focus:border-primary/60 focus:bg-background h-12 pl-11 transition-all"
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          We&apos;ll use this to keep you updated about your
                          candidates
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Date of Birth & Age Section */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-foreground text-sm font-semibold">
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
                        const isDisabled = Boolean(
                          isAutoFilled && field.value && field.value !== "",
                        );
                        return (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Date of Birth
                              {isAutoFilled && field.value && (
                                <Badge
                                  variant="secondary"
                                  className="bg-primary/10 text-primary border-primary/20 text-xs"
                                >
                                  <HiCheckCircle className="mr-1 h-3 w-3" />
                                  Auto-filled
                                </Badge>
                              )}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <HiCalendar className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                                <Input
                                  {...field}
                                  type="date"
                                  placeholder="Select your date of birth"
                                  max={getMaxDate()}
                                  min={getMinDate()}
                                  className={cn(
                                    "border-border/60 bg-background/50 focus:border-primary/60 focus:bg-background h-12 pl-11 transition-all",
                                    isDisabled &&
                                      "cursor-not-allowed opacity-60",
                                  )}
                                  onChange={(e) =>
                                    handleDateChange(e.target.value)
                                  }
                                  disabled={isDisabled}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    {/* Age Field - Read-only */}
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => {
                        const isDisabled = Boolean(
                          isAutoFilled && field.value !== undefined,
                        );
                        return (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Age
                              {isAutoFilled && field.value && (
                                <Badge
                                  variant="secondary"
                                  className="bg-primary/10 text-primary border-primary/20 text-xs"
                                >
                                  <HiCheckCircle className="mr-1 h-3 w-3" />
                                  Auto-calculated
                                </Badge>
                              )}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type="number"
                                  inputMode="numeric"
                                  placeholder="Auto-calculated"
                                  className={cn(
                                    "border-border/60 bg-muted/30 focus:border-primary/60 h-12 transition-all",
                                    isDisabled &&
                                      "cursor-not-allowed opacity-60",
                                  )}
                                  value={field.value ?? ""}
                                  readOnly
                                  disabled={isDisabled}
                                />
                                <div className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">
                                  years
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>

                <Separator />

                {/* Personal Details Section */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-foreground text-sm font-semibold">
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
                        <FormLabel>Gender</FormLabel>
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
                            <FormLabel>Occupation</FormLabel>
                            <FormControl>
                              <ComboboxSelect
                                options={occupationOptions}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Select your occupation"
                                searchPlaceholder="Search occupations..."
                                emptyMessage="No occupation found."
                              />
                            </FormControl>
                            <FormMessage />
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
                            <FormLabel>Religion/Creed</FormLabel>
                            <FormControl>
                              <ComboboxSelect
                                options={religionOptions}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Select your religion"
                                searchPlaceholder="Search religions..."
                                emptyMessage="No religion found."
                              />
                            </FormControl>
                            <FormMessage />
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
                    <h3 className="text-foreground text-sm font-semibold">
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
                          <FormLabel>
                            Phone Number
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HiInformationCircle className="text-muted-foreground inline h-4 w-4 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Your phone number is required for
                                    registration and to receive notifications
                                    about your registration
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <HiPhone className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                              <Input
                                {...field}
                                inputMode="tel"
                                autoComplete="tel"
                                placeholder="08012345678 or +2348012345678"
                                className={cn(
                                  "border-border/60 bg-background/50 focus:border-primary/60 focus:bg-background h-12 pr-11 pl-11 transition-all",
                                  isValid &&
                                    !form.formState.errors.phoneNumber &&
                                    "border-primary/30",
                                )}
                              />
                              {isValid &&
                                !form.formState.errors.phoneNumber && (
                                  <HiCheckCircle className="text-primary absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2" />
                                )}
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">
                            Enter a valid Nigerian mobile number (e.g.,
                            08031234567 or +2348031234567)
                          </FormDescription>
                          <FormMessage />
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
                          <FormLabel className="flex items-center gap-2">
                            VIN/PVC Number (Optional)
                            <Badge variant="secondary" className="text-xs">
                              Become Verified
                            </Badge>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <HiShieldCheck className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                              <Input
                                {...field}
                                placeholder="19-20 digit VIN number"
                                maxLength={20}
                                className="border-border/60 bg-background/50 focus:border-primary/60 focus:bg-background h-12 pl-11 transition-all"
                              />
                            </div>
                          </FormControl>
                          <div className="text-muted-foreground space-y-1 text-sm">
                            <span className="block font-medium">
                              Benefits of adding your VIN:
                            </span>
                            <ul className="ml-4 list-disc text-xs">
                              <li>Show commitment to your candidates</li>
                              <li>Get verified voter badge</li>
                              <li>Receive priority updates</li>
                            </ul>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <Separator />

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/register/role")}
                    className="h-10 flex-1"
                  >
                    <HiArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 flex-1 font-semibold transition-all duration-200"
                  >
                    Continue
                    <HiArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Subtle Trust Indicators */}
      <TrustIndicators
        items={[
          { icon: <HiUser className="h-4 w-4" />, label: "Data Privacy" },
          { icon: <HiCalendar className="h-4 w-4" />, label: "Age Verified" },
          { icon: <HiPhone className="h-4 w-4" />, label: "Contact Verified" },
        ]}
      />
    </div>
  );
}
