import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Film, Search, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-3">
            <Film className="h-10 w-10 text-amber-400" />
            <h1 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl">
              watchToNext
            </h1>
          </div>

          <p className="max-w-xl text-lg text-zinc-400">
            Discover movies you&apos;ll love. Powered by KNN similarity analysis — not
            generic popularity lists.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/search"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-amber-500 px-6 text-sm font-medium text-black transition-colors hover:bg-amber-400"
            >
              <Search className="h-4 w-4" />
              Search Movies
            </Link>
            <Link
              href="/movies"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-6 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-700"
            >
              <Sparkles className="h-4 w-4" />
              Browse All
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
