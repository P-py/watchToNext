import Image from "next/image";

const TMDB_LOGO_NATIVE_WIDTH = 273.42;
const TMDB_LOGO_NATIVE_HEIGHT = 35.52;
const TMDB_LOGO_RENDER_HEIGHT = 14;
const TMDB_LOGO_RENDER_WIDTH = Math.round(
  (TMDB_LOGO_NATIVE_WIDTH / TMDB_LOGO_NATIVE_HEIGHT) * TMDB_LOGO_RENDER_HEIGHT,
);

export default function TmdbAttribution() {
  const showAcademic = process.env.NEXT_PUBLIC_SHOW_ACADEMIC_DISCLAIMER !== "false";
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6">
        <div className="flex items-center gap-3">
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="The Movie Database"
          >
            <Image
              src="/tmdb-logo.svg"
              alt="TMDB"
              width={TMDB_LOGO_RENDER_WIDTH}
              height={TMDB_LOGO_RENDER_HEIGHT}
              priority={false}
            />
          </a>
          <p className="text-xs text-zinc-500">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="text-xs text-zinc-600">
            Movie data provided by{" "}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 underline-offset-2 hover:underline"
            >
              The Movie Database (TMDB)
            </a>
          </p>
          {showAcademic && (
            <p className="text-[11px] uppercase tracking-wide text-amber-300/70">
              Academic project · temporary · non-commercial
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
