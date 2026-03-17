"use client";

import { useState, useCallback } from "react";
import { Movie } from "@/types/movie";
import { moviesService } from "@/services/movies.service";

export function useSearch() {
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setQuery(q);
    setLoading(true);
    setError(null);
    try {
      const res = await moviesService.search(q);
      setResults(res.movies);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, query, search };
}
