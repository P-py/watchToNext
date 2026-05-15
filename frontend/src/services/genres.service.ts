import { api, USE_MOCKS } from "./api";
import { Genre } from "@/types/movie";
import { GENRES } from "@/mocks/data";

export const genresService = {
  listGenres: (): Promise<Genre[]> => {
    if (USE_MOCKS) return Promise.resolve(GENRES);
    return api.get("/genres");
  },
};
