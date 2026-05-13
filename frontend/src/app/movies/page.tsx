"use client";

import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { AnimatedGrid } from "@/components/AnimatedGrid";
import { Grid } from "@/components/Grid";
import { MovieCardSkeleton } from "@/components/MovieCardSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { Pagination } from "@/components/Pagination";
import { MovieCard } from "@/modules/movies/components/MovieCard";
import { usePopularMovies } from "@/hooks/useMovies";
import { fadeUp } from "@/utils/animations";

const PAGE_SIZE = 20;

function parsePage(raw: string | null): number {
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1;
}

function MoviesGrid() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get("page"));

  const { movies, totalPages, loading, error } = usePopularMovies(page, PAGE_SIZE);

  const onPageChange = useCallback(
    (next: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next <= 1) params.delete("page");
      else params.set("page", String(next));
      const qs = params.toString();
      router.push(qs ? `/movies?${qs}` : "/movies", { scroll: true });
    },
    [router, searchParams],
  );

  return (
    <>
      {error && <ErrorState message={error.message} />}

      {!error && loading && (
        <Grid cols={4}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </Grid>
      )}

      {!error && !loading && (
        <AnimatedGrid key={page} cols={4}>
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </AnimatedGrid>
      )}

      {!error && totalPages > 1 && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-8 flex justify-center"
        >
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        </motion.div>
      )}
    </>
  );
}

function GridFallback() {
  return (
    <Grid cols={4}>
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </Grid>
  );
}

export default function MoviesPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-8 text-2xl font-bold text-zinc-100 md:text-3xl lg:text-4xl"
        >
          Movies
        </motion.h1>

        <Suspense fallback={<GridFallback />}>
          <MoviesGrid />
        </Suspense>
      </main>
    </>
  );
}
