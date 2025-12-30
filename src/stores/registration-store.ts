"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type RegistrationPayload } from "@/lib/schemas/registration-schemas";
import type { RegistrationStep } from "@/types/voter";
import { orderedSteps } from "@/lib/helpers/registration-helpers";

type RegistrationState = {
  step: RegistrationStep;
  payload: Partial<RegistrationPayload> & { electionYear?: number };
  isSwitching: boolean;
  maxStepIndex: number;
  hasHydrated: boolean; // Track if store has hydrated from localStorage
  setStep: (s: RegistrationStep) => void;
  update: (p: Partial<RegistrationPayload>) => void;
  setSwitching: (v: boolean) => void;
  advance: () => void;
  back: () => void;
  goToStep: (s: RegistrationStep) => void;
  reset: () => void;
  setHasHydrated: (value: boolean) => void;
};

/**
 * Registration store for voter registration wizard.
 * Manages multi-step registration flow state with persistence.
 *
 * Progress is automatically saved to localStorage via zustand's persist middleware.
 * In production, this would be synced with the backend API after each step completion.
 *
 * @example
 * ```tsx
 * const { step, payload, update, advance } = useRegistrationStore();
 * ```
 */
export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set, get) => ({
      step: "nin",
      payload: { electionYear: new Date().getFullYear() },
      isSwitching: false,
      maxStepIndex: 0,
      hasHydrated: false, // Initially false until localStorage loads
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
          step: "nin",
          payload: { electionYear: new Date().getFullYear() },
          isSwitching: false,
          maxStepIndex: 0,
        }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "wardwise-registration",
      // Mark as hydrated after rehydration completes
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    },
  ),
);
