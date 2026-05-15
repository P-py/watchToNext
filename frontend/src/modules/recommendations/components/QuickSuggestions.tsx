"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/Button";
import { ApiHttpError } from "@/services/api-error";
import { recommendationsService } from "@/services/recommendations.service";
import type { MovieCardData } from "@/modules/movies/components/MovieCard";
import { similarToCard } from "./cardData";
import { SuggestionResults } from "./SuggestionResults";

/** Mode 1 — one click, KNN over the user's whole rating + favorite history. */
export function QuickSuggestions() {
  const [movies, setMovies] = useState<MovieCardData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiHttpError | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await recommendationsService.getPersonalized();
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
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
        <p className="mb-4 text-sm text-zinc-400">
          Deixe o KNN analisar tudo o que você já avaliou e favoritou e montar uma
          lista sob medida.
        </p>
        <Button onClick={run} loading={loading} leftIcon={<Wand2 className="h-4 w-4" />}>
          Quero recomendações
        </Button>
      </div>

      <SuggestionResults
        loading={loading}
        error={error}
        movies={movies}
        emptyTitle="Ainda não dá para recomendar"
        emptyDescription="Avalie alguns filmes primeiro para o KNN ter de onde partir."
        onRetry={run}
      />
    </div>
  );
}
