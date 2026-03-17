import { Movie } from "@/types/movie";
import { Grid } from "@/components/Grid";
import { MovieCard } from "@/modules/movies/components/MovieCard";
import { Sparkles } from "lucide-react";

interface RecommendationGridProps {
  movies: Movie[];
  title?: string;
}

export function RecommendationGrid({
  movies,
  title = "Recommended for you",
}: RecommendationGridProps) {
  if (movies.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-100">
        <Sparkles className="h-5 w-5 text-amber-400" />
        {title}
      </h2>
      <Grid cols={4}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </Grid>
    </section>
  );
}
