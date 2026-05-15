import type { MovieSummary } from "./movie";

export interface RatingStatus {
  rating: number | null;
}

/** Enriched rating row from `GET /ratings` — mirrors backend `RatingItemDto`. */
export interface RatingItem {
  movie: MovieSummary;
  rating: number;
  ratedAt: string;
}
