import { api, USE_MOCKS } from "./api";
import { WatchedStatus } from "@/types/watched";

// In-memory set so the toggle behaves end-to-end while running on mocks.
const mockWatched = new Set<number>();

export const watchedService = {
  getStatus: (movieId: number): Promise<WatchedStatus> => {
    if (USE_MOCKS) return Promise.resolve({ watched: mockWatched.has(movieId) });
    return api.get(`/watched/${movieId}`);
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
