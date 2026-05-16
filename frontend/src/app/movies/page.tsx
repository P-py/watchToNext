"use client";

import { Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { AnimatedGrid } from "@/components/AnimatedGrid";
import { MovieGridSkeleton } from "@/components/MovieGridSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { Pagination } from "@/components/Pagination";
import { Select } from "@/components/Select";
import { MovieCard } from "@/modules/movies/components/MovieCard";
import { SortInfoBox, hasSortInfo } from "@/modules/movies/components/SortInfoBox";
import { usePopularMovies } from "@/hooks/useMovies";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
import { CATALOG_MAX_MOVIES } from "@/services/movies.service";
import { resolveApiError } from "@/utils/error-messages";
import { fadeUp } from "@/utils/animations";
import { MovieSort } from "@/types/movie";

const PAGE_SIZE = 20;

const SORT_OPTIONS: { value: MovieSort; label: string }[] = [
  { value: "RELEVANCE", label: "Relevância" },
  { value: "POPULARITY", label: "Popularidade" },
  { value: "RATING", label: "Avaliação" },
  { value: "RELEASE", label: "Lançamento" },
];

const DEFAULT_SORT: MovieSort = "RELEVANCE";

function parsePage(raw: string | null): number {
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1;
}

function parseSort(raw: string | null): MovieSort {
  return SORT_OPTIONS.some((o) => o.value === raw) ? (raw as MovieSort) : DEFAULT_SORT;
}

function MoviesGrid() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get("page"));
  const sort = parseSort(searchParams.get("sort"));

  const { movies, totalPages, loading, error } = usePopularMovies(page, PAGE_SIZE, sort);
  const showSkeleton = useDelayedFlag(loading);

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

  const onSortChange = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === DEFAULT_SORT) params.delete("sort");
      else params.set("sort", next);
      // A new ordering invalidates the current page index.
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `/movies?${qs}` : "/movies", { scroll: true });
    },
    [router, searchParams],
  );

  const resolved = error ? resolveApiError(error) : null;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-2xl font-bold text-zinc-100 md:text-3xl lg:text-4xl"
        >
          Filmes
        </motion.h1>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="w-44">
          <Select
            id="movie-sort"
            label="Ordenar por"
            options={SORT_OPTIONS}
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
          />
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {hasSortInfo(sort) && <SortInfoBox key={sort} sort={sort} />}
      </AnimatePresence>

      {resolved && <ErrorState title={resolved.title} message={resolved.message} />}

      {!error && loading && showSkeleton && (
        <MovieGridSkeleton count={PAGE_SIZE} cols={4} />
      )}

      {!error && !loading && (
        <AnimatedGrid key={`${sort}-${page}`} cols={4}>
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

      {!error && !loading && movies.length > 0 && (
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-6 text-center text-sm text-zinc-500"
        >
          Mostrando os {CATALOG_MAX_MOVIES} títulos em destaque do catálogo. Procurando algo
          específico?{" "}
          <Link href="/search" className="text-amber-500 hover:text-amber-400">
            Use a busca
          </Link>{" "}
          para uma exploração mais a fundo.
        </motion.p>
      )}
    </>
  );
}

export default function MoviesPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Suspense fallback={<MovieGridSkeleton count={PAGE_SIZE} cols={4} />}>
          <MoviesGrid />
        </Suspense>
      </main>
    </>
  );
}
