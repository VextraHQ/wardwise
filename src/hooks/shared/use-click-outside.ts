import { useEffect } from "react";

type MaybeRef<T> = { current: T | null };

// Fires a callback when the user clicks or touches outside of a target element.
// Supports an `ignoreRefs` list for elements that should be treated as "inside".
export function useClickOutside<T extends HTMLElement>(
  targetRef: MaybeRef<T>,
  onOutsideClick: () => void,
  options?: {
    /** Only listen when true */
    active?: boolean;
    /** Elements to ignore when clicked (treated as inside) */
    ignoreRefs?: Array<MaybeRef<HTMLElement>>;
  },
) {
  const active = options?.active ?? true;

  useEffect(() => {
    if (!active) return;

    function handleEvent(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      const element = targetRef.current;
      if (!element || !target) return;

      // If click is inside the target element, ignore
      if (element.contains(target)) return;

      // If click is inside any ignored element, ignore
      const normalizedIgnoreRefs = options?.ignoreRefs ?? [];
      for (const ref of normalizedIgnoreRefs) {
        const ignoreEl = ref.current;
        if (ignoreEl && ignoreEl.contains(target)) return;
      }

      onOutsideClick();
    }

    document.addEventListener("mousedown", handleEvent, true);
    document.addEventListener("touchstart", handleEvent, true);
    return () => {
      document.removeEventListener("mousedown", handleEvent, true);
      document.removeEventListener("touchstart", handleEvent, true);
    };
  }, [active, onOutsideClick, targetRef, options?.ignoreRefs]);
}
