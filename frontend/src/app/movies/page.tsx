"use client";

import { useState } from "react";
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

export default function MoviesPage() {
  const [page, setPage] = useState(1);
  const { movies, loading, error } = usePopularMovies(page);

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

        {error && <ErrorState message={error} />}

        {!error && loading && (
          <Grid cols={4}>
            {Array.from({ length: 8 }).map((_, i) => (
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

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-8 flex justify-center"
        >
          <Pagination currentPage={page} totalPages={2} onPageChange={setPage} />
        </motion.div>
      </main>
    </>
  );
}
