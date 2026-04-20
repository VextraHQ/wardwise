import * as React from "react";

const MOBILE_BREAKPOINT = 768;

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useLayoutEffect(() => {
    const mql = window.matchMedia(query);
    const apply = () => setMatches(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [query]);

  return matches;
}

// Returns true when viewport matches `(max-width: 767px)`.
// Starts false for SSR/hydration match, then `useLayoutEffect` syncs before
// first paint so sheet `side` does not flash wrong on mobile.
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}

// Use for portrait-only mobile interactions such as bottom sheets.
export function useIsPortraitMobile() {
  return useMediaQuery(
    `(max-width: ${MOBILE_BREAKPOINT - 1}px) and (orientation: portrait)`,
  );
}
