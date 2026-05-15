"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useSession } from "@/components/SessionProvider";
import { favoritesService } from "@/services/favorites.service";

interface FavoritesContextValue {
  isFavorite: (movieId: number) => boolean;
  toggleFavorite: (movieId: number) => Promise<void>;
  ready: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  isFavorite: () => false,
  toggleFavorite: async () => undefined,
  ready: false,
});

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Anonymous: nothing to fetch. Initial state (empty set, not ready) already
    // reflects that; on logout the layout re-renders and remounts this provider.
    if (!session) return;
    let cancelled = false;
    favoritesService
      .listFavorites()
      .then((ids) => {
        if (!cancelled) {
          setFavorites(new Set(ids));
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  const isFavorite = useCallback(
    (movieId: number) => favorites.has(movieId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (movieId: number) => {
      const wasFavorite = favorites.has(movieId);
      // Optimistic update.
      setFavorites((prev) => {
        const next = new Set(prev);
        if (wasFavorite) next.delete(movieId);
        else next.add(movieId);
        return next;
      });
      try {
        if (wasFavorite) await favoritesService.removeFavorite(movieId);
        else await favoritesService.addFavorite(movieId);
      } catch {
        // Rollback.
        setFavorites((prev) => {
          const next = new Set(prev);
          if (wasFavorite) next.add(movieId);
          else next.delete(movieId);
          return next;
        });
        toast.error("Não foi possível atualizar os favoritos", {
          description: "Tente novamente em instantes.",
        });
      }
    },
    [favorites],
  );

  return (
    <FavoritesContext.Provider value={{ isFavorite, toggleFavorite, ready }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  return useContext(FavoritesContext);
}
