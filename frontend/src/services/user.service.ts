import { api } from "./api";
import { UserProfile } from "@/types/user";
import { MOCK_USER_PROFILE } from "@/mocks/data";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

export const userService = {
  getProfile: (): Promise<UserProfile> => {
    if (USE_MOCKS) return Promise.resolve(MOCK_USER_PROFILE);
    return api.get("/users/me");
  },

  addToWatched: (movieId: number): Promise<void> => {
    if (USE_MOCKS) return Promise.resolve();
    return api.post("/users/me/watched", { movieId });
  },
};
