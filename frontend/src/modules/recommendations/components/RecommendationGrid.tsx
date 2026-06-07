import { AnimatedGrid } from "@/components/AnimatedGrid";
import { MovieCard, MovieCardData } from "@/modules/movies/components/MovieCard";
import { Sparkles } from "lucide-react";

interface RecommendationGridProps {
  movies: MovieCardData[];
  title?: string;
}

export function RecommendationGrid({
  movies,
  title = "Recomendados para você",
}: RecommendationGridProps) {
  if (movies.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-n-100">
        <Sparkles className="h-5 w-5 text-amber-400" />
        {title}
      </h2>
      <AnimatedGrid cols={4}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </AnimatedGrid>
    </section>
  );
}
