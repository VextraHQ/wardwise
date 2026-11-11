import { useMemo } from "react";

// Returns the same array instance until its contents change, so it is safe to
// use in effect dependencies even when the source creates a new array on every
// render (e.g. react-hook-form's useWatch).
export function useStableArray<T>(value: readonly T[] | null | undefined): T[] {
  const key = JSON.stringify(value ?? []);

  return useMemo(() => JSON.parse(key) as T[], [key]);
}
