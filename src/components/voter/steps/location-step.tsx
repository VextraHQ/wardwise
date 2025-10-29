"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  HiLocationMarker,
  HiQuestionMarkCircle,
  HiSparkles,
} from "react-icons/hi";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StepProgress } from "@/components/ui/step-progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRegistration } from "@/hooks/use-registration";
import { useLocationData } from "@/hooks/use-location-data";
import { useQueryClient } from "@tanstack/react-query";

const locationSchema = z.object({
  state: z.string().min(1, "Please select your state"),
  lga: z.string().min(1, "Please select your LGA"),
  ward: z.string().min(1, "Please select your ward"),
  pollingUnit: z.string().min(1, "Please select your polling unit"),
});

type LocationFormValues = z.infer<typeof locationSchema>;

export function LocationStep() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { update } = useRegistration();
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
        currentStep={3}
        totalSteps={6}
        stepTitle="Voting Location"
      />

      {/* Hero Section with Sparkles Badge */}
      <div className="space-y-3 text-center">
        <div className="border-primary/30 bg-primary/10 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
          <HiSparkles className="h-3.5 w-3.5" />
          <span>Finding Your Polling Unit</span>
        </div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          Where Do You Vote?
        </h1>
        <p className="text-muted-foreground mx-auto max-w-lg text-sm sm:text-base">
          Help us find your exact polling unit location
        </p>
      </div>

      {/* Main Card */}
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-border/60 bg-card/95 backdrop-blur-sm">
          <CardHeader className="border-border border-b">
            <div className="space-y-1">
              <h2 className="text-foreground text-lg font-semibold tracking-tight">
                Polling Unit Location
              </h2>
              <div className="flex items-center justify-between">
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          State
                          {isStateComplete && (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          )}
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedState(value);
                            // Reset dependent fields and states
                            setSelectedLga("");
                            setSelectedWard("");
                            // Prefetch LGAs for better UX
                            locationData.prefetchLGAs(queryClient, value);
                          }}
                          value={field.value}
                          disabled={locationData.statesLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 w-full">
                              <SelectValue
                                placeholder={
                                  locationData.statesLoading
                                    ? "Loading states..."
                                    : "Select your state"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state.code} value={state.code}>
                                {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* LGA */}
                  <FormField
                    control={form.control}
                    name="lga"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Local Government Area (LGA)
                          {isLgaComplete && (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          )}
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedLga(value);
                            // Reset dependent field and state
                            setSelectedWard("");
                            // Prefetch wards for better UX
                            locationData.prefetchWards(queryClient, value);
                          }}
                          value={field.value}
                          disabled={!selectedState || isLoading("lgas")}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 w-full">
                              <SelectValue
                                placeholder={
                                  !selectedState
                                    ? "Select state first"
                                    : isLoading("lgas")
                                      ? "Loading LGAs..."
                                      : "Select your LGA"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {lgas.length > 0 ? (
                              lgas.map((lga) => (
                                <SelectItem key={lga.code} value={lga.code}>
                                  {lga.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="not-available" disabled>
                                LGAs not available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Ward */}
                  <FormField
                    control={form.control}
                    name="ward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Ward
                          {isWardComplete && (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          )}
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedWard(value);
                            // Prefetch polling units for better UX
                            locationData.prefetchPollingUnits(
                              queryClient,
                              value,
                            );
                          }}
                          value={field.value}
                          disabled={!selectedLga || isLoading("wards")}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 w-full">
                              <SelectValue
                                placeholder={
                                  !selectedLga
                                    ? "Select LGA first"
                                    : isLoading("wards")
                                      ? "Loading wards..."
                                      : "Select your ward"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wards.length > 0 ? (
                              wards.map((ward) => (
                                <SelectItem key={ward.code} value={ward.code}>
                                  {ward.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="not-available" disabled>
                                Ward data not available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Polling Unit */}
                  <FormField
                    control={form.control}
                    name="pollingUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Polling Unit
                          {isPollingUnitComplete && (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          )}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedWard || isLoading("pollingUnits")}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 w-full">
                              <SelectValue
                                placeholder={
                                  !selectedWard
                                    ? "Select ward first"
                                    : isLoading("pollingUnits")
                                      ? "Loading polling units..."
                                      : "Select your polling unit"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pollingUnits.length > 0 ? (
                              pollingUnits.map((unit) => (
                                <SelectItem key={unit.code} value={unit.code}>
                                  {unit.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="not-available" disabled>
                                Polling units not available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Help Section */}
                <div className="border-border bg-muted/50 rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <HiQuestionMarkCircle className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
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
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground h-10 flex-1 bg-gradient-to-r font-semibold transition-all duration-200"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Subtle Trust Indicators */}
      <div className="mx-auto max-w-2xl">
        <div className="text-muted-foreground/80 flex items-center justify-center gap-8 text-xs">
          <div className="flex items-center gap-2">
            <HiLocationMarker className="text-primary h-4 w-4" />
            <span className="font-medium">Accurate Location</span>
          </div>
          <div className="flex items-center gap-2">
            <HiQuestionMarkCircle className="text-primary h-4 w-4" />
            <span className="font-medium">Help Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}
