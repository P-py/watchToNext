"use client";

import { MouseEvent, useState } from "react";
import { Heart } from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import { useFavorites } from "@/components/FavoritesProvider";
import { cn } from "@/utils/cn";

interface FavoriteHeartProps {
  movieId: number;
}

export function FavoriteHeart({ movieId }: FavoriteHeartProps) {
  const session = useSession();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [pending, setPending] = useState(false);

  // The card itself is public; the heart is an authenticated-only affordance.
  if (!session) return null;

  const favorite = isFavorite(movieId);

  async function handleClick(e: MouseEvent<HTMLButtonElement>) {
    // The card is wrapped in a Link/button — don't navigate when favoriting.
    e.preventDefault();
    e.stopPropagation();
    setPending(true);
    try {
      await toggleFavorite(movieId);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      aria-pressed={favorite}
      className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-zinc-200 backdrop-blur-sm transition-colors hover:bg-black/70 disabled:opacity-60"
    >
      <Heart
        className={cn("h-4 w-4", favorite && "fill-amber-400 text-amber-400")}
      />
    </button>
  );
}
