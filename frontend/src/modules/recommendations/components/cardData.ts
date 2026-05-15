import type { SimilarMovie } from "@/types/movie";
import type { MovieCardData } from "@/modules/movies/components/MovieCard";

/** Adapts a `SimilarMovie` (recommendation DTO) to the shape `MovieCard` needs. */
export function similarToCard(movie: SimilarMovie): MovieCardData {
  return {
    id: movie.movieId,
    title: movie.title,
    posterPath: movie.posterPath,
    releaseDate: movie.releaseDate,
    voteAverage: movie.voteAverage,
  };
}
