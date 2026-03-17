export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatYear(releaseDate: string): string {
  return releaseDate ? new Date(releaseDate).getFullYear().toString() : "N/A";
}

export function formatRuntime(minutes: number | null): string {
  if (!minutes) return "N/A";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function buildPosterUrl(
  path: string | null,
  size: "w185" | "w342" | "w500" | "original" = "w342"
): string {
  if (!path) return "/placeholder-poster.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
