"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RegistrationPayload } from "@/lib/registration-schemas";

export type WizardStep =
  | "otp"
  | "duplicate"
  | "basic"
  | "location"
  | "candidate"
  | "survey"
  | "confirm";

export const orderedSteps: WizardStep[] = [
  "otp",
  "duplicate",
  "basic",
  "location",
  "candidate",
  "survey",
  "confirm",
];

type RegistrationState = {
  step: WizardStep;
  payload: Partial<RegistrationPayload> & { electionYear?: number };
  isSwitching: boolean;
  maxStepIndex: number;
  setStep: (s: WizardStep) => void;
  update: (p: Partial<RegistrationPayload>) => void;
  setSwitching: (v: boolean) => void;
  advance: () => void;
  back: () => void;
  goToStep: (s: WizardStep) => void;
  reset: () => void;
};

export const useRegistration = create<RegistrationState>()(
  persist(
    (set, get) => ({
      step: "otp",
      payload: { electionYear: new Date().getFullYear() },
      isSwitching: false,
      maxStepIndex: 0,
      setStep: (s) => set({ step: s }),
      update: (p) => set((state) => ({ payload: { ...state.payload, ...p } })),
      setSwitching: (v) => set({ isSwitching: v }),
      advance: () => {
        const currentIndex = orderedSteps.indexOf(get().step);
        const nextIndex = Math.min(currentIndex + 1, orderedSteps.length - 1);
        const nextStep = orderedSteps[nextIndex];
        set({
          step: nextStep,
          maxStepIndex: Math.max(get().maxStepIndex, nextIndex),
        });
      },
      back: () => {
        const currentIndex = orderedSteps.indexOf(get().step);
        const prevIndex = Math.max(currentIndex - 1, 0);
        set({ step: orderedSteps[prevIndex] });
      },
      goToStep: (s) => {
        const idx = orderedSteps.indexOf(s);
        if (idx <= get().maxStepIndex) {
          set({ step: s });
        }
      },
      reset: () =>
        set({
          step: "otp",
          payload: { electionYear: new Date().getFullYear() },
          isSwitching: false,
          maxStepIndex: 0,
        }),
    }),
    { name: "wardwise-registration" },
  ),
);
