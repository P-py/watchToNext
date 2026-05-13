"use client";

import { useEffect, useState } from "react";

/**
 * Anti-flicker helper: returns `true` only after `active` has stayed `true`
 * for `delayMs` continuously. Falls back to `false` immediately when `active`
 * flips off. Lets cached/fast responses skip the skeleton entirely.
 */
export function useDelayedFlag(active: boolean, delayMs = 150): boolean {
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    if (!active) {
      queueMicrotask(() => setDelayed(false));
      return;
    }
    const id = setTimeout(() => setDelayed(true), delayMs);
    return () => clearTimeout(id);
  }, [active, delayMs]);

  return delayed;
}
