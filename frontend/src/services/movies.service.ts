import { api, USE_MOCKS } from "./api";
import { Movie, MovieSort, MovieSummary } from "@/types/movie";
import { PaginatedResponse } from "@/types/api";
import { MOCK_MOVIES } from "@/mocks/data";

/**
 * Upper bound on movies browsable through the catalog explorer — mirrors the
 * backend `MovieService.CATALOG_MAX_MOVIES`. Deeper exploration goes to search.
 */
export const CATALOG_MAX_MOVIES = 200;

/** Bayesian prior weight (`m`) for the `RELEVANCE` weighted rating. */
const RELEVANCE_MIN_VOTES = 1000;

/** Mock-mode ordering — mirrors the backend `MovieSort` strategies. */
function sortForCatalog(movies: Movie[], sort: MovieSort): Movie[] {
  const sorted = [...movies];
  switch (sort) {
    case "RATING":
      return sorted.sort((a, b) => b.voteAverage - a.voteAverage);
    case "RELEASE":
      return sorted.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
    case "POPULARITY":
      return sorted.sort((a, b) => b.voteCount - a.voteCount);
    case "RELEVANCE":
    default: {
      const rated = movies.filter((m) => m.voteCount > 0);
      const meanRating =
        rated.reduce((sum, m) => sum + m.voteAverage, 0) / (rated.length || 1);
      const score = (m: Movie) => {
        const v = m.voteCount;
        return (
          (v / (v + RELEVANCE_MIN_VOTES)) * m.voteAverage +
          (RELEVANCE_MIN_VOTES / (v + RELEVANCE_MIN_VOTES)) * meanRating
        );
      };
      return sorted.sort((a, b) => score(b) - score(a));
    }
  }
}

export function toSummary(m: Movie): MovieSummary {
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

/** Mock-mode helper: a `MovieSummary` for a given id, falling back to the first mock. */
export function mockSummary(id: number): MovieSummary {
  return toSummary(MOCK_MOVIES.find((m) => m.id === id) ?? MOCK_MOVIES[0]);
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

  getByGenre: (
    genreId: number,
    page = 1,
    size = DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedResponse<MovieSummary>> => {
    if (USE_MOCKS) {
      const filtered = MOCK_MOVIES.filter((m) => m.genres.some((g) => g.id === genreId));
      return Promise.resolve(paginate(filtered.map(toSummary), page, size));
    }
    return api.get(`/movies/popular?genreId=${genreId}&page=${page}&size=${size}`);
  },

  getPopular: (
    page = 1,
    size = DEFAULT_PAGE_SIZE,
    sort: MovieSort = "RELEVANCE",
  ): Promise<PaginatedResponse<MovieSummary>> => {
    if (USE_MOCKS) {
      const ordered = sortForCatalog(MOCK_MOVIES, sort)
        .slice(0, CATALOG_MAX_MOVIES)
        .map(toSummary);
      return Promise.resolve(paginate(ordered, page, size));
    }
    return api.get(`/movies/popular?page=${page}&size=${size}&sort=${sort}`);
  },
};
