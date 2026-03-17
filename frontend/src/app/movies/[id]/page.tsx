"use client";

import { use } from "react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { RecommendationGrid } from "@/modules/recommendations/components/RecommendationGrid";
import { useMovieDetails } from "@/hooks/useMovieDetails";
import { buildPosterUrl, formatRating, formatRuntime, formatYear } from "@/utils/format";
import { Star, Clock, Calendar } from "lucide-react";

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
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 rounded bg-zinc-800" />
            <div className="h-4 w-full max-w-xl rounded bg-zinc-800" />
          </div>
        </main>
      </>
    );
  }

  if (error || !movie) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <p className="text-red-400">{error ?? "Movie not found."}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 space-y-10">
        <div className="flex flex-col gap-8 sm:flex-row">
          <div className="relative aspect-[2/3] w-48 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
            <Image
              src={buildPosterUrl(movie.posterPath, "w342")}
              alt={movie.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-zinc-100">{movie.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-amber-400 font-medium">{formatRating(movie.voteAverage)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatYear(movie.releaseDate)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatRuntime(movie.runtime)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {movie.genres.map((g) => (
                <span key={g.id} className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                  {g.name}
                </span>
              ))}
            </div>

            <p className="max-w-2xl leading-7 text-zinc-400">{movie.overview}</p>

            {movie.cast.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">Cast</p>
                <div className="flex flex-wrap gap-2">
                  {movie.cast.map((member) => (
                    <span key={member.id} className="text-sm text-zinc-300">
                      {member.name}
                      <span className="text-zinc-600"> as {member.character}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {movie.similarMovies.length > 0 && (
          <RecommendationGrid movies={movie.similarMovies} title="Similar Movies" />
        )}
      </main>
    </>
  );
}
