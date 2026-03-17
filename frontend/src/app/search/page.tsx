"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/modules/search/components/SearchBar";
import { AnimatedGrid } from "@/components/AnimatedGrid";
import { MovieCard } from "@/modules/movies/components/MovieCard";
import { useSearch } from "@/hooks/useSearch";
import { fadeUp } from "@/utils/animations";

export default function SearchPage() {
  const { results, loading, error, query, search } = useSearch();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-6 text-2xl font-bold text-zinc-100"
        >
          Search
        </motion.h1>

        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <SearchBar onSearch={search} loading={loading} className="mb-8 max-w-xl" />
        </motion.div>

        {error && <p className="text-sm text-red-400">{error}</p>}

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

          {!loading && results.length === 0 && query && (
            <motion.p
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-zinc-500"
            >
              No movies found for &quot;{query}&quot;.
            </motion.p>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
