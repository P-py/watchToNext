"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { cn } from "@/utils/cn";

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
  const lastEmitted = useRef(initialValue.trim());

  // Debounce input so a fast-typing user produces one request per pause, not
  // one per keystroke. Form submit (below) flushes the pending debounce.
  useEffect(() => {
    const next = value.trim();
    if (next === lastEmitted.current) return;
    const timer = setTimeout(() => {
      lastEmitted.current = next;
      onSearch(next);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next = value.trim();
    if (next === lastEmitted.current) return;
    lastEmitted.current = next;
    onSearch(next);
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative flex items-center", className)}>
      <Search className="absolute left-4 h-4 w-4 text-zinc-500" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar filmes..."
        className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-800 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      />
      {loading && (
        <Spinner size="sm" className="absolute right-4 text-amber-400" label="Buscando" />
      )}
    </form>
  );
}
