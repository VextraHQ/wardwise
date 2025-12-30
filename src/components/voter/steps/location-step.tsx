"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  HiLocationMarker,
  HiQuestionMarkCircle,
  HiArrowRight,
  HiArrowLeft,
  HiCheck,
  HiInformationCircle,
  HiExclamationCircle,
} from "react-icons/hi";
import { MapPin, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StepProgress } from "@/components/ui/step-progress";
import { RegistrationStepHeader } from "@/components/voter/registration-step-header";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRegistrationStore } from "@/stores/registration-store";
import { useLocationData } from "@/hooks/use-location-data";
import { useQueryClient } from "@tanstack/react-query";
import { TrustIndicators } from "@/components/ui/trust-indicators";
import {
  ComboboxSelect,
  type ComboboxSelectOption,
} from "@/components/ui/combobox-select";

const locationSchema = z.object({
  state: z.string().min(1, "Please select your state"),
  lga: z.string().min(1, "Please select your LGA"),
  ward: z.string().min(1, "Please select your ward"),
  pollingUnit: z.string().min(1, "Please select your polling unit"),
});

const pilotCoverage = [
  {
    code: "AD",
    name: "Adamawa State",
    lgAs: [
      { code: "YOLN", name: "Yola North" },
      { code: "YOLS", name: "Yola South" },
      { code: "FUF", name: "Fufore" },
      { code: "SONG", name: "Song" },
      { code: "JADA", name: "Jada" },
      { code: "GANYE", name: "Ganye" },
      { code: "MAYO-BELWA", name: "Mayo Belwa" },
      { code: "TOUNGO", name: "Toungo" },
    ],
  },
  {
    code: "BA",
    name: "Bauchi State",
    lgAs: [
      { code: "BAUCHI-LGA", name: "Bauchi" },
      { code: "JAMA-ARE", name: "Jama'are" },
      { code: "ITAS-GADAU", name: "Itas/Gadau" },
      { code: "NINGI", name: "Ningi" },
      { code: "WARJI", name: "Warji" },
    ],
  },
];

type LocationFormValues = z.infer<typeof locationSchema>;

interface PilotStatusBadgeProps {
  title: string;
  description: string | React.ReactNode;
  variant?: "warning" | "info" | "success";
}

