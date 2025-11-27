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
} from "react-icons/hi";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StepProgress } from "@/components/ui/step-progress";
import { RegistrationStepHeader } from "../registration-step-header";
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
      default:
        return false;
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
                      const stateOptions: ComboboxSelectOption[] = states.map(
                        (state) => ({
                          value: state.code,
                          label: state.name,
                        }),
                      );

                      return (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            State
                            {isStateComplete && (
                              <HiCheck className="text-primary h-3.5 w-3.5" />
                            )}
                          </FormLabel>
                          <FormControl>
                            <ComboboxSelect
                              options={stateOptions}
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedState(value);
                                // Reset dependent fields and states
                                setSelectedLga("");
                                setSelectedWard("");
                                // Prefetch LGAs for better UX
                                locationData.prefetchLGAs(queryClient, value);
                              }}
                              placeholder={
                                locationData.statesLoading
                                  ? "Loading states..."
                                  : "Select your state"
                              }
                              searchPlaceholder="Search states..."
                              emptyMessage="No state found."
                              disabled={locationData.statesLoading}
                            />
                          </FormControl>
                          <FormMessage />
                          {selectedState &&
                            !isStateCovered &&
                            !locationData.statesLoading && (
                              <p className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                                <HiInformationCircle className="h-3 w-3" />
                                {`Wards and polling units for ${selectedStateLabel} are still being mapped. Pilot coverage currently focuses on Adamawa & Bauchi.`}
                              </p>
                            )}
                        </FormItem>
                      );
                    }}
                  />

                  {/* LGA */}
                  <FormField
                    control={form.control}
                    name="lga"
                    render={({ field }) => {
                      const lgaOptions: ComboboxSelectOption[] =
                        lgas.length > 0
                          ? lgas.map((lga) => ({
                              value: lga.code,
                              label: lga.name,
                            }))
                          : [];

                      return (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Local Government Area (LGA)
                            {isLgaComplete && (
                              <HiCheck className="h-3.5 w-3.5 text-green-600" />
                            )}
                          </FormLabel>
                          <FormControl>
                            <ComboboxSelect
                              options={lgaOptions}
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedLga(value);
                                // Reset dependent field and state
                                setSelectedWard("");
                                // Prefetch wards for better UX
                                locationData.prefetchWards(queryClient, value);
                              }}
                              placeholder={
                                !selectedState
                                  ? "Select state first"
                                  : isLoading("lgas")
                                    ? "Loading LGAs..."
                                    : "Select your LGA"
                              }
                              searchPlaceholder="Search LGAs..."
                              emptyMessage={
                                lgas.length === 0
                                  ? "LGAs not available"
                                  : "No LGA found."
                              }
                              disabled={!selectedState || isLoading("lgas")}
                            />
                          </FormControl>
                          <FormMessage />
                          {selectedLga &&
                            selectedState &&
                            isStateCovered &&
                            !isLgaCovered &&
                            !isLoading("wards") && (
                              <p className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                                <HiInformationCircle className="h-3 w-3" />
                                {selectedLgaLabel} is outside the current pilot
                                coverage for wards. Try{" "}
                                {pilotState?.lgAs
                                  .map((lga) => lga.name)
                                  .slice(0, 4)
                                  .join(", ")}
                                ...
                              </p>
                            )}
                          {selectedLga &&
                            isLgaCovered &&
                            !isLoading("wards") &&
                            wards.length === 0 && (
                              <p className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                                <HiInformationCircle className="h-3 w-3" />
                                Wards for {selectedLgaLabel} are syncing. Please
                                try another pilot LGA or check back shortly.
                              </p>
                            )}
                        </FormItem>
                      );
                    }}
                  />

                  {/* Ward */}
                  <FormField
                    control={form.control}
                    name="ward"
                    render={({ field }) => {
                      const wardOptions: ComboboxSelectOption[] =
                        wards.length > 0
                          ? wards.map((ward) => ({
                              value: ward.code,
                              label: ward.name,
                            }))
                          : [];

                      return (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Ward
                            {isWardComplete && (
                              <HiCheck className="h-3.5 w-3.5 text-green-600" />
                            )}
                          </FormLabel>
                          <FormControl>
                            <ComboboxSelect
                              options={wardOptions}
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedWard(value);
                                // Prefetch polling units for better UX
                                locationData.prefetchPollingUnits(
                                  queryClient,
                                  value,
                                );
                              }}
                              placeholder={
                                !selectedLga
                                  ? "Select LGA first"
                                  : isLoading("wards")
                                    ? "Loading wards..."
                                    : "Select your ward"
                              }
                              searchPlaceholder="Search wards..."
                              emptyMessage={
                                wards.length === 0
                                  ? "Ward data not available"
                                  : "No ward found."
                              }
                              disabled={!selectedLga || isLoading("wards")}
                            />
                          </FormControl>
                          <FormMessage />
                          {selectedWard &&
                            isLgaCovered &&
                            !isLoading("pollingUnits") &&
                            pollingUnits.length === 0 && (
                              <p className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                                <HiInformationCircle className="h-3 w-3" />
                                Polling units for {selectedWardLabel} are coming
                                soon in the pilot rollout.
                              </p>
                            )}
                        </FormItem>
                      );
                    }}
                  />

                  {/* Polling Unit */}
                  <FormField
                    control={form.control}
                    name="pollingUnit"
                    render={({ field }) => {
                      const pollingUnitOptions: ComboboxSelectOption[] =
                        pollingUnits.length > 0
                          ? pollingUnits.map((unit) => ({
                              value: unit.code,
                              label: `${unit.code} - ${unit.name}`,
                            }))
                          : [];

                      return (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Polling Unit
                            {isPollingUnitComplete && (
                              <HiCheck className="h-3.5 w-3.5 text-green-600" />
                            )}
                          </FormLabel>
                          <FormControl>
                            <ComboboxSelect
                              options={pollingUnitOptions}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder={
                                !selectedWard
                                  ? "Select ward first"
                                  : isLoading("pollingUnits")
                                    ? "Loading polling units..."
                                    : "Select your polling unit (e.g., 001, 010)"
                              }
                              searchPlaceholder="Search by code (001) or name..."
                              emptyMessage={
                                pollingUnits.length === 0
                                  ? "Polling units not available"
                                  : "No polling unit found."
                              }
                              disabled={
                                !selectedWard || isLoading("pollingUnits")
                              }
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
                <div className="flex gap-3 pt-4">
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
