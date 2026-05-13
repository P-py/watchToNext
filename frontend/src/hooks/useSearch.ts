"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MovieSummary } from "@/types/movie";
import { moviesService } from "@/services/movies.service";
import { ApiHttpError } from "@/services/api-error";

interface UseSearchResult {
  results: MovieSummary[];
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: ApiHttpError | null;
  query: string;
  search: (q: string, page?: number) => void;
}

interface SearchState {
  results: MovieSummary[];
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: ApiHttpError | null;
  query: string;
}

const INITIAL_STATE: SearchState = {
  results: [],
  totalPages: 1,
  currentPage: 1,
  loading: false,
  error: null,
  query: "",
};

export function useSearch(
  initialQuery = "",
  initialPage = 1,
  size = 20,
): UseSearchResult {
  const [state, setState] = useState<SearchState>(INITIAL_STATE);

  // Always abort the previous in-flight request before issuing a new one, so
  // a fast-typing user never sees stale results land on top of fresh ones.
  const inFlight = useRef<AbortController | null>(null);

  const run = useCallback(
    (rawQ: string, page: number) => {
      const q = rawQ.trim();
      inFlight.current?.abort();

      if (!q) {
        inFlight.current = null;
        setState(INITIAL_STATE);
        return;
      }

      const controller = new AbortController();
      inFlight.current = controller;
      setState((prev) => ({ ...prev, loading: true, error: null, query: q }));

      moviesService
        .search(q, page, size)
        .then((res) => {
          if (controller.signal.aborted) return;
          setState({
            results: res.content,
            totalPages: res.totalPages,
            currentPage: res.currentPage,
            loading: false,
            error: null,
            query: q,
          });
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          const wrapped =
            err instanceof ApiHttpError
              ? err
              : new ApiHttpError({
                  code: "UNKNOWN",
                  message: err instanceof Error ? err.message : "Unexpected error",
                  status: 0,
                });
          setState((prev) => ({ ...prev, loading: false, error: wrapped }));
        });
    },
    [size],
  );

  // Search is event-shaped: the caller (URL change, submit) decides when to fire it.
  // Wrapping in useCallback keeps the identity stable for child memoization.
  const search = useCallback(
    (q: string, page = 1) => {
      run(q, page);
    },
    [run],
  );

  // Seed from URL on mount and re-run when the URL changes. The setStates inside
  // `run` are scheduled via a microtask so the effect body itself stays free of
  // synchronous setState (which `react-hooks/set-state-in-effect` forbids).
  useEffect(() => {
    queueMicrotask(() => run(initialQuery, initialPage));
    return () => inFlight.current?.abort();
  }, [initialQuery, initialPage, run]);

  return { ...state, search };
}
