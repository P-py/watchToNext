"use client";

import { useEffect, useState } from "react";
import { MovieSuggestion } from "@/types/movie";
import { moviesService } from "@/services/movies.service";

const DEBOUNCE_MS = 200;
const MIN_CHARS = 2;

/**
 * Debounced autocomplete suggestions for a live query string. Fires at most one
 * request per typing pause and discards results from a superseded query.
 */
export function useSuggestions(query: string): MovieSuggestion[] {
  const [suggestions, setSuggestions] = useState<MovieSuggestion[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_CHARS) {
      queueMicrotask(() => setSuggestions([]));
      return;
    }

    // `active` guards against a slow response landing after the query moved on.
    let active = true;
    const timer = setTimeout(() => {
      moviesService
        .suggest(q)
        .then((res) => {
          if (active) setSuggestions(res);
        })
        .catch(() => {
          if (active) setSuggestions([]);
        });
    }, DEBOUNCE_MS);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  return suggestions;
}
