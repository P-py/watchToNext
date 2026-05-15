import type { MovieSummary } from "./movie";

export interface WatchedStatus {
  watched: boolean;
}

/** Enriched watched row from `GET /watched` — mirrors backend `WatchedItemDto`. */
export interface WatchedItem {
  movie: MovieSummary;
  watchedAt: string;
}
