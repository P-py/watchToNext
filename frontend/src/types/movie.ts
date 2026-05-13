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
