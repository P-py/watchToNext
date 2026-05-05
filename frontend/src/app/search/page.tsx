"use client";

import { motion, AnimatePresence } from "framer-motion";
import { SearchX } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/modules/search/components/SearchBar";
import { AnimatedGrid } from "@/components/AnimatedGrid";
import { Grid } from "@/components/Grid";
import { MovieCardSkeleton } from "@/components/MovieCardSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { MovieCard } from "@/modules/movies/components/MovieCard";
import { useSearch } from "@/hooks/useSearch";
import { fadeUp } from "@/utils/animations";

export default function SearchPage() {
  const { results, loading, error, query, search } = useSearch();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-6 text-2xl font-bold text-zinc-100 md:text-3xl lg:text-4xl"
        >
          Search
        </motion.h1>

        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <SearchBar onSearch={search} loading={loading} className="mb-8 max-w-xl" />
        </motion.div>

        {error && (
          <ErrorState
            message={error}
            onRetry={query ? () => search(query) : undefined}
          />
        )}

        {!error && loading && (
          <Grid cols={4}>
            {Array.from({ length: 8 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </Grid>
        )}

        {!error && !loading && (
          <AnimatePresence mode="wait">
            {results.length > 0 && (
              <motion.div
                key={query}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="mb-4 text-sm text-zinc-500">
                  Results for &quot;{query}&quot;
                </p>
                <AnimatedGrid cols={4}>
                  {results.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </AnimatedGrid>
              </motion.div>
            )}

            {results.length === 0 && query && (
              <EmptyState
                key="empty"
                icon={<SearchX className="h-8 w-8" />}
                title="No movies found"
                description={`Nothing matched "${query}". Try a different search.`}
              />
            )}
          </AnimatePresence>
        )}
      </main>
    </>
  );
}
