"use client";

import { useState, useEffect } from "react";
import { MovieSort, MovieSummary } from "@/types/movie";
import { moviesService } from "@/services/movies.service";
import { ApiHttpError } from "@/services/api-error";

interface UsePopularMoviesResult {
  movies: MovieSummary[];
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: ApiHttpError | null;
}

export function usePopularMovies(
  page = 1,
  size = 20,
  sort: MovieSort = "RELEVANCE",
): UsePopularMoviesResult {
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiHttpError | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchMovies() {
      setLoading(true);
      setError(null);
      try {
        const res = await moviesService.getPopular(page, size, sort);
        if (controller.signal.aborted) return;
        setMovies(res.content);
        setTotalPages(res.totalPages);
        setCurrentPage(res.currentPage);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof ApiHttpError
            ? err
            : new ApiHttpError({
                code: "UNKNOWN",
                message: err instanceof Error ? err.message : "Unexpected error",
                status: 0,
              }),
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    fetchMovies();
    return () => controller.abort();
  }, [page, size, sort]);

  return { movies, totalPages, currentPage, loading, error };
}
