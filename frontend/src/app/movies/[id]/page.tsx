"use client";

import { use, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { ErrorState } from "@/components/ErrorState";
import { MovieDetailSkeleton } from "@/components/MovieDetailSkeleton";
import { MovieGridSkeleton } from "@/components/MovieGridSkeleton";
import { RecommendationGrid } from "@/modules/recommendations/components/RecommendationGrid";
import { MovieCardData } from "@/modules/movies/components/MovieCard";
import { useMovieDetails } from "@/hooks/useMovieDetails";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
import { resolveApiError } from "@/utils/error-messages";
import { buildPosterUrl, formatRating, formatYear } from "@/utils/format";
import { Star, Calendar } from "lucide-react";
import { fadeUp, fadeIn, slideInLeft, slideInRight, staggerContainer, heroStagger } from "@/utils/animations";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export default function MoviePage({ params }: MoviePageProps) {
  const { id } = use(params);
  const { movie, similar, loadingMovie, loadingSimilar, error } = useMovieDetails(Number(id));
  const showMovieSkeleton = useDelayedFlag(loadingMovie);
  const showSimilarSkeleton = useDelayedFlag(loadingSimilar);

  const similarCards = useMemo<MovieCardData[]>(
    () =>
      similar.map((s) => ({
        id: s.movieId,
        title: s.title,
        posterPath: s.posterPath,
        releaseDate: null,
        voteAverage: s.voteAverage,
      })),
    [similar],
  );

  if (error && !movie) {
    const resolved = resolveApiError(error);
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ErrorState title={resolved.title} message={resolved.message} />
        </main>
      </>
    );
  }

  if (loadingMovie || !movie) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {showMovieSkeleton && <MovieDetailSkeleton />}
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* poster */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="relative mx-auto aspect-[2/3] w-48 shrink-0 overflow-hidden rounded-xl bg-zinc-800 shadow-2xl shadow-black/50 sm:w-56 md:mx-0"
          >
            <Image
              src={buildPosterUrl(movie.posterPath, "w342")}
              alt={movie.title}
              fill
              className="object-cover"
            />
          </motion.div>

          {/* info */}
          <motion.div
            variants={heroStagger}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <motion.h1 variants={slideInRight} className="text-2xl font-bold text-zinc-100 md:text-3xl lg:text-4xl">
              {movie.title}
            </motion.h1>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-amber-400">{formatRating(movie.voteAverage)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatYear(movie.releaseDate)}
              </span>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-wrap gap-2">
              {movie.genres.map((g, i) => (
                <motion.span
                  key={g.id}
                  variants={fadeIn}
                  custom={i}
                  className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
                >
                  {g.name}
                </motion.span>
              ))}
            </motion.div>

            {movie.overview && (
              <motion.p variants={fadeUp} className="max-w-2xl leading-7 text-zinc-400">
                {movie.overview}
              </motion.p>
            )}
          </motion.div>
        </div>

        {loadingSimilar && showSimilarSkeleton && (
          <MovieGridSkeleton count={4} cols={4} />
        )}
        {!loadingSimilar && similarCards.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <RecommendationGrid movies={similarCards} title="Similar Movies" />
          </motion.div>
        )}
      </main>
    </>
  );
}
