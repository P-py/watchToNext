export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  voteAverage: number;
  voteCount: number;
  genres: Genre[];
  runtime: number | null;
}

/**
 * Catalog explorer ordering. Mirrors the backend `MovieSort` enum and the
 * `/movies/popular?sort=` query parameter. `RELEVANCE` is the default — a
 * weighted rating that surfaces well-known, well-rated movies first.
 */
export type MovieSort = "RELEVANCE" | "POPULARITY" | "RATING" | "RELEASE";

/**
 * Subset returned by listing endpoints (`/movies/popular`, `/movies?q=…`, `/movies/{id}`).
 * Mirrors the backend `MovieSummaryDto`.
 */
export interface MovieSummary {
  id: number;
  tmdbId: number;
  title: string;
  overview: string | null;
  posterPath: string | null;
  voteAverage: number | null;
  voteCount: number | null;
  popularity: number | null;
  releaseDate: string | null;
  genres: Genre[];
}

/**
 * Shape returned by `/recommendations` and `/recommendations/similar`.
 * Mirrors the backend `RecommendationDto`.
 */
export interface SimilarMovie {
  movieId: number;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  voteAverage: number | null;
  releaseDate: string | null;
  score: number;
}
