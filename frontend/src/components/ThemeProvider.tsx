"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { THEME_STORAGE_KEY } from "@/utils/theme";

export type Theme = "light" | "dark";

export { THEME_STORAGE_KEY };

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => undefined,
  setTheme: () => undefined,
});

// The active theme lives in the DOM (the `dark` class on <html>), set before
// first paint by the inline script. We treat that class as the source of truth
// and expose it through an external store so reads stay consistent and the
// provider re-renders on change without a setState-in-effect.
const listeners = new Set<() => void>();

// Reflect theme changes made in *other* tabs. The DOM class is our source of
// truth and getSnapshot reads it, so we must update <html> here before notifying
// React — a bare notify would re-render against the unchanged old value.
function handleStorage(event: StorageEvent) {
  if (event.key !== THEME_STORAGE_KEY) return;
  // newValue is null when the key is removed/cleared; fall back to the default.
  const next: Theme = event.newValue === "light" ? "light" : "dark";
  document.documentElement.classList.toggle("dark", next === "dark");
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  if (listeners.size === 0) {
    window.addEventListener("storage", handleStorage);
  }
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  // Matches the inline script's default; reconciled with the real DOM after
  // hydration without a mismatch.
  return "dark";
}

function writeTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage may be unavailable (private mode, quota). The theme still applies
    // for the current session; it just won't persist.
  }
  listeners.forEach((listener) => listener());
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => writeTheme(next), []);
  const toggleTheme = useCallback(
    () => writeTheme(getSnapshot() === "dark" ? "light" : "dark"),
    [],
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
