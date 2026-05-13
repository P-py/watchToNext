import { api, USE_MOCKS } from "./api";
import { Movie, MovieSummary } from "@/types/movie";
import { PaginatedResponse } from "@/types/api";
import { MOCK_MOVIES } from "@/mocks/data";

function toSummary(m: Movie): MovieSummary {
  return {
    id: m.id,
    tmdbId: m.id,
    title: m.title,
    overview: m.overview,
    posterPath: m.posterPath,
    voteAverage: m.voteAverage,
    voteCount: m.voteCount,
    popularity: null,
    releaseDate: m.releaseDate,
    genres: m.genres,
  };
}

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
  search: (
    q: string,
    page = 1,
    size = DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedResponse<MovieSummary>> => {
    const trimmed = q.trim();
    if (!trimmed) {
      return Promise.reject(new Error("search query must not be empty"));
    }
    if (USE_MOCKS) {
      const needle = trimmed.toLowerCase();
      const matches = MOCK_MOVIES.filter((m) =>
        m.title.toLowerCase().includes(needle),
      );
      return Promise.resolve(paginate(matches.map(toSummary), page, size));
    }
    return api.get(
      `/movies?q=${encodeURIComponent(trimmed)}&page=${page}&size=${size}`,
    );
  },

  getById: (id: number): Promise<MovieSummary> => {
    if (USE_MOCKS) {
      const movie = MOCK_MOVIES.find((m) => m.id === id) ?? MOCK_MOVIES[0];
      return Promise.resolve(toSummary(movie));
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
      return Promise.resolve(paginate(MOCK_MOVIES.map(toSummary), page, size));
    }
    return api.get(`/movies/popular?page=${page}&size=${size}`);
  },
};
