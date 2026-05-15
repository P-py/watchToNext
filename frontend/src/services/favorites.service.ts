import { api, USE_MOCKS } from "./api";
import { FavoriteItem } from "@/types/favorite";
import { mockSummary } from "./movies.service";

// In-memory set so favoriting works end-to-end while running on mocks.
const mockFavorites = new Set<number>();

export const favoritesService = {
  /** Just the movie ids — used by `FavoritesProvider` to drive the heart toggles. */
  listFavorites: async (): Promise<number[]> => {
    if (USE_MOCKS) return Promise.resolve([...mockFavorites]);
    const items = await api.get<FavoriteItem[]>("/favorites");
    return items.map((item) => item.movie.id);
  },

  /** Enriched rows — used by the `/favorites` list page. */
  listFavoriteItems: async (): Promise<FavoriteItem[]> => {
    if (USE_MOCKS) {
      return Promise.resolve(
        [...mockFavorites].map((id) => ({
          movie: mockSummary(id),
          favoritedAt: new Date().toISOString(),
        })),
      );
    }
    return api.get("/favorites");
  },

  addFavorite: (movieId: number): Promise<void> => {
    if (USE_MOCKS) {
      mockFavorites.add(movieId);
      return Promise.resolve();
    }
    return api.put(`/favorites/${movieId}`);
  },

  removeFavorite: (movieId: number): Promise<void> => {
    if (USE_MOCKS) {
      mockFavorites.delete(movieId);
      return Promise.resolve();
    }
    return api.del(`/favorites/${movieId}`);
  },
};
