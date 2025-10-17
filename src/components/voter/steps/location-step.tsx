"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, ArrowRight, ArrowLeft, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  states,
  lgasByState,
  wardsByLga,
  pollingUnitsByWard,
} from "@/lib/locationData";

const locationSchema = z.object({
  state: z.string().min(1, "Please select your state"),
  lga: z.string().min(1, "Please select your LGA"),
  ward: z.string().min(1, "Please select your ward"),
  pollingUnit: z.string().min(1, "Please select your polling unit"),
}) as any;

type LocationFormValues = z.infer<typeof locationSchema>;

export function LocationStep() {
  const router = useRouter();
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

  const lgas = selectedState ? lgasByState[selectedState] || [] : [];
  const wards = selectedLga ? wardsByLga[selectedLga] || [] : [];
  const pollingUnits = selectedWard
    ? pollingUnitsByWard[selectedWard] || []
    : [];

  useEffect(() => {
    form.setValue("lga", "");
    form.setValue("ward", "");
    form.setValue("pollingUnit", "");
    setSelectedLga("");
    setSelectedWard("");
  }, [selectedState, form]);

  useEffect(() => {
    form.setValue("ward", "");
    form.setValue("pollingUnit", "");
    setSelectedWard("");
  }, [selectedLga, form]);

  useEffect(() => {
    form.setValue("pollingUnit", "");
  }, [selectedWard, form]);

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
    router.push("/register/survey");
  };

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground font-medium">Step 4 of 7</span>
          <span className="text-muted-foreground">57% Complete</span>
        </div>
        <Progress value={57} className="h-2" />
      </div>

      {/* Hero Section */}
      <div className="space-y-2 text-center">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          Where Do You Vote?
        </h1>
        <p className="text-muted-foreground text-lg">
          Help us find your exact polling unit location
        </p>
      </div>

      {/* Main Card */}
      <Card className="border-border bg-card">
        <CardHeader className="border-border space-y-2 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/15 flex h-10 w-10 items-center justify-center rounded-full">
              <MapPin className="text-primary h-5 w-5" />
            </div>
            <div>
              <h2 className="text-foreground text-xl font-semibold">
                Polling Unit Location
              </h2>
              <p className="text-muted-foreground text-sm">
                Select your voting location details
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* State */}
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedState(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select your state" />
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
                    <FormLabel>Local Government Area (LGA)</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedLga(value);
                      }}
                      value={field.value}
                      disabled={!selectedState}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select your LGA" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lgas.map((lga) => (
                          <SelectItem key={lga.code} value={lga.code}>
                            {lga.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {!selectedState && "Please select a state first"}
                    </FormDescription>
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
                    <FormLabel>Ward</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedWard(value);
                      }}
                      value={field.value}
                      disabled={!selectedLga}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select your ward" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wards.map((ward) => (
                          <SelectItem key={ward.code} value={ward.code}>
                            {ward.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {!selectedLga && "Please select an LGA first"}
                    </FormDescription>
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
                    <FormLabel>Polling Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedWard}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select your polling unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pollingUnits.map((unit) => (
                          <SelectItem key={unit.code} value={unit.code}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {!selectedWard && "Please select a ward first"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Help Section */}
              <div className="border-border/60 bg-muted/50 rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-foreground text-sm font-medium">
                      Not sure about your polling unit?
                    </p>
                    <p className="text-muted-foreground text-xs">
                      You can find your polling unit on your voter's card or
                      contact INEC for assistance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="border-border/60 flex items-center justify-between border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/register/profile")}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="from-primary to-primary/90 gap-2 bg-gradient-to-r"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
