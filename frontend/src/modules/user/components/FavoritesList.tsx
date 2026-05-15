"use client";

import { Heart } from "lucide-react";
import { AnimatedGrid } from "@/components/AnimatedGrid";
import { MovieCard } from "@/modules/movies/components/MovieCard";
import { favoritesService } from "@/services/favorites.service";
import { useAsyncList } from "@/hooks/useAsyncList";
import { ListStateView } from "./ListStateView";

export function FavoritesList() {
  const { items, loading, error, reload } = useAsyncList(
    favoritesService.listFavoriteItems,
  );

  return (
    <ListStateView
      loading={loading}
      error={error}
      isEmpty={items.length === 0}
      emptyIcon={<Heart className="h-8 w-8" />}
      emptyTitle="Nenhum favorito ainda"
      emptyDescription="Toque no coração de um filme para salvá-lo aqui."
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
