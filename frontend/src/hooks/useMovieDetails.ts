"use client";

import { useState, useEffect } from "react";
import { MovieDetails } from "@/types/movie";
import { moviesService } from "@/services/movies.service";

export function useMovieDetails(id: number) {
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovie() {
      setLoading(true);
      try {
        const data = await moviesService.getById(id);
        setMovie(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchMovie();
  }, [id]);

  return { movie, loading, error };
}
