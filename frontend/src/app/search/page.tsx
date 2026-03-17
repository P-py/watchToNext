"use client";

import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/modules/search/components/SearchBar";
import { Grid } from "@/components/Grid";
import { MovieCard } from "@/modules/movies/components/MovieCard";
import { useSearch } from "@/hooks/useSearch";

export default function SearchPage() {
  const { results, loading, error, query, search } = useSearch();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold text-zinc-100">Search</h1>
        <SearchBar onSearch={search} loading={loading} className="mb-8 max-w-xl" />

        {error && <p className="text-sm text-red-400">{error}</p>}

        {results.length > 0 && (
          <>
            <p className="mb-4 text-sm text-zinc-500">
              Results for &quot;{query}&quot;
            </p>
            <Grid cols={4}>
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </Grid>
          </>
        )}

        {!loading && results.length === 0 && query && (
          <p className="text-sm text-zinc-500">No movies found for &quot;{query}&quot;.</p>
        )}
      </main>
    </>
  );
}
