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

export interface MovieSearchResult {
  movies: Movie[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
}
