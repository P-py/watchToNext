"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

/**
 * Tracks a CSS media query and re-renders when it changes.
 *
 * SSR-safe: the server snapshot is always `false`, and the client reconciles
 * with the real `matchMedia` result after hydration (via `useSyncExternalStore`),
 * so there is no hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  // Cache a single MediaQueryList per query so `subscribe` and `getSnapshot`
  // read from the same object. Keyed on the query string we passed (not
  // `mql.media`, which the browser may normalize and would force re-creation).
  const cache = useRef<{ query: string; mql: MediaQueryList } | null>(null);

  const getMql = useCallback(() => {
    if (cache.current?.query !== query) {
      cache.current = { query, mql: window.matchMedia(query) };
    }
    return cache.current.mql;
  }, [query]);

  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = getMql();
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [getMql],
  );

  const getSnapshot = useCallback(() => getMql().matches, [getMql]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
