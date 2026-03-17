"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { Movie } from "@/types/movie";
import { buildPosterUrl, formatRating, formatYear } from "@/utils/format";
import { cardItem } from "@/utils/animations";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <motion.div variants={cardItem} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link href={`/movies/${movie.id}`} className="group block">
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-md transition-shadow group-hover:shadow-amber-900/20 group-hover:shadow-xl">
          <div className="relative aspect-[2/3] w-full bg-zinc-800">
            <Image
              src={buildPosterUrl(movie.posterPath)}
              alt={movie.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
          <div className="p-3">
            <p className="truncate text-sm font-medium text-zinc-100">{movie.title}</p>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-zinc-500">{formatYear(movie.releaseDate)}</span>
              <span className="flex items-center gap-1 text-xs text-amber-400">
                <Star className="h-3 w-3 fill-amber-400" />
                {formatRating(movie.voteAverage)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
