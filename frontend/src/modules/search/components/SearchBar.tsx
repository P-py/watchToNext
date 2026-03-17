"use client";

import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/utils/cn";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  className?: string;
}

export function SearchBar({ onSearch, loading = false, className }: SearchBarProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch(value);
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative flex items-center", className)}>
      <Search className="absolute left-4 h-4 w-4 text-zinc-500" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search movies..."
        className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-800 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      />
      {loading && (
        <div className="absolute right-4 h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-amber-400" />
      )}
    </form>
  );
}
