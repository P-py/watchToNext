import { Grid } from "./Grid";
import { MovieCardSkeleton } from "./MovieCardSkeleton";

interface MovieGridSkeletonProps {
  count?: number;
  cols?: 2 | 3 | 4 | 5;
  className?: string;
}

export function MovieGridSkeleton({
  count = 8,
  cols = 4,
  className,
}: MovieGridSkeletonProps) {
  return (
    <Grid cols={cols} className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </Grid>
  );
}
