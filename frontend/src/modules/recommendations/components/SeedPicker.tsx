"use client";

import { useCallback, useState } from "react";
import { Plus, Sparkles, X } from "lucide-react";
import { Button } from "@/components/Button";
import { SearchBar } from "@/modules/search/components/SearchBar";
import { useSearch } from "@/hooks/useSearch";
import { ApiHttpError } from "@/services/api-error";
import { recommendationsService } from "@/services/recommendations.service";
import type { MovieSummary } from "@/types/movie";
import type { MovieCardData } from "@/modules/movies/components/MovieCard";
import { similarToCard } from "./cardData";
import { SuggestionResults } from "./SuggestionResults";

/** Mode 2 — user searches and picks seed movies; KNN runs over those picks. */
export function SeedPicker() {
  const { results, loading: searching, search } = useSearch();
  const [seeds, setSeeds] = useState<MovieSummary[]>([]);
  const [movies, setMovies] = useState<MovieCardData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiHttpError | null>(null);

  const onSearch = useCallback((q: string) => search(q), [search]);

  function addSeed(movie: MovieSummary) {
    setSeeds((prev) =>
      prev.some((s) => s.id === movie.id) ? prev : [...prev, movie],
    );
  }

  function removeSeed(id: number) {
    setSeeds((prev) => prev.filter((s) => s.id !== id));
  }

  async function run() {
    if (seeds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await recommendationsService.getFromSeeds(seeds.map((s) => s.id));
      setMovies(res.map(similarToCard));
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

  return (
    <div className="space-y-6">
      <SearchBar onSearch={onSearch} loading={searching} />

      {results.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {results.slice(0, 12).map((movie) => (
            <button
              key={movie.id}
              type="button"
              onClick={() => addSeed(movie)}
              className="inline-flex items-center gap-1 rounded-full border border-n-700 bg-n-800 px-3 py-1.5 text-xs text-n-200 transition-colors hover:border-amber-500/60 hover:text-amber-300"
            >
              <Plus className="h-3 w-3" />
              {movie.title}
            </button>
          ))}
        </div>
      )}

      {seeds.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-n-400">Filmes escolhidos</p>
          <div className="flex flex-wrap gap-2">
            {seeds.map((seed) => (
              <span
                key={seed.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200"
              >
                {seed.title}
                <button
                  type="button"
                  onClick={() => removeSeed(seed.id)}
                  aria-label={`Remover ${seed.title}`}
                  className="text-amber-300/70 transition-colors hover:text-amber-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={run}
        loading={loading}
        disabled={seeds.length === 0}
        leftIcon={<Sparkles className="h-4 w-4" />}
      >
        Buscar sugestões
      </Button>

      <SuggestionResults
        loading={loading}
        error={error}
        movies={movies}
        emptyTitle="Nenhuma sugestão encontrada"
        emptyDescription="Tente escolher outros filmes como ponto de partida."
        onRetry={run}
      />
    </div>
  );
}
