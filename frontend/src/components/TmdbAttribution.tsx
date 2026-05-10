export default function TmdbAttribution() {
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
              alt="TMDB"
              height={14}
              style={{ height: "14px", width: "auto" }}
            />
          </a>
          <p className="text-xs text-zinc-500">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
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
      </div>
    </footer>
  );
}
