"use client";

import { MouseEvent, useState } from "react";
import { Eye } from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import { useWatched } from "@/components/WatchedProvider";
import { cn } from "@/utils/cn";

interface WatchedEyeProps {
  movieId: number;
}

/**
 * Watched toggle for movie cards — sits next to `FavoriteHeart`. Like the
 * heart, it's an authenticated-only affordance; the card itself stays public.
 */
export function WatchedEye({ movieId }: WatchedEyeProps) {
  const session = useSession();
  const { isWatched, toggleWatched } = useWatched();
  const [pending, setPending] = useState(false);

  if (!session) return null;

  const watched = isWatched(movieId);

  async function handleClick(e: MouseEvent<HTMLButtonElement>) {
    // The card is wrapped in a Link/button — don't navigate when toggling.
    e.preventDefault();
    e.stopPropagation();
    setPending(true);
    try {
      await toggleWatched(movieId);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={watched ? "Remover dos assistidos" : "Marcar como assistido"}
      aria-pressed={watched}
      className="absolute right-11 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-n-200 backdrop-blur-sm transition-colors hover:bg-black/70 disabled:opacity-60"
    >
      <Eye className={cn("h-4 w-4", watched && "fill-amber-400/30 text-amber-400")} />
    </button>
  );
}
