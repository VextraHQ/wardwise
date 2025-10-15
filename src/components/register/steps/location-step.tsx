"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRegistration } from "@/hooks/use-registration";
import { locationSchema } from "@/lib/registration-schemas";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LocationStep() {
  const { setStep, update, advance, back } = useRegistration();
  const [stateCode, setStateCode] = useState<string>("");
  const [lgaCode, setLgaCode] = useState<string>("");
  const [wardCode, setWardCode] = useState<string>("");
  const [puCode, setPuCode] = useState<string>("");

  const statesQ = useQuery({
    queryKey: ["loc", "state"],
    queryFn: async () =>
      (await fetch(`/api/register/locations?level=state`)).json(),
  });
  const lgaQ = useQuery({
    enabled: !!stateCode,
    queryKey: ["loc", "lga", stateCode],
    queryFn: async () =>
      (
        await fetch(`/api/register/locations?level=lga&parent=${stateCode}`)
      ).json(),
  });
  const wardQ = useQuery({
    enabled: !!lgaCode,
    queryKey: ["loc", "ward", lgaCode],
    queryFn: async () =>
      (
        await fetch(`/api/register/locations?level=ward&parent=${lgaCode}`)
      ).json(),
  });
  const puQ = useQuery({
    enabled: !!wardCode,
    queryKey: ["loc", "pu", wardCode],
    queryFn: async () =>
      (
        await fetch(`/api/register/locations?level=pu&parent=${wardCode}`)
      ).json(),
  });

  const parsed = locationSchema.safeParse({
    state: stateCode,
    lga: lgaCode,
    ward: wardCode,
    pollingUnit: puCode,
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!parsed.success) return;
        update({ location: parsed.data });
        advance();
      }}
    >
      <Select
        value={stateCode}
        onValueChange={(v) => {
          setStateCode(v);
          setLgaCode("");
          setWardCode("");
          setPuCode("");
        }}
      >
        <SelectTrigger aria-label="State">
          <SelectValue placeholder="Select State" />
        </SelectTrigger>
        <SelectContent>
          {(statesQ.data?.items ?? []).map((s: any) => (
            <SelectItem key={s.code} value={s.code}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={lgaCode}
        onValueChange={(v) => {
          setLgaCode(v);
          setWardCode("");
          setPuCode("");
        }}
        disabled={!stateCode}
      >
        <SelectTrigger aria-label="LGA">
          <SelectValue placeholder="Select LGA" />
        </SelectTrigger>
        <SelectContent>
          {(lgaQ.data?.items ?? []).map((s: any) => (
            <SelectItem key={s.code} value={s.code}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={wardCode}
        onValueChange={(v) => {
          setWardCode(v);
          setPuCode("");
        }}
        disabled={!lgaCode}
      >
        <SelectTrigger aria-label="Ward">
          <SelectValue placeholder="Select Ward" />
        </SelectTrigger>
        <SelectContent>
          {(wardQ.data?.items ?? []).map((s: any) => (
            <SelectItem key={s.code} value={s.code}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={puCode} onValueChange={setPuCode} disabled={!wardCode}>
        <SelectTrigger aria-label="Polling Unit">
          <SelectValue placeholder="Select Polling Unit" />
        </SelectTrigger>
        <SelectContent>
          {(puQ.data?.items ?? []).map((s: any) => (
            <SelectItem key={s.code} value={s.code}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={back}>
          Back
        </Button>
        <Button type="submit" disabled={!parsed.success}>
          Continue
        </Button>
      </div>
    </form>
  );
}
