"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { AnimatedGrid } from "@/components/AnimatedGrid";
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

        {error && <p className="text-sm text-red-400">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] rounded-xl bg-zinc-800"
                style={{
                  animation: `pulse 1.5s ease-in-out ${i * 0.1}s infinite`,
                }}
              />
            ))}
          </div>
        ) : (
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
