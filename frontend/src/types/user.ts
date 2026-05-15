export interface User {
  id: string;
  displayName: string;
  email: string | null;
}

export interface UserProfile extends User {
  createdAt: string;
  ratingsCount: number;
  favoritesCount: number;
}
