"use client";

import { Film } from "lucide-react";
import { AnimatedGrid } from "@/components/AnimatedGrid";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { MovieGridSkeleton } from "@/components/MovieGridSkeleton";
import { MovieCard, type MovieCardData } from "@/modules/movies/components/MovieCard";
import { ApiHttpError } from "@/services/api-error";
import { resolveApiError } from "@/utils/error-messages";

interface SuggestionResultsProps {
  loading: boolean;
  error: ApiHttpError | null;
  /** `null` means "no search run yet" — nothing is rendered. */
  movies: MovieCardData[] | null;
  emptyTitle: string;
  emptyDescription?: string;
  onRetry?: () => void;
}

/** Shared loading / error / empty / grid switch for all three suggestion modes. */
export function SuggestionResults({
  loading,
  error,
  movies,
  emptyTitle,
  emptyDescription,
  onRetry,
}: SuggestionResultsProps) {
  if (loading) return <MovieGridSkeleton count={8} cols={4} />;

  if (error) {
    const resolved = resolveApiError(error);
    return (
      <ErrorState
        title={resolved.title}
        message={resolved.message}
        onRetry={onRetry}
        retryLabel="Tentar novamente"
      />
    );
  }

  if (movies === null) return null;

  if (movies.length === 0) {
    return (
      <EmptyState
        icon={<Film className="h-8 w-8" />}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <AnimatedGrid cols={4}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </AnimatedGrid>
  );
}