function PilotStatusBadge({
  title,
  description,
  variant = "warning",
}: PilotStatusBadgeProps) {
  const bgColor =
    variant === "warning"
      ? "bg-amber-100/50 text-amber-700 border-amber-200"
      : "bg-blue-100/50 text-blue-700 border-blue-200";

  const iconColor = variant === "warning" ? "text-amber-500" : "text-blue-500";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "hover:bg-opacity-80 flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-colors active:scale-95",
            bgColor,
          )}
        >
          <AlertCircle className={cn("h-3 w-3", iconColor)} />
          <span>Status</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 overflow-hidden border-none p-0 shadow-xl">
        <div
          className={cn(
            "flex items-center gap-2 border-b p-3",
            variant === "warning"
              ? "border-amber-100 bg-amber-50"
              : "border-blue-100 bg-blue-50",
          )}
        >
          <AlertCircle className={cn("h-4 w-4", iconColor)} />
          <h4
            className={cn(
              "text-xs font-bold tracking-tight uppercase",
              variant === "warning" ? "text-amber-800" : "text-blue-800",
            )}
          >
            {title}
          </h4>
        </div>
        <div className="bg-white p-4">
          <p className="text-muted-foreground text-xs leading-relaxed font-medium">
            {description}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function LocationStep() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { update } = useRegistrationStore();
  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      state: "",
      lga: "",
      ward: "",
      pollingUnit: "",
    },
  });

  // Get form values for completion indicators
  const watchedValues = form.watch();
  const isStateComplete = !!watchedValues.state;
  const isLgaComplete = !!watchedValues.lga;
  const isWardComplete = !!watchedValues.ward;
  const isPollingUnitComplete = !!watchedValues.pollingUnit;
  const completedFields = [
    isStateComplete,
    isLgaComplete,
    isWardComplete,
    isPollingUnitComplete,
  ].filter(Boolean).length;

  // Use optimized location data hooks
  const locationData = useLocationData();
  const lgasQuery = locationData.useLGAs(selectedState);
  const wardsQuery = locationData.useWards(selectedLga);
  const pollingUnitsQuery = locationData.usePollingUnits(selectedWard);

  // Get data with fallbacks
  const states = locationData.states;
  const lgas = lgasQuery.data || [];
  const wards = wardsQuery.data || [];
  const pollingUnits = pollingUnitsQuery.data || [];

  const lgasError = lgasQuery.isError;
  const wardsError = wardsQuery.isError;
  const puError = pollingUnitsQuery.isError;

  const selectedStateName =
    states.find((state) => state.code === selectedState)?.name || "";
  const selectedLgaName =
    lgas.find((lga) => lga.code === selectedLga)?.name || "";
  const selectedWardName =
    wards.find((ward) => ward.code === selectedWard)?.name || "";

  const selectedStateLabel = selectedStateName || "this state";
  const selectedLgaLabel = selectedLgaName || "this LGA";
  const selectedWardLabel = selectedWardName || "this ward";

  const pilotState = pilotCoverage.find(
    (state) => state.code === selectedState,
  );
  const pilotLga = pilotState?.lgAs.find((lga) => lga.code === selectedLga);
  const isStateCovered = Boolean(pilotState);
  const isLgaCovered = Boolean(pilotLga);

  // Reset dependent fields when parent selection changes
  useEffect(() => {
    if (selectedState) {
      form.setValue("lga", "");
      form.setValue("ward", "");
      form.setValue("pollingUnit", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState]);

  useEffect(() => {
    if (selectedLga) {
      form.setValue("ward", "");
      form.setValue("pollingUnit", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLga]);

  useEffect(() => {
    if (selectedWard) {
      form.setValue("pollingUnit", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWard]);

  const onSubmit = (data: LocationFormValues) => {
    const stateName =
      states.find((s) => s.code === data.state)?.name || data.state;
    const lgaName = lgas.find((l) => l.code === data.lga)?.name || data.lga;
    const wardName = wards.find((w) => w.code === data.ward)?.name || data.ward;
    const puName =
      pollingUnits.find((p) => p.code === data.pollingUnit)?.name ||
      data.pollingUnit;

    update({
      location: {
        state: stateName,
        lga: lgaName,
        ward: wardName,
        pollingUnit: puName,
      },
    });
    toast.success("Location saved!");
    router.push("/register/candidate");
  };

  // Helper to determine if dropdown should show loading
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

  return (
    <div className="space-y-6">
      {/* Reusable Progress Component */}
      <StepProgress
        currentStep={4}
        totalSteps={6}
        stepTitle="Voting Location"
      />

      {/* Hero Section with Sparkles Badge */}
      <RegistrationStepHeader
        icon={MapPin}
        badge="Finding Your Polling Unit"
        title="Where Do You Vote?"
        description="Help us find your exact polling unit location"
      />

      {/* Pilot Coverage Notice */}
      <Card className="border-border/70 bg-card/80 border-dashed backdrop-blur-sm">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="text-primary">
            <HiInformationCircle className="h-6 w-6" />
          </div>
          <div className="space-y-3 text-left">
            <div>
              <p className="text-foreground text-sm font-semibold">
                Pilot availability
              </p>
              <p className="text-muted-foreground text-xs">
                All states and LGAs are selectable, but wards & polling units
                are only digitized in the pilot corridors below.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {pilotCoverage.map((state) => (
                <Badge
                  key={state.code}
                  variant="secondary"
                  className="gap-1 text-xs font-medium"
                >
                  <HiLocationMarker className="h-3 w-3" />
                  {state.name.replace(" State", "")}
                </Badge>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              Choose LGAs like Yola North, Fufore, Jama'are or Bauchi to explore
              the end-to-end demo experience. Other areas will show limited ward
              data for now.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Card */}
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-border/60 bg-card/95 backdrop-blur-sm">
          <CardHeader className="border-border border-b">
            <div className="space-y-2">
              <h2 className="text-foreground text-lg font-semibold tracking-tight">
                Polling Unit Location
              </h2>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-muted-foreground text-sm">
                  Select your voting location details
                </p>
                <div className="flex items-center gap-2">
                  <div className="text-muted-foreground text-xs">
                    {completedFields}/4 completed
                  </div>
                  <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full transition-all duration-300 ease-out"
                      style={{ width: `${(completedFields / 4) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {/* State */}
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => {
                      const pilotStates = states.filter((s) =>
                        pilotCoverage.some((pc) => pc.code === s.code),
                      );
                      const otherStates = states.filter(
                        (s) => !pilotCoverage.some((pc) => pc.code === s.code),
                      );

                      const stateGroups = [
                        {
                          heading: "Pilot Areas (Digitized)",
                          options: pilotStates.map((s) => ({
                            value: s.code,
                            label: s.name,
                            indicator: (
                              <div className="bg-primary group-hover:bg-secondary group-data-[selected=true]:bg-secondary h-1.5 w-1.5 rounded-full transition-colors" />
                            ),
                            description:
                              "Full ward & polling unit data available",
                          })),
                        },
                        {
                          heading: "Other States",
                          options: otherStates.map((s) => ({
                            value: s.code,
                            label: s.name,
                          })),
                        },
                      ];

                      return (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            <span className="text-muted-foreground/80 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                              State
                              {isStateComplete && (
                                <HiCheck className="text-primary h-3.5 w-3.5" />
                              )}
                            </span>
                            {selectedState &&
                              !isStateCovered &&
                              !locationData.statesLoading && (
                                <PilotStatusBadge
                                  title="Pilot Notice"
                                  description={`Wards and polling units for ${selectedStateLabel} are still being mapped. Pilot coverage currently focuses on Adamawa & Bauchi.`}
                                />
                              )}
                          </FormLabel>
                          <FormControl>
                            <ComboboxSelect
                              groups={stateGroups}
                              value={field.value}
                              isLoading={locationData.statesLoading}
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedState(value);
                                setSelectedLga("");
                                setSelectedWard("");
                                locationData.prefetchLGAs(queryClient, value);
                              }}
                              placeholder="Select your state"
                              searchPlaceholder="Search states..."
                              emptyMessage={
                                locationData.statesError
                                  ? "Could not load states. Please check your connection."
                                  : "No state found."
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  {/* LGA */}
                  <FormField
                    control={form.control}
                    name="lga"
                    render={({ field }) => {
                      const pilotLgaCodes =
                        pilotState?.lgAs.map((l) => l.code) || [];

                      const pilotLgasList = lgas.filter((l) =>
                        pilotLgaCodes.includes(l.code),
                      );
                      const otherLgasList = lgas.filter(
                        (l) => !pilotLgaCodes.includes(l.code),
                      );

                      const lgaGroups = [
                        ...(pilotLgasList.length > 0
                          ? [
                              {
                                heading: "Digitized LGAs",
                                options: pilotLgasList.map((l) => ({
                                  value: l.code,
                                  label: l.name,
                                  indicator: (
                                    <div className="bg-primary group-hover:bg-secondary group-data-[selected=true]:bg-secondary h-1.5 w-1.5 rounded-full transition-colors" />
                                  ),
                                  description: "Full digitized data available",
                                })),
                              },
                            ]
                          : []),
                        ...(otherLgasList.length > 0
                          ? [
                              {
                                heading: "Other LGAs",
                                options: otherLgasList.map((l) => ({
                                  value: l.code,
                                  label: l.name,
                                })),
                              },
                            ]
                          : []),
                      ];

                      return (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            <span className="text-muted-foreground/80 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                              Local Government (LGA)
                              {isLgaComplete && (
                                <HiCheck className="text-primary h-3.5 w-3.5" />
                              )}
                            </span>
                            {selectedLga &&
                              selectedState &&
                              isStateCovered &&
                              !isLgaCovered &&
                              !isLoading("wards") && (
                                <PilotStatusBadge
                                  title="Limited Demo"
                                  description={
                                    <>
                                      Selected area is outside active
                                      digitization. Try{" "}
                                      <span className="text-foreground font-bold">
                                        {pilotState?.lgAs
                                          .map((lga) => lga.name)
                                          .slice(0, 4)
                                          .join(", ")}
                                      </span>{" "}
                                      for the full experience.
                                    </>
                                  }
                                />
                              )}
                          </FormLabel>
                          <FormControl>
                            <ComboboxSelect
                              groups={
                                lgaGroups.length > 0 ? lgaGroups : undefined
                              }
                              options={
                                lgaGroups.length === 0
                                  ? lgas.map((l) => ({
                                      value: l.code,
                                      label: l.name,
                                    }))
                                  : undefined
                              }
                              value={field.value}
                              isLoading={isLoading("lgas")}
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedLga(value);
                                setSelectedWard("");
                                locationData.prefetchWards(queryClient, value);
                              }}
                              placeholder={
                                !selectedState
                                  ? "Select state first"
                                  : "Select your LGA"
                              }
                              searchPlaceholder="Search LGAs..."
                              emptyMessage={
                                lgasError
                                  ? "Error loading LGAs. Try re-selecting the state."
                                  : "No LGA found in this state."
                              }
                              disabled={!selectedState}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  {/* Ward */}
                  <FormField
                    control={form.control}
                    name="ward"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            <span className="text-muted-foreground/80 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                              Ward
                              {isWardComplete && (
                                <HiCheck className="text-primary h-3.5 w-3.5" />
                              )}
                            </span>
                          </FormLabel>
                          <FormControl>
                            <ComboboxSelect
                              options={wards.map((ward) => ({
                                value: ward.code,
                                label: ward.name,
                                indicator: isLgaCovered ? (
                                  <div className="bg-primary group-hover:bg-secondary group-data-[selected=true]:bg-secondary h-1.5 w-1.5 rounded-full transition-colors" />
                                ) : undefined,
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
                                  : "Select your ward"
                              }
                              searchPlaceholder="Search wards..."
                              emptyMessage={
                                wardsError
                                  ? "Error loading wards. Try re-selecting the LGA."
                                  : "No ward found in this LGA."
                              }
                              disabled={!selectedLga}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  {/* Polling Unit */}
                  <FormField
                    control={form.control}
                    name="pollingUnit"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            <span className="text-muted-foreground/80 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                              Polling Unit
                              {isPollingUnitComplete && (
                                <HiCheck className="text-primary h-3.5 w-3.5" />
                              )}
                            </span>
                            {selectedWard &&
                              isLgaCovered &&
                              !isLoading("pollingUnits") &&
                              pollingUnits.length === 0 && (
                                <PilotStatusBadge
                                  title="Rollout Update"
                                  variant="info"
                                  description={`Polling units for ${selectedWardLabel} are coming soon. Please try another ward in this LGA.`}
                                />
                              )}
                          </FormLabel>
                          <FormControl>
                            <ComboboxSelect
                              options={pollingUnits.map((unit) => ({
                                value: unit.code,
                                label: `${unit.code} - ${unit.name}`,
                              }))}
                              value={field.value}
                              isLoading={isLoading("pollingUnits")}
                              onValueChange={field.onChange}
                              placeholder={
                                !selectedWard
                                  ? "Select ward first"
                                  : "Select your polling unit"
                              }
                              searchPlaceholder="Search by code (001) or name..."
                              emptyMessage={
                                puError
                                  ? "Error loading polling units. Try re-selecting the ward."
                                  : "No polling unit found."
                              }
                              disabled={!selectedWard}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                {/* Help Section */}
                <div className="border-border bg-muted/50 rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <HiQuestionMarkCircle className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                    <div className="space-y-2">
                      <p className="text-foreground text-sm font-medium">
                        Need help finding your location details?
                      </p>
                      <p className="text-muted-foreground text-xs">
                        You can find your polling unit on your voter's card or
                        contact INEC for assistance.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/register/profile")}
                    className="h-10 flex-1"
                  >
                    <HiArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground h-10 flex-1 bg-linear-to-r font-semibold transition-all duration-200"
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
          {
            icon: <HiLocationMarker className="h-4 w-4" />,
            label: "Accurate Location",
          },
          {
            icon: <HiQuestionMarkCircle className="h-4 w-4" />,
            label: "Help Available",
          },
        ]}
      />
    </div>
  );
}
