"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MovieSummary, SimilarMovie } from "@/types/movie";
import { moviesService } from "@/services/movies.service";
import { recommendationsService } from "@/services/recommendations.service";
import { ApiHttpError } from "@/services/api-error";
import { resolveApiError } from "@/utils/error-messages";

interface UseMovieDetailsResult {
  movie: MovieSummary | null;
  similar: SimilarMovie[];
  loading: boolean;
  error: ApiHttpError | null;
}

export function useMovieDetails(id: number): UseMovieDetailsResult {
  const [movie, setMovie] = useState<MovieSummary | null>(null);
  const [similar, setSimilar] = useState<SimilarMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiHttpError | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const movieData = await moviesService.getById(id);
        if (cancelled) return;
        setMovie(movieData);
        try {
          const similarData = await recommendationsService.getSimilarTo(id);
          if (cancelled) return;
          setSimilar(similarData);
        } catch (similarErr) {
          if (cancelled) return;
          const wrapped =
            similarErr instanceof ApiHttpError
              ? similarErr
              : new ApiHttpError({
                  code: "UNKNOWN",
                  message: similarErr instanceof Error ? similarErr.message : "Unexpected error",
                  status: 0,
                });
          const resolved = resolveApiError(wrapped);
          toast.error("Não foi possível carregar filmes similares.", {
            description: resolved.message,
          });
        }
      } catch (err) {
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
