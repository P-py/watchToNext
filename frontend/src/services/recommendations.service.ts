import { api, USE_MOCKS } from "./api";
import { Movie, SimilarMovie } from "@/types/movie";
import { MOCK_MOVIES } from "@/mocks/data";

function toSimilar(m: Movie, score = 1): SimilarMovie {
  return {
    movieId: m.id,
    tmdbId: m.id,
    title: m.title,
    posterPath: m.posterPath,
    voteAverage: m.voteAverage,
    releaseDate: m.releaseDate,
    score,
  };
}

export const recommendationsService = {
  getSimilarTo: (movieId: number, limit = 20): Promise<SimilarMovie[]> => {
    if (USE_MOCKS) {
      return Promise.resolve(
        MOCK_MOVIES.filter((m) => m.id !== movieId).slice(0, limit).map((m) => toSimilar(m)),
      );
    }
    return api.get(`/recommendations/similar?movieId=${movieId}&limit=${limit}`);
  },

  /** Quick suggestions seeded by the user's own ratings + favorites. */
  getPersonalized: (limit = 20): Promise<SimilarMovie[]> => {
    if (USE_MOCKS) {
      return Promise.resolve(MOCK_MOVIES.slice(0, limit).map((m) => toSimilar(m)));
    }
    return api.get(`/recommendations?limit=${limit}`);
  },

  /** Suggestions seeded by an ad-hoc set of movies the user picked. */
  getFromSeeds: (movieIds: number[], limit = 20): Promise<SimilarMovie[]> => {
    if (USE_MOCKS) {
      return Promise.resolve(
        MOCK_MOVIES.filter((m) => !movieIds.includes(m.id))
          .slice(0, limit)
          .map((m) => toSimilar(m)),
      );
    }
    return api.get(
      `/recommendations/from?movieIds=${movieIds.join(",")}&limit=${limit}`,
    );
  },
};
