import { api, USE_MOCKS } from "./api";
import { Movie } from "@/types/movie";
import { MOCK_MOVIES } from "@/mocks/data";

export const recommendationsService = {
  getForMovie: (movieId: number): Promise<Movie[]> => {
    if (USE_MOCKS) {
      return Promise.resolve(MOCK_MOVIES.filter((m) => m.id !== movieId).slice(0, 6));
    }
    return api.get(`/recommendations?movieId=${movieId}`);
  },

  getPersonalized: (): Promise<Movie[]> => {
    if (USE_MOCKS) return Promise.resolve(MOCK_MOVIES.slice(0, 8));
    return api.get("/recommendations/personalized");
  },
};
