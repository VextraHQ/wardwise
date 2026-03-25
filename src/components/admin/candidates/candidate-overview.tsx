"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import type { CandidateWithUser } from "@/lib/api/admin";
import { adminApi } from "@/lib/api/admin";
import {
  updateCandidateSchema,
  type UpdateCandidateFormValues,
} from "@/lib/schemas/admin-schemas";
import { nigeriaStates } from "@/lib/data/state-lga-locations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ComboboxSelect } from "@/components/ui/combobox-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGeoLgas } from "@/hooks/use-geo";
import {
  NIGERIAN_PARTIES,
  CANDIDATE_TITLES,
} from "@/lib/data/nigerian-parties";
import {
  IconEdit,
  IconX,
  IconDeviceFloppy,
  IconUsers,
  IconBuildingCommunity,
  IconClipboardList,
} from "@tabler/icons-react";
import { useMemo } from "react";

function resolveStateName(stateCode: string | null): string {
  if (!stateCode) return "—";
  return nigeriaStates.find((s) => s.code === stateCode)?.name ?? stateCode;
}

const POSITIONS = [
  "President",
  "Governor",
  "Senator",
  "House of Representatives",
  "State Assembly",
] as const;

const CONSTITUENCY_POSITIONS = [
  "Senator",
  "House of Representatives",
  "State Assembly",
];

interface CandidateOverviewProps {
  candidate: CandidateWithUser;
}

