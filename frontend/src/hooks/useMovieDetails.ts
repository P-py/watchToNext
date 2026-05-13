"use client";

import { useState, useEffect } from "react";
import { MovieSummary, SimilarMovie } from "@/types/movie";
import { moviesService } from "@/services/movies.service";
import { recommendationsService } from "@/services/recommendations.service";

export function useMovieDetails(id: number) {
  const [movie, setMovie] = useState<MovieSummary | null>(null);
  const [similar, setSimilar] = useState<SimilarMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const [movieData, similarData] = await Promise.all([
          moviesService.getById(id),
          recommendationsService.getSimilarTo(id).catch(() => [] as SimilarMovie[]),
        ]);
        if (cancelled) return;
        setMovie(movieData);
        setSimilar(similarData);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { movie, similar, loading, error };
}
