import { useSyncExternalStore } from "react";

const noSubscription = () => () => {};

// False during server rendering and hydration, true once running in the
// browser. Use it to render browser-only UI without a hydration mismatch.
export function useIsClient() {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
}
