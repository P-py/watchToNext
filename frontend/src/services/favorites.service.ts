import { api, USE_MOCKS } from "./api";
import { Favorite } from "@/types/favorite";

// In-memory set so favoriting works end-to-end while running on mocks.
const mockFavorites = new Set<number>();

export const favoritesService = {
  listFavorites: async (): Promise<number[]> => {
    if (USE_MOCKS) return Promise.resolve([...mockFavorites]);
    const favorites = await api.get<Favorite[]>("/favorites");
    return favorites.map((f) => f.movieId);
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
