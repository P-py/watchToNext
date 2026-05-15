"use client";

import { Star } from "lucide-react";
import { AnimatedGrid } from "@/components/AnimatedGrid";
import { MovieCard } from "@/modules/movies/components/MovieCard";
import { ratingsService } from "@/services/ratings.service";
import { useAsyncList } from "@/hooks/useAsyncList";
import { ListStateView } from "./ListStateView";

export function RatingsList() {
  const { items, loading, error, reload } = useAsyncList(
    ratingsService.listRatingItems,
  );

  return (
    <ListStateView
      loading={loading}
      error={error}
      isEmpty={items.length === 0}
      emptyIcon={<Star className="h-8 w-8" />}
      emptyTitle="Nenhuma avaliação ainda"
      emptyDescription="Avalie um filme com estrelas para vê-lo nesta lista."
      onRetry={reload}
    >
      <AnimatedGrid cols={4}>
        {items.map((item) => (
          <MovieCard
            key={item.movie.id}
            movie={item.movie}
            badge={
              <span className="pointer-events-none absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-medium text-amber-300 backdrop-blur-sm">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {item.rating.toFixed(1)}
              </span>
            }
          />
        ))}
      </AnimatedGrid>
    </ListStateView>
  );
}
