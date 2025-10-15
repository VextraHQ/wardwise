"use client";

import { useState } from "react";
import { useRegistration } from "@/hooks/use-registration";
import { surveySchema } from "@/lib/registration-schemas";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const options = [
  "Jobs & Economy",
  "Security",
  "Education",
  "Healthcare",
  "Infrastructure",
];

export function SurveyStep() {
  const { setStep, update, advance, back } = useRegistration();
  const [selected, setSelected] = useState<string[]>([]);
  const [comments, setComments] = useState("");

  const parsed = surveySchema.safeParse({ priorities: selected, comments });

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!parsed.success) return;
        update({ survey: parsed.data });
        advance();
      }}
    >
      <div className="space-y-2">
        <Label>What issues matter most to you? (choose at least one)</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((o) => {
            const checked = selected.includes(o);
            return (
              <label
                key={o}
                className="flex cursor-pointer items-center gap-2 rounded-md border p-3"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) => {
                    const isOn = Boolean(v);
                    setSelected((prev) =>
                      isOn ? [...prev, o] : prev.filter((x) => x !== o),
                    );
                  }}
                />
                <span>{o}</span>
              </label>
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="comments">Anything else? (optional)</Label>
        <Input
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Your message"
        />
      </div>
      <div className="flex justify-end gap-2">
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
