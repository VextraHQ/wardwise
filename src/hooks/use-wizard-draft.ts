"use client";

import { useEffect, useRef, useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const DEFAULT_DEBOUNCE_MS = 400;

interface DraftSnapshot<TValues> {
  values: TValues;
  step: number;
  savedAt: number;
}

export interface UseWizardDraftOptions<TValues extends FieldValues> {
  /** RHF form instance whose values should be persisted. */
  form: UseFormReturn<TValues>;
  /** Current step index — persisted so we can resume on the right screen. */
  step: number;
  /** localStorage key — should include a version suffix for forward-compat. */
  storageKey: string;
  /** Default values used when discarding the draft. */
  defaultValues: TValues;
  /**
   * Predicate that decides whether the current values are worth persisting.
   * If it returns false, any existing draft is cleared and nothing is saved.
   * Use this to avoid restoring an empty/skeleton draft on next visit.
   */
  isMeaningful: (values: TValues) => boolean;
  /** Soft expiry — drafts older than this are silently dropped. Defaults to 24h. */
  ttlMs?: number;
  /** Debounce window for write-through saves. Defaults to 400ms. */
  debounceMs?: number;
  /** Highest valid step index — used to clamp the restored step. */
  maxStep: number;
  /** Called when a draft is restored on mount. */
  onRestored?: (savedAt: number, step: number) => void;
}

export interface UseWizardDraftResult {
  /** Timestamp of the restored draft, or null if no draft was restored. */
  restoredAt: number | null;
  /** Wipes the draft from storage and resets the form to default values. */
  discard: () => void;
  /** Wipes the draft from storage only — leaves the form values untouched. */
  clear: () => void;
}

/**
 * Generic localStorage-backed draft persistence for wizard-style forms.
 *
 * - Restores once on mount (only if the stored draft is meaningful and fresh)
 * - Debounces writes on every form value change
 * - Clears the draft automatically when values stop being meaningful
 *
 * Designed to be agnostic of the form schema, so the same hook can power any
 * admin multi-step RHF flow (today: create candidate with
 * `wardwise:create-candidate:draft:v1`; tomorrow: e.g. campaign wizard) without
 * renaming. A candidate-specific name would mislead once a second consumer
 * exists — keep domain in `storageKey` + `isMeaningful`, not in the hook name.
 *
 * Keep the consumer responsible for `defaultValues`, the meaningful-draft
 * predicate, and the step state — this hook only owns persistence.
 */
export function useWizardDraft<TValues extends FieldValues>({
  form,
  step,
  storageKey,
  defaultValues,
  isMeaningful,
  ttlMs = DEFAULT_TTL_MS,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  maxStep,
  onRestored,
}: UseWizardDraftOptions<TValues>): UseWizardDraftResult {
  const [restoredAt, setRestoredAt] = useState<number | null>(null);
  const hasRestoredRef = useRef(false);
  const isMeaningfulRef = useRef(isMeaningful);
  const onRestoredRef = useRef(onRestored);

  // Keep latest callbacks accessible without retriggering the watch effect.
  useEffect(() => {
    isMeaningfulRef.current = isMeaningful;
  }, [isMeaningful]);
  useEffect(() => {
    onRestoredRef.current = onRestored;
  }, [onRestored]);

  // Restore on first mount.
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;
    if (typeof window === "undefined") return;
    const draft = readDraft<TValues>(storageKey, ttlMs);
    if (!draft) return;
    if (!isMeaningfulRef.current(draft.values)) return;
    form.reset(draft.values);
    const safeStep = Math.min(Math.max(draft.step, 0), maxStep);
    setRestoredAt(draft.savedAt);
    onRestoredRef.current?.(draft.savedAt, safeStep);
    // We intentionally only restore once and don't want to re-run on form/step
    // identity changes — those are stable for the lifetime of the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist (debounced) on every value change.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const subscription = form.watch((values) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const typed = values as TValues;
        if (!isMeaningfulRef.current(typed)) {
          clearDraft(storageKey);
          return;
        }
        try {
          window.localStorage.setItem(
            storageKey,
            JSON.stringify({
              values: typed,
              step,
              savedAt: Date.now(),
            } satisfies DraftSnapshot<TValues>),
          );
        } catch {
          // ignore quota / private-mode errors
        }
      }, debounceMs);
    });
    return () => {
      if (timer) clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [form, step, storageKey, debounceMs]);

  function discard() {
    clearDraft(storageKey);
    form.reset(defaultValues);
    setRestoredAt(null);
  }

  function clear() {
    clearDraft(storageKey);
    setRestoredAt(null);
  }

  return { restoredAt, discard, clear };
}

function readDraft<TValues>(
  storageKey: string,
  ttlMs: number,
): DraftSnapshot<TValues> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftSnapshot<TValues>;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.savedAt !== "number"
    ) {
      return null;
    }
    if (Date.now() - parsed.savedAt > ttlMs) {
      window.localStorage.removeItem(storageKey);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function clearDraft(storageKey: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // noop
  }
}
