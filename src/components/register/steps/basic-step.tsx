"use client";

import { useState } from "react";
import { z } from "zod";
import { basicInfoSchema } from "@/lib/registration-schemas";
import { useRegistration } from "@/hooks/use-registration";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function BasicStep() {
  const { setStep, update, advance, back } = useRegistration();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [age, setAge] = useState<string>("");

  const parsed = basicInfoSchema.safeParse({
    firstName,
    lastName,
    gender: gender as any,
    age: age ? Number(age) : (undefined as unknown as number),
  });
  const valid = parsed.success;

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        update({ basic: parsed.data });
        advance();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={back}>
          Back
        </Button>
        <Button type="submit" disabled={!valid}>
          Continue
        </Button>
      </div>
    </form>
  );
}
