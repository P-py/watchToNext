"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiHttpError } from "@/services/api-error";

export interface AsyncListResult<T> {
  items: T[];
  loading: boolean;
  error: ApiHttpError | null;
  reload: () => void;
}

/**
 * Fetches a list once on mount (and on `reload()`), tracking loading/error
 * state. `fetcher` must be a stable reference — pass a service method
 * directly, not an inline arrow, or the effect will loop.
 */
export function useAsyncList<T>(fetcher: () => Promise<T[]>): AsyncListResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiHttpError | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Defer the setStates out of the synchronous effect body (same pattern as
    // `useSearch`) so they don't trip `react-hooks/set-state-in-effect`.
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
      fetcher()
        .then((res) => {
          if (!cancelled) setItems(res);
        })
        .catch((err) => {
          if (cancelled) return;
          setError(
            err instanceof ApiHttpError
              ? err
              : new ApiHttpError({
                  code: "UNKNOWN",
                  message: err instanceof Error ? err.message : "Unexpected error",
                  status: 0,
                }),
          );
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [fetcher, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { items, loading, error, reload };
}
