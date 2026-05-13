"use client";

import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SearchX } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/modules/search/components/SearchBar";
import { AnimatedGrid } from "@/components/AnimatedGrid";
import { Grid } from "@/components/Grid";
import { MovieCardSkeleton } from "@/components/MovieCardSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { Pagination } from "@/components/Pagination";
import { MovieCard } from "@/modules/movies/components/MovieCard";
import { useSearch } from "@/hooks/useSearch";
import { resolveApiError } from "@/utils/error-messages";
import { fadeUp } from "@/utils/animations";

const PAGE_SIZE = 20;

function parsePage(raw: string | null): number {
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1;
}

function buildHref(q: string, page: number): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

function SearchPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = (searchParams.get("q") ?? "").trim();
  const urlPage = parsePage(searchParams.get("page"));

  const { results, totalPages, loading, error, query } = useSearch(
    urlQuery,
    urlPage,
    PAGE_SIZE,
  );

  const onSearch = useCallback(
    (q: string) => {
      router.push(buildHref(q, 1), { scroll: false });
    },
    [router],
  );

  const onPageChange = useCallback(
    (next: number) => {
      router.push(buildHref(urlQuery, next), { scroll: true });
    },
    [router, urlQuery],
  );

  return (
    <>
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <SearchBar
          onSearch={onSearch}
          initialValue={urlQuery}
          loading={loading}
          className="mb-8 max-w-xl"
        />
      </motion.div>

      {error && (() => {
        const resolved = resolveApiError(error);
        return (
          <ErrorState
            title={resolved.title}
            message={resolved.message}
            onRetry={urlQuery ? () => onSearch(urlQuery) : undefined}
          />
        );
      })()}

      {!error && loading && (
        <Grid cols={4}>
          {Array.from({ length: 8 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </Grid>
      )}

      {!error && !loading && urlQuery && (
        <AnimatePresence mode="wait">
          {results.length > 0 && (
            <motion.div
              key={`${query}:${urlPage}`}
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

              {totalPages > 1 && (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="mt-8 flex justify-center"
                >
                  <Pagination
                    currentPage={urlPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                  />
                </motion.div>
              )}
            </motion.div>
          )}

          {results.length === 0 && (
            <EmptyState
              key="empty"
              icon={<SearchX className="h-8 w-8" />}
              title="No movies found"
              description={`Nothing matched "${query}". Try a different search.`}
            />
          )}
        </AnimatePresence>
      )}
    </>
  );
}

export default function SearchPage() {
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

        <Suspense fallback={null}>
          <SearchPanel />
        </Suspense>
      </main>
    </>
  );
}
