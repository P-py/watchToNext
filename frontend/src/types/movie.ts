export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
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

export interface MovieDetails extends Movie {
  cast: CastMember[];
  similarMovies: Movie[];
}

/**
 * Subset returned by listing endpoints (`/movies/popular`, `/movies?q=…`).
 * Mirrors the backend `MovieSummaryDto`. Use `Movie` / `MovieDetails` for the
 * richer detail view.
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

