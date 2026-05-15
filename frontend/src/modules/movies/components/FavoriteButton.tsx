"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/Button";
import { useSession } from "@/components/SessionProvider";
import { useFavorites } from "@/components/FavoritesProvider";

interface FavoriteButtonProps {
  movieId: number;
}

export function FavoriteButton({ movieId }: FavoriteButtonProps) {
  const session = useSession();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [pending, setPending] = useState(false);

  // Anonymous visitors don't see the action — the movie page itself stays public.
  if (!session) return null;

  const favorite = isFavorite(movieId);

  async function handleClick() {
    setPending(true);
    try {
      await toggleFavorite(movieId);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant={favorite ? "primary" : "secondary"}
      size="sm"
      onClick={handleClick}
      loading={pending}
      leftIcon={
        <Heart className={favorite ? "h-4 w-4 fill-current" : "h-4 w-4"} />
      }
    >
      {favorite ? "Favorito" : "Favoritar"}
    </Button>
  );
}
