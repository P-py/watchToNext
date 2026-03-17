import Link from "next/link";
import { Film } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-amber-400">
          <Film className="h-5 w-5" />
          watchToNext
        </Link>

        <div className="flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/movies" className="hover:text-zinc-100 transition-colors">
            Movies
          </Link>
          <Link href="/search" className="hover:text-zinc-100 transition-colors">
            Search
          </Link>
          <Link href="/profile" className="hover:text-zinc-100 transition-colors">
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}
