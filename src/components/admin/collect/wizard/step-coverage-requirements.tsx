"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  StepCard,
  CardSectionHeader,
  SectionLabel,
  FieldLabel,
  FieldError,
  NavButtons,
} from "@/components/collect/form-ui";
import { IconMapPin, IconSearch } from "@tabler/icons-react";
import type { CreateCampaignData } from "@/lib/schemas/collect-schemas";

type Lga = { id: number; name: string };

interface StepCoverageRequirementsProps {
  form: UseFormReturn<CreateCampaignData>;
  lgas: Lga[] | undefined;
  lgasLoading: boolean;
  candidateState?: string;
  onBack: () => void;
  onNext: () => void;
}

export function StepCoverageRequirements({
  form,
  lgas,
  lgasLoading,
  candidateState,
  onBack,
  onNext,
}: StepCoverageRequirementsProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;

  const enabledLgaIds = watch("enabledLgaIds");
  const [search, setSearch] = useState("");

  const filteredLgas = lgas?.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()),
  );

  function toggleLga(lgaId: number) {
    const ids = enabledLgaIds.includes(lgaId)
      ? enabledLgaIds.filter((id: number) => id !== lgaId)
      : [...enabledLgaIds, lgaId];
    setValue("enabledLgaIds", ids, { shouldValidate: true });
  }

  function selectAll() {
    if (!lgas) return;
    setValue(
      "enabledLgaIds",
      lgas.map((l) => l.id),
      { shouldValidate: true },
    );
  }

  function clearAll() {
    setValue("enabledLgaIds", [], { shouldValidate: true });
  }

  return (
    <StepCard>
      <CardSectionHeader
        title="LGA Coverage"
        subtitle="Step 2"
        statusLabel="Campaign Setup"
        icon={<IconMapPin className="size-5" />}
      />

      <div className="space-y-4">
        <SectionLabel
          title="LGA Coverage"
          subtitle="Select the LGAs this campaign covers"
        />

        <div className="space-y-1.5">
          <FieldLabel>Enabled LGAs *</FieldLabel>

          {!candidateState ? (
            <div className="text-muted-foreground rounded-sm border border-dashed p-6 text-center text-sm">
              Select a candidate to see available LGAs
            </div>
          ) : lgasLoading ? (
            <div className="text-muted-foreground rounded-sm border border-dashed p-6 text-center text-sm">
              Loading LGAs...
            </div>
          ) : (
            <>
              <p className="text-muted-foreground text-xs">
                {candidateState} — {lgas?.length ?? 0} LGAs
              </p>

              <div className="relative">
                <IconSearch className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search LGAs..."
                  className="rounded-sm pl-9 text-sm"
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs">
                  <span className="font-mono tabular-nums">
                    {enabledLgaIds.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-mono tabular-nums">
                    {lgas?.length ?? 0}
                  </span>{" "}
                  selected
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 rounded-sm font-mono text-[11px] tracking-widest uppercase"
                    onClick={selectAll}
                  >
                    Select all
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 rounded-sm font-mono text-[11px] tracking-widest uppercase"
                    onClick={clearAll}
                    disabled={enabledLgaIds.length === 0}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <div className="grid max-h-72 grid-cols-2 gap-x-4 gap-y-1.5 overflow-y-auto rounded-sm border p-3 sm:grid-cols-3">
                {filteredLgas?.map((lga) => (
                  <label
                    key={lga.id}
                    className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm transition-colors"
                  >
                    <Checkbox
                      checked={enabledLgaIds.includes(lga.id)}
                      onCheckedChange={() => toggleLga(lga.id)}
                    />
                    <span className="truncate">{lga.name}</span>
                  </label>
                ))}
                {filteredLgas?.length === 0 && (
                  <p className="text-muted-foreground col-span-full py-4 text-center text-xs">
                    No LGAs match &ldquo;{search}&rdquo;
                  </p>
                )}
              </div>
            </>
          )}
          <FieldError error={errors.enabledLgaIds?.message} />
        </div>
      </div>

      <div className="mt-8">
        <NavButtons onBack={onBack} onNext={onNext} />
      </div>
    </StepCard>
  );
}
