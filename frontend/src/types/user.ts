import { Movie } from "./movie";

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
}

export interface UserProfile extends User {
  watchedMovies: Movie[];
  favoriteGenres: string[];
}
