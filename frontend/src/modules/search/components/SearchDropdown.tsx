import { Clock, Film, X } from "lucide-react";
import { MovieSuggestion } from "@/types/movie";
import { cn } from "@/utils/cn";

interface SearchDropdownProps {
  mode: "history" | "suggestions";
  history: string[];
  suggestions: MovieSuggestion[];
  activeIndex: number;
  onPick: (query: string) => void;
  onHover: (index: number) => void;
  onRemoveHistory: (query: string) => void;
  onClearHistory: () => void;
}

/**
 * Combobox panel under the search input — recent searches when the box is
 * empty, autocomplete suggestions while typing. Purely presentational; the
 * `SearchBar` owns the open state and keyboard highlight.
 */
export function SearchDropdown({
  mode,
  history,
  suggestions,
  activeIndex,
  onPick,
  onHover,
  onRemoveHistory,
  onClearHistory,
}: SearchDropdownProps) {
  const rowClass = (index: number) =>
    cn(
      "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm",
      index === activeIndex ? "bg-n-700/60" : "hover:bg-n-700/40",
    );

  return (
    <div
      id="search-suggestions-list"
      // Keep the input focused so a row click fires before blur closes the panel.
      onMouseDown={(e) => e.preventDefault()}
      role="listbox"
      className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-n-600 bg-n-800 shadow-2xl ring-1 ring-black/20"
    >
      {mode === "history" ? (
        <>
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs font-medium uppercase tracking-wide text-n-500">
              Buscas recentes
            </span>
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-n-500 transition-colors hover:text-amber-400"
            >
              Limpar
            </button>
          </div>
          {history.map((item, index) => (
            <div
              key={item}
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => onHover(index)}
              className={rowClass(index)}
            >
              <button
                type="button"
                onClick={() => onPick(item)}
                className="flex flex-1 items-center gap-3 truncate text-n-200"
              >
                <Clock className="h-4 w-4 shrink-0 text-n-500" />
                <span className="truncate">{item}</span>
              </button>
              <button
                type="button"
                aria-label={`Remover "${item}" do histórico`}
                onClick={() => onRemoveHistory(item)}
                className="shrink-0 rounded p-1 text-n-500 transition-colors hover:text-n-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </>
      ) : (
        suggestions.map((movie, index) => {
          const year = movie.releaseDate?.slice(0, 4);
          return (
            <button
              key={movie.id}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => onHover(index)}
              onClick={() => onPick(movie.title)}
              className={rowClass(index)}
            >
              <Film className="h-4 w-4 shrink-0 text-n-500" />
              <span className="truncate text-n-200">{movie.title}</span>
              {year && (
                <span className="ml-auto shrink-0 text-xs text-n-500">{year}</span>
              )}
            </button>
          );
        })
      )}
    </div>
  );
}
