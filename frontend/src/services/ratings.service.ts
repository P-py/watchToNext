import { api, USE_MOCKS } from "./api";
import { RatingItem, RatingStatus } from "@/types/rating";
import { mockSummary } from "./movies.service";

// In-memory map so rating works end-to-end while running on mocks.
const mockRatings = new Map<number, number>();

export const ratingsService = {
  getStatus: (movieId: number): Promise<RatingStatus> => {
    if (USE_MOCKS) return Promise.resolve({ rating: mockRatings.get(movieId) ?? null });
    return api.get(`/ratings/${movieId}`);
  },

  /** Enriched rows — used by the `/ratings` list page. */
  listRatingItems: (): Promise<RatingItem[]> => {
    if (USE_MOCKS) {
      return Promise.resolve(
        [...mockRatings.entries()].map(([id, rating]) => ({
          movie: mockSummary(id),
          rating,
          ratedAt: new Date().toISOString(),
        })),
      );
    }
    return api.get("/ratings");
  },

  rate: (movieId: number, rating: number): Promise<void> => {
    if (USE_MOCKS) {
      mockRatings.set(movieId, rating);
      return Promise.resolve();
    }
    return api.put(`/ratings/${movieId}`, { rating });
  },

  removeRating: (movieId: number): Promise<void> => {
    if (USE_MOCKS) {
      mockRatings.delete(movieId);
      return Promise.resolve();
    }
    return api.del(`/ratings/${movieId}`);
  },
};