export function CandidateOverview({ candidate }: CandidateOverviewProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const form = useForm<UpdateCandidateFormValues>({
    resolver: zodResolver(updateCandidateSchema),
    defaultValues: {
      id: candidate.id,
      name: candidate.name,
      email: candidate.user?.email ?? "",
      party: candidate.party,
      position: candidate.position,
      constituency: candidate.constituency ?? "",
      stateCode: candidate.stateCode ?? "",
      lga: candidate.lga ?? "",
      description: candidate.description ?? "",
      phone: candidate.phone ?? "",
      title: candidate.title ?? "",
    },
  });

  const selectedPosition = useWatch({
    control: form.control,
    name: "position",
  });
  const selectedStateCode = useWatch({
    control: form.control,
    name: "stateCode",
  });
  const showStateField = !!selectedPosition;
  const showLgaField =
    selectedPosition && CONSTITUENCY_POSITIONS.includes(selectedPosition);

  const { data: lgaResponse, isLoading: lgasLoading } = useGeoLgas(
    editing && showLgaField && selectedStateCode ? selectedStateCode : null,
    { pageSize: 200 },
  );

  const lgaOptions = useMemo(
    () =>
      lgaResponse?.data.map((l) => ({ value: l.name, label: l.name })) ?? [],
    [lgaResponse],
  );

  const stateGroups = useMemo(() => {
    const zones = [
      "North Central",
      "North East",
      "North West",
      "South East",
      "South South",
      "South West",
    ] as const;
    return zones.map((zone) => ({
      heading: zone,
      options: nigeriaStates
        .filter((s) => s.zone === zone)
        .map((s) => ({ value: s.code, label: s.name, description: s.code })),
    }));
  }, []);

  const updateMutation = useMutation({
    mutationFn: adminApi.candidates.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "candidates", candidate.id],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "candidates"] });
      setEditing(false);
      toast.success("Candidate updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update candidate");
    },
  });

  function onSubmit(data: UpdateCandidateFormValues) {
    updateMutation.mutate({
      id: candidate.id,
      name: data.name,
      email: data.email,
      party: data.party,
      position: data.position as (typeof POSITIONS)[number],
      constituency: data.constituency,
      stateCode: data.stateCode || undefined,
      lga: data.lga || undefined,
      description: data.description || undefined,
      phone: data.phone || undefined,
      title: data.title || undefined,
    });
  }

  // Stats
  const campaignCount =
    (candidate as CandidateWithUser & { _count?: { campaigns?: number } })
      ._count?.campaigns ?? 0;
  const canvasserCount =
    (candidate as CandidateWithUser & { _count?: { canvassers?: number } })
      ._count?.canvassers ?? 0;
  const supporterCount = candidate.supporterCount ?? 0;

  const stats = [
    {
      label: "Campaigns",
      value: campaignCount,
      subtitle: "Collect campaigns",
      icon: IconClipboardList,
    },
    {
      label: "Supporters",
      value: supporterCount,
      subtitle: "From submissions",
      icon: IconUsers,
    },
    {
      label: "Canvassers",
      value: canvasserCount,
      subtitle: "Field agents",
      icon: IconBuildingCommunity,
    },
  ];

  return (
    <div className="space-y-6 pt-4">
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-border/60 rounded-sm shadow-none"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                {stat.label}
              </CardTitle>
              <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-sm">
                <stat.icon className="text-primary h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="font-mono text-2xl font-semibold tabular-nums">
                {stat.value}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info / Edit card */}
      <Card className="border-border/60 rounded-sm shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground font-mono text-[11px] font-bold tracking-widest uppercase">
            Candidate Information
          </CardTitle>
          {!editing && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase"
              onClick={() => setEditing(true)}
            >
              <IconEdit className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editing ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Identity */}
                <div className="space-y-4">
                  <p className="text-foreground/70 font-mono text-[9px] font-bold tracking-widest uppercase">
                    Identity
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                            Title
                          </FormLabel>
                          <ComboboxSelect
                            options={CANDIDATE_TITLES}
                            value={field.value || ""}
                            onValueChange={(val) => field.onChange(val)}
                            placeholder="Select title..."
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="border-border/60 rounded-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="party"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                            Party
                          </FormLabel>
                          <ComboboxSelect
                            options={NIGERIAN_PARTIES}
                            value={field.value || ""}
                            onValueChange={(val) => field.onChange(val)}
                            placeholder="Select party..."
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                            Position
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="border-border/60 rounded-sm">
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {POSITIONS.map((pos) => (
                                <SelectItem key={pos} value={pos}>
                                  {pos}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border-border/40 border-b" />

                {/* Location */}
                <div className="space-y-4">
                  <p className="text-foreground/70 font-mono text-[9px] font-bold tracking-widest uppercase">
                    Location
                  </p>
                  {showStateField && (
                    <FormField
                      control={form.control}
                      name="stateCode"
                      render={() => (
                        <FormItem>
                          <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                            State
                          </FormLabel>
                          <ComboboxSelect
                            groups={stateGroups}
                            value={selectedStateCode || ""}
                            onValueChange={(val) => {
                              form.setValue("stateCode", val, {
                                shouldValidate: true,
                              });
                              form.setValue("lga", "");
                            }}
                            placeholder="Select state..."
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {showLgaField && selectedStateCode && (
                    <FormField
                      control={form.control}
                      name="lga"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                            LGA
                          </FormLabel>
                          <ComboboxSelect
                            options={lgaOptions}
                            value={field.value || ""}
                            onValueChange={(val) => field.onChange(val)}
                            placeholder="Select LGA..."
                            isLoading={lgasLoading}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="constituency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                          Constituency
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="border-border/60 rounded-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-border/40 border-b" />

                {/* Contact & Bio */}
                <div className="space-y-4">
                  <p className="text-foreground/70 font-mono text-[9px] font-bold tracking-widest uppercase">
                    Contact & Bio
                  </p>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                          Phone
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="08012345678"
                            className="border-border/60 rounded-sm"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] font-bold tracking-widest uppercase">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            className="border-border/60 rounded-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={updateMutation.isPending}
                    className="h-8 rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase"
                  >
                    <IconDeviceFloppy className="mr-1.5 h-3.5 w-3.5" />
                    {updateMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-sm px-3 font-mono text-[10px] font-bold tracking-widest uppercase"
                    onClick={() => {
                      form.reset();
                      setEditing(false);
                    }}
                  >
                    <IconX className="mr-1.5 h-3.5 w-3.5" />
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-5">
              {/* Identity */}
              <div>
                <p className="text-foreground/70 mb-3 font-mono text-[9px] font-bold tracking-widest uppercase">
                  Identity
                </p>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <InfoRow label="Title" value={candidate.title || "—"} />
                  <InfoRow label="Name" value={candidate.name} />
                  <InfoRow label="Party" value={candidate.party} />
                  <InfoRow label="Position" value={candidate.position} />
                </div>
              </div>

              <div className="border-border/40 border-b" />

              {/* Location */}
              <div>
                <p className="text-foreground/70 mb-3 font-mono text-[9px] font-bold tracking-widest uppercase">
                  Location
                </p>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <InfoRow
                    label="State"
                    value={resolveStateName(candidate.stateCode)}
                  />
                  <InfoRow label="LGA" value={candidate.lga || "—"} />
                  <InfoRow
                    label="Constituency"
                    value={candidate.constituency || "—"}
                  />
                </div>
              </div>

              <div className="border-border/40 border-b" />

              {/* Contact */}
              <div>
                <p className="text-foreground/70 mb-3 font-mono text-[9px] font-bold tracking-widest uppercase">
                  Contact
                </p>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <InfoRow label="Phone" value={candidate.phone || "—"} />
                </div>
              </div>

              {candidate.description && (
                <>
                  <div className="border-border/40 border-b" />
                  <div>
                    <p className="text-foreground/70 mb-3 font-mono text-[9px] font-bold tracking-widest uppercase">
                      Bio
                    </p>
                    <InfoRow
                      label="Description"
                      value={candidate.description}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
        {label}
      </p>
      <p className="text-foreground text-sm font-medium">{value}</p>
    </div>
  );
}
