import { api, USE_MOCKS } from "./api";
import { WatchedItem, WatchedStatus } from "@/types/watched";
import { mockSummary } from "./movies.service";

// In-memory set so the toggle behaves end-to-end while running on mocks.
const mockWatched = new Set<number>();

export const watchedService = {
  getStatus: (movieId: number): Promise<WatchedStatus> => {
    if (USE_MOCKS) return Promise.resolve({ watched: mockWatched.has(movieId) });
    return api.get(`/watched/${movieId}`);
  },

  /** Just the movie ids — used by `WatchedProvider` to drive the card toggles. */
  listWatched: async (): Promise<number[]> => {
    if (USE_MOCKS) return Promise.resolve([...mockWatched]);
    const items = await api.get<WatchedItem[]>("/watched");
    return items.map((item) => item.movie.id);
  },

  /** Enriched rows — used by the `/watched` history page. */
  listWatchedItems: async (): Promise<WatchedItem[]> => {
    if (USE_MOCKS) {
      return Promise.resolve(
        [...mockWatched].map((id) => ({
          movie: mockSummary(id),
          watchedAt: new Date().toISOString(),
        })),
      );
    }
    return api.get("/watched");
  },

  markWatched: (movieId: number): Promise<void> => {
    if (USE_MOCKS) {
      mockWatched.add(movieId);
      return Promise.resolve();
    }
    return api.put(`/watched/${movieId}`);
  },

  unmarkWatched: (movieId: number): Promise<void> => {
    if (USE_MOCKS) {
      mockWatched.delete(movieId);
      return Promise.resolve();
    }
    return api.del(`/watched/${movieId}`);
  },
};
