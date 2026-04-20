"use client";

import { useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { IconClipboardList } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  StepCard,
  CardSectionHeader,
  SectionLabel,
  FieldLabel,
  NavButtons,
} from "@/components/collect/form-ui";
import { LgaCheckboxGrid } from "@/components/admin/shared/lga-checkbox-grid";
import { useGeoLgas } from "@/hooks/use-geo";
import { positionRequiresLgas } from "@/lib/geo/constituency";
import type { CreateCampaignData } from "@/lib/schemas/collect-schemas";

type CandidateInfo = {
  id: string;
  name: string;
  party: string;
  position: string;
  constituency: string;
  stateCode: string;
  constituencyLgaIds: number[];
};

interface StepCampaignCollectConfigProps {
  form: UseFormReturn<CreateCampaignData>;
  selectedCandidate?: CandidateInfo;
  onBack: () => void;
  onNext: () => void;
}

export function StepCampaignCollectConfig({
  form,
  selectedCandidate,
  onBack,
  onNext,
}: StepCampaignCollectConfigProps) {
  const { register, watch, setValue, setError, clearErrors, trigger } = form;
  const [restrictMode, setRestrictMode] = useState(() => {
    if (
      !selectedCandidate ||
      !positionRequiresLgas(selectedCandidate.position)
    ) {
      return false;
    }
    return form.getValues("enabledLgaIds").length > 0;
  });

  const enabledLgaIds = watch("enabledLgaIds");

  const needsLgas =
    selectedCandidate && positionRequiresLgas(selectedCandidate.position);
  const { data: lgaResponse, isLoading: lgasLoading } = useGeoLgas(
    needsLgas ? selectedCandidate.stateCode : null,
    { pageSize: 200 },
  );

  const candidateLgas = useMemo(() => {
    if (!lgaResponse || !selectedCandidate) return [];
    return lgaResponse.data
      .filter((l) => selectedCandidate.constituencyLgaIds.includes(l.id))
      .map((l) => ({ id: l.id, name: l.name }));
  }, [lgaResponse, selectedCandidate]);

  function handleRestrictToggle(enabled: boolean) {
    setRestrictMode(enabled);
    if (!enabled) {
      clearErrors("enabledLgaIds");
      setValue("enabledLgaIds", [], { shouldValidate: true });
    } else {
      setValue("enabledLgaIds", selectedCandidate?.constituencyLgaIds ?? [], {
        shouldValidate: true,
      });
    }
  }

  async function handleContinue() {
    if (restrictMode && enabledLgaIds.length === 0) {
      setError("enabledLgaIds", {
        type: "manual",
        message:
          "Select at least one LGA or turn off restriction to inherit the full constituency.",
      });
      return;
    }
    clearErrors("enabledLgaIds");
    const ok = await trigger(["customQuestion1", "customQuestion2"]);
    if (!ok) return;
    onNext();
  }

  return (
    <StepCard>
      <CardSectionHeader
        title="Collect configuration"
        subtitle="Step 2"
        statusLabel="Campaign Setup"
        icon={<IconClipboardList className="size-5" />}
      />

      <div className="space-y-7">
        <div className="space-y-4">
          <SectionLabel
            title="Custom Questions"
            subtitle="Optional survey questions for supporters — room here for more or prebuilt sets later"
          />

          <div className="space-y-1.5">
            <FieldLabel optional>Custom Question 1</FieldLabel>
            <Input
              {...register("customQuestion1")}
              placeholder="e.g. What ward-level issues concern you most?"
              className="rounded-sm"
            />
          </div>

          <div className="space-y-1.5">
            <FieldLabel optional>Custom Question 2</FieldLabel>
            <Input
              {...register("customQuestion2")}
              placeholder="e.g. How did you hear about this campaign?"
              className="rounded-sm"
            />
          </div>
        </div>

        {needsLgas && candidateLgas.length > 1 && (
          <div className="space-y-4">
            <SectionLabel
              title="Advanced"
              subtitle="Optionally narrow the collection area"
            />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  Restrict to part of constituency
                </p>
                <p className="text-muted-foreground text-xs">
                  Deselect LGAs to exclude from this campaign
                </p>
              </div>
              <Switch
                checked={restrictMode}
                onCheckedChange={handleRestrictToggle}
              />
            </div>

            {restrictMode && (
              <LgaCheckboxGrid
                lgas={candidateLgas}
                selectedIds={enabledLgaIds}
                onToggle={(lgaId) => {
                  const ids = enabledLgaIds.includes(lgaId)
                    ? enabledLgaIds.filter((id) => id !== lgaId)
                    : [...enabledLgaIds, lgaId];
                  setValue("enabledLgaIds", ids, { shouldValidate: true });
                }}
                onSelectAll={() =>
                  setValue(
                    "enabledLgaIds",
                    candidateLgas.map((l) => l.id),
                    { shouldValidate: true },
                  )
                }
                onClearAll={() =>
                  setValue("enabledLgaIds", [], { shouldValidate: true })
                }
                loading={lgasLoading}
                label="Campaign LGAs"
                helperText="Select the LGAs that should remain available on this campaign"
                error={form.formState.errors.enabledLgaIds?.message}
              />
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <NavButtons
          onBack={onBack}
          onNext={handleContinue}
          nextLabel="Continue"
        />
      </div>
    </StepCard>
  );
}
