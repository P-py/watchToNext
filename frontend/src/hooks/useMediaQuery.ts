"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tracks a CSS media query and re-renders when it changes.
 *
 * SSR-safe: the server snapshot is always `false`, and the client reconciles
 * with the real `matchMedia` result after hydration (via `useSyncExternalStore`),
 * so there is no hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
