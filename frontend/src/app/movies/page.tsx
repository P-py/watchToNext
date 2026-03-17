"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Grid } from "@/components/Grid";
import { Pagination } from "@/components/Pagination";
import { MovieCard } from "@/modules/movies/components/MovieCard";
import { usePopularMovies } from "@/hooks/useMovies";

export default function MoviesPage() {
  const [page, setPage] = useState(1);
  const { movies, loading, error } = usePopularMovies(page);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="mb-8 text-2xl font-bold text-zinc-100">Movies</h1>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-zinc-800" />
            ))}
          </div>
        ) : (
          <Grid cols={4}>
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </Grid>
        )}

        <div className="mt-8 flex justify-center">
          <Pagination currentPage={page} totalPages={2} onPageChange={setPage} />
        </div>
      </main>
    </>
  );
}
