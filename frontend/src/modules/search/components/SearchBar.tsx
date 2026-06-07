"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { cn } from "@/utils/cn";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useSuggestions } from "@/hooks/useSuggestions";
import { SearchDropdown } from "./SearchDropdown";

const DEBOUNCE_MS = 500;

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  loading?: boolean;
  className?: string;
}

export function SearchBar({
  onSearch,
  initialValue = "",
  loading = false,
  className,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const lastEmitted = useRef(initialValue.trim());
  const inputRef = useRef<HTMLInputElement>(null);

  const { history, add, remove, clear } = useSearchHistory();
  const suggestions = useSuggestions(value);

  const trimmed = value.trim();
  const mode: "history" | "suggestions" = trimmed.length === 0 ? "history" : "suggestions";
  const options = mode === "history" ? history : suggestions.map((s) => s.title);
  const open = focused && options.length > 0;

  // Commit a query: notify the page and record it in session history.
  const emit = useCallback(
    (query: string) => {
      const next = query.trim();
      lastEmitted.current = next;
      onSearch(next);
      if (next) add(next);
    },
    [onSearch, add],
  );

  // Debounce typed input so a fast typer produces one search per pause.
  useEffect(() => {
    if (trimmed === lastEmitted.current) return;
    const timer = setTimeout(() => emit(trimmed), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [trimmed, emit]);

  // A URL-seeded query (shared link, back/forward) also enters history.
  useEffect(() => {
    if (initialValue.trim()) queueMicrotask(() => add(initialValue));
  }, [initialValue, add]);

  const pick = useCallback(
    (query: string) => {
      setValue(query);
      setActiveIndex(-1);
      setFocused(false);
      inputRef.current?.blur();
      emit(query);
    },
    [emit],
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (trimmed === lastEmitted.current) return;
    emit(trimmed);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setFocused(false);
      setActiveIndex(-1);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      pick(options[activeIndex]);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search className="absolute left-4 h-4 w-4 text-n-500" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setActiveIndex(-1);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar filmes..."
          role="combobox"
          aria-expanded={open}
          aria-controls="search-suggestions-list"
          aria-autocomplete="list"
          className="h-12 w-full rounded-xl border border-n-700 bg-n-800 pl-11 pr-4 text-sm text-n-100 placeholder:text-n-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        {loading && (
          <Spinner size="sm" className="absolute right-4 text-amber-400" label="Buscando" />
        )}
      </form>

      {open && (
        <SearchDropdown
          mode={mode}
          history={history}
          suggestions={suggestions}
          activeIndex={activeIndex}
          onPick={pick}
          onHover={setActiveIndex}
          onRemoveHistory={remove}
          onClearHistory={clear}
        />
      )}
    </div>
  );
}
