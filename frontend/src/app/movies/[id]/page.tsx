"use client";

import { use } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { ErrorState } from "@/components/ErrorState";
import { RecommendationGrid } from "@/modules/recommendations/components/RecommendationGrid";
import { useMovieDetails } from "@/hooks/useMovieDetails";
import { buildPosterUrl, formatRating, formatRuntime, formatYear } from "@/utils/format";
import { Star, Clock, Calendar } from "lucide-react";
import { fadeUp, fadeIn, slideInLeft, slideInRight, staggerContainer, heroStagger } from "@/utils/animations";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export default function MoviePage({ params }: MoviePageProps) {
  const { id } = use(params);
  const { movie, loading, error } = useMovieDetails(Number(id));

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 md:flex-row animate-pulse">
            <div className="mx-auto aspect-[2/3] w-48 shrink-0 rounded-xl bg-zinc-800 md:mx-0" />
            <div className="flex-1 space-y-4 pt-2">
              <div className="h-8 w-64 rounded bg-zinc-800" />
              <div className="h-4 w-48 rounded bg-zinc-800" />
              <div className="flex gap-2">
                {[80, 64, 96].map((w) => (
                  <div key={w} className="h-6 rounded-full bg-zinc-800" style={{ width: w }} />
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-zinc-800" />
                <div className="h-4 w-5/6 rounded bg-zinc-800" />
                <div className="h-4 w-4/6 rounded bg-zinc-800" />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !movie) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ErrorState
            title={error ? "Failed to load movie" : "Movie not found"}
            message={error ?? undefined}
          />
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
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatRuntime(movie.runtime)}
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

            <motion.p variants={fadeUp} className="max-w-2xl leading-7 text-zinc-400">
              {movie.overview}
            </motion.p>

            {movie.cast.length > 0 && (
              <motion.div variants={fadeUp}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">Cast</p>
                <div className="flex flex-wrap gap-2">
                  {movie.cast.map((member) => (
                    <span key={member.id} className="text-sm text-zinc-300">
                      {member.name}
                      <span className="text-zinc-600"> as {member.character}</span>
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {movie.similarMovies.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <RecommendationGrid movies={movie.similarMovies} title="Similar Movies" />
          </motion.div>
        )}
      </main>
    </>
  );
}
