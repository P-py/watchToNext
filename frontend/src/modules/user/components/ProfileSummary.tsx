"use client";

import Link from "next/link";
import { Eye, Heart, Star } from "lucide-react";
import { useAsyncList } from "@/hooks/useAsyncList";
import { favoritesService } from "@/services/favorites.service";
import { watchedService } from "@/services/watched.service";
import { ratingsService } from "@/services/ratings.service";
import type { AsyncListResult } from "@/hooks/useAsyncList";

function countLabel(state: AsyncListResult<unknown>): string {
  if (state.loading || state.error) return "—";
  return String(state.items.length);
}

/** Compact favorites / watched / ratings overview shown on the profile page. */
export function ProfileSummary() {
  const favorites = useAsyncList(favoritesService.listFavoriteItems);
  const watched = useAsyncList(watchedService.listWatchedItems);
  const ratings = useAsyncList(ratingsService.listRatingItems);

  const cards = [
    { href: "/favorites", label: "Favoritos", icon: Heart, state: favorites },
    { href: "/watched", label: "Assistidos", icon: Eye, state: watched },
    { href: "/ratings", label: "Avaliações", icon: Star, state: ratings },
  ];

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-semibold text-zinc-100">Minhas listas</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-800"
          >
            <card.icon className="mb-3 h-6 w-6 text-amber-400" />
            <p className="text-2xl font-bold text-zinc-100">{countLabel(card.state)}</p>
            <p className="text-sm text-zinc-400">{card.label}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
