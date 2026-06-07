"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { buildPosterUrl, formatRating, formatYear } from "@/utils/format";
import { cardItem } from "@/utils/animations";
import { FavoriteHeart } from "./FavoriteHeart";
import { WatchedEye } from "./WatchedEye";

/**
 * Structural type covering both `Movie` and `MovieSummary` — the card only
 * needs these five fields, so coupling to either richer interface is overkill.
 */
export interface MovieCardData {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
}

interface MovieCardProps {
  movie: MovieCardData;
  onClick?: (movie: MovieCardData) => void;
  /** Optional overlay rendered inside the card — e.g. a personal-rating chip. */
  badge?: ReactNode;
}

export function MovieCard({ movie, onClick, badge }: MovieCardProps) {
  const inner = (
    <div className="overflow-hidden rounded-xl border border-n-800 bg-n-900 shadow-md transition-shadow group-hover:shadow-amber-900/20 group-hover:shadow-xl">
      <div className="relative aspect-[2/3] w-full bg-n-800">
        <Image
          src={buildPosterUrl(movie.posterPath)}
          alt={movie.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium text-n-100">{movie.title}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-n-500">{formatYear(movie.releaseDate)}</span>
          <span className="flex items-center gap-1 text-xs text-amber-400">
            <Star className="h-3 w-3 fill-amber-400" />
            {formatRating(movie.voteAverage)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      className="relative"
      variants={cardItem}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {onClick ? (
        <button
          type="button"
          onClick={() => onClick(movie)}
          className="group block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl"
        >
          {inner}
        </button>
      ) : (
        <Link href={`/movies/${movie.id}`} className="group block">
          {inner}
        </Link>
      )}
      {/* Siblings of the link/button — keeps the favorite/watched controls out
          of the card's clickable element (no nested interactive elements). */}
      <WatchedEye movieId={movie.id} />
      <FavoriteHeart movieId={movie.id} />
      {badge}
    </motion.div>
  );
}
