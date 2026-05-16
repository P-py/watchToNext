"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "wtn:search-history";
const MAX_ENTRIES = 8;

function readHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // sessionStorage may be unavailable (private mode, quota) — history is best-effort.
  }
}

export interface UseSearchHistoryResult {
  history: string[];
  add: (query: string) => void;
  remove: (query: string) => void;
  clear: () => void;
}

/**
 * Recent search queries kept in `sessionStorage` — scoped to the browser tab,
 * cleared when it closes, never sent to the server or tied to a user account.
 * Most-recent-first, de-duplicated case-insensitively, capped at `MAX_ENTRIES`.
 */
export function useSearchHistory(): UseSearchHistoryResult {
  const [history, setHistory] = useState<string[]>([]);

  // sessionStorage is client-only; load after mount to avoid a hydration mismatch.
  useEffect(() => {
    queueMicrotask(() => setHistory(readHistory()));
  }, []);

  const add = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const deduped = prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...deduped].slice(0, MAX_ENTRIES);
      writeHistory(next);
      return next;
    });
  }, []);

  const remove = useCallback((query: string) => {
    setHistory((prev) => {
      const next = prev.filter((q) => q !== query);
      writeHistory(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
    writeHistory([]);
  }, []);

  return { history, add, remove, clear };
}
