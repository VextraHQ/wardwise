/**
 * Collect-form persistence hook.
 *
 * Handles:
 *   • Saving form progress to localStorage (on screen change + debounced on field change)
 *   • Restoring saved progress (form values + UI state)
 *   • Reading same-device submission metadata for lightweight reference recall
 *   • Clearing progress after submission
 *
 * Does NOT own:
 *   • Geo query logic / cascading resets
 *   • Screen validation or navigation
 *   • Submit flow
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import type { RegistrationFormData } from "@/lib/schemas/collect-schemas";

// ── Types ──
export type DeviceSubmissionData = {
  name?: string;
  count: number;
  submittedAt: string;
  refCode: string;
};

export type PendingGeoRestore = {
  wardId?: number;
  wardName?: string;
  pollingUnitId?: number;
  pollingUnitName?: string;
};

interface UseCollectFormPersistenceOptions {
  form: UseFormReturn<RegistrationFormData>;
  campaignSlug: string;
  screen: number;
  totalScreens: number;
  uiState: {
    hasCanvasser: boolean | null;
    occupationMode: "select" | "custom";
  };
  // Refs managed by the parent — the hook writes to them during restore
  skipLocationResetRef: React.RefObject<boolean>;
  pendingRestoreRef: React.RefObject<PendingGeoRestore | null>;
  // Setters the hook calls during restore to sync parent state
  setHasCanvasser: (v: boolean | null) => void;
  setOccupationMode: (v: "select" | "custom") => void;
  setScreen: (s: number) => void;
}

interface UseCollectFormPersistenceReturn {
  /** True when there's a saved form in localStorage */
  hasSavedProgress: boolean;
  /** Non-null when this device previously completed a submission for this campaign */
  deviceSubmission: DeviceSubmissionData | null;
  /** Restore saved form data + UI state from localStorage */
  restoreProgress: () => void;
  /** Save current form state to localStorage */
  saveProgress: (data: RegistrationFormData) => void;
  /** Remove saved form from localStorage */
  clearProgress: () => void;
  /** Ref — true while a restore is in progress (suppresses auto-save) */
  skipProgressSaveRef: React.RefObject<boolean>;
}

// ── Hook ──
export function useCollectFormPersistence({
  form,
  campaignSlug,
  screen,
  totalScreens,
  uiState,
  skipLocationResetRef,
  pendingRestoreRef,
  setHasCanvasser,
  setOccupationMode,
  setScreen,
}: UseCollectFormPersistenceOptions): UseCollectFormPersistenceReturn {
  const { setValue } = form;
  const allFormValues = useWatch({ control: form.control });

  const storageKey = `collect-form-${campaignSlug}`;
  const skipProgressSaveRef = useRef(false);
  const saveTimeoutRef = useRef<number | null>(null);

  // ── Save ──
  const saveProgress = useCallback(
    (data: RegistrationFormData) => {
      if (typeof window === "undefined") return;
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          screen,
          data,
          uiState,
        }),
      );
    },
    [screen, storageKey, uiState],
  );

  // Save on screen change
  useEffect(() => {
    if (typeof window === "undefined" || screen === 0) return;
    if (screen === totalScreens - 1) return;
    saveProgress(form.getValues());
  }, [form, screen, saveProgress, totalScreens]);

  // Debounced save on field change
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (screen === 0 || screen === totalScreens - 1) return;
    if (skipProgressSaveRef.current) return;

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      saveProgress(form.getValues());
    }, 150);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [allFormValues, form, saveProgress, screen, totalScreens]);

  // ── Returning visitor + saved progress detection ──
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [deviceSubmission, setDeviceSubmission] =
    useState<DeviceSubmissionData | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Same-device completed submission metadata
    const submittedKey = `collect-submitted-${campaignSlug}`;
    const submitted = localStorage.getItem(submittedKey);
    if (submitted) {
      try {
        const data = JSON.parse(submitted);
        if (data.refCode) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setDeviceSubmission(data);
        }
      } catch {
        /* ignore corrupted data */
      }
    }

    // In-progress form
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const { screen: savedScreen } = JSON.parse(saved);
        if (savedScreen > 0) {
          setHasSavedProgress(true);
        }
      } catch {
        /* ignore */
      }
    }
  }, [campaignSlug, storageKey]);

  // ── Restore ──
  const restoreProgress = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;

      const {
        screen: savedScreen,
        data,
        uiState: savedUiState,
      } = JSON.parse(saved);

      skipLocationResetRef.current = true;
      skipProgressSaveRef.current = true;

      // Defer ward/polling unit restoration (async queries haven't loaded yet)
      if (data.wardId || data.pollingUnitId) {
        pendingRestoreRef.current = {
          wardId: data.wardId,
          wardName: data.wardName,
          pollingUnitId: data.pollingUnitId,
          pollingUnitName: data.pollingUnitName,
        };
      }

      Object.entries(data).forEach(([key, value]) => {
        setValue(key as keyof RegistrationFormData, value as string | number);
      });

      setHasCanvasser(
        savedUiState?.hasCanvasser ??
          (data.canvasserName || data.canvasserPhone ? true : null),
      );
      setOccupationMode(savedUiState?.occupationMode ?? "select");
      setScreen(savedScreen);

      window.setTimeout(() => {
        skipLocationResetRef.current = false;
        skipProgressSaveRef.current = false;
      }, 0);
    } catch {
      skipLocationResetRef.current = false;
      skipProgressSaveRef.current = false;
      pendingRestoreRef.current = null;
      localStorage.removeItem(storageKey);
    }
  }, [
    storageKey,
    setValue,
    setHasCanvasser,
    setOccupationMode,
    setScreen,
    skipLocationResetRef,
    pendingRestoreRef,
  ]);

  // ── Clear ──
  const clearProgress = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    hasSavedProgress,
    deviceSubmission,
    restoreProgress,
    saveProgress,
    clearProgress,
    skipProgressSaveRef,
  };
}
