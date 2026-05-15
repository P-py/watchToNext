import type { MovieSummary } from "./movie";

export interface Favorite {
  userId: string;
  movieId: number;
  createdAt: string;
}

/** Enriched favorite row from `GET /favorites` — mirrors backend `FavoriteItemDto`. */
export interface FavoriteItem {
  movie: MovieSummary;
  favoritedAt: string;
}
