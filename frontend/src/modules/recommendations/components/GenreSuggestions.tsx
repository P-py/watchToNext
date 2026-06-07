"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { ApiHttpError } from "@/services/api-error";
import { genresService } from "@/services/genres.service";
import { moviesService } from "@/services/movies.service";
import type { Genre } from "@/types/movie";
import type { MovieCardData } from "@/modules/movies/components/MovieCard";
import { SuggestionResults } from "./SuggestionResults";

/** Mode 3 — browse popular movies of a chosen genre (catalog filter, no KNN). */
export function GenreSuggestions() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genreId, setGenreId] = useState<number | null>(null);
  const [movies, setMovies] = useState<MovieCardData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiHttpError | null>(null);

  useEffect(() => {
    genresService
      .listGenres()
      .then(setGenres)
      .catch(() => setGenres([]));
  }, []);

  async function load(id: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await moviesService.getByGenre(id);
      setMovies(res.content);
    } catch (err) {
      setError(
        err instanceof ApiHttpError
          ? err
          : new ApiHttpError({ code: "UNKNOWN", message: "Unexpected error", status: 0 }),
      );
    } finally {
      setLoading(false);
    }
  }

  function onChange(e: ChangeEvent<HTMLSelectElement>) {
    const id = Number(e.target.value);
    if (!id) {
      setGenreId(null);
      setMovies(null);
      return;
    }
    setGenreId(id);
    load(id);
  }

  return (
    <div className="space-y-6">
      <select
        value={genreId ?? ""}
        onChange={onChange}
        className="h-12 w-full max-w-sm rounded-xl border border-n-700 bg-n-800 px-4 text-sm text-n-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      >
        <option value="">Escolha um gênero…</option>
        {genres.map((genre) => (
          <option key={genre.id} value={genre.id}>
            {genre.name}
          </option>
        ))}
      </select>

      <SuggestionResults
        loading={loading}
        error={error}
        movies={movies}
        emptyTitle="Nenhum filme neste gênero"
        onRetry={genreId ? () => load(genreId) : undefined}
      />
    </div>
  );
}
