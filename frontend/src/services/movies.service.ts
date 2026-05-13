import { api, USE_MOCKS } from "./api";
import { Movie, MovieDetails, MovieSearchResult, MovieSummary } from "@/types/movie";
import { PaginatedResponse } from "@/types/api";
import { MOCK_MOVIES, MOCK_MOVIE_DETAILS } from "@/mocks/data";

const DEFAULT_PAGE_SIZE = 20;

function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const start = (page - 1) * size;
  return {
    content: items.slice(start, start + size),
    totalElements: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / size)),
    currentPage: page,
    pageSize: size,
  };
}

export const moviesService = {
  search: (query: string, page = 1): Promise<MovieSearchResult> => {
    if (USE_MOCKS) {
      const q = query.toLowerCase();
      const movies = MOCK_MOVIES.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.overview.toLowerCase().includes(q)
      );
      return Promise.resolve({
        movies,
        totalResults: movies.length,
        totalPages: Math.ceil(movies.length / DEFAULT_PAGE_SIZE),
        currentPage: page,
      });
    }
    return api.get(`/movies?query=${encodeURIComponent(query)}&page=${page}`);
  },

  getById: (id: number): Promise<MovieDetails> => {
    if (USE_MOCKS) {
      const movie = MOCK_MOVIE_DETAILS[id] ?? MOCK_MOVIE_DETAILS[MOCK_MOVIES[0].id];
      return Promise.resolve(movie);
    }
    return api.get(`/movies/${id}`);
  },

  getByGenre: (genreId: number, page = 1): Promise<PaginatedResponse<Movie>> => {
    if (USE_MOCKS) {
      const filtered = MOCK_MOVIES.filter((m) => m.genres.some((g) => g.id === genreId));
      return Promise.resolve(paginate(filtered, page, DEFAULT_PAGE_SIZE));
    }
    return api.get(`/movies?genreId=${genreId}&page=${page}`);
  },

  getPopular: (
    page = 1,
    size = DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedResponse<MovieSummary>> => {
    if (USE_MOCKS) {
      return Promise.resolve(paginate(MOCK_MOVIES as unknown as MovieSummary[], page, size));
    }
    return api.get(`/movies/popular?page=${page}&size=${size}`);
  },
};
