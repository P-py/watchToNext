import { UserProfile as UserProfileType } from "@/types/user";
import { Grid } from "@/components/Grid";
import { MovieCard } from "@/modules/movies/components/MovieCard";
import { User } from "lucide-react";

interface UserProfileProps {
  profile: UserProfileType;
}

export function UserProfile({ profile }: UserProfileProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
          <User className="h-8 w-8 text-zinc-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-100">{profile.username}</h1>
          <p className="text-sm text-zinc-500">{profile.email}</p>
        </div>
      </div>

      {profile.favoriteGenres.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
            Favorite Genres
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.favoriteGenres.map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.watchedMovies.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
            Watched ({profile.watchedMovies.length})
          </h2>
          <Grid cols={4}>
            {profile.watchedMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </Grid>
        </div>
      )}
    </div>
  );
}
