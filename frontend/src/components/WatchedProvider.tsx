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
import { watchedService } from "@/services/watched.service";

interface WatchedContextValue {
  isWatched: (movieId: number) => boolean;
  toggleWatched: (movieId: number) => Promise<void>;
  ready: boolean;
}

const WatchedContext = createContext<WatchedContextValue>({
  isWatched: () => false,
  toggleWatched: async () => undefined,
  ready: false,
});

export function WatchedProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const [watched, setWatched] = useState<Set<number>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Anonymous: nothing to fetch. On logout the layout remounts this provider.
    if (!session) return;
    let cancelled = false;
    watchedService
      .listWatched()
      .then((ids) => {
        if (!cancelled) {
          setWatched(new Set(ids));
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

  const isWatched = useCallback(
    (movieId: number) => watched.has(movieId),
    [watched],
  );

  const toggleWatched = useCallback(
    async (movieId: number) => {
      const wasWatched = watched.has(movieId);
      // Optimistic update.
      setWatched((prev) => {
        const next = new Set(prev);
        if (wasWatched) next.delete(movieId);
        else next.add(movieId);
        return next;
      });
      try {
        if (wasWatched) await watchedService.unmarkWatched(movieId);
        else await watchedService.markWatched(movieId);
      } catch {
        // Rollback.
        setWatched((prev) => {
          const next = new Set(prev);
          if (wasWatched) next.add(movieId);
          else next.delete(movieId);
          return next;
        });
        toast.error("Não foi possível atualizar o histórico", {
          description: "Tente novamente em instantes.",
        });
      }
    },
    [watched],
  );

  return (
    <WatchedContext.Provider value={{ isWatched, toggleWatched, ready }}>
      {children}
    </WatchedContext.Provider>
  );
}

export function useWatched(): WatchedContextValue {
  return useContext(WatchedContext);
}
