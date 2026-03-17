import { api } from "./api";
import { Movie, MovieDetails, MovieSearchResult } from "@/types/movie";
import { PaginatedResponse } from "@/types/api";
import { MOCK_MOVIES, MOCK_MOVIE_DETAILS } from "@/mocks/data";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

const PAGE_SIZE = 8;

function paginate<T>(items: T[], page: number): PaginatedResponse<T> {
  const start = (page - 1) * PAGE_SIZE;
  return {
    content: items.slice(start, start + PAGE_SIZE),
    totalElements: items.length,
    totalPages: Math.ceil(items.length / PAGE_SIZE),
    currentPage: page,
    pageSize: PAGE_SIZE,
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
        totalPages: Math.ceil(movies.length / PAGE_SIZE),
        currentPage: page,
      });
    }
    return api.get(`/api/movies?query=${encodeURIComponent(query)}&page=${page}`);
  },

  getById: (id: number): Promise<MovieDetails> => {
    if (USE_MOCKS) {
      const movie = MOCK_MOVIE_DETAILS[id] ?? MOCK_MOVIE_DETAILS[MOCK_MOVIES[0].id];
      return Promise.resolve(movie);
    }
    return api.get(`/api/movies/${id}`);
  },

  getByGenre: (genreId: number, page = 1): Promise<PaginatedResponse<Movie>> => {
    if (USE_MOCKS) {
      const filtered = MOCK_MOVIES.filter((m) => m.genres.some((g) => g.id === genreId));
      return Promise.resolve(paginate(filtered, page));
    }
    return api.get(`/api/movies?genreId=${genreId}&page=${page}`);
  },

  getPopular: (page = 1): Promise<PaginatedResponse<Movie>> => {
    if (USE_MOCKS) return Promise.resolve(paginate(MOCK_MOVIES, page));
    return api.get(`/api/movies/popular?page=${page}`);
  },
};
