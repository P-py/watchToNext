import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Movie } from "@/types/movie";
import { buildPosterUrl, formatRating, formatYear } from "@/utils/format";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movies/${movie.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-colors group-hover:border-zinc-700">
        <div className="relative aspect-[2/3] w-full bg-zinc-800">
          <Image
            src={buildPosterUrl(movie.posterPath)}
            alt={movie.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
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
  );
}
