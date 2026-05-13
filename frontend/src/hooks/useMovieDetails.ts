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
  loadingMovie: boolean;
  loadingSimilar: boolean;
  error: ApiHttpError | null;
}

function wrap(err: unknown): ApiHttpError {
  return err instanceof ApiHttpError
    ? err
    : new ApiHttpError({
        code: "UNKNOWN",
        message: err instanceof Error ? err.message : "Unexpected error",
        status: 0,
      });
}

export function useMovieDetails(id: number): UseMovieDetailsResult {
  const [movie, setMovie] = useState<MovieSummary | null>(null);
  const [similar, setSimilar] = useState<SimilarMovie[]>([]);
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [error, setError] = useState<ApiHttpError | null>(null);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoadingMovie(true);
      setLoadingSimilar(true);
      setError(null);
    });

    moviesService
      .getById(id)
      .then((movieData) => {
        if (cancelled) return;
        setMovie(movieData);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(wrap(err));
      })
      .finally(() => {
        if (!cancelled) setLoadingMovie(false);
      });

    recommendationsService
      .getSimilarTo(id)
      .then((similarData) => {
        if (cancelled) return;
        setSimilar(similarData);
      })
      .catch((err) => {
        if (cancelled) return;
        const resolved = resolveApiError(wrap(err));
        toast.error("Não foi possível carregar filmes similares.", {
          description: resolved.message,
        });
      })
      .finally(() => {
        if (!cancelled) setLoadingSimilar(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { movie, similar, loadingMovie, loadingSimilar, error };
}
