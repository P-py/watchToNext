"use client";

import { Eye } from "lucide-react";
import { AnimatedGrid } from "@/components/AnimatedGrid";
import { MovieCard } from "@/modules/movies/components/MovieCard";
import { watchedService } from "@/services/watched.service";
import { useAsyncList } from "@/hooks/useAsyncList";
import { ListStateView } from "./ListStateView";

export function WatchedList() {
  const { items, loading, error, reload } = useAsyncList(
    watchedService.listWatchedItems,
  );

  return (
    <ListStateView
      loading={loading}
      error={error}
      isEmpty={items.length === 0}
      emptyIcon={<Eye className="h-8 w-8" />}
      emptyTitle="Nenhum filme assistido ainda"
      emptyDescription="Marque um filme como assistido para acompanhá-lo aqui."
      onRetry={reload}
    >
      <AnimatedGrid cols={4}>
        {items.map((item) => (
          <MovieCard key={item.movie.id} movie={item.movie} />
        ))}
      </AnimatedGrid>
    </ListStateView>
  );
}
