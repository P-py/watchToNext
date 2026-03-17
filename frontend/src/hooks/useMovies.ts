"use client";

import { useState, useEffect } from "react";
import { Movie } from "@/types/movie";
import { moviesService } from "@/services/movies.service";

export function usePopularMovies(page = 1) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      try {
        const res = await moviesService.getPopular(page);
        setMovies(res.content);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, [page]);

  return { movies, loading, error };
}
